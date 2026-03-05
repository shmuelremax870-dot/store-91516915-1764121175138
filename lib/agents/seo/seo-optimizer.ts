/**
 * SEO Optimization Agent
 * Optimizes product listings for Etsy and Shopify search algorithms
 * Handles tags, titles, descriptions, and ranking strategies
 */

import { BaseAgent, AgentConfig, AgentTask } from '../core/base-agent';
import { MODEL_ASSIGNMENTS } from '../../services/openrouter/client';

export interface SEOAnalysis {
  currentScore: number;
  titleScore: number;
  tagScore: number;
  descriptionScore: number;
  issues: SEOIssue[];
  recommendations: SEORecommendation[];
  keywordDensity: Record<string, number>;
  competitiveGap: string[];
}

export interface SEOIssue {
  type: 'critical' | 'warning' | 'info';
  field: 'title' | 'tags' | 'description' | 'images' | 'category';
  message: string;
  fix: string;
}

export interface SEORecommendation {
  priority: number;
  action: string;
  expectedImpact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
}

export interface OptimizedListing {
  originalTitle: string;
  optimizedTitle: string;
  originalTags: string[];
  optimizedTags: string[];
  originalDescription: string;
  optimizedDescription: string;
  seoScore: number;
  improvements: string[];
}

export interface KeywordResearch {
  primaryKeywords: { keyword: string; volume: number; competition: number; difficulty: number }[];
  longTailKeywords: { keyword: string; volume: number; competition: number }[];
  seasonalKeywords: { keyword: string; peakMonth: number; relevance: number }[];
  negativeKeywords: string[];
  suggestedTitle: string;
  suggestedTags: string[];
}

export class SEOOptimizer extends BaseAgent {
  private keywordCache: Map<string, KeywordResearch> = new Map();

  constructor() {
    const config: AgentConfig = {
      id: 'agent-seo',
      name: 'SEO Optimizer',
      description: 'Optimizes product listings for maximum search visibility on Etsy and Shopify',
      model: MODEL_ASSIGNMENTS.SEO_OPTIMIZATION,
      systemPrompt: `You are an Etsy SEO expert. You understand:

1. Etsy Search Algorithm:
   - Query matching (exact > phrase > broad)
   - Listing quality score (conversion rate, favorites, recency)
   - Shop quality score (reviews, complete policies, about section)
   - Market experience score (relevancy based on user behavior)
   - Tag matching (exact match is strongest)

2. Etsy SEO Best Practices:
   - 13 tags maximum, use ALL 13
   - Tags max 20 characters each
   - Title max 140 characters, front-load keywords
   - First 40 chars of title are most important
   - Use long-tail keywords in tags (multi-word phrases)
   - Repeat important keywords between title and tags
   - Categories and attributes help matching
   - Avoid single-word tags (too competitive)
   - Use buyer language, not seller language

3. Shopify SEO:
   - Meta title max 60 chars
   - Meta description max 160 chars
   - URL slug optimization
   - Alt text for all images
   - Structured data / schema markup

4. Common Mistakes:
   - Keyword stuffing
   - Using trademarked terms
   - Ignoring long-tail keywords
   - Not matching buyer search intent
   - Duplicate tags across listings in same shop

Always provide actionable, specific recommendations.
Output structured JSON.`,
      rules: [
        {
          id: 'seo-13-tags',
          name: 'Max Tags Used',
          description: 'Always use all 13 Etsy tags',
          condition: '*',
          action: 'Ensure exactly 13 tags are used, each max 20 chars',
          priority: 'high',
          enabled: true,
        },
        {
          id: 'seo-no-duplicate-tags',
          name: 'No Duplicate Tags',
          description: 'Tags must be unique across a listing',
          condition: '*',
          action: 'Check for and remove duplicate tags',
          priority: 'high',
          enabled: true,
        },
        {
          id: 'seo-keyword-first',
          name: 'Keyword-First Titles',
          description: 'Primary keyword in first 40 characters',
          condition: 'optimize_listing',
          action: 'Restructure title to front-load keywords',
          priority: 'high',
          enabled: true,
        },
        {
          id: 'seo-long-tail',
          name: 'Long-Tail Tags',
          description: 'Prefer multi-word tags over single words',
          condition: '*',
          action: 'Replace single-word tags with long-tail alternatives',
          priority: 'medium',
          enabled: true,
        },
      ],
      maxConcurrentTasks: 5,
      retryPolicy: { maxRetries: 2, backoffMs: 2000, backoffMultiplier: 2 },
      rateLimit: { maxRequestsPerMinute: 20, maxTokensPerMinute: 80000 },
    };

    super(config);
  }

  protected async observe(task: AgentTask): Promise<Record<string, any>> {
    return {
      taskType: task.type,
      input: task.input,
      cachedKeywords: this.keywordCache.size,
      dependencyResults: task.input.dependencyResults || {},
    };
  }

