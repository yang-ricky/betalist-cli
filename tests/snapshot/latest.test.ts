import { describe, expect, it } from "vitest";
import { formatStartupListTable } from "../../src/formatter.js";
import type { Startup } from "../../src/models/index.js";

// Strip ANSI codes
function stripAnsi(str: string): string {
	return str.replace(/\x1B\[[0-9;]*m/g, "");
}

describe("Latest Command Snapshot", () => {
	it("should format startup list consistently", () => {
		const mockStartups: Startup[] = [
			{
				slug: "startup-1",
				name: "Startup One",
				url: "https://betalist.com/startups/startup-1",
				tagline: "The first startup",
				date: "2026-03-29",
				categories: ["SaaS", "AI"],
			},
			{
				slug: "startup-2",
				name: "Startup Two",
				url: "https://betalist.com/startups/startup-2",
				tagline: "The second startup",
				date: "2026-03-28",
				categories: ["Fintech"],
			},
		];

		const output = stripAnsi(formatStartupListTable(mockStartups));
		expect(output).toMatchSnapshot();
	});

	it("should handle empty list", () => {
		const output = stripAnsi(formatStartupListTable([]));
		expect(output).toMatchSnapshot();
	});

	it("should handle minimal data", () => {
		const mockStartups: Startup[] = [
			{
				slug: "minimal",
				name: "Minimal Startup",
				url: "https://betalist.com/startups/minimal",
			},
		];

		const output = stripAnsi(formatStartupListTable(mockStartups));
		expect(output).toMatchSnapshot();
	});
});
