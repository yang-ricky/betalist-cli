export interface AuthProvider {
	getHeaders(): Record<string, string>;
	getQueryParams(): Record<string, string>;
	isAuthenticated(): boolean;
}
