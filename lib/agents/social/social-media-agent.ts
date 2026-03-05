/**
 * Social Media Automation Agent
 * Creates and manages social media content across platforms
 * Drives traffic to Etsy/Shopify stores
 */

import { BaseAgent, AgentConfig, AgentTask } from '../core/base-agent';
import { MODEL_ASSIGNMENTS } from '../../services/openrouter/client';

export interface SocialPost {
  platform: 'pinterest' | 'instagram' | 'tiktok' | 'facebook' | 'twitter';
  type: 'image' | 'carousel' | 'video_script' | 'story' | 'reel' | 'pin';
  caption: string;
  hashtags: string[];
  callToAction: string;
  imagePrompt: string;
  scheduledTime?: string;
  targetAudience: string;
  productLink: string;
}

export interface ContentCalendar {
  week: number;
  posts: SocialPost[];
  theme: string;
  goals: string[];
}

export interface CampaignPlan {
  name: string;
  duration: string;
  platforms: string[];
  posts: SocialPost[];
  budget: number;
  expectedReach: number;
  kpis: { metric: string; target: number }[];
}

export interface PinterestPin {
  title: string;
  description: string;
  altText: string;
  board: string;
  keywords: string[];
  imagePrompt: string;
  linkUrl: string;
  richPinType: 'product' | 'article' | 'recipe';
}

export class SocialMediaAgent extends BaseAgent {
  private contentHistory: Map<string, SocialPost[]> = new Map();

  constructor() {
    const config: AgentConfig = {
      id: 'agent-social',
      name: 'Social Media Automator',
      description: 'Creates and manages social media content to drive traffic to stores',
      model: MODEL_ASSIGNMENTS.SOCIAL_MEDIA,
      systemPrompt: `You are a social media marketing expert for POD e-commerce businesses.

Your expertise:
1. Pinterest Marketing (PRIMARY - #1 traffic source for Etsy)
   - SEO-optimized pins with keyword-rich descriptions
   - Multiple boards per niche
   - Pin scheduling (5-15 pins/day)
   - Rich Pins for product listings
   - Idea Pins for engagement

2. Instagram Marketing
   - Product showcase posts
   - Behind-the-scenes stories
   - Reels for viral potential
   - Shoppable posts
   - Hashtag strategy (30 per post, mix of sizes)

3. TikTok Marketing
   - Trending sound integration
   - Product reveal videos
   - POD behind-the-scenes content
   - Duet/stitch strategy

4. Facebook
   - Group marketing
   - Marketplace listings
   - Targeted ads copy

Content rules:
- Never use copyrighted music suggestions
- Include clear CTAs (call to action)
- Use platform-appropriate content lengths
- Hashtags tailored per platform
- Schedule at peak engagement times
- Maintain consistent brand voice
- PINTEREST is the #1 priority for Etsy traffic

Output structured JSON.`,
      rules: [
        {
          id: 'social-no-spam',
          name: 'Anti-Spam',
          description: 'Never post more than platform limits allow',
          condition: '*',
          action: 'Pinterest: max 25 pins/day, Instagram: max 3 posts/day, TikTok: max 3/day',
          priority: 'critical',
          enabled: true,
        },
        {
          id: 'social-unique-content',
          name: 'Unique Content',
          description: 'No duplicate content across platforms',
          condition: '*',
          action: 'Adapt content for each platform, never copy-paste',
          priority: 'high',
          enabled: true,
        },
        {
          id: 'social-pinterest-first',
          name: 'Pinterest Priority',
          description: 'Pinterest is primary traffic driver for Etsy',
          condition: '*',
          action: 'Allocate 50%+ of social effort to Pinterest',
          priority: 'high',
          enabled: true,
        },
        {
          id: 'social-cta-required',
          name: 'CTA Required',
          description: 'Every post must have a call to action',
          condition: '*',
          action: 'Include link to shop or product in every post',
          priority: 'medium',
          enabled: true,
        },
      ],
      maxConcurrentTasks: 3,
      retryPolicy: { maxRetries: 2, backoffMs: 2000, backoffMultiplier: 2 },
      rateLimit: { maxRequestsPerMinute: 15, maxTokensPerMinute: 80000 },
    };

    super(config);
  }

  protected async observe(task: AgentTask): Promise<Record<string, any>> {
    return {
      taskType: task.type,
      input: task.input,
      contentHistorySize: this.contentHistory.size,
      dependencyResults: task.input.dependencyResults || {},
    };
  }

  protected async act(plan: string, task: AgentTask): Promise<any> {
    switch (task.type) {
      case 'create_launch_campaign':
        return this.createLaunchCampaign(task.input);

      case 'daily_post':
        return this.dailyPost(task.input);

      case 'create_content_calendar':
        return this.createContentCalendar(task.input);

      case 'generate_pinterest_pins':
        return this.generatePinterestPins(task.input);

      case 'generate_instagram_content':
        return this.generateInstagramContent(task.input);

      case 'generate_tiktok_scripts':
        return this.generateTikTokScripts(task.input);

      default:
        return { status: 'unknown_task' };
    }
  }

