import type {
	Startup,
	StartupDetail,
	Market,
	Region,
	ListOptions,
	SearchOptions,
	SearchResult,
} from "../models/index.js";

export interface Backend {
	getLatest(options?: ListOptions): Promise<Startup[]>;
	getStartup(slug: string): Promise<StartupDetail>;
	getMarkets(): Promise<Market[]>;
	getStartupsByMarket(
		categorySlug: string,
		options?: ListOptions,
	): Promise<Startup[]>;
	getRegions(): Promise<Region[]>;
	getStartupsByRegion(
		regionSlug: string,
		options?: ListOptions,
	): Promise<Startup[]>;
	search(query: string, options?: SearchOptions): Promise<SearchResult>;
}
