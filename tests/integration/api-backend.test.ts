import { describe, it, expect } from "vitest";
import { TokenAuth } from "../../src/auth/index.js";
import { FileCache } from "../../src/cache/index.js";
import { BetaListBackend } from "../../src/backends/index.js";
import * as os from "node:os";
import * as path from "node:path";

const API_TOKEN = process.env.BL_API_TOKEN;
const API_TESTS_ENABLED = !!API_TOKEN;

describe.skipIf(!API_TESTS_ENABLED)("API Backend Integration", () => {
	const auth = new TokenAuth(API_TOKEN!);
	const cacheDir = path.join(os.tmpdir(), `betalist-api-integration-${Date.now()}`);
	const cache = new FileCache(cacheDir);
	const backend = new BetaListBackend(auth, cache, {
		delay: 1000,
		timeout: 30000,
		retries: 2,
	});

	it("should fetch latest startups from API", async () => {
		const startups = await backend.getLatest({ limit: 5 });

		expect(Array.isArray(startups)).toBe(true);
		if (startups.length > 0) {
			expect(startups[0].slug).toBeDefined();
			expect(startups[0].name).toBeDefined();
		}
	}, 60000);

	it("should fetch markets from API", async () => {
		const markets = await backend.getMarkets();

		expect(Array.isArray(markets)).toBe(true);
		if (markets.length > 0) {
			expect(markets[0].slug).toBeDefined();
			expect(markets[0].name).toBeDefined();
		}
	}, 60000);

	it("should fetch regions from API", async () => {
		const regions = await backend.getRegions();

		expect(Array.isArray(regions)).toBe(true);
		if (regions.length > 0) {
			expect(regions[0].slug).toBeDefined();
			expect(regions[0].name).toBeDefined();
		}
	}, 60000);
});
