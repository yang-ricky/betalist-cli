import { DEFAULTS } from "../constants.js";
import type { AuthProvider } from "./types.js";

export class AnonymousAuth implements AuthProvider {
	getHeaders(): Record<string, string> {
		return {
			"User-Agent": DEFAULTS.userAgent,
		};
	}

	getQueryParams(): Record<string, string> {
		return {};
	}

	isAuthenticated(): boolean {
		return false;
	}
}
