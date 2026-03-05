/**
 * Etsy Open API v3 Client
 *
 * Provides full integration with the Etsy marketplace API for managing
 * shops, listings, orders, images, and reviews.
 *
 * @see https://developers.etsy.com/documentation/
 *
 * Base URL: https://api.etsy.com/v3
 * Auth: OAuth 2.0 (PKCE flow)
 * Rate limit: ~5000 requests/day per store (~3.5 req/min sustained)
 */

// ─────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────

/** Configuration required to initialize the Etsy API client. */
export interface EtsyConfig {
  /** Etsy API key (keystring) from the developer portal. */
  apiKey: string;
  /** Etsy API shared secret for OAuth flows. */
  apiSecret: string;
  /** Current OAuth 2.0 access token. */
  accessToken?: string;
  /** OAuth 2.0 refresh token for obtaining new access tokens. */
  refreshToken?: string;
  /** Numeric Etsy shop ID to operate against. */
  shopId?: string;
}

// ─────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────

/**
 * Custom error class for Etsy API failures.
 * Captures HTTP status, error detail, and rate limit state.
 */
export class EtsyApiError extends Error {
  /** HTTP status code returned by Etsy. */
  public readonly statusCode: number;
  /** Raw error detail string from the API response body. */
  public readonly detail: string;
  /** Remaining daily requests when the error occurred, if available. */
  public readonly rateLimitRemaining?: number;

  constructor(message: string, statusCode: number, detail: string, rateLimitRemaining?: number) {
    super(message);
    this.name = 'EtsyApiError';
    this.statusCode = statusCode;
    this.detail = detail;
    this.rateLimitRemaining = rateLimitRemaining;
  }
}

// ─────────────────────────────────────────────
// RESPONSE TYPES
// ─────────────────────────────────────────────

/** Shop details returned from the Etsy API. */
export interface EtsyShop {
  shop_id: number;
  shop_name: string;
  user_id: number;
  title: string;
  sale_message: string;
  digital_sale_message: string;
  url: string;
  num_favorers: number;
  listing_active_count: number;
  digital_listing_count: number;
  login_name: string;
  currency_code: string;
  is_vacation: boolean;
  vacation_message: string | null;
  transaction_sold_count: number;
  review_count: number;
  review_average: number;
  icon_url_fullxfull: string | null;
  create_date: number;
  update_date: number;
}

/** Represents a single product listing on Etsy. */
export interface EtsyListing {
  listing_id: number;
  user_id: number;
  shop_id: number;
  title: string;
  description: string;
  state: 'active' | 'inactive' | 'draft' | 'expired' | 'sold_out' | 'removed';
  creation_timestamp: number;
  last_modified_timestamp: number;
  featured_rank: number;
  url: string;
  num_favorers: number;
  views: number;
  quantity: number;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  who_made: 'i_did' | 'someone_else' | 'collective';
  when_made: string;
  taxonomy_id: number;
  tags: string[];
  materials: string[];
  processing_min: number;
  processing_max: number;
  shipping_profile_id: number | null;
  images: EtsyListingImage[];
}

/** Data needed to create a new listing. */
export interface EtsyCreateListingPayload {
  title: string;
  description: string;
  price: number;
  quantity: number;
  who_made: 'i_did' | 'someone_else' | 'collective';
  when_made: string;
  taxonomy_id: number;
  tags?: string[];
  materials?: string[];
  shipping_profile_id?: number;
  processing_min?: number;
  processing_max?: number;
  is_personalizable?: boolean;
  personalization_is_required?: boolean;
  personalization_instructions?: string;
  type?: 'physical' | 'download' | 'both';
  is_supply?: boolean;
}

/** Data for updating an existing listing (all fields optional). */
export interface EtsyUpdateListingPayload {
  title?: string;
  description?: string;
  price?: number;
  quantity?: number;
  tags?: string[];
  materials?: string[];
  state?: 'active' | 'inactive' | 'draft';
  shipping_profile_id?: number;
  processing_min?: number;
  processing_max?: number;
  taxonomy_id?: number;
}

