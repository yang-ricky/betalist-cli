import { Command } from "commander";
import chalk from "chalk";
import { loadConfig, clearCache } from "../config.js";
import { AnonymousAuth, TokenAuth } from "../auth/index.js";
import { FileCache } from "../cache/index.js";
import { SITE_URL, API_BASE_URL } from "../constants.js";
import { parseStartupList } from "../parsers/index.js";

interface CheckResult {
	name: string;
	status: "ok" | "warn" | "error";
	message: string;
	suggestion?: string;
}

export const doctorCommand = new Command("doctor")
	.description("Check CLI health and diagnose issues")
	.option("--fix", "Attempt to fix local issues")
	.action(async (options) => {
		const config = loadConfig();
		const results: CheckResult[] = [];

		console.log(chalk.bold("\nBetaList CLI Health Check"));
		console.log("═".repeat(50));
		console.log();

		// 1. Website reachability
		console.log(chalk.bold("Website"));
		const websiteResult = await checkWebsite();
		results.push(websiteResult);
		printResult(websiteResult);

		// 2. Selectors check
		console.log();
		console.log(chalk.bold("Selectors (HTML — primary)"));
		const selectorResults = await checkSelectors();
		for (const r of selectorResults) {
			results.push(r);
			printResult(r);
		}

		// 3. API check (if token configured)
		if (config.api.token) {
			console.log();
			console.log(chalk.bold("API (optional enhancement)"));
			const apiResults = await checkApi(config.api.token, config.api.baseUrl);
			for (const r of apiResults) {
				results.push(r);
				printResult(r);
			}
		}

		// 4. Cache check
		console.log();
		console.log(chalk.bold("Cache"));
		const cache = new FileCache(config.cache.dir);
		const cacheResults = checkCache(cache);
		for (const r of cacheResults) {
			results.push(r);
			printResult(r);
		}

		// Summary
		console.log();
		console.log("═".repeat(50));

		const errors = results.filter((r) => r.status === "error");
		const warnings = results.filter((r) => r.status === "warn");

		if (errors.length === 0 && warnings.length === 0) {
			console.log(chalk.green("✓ All checks passed!"));
		} else {
			if (errors.length > 0) {
				console.log(
					chalk.red(`${errors.length} error(s) found.`),
				);
			}
			if (warnings.length > 0) {
				console.log(
					chalk.yellow(`${warnings.length} warning(s) found.`),
				);
			}

			// Show suggestions
			const suggestions = results
				.filter((r) => r.suggestion)
				.map((r) => r.suggestion);
			if (suggestions.length > 0) {
				console.log();
				console.log(chalk.bold("Suggestions:"));
				for (const s of suggestions) {
					console.log(`  • ${s}`);
				}
			}
		}

		// Handle --fix
		if (options.fix) {
			console.log();
			console.log(chalk.bold("Attempting fixes..."));

			// Clear cache
			try {
				clearCache(config);
				console.log(chalk.green("  ✓ Cache cleared"));
			} catch {
				console.log(chalk.red("  ✗ Failed to clear cache"));
			}
		}

		console.log();
	});

async function checkWebsite(): Promise<CheckResult> {
	const start = Date.now();
	try {
		const response = await fetch(SITE_URL, {
			headers: { "User-Agent": "betalist-cli/0.1" },
		});
		const elapsed = Date.now() - start;

		if (response.ok) {
			return {
				name: "Website reachable",
				status: "ok",
				message: `${SITE_URL} — ${response.status} OK, ${elapsed}ms`,
			};
		}
		return {
			name: "Website reachable",
			status: "error",
			message: `${SITE_URL} — HTTP ${response.status}`,
			suggestion: "Check your network connection",
		};
	} catch (error) {
		return {
			name: "Website reachable",
			status: "error",
			message: `${SITE_URL} — Connection failed`,
			suggestion: "Check your network connection",
		};
	}
}

async function checkSelectors(): Promise<CheckResult[]> {
	const results: CheckResult[] = [];

	try {
		const response = await fetch(SITE_URL, {
			headers: { "User-Agent": "betalist-cli/0.1" },
		});

		if (!response.ok) {
			results.push({
				name: "Startup list page",
				status: "error",
				message: "Could not fetch homepage",
			});
			return results;
		}

		const html = await response.text();
		const startups = parseStartupList(html);

		if (startups.length > 0) {
			results.push({
				name: "Startup list page",
				status: "ok",
				message: `Parsed ${startups.length} startups from homepage`,
			});
		} else {
			results.push({
				name: "Startup list page",
				status: "warn",
				message: "No startups parsed — selectors may need updating",
				suggestion: "Run `npm outdated betalist-cli` to check for updates",
			});
		}
	} catch (error) {
		results.push({
			name: "Startup list page",
			status: "error",
			message: "Failed to parse homepage",
			suggestion: "Check if betalist-cli needs an update",
		});
	}

	return results;
}

async function checkApi(
	token: string,
	baseUrl: string,
): Promise<CheckResult[]> {
	const results: CheckResult[] = [];

	// Check API reachability
	const start = Date.now();
	try {
		const url = `${baseUrl}/startups?access_token=${token}&per_page=1`;
		const response = await fetch(url, {
			headers: { "User-Agent": "betalist-cli/0.1" },
		});
		const elapsed = Date.now() - start;

		if (response.ok) {
			results.push({
				name: "API reachable",
				status: "ok",
				message: `${baseUrl} — ${response.status} OK, ${elapsed}ms`,
			});

			// Check token validity
			const data = await response.json();
			if (Array.isArray(data)) {
				results.push({
					name: "API token valid",
					status: "ok",
					message: "Token is working",
				});
				results.push({
					name: "Startups endpoint",
					status: "ok",
					message: `${data.length} item(s) fetched`,
				});
			}
		} else if (response.status === 401 || response.status === 403) {
			results.push({
				name: "API token",
				status: "error",
				message: "Token is invalid or expired",
				suggestion: "Request a new token from api@betalist.com",
			});
		} else {
			results.push({
				name: "API reachable",
				status: "warn",
				message: `${baseUrl} — HTTP ${response.status}`,
			});
		}
	} catch {
		results.push({
			name: "API reachable",
			status: "warn",
			message: `${baseUrl} — Connection failed`,
			suggestion: "API may be unavailable; HTML fallback will be used",
		});
	}

	return results;
}

function checkCache(cache: FileCache): CheckResult[] {
	const results: CheckResult[] = [];

	// Check if cache is writable
	if (cache.isWritable()) {
		results.push({
			name: "Cache directory",
			status: "ok",
			message: "Cache directory is writable",
		});
	} else {
		results.push({
			name: "Cache directory",
			status: "error",
			message: "Cache directory is not writable",
			suggestion: "Check permissions for ~/.betalist-cli/cache",
		});
	}

	// Check last successful fetch
	const lastFetch = cache.getLastSuccessfulFetch();
	if (lastFetch) {
		const ago = getTimeAgo(new Date(lastFetch));
		results.push({
			name: "Last successful fetch",
			status: "ok",
			message: ago,
		});
	} else {
		results.push({
			name: "Last successful fetch",
			status: "warn",
			message: "No cached data yet",
		});
	}

	return results;
}

function printResult(result: CheckResult): void {
	const icon =
		result.status === "ok"
			? chalk.green("✓")
			: result.status === "warn"
				? chalk.yellow("!")
				: chalk.red("✗");

	console.log(`  ${icon} ${result.name} — ${result.message}`);
}

function getTimeAgo(date: Date): string {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

	if (seconds < 60) return "just now";
	if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
	if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
	return `${Math.floor(seconds / 86400)} days ago`;
}
