import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import { FileCache } from "../../src/cache/file-cache.js";
import type { CacheKey } from "../../src/models/index.js";

describe("FileCache", () => {
	let testDir: string;
	let cache: FileCache;

	beforeEach(() => {
		testDir = path.join(os.tmpdir(), `betalist-test-cache-${Date.now()}`);
		cache = new FileCache(testDir);
	});

	afterEach(() => {
		// Cleanup
		if (fs.existsSync(testDir)) {
			fs.rmSync(testDir, { recursive: true });
		}
	});

	const makeKey = (type: string, key: string): CacheKey => ({
		provider: "html",
		schemaVersion: "1",
		entityType: type,
		entityKey: key,
	});

	it("should set and get cached data", () => {
		const key = makeKey("startup", "test-slug");
		const data = { name: "Test", slug: "test-slug" };

		cache.set(key, data, 3600);
		const result = cache.get<typeof data>(key);

		expect(result).not.toBeNull();
		expect(result?.data).toEqual(data);
	});

	it("should return null for non-existent key", () => {
		const key = makeKey("startup", "non-existent");
		const result = cache.get(key);

		expect(result).toBeNull();
	});

	it("should return null for expired cache", async () => {
		const key = makeKey("startup", "expired");
		const data = { name: "Expired" };

		cache.set(key, data, 0); // 0 second TTL

		// Wait a tiny bit to ensure expiration
		await new Promise((r) => setTimeout(r, 10));

		const result = cache.get(key);
		expect(result).toBeNull();
	});

	it("should clear all cache", () => {
		const key1 = makeKey("startup", "one");
		const key2 = makeKey("startup", "two");

		cache.set(key1, { a: 1 }, 3600);
		cache.set(key2, { b: 2 }, 3600);

		cache.clear();

		expect(cache.get(key1)).toBeNull();
		expect(cache.get(key2)).toBeNull();
	});

	it("should isolate cache by provider", () => {
		const htmlKey: CacheKey = {
			provider: "html",
			schemaVersion: "1",
			entityType: "startup",
			entityKey: "test",
		};
		const apiKey: CacheKey = {
			provider: "api",
			schemaVersion: "1",
			entityType: "startup",
			entityKey: "test",
		};

		cache.set(htmlKey, { source: "html" }, 3600);
		cache.set(apiKey, { source: "api" }, 3600);

		const htmlResult = cache.get<{ source: string }>(htmlKey);
		const apiResult = cache.get<{ source: string }>(apiKey);

		expect(htmlResult?.data.source).toBe("html");
		expect(apiResult?.data.source).toBe("api");
	});

	it("should track last successful fetch", () => {
		const key = makeKey("list", "latest");
		cache.set(key, [], 3600);

		const lastFetch = cache.getLastSuccessfulFetch();
		expect(lastFetch).not.toBeNull();
		expect(new Date(lastFetch!).getTime()).toBeLessThanOrEqual(Date.now());
	});

	it("should be writable", () => {
		expect(cache.isWritable()).toBe(true);
	});
});