/** Image associated with a listing. */
export interface EtsyListingImage {
  listing_image_id: number;
  listing_id: number;
  hex_code: string | null;
  red: number | null;
  green: number | null;
  blue: number | null;
  hue: number | null;
  saturation: number | null;
  brightness: number | null;
  url_75x75: string;
  url_170x135: string;
  url_570xN: string;
  url_fullxfull: string;
  full_height: number;
  full_width: number;
  rank: number;
}

/** An order receipt from Etsy. */
export interface EtsyReceipt {
  receipt_id: number;
  receipt_type: number;
  seller_user_id: number;
  buyer_user_id: number;
  name: string;
  first_line: string;
  second_line: string | null;
  city: string;
  state: string;
  zip: string;
  formatted_address: string;
  country_iso: string;
  payment_method: string;
  buyer_email: string;
  seller_email: string;
  is_shipped: boolean;
  is_paid: boolean;
  status: 'open' | 'paid' | 'completed' | 'canceled';
  grandtotal: { amount: number; divisor: number; currency_code: string };
  subtotal: { amount: number; divisor: number; currency_code: string };
  total_tax_cost: { amount: number; divisor: number; currency_code: string };
  total_shipping_cost: { amount: number; divisor: number; currency_code: string };
  create_timestamp: number;
  update_timestamp: number;
  transactions: EtsyTransaction[];
  shipments: EtsyShipment[];
}

/** A line item within an order receipt. */
export interface EtsyTransaction {
  transaction_id: number;
  listing_id: number;
  title: string;
  quantity: number;
  price: { amount: number; divisor: number; currency_code: string };
  shipping_cost: { amount: number; divisor: number; currency_code: string };
}

/** Shipment tracking information. */
export interface EtsyShipment {
  receipt_shipping_id: number;
  carrier_name: string;
  tracking_code: string;
}

/** Data for updating tracking on a receipt. */
export interface EtsyUpdateReceiptPayload {
  was_shipped?: boolean;
  was_paid?: boolean;
  carrier_name?: string;
  tracking_code?: string;
  send_bcc?: boolean;
}

/** A customer review left on a shop. */
export interface EtsyReview {
  shop_id: number;
  listing_id: number;
  rating: number;
  review: string;
  created_timestamp: number;
  updated_timestamp: number;
  buyer_user_id: number;
  transaction_id: number;
  image_url_fullxfull: string | null;
}

/** Paginated list response envelope. */
export interface EtsyPaginatedResponse<T> {
  count: number;
  results: T[];
}

/** Query parameters for paginated listing fetches. */
export interface EtsyListingParams {
  state?: 'active' | 'inactive' | 'draft' | 'expired' | 'sold_out';
  limit?: number;
  offset?: number;
  sort_on?: 'created' | 'price' | 'updated' | 'score';
  sort_order?: 'asc' | 'desc';
  includes?: string[];
}

/** Query parameters for paginated receipt fetches. */
export interface EtsyReceiptParams {
  min_created?: number;
  max_created?: number;
  min_last_modified?: number;
  max_last_modified?: number;
  was_shipped?: boolean;
  was_paid?: boolean;
  limit?: number;
  offset?: number;
  sort_on?: 'created' | 'updated';
  sort_order?: 'asc' | 'desc';
}

/** Token response from the OAuth refresh flow. */
export interface EtsyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

// ─────────────────────────────────────────────
// CLIENT
// ─────────────────────────────────────────────

/**
 * Etsy Open API v3 client.
 *
 * Handles authenticated requests, rate limiting (1 second between calls),
 * automatic token refresh, and structured error handling.
 *
 * @example
 * ```ts
 * const client = new EtsyClient({
 *   apiKey: process.env.ETSY_API_KEY!,
 *   apiSecret: process.env.ETSY_API_SECRET!,
 *   accessToken: storedAccessToken,
 *   refreshToken: storedRefreshToken,
 *   shopId: '12345678',
 * });
 *
 * const shop = await client.getShop('12345678');
 * const listings = await client.getListings('12345678', { state: 'active', limit: 25 });
 * ```
 */
