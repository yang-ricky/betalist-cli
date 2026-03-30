import type { CLIOutput } from "./models/index.js";

export type OutputFormat = "table" | "json" | "yaml";

export interface OutputOptions {
	json?: boolean;
	yaml?: boolean;
	verbose?: boolean;
}

/**
 * Detect if running in TTY (interactive terminal)
 */
export function isTTY(): boolean {
	return process.stdout.isTTY ?? false;
}

/**
 * Check if colors should be used
 */
export function useColors(): boolean {
	if (process.env.NO_COLOR) {
		return false;
	}
	if (process.env.FORCE_COLOR) {
		return true;
	}
	return isTTY();
}

/**
 * Determine output format based on options and environment
 */
export function getOutputFormat(options: OutputOptions): OutputFormat {
	// --json takes priority
	if (options.json) {
		if (options.yaml) {
			console.error(
				"Warning: Both --json and --yaml specified, using --json",
			);
		}
		return "json";
	}

	if (options.yaml) {
		return "yaml";
	}

	// Non-TTY defaults to JSON
	if (!isTTY()) {
		return "json";
	}

	return "table";
}

/**
 * Create a CLIOutput wrapper
 */
export function createOutput<T>(
	data: T,
	options: {
		dataSource: "api" | "html";
		providerChain?: string[];
		cacheHit?: boolean;
		degraded?: boolean;
		warnings?: string[];
	},
): CLIOutput<T> {
	return {
		ok: true,
		schemaVersion: "1",
		dataSource: options.dataSource,
		providerChain: options.providerChain || [options.dataSource],
		fetchedAt: new Date().toISOString(),
		cacheHit: options.cacheHit ?? false,
		degraded: options.degraded ?? false,
		warnings: options.warnings || [],
		data,
		error: null,
	};
}

/**
 * Create an error output
 */
export function createErrorOutput<T>(
	code: string,
	message: string,
	exitCode: number,
): CLIOutput<T> {
	return {
		ok: false,
		schemaVersion: "1",
		dataSource: "html",
		providerChain: [],
		fetchedAt: new Date().toISOString(),
		cacheHit: false,
		degraded: false,
		warnings: [],
		data: null,
		error: {
			code,
			message,
			exitCode,
		},
	};
}
