/**
 * Printful API v2 Client
 *
 * Provides integration with Printful's print-on-demand fulfillment service
 * for product catalog browsing, order submission, shipping rate calculation,
 * and mockup generation.
 *
 * @see https://developers.printful.com/docs/
 *
 * Base URL: https://api.printful.com
 * Auth: OAuth 2.0 / API Key (Bearer token)
 * Rate limit: 120 requests/minute
 */

// ─────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────

/** Configuration required to initialize the Printful API client. */
export interface PrintfulConfig {
  /** Printful API key (used as Bearer token). */
  apiKey: string;
  /** Optional Printful store ID for multi-store setups. */
  storeId?: string;
}

// ─────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────

/**
 * Custom error class for Printful API failures.
 * Captures HTTP status and the structured error response from Printful.
 */
export class PrintfulApiError extends Error {
  /** HTTP status code returned by Printful. */
  public readonly statusCode: number;
  /** Printful error code string (e.g. "InvalidArgument"). */
  public readonly errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string) {
    super(message);
    this.name = 'PrintfulApiError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

// ─────────────────────────────────────────────
// RESPONSE TYPES
// ─────────────────────────────────────────────

/** Standard Printful API response envelope. */
export interface PrintfulResponse<T> {
  code: number;
  result: T;
  extra: Record<string, unknown>[];
  paging?: {
    total: number;
    offset: number;
    limit: number;
  };
}

/** A product from the Printful catalog. */
export interface PrintfulCatalogProduct {
  id: number;
  main_category_id: number;
  type: string;
  type_name: string;
  title: string;
  brand: string;
  model: string;
  image: string;
  variant_count: number;
  currency: string;
  is_discontinued: boolean;
  avg_fulfillment_time: number | null;
  description: string;
  techniques: PrintfulTechnique[];
  files: PrintfulFileSpec[];
  options: PrintfulOption[];
}

/** Print technique supported by a product. */
export interface PrintfulTechnique {
  key: string;
  display_name: string;
  is_default: boolean;
}

/** File specification for a product's printable area. */
export interface PrintfulFileSpec {
  id: string;
  type: string;
  title: string;
  additional_price: string | null;
  options: PrintfulFileOption[];
}

/** Individual file option (dimensions, DPI, etc.). */
export interface PrintfulFileOption {
  id: string;
  type: string;
  title: string;
  additional_price: string | null;
}

/** Configurable product option (colour, size label position, etc.). */
export interface PrintfulOption {
  id: string;
  title: string;
  type: string;
  values: Record<string, string>;
  additional_price: string | null;
  additional_price_breakdown: Record<string, string>[];
}

/** A specific variant (size/colour combination) of a catalog product. */
export interface PrintfulVariant {
  id: number;
  product_id: number;
  name: string;
  size: string;
  color: string;
  color_code: string;
  color_code2: string | null;
  image: string;
  price: string;
  in_stock: boolean;
  availability_regions: Record<string, string>;
  availability_status: PrintfulAvailabilityStatus[];
}

/** Regional availability details for a variant. */
export interface PrintfulAvailabilityStatus {
  region: string;
  status: string;
}

/** Product details including all variants. */
export interface PrintfulProductDetails {
  product: PrintfulCatalogProduct;
  variants: PrintfulVariant[];
}

/** Address used for shipping calculations and order recipients. */
export interface PrintfulAddress {
  name: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state_code?: string;
  state_name?: string;
  country_code: string;
  country_name?: string;
  zip: string;
  phone?: string;
  email?: string;
  tax_number?: string;
}

/** A single item within an order. */
export interface PrintfulOrderItem {
  /** Printful variant ID or external variant ID. */
  variant_id?: number;
  /** Sync variant ID if using synced products. */
  sync_variant_id?: number;
  /** External ID for the line item. */
  external_id?: string;
  /** Quantity to produce. */
  quantity: number;
  /** Retail price (for packing slips). */
  retail_price?: string;
  /** Item name (for packing slips). */
  name?: string;
  /** Print files for this item. */
  files: PrintfulOrderFile[];
  /** Product options (e.g. thread colours). */
  options?: PrintfulOrderOption[];
}

/** A design file attached to an order item. */
export interface PrintfulOrderFile {
  /** File type: "default", "back", "preview", etc. */
  type: string;
  /** Public URL of the design image. */
  url: string;
  /** Filename override. */
  filename?: string;
}

/** An option applied to an order item. */
export interface PrintfulOrderOption {
  id: string;
  value: string;
}

/** Payload for creating a new order. */
export interface PrintfulCreateOrderPayload {
  /** External order ID from your system. */
  external_id?: string;
  /** Shipping method key (e.g. "STANDARD", "EXPRESS"). */
  shipping?: string;
  /** Recipient address. */
  recipient: PrintfulAddress;
  /** Line items to produce and ship. */
  items: PrintfulOrderItem[];
  /** Retail costs shown on packing slip. */
  retail_costs?: {
    currency?: string;
    subtotal?: string;
    discount?: string;
    shipping?: string;
    tax?: string;
  };
  /** Gift information. */
  gift?: {
    subject?: string;
    message?: string;
  };
  /** Packing slip customisation. */
  packing_slip?: {
    email?: string;
    phone?: string;
    message?: string;
    logo_url?: string;
    store_name?: string;
    custom_order_id?: string;
  };
}

/** A fulfilled or in-progress order. */
export interface PrintfulOrder {
  id: number;
  external_id: string | null;
  store: number;
  status: PrintfulOrderStatus;
  shipping: string;
  shipping_service_name: string;
  created: number;
  updated: number;
  recipient: PrintfulAddress;
  items: PrintfulOrderItemResult[];
  shipments: PrintfulShipment[];
  costs: PrintfulCosts;
  retail_costs: PrintfulCosts;
  dashboard_url: string;
}

/** Possible order statuses in Printful. */
export type PrintfulOrderStatus =
  | 'draft'
  | 'pending'
  | 'failed'
  | 'canceled'
  | 'inprocess'
  | 'onhold'
  | 'partial'
  | 'fulfilled';

/** An order item as returned in an order response. */
export interface PrintfulOrderItemResult extends PrintfulOrderItem {
  id: number;
  status: string;
  product: {
    variant_id: number;
    product_id: number;
    image: string;
    name: string;
  };
  sku: string | null;
  price: string;
}

/** Shipment tracking info attached to an order. */
export interface PrintfulShipment {
  id: number;
  carrier: string;
  service: string;
  tracking_number: string;
  tracking_url: string;
  created: number;
  ship_date: string;
  shipped_at: number;
  reshipment: boolean;
  items: { item_id: number; quantity: number }[];
}

/** Cost breakdown. */
export interface PrintfulCosts {
  currency: string;
  subtotal: string;
  discount: string;
  shipping: string;
  digitization: string;
  additional_fee: string;
  fulfillment_fee: string;
  retail_delivery_fee: string;
  tax: string;
  vat: string;
  total: string;
}

/** A shipping rate quote. */
export interface PrintfulShippingRate {
  id: string;
  name: string;
  rate: string;
  currency: string;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  minDeliveryDate: string;
  maxDeliveryDate: string;
}

/** Item used for shipping rate calculation. */
export interface PrintfulShippingItem {
  variant_id?: number;
  external_variant_id?: string;
  quantity: number;
  value?: string;
}

/** A mockup generation task result. */
export interface PrintfulMockupTask {
  task_key: string;
  status: 'pending' | 'completed' | 'failed';
  mockups?: PrintfulMockupResult[];
  error?: string;
}

/** A single mockup image result. */
export interface PrintfulMockupResult {
  placement: string;
  variant_ids: number[];
  mockup_url: string;
  extra: PrintfulMockupExtra[];
}

/** Extra mockup views. */
export interface PrintfulMockupExtra {
  title: string;
  url: string;
  variant_ids: number[];
}

/** A country supported by Printful. */
export interface PrintfulCountry {
  code: string;
  name: string;
  states: { code: string; name: string }[] | null;
}

// ─────────────────────────────────────────────
// CLIENT
// ─────────────────────────────────────────────

/**
 * Printful API client.
 *
 * Handles authenticated requests, rate limiting (500 ms between calls for
 * safety within the 120/min limit), and structured error handling.
 *
 * @example
 * ```ts
 * const printful = new PrintfulClient({
 *   apiKey: process.env.PRINTFUL_API_KEY!,
 *   storeId: process.env.PRINTFUL_STORE_ID,
 * });
 *
 * const products = await printful.getProducts();
 * const rates = await printful.getShippingRates(recipientAddress, items);
 * ```
 */
export class PrintfulClient {
  private static readonly BASE_URL = 'https://api.printful.com';
  private static readonly MIN_REQUEST_INTERVAL_MS = 500;

  private config: PrintfulConfig;
  private lastRequestTime = 0;
  private requestCount = 0;

  constructor(config: PrintfulConfig) {
    this.config = { ...config };
  }

  // ── Catalog ───────────────────────────────

  /**
   * Retrieve the full Printful product catalog.
   *
   * @returns Array of catalog products.
   */
  async getProducts(): Promise<PrintfulCatalogProduct[]> {
    const response = await this.request<PrintfulCatalogProduct[]>('GET', '/products');
    return response.result;
  }

  /**
   * Get detailed information about a specific catalog product, including all variants.
   *
   * @param productId - The Printful catalog product ID.
   * @returns Product details with variants.
   */
  async getProduct(productId: number): Promise<PrintfulProductDetails> {
    const response = await this.request<PrintfulProductDetails>('GET', `/products/${productId}`);
    return response.result;
  }

  // ── Orders ────────────────────────────────

  /**
   * Submit a new order to Printful for fulfillment.
   *
   * By default the order is created as a draft. Pass `confirm: true` in query
   * params to confirm immediately (charges your account).
   *
   * @param order - The order payload.
   * @param confirm - Whether to confirm the order immediately.
   * @returns The created order.
   */
  async createOrder(order: PrintfulCreateOrderPayload, confirm = false): Promise<PrintfulOrder> {
    const query = confirm ? '?confirm=true' : '';
    const response = await this.request<PrintfulOrder>('POST', `/orders${query}`, order);
    return response.result;
  }

  /**
   * Get the current status and details of an order.
   *
   * @param orderId - The Printful order ID or your external_id prefixed with "@".
   * @returns The order details.
   */
  async getOrder(orderId: string | number): Promise<PrintfulOrder> {
    const response = await this.request<PrintfulOrder>('GET', `/orders/${orderId}`);
    return response.result;
  }

  /**
   * Cancel an order that has not yet entered production.
   *
   * @param orderId - The Printful order ID or your external_id prefixed with "@".
   * @returns The cancelled order.
   */
  async cancelOrder(orderId: string | number): Promise<PrintfulOrder> {
    const response = await this.request<PrintfulOrder>('DELETE', `/orders/${orderId}`);
    return response.result;
  }

  /**
   * Confirm a draft order, sending it to production.
   *
   * @param orderId - The Printful order ID.
   * @returns The confirmed order.
   */
  async confirmOrder(orderId: string | number): Promise<PrintfulOrder> {
    const response = await this.request<PrintfulOrder>('POST', `/orders/${orderId}/confirm`);
    return response.result;
  }

  // ── Shipping ──────────────────────────────

  /**
   * Calculate shipping rates for a potential order.
   *
   * @param recipient - Destination address.
   * @param items - Items to ship (with variant IDs and quantities).
   * @returns Available shipping rates.
   */
  async getShippingRates(
    recipient: PrintfulAddress,
    items: PrintfulShippingItem[],
  ): Promise<PrintfulShippingRate[]> {
    const response = await this.request<PrintfulShippingRate[]>('POST', '/shipping/rates', {
      recipient,
      items,
    });
    return response.result;
  }

  // ── Mockups ───────────────────────────────

  /**
   * Submit a mockup generation task for a product.
   *
   * Mockup generation is asynchronous. Poll `getMockupTask` with the returned
   * `task_key` to retrieve the result.
   *
   * @param productId - The Printful catalog product ID.
   * @param variantIds - Variant IDs to generate mockups for.
   * @param designUrl - Public URL to the design image.
   * @param placement - Print placement (default: "front").
   * @returns The mockup generation task.
   */
  async createMockupTask(
    productId: number,
    variantIds: number[],
    designUrl: string,
    placement = 'front',
  ): Promise<PrintfulMockupTask> {
    const response = await this.request<PrintfulMockupTask>(
      'POST',
      `/mockup-generator/create-task/${productId}`,
      {
        variant_ids: variantIds,
        files: [
          {
            placement,
            image_url: designUrl,
            position: {
              area_width: 1800,
              area_height: 2400,
              width: 1800,
              height: 2400,
              top: 0,
              left: 0,
            },
          },
        ],
      },
    );
    return response.result;
  }

  /**
   * Poll for the result of a mockup generation task.
   *
   * @param taskKey - The task key returned from `createMockupTask`.
   * @returns The current task status and mockup URLs when complete.
   */
  async getMockupTask(taskKey: string): Promise<PrintfulMockupTask> {
    const response = await this.request<PrintfulMockupTask>(
      'GET',
      `/mockup-generator/task?task_key=${encodeURIComponent(taskKey)}`,
    );
    return response.result;
  }

  /**
   * Convenience method: create a mockup task and poll until completion.
   *
   * @param productId - The Printful catalog product ID.
   * @param variantIds - Variant IDs to generate mockups for.
   * @param designUrl - Public URL to the design image.
   * @param placement - Print placement (default: "front").
   * @param maxAttempts - Maximum poll attempts (default: 20).
   * @param pollIntervalMs - Milliseconds between polls (default: 3000).
   * @returns The completed mockup task with URLs.
   * @throws PrintfulApiError if the task fails or times out.
   */
  async getMockup(
    productId: number,
    variantIds: number[],
    designUrl: string,
    placement = 'front',
    maxAttempts = 20,
    pollIntervalMs = 3000,
  ): Promise<PrintfulMockupTask> {
    const task = await this.createMockupTask(productId, variantIds, designUrl, placement);
    let result = task;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (result.status === 'completed') {
        return result;
      }
      if (result.status === 'failed') {
        throw new PrintfulApiError(
          `Mockup generation failed: ${result.error ?? 'Unknown error'}`,
          500,
          'MockupFailed',
        );
      }

      await new Promise<void>((resolve) => setTimeout(resolve, pollIntervalMs));
      result = await this.getMockupTask(task.task_key);
    }

    throw new PrintfulApiError(
      `Mockup generation timed out after ${maxAttempts} attempts`,
      408,
      'MockupTimeout',
    );
  }

  // ── Countries ─────────────────────────────

  /**
   * Get the list of countries supported by Printful for shipping.
   *
   * @returns Array of countries with optional state/province lists.
   */
  async getCountries(): Promise<PrintfulCountry[]> {
    const response = await this.request<PrintfulCountry[]>('GET', '/countries');
    return response.result;
  }

  // ── Internals ─────────────────────────────

  /**
   * Enforce the per-request rate limit.
   * Printful allows 120 requests/minute. We use a 500 ms minimum gap for safety.
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;

    if (elapsed < PrintfulClient.MIN_REQUEST_INTERVAL_MS) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, PrintfulClient.MIN_REQUEST_INTERVAL_MS - elapsed),
      );
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Send an authenticated request to the Printful API.
   */
  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown> | unknown,
  ): Promise<PrintfulResponse<T>> {
    await this.enforceRateLimit();

    const url = `${PrintfulClient.BASE_URL}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };

    if (this.config.storeId) {
      headers['X-PF-Store-Id'] = this.config.storeId;
    }

    const fetchOptions: RequestInit = { method, headers };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.json() as Promise<PrintfulResponse<T>>;
  }

  /**
   * Parse an error response from Printful and throw a structured PrintfulApiError.
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let message: string;
    let errorCode: string;

    try {
      const errorBody = await response.json();
      message = errorBody.result ?? errorBody.error?.message ?? JSON.stringify(errorBody);
      errorCode = errorBody.error?.code ?? String(response.status);
    } catch {
      message = await response.text().catch(() => 'Unknown error');
      errorCode = String(response.status);
    }

    throw new PrintfulApiError(
      `Printful API ${response.status}: ${message}`,
      response.status,
      errorCode,
    );
  }

  /** Returns the total number of requests made by this client instance. */
  getRequestCount(): number {
    return this.requestCount;
  }
}

// ─────────────────────────────────────────────
// SINGLETON
// ─────────────────────────────────────────────

let clientInstance: PrintfulClient | null = null;

/**
 * Get or create a shared PrintfulClient singleton.
 *
 * Reads configuration from environment variables:
 *   - PRINTFUL_API_KEY
 *   - PRINTFUL_STORE_ID (optional)
 *
 * @returns The shared PrintfulClient instance.
 */
export function getPrintfulClient(): PrintfulClient {
  if (!clientInstance) {
    clientInstance = new PrintfulClient({
      apiKey: process.env.PRINTFUL_API_KEY || '',
      storeId: process.env.PRINTFUL_STORE_ID,
    });
  }
  return clientInstance;
}
