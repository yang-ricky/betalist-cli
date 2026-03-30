// ===== Domain Types =====
// 字段分三级稳定性：
// - required: API 和 HTML 都能稳定提供，缺失则视为解析失败
// - optional: 正常情况应该有，但某些条件下可能缺失
// - fragile: 仅 HTML 通道可获取，高度依赖页面结构

export interface Startup {
	// --- required ---
	slug: string;
	name: string;
	url: string; // BetaList 页面 URL

	// --- optional ---
	id?: string;
	tagline?: string;
	siteUrl?: string; // 项目官网 URL
	logoUrl?: string;
	date?: string; // 发布日期

	// --- fragile ---
	categories?: string[];
	isBoosted?: boolean;
}

export interface StartupDetail extends Startup {
	// --- required ---
	description: string;

	// --- optional ---
	maker?: string;
	makerHandle?: string;

	// --- fragile ---
	topics?: string[];
	relatedStartups?: Startup[];
}

export interface Market {
	// --- required ---
	slug: string;
	name: string;

	// --- optional ---
	id?: string;
	parentSlug?: string;
	startupCount?: number;
}

export interface Region {
	// --- required ---
	slug: string;
	name: string;

	// --- optional ---
	id?: string;
	startupCount?: number;
}

// ===== Key Types =====

export interface EntityKey {
	keyType: "slug" | "id";
	value: string;
}

export interface CacheKey {
	provider: "api" | "html";
	schemaVersion: string;
	entityType: string;
	entityKey: string;
}

// ===== Output Types =====

export interface CLIOutput<T> {
	ok: boolean;
	schemaVersion: string;
	dataSource: "api" | "html";
	providerChain: string[];
	fetchedAt: string;
	cacheHit: boolean;
	degraded: boolean;
	warnings: string[];
	data: T | null;
	error: {
		code: string;
		message: string;
		exitCode: number;
	} | null;
}

// ===== List Options =====

export interface ListOptions {
	limit?: number;
	page?: number;
}

export interface SearchOptions extends ListOptions {
	// future extensions
}

export interface SearchResult {
	startups: Startup[];
	searchQuality: "exact" | "best-effort";
}
