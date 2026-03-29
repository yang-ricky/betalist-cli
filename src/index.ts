import { program } from "commander";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

program
	.name("betalist")
	.description("Unofficial CLI for BetaList — discover tomorrow's startups, today")
	.version(pkg.version);

program.parse();
