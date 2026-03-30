import type { AuthProvider } from "../auth/types.js";
import type { Cache } from "../cache/types.js";
import { API_BASE_URL, DEFAULTS, URLS } from "../constants.js";
import { NetworkError, RateLimitError } from "../errors.js";
import type {
	CacheKey,
	ListOptions,
	Market,
	Region,
	SearchOptions,
	SearchResult,
	Startup,
	StartupDetail,
} from "../models/index.js";
import {
	parseApiMarkets,
	parseApiRegions,
	parseApiStartups,
	parseMarketList,
	parseStartupDetail,
	parseStartupList,
} from "../parsers/index.js";
import type { Backend } from "./types.js";

const SCHEMA_VERSION = "1";

export class BetaListBackend implements Backend {
	private lastRequestTime = 0;
	private apiAvailable: boolean | null = null;

	constructor(
		private auth: AuthProvider,
		private cache: Cache,
		private config: {
			delay: number;
			timeout: number;
			retries: number;
		} = {
			delay: DEFAULTS.delay,
			timeout: DEFAULTS.timeout,
			retries: DEFAULTS.retries,
		},
	) {}

	// ===== Public API =====

	async getLatest(options?: ListOptions): Promise<Startup[]> {
		const limit = options?.limit ?? DEFAULTS.limit;
		const page = options?.page ?? DEFAULTS.page;

		// Check cache first
		const cacheKey = this.makeCacheKey("list", `latest-page-${page}`);
		const cached = this.cache.get<Startup[]>(cacheKey);
		if (cached) {
			return cached.data.slice(0, limit);
		}

		// Try API if authenticated
		if (this.auth.isAuthenticated() && (await this.isApiAvailable())) {
			try {
				const url = this.buildApiUrl("/startups", { page, per_page: limit });
				const json = await this.fetchWithRetry(url, "json");
				const startups = parseApiStartups(json);
				this.cache.set(cacheKey, startups, DEFAULTS.cacheTTL.list);
				return startups.slice(0, limit);
			} catch {
				// Fall through to HTML
			}
		}

		// HTML fallback
		const htmlCacheKey = this.makeCacheKey("list", `latest-page-${page}`, "html");
		const htmlCached = this.cache.get<Startup[]>(htmlCacheKey);
		if (htmlCached) {
			return htmlCached.data.slice(0, limit);
		}

		const html = await this.fetchWithRetry(URLS.home, "text");
		const startups = parseStartupList(html);
		this.cache.set(htmlCacheKey, startups, DEFAULTS.cacheTTL.list);
		return startups.slice(0, limit);
	}

	async getStartup(slug: string): Promise<StartupDetail> {
		// Check cache first
		const cacheKey = this.makeCacheKey("startup", slug);
		const cached = this.cache.get<StartupDetail>(cacheKey);
		if (cached) {
			return cached.data;
		}

		// Try API if authenticated (would need resolver for id, skip for now)
		// Phase 1: always use HTML for detail

		// HTML
		const htmlCacheKey = this.makeCacheKey("startup", slug, "html");
		const htmlCached = this.cache.get<StartupDetail>(htmlCacheKey);
		if (htmlCached) {
			return htmlCached.data;
		}

		const url = URLS.startup(slug);
		const html = await this.fetchWithRetry(url, "text");
		const startup = parseStartupDetail(html, slug);
		this.cache.set(htmlCacheKey, startup, DEFAULTS.cacheTTL.startup);
		return startup;
	}

	async getMarkets(): Promise<Market[]> {
		// Check cache first
		const cacheKey = this.makeCacheKey("markets", "all");
		const cached = this.cache.get<Market[]>(cacheKey);
		if (cached) {
			return cached.data;
		}

		// Try API if authenticated
		if (this.auth.isAuthenticated() && (await this.isApiAvailable())) {
			try {
				const url = this.buildApiUrl("/markets");
				const json = await this.fetchWithRetry(url, "json");
				const markets = parseApiMarkets(json);
				this.cache.set(cacheKey, markets, DEFAULTS.cacheTTL.markets);
				return markets;
			} catch {
				// Fall through to HTML
			}
		}

		// HTML fallback
		const htmlCacheKey = this.makeCacheKey("markets", "all", "html");
		const htmlCached = this.cache.get<Market[]>(htmlCacheKey);
		if (htmlCached) {
			return htmlCached.data;
		}

		const html = await this.fetchWithRetry(URLS.browse, "text");
		const markets = parseMarketList(html);
		this.cache.set(htmlCacheKey, markets, DEFAULTS.cacheTTL.markets);
		return markets;
	}

	async getStartupsByMarket(categorySlug: string, options?: ListOptions): Promise<Startup[]> {
		const limit = options?.limit ?? DEFAULTS.limit;

		// HTML only for Phase 1
		const cacheKey = this.makeCacheKey("list", `market-${categorySlug}`, "html");
		const cached = this.cache.get<Startup[]>(cacheKey);
		if (cached) {
			return cached.data.slice(0, limit);
		}

		const url = URLS.browseCategory(categorySlug);
		const html = await this.fetchWithRetry(url, "text");
		const startups = parseStartupList(html);
		this.cache.set(cacheKey, startups, DEFAULTS.cacheTTL.list);
		return startups.slice(0, limit);
	}

