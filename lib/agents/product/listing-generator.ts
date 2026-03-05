/**
 * Product Listing Generator Agent
 * Creates optimized, unique product listings for Etsy & Shopify
 * Generates titles, descriptions, tags, and variant structures
 */

import { BaseAgent, AgentConfig, AgentTask } from '../core/base-agent';
import { MODEL_ASSIGNMENTS } from '../../services/openrouter/client';

export interface ProductListing {
  title: string;
  description: string;
  tags: string[];
  category: string;
  subcategory: string;
  price: number;
  compareAtPrice?: number;
  variants: ProductVariant[];
  images: ImageSpec[];
  seoTitle: string;
  seoDescription: string;
  targetAudience: string;
  uniquenessScore: number;
  platform: 'etsy' | 'shopify' | 'both';
}

export interface ProductVariant {
  name: string;
  options: string[];
  priceModifier: number;
}

export interface ImageSpec {
  type: 'main' | 'lifestyle' | 'detail' | 'size_chart' | 'mockup';
  description: string;
  altText: string;
  promptForGeneration: string;
}

export interface ListingBatch {
  niche: string;
  listings: ProductListing[];
  totalGenerated: number;
  avgUniquenessScore: number;
  generatedAt: number;
}

export class ProductListingGenerator extends BaseAgent {
  private generatedListings: Map<string, ProductListing> = new Map();
  private usedTitles: Set<string> = new Set();

  constructor() {
    const config: AgentConfig = {
      id: 'agent-product-listing',
      name: 'Product Listing Generator',
      description: 'Creates unique, optimized product listings for Etsy and Shopify',
      model: MODEL_ASSIGNMENTS.PRODUCT_LISTING,
      systemPrompt: `You are an expert Etsy/Shopify product listing creator for POD (Print on Demand) products.

Your expertise:
1. Writing compelling titles that rank well in Etsy search (max 140 chars)
2. Creating descriptions that convert browsers into buyers
3. Selecting tags that maximize visibility (13 tags, each max 20 chars)
4. Structuring variants for maximum sales potential
5. Writing image alt text that helps SEO

Product categories you handle:
T-shirts, Hoodies, Mugs, Phone cases, Tote bags, Posters, Canvas prints,
Stickers, Throw pillows, Blankets, Ornaments, Journals, Keychains

Rules:
- Every listing MUST be unique (>80% uniqueness score)
- Titles must include primary keyword in first 40 characters
- Descriptions must be 300+ words with bullet points
- Tags must include a mix of broad and long-tail keywords
- Never use trademarked terms without verification
- Include size/color/material in variants
- Write in the buyer's language (emotional, benefit-focused)

Etsy title formula: [Primary Keyword] [Product Type] [Modifier] [Audience] [Occasion]
Example: "Funny Cat Dad T-Shirt, Cat Lover Gift for Him, Father's Day Shirt"`,
      rules: [
        {
          id: 'listing-unique',
          name: 'Uniqueness Requirement',
          description: 'All listings must be >80% unique',
          condition: '*',
          action: 'Check against existing listings, rewrite if duplicate',
          priority: 'critical',
          enabled: true,
        },
        {
          id: 'listing-no-trademark',
          name: 'Trademark Protection',
          description: 'Never use trademarked terms',
          condition: '*',
          action: 'Scan for known trademarks, remove or replace',
          priority: 'critical',
          enabled: true,
        },
        {
          id: 'listing-seo-first',
          name: 'SEO-First Titles',
          description: 'Primary keyword must be in first 40 chars of title',
          condition: 'generate_listing',
          action: 'Ensure keyword placement in title beginning',
          priority: 'high',
          enabled: true,
        },
        {
          id: 'listing-warmup-safe',
          name: 'Warmup Safety',
          description: 'Warmup listings should be simple and safe',
          condition: 'generate_warmup_listings',
          action: 'Use conservative keywords, avoid crowded niches',
          priority: 'high',
          enabled: true,
        },
      ],
      maxConcurrentTasks: 5,
      retryPolicy: { maxRetries: 2, backoffMs: 2000, backoffMultiplier: 2 },
      rateLimit: { maxRequestsPerMinute: 20, maxTokensPerMinute: 100000 },
    };

    super(config);
  }

  protected async observe(task: AgentTask): Promise<Record<string, any>> {
    return {
      taskType: task.type,
      input: task.input,
      existingListings: this.generatedListings.size,
      usedTitlesCount: this.usedTitles.size,
      dependencyResults: task.input.dependencyResults || {},
    };
  }

