import { describe, expect, it } from "vitest";
import {
	formatMarketsTable,
	formatStartupDetail,
	formatStartupListTable,
} from "../../src/formatter.js";
import type { Market, Startup, StartupDetail } from "../../src/models/index.js";

// Strip ANSI codes for testing
function stripAnsi(str: string): string {
	return str.replace(/\x1B\[[0-9;]*m/g, "");
}

describe("formatStartupListTable", () => {
	it("should format startup list as table", () => {
		const startups: Startup[] = [
			{
				slug: "test-1",
				name: "Test Startup 1",
				url: "https://betalist.com/startups/test-1",
				tagline: "A great startup",
				date: "Mar 29",
				categories: ["SaaS", "AI"],
			},
			{
				slug: "test-2",
				name: "Test Startup 2",
				url: "https://betalist.com/startups/test-2",
			},
		];

		const output = stripAnsi(formatStartupListTable(startups));

		expect(output).toContain("Test Startup 1");
		expect(output).toContain("A great startup");
		expect(output).toContain("Mar 29");
		expect(output).toContain("SaaS, AI");
		expect(output).toContain("Test Startup 2");
		expect(output).toContain("-"); // Missing fields shown as "-"
	});

	it("should handle empty list", () => {
		const output = formatStartupListTable([]);
		expect(output).toBeDefined();
	});
});

describe("formatStartupDetail", () => {
	it("should format startup detail", () => {
		const startup: StartupDetail = {
			slug: "test",
			name: "Test Startup",
			url: "https://betalist.com/startups/test",
			description: "This is a great startup.",
			tagline: "Build something great",
			siteUrl: "https://teststartup.com",
			maker: "John Doe",
			makerHandle: "@johndoe",
			categories: ["SaaS", "Productivity"],
			topics: ["Developer Tools"],
			relatedStartups: [
				{ slug: "related-1", name: "Related 1", url: "https://betalist.com/startups/related-1" },
			],
		};

		const output = stripAnsi(formatStartupDetail(startup));

		expect(output).toContain("Test Startup");
		expect(output).toContain("Build something great");
		expect(output).toContain("This is a great startup.");
		expect(output).toContain("https://teststartup.com");
		expect(output).toContain("John Doe");
		expect(output).toContain("@johndoe");
		expect(output).toContain("SaaS");
		expect(output).toContain("Developer Tools");
		expect(output).toContain("Related 1");
	});

	it("should handle minimal detail", () => {
		const startup: StartupDetail = {
			slug: "minimal",
			name: "Minimal",
			url: "https://betalist.com/startups/minimal",
			description: "Just a description.",
		};

		const output = stripAnsi(formatStartupDetail(startup));
		expect(output).toContain("Minimal");
		expect(output).toContain("Just a description.");
	});
});

describe("formatMarketsTable", () => {
	it("should format markets as table", () => {
		const markets: Market[] = [
			{ slug: "saas", name: "SaaS", startupCount: 1234 },
			{ slug: "ai", name: "AI" },
		];

		const output = stripAnsi(formatMarketsTable(markets));

		expect(output).toContain("SaaS");
		expect(output).toContain("saas");
		expect(output).toContain("1234");
		expect(output).toContain("AI");
		expect(output).toContain("-"); // Missing startupCount
	});
});
