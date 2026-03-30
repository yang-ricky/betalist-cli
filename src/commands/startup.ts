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
import { formatStartupDetail } from "../formatter.js";
import { serialize } from "../serializer.js";
import { ExitCode, ParseError } from "../errors.js";

export const startupCommand = new Command("startup")
	.description("Get details of a specific startup")
	.argument("<slug>", "Startup slug (e.g., dusk-ai)")
	.option("--json", "Output as JSON")
	.option("--yaml", "Output as YAML")
	.option("-v, --verbose", "Verbose output")
	.action(async (slug: string, options) => {
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

			const startup = await backend.getStartup(slug);

			const format = getOutputFormat(options);

			if (format === "table") {
				console.log(formatStartupDetail(startup));
			} else {
				const output = createOutput(startup, {
					dataSource: auth.isAuthenticated() ? "api" : "html",
					cacheHit: false,
				});
				console.log(serialize(output, format));
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Unknown error";
			const format = getOutputFormat(options);
			const exitCode =
				error instanceof ParseError
					? ExitCode.ParseError
					: ExitCode.NetworkError;

			if (format !== "table") {
				const output = createErrorOutput(
					error instanceof ParseError ? "parse_failed" : "fetch_failed",
					message,
					exitCode,
				);
				console.log(serialize(output, format));
			} else {
				console.error(`Error: ${message}`);
			}
			process.exit(exitCode);
		}
	});
