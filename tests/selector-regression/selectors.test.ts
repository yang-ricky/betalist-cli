import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseMarketList } from "../../src/parsers/market.js";
import { parseStartupList } from "../../src/parsers/startup.js";

const fixturesDir = join(__dirname, "../fixtures");

describe("Selector Regression Tests", () => {
	describe("Startup Selectors", () => {
		it("should parse startups from fixture HTML", () => {
			const html = readFileSync(join(fixturesDir, "html/startup-list.html"), "utf-8");
			const startups = parseStartupList(html);

			// Ensure selectors still work with fixture HTML
			expect(startups.length).toBeGreaterThan(0);

			// Check first startup has required fields
			const first = startups[0];
			expect(first.slug).toBeDefined();
			expect(first.name).toBeDefined();
			expect(first.url).toBeDefined();
		});

		it("should extract all expected fields", () => {
			const html = readFileSync(join(fixturesDir, "html/startup-list.html"), "utf-8");
			const startups = parseStartupList(html);

			// Find the full-featured startup
			const fullStartup = startups.find((s) => s.slug === "test-startup-1");
			expect(fullStartup).toBeDefined();
			expect(fullStartup?.tagline).toBeDefined();
			expect(fullStartup?.categories).toBeDefined();
			expect(fullStartup?.categories?.length).toBeGreaterThan(0);
		});
	});

	describe("Market Selectors", () => {
		it("should parse markets from fixture HTML", () => {
			const html = readFileSync(join(fixturesDir, "html/market-list.html"), "utf-8");
			const markets = parseMarketList(html);

			expect(markets.length).toBeGreaterThan(0);

			const first = markets[0];
			expect(first.slug).toBeDefined();
			expect(first.name).toBeDefined();
		});

		it("should extract startup counts", () => {
			const html = readFileSync(join(fixturesDir, "html/market-list.html"), "utf-8");
			const markets = parseMarketList(html);

			const marketWithCount = markets.find((m) => m.startupCount !== undefined);
			expect(marketWithCount).toBeDefined();
			expect(typeof marketWithCount?.startupCount).toBe("number");
		});
	});
});
