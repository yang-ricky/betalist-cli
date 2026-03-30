import { DEFAULTS } from "../constants.js";
import type { AuthProvider } from "./types.js";

export class TokenAuth implements AuthProvider {
	constructor(private token: string) {}

	getHeaders(): Record<string, string> {
		return {
			"User-Agent": DEFAULTS.userAgent,
		};
	}

	getQueryParams(): Record<string, string> {
		return {
			access_token: this.token,
		};
	}

	isAuthenticated(): boolean {
		return true;
	}
}
