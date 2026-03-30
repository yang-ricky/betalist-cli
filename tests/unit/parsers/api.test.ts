import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	parseApiMarkets,
	parseApiRegions,
	parseApiStartupDetail,
	parseApiStartups,
} from "../../../src/parsers/api.js";

const fixturesDir = join(__dirname, "../../fixtures");

describe("parseApiStartups", () => {
	it("should parse startups from API response", () => {
		const json = JSON.parse(readFileSync(join(fixturesDir, "api/startups.json"), "utf-8"));
		const startups = parseApiStartups(json);

		expect(startups).toHaveLength(3);

		expect(startups[0].id).toBe("12345");
		expect(startups[0].slug).toBe("api-startup-1");
		expect(startups[0].name).toBe("API Startup 1");
		expect(startups[0].tagline).toBe("First startup from API");
		expect(startups[0].siteUrl).toBe("https://apistartup1.com");
		expect(startups[0].logoUrl).toBe("https://example.com/api-logo1.png");
		expect(startups[0].date).toBe("2026-03-29");

		expect(startups[2].slug).toBe("minimal-api-startup");
		expect(startups[2].tagline).toBeUndefined();
	});

	it("should return empty array for non-array input", () => {
		expect(parseApiStartups(null)).toEqual([]);
		expect(parseApiStartups({})).toEqual([]);
		expect(parseApiStartups("string")).toEqual([]);
	});
});

describe("parseApiStartupDetail", () => {
	it("should parse startup detail from API response", () => {
		const json = JSON.parse(readFileSync(join(fixturesDir, "api/startup-detail.json"), "utf-8"));
		const startup = parseApiStartupDetail(json);

		expect(startup).not.toBeNull();
		expect(startup?.id).toBe("12345");
		expect(startup?.slug).toBe("api-startup-1");
		expect(startup?.name).toBe("API Startup 1");
		expect(startup?.description).toContain("full description from the API");
		expect(startup?.maker).toBe("Jane Smith");
	});

	it("should return null for invalid input", () => {
		expect(parseApiStartupDetail(null)).toBeNull();
		expect(parseApiStartupDetail({})).toBeNull();
		expect(parseApiStartupDetail({ name: "test" })).toBeNull(); // missing slug, description
	});
});

describe("parseApiMarkets", () => {
	it("should parse markets from API response", () => {
		const json = JSON.parse(readFileSync(join(fixturesDir, "api/markets.json"), "utf-8"));
		const markets = parseApiMarkets(json);

		expect(markets).toHaveLength(3);

		expect(markets[0].id).toBe("1");
		expect(markets[0].slug).toBe("saas");
		expect(markets[0].name).toBe("SaaS");
		expect(markets[0].startupCount).toBe(1234);

		expect(markets[2].parentSlug).toBe("finance");
	});

	it("should return empty array for non-array input", () => {
		expect(parseApiMarkets(null)).toEqual([]);
	});
});

describe("parseApiRegions", () => {
	it("should parse regions from API response", () => {
		const json = JSON.parse(readFileSync(join(fixturesDir, "api/regions.json"), "utf-8"));
		const regions = parseApiRegions(json);

		expect(regions).toHaveLength(3);

		expect(regions[0].id).toBe("1");
		expect(regions[0].slug).toBe("united-states");
		expect(regions[0].name).toBe("United States");
		expect(regions[0].startupCount).toBe(5000);
	});

	it("should return empty array for non-array input", () => {
		expect(parseApiRegions(null)).toEqual([]);
	});
});
