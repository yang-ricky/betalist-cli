import { Command } from "commander";
import { loadConfig } from "../config.js";
import { AnonymousAuth, TokenAuth } from "../auth/index.js";
import { FileCache } from "../cache/index.js";
import { BetaListBackend } from "../backends/index.js";
import {
	getOutputFormat,
	createOutput,
	createErrorOutput,
} from "../output.js";
import { formatStartupListTable } from "../formatter.js";
import { serialize } from "../serializer.js";
import { ExitCode } from "../errors.js";

export const latestCommand = new Command("latest")
	.description("Get latest startups from BetaList")
	.option("-l, --limit <n>", "Number of startups to fetch", "20")
	.option("-p, --page <n>", "Page number", "1")
	.option("--json", "Output as JSON")
	.option("--yaml", "Output as YAML")
	.option("-v, --verbose", "Verbose output")
	.action(async (options) => {
		try {
			const config = loadConfig();
			const auth = config.api.token
				? new TokenAuth(config.api.token)
				: new AnonymousAuth();
			const cache = new FileCache(config.cache.dir);
			const backend = new BetaListBackend(auth, cache, {
				delay: config.request.delay,
				timeout: config.request.timeout,
				retries: config.request.retries,
			});

			const limit = Number.parseInt(options.limit, 10);
			const page = Number.parseInt(options.page, 10);

			const startups = await backend.getLatest({ limit, page });

			const format = getOutputFormat(options);

			if (format === "table") {
				console.log(formatStartupListTable(startups));
			} else {
				const output = createOutput(startups, {
					dataSource: auth.isAuthenticated() ? "api" : "html",
					cacheHit: false,
				});
				console.log(serialize(output, format));
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unknown error";
			const format = getOutputFormat(options);

			if (format !== "table") {
				const output = createErrorOutput(
					"fetch_failed",
					message,
					ExitCode.NetworkError,
				);
				console.log(serialize(output, format));
			} else {
				console.error(`Error: ${message}`);
			}
			process.exit(ExitCode.NetworkError);
		}
	});
