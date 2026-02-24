/**
 * MCP Management API
 * GET  /api/mcp - List all MCP servers and tools
 * POST /api/mcp - Execute an MCP tool
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { MCP_SERVERS, getAllMCPTools, findMCPTool } from '../../../lib/mcp/mcp-config';
import { getMCPExecutor } from '../../../lib/mcp/mcp-executor';
import { initializeAgents } from '../../../lib/agents/init';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  initializeAgents();

  if (req.method === 'GET') {
    const executor = getMCPExecutor();

    return res.status(200).json({
      servers: MCP_SERVERS.map(server => ({
        id: server.id,
        name: server.name,
        description: server.description,
        version: server.version,
        enabled: server.enabled,
        toolCount: server.tools.length,
        tools: server.tools.map(t => ({
          name: t.name,
          description: t.description,
          rateLimit: t.rateLimit,
          rateLimitStatus: executor.getRateLimitStatus(t.name),
        })),
      })),
      totalTools: getAllMCPTools().length,
    });
  }

  if (req.method === 'POST') {
    const { agentId, toolName, input } = req.body;

    if (!agentId || !toolName) {
      return res.status(400).json({
        error: 'Missing required fields: agentId, toolName',
      });
    }

    const found = findMCPTool(toolName);
    if (!found) {
      return res.status(404).json({
        error: `Tool not found: ${toolName}`,
        availableTools: getAllMCPTools().map(t => t.name),
      });
    }

    const executor = getMCPExecutor();
    const result = await executor.execute(agentId, toolName, input || {});

    return res.status(result.success ? 200 : 400).json(result);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
