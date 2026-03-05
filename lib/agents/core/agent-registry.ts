/**
 * Agent Registry
 * Central registry for managing all AI agents
 * Handles agent lifecycle, discovery, and inter-agent communication
 */

import { BaseAgent, AgentConfig, AgentMetrics, AgentStatus, AgentTask } from './base-agent';

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  metrics: AgentMetrics;
  taskQueueSize: number;
}

export interface AgentMessage {
  from: string;
  to: string;
  type: 'request' | 'response' | 'broadcast' | 'event';
  payload: any;
  timestamp: number;
}

class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();
  private messageQueue: AgentMessage[] = [];
  private eventListeners: Map<string, ((msg: AgentMessage) => void)[]> = new Map();

  register(agent: BaseAgent): void {
    const config = agent.getConfig();
    if (this.agents.has(config.id)) {
      throw new Error(`Agent ${config.id} is already registered`);
    }
    this.agents.set(config.id, agent);
    console.log(`[Registry] Agent registered: ${config.id} (${config.name})`);
  }

  unregister(agentId: string): void {
    this.agents.delete(agentId);
    console.log(`[Registry] Agent unregistered: ${agentId}`);
  }

  getAgent(agentId: string): BaseAgent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): AgentInfo[] {
    return Array.from(this.agents.entries()).map(([id, agent]) => ({
      id,
      name: agent.getConfig().name,
      description: agent.getConfig().description,
      status: agent.getStatus(),
      metrics: agent.getMetrics(),
      taskQueueSize: 0,
    }));
  }

  getAgentsByStatus(status: AgentStatus): AgentInfo[] {
    return this.getAllAgents().filter(a => a.status === status);
  }

  // Inter-agent messaging
  async sendMessage(message: AgentMessage): Promise<void> {
    this.messageQueue.push(message);

    if (message.type === 'broadcast') {
      const listeners = this.eventListeners.get(message.payload.event) || [];
      listeners.forEach(listener => listener(message));
    }

    // Direct message to specific agent
    if (message.to && message.to !== '*') {
      const targetAgent = this.agents.get(message.to);
      if (targetAgent) {
        const task: AgentTask = {
          id: `msg-${Date.now()}`,
          type: message.payload.taskType || 'message',
          input: message.payload,
          priority: message.payload.priority || 'medium',
          createdAt: Date.now(),
          retries: 0,
          maxRetries: 3,
        };
        targetAgent.addTask(task);
      }
    }
  }

  onEvent(eventName: string, callback: (msg: AgentMessage) => void): void {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName)!.push(callback);
  }

  // Execute a task on a specific agent
  async executeOnAgent(agentId: string, task: AgentTask): Promise<any> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }
    return agent.executeTask(task);
  }

  // Get aggregated metrics
  getSystemMetrics(): {
    totalAgents: number;
    activeAgents: number;
    totalTasksCompleted: number;
    totalTasksFailed: number;
    totalTokensUsed: number;
  } {
    const agents = Array.from(this.agents.values());
    return {
      totalAgents: agents.length,
      activeAgents: agents.filter(a => a.getStatus() === 'running').length,
      totalTasksCompleted: agents.reduce((sum, a) => sum + a.getMetrics().tasksCompleted, 0),
      totalTasksFailed: agents.reduce((sum, a) => sum + a.getMetrics().tasksFailed, 0),
      totalTokensUsed: agents.reduce((sum, a) => sum + a.getMetrics().totalTokensUsed, 0),
    };
  }
}

// Singleton
let registryInstance: AgentRegistry | null = null;

export function getAgentRegistry(): AgentRegistry {
  if (!registryInstance) {
    registryInstance = new AgentRegistry();
  }
  return registryInstance;
}
