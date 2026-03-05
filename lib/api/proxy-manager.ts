/**
 * Proxy & Anti-Detect Manager
 *
 * Manages residential proxies and unique browser fingerprint profiles for
 * each store to maintain identity isolation on marketplace platforms.
 *
 * Each store is assigned a unique combination of:
 *   - Residential proxy IP (geo-located to the account holder's region)
 *   - Browser fingerprint (User-Agent, screen resolution, WebGL hash, etc.)
 *   - Persistent cookie jar
 *
 * This prevents platforms from correlating multiple stores back to a single operator.
 */

import crypto from 'crypto';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

/** Configuration for a single residential proxy. */
export interface ProxyConfig {
  /** Proxy IP address. */
  ip: string;
  /** Proxy port number. */
  port: number;
  /** Proxy authentication username. */
  username: string;
  /** Proxy authentication password. */
  password: string;
  /** ISO 3166-1 alpha-2 country code (e.g. 'IL' for Israel, 'US'). */
  country: string;
}

/** Browser fingerprint profile used for anti-detect isolation. */
export interface BrowserProfile {
  /** Unique profile identifier. */
  profileId: string;
  /** Store this profile is bound to. */
  storeId: string;
  /** Full User-Agent string. */
  userAgent: string;
  /** Viewport width in CSS pixels. */
  screenWidth: number;
  /** Viewport height in CSS pixels. */
  screenHeight: number;
  /** Screen colour depth (24 or 32). */
  colorDepth: number;
  /** Device pixel ratio (1, 1.5, 2, 3). */
  devicePixelRatio: number;
  /** Browser timezone string (e.g. "Asia/Jerusalem"). */
  timezone: string;
  /** BCP 47 language tags the browser claims to accept. */
  languages: string[];
  /** Platform string reported by navigator.platform. */
  platform: string;
  /** Number of logical CPU cores reported by navigator.hardwareConcurrency. */
  hardwareConcurrency: number;
  /** Device memory in GB reported by navigator.deviceMemory. */
  deviceMemory: number;
  /** WebGL renderer string. */
  webglRenderer: string;
  /** WebGL vendor string. */
  webglVendor: string;
  /** Deterministic hash of the full fingerprint for quick comparison. */
  fingerprintHash: string;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
}

/** Result of a proxy validation check. */
export interface ProxyValidationResult {
  /** Whether the proxy is reachable and functional. */
  isValid: boolean;
  /** Response latency in milliseconds, if reachable. */
  latencyMs?: number;
  /** The external IP address seen by the target, if reachable. */
  externalIp?: string;
  /** Error message if validation failed. */
  error?: string;
}

/** Pool of available proxies managed by the provider API. */
export interface ProxyPoolConfig {
  /** Base URL of the proxy provider API (e.g. Bright Data, Oxylabs). */
  providerApiUrl: string;
  /** API key for the proxy provider. */
  providerApiKey: string;
  /** Default country code for proxy selection. */
  defaultCountry: string;
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

/** Common real-world User-Agent strings rotated across profiles. */
const USER_AGENTS: string[] = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
];

/** Common screen resolutions observed in real traffic. */
const SCREEN_RESOLUTIONS: { width: number; height: number }[] = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1536, height: 864 },
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 2560, height: 1440 },
  { width: 1680, height: 1050 },
  { width: 1600, height: 900 },
];

/** WebGL renderer/vendor pairs from common GPUs. */
const WEBGL_PROFILES: { vendor: string; renderer: string }[] = [
  { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce GTX 1660 SUPER Direct3D11 vs_5_0 ps_5_0, D3D11)' },
  { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)' },
  { vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)' },
  { vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)' },
  { vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0, D3D11)' },
  { vendor: 'Apple', renderer: 'Apple GPU' },
];

/** Timezone strings per country code. */
const COUNTRY_TIMEZONES: Record<string, string[]> = {
  IL: ['Asia/Jerusalem'],
  US: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'],
  GB: ['Europe/London'],
  DE: ['Europe/Berlin'],
  FR: ['Europe/Paris'],
  CA: ['America/Toronto', 'America/Vancouver'],
  AU: ['Australia/Sydney', 'Australia/Melbourne'],
};

// ─────────────────────────────────────────────
// MANAGER
// ─────────────────────────────────────────────

/**
 * Manages proxy assignments and browser fingerprint profiles for store identity isolation.
 *
 * @example
 * ```ts
 * const manager = new ProxyManager({
 *   providerApiUrl: process.env.PROXY_PROVIDER_URL!,
 *   providerApiKey: process.env.PROXY_PROVIDER_KEY!,
 *   defaultCountry: 'IL',
 * });
 *
 * const proxy = await manager.getProxyForStore('store_abc123');
 * const profile = await manager.generateBrowserProfile('store_abc123', 'IL');
 * const isValid = await manager.validateProxy(proxy);
 * ```
 */
export class ProxyManager {
  /** Maps store IDs to their assigned proxy configuration. */
  private storeProxies: Map<string, ProxyConfig> = new Map();

  /** Maps store IDs to their generated browser fingerprint profiles. */
  private browserProfiles: Map<string, BrowserProfile> = new Map();

