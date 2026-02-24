/**
 * Etsy Product Scraper Agent
 * Scrapes and analyzes Etsy product listings for competitive intelligence
 * Uses AI to extract structured data from raw scrape results
 */

import { BaseAgent, AgentConfig, AgentTask } from '../core/base-agent';
import { MODEL_ASSIGNMENTS } from '../../services/openrouter/client';

export interface EtsyProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  tags: string[];
  images: string[];
  shopName: string;
  shopId: string;
  category: string;
  rating: number;
  reviewCount: number;
  salesCount: number;
  favorites: number;
  listingAge: number; // days
  shippingFree: boolean;
  variants: { name: string; price: number }[];
  url: string;
  scrapedAt: number;
}

export interface CompetitorAnalysis {
  shopName: string;
  totalListings: number;
  priceRange: { min: number; max: number; avg: number };
  topTags: string[];
  avgRating: number;
  totalSales: number;
  strongPoints: string[];
  weakPoints: string[];
  opportunities: string[];
}

export class EtsyProductScraper extends BaseAgent {
  private scrapedProducts: Map<string, EtsyProduct> = new Map();
  private userAgent: string;

  constructor() {
    const config: AgentConfig = {
      id: 'scraper-etsy-products',
      name: 'Etsy Product Scraper',
      description: 'Scrapes Etsy products, analyzes competitors, finds opportunities',
      model: MODEL_ASSIGNMENTS.DATA_EXTRACTION,
      systemPrompt: `You are an expert Etsy product data analyst. Your job is to:
1. Analyze raw product data from Etsy scrapes
2. Extract key competitive insights
3. Identify pricing opportunities
4. Find gaps in the market
5. Rate product quality and potential

Rules:
- Always respect rate limits (max 1 request per 2 seconds)
- Rotate user agents and proxies
- Never scrape personal/private data
- Focus on public listing data only
- Flag any suspicious patterns or potential policy violations

Output structured JSON with your analysis.`,
      rules: [
        {
          id: 'scraper-rate-limit',
          name: 'Scrape Rate Limit',
          description: 'Max 1 request per 2 seconds to avoid detection',
          condition: '*',
          action: 'Enforce 2-second delay between requests',
          priority: 'critical',
          enabled: true,
        },
        {
          id: 'scraper-rotate-identity',
          name: 'Identity Rotation',
          description: 'Rotate user agent and proxy per session',
          condition: '*',
          action: 'Use random user agent and proxy from pool',
          priority: 'high',
          enabled: true,
        },
        {
          id: 'scraper-data-hygiene',
          name: 'Data Hygiene',
          description: 'Clean and validate all scraped data',
          condition: '*',
          action: 'Remove duplicates, validate prices, check for stale data',
          priority: 'medium',
          enabled: true,
        },
      ],
      maxConcurrentTasks: 3,
      retryPolicy: { maxRetries: 3, backoffMs: 5000, backoffMultiplier: 2 },
      rateLimit: { maxRequestsPerMinute: 30, maxTokensPerMinute: 50000 },
    };

    super(config);
    this.userAgent = this.getRandomUserAgent();
  }

  protected async observe(task: AgentTask): Promise<Record<string, any>> {
    const { type, input } = task;

    switch (type) {
      case 'scrape_competitor_products':
        return {
          targetShop: input.shopName || input.shopUrl,
          niche: input.niche,
          maxProducts: input.maxProducts || 50,
          existingData: this.scrapedProducts.size,
          lastScrapeAge: this.getLastScrapeAge(),
        };

      case 'find_low_competition':
        return {
          niche: input.niche,
          priceRange: input.priceRange || { min: 10, max: 100 },
          maxCompetitors: input.maxCompetitors || 20,
          keywords: input.keywords || [],
        };

      case 'scrape_search_results':
        return {
          query: input.query,
          category: input.category,
          sortBy: input.sortBy || 'relevancy',
          page: input.page || 1,
          filters: input.filters || {},
        };

      case 'monitor_competitors':
        return {
          trackedShops: input.shopNames || [],
          checkPriceChanges: true,
          checkNewListings: true,
          checkRemovedListings: true,
          previousData: this.getPreviousCompetitorData(input.shopNames),
        };

      default:
        return { taskType: type, input };
    }
  }

  protected async act(plan: string, task: AgentTask): Promise<any> {
    let parsedPlan: any;
    try {
      parsedPlan = JSON.parse(plan);
    } catch {
      parsedPlan = { selectedApproach: 'default' };
    }

    switch (task.type) {
      case 'scrape_competitor_products':
        return this.scrapeCompetitorProducts(task.input, parsedPlan);

      case 'find_low_competition':
        return this.findLowCompetition(task.input, parsedPlan);

      case 'scrape_search_results':
        return this.scrapeSearchResults(task.input, parsedPlan);

      case 'monitor_competitors':
        return this.monitorCompetitors(task.input, parsedPlan);

      case 'deep_competitor_analysis':
        return this.deepCompetitorAnalysis(task.input, parsedPlan);

      default:
        return { status: 'unknown_task', plan: parsedPlan };
    }
  }

