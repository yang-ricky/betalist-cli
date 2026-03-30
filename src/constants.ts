export const SITE_URL = "https://betalist.com";

export const API_BASE_URL = "http://api.betalist.com/v1";

export const URLS = {
	home: SITE_URL,
	startup: (slug: string) => `${SITE_URL}/startups/${slug}`,
	browse: `${SITE_URL}/browse`,
	browseCategory: (cat: string) => `${SITE_URL}/browse/${cat}`,
	browseTopic: (cat: string, topic: string) => `${SITE_URL}/browse/${cat}/${topic}`,
	regions: `${SITE_URL}/regions`,
	region: (slug: string) => `${SITE_URL}/regions/${slug}`,
	search: (q: string) => `${SITE_URL}/search?q=${encodeURIComponent(q)}`,
} as const;

export const DEFAULTS = {
	limit: 20,
	page: 1,
	delay: 1000,
	timeout: 10000,
	retries: 3,
	userAgent: "betalist-cli/0.1",
	cacheTTL: {
		list: 300,
		startup: 3600,
		markets: 86400,
		regions: 86400,
	},
	cacheDir: "~/.betalist-cli/cache",
	configDir: "~/.betalist-cli",
} as const;