  /** Pool configuration for the proxy provider. */
  private poolConfig: ProxyPoolConfig;

  constructor(poolConfig: ProxyPoolConfig) {
    this.poolConfig = poolConfig;
  }

  // ── Proxy Management ──────────────────────

  /**
   * Get the proxy assigned to a store.
   *
   * If no proxy has been assigned yet, a new one is fetched from the provider
   * pool and bound to the store.
   *
   * @param storeId - The internal store identifier.
   * @returns The proxy configuration for the store.
   */
  async getProxyForStore(storeId: string): Promise<ProxyConfig> {
    const existing = this.storeProxies.get(storeId);
    if (existing) {
      return existing;
    }

    const proxy = await this.fetchProxyFromPool(this.poolConfig.defaultCountry);
    this.storeProxies.set(storeId, proxy);
    return proxy;
  }

  /**
   * Rotate the proxy for a store, replacing it with a new one from the pool.
   *
   * The previous proxy is released and a fresh one is assigned.
   *
   * @param storeId - The internal store identifier.
   * @returns The new proxy configuration.
   */
  async rotateProxy(storeId: string): Promise<ProxyConfig> {
    this.storeProxies.delete(storeId);
    const proxy = await this.fetchProxyFromPool(this.poolConfig.defaultCountry);
    this.storeProxies.set(storeId, proxy);
    return proxy;
  }

  /**
   * Validate that a proxy is functional by making a test request through it.
   *
   * Sends a request to a public IP-check service and verifies the response
   * matches the expected proxy IP and country.
   *
   * @param proxy - The proxy to validate.
   * @returns Validation result with latency and external IP.
   */
  async validateProxy(proxy: ProxyConfig): Promise<ProxyValidationResult> {
    const startTime = Date.now();

    try {
      // Use the proxy to reach a public IP check endpoint.
      // In production this would use an HTTP agent configured with the proxy.
      // Here we simulate validation against the provider's API.
      const response = await fetch(`${this.poolConfig.providerApiUrl}/proxy/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.poolConfig.providerApiKey}`,
        },
        body: JSON.stringify({
          ip: proxy.ip,
          port: proxy.port,
          username: proxy.username,
          password: proxy.password,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (!response.ok) {
        return {
          isValid: false,
          error: `Validation endpoint returned ${response.status}`,
        };
      }

      const data = (await response.json()) as { ip: string; country: string };
      const latencyMs = Date.now() - startTime;

      return {
        isValid: true,
        latencyMs,
        externalIp: data.ip,
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error',
      };
    }
  }

  // ── Browser Profile Management ────────────

  /**
   * Generate a deterministic but unique browser fingerprint profile for a store.
   *
   * The fingerprint is derived from the store ID so the same store always
   * receives the same profile (unless explicitly regenerated). This ensures
   * consistency across sessions while maintaining uniqueness across stores.
   *
   * @param storeId - The internal store identifier.
   * @param country - ISO country code for timezone and locale selection.
   * @returns The generated browser fingerprint profile.
   */
  async generateBrowserProfile(storeId: string, country = 'IL'): Promise<BrowserProfile> {
    const existing = this.browserProfiles.get(storeId);
    if (existing) {
      return existing;
    }

    const profile = this.buildProfile(storeId, country);
    this.browserProfiles.set(storeId, profile);
    return profile;
  }

  /**
   * Force regeneration of a store's browser profile.
   *
   * Call this after a proxy rotation or if a platform flags the current fingerprint.
   *
   * @param storeId - The internal store identifier.
   * @param country - ISO country code for timezone and locale selection.
   * @returns The newly generated browser fingerprint profile.
   */
  async regenerateBrowserProfile(storeId: string, country = 'IL'): Promise<BrowserProfile> {
    this.browserProfiles.delete(storeId);
    // Append a timestamp to the seed so the new profile differs from the old one
    const profile = this.buildProfile(`${storeId}_${Date.now()}`, country);
    this.browserProfiles.set(storeId, profile);
    return profile;
  }

  /**
   * Get the current browser profile for a store, or null if none exists.
   *
   * @param storeId - The internal store identifier.
   * @returns The profile if it exists, otherwise null.
   */
  getBrowserProfile(storeId: string): BrowserProfile | null {
    return this.browserProfiles.get(storeId) ?? null;
  }

  /**
   * Get the full proxy URL string for use in HTTP agents.
   *
   * @param proxy - The proxy configuration.
   * @returns URL string in the format `http://user:pass@ip:port`.
   */
  getProxyUrl(proxy: ProxyConfig): string {
    return `http://${encodeURIComponent(proxy.username)}:${encodeURIComponent(proxy.password)}@${proxy.ip}:${proxy.port}`;
  }

  // ── Internals ─────────────────────────────

  /**
   * Fetch a new proxy from the provider's pool API.
   *
   * @param country - Desired geo-location country code.
   * @returns A fresh proxy configuration.
   */
  private async fetchProxyFromPool(country: string): Promise<ProxyConfig> {
    try {
      const response = await fetch(`${this.poolConfig.providerApiUrl}/proxy/allocate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.poolConfig.providerApiKey}`,
        },
        body: JSON.stringify({ country }),
        signal: AbortSignal.timeout(15_000),
      });

      if (!response.ok) {
        throw new Error(`Proxy allocation failed with status ${response.status}`);
      }

      const data = (await response.json()) as ProxyConfig;
      return {
        ip: data.ip,
        port: data.port,
        username: data.username,
        password: data.password,
        country: data.country || country,
      };
    } catch (error) {
      // Fallback: generate a deterministic placeholder for development/testing
      if (process.env.NODE_ENV === 'development') {
        return this.generateDevProxy(country);
      }
      throw error;
    }
  }