  private async createLaunchCampaign(input: Record<string, any>): Promise<CampaignPlan> {
    const listingData = input.dependencyResults?.['step-2'] || {};
    const seoData = input.dependencyResults?.['step-3'] || {};

    const response = await this.client.chatJSON<CampaignPlan>(
      this.config.model,
      this.config.systemPrompt,
      `Create a product launch social media campaign:
Product: ${JSON.stringify(listingData).slice(0, 500)}
SEO keywords: ${JSON.stringify(seoData).slice(0, 300)}
Niche: ${input.niche || 'POD'}
Budget: ${input.budget || 0} (organic if 0)
Duration: ${input.duration || '1 week'}

Create a multi-platform campaign. Focus on Pinterest for Etsy traffic.
Return JSON: {
  name, duration, platforms[],
  posts: [10-15 posts across platforms with: platform, type, caption, hashtags[], callToAction, imagePrompt, scheduledTime, targetAudience, productLink],
  budget, expectedReach,
  kpis: [{ metric, target }]
}`
    );

    // Store in history
    response.posts?.forEach(post => {
      if (!this.contentHistory.has(post.platform)) {
        this.contentHistory.set(post.platform, []);
      }
      this.contentHistory.get(post.platform)!.push(post);
    });

    return response;
  }

  private async dailyPost(input: Record<string, any>): Promise<{
    posts: SocialPost[];
    schedule: { time: string; platform: string; postIndex: number }[];
  }> {
    const trendData = input.dependencyResults?.['step-0'] || {};

    const response = await this.client.chatJSON<{
      posts: SocialPost[];
      schedule: { time: string; platform: string; postIndex: number }[];
    }>(
      this.config.model,
      this.config.systemPrompt,
      `Generate daily social media posts:
Today's trends: ${JSON.stringify(trendData).slice(0, 400)}
Products to promote: ${JSON.stringify(input.products || []).slice(0, 400)}
Previous posts (avoid repeats): ${this.getRecentCaptions().join(' | ')}

Generate 5-8 posts for today (prioritize Pinterest).
Return JSON: {
  posts: [{ platform, type, caption, hashtags[], callToAction, imagePrompt, targetAudience, productLink }],
  schedule: [{ time (HH:MM EST), platform, postIndex }]
}`
    );

    return response;
  }

  private async createContentCalendar(input: Record<string, any>): Promise<{
    calendar: ContentCalendar[];
  }> {
    const response = await this.client.chatJSON<{ calendar: ContentCalendar[] }>(
      this.config.model,
      this.config.systemPrompt,
      `Create a ${input.weeks || 4}-week content calendar:
Niche: ${input.niche}
Products: ${JSON.stringify(input.products || []).slice(0, 400)}
Platforms: ${input.platforms?.join(', ') || 'Pinterest, Instagram, TikTok'}
Goals: ${input.goals?.join(', ') || 'drive traffic to Etsy store'}

Return JSON: {
  calendar: [{
    week (1-4),
    posts: [7+ posts with full details],
    theme,
    goals[]
  }]
}`
    );

    return response;
  }

  private async generatePinterestPins(input: Record<string, any>): Promise<{
    pins: PinterestPin[];
  }> {
    const response = await this.client.chatJSON<{ pins: PinterestPin[] }>(
      this.config.model,
      this.config.systemPrompt,
      `Generate ${input.count || 10} Pinterest pins for:
Product: ${input.productTitle || input.niche}
Niche: ${input.niche}
Shop URL: ${input.shopUrl || 'https://etsy.com/shop/example'}

Pinterest SEO is CRITICAL. Use keyword-rich titles and descriptions.
Return JSON: {
  pins: [{
    title (max 100 chars, keyword-rich),
    description (max 500 chars, natural keyword integration),
    altText,
    board (suggested board name),
    keywords[] (for Pinterest SEO),
    imagePrompt (detailed prompt for AI image generation),
    linkUrl,
    richPinType: "product"
  }]
}`
    );

    return response;
  }

  private async generateInstagramContent(input: Record<string, any>): Promise<{
    posts: SocialPost[];
    stories: SocialPost[];
    reels: SocialPost[];
  }> {
    const response = await this.client.chatJSON<{
      posts: SocialPost[];
      stories: SocialPost[];
      reels: SocialPost[];
    }>(
      this.config.model,
      this.config.systemPrompt,
      `Generate Instagram content for:
Niche: ${input.niche}
Products: ${JSON.stringify(input.products || []).slice(0, 400)}

Return JSON: {
  posts: [3 feed posts with captions, 30 hashtags each],
  stories: [5 story ideas with descriptions],
  reels: [2 reel concepts with scripts]
}
Each item should have: platform: "instagram", type, caption, hashtags[], callToAction, imagePrompt, targetAudience, productLink`
    );

    return response;
  }

  private async generateTikTokScripts(input: Record<string, any>): Promise<{
    scripts: { title: string; hook: string; script: string; duration: string; trending_sound: string; hashtags: string[] }[];
  }> {
    const response = await this.client.chatJSON<{
      scripts: { title: string; hook: string; script: string; duration: string; trending_sound: string; hashtags: string[] }[];
    }>(
      this.config.model,
      this.config.systemPrompt,
      `Generate ${input.count || 3} TikTok video scripts for:
Niche: ${input.niche}
Product type: ${input.productType || 'POD products'}

Focus on: product reveals, behind-the-scenes, trending formats
Return JSON: {
  scripts: [{
    title, hook (first 3 seconds - CRITICAL),
    script (full narration/action breakdown),
    duration (15s/30s/60s),
    trending_sound (genre suggestion, not specific copyrighted songs),
    hashtags[]
  }]
}`
    );

    return response;
  }

  private getRecentCaptions(): string[] {
    const all: string[] = [];
    this.contentHistory.forEach(posts => {
      posts.slice(-5).forEach(p => all.push(p.caption.slice(0, 50)));
    });
    return all.slice(-10);
  }
}
