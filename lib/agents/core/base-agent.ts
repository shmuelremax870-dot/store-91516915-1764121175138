/**
 * Base Agent Class
 * Foundation for all AI agents in the platform
 * Implements Agent Zero pattern: observe -> think -> act -> learn
 */

import { OpenRouterClient, OpenRouterMessage, getOpenRouterClient } from '../../services/openrouter/client';

export type AgentStatus = 'idle' | 'running' | 'paused' | 'error' | 'completed';
export type AgentPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AgentRule {
  id: string;
  name: string;
  description: string;
  condition: string;   // When this rule applies
  action: string;      // What to do
  priority: AgentPriority;
  enabled: boolean;
}

export interface AgentMemory {
  shortTerm: Map<string, any>;    // Current session memory
  longTerm: AgentMemoryEntry[];   // Persistent learnings
}

export interface AgentMemoryEntry {
  timestamp: number;
  type: 'observation' | 'decision' | 'outcome' | 'learning';
  content: string;
  metadata: Record<string, any>;
  score: number; // -1 to 1, how useful this memory was
}

export interface AgentTask {
  id: string;
  type: string;
  input: Record<string, any>;
  priority: AgentPriority;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  result?: any;
  error?: string;
  retries: number;
  maxRetries: number;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  rules: AgentRule[];
  maxConcurrentTasks: number;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
    backoffMultiplier: number;
  };
  rateLimit: {
    maxRequestsPerMinute: number;
    maxTokensPerMinute: number;
  };
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksFailed: number;
  averageResponseTimeMs: number;
  totalTokensUsed: number;
  uptime: number;
  lastActive: number;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected client: OpenRouterClient;
  protected status: AgentStatus;
  protected memory: AgentMemory;
  protected taskQueue: AgentTask[];
  protected metrics: AgentMetrics;
  protected conversationHistory: OpenRouterMessage[];

  constructor(config: AgentConfig) {
    this.config = config;
    this.client = getOpenRouterClient();
    this.status = 'idle';
    this.memory = {
      shortTerm: new Map(),
      longTerm: [],
    };
    this.taskQueue = [];
    this.metrics = {
      tasksCompleted: 0,
      tasksFailed: 0,
      averageResponseTimeMs: 0,
      totalTokensUsed: 0,
      uptime: 0,
      lastActive: Date.now(),
    };
    this.conversationHistory = [
      { role: 'system', content: this.config.systemPrompt },
    ];
  }

  // === Agent Zero Loop: Observe -> Think -> Act -> Learn ===

  /** Phase 1: Observe - Gather context and data */
  protected abstract observe(task: AgentTask): Promise<Record<string, any>>;

  /** Phase 2: Think - Analyze observations and plan action */
  protected async think(observations: Record<string, any>, task: AgentTask): Promise<string> {
    const applicableRules = this.getApplicableRules(task);
    const relevantMemories = this.getRelevantMemories(task.type);

    const thinkPrompt = `
## Current Task
Type: ${task.type}
Input: ${JSON.stringify(task.input)}

## Observations
${JSON.stringify(observations, null, 2)}

## Active Rules
${applicableRules.map(r => `- [${r.priority}] ${r.name}: ${r.description} → ${r.action}`).join('\n')}

## Relevant Past Learnings
${relevantMemories.map(m => `- [score:${m.score}] ${m.content}`).join('\n') || 'No relevant memories yet.'}

## Instructions
Analyze the observations and determine the best course of action.
Consider all active rules and past learnings.
Respond with a JSON action plan:
{
  "analysis": "your analysis of the situation",
  "plan": ["step 1", "step 2", ...],
  "confidence": 0.0-1.0,
  "risks": ["risk 1", ...],
  "selectedApproach": "description of chosen approach"
}`;

    this.conversationHistory.push({ role: 'user', content: thinkPrompt });

    const response = await this.client.chat({
      model: this.config.model,
      messages: this.conversationHistory,
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '';
    this.conversationHistory.push({ role: 'assistant', content });
    this.metrics.totalTokensUsed += response.usage?.total_tokens || 0;

    return content;
  }

  /** Phase 3: Act - Execute the planned action */
  protected abstract act(plan: string, task: AgentTask): Promise<any>;

  /** Phase 4: Learn - Store outcomes for future improvement */
  protected learn(task: AgentTask, result: any, success: boolean): void {
    const entry: AgentMemoryEntry = {
      timestamp: Date.now(),
      type: success ? 'outcome' : 'learning',
      content: success
        ? `Task ${task.type} completed successfully with approach: ${JSON.stringify(task.input).slice(0, 200)}`
        : `Task ${task.type} failed: ${task.error}. Input: ${JSON.stringify(task.input).slice(0, 200)}`,
      metadata: {
        taskType: task.type,
        input: task.input,
        result: typeof result === 'string' ? result.slice(0, 500) : JSON.stringify(result).slice(0, 500),
      },
      score: success ? 0.5 : -0.5,
    };

    this.memory.longTerm.push(entry);

    // Keep memory bounded
    if (this.memory.longTerm.length > 1000) {
      // Remove lowest scored memories
      this.memory.longTerm.sort((a, b) => b.score - a.score);
      this.memory.longTerm = this.memory.longTerm.slice(0, 500);
    }
  }

  // === Public API ===

  async executeTask(task: AgentTask): Promise<any> {
    this.status = 'running';
    task.startedAt = Date.now();
    const startTime = Date.now();

    try {
      // Phase 1: Observe
      const observations = await this.observe(task);

      // Phase 2: Think
      const plan = await this.think(observations, task);

      // Phase 3: Act
      const result = await this.act(plan, task);

      // Phase 4: Learn
      this.learn(task, result, true);

      task.completedAt = Date.now();
      task.result = result;
      this.metrics.tasksCompleted++;
      this.updateAverageResponseTime(Date.now() - startTime);
      this.status = 'idle';

      return result;
    } catch (error: any) {
      task.error = error.message;

      // Retry logic
      if (task.retries < task.maxRetries) {
        task.retries++;
        const delay = this.config.retryPolicy.backoffMs *
          Math.pow(this.config.retryPolicy.backoffMultiplier, task.retries - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeTask(task);
      }

      this.learn(task, null, false);
      this.metrics.tasksFailed++;
      this.status = 'error';
      throw error;
    }
  }

  addTask(task: AgentTask): void {
    this.taskQueue.push(task);
    this.taskQueue.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  async processQueue(): Promise<void> {
    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift()!;
      try {
        await this.executeTask(task);
      } catch (error) {
        console.error(`Agent ${this.config.id} task ${task.id} failed:`, error);
      }
    }
  }

  // === Helper Methods ===

  protected getApplicableRules(task: AgentTask): AgentRule[] {
    return this.config.rules.filter(rule =>
      rule.enabled && (
        rule.condition === '*' ||
        rule.condition === task.type ||
        task.type.includes(rule.condition)
      )
    );
  }

  protected getRelevantMemories(taskType: string, limit = 5): AgentMemoryEntry[] {
    return this.memory.longTerm
      .filter(m => m.metadata.taskType === taskType)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private updateAverageResponseTime(newTime: number): void {
    const total = this.metrics.averageResponseTimeMs * (this.metrics.tasksCompleted - 1);
    this.metrics.averageResponseTimeMs = (total + newTime) / this.metrics.tasksCompleted;
  }

  getStatus(): AgentStatus {
    return this.status;
  }

  getMetrics(): AgentMetrics {
    return { ...this.metrics };
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }

  resetConversation(): void {
    this.conversationHistory = [
      { role: 'system', content: this.config.systemPrompt },
    ];
  }
}
