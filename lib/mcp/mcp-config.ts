/**
 * MCP (Model Context Protocol) Server Configuration
 * Defines all MCP tools available to agents for interacting with external systems
 */

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  handler: string; // Reference to handler function
  requiredPermissions: string[];
  rateLimit: { maxPerMinute: number; maxPerHour: number };
}

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  version: string;
  tools: MCPTool[];
  enabled: boolean;
}

// === MCP Server Definitions ===

export const MCP_SERVERS: MCPServer[] = [
  // 1. Etsy API MCP Server
  {
    id: 'mcp-etsy',
    name: 'Etsy API Server',
    description: 'Interfaces with Etsy Open API v3 for store and listing management',
    version: '1.0.0',
    enabled: true,
    tools: [
      {
        name: 'etsy_create_listing',
        description: 'Create a new product listing on Etsy',
        inputSchema: {
          type: 'object',
          properties: {
            shopId: { type: 'string' },
            title: { type: 'string', maxLength: 140 },
            description: { type: 'string' },
            price: { type: 'number' },
            quantity: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' }, maxItems: 13 },
            categoryId: { type: 'number' },
            images: { type: 'array', items: { type: 'string' } },
          },
          required: ['shopId', 'title', 'description', 'price', 'quantity', 'tags'],
        },
        handler: 'etsy.createListing',
        requiredPermissions: ['listings_w'],
        rateLimit: { maxPerMinute: 5, maxPerHour: 100 },
      },
      {
        name: 'etsy_update_listing',
        description: 'Update an existing Etsy listing',
        inputSchema: {
          type: 'object',
          properties: {
            listingId: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
          },
          required: ['listingId'],
        },
        handler: 'etsy.updateListing',
        requiredPermissions: ['listings_w'],
        rateLimit: { maxPerMinute: 10, maxPerHour: 200 },
      },
      {
        name: 'etsy_get_listings',
        description: 'Get listings for a shop',
        inputSchema: {
          type: 'object',
          properties: {
            shopId: { type: 'string' },
            state: { type: 'string', enum: ['active', 'inactive', 'draft'] },
            limit: { type: 'number', maximum: 100 },
            offset: { type: 'number' },
          },
          required: ['shopId'],
        },
        handler: 'etsy.getListings',
        requiredPermissions: ['listings_r'],
        rateLimit: { maxPerMinute: 20, maxPerHour: 500 },
      },
      {
        name: 'etsy_get_shop_stats',
        description: 'Get shop statistics and analytics',
        inputSchema: {
          type: 'object',
          properties: {
            shopId: { type: 'string' },
            period: { type: 'string', enum: ['day', 'week', 'month', 'year'] },
          },
          required: ['shopId'],
        },
        handler: 'etsy.getShopStats',
        requiredPermissions: ['shops_r'],
        rateLimit: { maxPerMinute: 10, maxPerHour: 100 },
      },
      {
        name: 'etsy_get_orders',
        description: 'Get orders for a shop',
        inputSchema: {
          type: 'object',
          properties: {
            shopId: { type: 'string' },
            status: { type: 'string', enum: ['open', 'completed', 'cancelled'] },
            limit: { type: 'number' },
          },
          required: ['shopId'],
        },
        handler: 'etsy.getOrders',
        requiredPermissions: ['transactions_r'],
        rateLimit: { maxPerMinute: 10, maxPerHour: 200 },
      },
    ],
  },

  // 2. Shopify API MCP Server
  {
    id: 'mcp-shopify',
    name: 'Shopify API Server',
    description: 'Interfaces with Shopify Admin API for store mirroring',
    version: '1.0.0',
    enabled: true,
    tools: [
      {
        name: 'shopify_create_product',
        description: 'Create a product on Shopify',
        inputSchema: {
          type: 'object',
          properties: {
            shopDomain: { type: 'string' },
            title: { type: 'string' },
            body_html: { type: 'string' },
            vendor: { type: 'string' },
            product_type: { type: 'string' },
            tags: { type: 'string' },
            variants: { type: 'array' },
            images: { type: 'array' },
          },
          required: ['shopDomain', 'title', 'body_html'],
        },
        handler: 'shopify.createProduct',
        requiredPermissions: ['write_products'],
        rateLimit: { maxPerMinute: 10, maxPerHour: 200 },
      },
      {
        name: 'shopify_sync_inventory',
        description: 'Sync inventory between Etsy and Shopify',
        inputSchema: {
          type: 'object',
          properties: {
            etsyShopId: { type: 'string' },
            shopifyDomain: { type: 'string' },
            direction: { type: 'string', enum: ['etsy_to_shopify', 'shopify_to_etsy', 'bidirectional'] },
          },
          required: ['etsyShopId', 'shopifyDomain'],
        },
        handler: 'shopify.syncInventory',
        requiredPermissions: ['write_inventory'],
        rateLimit: { maxPerMinute: 5, maxPerHour: 50 },
      },
      {
        name: 'shopify_get_analytics',
        description: 'Get Shopify store analytics',
        inputSchema: {
          type: 'object',
          properties: {
            shopDomain: { type: 'string' },
            metric: { type: 'string', enum: ['orders', 'revenue', 'visitors', 'conversion'] },
            period: { type: 'string' },
          },
          required: ['shopDomain'],
        },
        handler: 'shopify.getAnalytics',
        requiredPermissions: ['read_analytics'],
        rateLimit: { maxPerMinute: 10, maxPerHour: 100 },
      },
    ],
  },

  // 3. POD Providers MCP Server
  {
    id: 'mcp-pod',
    name: 'POD Integration Server',
    description: 'Interfaces with Printful, Printify, Gooten, and SPOD',
    version: '1.0.0',
    enabled: true,
    tools: [
      {
        name: 'pod_create_product',
        description: 'Create a product on a POD provider',
        inputSchema: {
          type: 'object',
          properties: {
            provider: { type: 'string', enum: ['printful', 'printify', 'gooten', 'spod'] },
            productType: { type: 'string' },
            designUrl: { type: 'string' },
            variants: { type: 'array' },
            mockupStyle: { type: 'string' },
          },
          required: ['provider', 'productType', 'designUrl'],
        },
        handler: 'pod.createProduct',
        requiredPermissions: ['products_w'],
        rateLimit: { maxPerMinute: 5, maxPerHour: 100 },
      },
      {
        name: 'pod_get_catalog',
        description: 'Get available products from POD provider',
        inputSchema: {
          type: 'object',
          properties: {
            provider: { type: 'string', enum: ['printful', 'printify', 'gooten', 'spod'] },
            category: { type: 'string' },
          },
          required: ['provider'],
        },
        handler: 'pod.getCatalog',
        requiredPermissions: ['catalog_r'],
        rateLimit: { maxPerMinute: 10, maxPerHour: 200 },
      },
      {
        name: 'pod_calculate_cost',
        description: 'Calculate production and shipping costs',
        inputSchema: {
          type: 'object',
          properties: {
            provider: { type: 'string' },
            productType: { type: 'string' },
            quantity: { type: 'number' },
            destination: { type: 'string' },
          },
          required: ['provider', 'productType'],
        },
        handler: 'pod.calculateCost',
        requiredPermissions: ['catalog_r'],
        rateLimit: { maxPerMinute: 20, maxPerHour: 500 },
      },
      {
        name: 'pod_create_order',
        description: 'Submit an order to POD provider',
        inputSchema: {
          type: 'object',
          properties: {
            provider: { type: 'string' },
            productId: { type: 'string' },
            quantity: { type: 'number' },
            shippingAddress: { type: 'object' },
            designUrl: { type: 'string' },
          },
          required: ['provider', 'productId', 'quantity', 'shippingAddress'],
        },
        handler: 'pod.createOrder',
        requiredPermissions: ['orders_w'],
        rateLimit: { maxPerMinute: 5, maxPerHour: 50 },
      },
    ],
  },

  // 4. Web Scraping MCP Server
  {
    id: 'mcp-scraper',
    name: 'Web Scraping Server',
    description: 'Controlled web scraping with proxy rotation and rate limiting',
    version: '1.0.0',
    enabled: true,
    tools: [
      {
        name: 'scrape_url',
        description: 'Scrape a single URL with proxy rotation',
        inputSchema: {
          type: 'object',
          properties: {
            url: { type: 'string' },
            selector: { type: 'string' },
            waitForSelector: { type: 'string' },
            proxy: { type: 'boolean' },
            javascript: { type: 'boolean' },
          },
          required: ['url'],
        },
        handler: 'scraper.scrapeUrl',
        requiredPermissions: ['scrape'],
        rateLimit: { maxPerMinute: 10, maxPerHour: 100 },
      },
      {
        name: 'scrape_search',
        description: 'Scrape search results from Etsy',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string' },
            page: { type: 'number' },
            sortBy: { type: 'string' },
            filters: { type: 'object' },
          },
          required: ['query'],
        },
        handler: 'scraper.scrapeSearch',
        requiredPermissions: ['scrape'],
        rateLimit: { maxPerMinute: 5, maxPerHour: 50 },
      },
      {
        name: 'scrape_shop',
        description: 'Scrape an Etsy shop page',
        inputSchema: {
          type: 'object',
          properties: {
            shopName: { type: 'string' },
            includeReviews: { type: 'boolean' },
            includeStats: { type: 'boolean' },
          },
          required: ['shopName'],
        },
        handler: 'scraper.scrapeShop',
        requiredPermissions: ['scrape'],
        rateLimit: { maxPerMinute: 3, maxPerHour: 30 },
      },
    ],
  },

  // 5. AI Image Generation MCP Server
  {
    id: 'mcp-image-gen',
    name: 'AI Image Generation Server',
    description: 'Generates product images, mockups, and social media visuals',
    version: '1.0.0',
    enabled: true,
    tools: [
      {
        name: 'generate_design',
        description: 'Generate a product design using AI',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string' },
            style: { type: 'string', enum: ['minimalist', 'vintage', 'modern', 'bold', 'watercolor', 'typography'] },
            size: { type: 'string', enum: ['1024x1024', '1024x1792', '1792x1024'] },
            format: { type: 'string', enum: ['png', 'svg'] },
          },
          required: ['prompt'],
        },
        handler: 'imagegen.generateDesign',
        requiredPermissions: ['generate'],
        rateLimit: { maxPerMinute: 5, maxPerHour: 50 },
      },
      {
        name: 'generate_mockup',
        description: 'Place a design onto a product mockup',
        inputSchema: {
          type: 'object',
          properties: {
            designUrl: { type: 'string' },
            productType: { type: 'string' },
            color: { type: 'string' },
            angle: { type: 'string', enum: ['front', 'back', 'side', 'lifestyle'] },
          },
          required: ['designUrl', 'productType'],
        },
        handler: 'imagegen.generateMockup',
        requiredPermissions: ['generate'],
        rateLimit: { maxPerMinute: 10, maxPerHour: 100 },
      },
      {
        name: 'generate_social_image',
        description: 'Generate social media graphics',
        inputSchema: {
          type: 'object',
          properties: {
            platform: { type: 'string', enum: ['pinterest', 'instagram', 'facebook', 'tiktok'] },
            type: { type: 'string', enum: ['post', 'story', 'pin', 'cover'] },
            text: { type: 'string' },
            productImage: { type: 'string' },
            style: { type: 'string' },
          },
          required: ['platform', 'type'],
        },
        handler: 'imagegen.generateSocialImage',
        requiredPermissions: ['generate'],
        rateLimit: { maxPerMinute: 10, maxPerHour: 100 },
      },
    ],
  },

  // 6. Database & Analytics MCP Server
  {
    id: 'mcp-data',
    name: 'Data & Analytics Server',
    description: 'Internal database operations and analytics queries',
    version: '1.0.0',
    enabled: true,
    tools: [
      {
        name: 'db_query',
        description: 'Query the internal database',
        inputSchema: {
          type: 'object',
          properties: {
            entity: { type: 'string', enum: ['stores', 'products', 'orders', 'vas', 'commissions'] },
            filter: { type: 'object' },
            sort: { type: 'object' },
            limit: { type: 'number' },
          },
          required: ['entity'],
        },
        handler: 'data.query',
        requiredPermissions: ['db_read'],
        rateLimit: { maxPerMinute: 60, maxPerHour: 1000 },
      },
      {
        name: 'analytics_report',
        description: 'Generate analytics report',
        inputSchema: {
          type: 'object',
          properties: {
            reportType: { type: 'string', enum: ['sales', 'traffic', 'conversion', 'seo', 'social'] },
            period: { type: 'string' },
            storeId: { type: 'string' },
          },
          required: ['reportType'],
        },
        handler: 'data.analyticsReport',
        requiredPermissions: ['analytics_r'],
        rateLimit: { maxPerMinute: 10, maxPerHour: 100 },
      },
    ],
  },

  // 7. Notification & Communication MCP Server
  {
    id: 'mcp-notify',
    name: 'Notification Server',
    description: 'Sends notifications via email, Slack, and in-app',
    version: '1.0.0',
    enabled: true,
    tools: [
      {
        name: 'send_notification',
        description: 'Send a notification to users or VAs',
        inputSchema: {
          type: 'object',
          properties: {
            channel: { type: 'string', enum: ['email', 'slack', 'in_app', 'sms'] },
            recipient: { type: 'string' },
            subject: { type: 'string' },
            message: { type: 'string' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
          },
          required: ['channel', 'recipient', 'message'],
        },
        handler: 'notify.send',
        requiredPermissions: ['notify'],
        rateLimit: { maxPerMinute: 10, maxPerHour: 100 },
      },
      {
        name: 'send_alert',
        description: 'Send system alert (suspension risk, price change, etc.)',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['suspension_risk', 'price_alert', 'competitor_change', 'stock_alert', 'error'] },
            severity: { type: 'string', enum: ['info', 'warning', 'critical'] },
            details: { type: 'object' },
          },
          required: ['type', 'severity', 'details'],
        },
        handler: 'notify.alert',
        requiredPermissions: ['alert'],
        rateLimit: { maxPerMinute: 20, maxPerHour: 200 },
      },
    ],
  },
];

// Helper to get MCP server by ID
export function getMCPServer(serverId: string): MCPServer | undefined {
  return MCP_SERVERS.find(s => s.id === serverId);
}

// Helper to get all tools across all servers
export function getAllMCPTools(): MCPTool[] {
  return MCP_SERVERS.filter(s => s.enabled).flatMap(s => s.tools);
}

// Helper to find a tool by name
export function findMCPTool(toolName: string): { server: MCPServer; tool: MCPTool } | undefined {
  for (const server of MCP_SERVERS) {
    const tool = server.tools.find(t => t.name === toolName);
    if (tool) return { server, tool };
  }
  return undefined;
}
