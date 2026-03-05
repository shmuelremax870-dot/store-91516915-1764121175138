/**
 * MCP Tool Executor
 * Executes MCP tools with permission checks, rate limiting, and audit logging
 */

import { findMCPTool, MCPTool, MCPServer } from './mcp-config';

export interface MCPExecutionResult {
  success: boolean;
  toolName: string;
  serverId: string;
  input: Record<string, any>;
  output: any;
  executionTimeMs: number;
  timestamp: number;
  error?: string;
}

export interface MCPAuditEntry {
  timestamp: number;
  agentId: string;
  toolName: string;
  serverId: string;
  input: Record<string, any>;
  result: 'success' | 'failure' | 'denied';
  error?: string;
  executionTimeMs: number;
}

class MCPRateLimiter {
  private counters: Map<string, { minute: number[]; hour: number[] }> = new Map();

  check(toolName: string, limits: { maxPerMinute: number; maxPerHour: number }): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const oneHourAgo = now - 3600000;

    if (!this.counters.has(toolName)) {
      this.counters.set(toolName, { minute: [], hour: [] });
    }

    const counter = this.counters.get(toolName)!;

    // Clean old entries
    counter.minute = counter.minute.filter(t => t > oneMinuteAgo);
    counter.hour = counter.hour.filter(t => t > oneHourAgo);

    // Check limits
    if (counter.minute.length >= limits.maxPerMinute) return false;
    if (counter.hour.length >= limits.maxPerHour) return false;

    // Record this request
    counter.minute.push(now);
    counter.hour.push(now);

    return true;
  }

  getUsage(toolName: string): { minuteUsage: number; hourUsage: number } {
    const counter = this.counters.get(toolName);
    if (!counter) return { minuteUsage: 0, hourUsage: 0 };

    const now = Date.now();
    return {
      minuteUsage: counter.minute.filter(t => t > now - 60000).length,
      hourUsage: counter.hour.filter(t => t > now - 3600000).length,
    };
  }
}

export class MCPExecutor {
  private rateLimiter: MCPRateLimiter;
  private auditLog: MCPAuditEntry[] = [];
  private grantedPermissions: Map<string, Set<string>> = new Map(); // agentId -> permissions

  constructor() {
    this.rateLimiter = new MCPRateLimiter();
  }

  // Grant permissions to an agent
  grantPermissions(agentId: string, permissions: string[]): void {
    if (!this.grantedPermissions.has(agentId)) {
      this.grantedPermissions.set(agentId, new Set());
    }
    permissions.forEach(p => this.grantedPermissions.get(agentId)!.add(p));
  }

  // Check if agent has required permissions
  private hasPermission(agentId: string, requiredPermissions: string[]): boolean {
    const granted = this.grantedPermissions.get(agentId);
    if (!granted) return false;
    return requiredPermissions.every(p => granted.has(p));
  }

  // Execute an MCP tool
  async execute(
    agentId: string,
    toolName: string,
    input: Record<string, any>
  ): Promise<MCPExecutionResult> {
    const startTime = Date.now();
    const found = findMCPTool(toolName);

    if (!found) {
      return this.failResult(toolName, 'unknown', input, `Tool not found: ${toolName}`, startTime);
    }

    const { server, tool } = found;

    // Permission check
    if (!this.hasPermission(agentId, tool.requiredPermissions)) {
      this.logAudit(agentId, toolName, server.id, input, 'denied', 'Insufficient permissions');
      return this.failResult(toolName, server.id, input,
        `Permission denied. Required: ${tool.requiredPermissions.join(', ')}`, startTime);
    }

    // Rate limit check
    if (!this.rateLimiter.check(toolName, tool.rateLimit)) {
      this.logAudit(agentId, toolName, server.id, input, 'denied', 'Rate limit exceeded');
      return this.failResult(toolName, server.id, input, 'Rate limit exceeded', startTime);
    }

    // Validate input
    const validationError = this.validateInput(input, tool.inputSchema);
    if (validationError) {
      this.logAudit(agentId, toolName, server.id, input, 'failure', validationError);
      return this.failResult(toolName, server.id, input, validationError, startTime);
    }

    try {
      // Execute the tool (in production, this routes to actual API handlers)
      const output = await this.routeToHandler(tool.handler, input);

      this.logAudit(agentId, toolName, server.id, input, 'success');

      return {
        success: true,
        toolName,
        serverId: server.id,
        input,
        output,
        executionTimeMs: Date.now() - startTime,
        timestamp: Date.now(),
      };
    } catch (error: any) {
      this.logAudit(agentId, toolName, server.id, input, 'failure', error.message);
      return this.failResult(toolName, server.id, input, error.message, startTime);
    }
  }

