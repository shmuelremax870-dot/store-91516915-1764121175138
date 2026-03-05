/**
 * Agent Zero Orchestrator
 * Master orchestration layer that coordinates all AI agents
 * Implements the Agent Zero pattern: autonomous task decomposition & delegation
 */

import { BaseAgent, AgentConfig, AgentTask, AgentRule } from '../../agents/core/base-agent';
import { getAgentRegistry, AgentMessage } from '../../agents/core/agent-registry';
import { MODEL_ASSIGNMENTS, getOpenRouterClient } from '../openrouter/client';

interface WorkflowStep {
  id: string;
  agentId: string;
  taskType: string;
  input: Record<string, any>;
  dependsOn: string[]; // IDs of steps that must complete first
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: number;
  completedAt?: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

// Pre-defined workflow templates
export const WORKFLOW_TEMPLATES = {
  // New product launch workflow
  PRODUCT_LAUNCH: {
    name: 'Product Launch',
    description: 'Full product launch: research → create listing → optimize SEO → set price → create social posts',
    steps: [
      { agentId: 'scraper-etsy-trends', taskType: 'detect_trends', dependsOn: [] },
      { agentId: 'scraper-etsy-products', taskType: 'scrape_competitor_products', dependsOn: [] },
      { agentId: 'agent-product-listing', taskType: 'generate_listing', dependsOn: ['step-0', 'step-1'] },
      { agentId: 'agent-seo', taskType: 'optimize_listing', dependsOn: ['step-2'] },
      { agentId: 'agent-pricing', taskType: 'analyze_and_set_price', dependsOn: ['step-1', 'step-2'] },
      { agentId: 'agent-social', taskType: 'create_launch_campaign', dependsOn: ['step-2', 'step-3'] },
    ],
  },

  // Store warmup workflow (for new Etsy stores)
  STORE_WARMUP: {
    name: 'Store Warmup',
    description: 'Gradual store warmup: analyze niche → create initial listings → gentle SEO',
    steps: [
      { agentId: 'scraper-etsy-trends', taskType: 'analyze_niche', dependsOn: [] },
      { agentId: 'scraper-etsy-products', taskType: 'find_low_competition', dependsOn: ['step-0'] },
      { agentId: 'agent-product-listing', taskType: 'generate_warmup_listings', dependsOn: ['step-0', 'step-1'] },
      { agentId: 'agent-seo', taskType: 'basic_seo', dependsOn: ['step-2'] },
      { agentId: 'agent-pricing', taskType: 'set_competitive_price', dependsOn: ['step-1', 'step-2'] },
    ],
  },

  // Daily optimization workflow
  DAILY_OPTIMIZATION: {
    name: 'Daily Optimization',
    description: 'Daily routine: check trends → adjust prices → update SEO → post social',
    steps: [
      { agentId: 'scraper-etsy-trends', taskType: 'daily_trend_check', dependsOn: [] },
      { agentId: 'scraper-etsy-products', taskType: 'monitor_competitors', dependsOn: [] },
      { agentId: 'agent-pricing', taskType: 'daily_price_adjustment', dependsOn: ['step-0', 'step-1'] },
      { agentId: 'agent-seo', taskType: 'refresh_tags', dependsOn: ['step-0'] },
      { agentId: 'agent-social', taskType: 'daily_post', dependsOn: ['step-0'] },
    ],
  },

  // Competitor response workflow
  COMPETITOR_RESPONSE: {
    name: 'Competitor Response',
    description: 'React to competitor changes: analyze → adjust pricing → update listings',
    steps: [
      { agentId: 'scraper-etsy-products', taskType: 'deep_competitor_analysis', dependsOn: [] },
      { agentId: 'agent-pricing', taskType: 'competitive_price_response', dependsOn: ['step-0'] },
      { agentId: 'agent-seo', taskType: 'differentiation_seo', dependsOn: ['step-0'] },
      { agentId: 'agent-product-listing', taskType: 'update_value_proposition', dependsOn: ['step-0', 'step-1'] },
    ],
  },
};

export class AgentZeroOrchestrator extends BaseAgent {
  private workflows: Map<string, Workflow> = new Map();
  private scheduledTasks: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    const config: AgentConfig = {
      id: 'agent-zero',
      name: 'Agent Zero - Master Orchestrator',
      description: 'Autonomous orchestration agent that coordinates all platform agents, decomposes complex tasks, and manages workflows',
      model: MODEL_ASSIGNMENTS.ORCHESTRATOR,
      systemPrompt: `You are Agent Zero, the master orchestrator for an Etsy/Shopify dropshipping automation platform.

Your role is to:
1. Decompose complex business goals into actionable tasks
2. Assign tasks to specialized agents (scrapers, SEO, pricing, social, product listing)
3. Monitor workflow progress and handle failures
4. Learn from outcomes to optimize future workflows
5. Ensure all actions follow platform rules and Etsy ToS

Available agents:
- scraper-etsy-products: Scrapes Etsy product listings and data
- scraper-etsy-trends: Detects trending niches and products
- scraper-competitors: Analyzes competitor stores and strategies
- agent-product-listing: Generates optimized product listings
- agent-seo: Optimizes SEO tags, titles, descriptions
- agent-pricing: Analyzes market and sets competitive prices
- agent-social: Creates social media content and campaigns

Rules:
- Never exceed Etsy API rate limits
- Always warm up new stores gradually (5 listings/week initially)
- Maintain unique content across all stores
- Diversify product sources to avoid pattern detection
- Log all decisions for audit trail

Respond in JSON format with workflow plans.`,
      rules: [
        {
          id: 'rule-rate-limit',
          name: 'Rate Limit Protection',
          description: 'Never exceed API rate limits for any platform',
          condition: '*',
          action: 'Check rate limits before any API call, delay if needed',
          priority: 'critical',
          enabled: true,
        },
        {
          id: 'rule-store-warmup',
          name: 'Store Warmup Protocol',
          description: 'New stores must follow gradual warmup',
          condition: 'store_warmup',
          action: 'Limit to 5 listings/week for first month, 10/week second month',
          priority: 'high',
          enabled: true,
        },
        {
          id: 'rule-unique-content',
          name: 'Content Uniqueness',
          description: 'All listings must have unique content',
          condition: 'generate_listing',
          action: 'Ensure >80% uniqueness score against existing listings',
          priority: 'high',
          enabled: true,
        },
        {
          id: 'rule-diversify',
          name: 'Source Diversification',
          description: 'Spread orders across multiple POD providers',
          condition: '*',
          action: 'Rotate between Printful, Printify, Gooten, SPOD',
          priority: 'medium',
          enabled: true,
        },
      ],
      maxConcurrentTasks: 5,
      retryPolicy: { maxRetries: 3, backoffMs: 2000, backoffMultiplier: 2 },
      rateLimit: { maxRequestsPerMinute: 20, maxTokensPerMinute: 100000 },
    };

