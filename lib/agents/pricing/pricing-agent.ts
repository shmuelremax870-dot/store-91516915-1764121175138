/**
 * Pricing Intelligence Agent
 * Dynamic pricing based on competition, trends, costs, and demand
 * Implements multiple pricing strategies for Etsy/Shopify POD products
 */

import { BaseAgent, AgentConfig, AgentTask } from '../core/base-agent';
import { MODEL_ASSIGNMENTS } from '../../services/openrouter/client';

export interface PricingStrategy {
  strategy: 'competitive' | 'premium' | 'penetration' | 'psychological' | 'bundle' | 'dynamic';
  basePrice: number;
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  compareAtPrice: number;
  margin: number;
  marginPercentage: number;
  reasoning: string;
}

export interface CostBreakdown {
  productionCost: number;
  shippingCost: number;
  platformFee: number; // Etsy: 6.5% + $0.20 listing fee
  paymentProcessing: number; // ~3-4%
  marketingCost: number;
  vaCommission: number; // 1%
  totalCost: number;
  breakEvenPrice: number;
}

export interface PriceOptimization {
  currentPrice: number;
  optimizedPrice: number;
  expectedSalesChange: string;
  expectedRevenueChange: string;
  strategy: string;
  confidenceLevel: number;
  factors: string[];
}

export interface MarketPriceMap {
  niche: string;
  priceDistribution: { range: string; percentage: number; sellers: number }[];
  averagePrice: number;
  medianPrice: number;
  sweetSpot: { min: number; max: number };
  premiumThreshold: number;
  budgetThreshold: number;
  recommendation: string;
}

export class PricingAgent extends BaseAgent {
  private priceHistory: Map<string, { price: number; date: number }[]> = new Map();

  // POD base costs (approximate)
  private baseCosts: Record<string, number> = {
    'tshirt': 8.50,
    'hoodie': 18.00,
    'mug': 5.50,
    'poster': 4.00,
    'phone_case': 6.00,
    'tote_bag': 8.00,
    'sticker': 1.50,
    'pillow': 10.00,
    'blanket': 22.00,
    'canvas': 12.00,
    'ornament': 5.00,
    'journal': 7.00,
    'keychain': 4.00,
  };

  constructor() {
    const config: AgentConfig = {
      id: 'agent-pricing',
      name: 'Pricing Intelligence',
      description: 'Dynamic pricing optimization for POD products across Etsy and Shopify',
      model: MODEL_ASSIGNMENTS.PRICING_ANALYSIS,
      systemPrompt: `You are a pricing strategist for POD (Print on Demand) e-commerce.

Your expertise:
1. Cost-based pricing with accurate POD cost structures
2. Competition-based pricing using market data
3. Psychological pricing ($19.99 vs $20.00)
4. Dynamic pricing based on demand signals
5. Bundle and volume pricing
6. Penetration pricing for new stores
7. Premium pricing for established shops

Fee structure you must account for:
- Etsy listing fee: $0.20 per listing
- Etsy transaction fee: 6.5% of sale price
- Etsy payment processing: 3% + $0.25
- Shopify: 2.9% + $0.30 (if on Shopify Payments)
- VA commission: 1% of sale price
- POD production: varies by product
- Shipping: varies (free shipping means baked into price)

Key principles:
- Price must cover all costs + minimum 30% profit margin
- Use .99 psychological pricing
- Show compare-at price for perceived value
- Adjust for seasonal demand
- Consider competitor pricing but don't race to bottom
- Premium positioning beats price wars for POD

Output structured JSON with detailed reasoning.`,
      rules: [
        {
          id: 'price-min-margin',
          name: 'Minimum Margin',
          description: 'Never price below 30% profit margin',
          condition: '*',
          action: 'Calculate all costs and ensure 30%+ margin',
          priority: 'critical',
          enabled: true,
        },
        {
          id: 'price-psychological',
          name: 'Psychological Pricing',
          description: 'Use .99 or .95 endings',
          condition: '*',
          action: 'Round to nearest .99 or .95',
          priority: 'medium',
          enabled: true,
        },
        {
          id: 'price-compare-at',
          name: 'Compare-At Price',
          description: 'Always set a compare-at price for perceived value',
          condition: '*',
          action: 'Set compare-at price 30-50% higher than sale price',
          priority: 'medium',
          enabled: true,
        },
      ],
      maxConcurrentTasks: 5,
      retryPolicy: { maxRetries: 2, backoffMs: 2000, backoffMultiplier: 2 },
      rateLimit: { maxRequestsPerMinute: 20, maxTokensPerMinute: 60000 },
    };

    super(config);
  }

