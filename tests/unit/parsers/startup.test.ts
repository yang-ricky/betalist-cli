import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ParseError } from "../../../src/errors.js";
import { parseStartupDetail, parseStartupList } from "../../../src/parsers/startup.js";

const fixturesDir = join(__dirname, "../../fixtures");

describe("parseStartupList", () => {
	it("should parse startups from HTML list", () => {
		const html = readFileSync(join(fixturesDir, "html/startup-list.html"), "utf-8");
		const startups = parseStartupList(html);

		expect(startups).toHaveLength(3);

		// First startup - full data
		expect(startups[0].slug).toBe("test-startup-1");
		expect(startups[0].name).toBe("Test Startup 1");
		expect(startups[0].url).toBe("https://betalist.com/startups/test-startup-1");
		expect(startups[0].tagline).toBe("The first test startup for unit testing");
		expect(startups[0].date).toBe("Mar 29, 2026");
		expect(startups[0].categories).toEqual(["SaaS", "Productivity"]);
		expect(startups[0].isBoosted).toBeUndefined();

		// Second startup - boosted
		expect(startups[1].slug).toBe("test-startup-2");
		expect(startups[1].isBoosted).toBe(true);
		expect(startups[1].categories).toEqual(["AI"]);

		// Third startup - minimal data
		expect(startups[2].slug).toBe("minimal-startup");
		expect(startups[2].name).toBe("Minimal Startup");
		expect(startups[2].tagline).toBeUndefined();
		expect(startups[2].categories).toBeUndefined();
	});

	it("should return empty array for HTML without startups", () => {
		const html = "<html><body><p>No startups here</p></body></html>";
		const startups = parseStartupList(html);
		expect(startups).toEqual([]);
	});

	it("should skip items without required fields", () => {
		const html = `
			<div class="startupCard">
				<a class="startupCard__link" href="/startups/valid">
					<h3 class="startupCard__name">Valid</h3>
				</a>
			</div>
			<div class="startupCard">
				<a class="startupCard__link" href="">
					<h3 class="startupCard__name">No Slug</h3>
				</a>
			</div>
			<div class="startupCard">
				<a class="startupCard__link" href="/startups/no-name">
				</a>
			</div>
		`;
		const startups = parseStartupList(html);
		expect(startups).toHaveLength(1);
		expect(startups[0].slug).toBe("valid");
	});
});

describe("parseStartupDetail", () => {
	it("should parse startup detail from HTML", () => {
		const html = readFileSync(join(fixturesDir, "html/startup-detail.html"), "utf-8");
		const startup = parseStartupDetail(html, "test-startup-1");

		expect(startup.slug).toBe("test-startup-1");
		expect(startup.name).toBe("Test Startup 1");
		expect(startup.url).toBe("https://betalist.com/startups/test-startup-1");
		expect(startup.tagline).toBe("The first test startup for unit testing");
		expect(startup.description).toContain("comprehensive description");
		expect(startup.siteUrl).toBe("https://teststartup1.com");
		expect(startup.maker).toBe("John Doe");
		expect(startup.makerHandle).toBe("@johndoe");
		expect(startup.categories).toEqual(["SaaS", "Productivity"]);
		expect(startup.topics).toEqual(["Developer Tools", "Automation"]);
		expect(startup.relatedStartups).toHaveLength(2);
		expect(startup.relatedStartups?.[0].slug).toBe("related-startup-1");
	});

	it("should throw ParseError when name is missing", () => {
		const html = "<html><body><div class='startup-description'>Some desc</div></body></html>";
		expect(() => parseStartupDetail(html, "test")).toThrow(ParseError);
	});

	it("should throw ParseError when description is missing", () => {
		const html = "<html><body><h1 class='startup-name'>Test</h1></body></html>";
		expect(() => parseStartupDetail(html, "test")).toThrow(ParseError);
	});
});
