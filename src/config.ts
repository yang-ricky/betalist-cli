import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import yaml from "js-yaml";
import { API_BASE_URL, DEFAULTS } from "./constants.js";
import { ConfigError } from "./errors.js";

export interface Config {
	api: {
		token: string;
		baseUrl: string;
	};
	cache: {
		enabled: boolean;
		dir: string;
		ttl: {
			list: number;
			startup: number;
			markets: number;
			regions: number;
		};
		cacheErrors: boolean;
	};
	request: {
		delay: number;
		timeout: number;
		retries: number;
		userAgent: string;
	};
}

const DEFAULT_CONFIG: Config = {
	api: {
		token: "",
		baseUrl: API_BASE_URL,
	},
	cache: {
		enabled: true,
		dir: path.join(os.homedir(), ".betalist-cli", "cache"),
		ttl: { ...DEFAULTS.cacheTTL },
		cacheErrors: false,
	},
	request: {
		delay: DEFAULTS.delay,
		timeout: DEFAULTS.timeout,
		retries: DEFAULTS.retries,
		userAgent: DEFAULTS.userAgent,
	},
};

function getConfigDir(): string {
	return path.join(os.homedir(), ".betalist-cli");
}

function getConfigPath(): string {
	return path.join(getConfigDir(), "config.yaml");
}

function ensureConfigDir(): void {
	const dir = getConfigDir();
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
}

function loadConfigFile(): Partial<Config> {
	const configPath = getConfigPath();
	if (!fs.existsSync(configPath)) {
		return {};
	}

	try {
		const content = fs.readFileSync(configPath, "utf-8");
		return (yaml.load(content) as Partial<Config>) || {};
	} catch (_error) {
		throw new ConfigError(`Failed to parse config file: ${configPath}`);
	}
}

function loadEnvConfig(): Partial<Config> {
	const env: Partial<Config> = {};

	if (process.env.BL_API_TOKEN) {
		env.api = { ...DEFAULT_CONFIG.api, token: process.env.BL_API_TOKEN };
	}
	if (process.env.BL_API_BASE_URL) {
		env.api = { ...(env.api || DEFAULT_CONFIG.api), baseUrl: process.env.BL_API_BASE_URL };
	}
	if (process.env.BL_CACHE_ENABLED) {
		env.cache = {
			...DEFAULT_CONFIG.cache,
			enabled: process.env.BL_CACHE_ENABLED !== "false",
		};
	}
	if (process.env.BL_CACHE_DIR) {
		env.cache = {
			...(env.cache || DEFAULT_CONFIG.cache),
			dir: process.env.BL_CACHE_DIR,
		};
	}
	if (process.env.BL_REQUEST_DELAY) {
		env.request = {
			...DEFAULT_CONFIG.request,
			delay: Number.parseInt(process.env.BL_REQUEST_DELAY, 10),
		};
	}
	if (process.env.BL_REQUEST_TIMEOUT) {
		env.request = {
			...(env.request || DEFAULT_CONFIG.request),
			timeout: Number.parseInt(process.env.BL_REQUEST_TIMEOUT, 10),
		};
	}

	return env;
}

function deepMerge(target: Config, ...sources: Partial<Config>[]): Config {
	const result = JSON.parse(JSON.stringify(target)) as Config;

	for (const source of sources) {
		if (source.api) {
			result.api = { ...result.api, ...source.api };
		}
		if (source.cache) {
			result.cache = {
				...result.cache,
				...source.cache,
				ttl: { ...result.cache.ttl, ...source.cache.ttl },
			};
		}
		if (source.request) {
			result.request = { ...result.request, ...source.request };
		}
	}

	return result;
}

export function loadConfig(): Config {
	const fileConfig = loadConfigFile();
	const envConfig = loadEnvConfig();

	// Priority: env > file > defaults
	return deepMerge(DEFAULT_CONFIG, fileConfig, envConfig);
}

export function setConfigValue(key: string, value: string): void {
	ensureConfigDir();
	const configPath = getConfigPath();

	let config: Record<string, unknown> = {};
	if (fs.existsSync(configPath)) {
		try {
			const content = fs.readFileSync(configPath, "utf-8");
			config = (yaml.load(content) as Record<string, unknown>) || {};
		} catch {
			config = {};
		}
	}

	// Handle nested keys like "api.token"
	const keys = key.split(".");
	let current = config;
	for (let i = 0; i < keys.length - 1; i++) {
		const k = keys[i];
		if (!(k in current) || typeof current[k] !== "object") {
			current[k] = {};
		}
		current = current[k] as Record<string, unknown>;
	}
	current[keys[keys.length - 1]] = value;

	const yamlContent = yaml.dump(config);
	fs.writeFileSync(configPath, yamlContent, { mode: 0o600 });
}

export function getConfigDisplay(config: Config): Record<string, unknown> {
	// Mask token for display
	const display = JSON.parse(JSON.stringify(config));
	if (display.api?.token) {
		const token = display.api.token;
		display.api.token = token.length > 8 ? `${token.slice(0, 8)}****` : "****";
	}
	return display;
}

export function clearCache(config: Config): void {
	const cacheDir = config.cache.dir;
	if (fs.existsSync(cacheDir)) {
		const files = fs.readdirSync(cacheDir);
		for (const file of files) {
			fs.unlinkSync(path.join(cacheDir, file));
		}
	}
}
