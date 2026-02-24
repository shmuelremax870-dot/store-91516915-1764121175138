/**
 * Agent Rules & Policies Configuration
 * Central definition of all rules that govern agent behavior
 * These rules ensure safe, compliant, and effective automation
 */

import { AgentRule } from '../agents/core/base-agent';

// === GLOBAL RULES (Apply to ALL agents) ===
export const GLOBAL_RULES: AgentRule[] = [
  {
    id: 'global-rate-limit',
    name: 'API Rate Limiting',
    description: 'Enforce rate limits on all external API calls',
    condition: '*',
    action: 'Track request counts per minute/hour. Pause agent if limits are approaching. Resume after cooldown.',
    priority: 'critical',
    enabled: true,
  },
  {
    id: 'global-no-trademark',
    name: 'Trademark Protection',
    description: 'Never use trademarked terms in any content',
    condition: '*',
    action: 'Scan all generated content against trademark database. Block and flag any violations.',
    priority: 'critical',
    enabled: true,
  },
  {
    id: 'global-content-unique',
    name: 'Content Uniqueness',
    description: 'All generated content must be unique across the platform',
    condition: '*',
    action: 'Check uniqueness score > 80% before publishing. Rewrite if below threshold.',
    priority: 'critical',
    enabled: true,
  },
  {
    id: 'global-audit-trail',
    name: 'Audit Logging',
    description: 'Log all agent actions for compliance and debugging',
    condition: '*',
    action: 'Write to audit log: timestamp, agent_id, action, input, output, result',
    priority: 'high',
    enabled: true,
  },
  {
    id: 'global-error-escalation',
    name: 'Error Escalation',
    description: 'Escalate critical errors to human operators',
    condition: '*',
    action: 'After 3 consecutive failures, pause agent and notify admin via Slack/email',
    priority: 'high',
    enabled: true,
  },
  {
    id: 'global-cost-control',
    name: 'Cost Control',
    description: 'Monitor and limit AI API usage costs',
    condition: '*',
    action: 'Track token usage. Alert at 80% of daily budget. Pause non-critical agents at 100%.',
    priority: 'high',
    enabled: true,
  },
];

// === ETSY-SPECIFIC RULES ===
export const ETSY_RULES: AgentRule[] = [
  {
    id: 'etsy-warmup-protocol',
    name: 'Store Warmup Protocol',
    description: 'New Etsy stores must follow a gradual warmup schedule',
    condition: 'store_warmup',
    action: `Week 1: Max 3 listings, no ads, complete shop policies
Week 2: Max 5 listings, basic SEO only
Week 3: Max 8 listings, enable Etsy Ads ($1/day)
Week 4: Max 10 listings, optimize tags
Week 5+: Max 15 listings/week, full optimization`,
    priority: 'critical',
    enabled: true,
  },
  {
    id: 'etsy-account-isolation',
    name: 'Account Isolation',
    description: 'Each Etsy store must have unique identity markers',
    condition: '*',
    action: `Each store requires:
- Unique IP address (proxy)
- Unique browser fingerprint
- Unique email domain
- Unique payment method
- Unique phone number
- Different product niches
Never cross-link stores or share assets between stores.`,
    priority: 'critical',
    enabled: true,
  },
  {
    id: 'etsy-listing-limits',
    name: 'Listing Rate Limits',
    description: 'Respect Etsy API listing creation limits',
    condition: 'create_listing',
    action: 'Max 5 listings per store per day. Space listings 2+ hours apart. Vary listing times.',
    priority: 'high',
    enabled: true,
  },
  {
    id: 'etsy-natural-behavior',
    name: 'Natural Behavior Simulation',
    description: 'Make all Etsy actions look natural and human',
    condition: '*',
    action: `- Vary action timing (don't do everything at exact intervals)
- Add random delays between actions (30s-5min)
- Browse the shop between listing creations
- Complete profile sections gradually, not all at once
- Respond to messages with natural language, not templates`,
    priority: 'high',
    enabled: true,
  },
  {
    id: 'etsy-suspension-prevention',
    name: 'Suspension Prevention',
    description: 'Proactive measures to prevent store suspension',
    condition: '*',
    action: `Monitor these red flags:
- Sudden spike in listings (>10/day for new store)
- All listings created at same time
- Identical descriptions across listings
- No shop policies or about section
- No response to customer messages within 24h
- High complaint rate (>2%)
If any red flag detected, pause and adjust behavior.`,
    priority: 'critical',
    enabled: true,
  },
  {
    id: 'etsy-tag-strategy',
    name: 'Tag Diversity',
    description: 'Tags must be diverse across listings in same shop',
    condition: 'generate_listing',
    action: 'No more than 3 identical tags across listings in same shop. Ensure tag variety.',
    priority: 'medium',
    enabled: true,
  },
];

