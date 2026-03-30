import { describe, expect, it } from "vitest";
import { formatStartupDetail } from "../../src/formatter.js";
import type { StartupDetail } from "../../src/models/index.js";

// Strip ANSI codes
function stripAnsi(str: string): string {
	return str.replace(/\x1B\[[0-9;]*m/g, "");
}

describe("Startup Command Snapshot", () => {
	it("should format startup detail consistently", () => {
		const mockStartup: StartupDetail = {
			slug: "test-startup",
			name: "Test Startup",
			url: "https://betalist.com/startups/test-startup",
			description:
				"This is a comprehensive description of the startup. It provides amazing features.",
			tagline: "Build something amazing",
			siteUrl: "https://teststartup.com",
			maker: "John Doe",
			makerHandle: "@johndoe",
			categories: ["SaaS", "Productivity"],
			topics: ["Developer Tools", "Automation"],
			relatedStartups: [
				{ slug: "related-1", name: "Related One", url: "https://betalist.com/startups/related-1" },
				{ slug: "related-2", name: "Related Two", url: "https://betalist.com/startups/related-2" },
			],
		};

		const output = stripAnsi(formatStartupDetail(mockStartup));
		expect(output).toMatchSnapshot();
	});

	it("should handle minimal detail", () => {
		const mockStartup: StartupDetail = {
			slug: "minimal",
			name: "Minimal Startup",
			url: "https://betalist.com/startups/minimal",
			description: "Just a simple description.",
		};

		const output = stripAnsi(formatStartupDetail(mockStartup));
		expect(output).toMatchSnapshot();
	});
});
