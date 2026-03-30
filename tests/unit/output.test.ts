import { afterEach, describe, expect, it, vi } from "vitest";
import { getOutputFormat, isTTY, useColors } from "../../src/output.js";

describe("getOutputFormat", () => {
	it("should return json when --json is specified", () => {
		const format = getOutputFormat({ json: true });
		expect(format).toBe("json");
	});

	it("should return yaml when --yaml is specified", () => {
		const format = getOutputFormat({ yaml: true });
		expect(format).toBe("yaml");
	});

	it("should prefer json when both --json and --yaml are specified", () => {
		// Mock console.error to suppress warning
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const format = getOutputFormat({ json: true, yaml: true });
		expect(format).toBe("json");
		expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Both --json and --yaml"));

		errorSpy.mockRestore();
	});

	it("should return json for non-TTY when no flags specified", () => {
		// In test environment, stdout is not TTY
		const format = getOutputFormat({});
		expect(format).toBe("json");
	});
});

describe("useColors", () => {
	const originalEnv = { ...process.env };

	afterEach(() => {
		process.env = { ...originalEnv };
	});

	it("should return false when NO_COLOR is set", () => {
		process.env.NO_COLOR = "1";
		expect(useColors()).toBe(false);
	});

	it("should return true when FORCE_COLOR is set", () => {
		delete process.env.NO_COLOR;
		process.env.FORCE_COLOR = "1";
		expect(useColors()).toBe(true);
	});
});

describe("isTTY", () => {
	it("should return boolean", () => {
		const result = isTTY();
		expect(typeof result).toBe("boolean");
	});
});