// === SCRAPER RULES ===
export const SCRAPER_RULES: AgentRule[] = [
  {
    id: 'scraper-ethical',
    name: 'Ethical Scraping',
    description: 'Only scrape publicly available data',
    condition: '*',
    action: 'Never scrape personal data, login-protected pages, or violate robots.txt',
    priority: 'critical',
    enabled: true,
  },
  {
    id: 'scraper-rate',
    name: 'Scraping Rate',
    description: 'Limit scraping speed to avoid detection',
    condition: '*',
    action: 'Max 1 request per 2 seconds per domain. Use random delays. Rotate IPs every 50 requests.',
    priority: 'critical',
    enabled: true,
  },
  {
    id: 'scraper-proxy-rotation',
    name: 'Proxy Rotation',
    description: 'Rotate proxies and user agents',
    condition: '*',
    action: 'Rotate proxy per session. Change user agent per 10 requests. Use residential proxies for Etsy.',
    priority: 'high',
    enabled: true,
  },
  {
    id: 'scraper-data-retention',
    name: 'Data Retention',
    description: 'Clean old scraped data regularly',
    condition: '*',
    action: 'Delete raw HTML after extraction. Keep structured data max 30 days. Archive analytics only.',
    priority: 'medium',
    enabled: true,
  },
];

// === PRICING RULES ===
export const PRICING_RULES: AgentRule[] = [
  {
    id: 'price-minimum-margin',
    name: 'Minimum Profit Margin',
    description: 'Never sell below cost + 30% margin',
    condition: '*',
    action: `Calculate: ProductionCost + Shipping + EtsyFees(6.5%+$0.20) + PaymentFees(3%+$0.25) + VACommission(1%) + Marketing(5%)
Minimum price = TotalCost × 1.3 (30% margin)
NEVER set price below this minimum.`,
    priority: 'critical',
    enabled: true,
  },
  {
    id: 'price-no-race-bottom',
    name: 'No Race to Bottom',
    description: 'Do not engage in destructive price wars',
    condition: 'competitive_price_response',
    action: `If competitor drops price:
- If still above our minimum: Match only if conversion data supports it
- If below our minimum: Do NOT match. Differentiate on value instead.
- Never drop more than 15% in a single adjustment
- Wait 48 hours before reacting to competitor price changes`,
    priority: 'high',
    enabled: true,
  },
  {
    id: 'price-psychological',
    name: 'Psychological Pricing',
    description: 'Use pricing psychology for higher conversions',
    condition: '*',
    action: 'End prices in .99 or .95. Show compare-at price 30-50% higher. Use odd numbers.',
    priority: 'medium',
    enabled: true,
  },
];