  protected async act(plan: string, task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'generate_listing':
        return this.generateListing(task.input);

      case 'generate_batch':
        return this.generateBatch(task.input);

      case 'generate_warmup_listings':
        return this.generateWarmupListings(task.input);

      case 'update_value_proposition':
        return this.updateValueProposition(task.input);

      case 'generate_variations':
        return this.generateVariations(task.input);

      default:
        return { status: 'unknown_task' };
    }
  }

  private async generateListing(input: Record<string, any>): Promise<ProductListing> {
    const trendData = input.dependencyResults?.['step-0'] || {};
    const competitorData = input.dependencyResults?.['step-1'] || {};

    const response = await this.client.chatJSON<ProductListing>(
      this.config.model,
      this.config.systemPrompt,
      `Generate a complete Etsy product listing:
Niche: ${input.niche}
Product type: ${input.productType || 'T-shirt'}
Target audience: ${input.audience || 'general'}
Style: ${input.style || 'trendy'}
Trend context: ${JSON.stringify(trendData).slice(0, 500)}
Competitor context: ${JSON.stringify(competitorData).slice(0, 500)}

AVOID these existing titles: ${Array.from(this.usedTitles).slice(-20).join(' | ')}

Return complete JSON: {
  title (max 140 chars, keyword-first),
  description (300+ words with HTML formatting, bullet points, size chart reference),
  tags (exactly 13 tags, each max 20 chars),
  category, subcategory,
  price (USD), compareAtPrice (optional, for showing "sale"),
  variants: [{ name, options[], priceModifier }],
  images: [{ type, description, altText, promptForGeneration }] (at least 5 images),
  seoTitle (max 60 chars), seoDescription (max 160 chars),
  targetAudience,
  uniquenessScore (0-1, be honest),
  platform: "both"
}`,
      0.8 // Higher temperature for creativity
    );

    // Validate and store
    if (response.title) {
      this.usedTitles.add(response.title.toLowerCase());
      this.generatedListings.set(`listing-${Date.now()}`, response);
    }

    return response;
  }

  private async generateBatch(input: Record<string, any>): Promise<ListingBatch> {
    const count = input.count || 5;
    const listings: ProductListing[] = [];

    for (let i = 0; i < count; i++) {
      const listing = await this.generateListing({
        ...input,
        batchIndex: i,
        previousInBatch: listings.map(l => l.title),
      });
      listings.push(listing);

      // Small delay between generations
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return {
      niche: input.niche,
      listings,
      totalGenerated: listings.length,
      avgUniquenessScore: listings.reduce((sum, l) => sum + (l.uniquenessScore || 0), 0) / listings.length,
      generatedAt: Date.now(),
    };
  }

  private async generateWarmupListings(input: Record<string, any>): Promise<ListingBatch> {
    // Warmup listings are simpler and safer
    return this.generateBatch({
      ...input,
      count: input.count || 3,
      style: 'safe_warmup',
      extraInstructions: 'These are for a NEW store warmup. Use moderate keywords, avoid saturated niches, keep designs simple.',
    });
  }

  private async updateValueProposition(input: Record<string, any>): Promise<{
    updatedListings: { originalTitle: string; newTitle: string; changes: string[] }[];
  }> {
    const response = await this.client.chatJSON<{
      updatedListings: { originalTitle: string; newTitle: string; changes: string[] }[];
    }>(
      this.config.model,
      this.config.systemPrompt,
      `Update value propositions based on competitor analysis:
Competitor data: ${JSON.stringify(input.dependencyResults || {}).slice(0, 1000)}
Current listings to update: ${input.listings?.map((l: any) => l.title).join(' | ') || 'generate new ones'}

Differentiate from competitors. Return JSON: {
  updatedListings: [{ originalTitle, newTitle, changes: [what changed and why] }]
}`
    );

    return response;
  }

  private async generateVariations(input: Record<string, any>): Promise<{
    variations: ProductListing[];
  }> {
    const response = await this.client.chatJSON<{ variations: ProductListing[] }>(
      this.config.model,
      this.config.systemPrompt,
      `Generate ${input.count || 3} variations of this listing for different audiences/styles:
Original: ${JSON.stringify(input.originalListing || { title: input.title, niche: input.niche })}

Each variation should target a different sub-audience or style while keeping the core product.
Return JSON: { variations: [complete ProductListing objects] }`
    );

    return response;
  }
}