  // Route to appropriate handler
  private async routeToHandler(handler: string, input: Record<string, any>): Promise<any> {
    const [service, method] = handler.split('.');

    // In production, these would be actual API calls
    // For now, return structured mock responses
    const handlers: Record<string, Record<string, (input: any) => any>> = {
      etsy: {
        createListing: (i) => ({ listingId: `etsy-${Date.now()}`, status: 'active', ...i }),
        updateListing: (i) => ({ updated: true, listingId: i.listingId }),
        getListings: (i) => ({ listings: [], total: 0, shopId: i.shopId }),
        getShopStats: (i) => ({ views: 0, favorites: 0, orders: 0, revenue: 0 }),
        getOrders: (i) => ({ orders: [], total: 0 }),
      },
      shopify: {
        createProduct: (i) => ({ productId: `shop-${Date.now()}`, status: 'active', ...i }),
        syncInventory: (i) => ({ synced: 0, errors: 0 }),
        getAnalytics: (i) => ({ metric: i.metric, value: 0, period: i.period }),
      },
      pod: {
        createProduct: (i) => ({ productId: `pod-${Date.now()}`, provider: i.provider }),
        getCatalog: (i) => ({ products: [], provider: i.provider }),
        calculateCost: (i) => ({ cost: 0, shipping: 0, total: 0 }),
        createOrder: (i) => ({ orderId: `order-${Date.now()}`, status: 'submitted' }),
      },
      scraper: {
        scrapeUrl: (i) => ({ html: '', url: i.url, status: 200 }),
        scrapeSearch: (i) => ({ results: [], query: i.query, total: 0 }),
        scrapeShop: (i) => ({ shop: {}, listings: [], reviews: [] }),
      },
      imagegen: {
        generateDesign: (i) => ({ imageUrl: `https://generated.example/${Date.now()}.png`, prompt: i.prompt }),
        generateMockup: (i) => ({ mockupUrl: `https://mockup.example/${Date.now()}.png` }),
        generateSocialImage: (i) => ({ imageUrl: `https://social.example/${Date.now()}.png` }),
      },
      data: {
        query: (i) => ({ results: [], total: 0, entity: i.entity }),
        analyticsReport: (i) => ({ report: {}, type: i.reportType }),
      },
      notify: {
        send: (i) => ({ sent: true, channel: i.channel, id: `notif-${Date.now()}` }),
        alert: (i) => ({ alerted: true, type: i.type, id: `alert-${Date.now()}` }),
      },
    };

    const serviceHandlers = handlers[service];
    if (!serviceHandlers || !serviceHandlers[method]) {
      throw new Error(`Handler not implemented: ${handler}`);
    }

    return serviceHandlers[method](input);
  }

  // Simple input validation
  private validateInput(input: Record<string, any>, schema: Record<string, any>): string | null {
    if (!schema.required) return null;

    for (const field of schema.required) {
      if (!(field in input)) {
        return `Missing required field: ${field}`;
      }
    }

    return null;
  }

  private failResult(
    toolName: string, serverId: string, input: Record<string, any>,
    error: string, startTime: number
  ): MCPExecutionResult {
    return {
      success: false,
      toolName,
      serverId,
      input,
      output: null,
      executionTimeMs: Date.now() - startTime,
      timestamp: Date.now(),
      error,
    };
  }

  private logAudit(
    agentId: string, toolName: string, serverId: string,
    input: Record<string, any>, result: 'success' | 'failure' | 'denied',
    error?: string
  ): void {
    this.auditLog.push({
      timestamp: Date.now(),
      agentId,
      toolName,
      serverId,
      input,
      result,
      error,
      executionTimeMs: 0,
    });

    // Keep audit log bounded
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000);
    }
  }

  getAuditLog(filters?: { agentId?: string; toolName?: string; result?: string }): MCPAuditEntry[] {
    let log = this.auditLog;
    if (filters?.agentId) log = log.filter(e => e.agentId === filters.agentId);
    if (filters?.toolName) log = log.filter(e => e.toolName === filters.toolName);
    if (filters?.result) log = log.filter(e => e.result === filters.result);
    return log;
  }

  getRateLimitStatus(toolName: string): { minuteUsage: number; hourUsage: number } {
    return this.rateLimiter.getUsage(toolName);
  }
}

// Singleton
let executorInstance: MCPExecutor | null = null;

export function getMCPExecutor(): MCPExecutor {
  if (!executorInstance) {
    executorInstance = new MCPExecutor();
  }
  return executorInstance;
}