    super(config);
  }

  protected async observe(task: AgentTask): Promise<Record<string, any>> {
    const registry = getAgentRegistry();
    const systemMetrics = registry.getSystemMetrics();
    const allAgents = registry.getAllAgents();

    return {
      systemMetrics,
      availableAgents: allAgents,
      activeWorkflows: Array.from(this.workflows.entries()).map(([id, w]) => ({
        id,
        name: w.name,
        status: w.status,
        progress: w.steps.filter(s => s.status === 'completed').length / w.steps.length,
      })),
      taskDetails: task,
    };
  }

  protected async act(plan: string, task: AgentTask): Promise<any> {
    let parsedPlan: any;
    try {
      parsedPlan = JSON.parse(plan);
    } catch {
      parsedPlan = { plan: [plan], selectedApproach: 'direct' };
    }

    switch (task.type) {
      case 'execute_workflow':
        return this.executeWorkflow(task.input.templateName, task.input.params);

      case 'decompose_goal':
        return this.decomposeGoal(task.input.goal, parsedPlan);

      case 'schedule_recurring':
        return this.scheduleRecurring(
          task.input.workflowName,
          task.input.intervalMs,
          task.input.params
        );

      case 'agent_health_check':
        return this.healthCheck();

      default:
        return { plan: parsedPlan, status: 'planned' };
    }
  }

  // === Workflow Execution ===