export class EtsyClient {
  private static readonly BASE_URL = 'https://api.etsy.com/v3';
  private static readonly TOKEN_URL = 'https://api.etsy.com/v3/public/oauth/token';
  private static readonly MIN_REQUEST_INTERVAL_MS = 1000;

  private config: EtsyConfig;
  private lastRequestTime = 0;
  private requestCount = 0;

  /** Callback invoked when tokens are refreshed so the caller can persist them. */
  public onTokenRefresh?: (tokens: EtsyTokenResponse) => Promise<void> | void;

  constructor(config: EtsyConfig) {
    this.config = { ...config };
  }

  // ── Shop ──────────────────────────────────

  /**
   * Retrieve details for a specific Etsy shop.
   *
   * @param shopId - The numeric Etsy shop ID.
   * @returns Resolved shop data.
   */
  async getShop(shopId: string): Promise<EtsyShop> {
    return this.request<EtsyShop>('GET', `/application/shops/${shopId}`);
  }

  // ── Listings ──────────────────────────────

  /**
   * Get paginated listings for a shop.
   *
   * @param shopId - The numeric Etsy shop ID.
   * @param params - Optional pagination and filter parameters.
   * @returns Paginated listing results.
   */
  async getListings(
    shopId: string,
    params?: EtsyListingParams,
  ): Promise<EtsyPaginatedResponse<EtsyListing>> {
    const query = this.buildQueryString({
      state: params?.state,
      limit: params?.limit,
      offset: params?.offset,
      sort_on: params?.sort_on,
      sort_order: params?.sort_order,
      includes: params?.includes?.join(','),
    });
    return this.request<EtsyPaginatedResponse<EtsyListing>>(
      'GET',
      `/application/shops/${shopId}/listings${query}`,
    );
  }

  /**
   * Create a new product listing on a shop.
   *
   * @param shopId - The numeric Etsy shop ID.
   * @param listing - The listing data to create.
   * @returns The created listing.
   */
  async createListing(shopId: string, listing: EtsyCreateListingPayload): Promise<EtsyListing> {
    return this.request<EtsyListing>(
      'POST',
      `/application/shops/${shopId}/listings`,
      listing,
    );
  }

  /**
   * Update an existing listing.
   *
   * @param shopId - The numeric Etsy shop ID.
   * @param listingId - The listing to update.
   * @param data - Fields to update.
   * @returns The updated listing.
   */
  async updateListing(
    shopId: string,
    listingId: number,
    data: EtsyUpdateListingPayload,
  ): Promise<EtsyListing> {
    return this.request<EtsyListing>(
      'PATCH',
      `/application/shops/${shopId}/listings/${listingId}`,
      data,
    );
  }

  /**
   * Permanently delete a listing.
   *
   * @param shopId - The numeric Etsy shop ID.
   * @param listingId - The listing to delete.
   */
  async deleteListing(shopId: string, listingId: number): Promise<void> {
    await this.request<void>(
      'DELETE',
      `/application/shops/${shopId}/listings/${listingId}`,
    );
  }

  // ── Listing Images ────────────────────────

  /**
   * Upload an image to a listing.
   *
   * Etsy expects multipart/form-data with the image binary in a field named "image".
   *
   * @param shopId - The numeric Etsy shop ID.
   * @param listingId - The listing to attach the image to.
   * @param image - The image as a Buffer (JPEG/PNG, max 10 MB).
   * @param filename - Original filename for the Content-Disposition header.
   * @param rank - Display rank (1-10). Rank 1 is the primary image.
   * @returns The created listing image metadata.
   */
  async uploadListingImage(
    shopId: string,
    listingId: number,
    image: Buffer,
    filename: string,
    rank = 1,
  ): Promise<EtsyListingImage> {
    await this.enforceRateLimit();

    const formData = new FormData();
    const blob = new Blob([image], { type: this.guessMimeType(filename) });
    formData.append('image', blob, filename);
    formData.append('rank', String(rank));

    const url = `${EtsyClient.BASE_URL}/application/shops/${shopId}/listings/${listingId}/images`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'x-api-key': this.config.apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    return response.json() as Promise<EtsyListingImage>;
  }

