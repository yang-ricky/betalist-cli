import { createRequire } from "node:module";
import { program } from "commander";
import {
	configCommand,
	doctorCommand,
	latestCommand,
	marketsCommand,
	startupCommand,
} from "./commands/index.js";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

program
	.name("betalist")
	.description("Unofficial CLI for BetaList — discover tomorrow's startups, today")
	.version(pkg.version);

// Register commands
program.addCommand(latestCommand);
program.addCommand(startupCommand);
program.addCommand(marketsCommand);
program.addCommand(doctorCommand);
program.addCommand(configCommand);

program.parse();
