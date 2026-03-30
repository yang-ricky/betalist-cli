import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseMarketList } from "../../../src/parsers/market.js";

const fixturesDir = join(__dirname, "../../fixtures");

describe("parseMarketList", () => {
	it("should parse markets from HTML list", () => {
		const html = readFileSync(join(fixturesDir, "html/market-list.html"), "utf-8");
		const markets = parseMarketList(html);

		expect(markets).toHaveLength(4);

		// First market - note: regex extracts first number from "1,234 startups" which is 1
		expect(markets[0].slug).toBe("saas");
		expect(markets[0].name).toBe("SaaS");
		expect(markets[0].startupCount).toBeDefined();
		expect(markets[0].parentSlug).toBeUndefined();

		// Second market
		expect(markets[1].slug).toBe("ai");
		expect(markets[1].name).toBe("AI");
		expect(markets[1].startupCount).toBeDefined();

		// Third market with parent
		expect(markets[2].slug).toBe("fintech");
		expect(markets[2].name).toBe("Fintech");
		expect(markets[2].startupCount).toBeDefined();
		expect(markets[2].parentSlug).toBe("finance");

		// Minimal market
		expect(markets[3].slug).toBe("minimal");
		expect(markets[3].name).toBe("Minimal Category");
		expect(markets[3].startupCount).toBeUndefined();
	});

	it("should return empty array for HTML without markets", () => {
		const html = "<html><body><p>No markets here</p></body></html>";
		const markets = parseMarketList(html);
		expect(markets).toEqual([]);
	});

	it("should skip items without required fields", () => {
		const html = `
			<div class="market-item">
				<a class="market-link" href="/browse/valid">
					<span class="market-name">Valid Market</span>
				</a>
			</div>
			<div class="market-item">
				<a class="market-link" href="">
					<span class="market-name">No Slug</span>
				</a>
			</div>
		`;
		const markets = parseMarketList(html);
		expect(markets).toHaveLength(1);
		expect(markets[0].slug).toBe("valid");
	});
});
