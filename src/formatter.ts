import chalk from "chalk";
import Table from "cli-table3";
import type { Startup, StartupDetail, Market, Region } from "./models/index.js";
import { useColors } from "./output.js";

const c = useColors() ? chalk : chalk;

/**
 * Format startup list as table
 */
export function formatStartupListTable(startups: Startup[]): string {
	const table = new Table({
		head: [
			c.bold("Name"),
			c.bold("Tagline"),
			c.bold("Date"),
			c.bold("Categories"),
		],
		style: {
			head: [],
			border: [],
		},
		wordWrap: true,
		colWidths: [20, 40, 12, 20],
	});

	for (const startup of startups) {
		table.push([
			c.cyan(startup.name),
			startup.tagline || "-",
			startup.date || "-",
			startup.categories?.join(", ") || "-",
		]);
	}

	return table.toString();
}

/**
 * Format startup detail
 */
export function formatStartupDetail(startup: StartupDetail): string {
	const lines: string[] = [];

	lines.push(c.bold.cyan(`\n${startup.name}`));
	if (startup.tagline) {
		lines.push(c.dim(startup.tagline));
	}
	lines.push("");

	lines.push(c.bold("Description:"));
	lines.push(startup.description);
	lines.push("");

	if (startup.siteUrl) {
		lines.push(`${c.bold("Website:")} ${c.underline(startup.siteUrl)}`);
	}

	lines.push(`${c.bold("BetaList:")} ${c.underline(startup.url)}`);

	if (startup.maker) {
		lines.push(
			`${c.bold("Maker:")} ${startup.maker}${startup.makerHandle ? ` (${startup.makerHandle})` : ""}`,
		);
	}

	if (startup.categories && startup.categories.length > 0) {
		lines.push(
			`${c.bold("Categories:")} ${startup.categories.map((cat) => c.green(cat)).join(", ")}`,
		);
	}

	if (startup.topics && startup.topics.length > 0) {
		lines.push(
			`${c.bold("Topics:")} ${startup.topics.map((t) => c.yellow(t)).join(", ")}`,
		);
	}

	if (startup.relatedStartups && startup.relatedStartups.length > 0) {
		lines.push("");
		lines.push(c.bold("Related Startups:"));
		for (const related of startup.relatedStartups.slice(0, 5)) {
			lines.push(`  • ${c.cyan(related.name)}`);
		}
	}

	return lines.join("\n");
}

/**
 * Format markets list as table
 */
export function formatMarketsTable(markets: Market[]): string {
	const table = new Table({
		head: [c.bold("Name"), c.bold("Slug"), c.bold("Startups")],
		style: {
			head: [],
			border: [],
		},
	});

	for (const market of markets) {
		table.push([
			c.cyan(market.name),
			market.slug,
			market.startupCount?.toString() || "-",
		]);
	}

	return table.toString();
}

/**
 * Format regions list as table
 */
export function formatRegionsTable(regions: Region[]): string {
	const table = new Table({
		head: [c.bold("Name"), c.bold("Slug"), c.bold("Startups")],
		style: {
			head: [],
			border: [],
		},
	});

	for (const region of regions) {
		table.push([
			c.cyan(region.name),
			region.slug,
			region.startupCount?.toString() || "-",
		]);
	}

	return table.toString();
}

/**
 * Format search results
 */
export function formatSearchResultsTable(
	startups: Startup[],
	quality: "exact" | "best-effort",
): string {
	const header =
		quality === "best-effort"
			? c.dim("(search quality: best-effort)\n")
			: "";

	return header + formatStartupListTable(startups);
}