  // ── Orders / Receipts ─────────────────────

  /**
   * Get paginated order receipts for a shop.
   *
   * @param shopId - The numeric Etsy shop ID.
   * @param params - Optional pagination and filter parameters.
   * @returns Paginated receipt results.
   */
  async getReceipts(
    shopId: string,
    params?: EtsyReceiptParams,
  ): Promise<EtsyPaginatedResponse<EtsyReceipt>> {
    const query = this.buildQueryString({
      min_created: params?.min_created,
      max_created: params?.max_created,
      min_last_modified: params?.min_last_modified,
      max_last_modified: params?.max_last_modified,
      was_shipped: params?.was_shipped,
      was_paid: params?.was_paid,
      limit: params?.limit,
      offset: params?.offset,
      sort_on: params?.sort_on,
      sort_order: params?.sort_order,
    });
    return this.request<EtsyPaginatedResponse<EtsyReceipt>>(
      'GET',
      `/application/shops/${shopId}/receipts${query}`,
    );
  }

  /**
   * Get a single order receipt by ID.
   *
   * @param shopId - The numeric Etsy shop ID.
   * @param receiptId - The receipt ID.
   * @returns The full receipt with transactions and shipments.
   */
  async getReceipt(shopId: string, receiptId: number): Promise<EtsyReceipt> {
    return this.request<EtsyReceipt>(
      'GET',
      `/application/shops/${shopId}/receipts/${receiptId}`,
    );
  }

  /**
   * Update a receipt with tracking information or ship/pay status.
   *
   * @param shopId - The numeric Etsy shop ID.
   * @param receiptId - The receipt to update.
   * @param data - Fields to update.
   * @returns The updated receipt.
   */
  async updateReceipt(
    shopId: string,
    receiptId: number,
    data: EtsyUpdateReceiptPayload,
  ): Promise<EtsyReceipt> {
    return this.request<EtsyReceipt>(
      'PUT',
      `/application/shops/${shopId}/receipts/${receiptId}`,
      data,
    );
  }

  // ── Reviews ───────────────────────────────

  /**
   * Retrieve reviews left on a shop.
   *
   * @param shopId - The numeric Etsy shop ID.
   * @param limit - Number of reviews to return (default 25, max 100).
   * @param offset - Pagination offset.
   * @returns Paginated review results.
   */
  async getShopReviews(
    shopId: string,
    limit = 25,
    offset = 0,
  ): Promise<EtsyPaginatedResponse<EtsyReview>> {
    const query = this.buildQueryString({ limit, offset });
    return this.request<EtsyPaginatedResponse<EtsyReview>>(
      'GET',
      `/application/shops/${shopId}/reviews${query}`,
    );
  }

  // ── OAuth Token Refresh ───────────────────

  /**
   * Refresh the OAuth 2.0 access token using a refresh token.
   *
   * On success the client's internal tokens are updated automatically.
   * If an `onTokenRefresh` callback is registered it will be called with the
   * new tokens so the caller can persist them.
   *
   * @param refreshToken - The refresh token to exchange. Falls back to the configured refresh token.
   * @returns The new token set.
   */
  async refreshAccessToken(refreshToken?: string): Promise<EtsyTokenResponse> {
    const token = refreshToken ?? this.config.refreshToken;
    if (!token) {
      throw new EtsyApiError(
        'No refresh token available',
        401,
        'A refresh token is required to obtain a new access token.',
      );
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.apiKey,
      refresh_token: token,
    });

