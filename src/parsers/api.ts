import { SITE_URL } from "../constants.js";
import type { Market, Region, Startup, StartupDetail } from "../models/index.js";

/**
 * Parse startups list from API response
 */
export function parseApiStartups(json: unknown): Startup[] {
	if (!Array.isArray(json)) {
		return [];
	}

	return json
		.map((item) => {
			const startup: Startup = {
				slug: item.slug || item.name?.toLowerCase().replace(/\s+/g, "-") || "",
				name: item.name || "",
				url: item.slug ? `${SITE_URL}/startups/${item.slug}` : "",
			};

			if (item.id) startup.id = String(item.id);
			if (item.tagline) startup.tagline = item.tagline;
			if (item.site_url) startup.siteUrl = item.site_url;
			if (item.logo_url) startup.logoUrl = item.logo_url;
			if (item.created_at) startup.date = item.created_at;

			return startup;
		})
		.filter((s) => s.slug && s.name && s.url);
}

/**
 * Parse single startup detail from API response
 */
export function parseApiStartupDetail(json: unknown): StartupDetail | null {
	if (!json || typeof json !== "object") {
		return null;
	}

	const item = json as Record<string, unknown>;

	const slug = (item.slug as string) || "";
	const name = (item.name as string) || "";
	const description = (item.description as string) || "";

	if (!slug || !name || !description) {
		return null;
	}

	const startup: StartupDetail = {
		slug,
		name,
		url: `${SITE_URL}/startups/${slug}`,
		description,
	};

	if (item.id) startup.id = String(item.id);
	if (item.tagline) startup.tagline = item.tagline as string;
	if (item.site_url) startup.siteUrl = item.site_url as string;
	if (item.logo_url) startup.logoUrl = item.logo_url as string;
	if (item.created_at) startup.date = item.created_at as string;
	if (item.maker) startup.maker = item.maker as string;

	return startup;
}

/**
 * Parse markets list from API response
 */
export function parseApiMarkets(json: unknown): Market[] {
	if (!Array.isArray(json)) {
		return [];
	}

	return json
		.map((item) => {
			const market: Market = {
				slug: item.slug || item.name?.toLowerCase().replace(/\s+/g, "-") || "",
				name: item.name || "",
			};

			if (item.id) market.id = String(item.id);
			if (item.parent_slug) market.parentSlug = item.parent_slug;
			if (item.startups_count != null) market.startupCount = item.startups_count;

			return market;
		})
		.filter((m) => m.slug && m.name);
}

/**
 * Parse regions list from API response
 */
export function parseApiRegions(json: unknown): Region[] {
	if (!Array.isArray(json)) {
		return [];
	}

	return json
		.map((item) => {
			const region: Region = {
				slug: item.slug || item.name?.toLowerCase().replace(/\s+/g, "-") || "",
				name: item.name || "",
			};

			if (item.id) region.id = String(item.id);
			if (item.startups_count != null) region.startupCount = item.startups_count;

			return region;
		})
		.filter((r) => r.slug && r.name);
}