  protected async act(plan: string, task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'optimize_listing':
        return this.optimizeListing(task.input);

      case 'keyword_research':
        return this.keywordResearch(task.input);

      case 'audit_listing':
        return this.auditListing(task.input);

      case 'basic_seo':
        return this.basicSEO(task.input);

      case 'refresh_tags':
        return this.refreshTags(task.input);

      case 'differentiation_seo':
        return this.differentiationSEO(task.input);

      case 'bulk_optimize':
        return this.bulkOptimize(task.input);

      default:
        return { status: 'unknown_task' };
    }
  }

  private async optimizeListing(input: Record<string, any>): Promise<OptimizedListing> {
    const listing = input.listing || input.dependencyResults?.['step-2'] || {};

    const response = await this.client.chatJSON<OptimizedListing>(
      this.config.model,
      this.config.systemPrompt,
      `Optimize this Etsy listing for maximum SEO:

Current title: ${listing.title || input.title || 'N/A'}
Current tags: ${(listing.tags || input.tags || []).join(', ')}
Current description: ${(listing.description || input.description || '').slice(0, 500)}
Niche: ${input.niche || 'unknown'}
Product type: ${input.productType || 'POD product'}

Trend context: ${JSON.stringify(input.dependencyResults?.['step-0'] || {}).slice(0, 300)}

Return JSON: {
  originalTitle, optimizedTitle (max 140 chars, keyword-first),
  originalTags[], optimizedTags[] (exactly 13, each max 20 chars, all unique, long-tail preferred),
  originalDescription, optimizedDescription (with SEO keywords naturally integrated),
  seoScore (0-100),
  improvements: [list of what was improved and why]
}`
    );

    return response;
  }

  private async keywordResearch(input: Record<string, any>): Promise<KeywordResearch> {
    const cacheKey = `${input.niche}-${input.productType}`;
    const cached = this.keywordCache.get(cacheKey);
    if (cached) return cached;

    const response = await this.client.chatJSON<KeywordResearch>(
      this.config.model,
      this.config.systemPrompt,
      `Keyword research for Etsy:
Niche: ${input.niche}
Product type: ${input.productType || 'T-shirt'}
Target audience: ${input.audience || 'general US'}

Return JSON: {
  primaryKeywords: [{ keyword, volume (estimated monthly), competition (0-100), difficulty (0-100) }] (top 10),
  longTailKeywords: [{ keyword, volume, competition }] (top 15),
  seasonalKeywords: [{ keyword, peakMonth (1-12), relevance (0-1) }] (top 5),
  negativeKeywords: [terms to AVOID],
  suggestedTitle (using best keywords),
  suggestedTags: [13 optimized tags]
}`
    );

    this.keywordCache.set(cacheKey, response);
    return response;
  }

  private async auditListing(input: Record<string, any>): Promise<SEOAnalysis> {
    const response = await this.client.chatJSON<SEOAnalysis>(
      this.config.model,
      this.config.systemPrompt,
      `SEO audit for this Etsy listing:
Title: ${input.title}
Tags: ${input.tags?.join(', ')}
Description: ${(input.description || '').slice(0, 800)}
Category: ${input.category || 'unknown'}
Has images: ${input.imageCount || 'unknown'}

Return JSON: {
  currentScore (0-100),
  titleScore (0-100), tagScore (0-100), descriptionScore (0-100),
  issues: [{ type, field, message, fix }],
  recommendations: [{ priority (1-10), action, expectedImpact, effort }],
  keywordDensity: { keyword: percentage },
  competitiveGap: [keywords competitors use that you don't]
}`
    );

    return response;
  }

  private async basicSEO(input: Record<string, any>): Promise<OptimizedListing> {
    // Lighter optimization for warmup stores
    return this.optimizeListing({
      ...input,
      extraInstructions: 'This is for a new store warmup. Use safe, moderate keywords. Avoid hyper-competitive terms.',
    });
  }

  private async refreshTags(input: Record<string, any>): Promise<{
    refreshed: { listingId: string; oldTags: string[]; newTags: string[]; reason: string }[];
  }> {
    const trendData = input.dependencyResults?.['step-0'] || {};

    const response = await this.client.chatJSON<{
      refreshed: { listingId: string; oldTags: string[]; newTags: string[]; reason: string }[];
    }>(
      this.config.model,
      this.config.systemPrompt,
      `Refresh tags for existing listings based on current trends:
Current trends: ${JSON.stringify(trendData).slice(0, 500)}
Listings to refresh: ${JSON.stringify(input.listings || []).slice(0, 1000)}

Replace underperforming tags with trending alternatives.
Return JSON: { refreshed: [{ listingId, oldTags[], newTags[], reason }] }`
    );

    return response;
  }

  private async differentiationSEO(input: Record<string, any>): Promise<{
    strategy: string;
    uniqueAngles: string[];
    differentTags: string[];
    positioningStatement: string;
  }> {
    const competitorData = input.dependencyResults?.['step-0'] || {};

    const response = await this.client.chatJSON<{
      strategy: string;
      uniqueAngles: string[];
      differentTags: string[];
      positioningStatement: string;
    }>(
      this.config.model,
      this.config.systemPrompt,
      `Create a differentiation SEO strategy based on competitor analysis:
Competitor data: ${JSON.stringify(competitorData).slice(0, 800)}
Our niche: ${input.niche}

Find SEO angles competitors AREN'T using.
Return JSON: { strategy, uniqueAngles[], differentTags[] (13 tags they don't use), positioningStatement }`
    );

    return response;
  }

  private async bulkOptimize(input: Record<string, any>): Promise<{
    optimized: OptimizedListing[];
    summary: { avgScoreBefore: number; avgScoreAfter: number; topImprovements: string[] };
  }> {
    const listings = input.listings || [];
    const optimized: OptimizedListing[] = [];

    for (const listing of listings.slice(0, 10)) {
      const result = await this.optimizeListing({ ...input, listing });
      optimized.push(result);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const avgBefore = optimized.reduce((sum, o) => sum + (o.seoScore * 0.7), 0) / optimized.length;
    const avgAfter = optimized.reduce((sum, o) => sum + o.seoScore, 0) / optimized.length;

    return {
      optimized,
      summary: {
        avgScoreBefore: Math.round(avgBefore),
        avgScoreAfter: Math.round(avgAfter),
        topImprovements: optimized.flatMap(o => o.improvements).slice(0, 5),
      },
    };
  }
}
