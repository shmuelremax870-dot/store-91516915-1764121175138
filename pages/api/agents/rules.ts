/**
 * Agent Rules API
 * GET /api/agents/rules - Get all rules or rules for a specific agent
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { ALL_RULES, getRulesForAgent, getRuleCounts, getRule } from '../../../lib/rules/agent-rules';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { agentId, ruleId } = req.query;

  // Get specific rule by ID
  if (ruleId && typeof ruleId === 'string') {
    const rule = getRule(ruleId);
    if (!rule) {
      return res.status(404).json({ error: `Rule not found: ${ruleId}` });
    }
    return res.status(200).json({ rule });
  }

  // Get rules for a specific agent
  if (agentId && typeof agentId === 'string') {
    const rules = getRulesForAgent(agentId);
    return res.status(200).json({
      agentId,
      rulesCount: rules.length,
      rules,
    });
  }

  // Get all rules
  return res.status(200).json({
    counts: getRuleCounts(),
    rules: ALL_RULES,
  });
}
