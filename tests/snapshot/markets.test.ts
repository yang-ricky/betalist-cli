import { describe, expect, it } from "vitest";
import { formatMarketsTable } from "../../src/formatter.js";
import type { Market } from "../../src/models/index.js";

// Strip ANSI codes
function stripAnsi(str: string): string {
	return str.replace(/\x1B\[[0-9;]*m/g, "");
}

describe("Markets Command Snapshot", () => {
	it("should format markets list consistently", () => {
		const mockMarkets: Market[] = [
			{ slug: "saas", name: "SaaS", startupCount: 1234 },
			{ slug: "ai", name: "AI", startupCount: 567 },
			{ slug: "fintech", name: "Fintech", startupCount: 890, parentSlug: "finance" },
		];

		const output = stripAnsi(formatMarketsTable(mockMarkets));
		expect(output).toMatchSnapshot();
	});

	it("should handle empty list", () => {
		const output = stripAnsi(formatMarketsTable([]));
		expect(output).toMatchSnapshot();
	});

	it("should handle minimal data", () => {
		const mockMarkets: Market[] = [{ slug: "minimal", name: "Minimal Category" }];

		const output = stripAnsi(formatMarketsTable(mockMarkets));
		expect(output).toMatchSnapshot();
	});
});