  async executeWorkflow(
    templateName: keyof typeof WORKFLOW_TEMPLATES,
    params: Record<string, any> = {}
  ): Promise<Workflow> {
    const template = WORKFLOW_TEMPLATES[templateName];
    if (!template) {
      throw new Error(`Unknown workflow template: ${templateName}`);
    }

    const workflow: Workflow = {
      id: `wf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: template.name,
      description: template.description,
      steps: template.steps.map((step, index) => ({
        id: `step-${index}`,
        agentId: step.agentId,
        taskType: step.taskType,
        input: { ...params, stepIndex: index },
        dependsOn: step.dependsOn,
        status: 'pending' as const,
      })),
      createdAt: Date.now(),
      status: 'running',
    };

    this.workflows.set(workflow.id, workflow);

    // Execute steps respecting dependencies
    await this.executeWorkflowSteps(workflow);

    return workflow;
  }

  private async executeWorkflowSteps(workflow: Workflow): Promise<void> {
    const registry = getAgentRegistry();
    const completed = new Set<string>();
    const failed = new Set<string>();

    while (completed.size + failed.size < workflow.steps.length) {
      // Find steps that can run (all dependencies met)
      const runnableSteps = workflow.steps.filter(step =>
        step.status === 'pending' &&
        step.dependsOn.every(dep => completed.has(dep))
      );

      if (runnableSteps.length === 0 && completed.size + failed.size < workflow.steps.length) {
        // Deadlock - some steps can never run
        workflow.status = 'failed';
        break;
      }

      // Execute runnable steps in parallel
      const results = await Promise.allSettled(
        runnableSteps.map(async step => {
          step.status = 'running';

          // Gather results from dependencies
          const depResults: Record<string, any> = {};
          step.dependsOn.forEach(depId => {
            const depStep = workflow.steps.find(s => s.id === depId);
            if (depStep?.result) {
              depResults[depId] = depStep.result;
            }
          });

          const task: AgentTask = {
            id: `${workflow.id}-${step.id}`,
            type: step.taskType,
            input: { ...step.input, dependencyResults: depResults },
            priority: 'high',
            createdAt: Date.now(),
            retries: 0,
            maxRetries: 2,
          };

          try {
            const result = await registry.executeOnAgent(step.agentId, task);
            step.result = result;
            step.status = 'completed';
            completed.add(step.id);
            return result;
          } catch (error: any) {
            step.status = 'failed';
            failed.add(step.id);
            console.error(`[Orchestrator] Step ${step.id} failed:`, error.message);
            throw error;
          }
        })
      );
    }

    workflow.completedAt = Date.now();
    workflow.status = failed.size > 0 ? 'failed' : 'completed';
  }

  // === Goal Decomposition ===

  private async decomposeGoal(
    goal: string,
    plan: any
  ): Promise<{ workflow: Workflow }> {
    const client = getOpenRouterClient();

    const decomposition = await client.chatJSON<{
      steps: { agentId: string; taskType: string; input: any; dependsOn: string[] }[];
    }>(
      this.config.model,
      `You decompose business goals into workflow steps. Available agents: scraper-etsy-products, scraper-etsy-trends, scraper-competitors, agent-product-listing, agent-seo, agent-pricing, agent-social.`,
      `Decompose this goal into agent workflow steps: "${goal}"\n\nContext: ${JSON.stringify(plan)}`,
      0.3
    );

    const workflow: Workflow = {
      id: `wf-goal-${Date.now()}`,
      name: `Goal: ${goal.slice(0, 50)}`,
      description: goal,
      steps: decomposition.steps.map((step, i) => ({
        id: `step-${i}`,
        ...step,
        status: 'pending' as const,
      })),
      createdAt: Date.now(),
      status: 'pending',
    };

    this.workflows.set(workflow.id, workflow);
    return { workflow };
  }

  // === Scheduling ===

  scheduleRecurring(
    workflowName: keyof typeof WORKFLOW_TEMPLATES,
    intervalMs: number,
    params: Record<string, any> = {}
  ): { schedulerId: string; interval: number } {
    const schedulerId = `sched-${Date.now()}`;

    const timer = setInterval(async () => {
      try {
        await this.executeWorkflow(workflowName, params);
      } catch (error) {
        console.error(`[Orchestrator] Scheduled workflow ${workflowName} failed:`, error);
      }
    }, intervalMs);

    this.scheduledTasks.set(schedulerId, timer);

    return { schedulerId, interval: intervalMs };
  }

  cancelScheduled(schedulerId: string): void {
    const timer = this.scheduledTasks.get(schedulerId);
    if (timer) {
      clearInterval(timer);
      this.scheduledTasks.delete(schedulerId);
    }
  }

  // === Health Check ===

  private healthCheck(): Record<string, any> {
    const registry = getAgentRegistry();
    const agents = registry.getAllAgents();

    return {
      orchestrator: {
        status: this.status,
        activeWorkflows: this.workflows.size,
        scheduledTasks: this.scheduledTasks.size,
      },
      agents: agents.map(a => ({
        id: a.id,
        name: a.name,
        status: a.status,
        metrics: a.metrics,
      })),
      system: registry.getSystemMetrics(),
    };
  }

  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }
}
