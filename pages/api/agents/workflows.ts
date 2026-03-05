/**
 * Workflow Management API
 * POST /api/agents/workflows - Execute a workflow
 * GET  /api/agents/workflows - List all workflows
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeAgents } from '../../../lib/agents/init';
import { getAgentRegistry } from '../../../lib/agents/core/agent-registry';
import { AgentZeroOrchestrator, WORKFLOW_TEMPLATES } from '../../../lib/services/agent-zero/orchestrator';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  initializeAgents();

  const registry = getAgentRegistry();
  const orchestrator = registry.getAgent('agent-zero') as AgentZeroOrchestrator | undefined;

  if (!orchestrator) {
    return res.status(500).json({ error: 'Orchestrator not available' });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      templates: Object.entries(WORKFLOW_TEMPLATES).map(([key, template]) => ({
        id: key,
        name: template.name,
        description: template.description,
        steps: template.steps.length,
      })),
      active: orchestrator.getAllWorkflows().filter(w => w.status === 'running'),
      completed: orchestrator.getAllWorkflows().filter(w => w.status === 'completed').slice(-10),
    });
  }

  if (req.method === 'POST') {
    const { templateName, params, goal } = req.body;

    try {
      if (goal) {
        // Decompose a custom goal into a workflow
        const result = await orchestrator.executeTask({
          id: `goal-${Date.now()}`,
          type: 'decompose_goal',
          input: { goal },
          priority: 'high',
          createdAt: Date.now(),
          retries: 0,
          maxRetries: 1,
        });
        return res.status(200).json({ success: true, result });
      }

      if (templateName) {
        const validTemplates = Object.keys(WORKFLOW_TEMPLATES);
        if (!validTemplates.includes(templateName)) {
          return res.status(400).json({
            error: `Invalid template: ${templateName}`,
            validTemplates,
          });
        }

        const workflow = await orchestrator.executeWorkflow(
          templateName as keyof typeof WORKFLOW_TEMPLATES,
          params || {}
        );

        return res.status(200).json({
          success: true,
          workflow: {
            id: workflow.id,
            name: workflow.name,
            status: workflow.status,
            steps: workflow.steps.map(s => ({
              id: s.id,
              agent: s.agentId,
              task: s.taskType,
              status: s.status,
              hasResult: !!s.result,
            })),
            duration: workflow.completedAt
              ? workflow.completedAt - workflow.createdAt
              : undefined,
          },
        });
      }

      return res.status(400).json({
        error: 'Provide either templateName or goal',
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