// === SOCIAL MEDIA RULES ===
export const SOCIAL_RULES: AgentRule[] = [
  {
    id: 'social-platform-limits',
    name: 'Platform Posting Limits',
    description: 'Respect platform rate limits',
    condition: '*',
    action: `Pinterest: Max 25 pins/day (spread across 8+ hours)
Instagram: Max 3 feed posts/day, 10 stories/day
TikTok: Max 3 videos/day
Facebook: Max 5 posts/day
Twitter: Max 10 tweets/day`,
    priority: 'critical',
    enabled: true,
  },
  {
    id: 'social-no-copyright',
    name: 'Copyright Compliance',
    description: 'Never use copyrighted content',
    condition: '*',
    action: 'No copyrighted images, music, or text. Use only original or licensed content.',
    priority: 'critical',
    enabled: true,
  },
  {
    id: 'social-engagement',
    name: 'Engagement Strategy',
    description: 'Posts must encourage genuine engagement',
    condition: '*',
    action: 'Include questions, polls, or CTAs. Respond to comments within 4 hours. Never buy fake engagement.',
    priority: 'medium',
    enabled: true,
  },
  {
    id: 'social-brand-voice',
    name: 'Consistent Brand Voice',
    description: 'Maintain consistent brand personality',
    condition: '*',
    action: 'Each store has its own brand voice profile. Never mix voices across stores.',
    priority: 'medium',
    enabled: true,
  },
];

// === VA (Virtual Assistant) RULES ===
export const VA_RULES: AgentRule[] = [
  {
    id: 'va-commission-accurate',
    name: 'Commission Accuracy',
    description: 'VA commissions must be calculated accurately',
    condition: '*',
    action: `Commission = 1% of net sale price (after returns/refunds)
Track: gross sales, refunds, net sales, commission earned, commission paid
Pay commissions bi-weekly on the 1st and 15th
Provide detailed commission statements`,
    priority: 'critical',
    enabled: true,
  },
  {
    id: 'va-task-assignment',
    name: 'Fair Task Assignment',
    description: 'Distribute tasks fairly among VAs',
    condition: '*',
    action: 'Use round-robin with skill weighting. No VA should have >150% of average workload.',
    priority: 'high',
    enabled: true,
  },
  {
    id: 'va-quality-check',
    name: 'Quality Assurance',
    description: 'Review VA work quality regularly',
    condition: '*',
    action: 'Random audit 10% of VA actions. Score 1-5. If avg <3, trigger retraining. If <2, pause VA access.',
    priority: 'high',
    enabled: true,
  },
];

// === COMBINED RULE SET ===
export const ALL_RULES = {
  global: GLOBAL_RULES,
  etsy: ETSY_RULES,
  scraper: SCRAPER_RULES,
  pricing: PRICING_RULES,
  social: SOCIAL_RULES,
  va: VA_RULES,
};

// Get rules applicable to a specific agent
export function getRulesForAgent(agentId: string): AgentRule[] {
  const rules = [...GLOBAL_RULES]; // All agents get global rules

  if (agentId.includes('scraper')) {
    rules.push(...SCRAPER_RULES);
    rules.push(...ETSY_RULES.filter(r => r.condition === '*'));
  }
  if (agentId.includes('product') || agentId.includes('listing')) {
    rules.push(...ETSY_RULES);
  }
  if (agentId.includes('seo')) {
    rules.push(...ETSY_RULES.filter(r =>
      r.id.includes('tag') || r.id.includes('listing') || r.condition === '*'
    ));
  }
  if (agentId.includes('pricing')) {
    rules.push(...PRICING_RULES);
  }
  if (agentId.includes('social')) {
    rules.push(...SOCIAL_RULES);
  }

  return rules;
}

// Get rule by ID
export function getRule(ruleId: string): AgentRule | undefined {
  const allRules = [
    ...GLOBAL_RULES, ...ETSY_RULES, ...SCRAPER_RULES,
    ...PRICING_RULES, ...SOCIAL_RULES, ...VA_RULES,
  ];
  return allRules.find(r => r.id === ruleId);
}

// Count all rules
export function getRuleCounts(): Record<string, number> {
  return {
    global: GLOBAL_RULES.length,
    etsy: ETSY_RULES.length,
    scraper: SCRAPER_RULES.length,
    pricing: PRICING_RULES.length,
    social: SOCIAL_RULES.length,
    va: VA_RULES.length,
    total: GLOBAL_RULES.length + ETSY_RULES.length + SCRAPER_RULES.length +
      PRICING_RULES.length + SOCIAL_RULES.length + VA_RULES.length,
  };
}