	async getRegions(): Promise<Region[]> {
		// Check cache first
		const cacheKey = this.makeCacheKey("regions", "all");
		const cached = this.cache.get<Region[]>(cacheKey);
		if (cached) {
			return cached.data;
		}

		// Try API if authenticated
		if (this.auth.isAuthenticated() && (await this.isApiAvailable())) {
			try {
				const url = this.buildApiUrl("/regions");
				const json = await this.fetchWithRetry(url, "json");
				const regions = parseApiRegions(json);
				this.cache.set(cacheKey, regions, DEFAULTS.cacheTTL.regions);
				return regions;
			} catch {
				// Fall through to HTML
			}
		}

		// HTML would be implemented here
		// For Phase 1, return empty if API not available
		return [];
	}

	async getStartupsByRegion(regionSlug: string, options?: ListOptions): Promise<Startup[]> {
		const limit = options?.limit ?? DEFAULTS.limit;

		// HTML only for Phase 1
		const cacheKey = this.makeCacheKey("list", `region-${regionSlug}`, "html");
		const cached = this.cache.get<Startup[]>(cacheKey);
		if (cached) {
			return cached.data.slice(0, limit);
		}

		const url = URLS.region(regionSlug);
		const html = await this.fetchWithRetry(url, "text");
		const startups = parseStartupList(html);
		this.cache.set(cacheKey, startups, DEFAULTS.cacheTTL.list);
		return startups.slice(0, limit);
	}

	async search(query: string, options?: SearchOptions): Promise<SearchResult> {
		const limit = options?.limit ?? DEFAULTS.limit;

		// Phase 1: simple search via HTML search page
		const cacheKey = this.makeCacheKey("search", query, "html");
		const cached = this.cache.get<Startup[]>(cacheKey);
		if (cached) {
			return {
				startups: cached.data.slice(0, limit),
				searchQuality: "best-effort",
			};
		}

		try {
			const url = URLS.search(query);
			const html = await this.fetchWithRetry(url, "text");
			const startups = parseStartupList(html);
			this.cache.set(cacheKey, startups, DEFAULTS.cacheTTL.list);
			return {
				startups: startups.slice(0, limit),
				searchQuality: "best-effort",
			};
		} catch {
			return {
				startups: [],
				searchQuality: "best-effort",
			};
		}
	}

	// ===== Helper Methods =====

	private makeCacheKey(
		entityType: string,
		entityKey: string,
		provider: "api" | "html" = this.auth.isAuthenticated() ? "api" : "html",
	): CacheKey {
		return {
			provider,
			schemaVersion: SCHEMA_VERSION,
			entityType,
			entityKey,
		};
	}

	private buildApiUrl(path: string, params?: Record<string, string | number>): string {
		const url = new URL(path, API_BASE_URL);
		const queryParams = { ...this.auth.getQueryParams(), ...params };
		for (const [key, value] of Object.entries(queryParams)) {
			url.searchParams.set(key, String(value));
		}
		return url.toString();
	}

	private async isApiAvailable(): Promise<boolean> {
		if (this.apiAvailable !== null) {
			return this.apiAvailable;
		}

		if (!this.auth.isAuthenticated()) {
			this.apiAvailable = false;
			return false;
		}

		try {
			const url = this.buildApiUrl("/startups", { per_page: 1 });
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000);

			const response = await fetch(url, {
				headers: this.auth.getHeaders(),
				signal: controller.signal,
			});

			clearTimeout(timeoutId);
			this.apiAvailable = response.ok;
			return this.apiAvailable;
		} catch {
			this.apiAvailable = false;
			return false;
		}
	}

	private async fetchWithRetry(url: string, responseType: "text"): Promise<string>;
	private async fetchWithRetry(url: string, responseType: "json"): Promise<unknown>;
	private async fetchWithRetry(
		url: string,
		responseType: "text" | "json",
	): Promise<string | unknown> {
		await this.rateLimit();

		let lastError: Error | null = null;

		for (let attempt = 0; attempt < this.config.retries; attempt++) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

				const response = await fetch(url, {
					headers: this.auth.getHeaders(),
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (response.status === 429 || response.status === 503) {
					// Exponential backoff
					const delay = 2 ** attempt * 1000;
					await this.sleep(delay);
					continue;
				}

				if (!response.ok) {
					throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`);
				}

				if (responseType === "json") {
					return await response.json();
				}
				return await response.text();
			} catch (error) {
				lastError = error as Error;
				if (error instanceof NetworkError) {
					throw error;
				}
				// Retry on network errors
				const delay = 2 ** attempt * 1000;
				await this.sleep(delay);
			}
		}

		if (lastError?.message.includes("429")) {
			throw new RateLimitError("Rate limited by BetaList");
		}
		throw new NetworkError(lastError?.message || "Network request failed");
	}

	private async rateLimit(): Promise<void> {
		const now = Date.now();
		const elapsed = now - this.lastRequestTime;
		if (elapsed < this.config.delay) {
			await this.sleep(this.config.delay - elapsed);
		}
		this.lastRequestTime = Date.now();
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