    const response = await fetch(EtsyClient.TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new EtsyApiError(
        `Token refresh failed: ${response.status}`,
        response.status,
        errorText,
      );
    }

    const tokens = (await response.json()) as EtsyTokenResponse;
    this.config.accessToken = tokens.access_token;
    this.config.refreshToken = tokens.refresh_token;

    if (this.onTokenRefresh) {
      await this.onTokenRefresh(tokens);
    }

    return tokens;
  }

  // ── Internals ─────────────────────────────

  /**
   * Enforce the per-request rate limit.
   * Etsy allows ~5000 requests/day which is roughly 3.5/min.
   * We enforce a 1-second minimum gap between requests for safety.
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;

    if (elapsed < EtsyClient.MIN_REQUEST_INTERVAL_MS) {
      await new Promise<void>((resolve) =>
        setTimeout(resolve, EtsyClient.MIN_REQUEST_INTERVAL_MS - elapsed),
      );
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  /**
   * Send an authenticated request to the Etsy API.
   *
   * Handles rate limiting, 401 token refresh retries, and structured error responses.
   */
  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown> | unknown,
    isRetry = false,
  ): Promise<T> {
    await this.enforceRateLimit();

    const url = `${EtsyClient.BASE_URL}${path}`;
    const headers: Record<string, string> = {
      'x-api-key': this.config.apiKey,
    };

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    const fetchOptions: RequestInit = { method, headers };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    // Automatic token refresh on 401
    if (response.status === 401 && !isRetry && this.config.refreshToken) {
      await this.refreshAccessToken();
      return this.request<T>(method, path, body, true);
    }

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    // DELETE responses typically have no body
    if (response.status === 204 || method === 'DELETE') {
      return undefined as unknown as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Parse an error response from Etsy and throw a structured EtsyApiError.
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
    let detail: string;

    try {
      const errorBody = await response.json();
      detail = errorBody.error ?? errorBody.error_description ?? JSON.stringify(errorBody);
    } catch {
      detail = await response.text().catch(() => 'Unknown error');
    }

    throw new EtsyApiError(
      `Etsy API ${response.status}: ${detail}`,
      response.status,
      detail,
      rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : undefined,
    );
  }

  /**
   * Build a URL query string from a flat object, omitting undefined values.
   */
  private buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
    const entries = Object.entries(params).filter(
      (entry): entry is [string, string | number | boolean] => entry[1] !== undefined,
    );

    if (entries.length === 0) return '';

    const searchParams = new URLSearchParams();
    for (const [key, value] of entries) {
      searchParams.set(key, String(value));
    }
    return `?${searchParams.toString()}`;
  }

  /**
   * Guess the MIME type of an image from its filename extension.
   */
  private guessMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  }

  /** Returns the total number of requests made by this client instance. */
  getRequestCount(): number {
    return this.requestCount;
  }
}

// ─────────────────────────────────────────────
// SINGLETON
// ─────────────────────────────────────────────

let clientInstance: EtsyClient | null = null;

/**
 * Get or create a shared EtsyClient singleton.
 *
 * Reads configuration from environment variables:
 *   - ETSY_API_KEY
 *   - ETSY_API_SECRET
 *   - ETSY_ACCESS_TOKEN
 *   - ETSY_REFRESH_TOKEN
 *   - ETSY_SHOP_ID
 *
 * @returns The shared EtsyClient instance.
 */
export function getEtsyClient(): EtsyClient {
  if (!clientInstance) {
    clientInstance = new EtsyClient({
      apiKey: process.env.ETSY_API_KEY || '',
      apiSecret: process.env.ETSY_API_SECRET || '',
      accessToken: process.env.ETSY_ACCESS_TOKEN,
      refreshToken: process.env.ETSY_REFRESH_TOKEN,
      shopId: process.env.ETSY_SHOP_ID,
    });
  }
  return clientInstance;
}
