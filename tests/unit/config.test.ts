import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfig } from "../../src/config.js";

describe("loadConfig", () => {
	const originalEnv = { ...process.env };

	beforeEach(() => {
		// Reset env
		delete process.env.BL_API_TOKEN;
		delete process.env.BL_API_BASE_URL;
		delete process.env.BL_CACHE_ENABLED;
		delete process.env.BL_CACHE_DIR;
		delete process.env.BL_REQUEST_DELAY;
		delete process.env.BL_REQUEST_TIMEOUT;
	});

	afterEach(() => {
		process.env = { ...originalEnv };
	});

	it("should return default config when no overrides", () => {
		const config = loadConfig();

		expect(config.api.token).toBe("");
		expect(config.api.baseUrl).toBe("http://api.betalist.com/v1");
		expect(config.cache.enabled).toBe(true);
		expect(config.cache.ttl.list).toBe(300);
		expect(config.cache.ttl.startup).toBe(3600);
		expect(config.cache.ttl.markets).toBe(86400);
		expect(config.cache.ttl.regions).toBe(86400);
		expect(config.request.delay).toBe(1000);
		expect(config.request.timeout).toBe(10000);
		expect(config.request.retries).toBe(3);
	});

	it("should override with environment variables", () => {
		process.env.BL_API_TOKEN = "test-token-123";
		process.env.BL_REQUEST_DELAY = "2000";

		const config = loadConfig();

		expect(config.api.token).toBe("test-token-123");
		expect(config.request.delay).toBe(2000);
	});

	it("should handle BL_CACHE_ENABLED=false", () => {
		process.env.BL_CACHE_ENABLED = "false";

		const config = loadConfig();

		expect(config.cache.enabled).toBe(false);
	});
});
