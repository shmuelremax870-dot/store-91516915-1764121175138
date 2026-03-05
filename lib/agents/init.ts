/**
 * Agent System Initialization
 * Bootstraps all agents, registers them, and sets up MCP permissions
 */

import { getAgentRegistry } from './core/agent-registry';
import { EtsyProductScraper } from './scrapers/etsy-product-scraper';
import { EtsyTrendScraper } from './scrapers/etsy-trend-scraper';
import { CompetitorScraper } from './scrapers/competitor-scraper';
import { ProductListingGenerator } from './product/listing-generator';
import { SEOOptimizer } from './seo/seo-optimizer';
import { PricingAgent } from './pricing/pricing-agent';
import { SocialMediaAgent } from './social/social-media-agent';
import { AgentZeroOrchestrator } from '../services/agent-zero/orchestrator';
import { getMCPExecutor } from '../mcp/mcp-executor';

let initialized = false;

export function initializeAgents(): void {
  if (initialized) return;

  const registry = getAgentRegistry();
  const mcpExecutor = getMCPExecutor();

  // 1. Initialize all agents
  const agents = {
    orchestrator: new AgentZeroOrchestrator(),
    etsyProductScraper: new EtsyProductScraper(),
    etsyTrendScraper: new EtsyTrendScraper(),
    competitorScraper: new CompetitorScraper(),
    productListingGenerator: new ProductListingGenerator(),
    seoOptimizer: new SEOOptimizer(),
    pricingAgent: new PricingAgent(),
    socialMediaAgent: new SocialMediaAgent(),
  };

  // 2. Register all agents
  Object.values(agents).forEach(agent => registry.register(agent));

  // 3. Set up MCP permissions for each agent
  const agentPermissions: Record<string, string[]> = {
    'agent-zero': [
      'listings_r', 'shops_r', 'transactions_r',
      'db_read', 'analytics_r', 'notify', 'alert',
    ],
    'scraper-etsy-products': [
      'scrape', 'listings_r', 'db_read',
    ],
    'scraper-etsy-trends': [
      'scrape', 'db_read', 'analytics_r',
    ],
    'scraper-competitors': [
      'scrape', 'db_read',
    ],
    'agent-product-listing': [
      'listings_w', 'listings_r', 'generate',
      'write_products', 'catalog_r', 'db_read',
    ],
    'agent-seo': [
      'listings_w', 'listings_r', 'db_read', 'analytics_r',
    ],
    'agent-pricing': [
      'listings_w', 'listings_r', 'catalog_r',
      'db_read', 'analytics_r',
    ],
    'agent-social': [
      'generate', 'notify', 'db_read', 'analytics_r',
    ],
  };

  Object.entries(agentPermissions).forEach(([agentId, permissions]) => {
    mcpExecutor.grantPermissions(agentId, permissions);
  });

  // 4. Set up inter-agent event listeners
  registry.onEvent('trend_detected', (msg) => {
    console.log(`[Event] Trend detected: ${msg.payload.keyword}`);
    // Auto-trigger product listing generation for trending niches
  });

  registry.onEvent('competitor_alert', (msg) => {
    console.log(`[Event] Competitor alert: ${msg.payload.type}`);
    // Auto-trigger competitive response workflow
  });

  registry.onEvent('listing_created', (msg) => {
    console.log(`[Event] Listing created: ${msg.payload.title}`);
    // Auto-trigger SEO optimization and social media posting
  });

  initialized = true;
  console.log('[AgentSystem] All agents initialized and registered');
  console.log(`[AgentSystem] Total agents: ${registry.getAllAgents().length}`);
}

export function getInitializationStatus(): {
  initialized: boolean;
  agents: { id: string; name: string; status: string }[];
  mcpServers: number;
} {
  if (!initialized) {
    return { initialized: false, agents: [], mcpServers: 0 };
  }

  const registry = getAgentRegistry();
  return {
    initialized: true,
    agents: registry.getAllAgents().map(a => ({
      id: a.id,
      name: a.name,
      status: a.status,
    })),
    mcpServers: 7,
  };
}