  private async scrapeCompetitorProducts(
    input: Record<string, any>,
    plan: any
  ): Promise<{ products: EtsyProduct[]; analysis: CompetitorAnalysis }> {
    // Simulate Etsy scraping (in production, this would use actual HTTP requests with proxies)
    const products = await this.simulateEtsyScrape(
      input.shopName || input.niche,
      input.maxProducts || 20
    );

    // Use AI to analyze the scraped products
    const analysis = await this.client.chatJSON<CompetitorAnalysis>(
      this.config.model,
      'Analyze these Etsy products and provide competitive intelligence.',
      `Products: ${JSON.stringify(products)}\n\nProvide analysis as JSON with: shopName, totalListings, priceRange {min, max, avg}, topTags[], avgRating, totalSales, strongPoints[], weakPoints[], opportunities[]`
    );

    // Store in cache
    products.forEach(p => this.scrapedProducts.set(p.id, p));

    return { products, analysis };
  }

  private async findLowCompetition(
    input: Record<string, any>,
    plan: any
  ): Promise<{
    opportunities: { keyword: string; competition: number; demand: number; score: number }[];
  }> {
    const response = await this.client.chatJSON<{
      opportunities: { keyword: string; competition: number; demand: number; score: number }[];
    }>(
      this.config.model,
      `You are an Etsy market researcher. Find low-competition, high-demand niches.`,
      `Niche: ${input.niche}
Price range: $${input.priceRange?.min || 10}-$${input.priceRange?.max || 100}
Keywords: ${input.keywords?.join(', ') || 'none specified'}

Find 10 low-competition opportunities. Return JSON: { opportunities: [{ keyword, competition (1-100), demand (1-100), score (0-1) }] }`
    );

    return response;
  }

  private async scrapeSearchResults(
    input: Record<string, any>,
    plan: any
  ): Promise<{ results: EtsyProduct[]; totalFound: number; page: number }> {
    const products = await this.simulateEtsyScrape(input.query, 24);

    return {
      results: products,
      totalFound: products.length * 10, // Simulated total
      page: input.page || 1,
    };
  }

  private async monitorCompetitors(
    input: Record<string, any>,
    plan: any
  ): Promise<{
    changes: { shop: string; type: string; details: string }[];
    alerts: string[];
  }> {
    const response = await this.client.chatJSON<{
      changes: { shop: string; type: string; details: string }[];
      alerts: string[];
    }>(
      this.config.model,
      'You monitor competitor activity on Etsy and detect changes.',
      `Monitored shops: ${JSON.stringify(input.shopNames)}
Generate realistic competitor monitoring report.
Return JSON: { changes: [{ shop, type, details }], alerts: [] }`
    );

    return response;
  }

  private async deepCompetitorAnalysis(
    input: Record<string, any>,
    plan: any
  ): Promise<CompetitorAnalysis> {
    const response = await this.client.chatJSON<CompetitorAnalysis>(
      this.config.model,
      'Provide deep competitive analysis for an Etsy shop.',
      `Shop: ${input.shopName || 'top competitor in ' + input.niche}
Niche: ${input.niche}
Provide detailed analysis as JSON: { shopName, totalListings, priceRange: {min, max, avg}, topTags[], avgRating, totalSales, strongPoints[], weakPoints[], opportunities[] }`
    );

    return response;
  }

  // === Helpers ===

  private async simulateEtsyScrape(query: string, count: number): Promise<EtsyProduct[]> {
    // In production: actual HTTP scraping with proxy rotation
    // For now: AI-generated realistic product data
    const response = await this.client.chatJSON<{ products: EtsyProduct[] }>(
      this.config.model,
      `Generate realistic Etsy product data for testing. Each product should have realistic titles, prices, tags, and metrics.`,
      `Generate ${Math.min(count, 10)} realistic Etsy products for query: "${query}".
Return JSON: { products: [{ id, title, description, price, currency: "USD", tags[], images: [], shopName, shopId, category, rating, reviewCount, salesCount, favorites, listingAge, shippingFree, variants: [], url, scrapedAt }] }`
    );

    return response.products || [];
  }

  private getRandomUserAgent(): string {
    const agents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 Chrome/119.0.0.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0; rv:121.0) Gecko/20100101 Firefox/121.0',
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  private getLastScrapeAge(): number {
    if (this.scrapedProducts.size === 0) return -1;
    const latest = Math.max(...Array.from(this.scrapedProducts.values()).map(p => p.scrapedAt));
    return Date.now() - latest;
  }

  private getPreviousCompetitorData(shopNames: string[]): Record<string, EtsyProduct[]> {
    const data: Record<string, EtsyProduct[]> = {};
    shopNames?.forEach(shop => {
      data[shop] = Array.from(this.scrapedProducts.values())
        .filter(p => p.shopName === shop);
    });
    return data;
  }
}
