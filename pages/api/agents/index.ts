/**
 * Agent Management API
 * GET  /api/agents - List all agents and system status
 * POST /api/agents - Execute a task on a specific agent
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { initializeAgents, getInitializationStatus } from '../../../lib/agents/init';
import { getAgentRegistry } from '../../../lib/agents/core/agent-registry';
import { AgentTask } from '../../../lib/agents/core/base-agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure agents are initialized
  initializeAgents();

  const registry = getAgentRegistry();

  if (req.method === 'GET') {
    const status = getInitializationStatus();
    const systemMetrics = registry.getSystemMetrics();

    return res.status(200).json({
      system: {
        status: 'operational',
        ...systemMetrics,
      },
      agents: registry.getAllAgents(),
      initialization: status,
    });
  }

  if (req.method === 'POST') {
    const { agentId, taskType, input, priority } = req.body;

    if (!agentId || !taskType) {
      return res.status(400).json({
        error: 'Missing required fields: agentId, taskType',
      });
    }

    const agent = registry.getAgent(agentId);
    if (!agent) {
      return res.status(404).json({
        error: `Agent not found: ${agentId}`,
        availableAgents: registry.getAllAgents().map(a => a.id),
      });
    }

    const task: AgentTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: taskType,
      input: input || {},
      priority: priority || 'medium',
      createdAt: Date.now(),
      retries: 0,
      maxRetries: 3,
    };

    try {
      const result = await agent.executeTask(task);
      return res.status(200).json({
        success: true,
        taskId: task.id,
        agentId,
        result,
        executionTimeMs: (task.completedAt || Date.now()) - task.createdAt,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        taskId: task.id,
        agentId,
        error: error.message,
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
