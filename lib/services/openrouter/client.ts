/**
 * OpenRouter API Client
 * Provides free AI model access through OpenRouter's API
 * Supports multiple models: Llama, Mistral, Gemma, DeepSeek, etc.
 */

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  response_format?: { type: 'json_object' } | { type: 'text' };
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterModel {
  id: string;
  name: string;
  contextLength: number;
  pricing: { prompt: number; completion: number };
  isFree: boolean;
}

// Free models available on OpenRouter
export const FREE_MODELS = {
  // Meta Llama
  LLAMA_3_8B: 'meta-llama/llama-3-8b-instruct:free',
  LLAMA_3_1_8B: 'meta-llama/llama-3.1-8b-instruct:free',
  LLAMA_3_2_3B: 'meta-llama/llama-3.2-3b-instruct:free',
  LLAMA_3_2_1B: 'meta-llama/llama-3.2-1b-instruct:free',

  // Mistral
  MISTRAL_7B: 'mistralai/mistral-7b-instruct:free',

  // Google Gemma
  GEMMA_2_9B: 'google/gemma-2-9b-it:free',

  // DeepSeek
  DEEPSEEK_R1_ZERO: 'deepseek/deepseek-r1-distill-llama-8b:free',

  // Qwen
  QWEN_2_7B: 'qwen/qwen-2-7b-instruct:free',

  // Phi
  PHI_3_MINI: 'microsoft/phi-3-mini-128k-instruct:free',
  PHI_3_MEDIUM: 'microsoft/phi-3-medium-128k-instruct:free',
} as const;

// Model assignments per task type
export const MODEL_ASSIGNMENTS = {
  // Product listing generation - needs creativity
  PRODUCT_LISTING: FREE_MODELS.LLAMA_3_1_8B,

  // SEO optimization - needs analytical thinking
  SEO_OPTIMIZATION: FREE_MODELS.MISTRAL_7B,

  // Pricing analysis - needs reasoning
  PRICING_ANALYSIS: FREE_MODELS.DEEPSEEK_R1_ZERO,

  // Trend detection - needs pattern recognition
  TREND_DETECTION: FREE_MODELS.GEMMA_2_9B,

  // Social media content - needs creativity
  SOCIAL_MEDIA: FREE_MODELS.LLAMA_3_1_8B,

  // Data extraction from scraped pages
  DATA_EXTRACTION: FREE_MODELS.PHI_3_MINI,

  // General assistant / orchestration
  ORCHESTRATOR: FREE_MODELS.LLAMA_3_1_8B,

  // Quick classification tasks
  CLASSIFIER: FREE_MODELS.LLAMA_3_2_3B,

  // Translation / multilingual
  TRANSLATION: FREE_MODELS.QWEN_2_7B,
} as const;

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;
  private rateLimitDelay: number;
  private lastRequestTime: number;
  private requestCount: number;
  private maxRequestsPerMinute: number;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.rateLimitDelay = 1000; // 1 second between requests for free tier
    this.lastRequestTime = 0;
    this.requestCount = 0;
    this.maxRequestsPerMinute = 20; // Free tier limit
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve =>
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  async chat(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    await this.enforceRateLimit();

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
        'X-Title': 'Etsy Dropshipping Platform',
      },
      body: JSON.stringify({
        model: request.model,
        messages: request.messages,
        max_tokens: request.max_tokens || 2048,
        temperature: request.temperature ?? 0.7,
        top_p: request.top_p ?? 0.9,
        stream: request.stream ?? false,
        ...(request.response_format && { response_format: request.response_format }),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new OpenRouterError(
        `OpenRouter API error: ${response.status} - ${error}`,
        response.status
      );
    }

    return response.json();
  }

  async chatJSON<T = Record<string, unknown>>(
    model: string,
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.3
  ): Promise<T> {
    const response = await this.chat({
      model,
      messages: [
        { role: 'system', content: systemPrompt + '\n\nYou MUST respond with valid JSON only. No markdown, no code blocks, just raw JSON.' },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    try {
      return JSON.parse(content) as T;
    } catch {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as T;
      }
      throw new OpenRouterError('Failed to parse JSON response', 0);
    }
  }

  async getAvailableModels(): Promise<OpenRouterModel[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new OpenRouterError('Failed to fetch models', response.status);
    }

    const data = await response.json();
    return data.data
      .filter((m: any) => m.id.includes(':free'))
      .map((m: any) => ({
        id: m.id,
        name: m.name,
        contextLength: m.context_length,
        pricing: m.pricing,
        isFree: true,
      }));
  }

  async getUsage(): Promise<{ totalTokens: number; requestCount: number }> {
    return {
      totalTokens: 0, // Free tier tracking
      requestCount: this.requestCount,
    };
  }
}

export class OpenRouterError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'OpenRouterError';
    this.statusCode = statusCode;
  }
}

// Singleton instance
let clientInstance: OpenRouterClient | null = null;

export function getOpenRouterClient(): OpenRouterClient {
  if (!clientInstance) {
    clientInstance = new OpenRouterClient();
  }
  return clientInstance;
}
