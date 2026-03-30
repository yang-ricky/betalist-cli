import yaml from "js-yaml";
import type { CLIOutput } from "./models/index.js";

/**
 * Serialize output to JSON
 */
export function toJSON<T>(output: CLIOutput<T>): string {
	return JSON.stringify(output, null, 2);
}

/**
 * Serialize output to YAML
 */
export function toYAML<T>(output: CLIOutput<T>): string {
	return yaml.dump(output, {
		indent: 2,
		lineWidth: 120,
		noRefs: true,
	});
}

/**
 * Serialize based on format
 */
export function serialize<T>(
	output: CLIOutput<T>,
	format: "json" | "yaml",
): string {
	if (format === "yaml") {
		return toYAML(output);
	}
	return toJSON(output);
}