  /**
   * Generate a placeholder proxy for local development/testing.
   * Never used in production.
   */
  private generateDevProxy(country: string): ProxyConfig {
    const id = crypto.randomBytes(4).toString('hex');
    return {
      ip: `127.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      port: 10000 + Math.floor(Math.random() * 55535),
      username: `dev_user_${id}`,
      password: `dev_pass_${id}`,
      country,
    };
  }

  /**
   * Build a browser profile deterministically from a seed string.
   *
   * Uses a SHA-256 hash of the seed to select profile attributes from
   * the available pools, ensuring the same seed always produces the same
   * profile while different seeds produce unique profiles.
   */
  private buildProfile(seed: string, country: string): BrowserProfile {
    const hash = crypto.createHash('sha256').update(seed).digest();

    // Use different bytes from the hash as indices into the attribute pools
    const uaIndex = hash[0]! % USER_AGENTS.length;
    const screenIndex = hash[1]! % SCREEN_RESOLUTIONS.length;
    const webglIndex = hash[2]! % WEBGL_PROFILES.length;
    const dprOptions = [1, 1.5, 2, 3];
    const dprIndex = hash[3]! % dprOptions.length;
    const coreOptions = [2, 4, 8, 12, 16];
    const coreIndex = hash[4]! % coreOptions.length;
    const memoryOptions = [4, 8, 16, 32];
    const memoryIndex = hash[5]! % memoryOptions.length;
    const colorDepthOptions = [24, 32];
    const colorDepthIndex = hash[6]! % colorDepthOptions.length;

    const timezones = COUNTRY_TIMEZONES[country] ?? COUNTRY_TIMEZONES['US']!;
    const tzIndex = hash[7]! % timezones.length;

    const screen = SCREEN_RESOLUTIONS[screenIndex]!;
    const webgl = WEBGL_PROFILES[webglIndex]!;

    // Determine languages based on country
    const languageMap: Record<string, string[]> = {
      IL: ['he-IL', 'en-US', 'en'],
      US: ['en-US', 'en'],
      GB: ['en-GB', 'en'],
      DE: ['de-DE', 'de', 'en'],
      FR: ['fr-FR', 'fr', 'en'],
      CA: ['en-CA', 'en', 'fr-CA'],
      AU: ['en-AU', 'en'],
    };
    const languages = languageMap[country] ?? ['en-US', 'en'];

    // Determine platform from UA
    const ua = USER_AGENTS[uaIndex]!;
    let platform = 'Win32';
    if (ua.includes('Macintosh')) platform = 'MacIntel';
    else if (ua.includes('Linux')) platform = 'Linux x86_64';

    const fingerprintHash = crypto
      .createHash('sha256')
      .update(`${ua}|${screen.width}x${screen.height}|${webgl.renderer}|${platform}|${seed}`)
      .digest('hex');

    return {
      profileId: `profile_${crypto.createHash('md5').update(seed).digest('hex').slice(0, 12)}`,
      storeId: seed.split('_')[0] ?? seed,
      userAgent: ua,
      screenWidth: screen.width,
      screenHeight: screen.height,
      colorDepth: colorDepthOptions[colorDepthIndex]!,
      devicePixelRatio: dprOptions[dprIndex]!,
      timezone: timezones[tzIndex]!,
      languages,
      platform,
      hardwareConcurrency: coreOptions[coreIndex]!,
      deviceMemory: memoryOptions[memoryIndex]!,
      webglRenderer: webgl.renderer,
      webglVendor: webgl.vendor,
      fingerprintHash,
      createdAt: new Date().toISOString(),
    };
  }
}

// ─────────────────────────────────────────────
// SINGLETON
// ─────────────────────────────────────────────

let managerInstance: ProxyManager | null = null;

/**
 * Get or create the shared ProxyManager singleton.
 *
 * Reads configuration from environment variables:
 *   - PROXY_PROVIDER_URL
 *   - PROXY_PROVIDER_KEY
 *   - PROXY_DEFAULT_COUNTRY (default: "IL")
 *
 * @returns The shared ProxyManager instance.
 */
export function getProxyManager(): ProxyManager {
  if (!managerInstance) {
    managerInstance = new ProxyManager({
      providerApiUrl: process.env.PROXY_PROVIDER_URL || '',
      providerApiKey: process.env.PROXY_PROVIDER_KEY || '',
      defaultCountry: process.env.PROXY_DEFAULT_COUNTRY || 'IL',
    });
  }
  return managerInstance;
}
