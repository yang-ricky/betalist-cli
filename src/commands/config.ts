import { Command } from "commander";
import { clearCache, getConfigDisplay, loadConfig, setConfigValue } from "../config.js";

export const configCommand = new Command("config").description("Manage CLI configuration");

configCommand
	.command("show")
	.description("Show current configuration")
	.action(() => {
		const config = loadConfig();
		const display = getConfigDisplay(config);
		console.log(JSON.stringify(display, null, 2));
	});

configCommand
	.command("set")
	.description("Set a configuration value")
	.argument("<key>", "Configuration key (e.g., api.token)")
	.argument("<value>", "Configuration value")
	.action((key: string, value: string) => {
		try {
			setConfigValue(key, value);
			console.log(`Set ${key} = ${key.includes("token") ? "****" : value}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error(`Error: ${message}`);
			process.exit(1);
		}
	});

configCommand
	.command("cache-clear")
	.description("Clear the local cache")
	.action(() => {
		try {
			const config = loadConfig();
			clearCache(config);
			console.log("Cache cleared successfully");
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			console.error(`Error: ${message}`);
			process.exit(1);
		}
	});