  protected async observe(task: AgentTask): Promise<Record<string, any>> {
    return {
      taskType: task.type,
      input: task.input,
      baseCosts: this.baseCosts,
      priceHistoryEntries: this.priceHistory.size,
      dependencyResults: task.input.dependencyResults || {},
    };
  }

  protected async act(plan: string, task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'analyze_and_set_price':
        return this.analyzeAndSetPrice(task.input);

      case 'set_competitive_price':
        return this.setCompetitivePrice(task.input);

      case 'daily_price_adjustment':
        return this.dailyPriceAdjustment(task.input);

      case 'competitive_price_response':
        return this.competitivePriceResponse(task.input);

      case 'cost_analysis':
        return this.costAnalysis(task.input);

      case 'market_price_map':
        return this.marketPriceMap(task.input);

      case 'bundle_pricing':
        return this.bundlePricing(task.input);

      default:
        return { status: 'unknown_task' };
    }
  }

  private async analyzeAndSetPrice(input: Record<string, any>): Promise<PricingStrategy> {
    const productType = input.productType || 'tshirt';
    const baseCost = this.baseCosts[productType] || 10;
    const competitorData = input.dependencyResults?.['step-1'] || {};
    const listingData = input.dependencyResults?.['step-2'] || {};

    const costs = this.calculateCosts(baseCost, input.shippingIncluded !== false);

    const response = await this.client.chatJSON<PricingStrategy>(
      this.config.model,
      this.config.systemPrompt,
      `Set optimal price for this POD product:
Product type: ${productType}
Production cost: $${baseCost}
Total costs (with fees): $${costs.totalCost.toFixed(2)}
Break-even price: $${costs.breakEvenPrice.toFixed(2)}
Niche: ${input.niche || 'general'}
Competitor pricing: ${JSON.stringify(competitorData).slice(0, 400)}
Listing quality: ${JSON.stringify(listingData).slice(0, 300)}
Store age: ${input.storeAge || 'new'}
Free shipping: ${input.shippingIncluded !== false}

Return JSON: {
  strategy, basePrice, recommendedPrice (must be ≥ $${costs.breakEvenPrice.toFixed(2)} * 1.3),
  minPrice, maxPrice, compareAtPrice (30-50% higher),
  margin (dollar amount), marginPercentage,
  reasoning (why this price)
}`
    );

    // Record price history
    const key = `${productType}-${input.niche || 'general'}`;
    if (!this.priceHistory.has(key)) {
      this.priceHistory.set(key, []);
    }
    this.priceHistory.get(key)!.push({ price: response.recommendedPrice, date: Date.now() });

    return response;
  }

  private async setCompetitivePrice(input: Record<string, any>): Promise<PricingStrategy> {
    return this.analyzeAndSetPrice({
      ...input,
      strategy: 'penetration', // Lower price for new stores
      extraInstructions: 'This is for a new store. Price competitively but maintain 30%+ margin.',
    });
  }

  private async dailyPriceAdjustment(input: Record<string, any>): Promise<{
    adjustments: PriceOptimization[];
    summary: string;
  }> {
    const trendData = input.dependencyResults?.['step-0'] || {};
    const competitorData = input.dependencyResults?.['step-1'] || {};

    const response = await this.client.chatJSON<{
      adjustments: PriceOptimization[];
      summary: string;
    }>(
      this.config.model,
      this.config.systemPrompt,
      `Daily price review and adjustment:
Current trends: ${JSON.stringify(trendData).slice(0, 400)}
Competitor changes: ${JSON.stringify(competitorData).slice(0, 400)}
Products to review: ${JSON.stringify(input.products || []).slice(0, 600)}

Return JSON: {
  adjustments: [{
    currentPrice, optimizedPrice, expectedSalesChange,
    expectedRevenueChange, strategy, confidenceLevel (0-1), factors[]
  }],
  summary
}`
    );

    return response;
  }

  private async competitivePriceResponse(input: Record<string, any>): Promise<{
    response: string;
    adjustments: PriceOptimization[];
    doNotReact: string[];
  }> {
    const competitorData = input.dependencyResults?.['step-0'] || {};

    const response = await this.client.chatJSON<{
      response: string;
      adjustments: PriceOptimization[];
      doNotReact: string[];
    }>(
      this.config.model,
      this.config.systemPrompt,
      `Competitor has changed pricing:
Changes: ${JSON.stringify(competitorData).slice(0, 600)}
Our current prices: ${JSON.stringify(input.ourPrices || []).slice(0, 400)}

Should we react? Not all price wars are worth joining.
Return JSON: {
  response (overall strategy recommendation),
  adjustments: [price changes to make],
  doNotReact: [products where we should hold price and why]
}`
    );

    return response;
  }

  private async costAnalysis(input: Record<string, any>): Promise<CostBreakdown> {
    const productType = input.productType || 'tshirt';
    const baseCost = this.baseCosts[productType] || 10;
    return this.calculateCosts(baseCost, input.freeShipping !== false);
  }

  private async marketPriceMap(input: Record<string, any>): Promise<MarketPriceMap> {
    const response = await this.client.chatJSON<MarketPriceMap>(
      this.config.model,
      this.config.systemPrompt,
      `Create a market price map for: "${input.niche}" - ${input.productType || 'all POD products'}

Return JSON: {
  niche,
  priceDistribution: [{ range ("$X-$Y"), percentage, sellers }],
  averagePrice, medianPrice,
  sweetSpot: { min, max },
  premiumThreshold, budgetThreshold,
  recommendation
}`
    );

    return response;
  }

  private async bundlePricing(input: Record<string, any>): Promise<{
    bundles: { items: string[]; individualTotal: number; bundlePrice: number; savings: string; margin: number }[];
  }> {
    const response = await this.client.chatJSON<{
      bundles: { items: string[]; individualTotal: number; bundlePrice: number; savings: string; margin: number }[];
    }>(
      this.config.model,
      this.config.systemPrompt,
      `Create bundle pricing for these products:
Products: ${JSON.stringify(input.products || []).slice(0, 800)}
Niche: ${input.niche}

Create 3-5 attractive bundles with good margins.
Return JSON: {
  bundles: [{ items[], individualTotal, bundlePrice, savings (percentage), margin }]
}`
    );

    return response;
  }

  // === Cost Calculation ===

  private calculateCosts(productionCost: number, freeShipping: boolean): CostBreakdown {
    const shippingCost = freeShipping ? 4.50 : 0; // Baked into price if free shipping
    const estimatedPrice = productionCost * 2.5; // Rough estimate for fee calculation
    const etsyListingFee = 0.20;
    const etsyTransactionFee = estimatedPrice * 0.065;
    const paymentProcessing = estimatedPrice * 0.03 + 0.25;
    const vaCommission = estimatedPrice * 0.01;
    const marketingCost = estimatedPrice * 0.05; // 5% estimated

    const platformFee = etsyListingFee + etsyTransactionFee;
    const totalCost = productionCost + shippingCost + platformFee + paymentProcessing + marketingCost + vaCommission;

    return {
      productionCost,
      shippingCost,
      platformFee,
      paymentProcessing,
      marketingCost,
      vaCommission,
      totalCost,
      breakEvenPrice: totalCost,
    };
  }
}
