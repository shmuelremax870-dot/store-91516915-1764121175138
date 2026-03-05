/**
 * Etsy Trend Scraper Agent
 * Detects trending niches, seasonal patterns, and emerging opportunities
 * Uses AI to analyze market signals and predict trends
 */

import { BaseAgent, AgentConfig, AgentTask } from '../core/base-agent';
import { MODEL_ASSIGNMENTS } from '../../services/openrouter/client';

export interface TrendData {
  keyword: string;
  trendScore: number;        // 0-100
  growthRate: number;         // percentage
  searchVolume: number;
  competitionLevel: 'low' | 'medium' | 'high' | 'saturated';
  seasonality: 'evergreen' | 'seasonal' | 'trending' | 'declining';
  peakMonths: number[];
  relatedKeywords: string[];
  avgPrice: number;
  profitPotential: 'low' | 'medium' | 'high' | 'very_high';
  recommendedAction: string;
}

export interface NicheAnalysis {
  niche: string;
  overallScore: number;
  trends: TrendData[];
  topProducts: string[];
  marketGaps: string[];
  entryBarrier: 'low' | 'medium' | 'high';
  estimatedMonthlyRevenue: { min: number; max: number };
  recommendations: string[];
}

export interface SeasonalForecast {
  month: string;
  trendingNiches: string[];
  decliningNiches: string[];
  upcomingEvents: string[];
  recommendedActions: string[];
}

export class EtsyTrendScraper extends BaseAgent {
  private trendCache: Map<string, { data: TrendData; timestamp: number }> = new Map();
  private cacheMaxAge = 6 * 60 * 60 * 1000; // 6 hours

  constructor() {
    const config: AgentConfig = {
      id: 'scraper-etsy-trends',
      name: 'Etsy Trend Detector',
      description: 'Detects trending niches, seasonal patterns, and market opportunities on Etsy',
      model: MODEL_ASSIGNMENTS.TREND_DETECTION,
      systemPrompt: `You are an expert Etsy market trend analyst. Your job is to:
1. Detect emerging trends before they become saturated
2. Analyze seasonal patterns for different niches
3. Identify market gaps and untapped opportunities
4. Predict which products will trend in coming weeks/months
5. Score niches by profit potential and competition level

You have deep knowledge of:
- Etsy marketplace dynamics and algorithm
- POD (Print on Demand) product categories
- Consumer behavior patterns
- Seasonal shopping trends
- Social media influence on product demand

Categories you track: T-shirts, Mugs, Phone cases, Tote bags, Posters, Stickers,
Jewelry, Home decor, Wedding items, Pet products, Kids items, Personalized gifts.

Always provide data-driven analysis with confidence scores.
Output as structured JSON.`,
      rules: [
        {
          id: 'trend-freshness',
          name: 'Data Freshness',
          description: 'Trend data older than 6 hours must be refreshed',
          condition: '*',
          action: 'Check cache age, refresh if stale',
          priority: 'high',
          enabled: true,
        },
        {
          id: 'trend-confidence',
          name: 'Confidence Threshold',
          description: 'Only report trends with >60% confidence',
          condition: 'detect_trends',
          action: 'Filter out low-confidence trends',
          priority: 'medium',
          enabled: true,
        },
        {
          id: 'trend-diversify',
          name: 'Niche Diversification',
          description: 'Recommend trends across multiple categories',
          condition: 'detect_trends',
          action: 'Ensure recommendations span at least 3 categories',
          priority: 'medium',
          enabled: true,
        },
      ],
      maxConcurrentTasks: 2,
      retryPolicy: { maxRetries: 2, backoffMs: 3000, backoffMultiplier: 2 },
      rateLimit: { maxRequestsPerMinute: 15, maxTokensPerMinute: 50000 },
    };

    super(config);
  }

  protected async observe(task: AgentTask): Promise<Record<string, any>> {
    const cachedTrends = this.getCachedTrends();
    const currentMonth = new Date().getMonth() + 1;
    const currentSeason = this.getSeason(currentMonth);

    return {
      taskType: task.type,
      input: task.input,
      cachedTrendsCount: cachedTrends.length,
      staleTrends: cachedTrends.filter(t => Date.now() - t.timestamp > this.cacheMaxAge).length,
      currentMonth,
      currentSeason,
      upcomingHolidays: this.getUpcomingHolidays(),
    };
  }

