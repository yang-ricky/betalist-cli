import { Command } from "commander";
import { AnonymousAuth, TokenAuth } from "../auth/index.js";
import { BetaListBackend } from "../backends/index.js";
import { FileCache } from "../cache/index.js";
import { loadConfig } from "../config.js";
import { ExitCode } from "../errors.js";
import { formatMarketsTable } from "../formatter.js";
import { createErrorOutput, createOutput, getOutputFormat } from "../output.js";
import { serialize } from "../serializer.js";

export const marketsCommand = new Command("markets")
	.description("List all markets/categories")
	.option("--json", "Output as JSON")
	.option("--yaml", "Output as YAML")
	.option("-v, --verbose", "Verbose output")
	.action(async (options) => {
		try {
			const config = loadConfig();
			const auth = config.api.token ? new TokenAuth(config.api.token) : new AnonymousAuth();
			const cache = new FileCache(config.cache.dir);
			const backend = new BetaListBackend(auth, cache, {
				delay: config.request.delay,
				timeout: config.request.timeout,
				retries: config.request.retries,
			});

			const markets = await backend.getMarkets();

			const format = getOutputFormat(options);

			if (format === "table") {
				console.log(formatMarketsTable(markets));
			} else {
				const output = createOutput(markets, {
					dataSource: auth.isAuthenticated() ? "api" : "html",
					cacheHit: false,
				});
				console.log(serialize(output, format));
			}
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			const format = getOutputFormat(options);

			if (format !== "table") {
				const output = createErrorOutput("fetch_failed", message, ExitCode.NetworkError);
				console.log(serialize(output, format));
			} else {
				console.error(`Error: ${message}`);
			}
			process.exit(ExitCode.NetworkError);
		}
	});
