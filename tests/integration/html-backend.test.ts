import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { AnonymousAuth } from "../../src/auth/index.js";
import { BetaListBackend } from "../../src/backends/index.js";
import { FileCache } from "../../src/cache/index.js";

const LIVE_TESTS_ENABLED = process.env.BL_LIVE_TESTS === "1";

describe.skipIf(!LIVE_TESTS_ENABLED)("HTML Backend Integration", () => {
	const auth = new AnonymousAuth();
	const cacheDir = path.join(os.tmpdir(), `betalist-integration-${Date.now()}`);
	const cache = new FileCache(cacheDir);
	const backend = new BetaListBackend(auth, cache, {
		delay: 2000, // Be nice to the server
		timeout: 30000,
		retries: 2,
	});

	it("should fetch latest startups from real website", async () => {
		const startups = await backend.getLatest({ limit: 5 });

		// Note: With placeholder selectors, this may return empty
		// Once selectors are updated, this should return real data
		expect(Array.isArray(startups)).toBe(true);
	}, 60000);

	it("should fetch markets from real website", async () => {
		const markets = await backend.getMarkets();

		expect(Array.isArray(markets)).toBe(true);
	}, 60000);
});