  protected async act(plan: string, task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'detect_trends':
        return this.detectTrends(task.input);

      case 'analyze_niche':
        return this.analyzeNiche(task.input);

      case 'seasonal_forecast':
        return this.seasonalForecast(task.input);

      case 'daily_trend_check':
        return this.dailyTrendCheck(task.input);

      case 'find_emerging':
        return this.findEmergingTrends(task.input);

      default:
        return { status: 'unknown_task' };
    }
  }

  private async detectTrends(input: Record<string, any>): Promise<{
    trends: TrendData[];
    summary: string;
  }> {
    const response = await this.client.chatJSON<{ trends: TrendData[]; summary: string }>(
      this.config.model,
      this.config.systemPrompt,
      `Detect current trending products/niches on Etsy.
Category filter: ${input.category || 'all'}
Region: ${input.region || 'US'}
Time period: ${input.period || 'last 7 days'}

Provide 10 trends as JSON: {
  trends: [{
    keyword, trendScore (0-100), growthRate (%), searchVolume,
    competitionLevel, seasonality, peakMonths[], relatedKeywords[],
    avgPrice, profitPotential, recommendedAction
  }],
  summary: "brief market overview"
}`
    );

    // Cache results
    response.trends?.forEach(trend => {
      this.trendCache.set(trend.keyword, {
        data: trend,
        timestamp: Date.now(),
      });
    });

    return response;
  }

  private async analyzeNiche(input: Record<string, any>): Promise<NicheAnalysis> {
    const response = await this.client.chatJSON<NicheAnalysis>(
      this.config.model,
      this.config.systemPrompt,
      `Deep analysis of this Etsy niche: "${input.niche}"

Consider:
- Current demand and growth trajectory
- Competition intensity
- Average pricing and profit margins
- Seasonal factors
- Required skills/resources

Return JSON: {
  niche, overallScore (0-100),
  trends: [top 5 trends in this niche],
  topProducts: [top selling product types],
  marketGaps: [underserved sub-niches],
  entryBarrier, estimatedMonthlyRevenue: {min, max},
  recommendations: [3-5 actionable recommendations]
}`
    );

    return response;
  }

  private async seasonalForecast(input: Record<string, any>): Promise<{
    forecasts: SeasonalForecast[];
  }> {
    const months = input.monthsAhead || 3;
    const response = await this.client.chatJSON<{ forecasts: SeasonalForecast[] }>(
      this.config.model,
      this.config.systemPrompt,
      `Create a ${months}-month seasonal forecast for Etsy POD products.
Starting from current month.
Niches to track: ${input.niches?.join(', ') || 'all popular POD niches'}

Return JSON: {
  forecasts: [{
    month, trendingNiches[], decliningNiches[],
    upcomingEvents[], recommendedActions[]
  }]
}`
    );

    return response;
  }

  private async dailyTrendCheck(input: Record<string, any>): Promise<{
    newTrends: TrendData[];
    risingTrends: string[];
    decliningTrends: string[];
    alerts: string[];
  }> {
    const response = await this.client.chatJSON<{
      newTrends: TrendData[];
      risingTrends: string[];
      decliningTrends: string[];
      alerts: string[];
    }>(
      this.config.model,
      this.config.systemPrompt,
      `Daily trend check for Etsy POD marketplace.
Tracked niches: ${input.trackedNiches?.join(', ') || 'general POD'}
Previous top trends: ${Array.from(this.trendCache.keys()).slice(0, 10).join(', ')}

Identify: new trends, rising trends, declining trends, and any market alerts.
Return JSON: { newTrends[], risingTrends[], decliningTrends[], alerts[] }`
    );

    return response;
  }

  private async findEmergingTrends(input: Record<string, any>): Promise<{
    emerging: TrendData[];
    signals: string[];
  }> {
    const response = await this.client.chatJSON<{
      emerging: TrendData[];
      signals: string[];
    }>(
      this.config.model,
      this.config.systemPrompt,
      `Find emerging trends that haven't gone mainstream yet on Etsy.
Focus: ${input.focus || 'POD products'}
Look for signals from: social media, pop culture, upcoming events, seasonal shifts.

Return JSON: {
  emerging: [trend data for 5 emerging trends],
  signals: [what signals indicate these trends are emerging]
}`
    );

    return response;
  }

  // === Helpers ===

  private getCachedTrends(): { data: TrendData; timestamp: number }[] {
    return Array.from(this.trendCache.values());
  }

  private getSeason(month: number): string {
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  }

  private getUpcomingHolidays(): string[] {
    const month = new Date().getMonth() + 1;
    const holidays: Record<number, string[]> = {
      1: ["Valentine's Day prep", 'Super Bowl'],
      2: ["Valentine's Day", "Presidents' Day"],
      3: ["St. Patrick's Day", 'Spring Break', "Mother's Day prep"],
      4: ['Easter', "Mother's Day prep"],
      5: ["Mother's Day", 'Memorial Day', "Father's Day prep"],
      6: ["Father's Day", 'Graduation', 'Summer'],
      7: ['4th of July', 'Back to School prep'],
      8: ['Back to School', 'Labor Day prep'],
      9: ['Labor Day', 'Halloween prep', 'Fall'],
      10: ['Halloween', 'Thanksgiving prep', 'Christmas prep'],
      11: ['Thanksgiving', 'Black Friday', 'Cyber Monday', 'Christmas prep'],
      12: ['Christmas', "New Year's", 'Holiday gifts'],
    };
    return holidays[month] || [];
  }
}
