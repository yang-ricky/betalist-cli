import { describe, it, expect } from "vitest";
import { toJSON, toYAML, serialize } from "../../src/serializer.js";
import type { CLIOutput } from "../../src/models/index.js";

describe("toJSON", () => {
	it("should serialize CLIOutput to JSON", () => {
		const output: CLIOutput<string[]> = {
			ok: true,
			schemaVersion: "1",
			dataSource: "html",
			providerChain: ["html"],
			fetchedAt: "2026-03-29T12:00:00.000Z",
			cacheHit: false,
			degraded: false,
			warnings: [],
			data: ["item1", "item2"],
			error: null,
		};

		const json = toJSON(output);
		const parsed = JSON.parse(json);

		expect(parsed.ok).toBe(true);
		expect(parsed.schemaVersion).toBe("1");
		expect(parsed.dataSource).toBe("html");
		expect(parsed.data).toEqual(["item1", "item2"]);
	});

	it("should serialize error output", () => {
		const output: CLIOutput<null> = {
			ok: false,
			schemaVersion: "1",
			dataSource: "html",
			providerChain: [],
			fetchedAt: "2026-03-29T12:00:00.000Z",
			cacheHit: false,
			degraded: false,
			warnings: [],
			data: null,
			error: {
				code: "network_error",
				message: "Connection failed",
				exitCode: 5,
			},
		};

		const json = toJSON(output);
		const parsed = JSON.parse(json);

		expect(parsed.ok).toBe(false);
		expect(parsed.error.code).toBe("network_error");
		expect(parsed.error.exitCode).toBe(5);
	});
});

describe("toYAML", () => {
	it("should serialize CLIOutput to YAML", () => {
		const output: CLIOutput<string[]> = {
			ok: true,
			schemaVersion: "1",
			dataSource: "api",
			providerChain: ["api"],
			fetchedAt: "2026-03-29T12:00:00.000Z",
			cacheHit: true,
			degraded: false,
			warnings: ["Some warning"],
			data: ["item1"],
			error: null,
		};

		const yaml = toYAML(output);

		expect(yaml).toContain("ok: true");
		expect(yaml).toContain("schemaVersion:");
		expect(yaml).toContain("dataSource: api");
		expect(yaml).toContain("cacheHit: true");
		expect(yaml).toContain("Some warning");
	});
});

describe("serialize", () => {
	it("should serialize as JSON when format is json", () => {
		const output: CLIOutput<string> = {
			ok: true,
			schemaVersion: "1",
			dataSource: "html",
			providerChain: ["html"],
			fetchedAt: "2026-03-29T12:00:00.000Z",
			cacheHit: false,
			degraded: false,
			warnings: [],
			data: "test",
			error: null,
		};

		const result = serialize(output, "json");
		expect(() => JSON.parse(result)).not.toThrow();
	});

	it("should serialize as YAML when format is yaml", () => {
		const output: CLIOutput<string> = {
			ok: true,
			schemaVersion: "1",
			dataSource: "html",
			providerChain: ["html"],
			fetchedAt: "2026-03-29T12:00:00.000Z",
			cacheHit: false,
			degraded: false,
			warnings: [],
			data: "test",
			error: null,
		};

		const result = serialize(output, "yaml");
		expect(result).toContain("ok: true");
	});
});
