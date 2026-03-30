import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import type { CacheKey } from "../models/index.js";
import type { Cache, CacheEntry } from "./types.js";

export class FileCache implements Cache {
	private cacheDir: string;
	private metaFile: string;

	constructor(cacheDir?: string) {
		this.cacheDir = cacheDir
			? cacheDir.replace(/^~/, os.homedir())
			: path.join(os.homedir(), ".betalist-cli", "cache");
		this.metaFile = path.join(this.cacheDir, "_meta.json");
		this.ensureDir();
	}

	private ensureDir(): void {
		if (!fs.existsSync(this.cacheDir)) {
			fs.mkdirSync(this.cacheDir, { recursive: true });
		}
	}

	private serializeKey(key: CacheKey): string {
		return `${key.provider}:${key.schemaVersion}:${key.entityType}:${key.entityKey}`;
	}

	private keyToFilename(key: CacheKey): string {
		const serialized = this.serializeKey(key);
		// Replace invalid filename chars
		const safe = serialized.replace(/[/:]/g, "_");
		return path.join(this.cacheDir, `${safe}.json`);
	}

	get<T>(key: CacheKey): CacheEntry<T> | null {
		const filepath = this.keyToFilename(key);
		if (!fs.existsSync(filepath)) {
			return null;
		}

		try {
			const content = fs.readFileSync(filepath, "utf-8");
			const entry = JSON.parse(content) as CacheEntry<T>;

			// Check TTL
			if (Date.now() > entry.expiresAt) {
				fs.unlinkSync(filepath);
				return null;
			}

			return entry;
		} catch {
			return null;
		}
	}

	set<T>(key: CacheKey, value: T, ttlSeconds: number): void {
		const filepath = this.keyToFilename(key);
		const now = new Date();
		const entry: CacheEntry<T> = {
			data: value,
			expiresAt: Date.now() + ttlSeconds * 1000,
			fetchedAt: now.toISOString(),
		};

		fs.writeFileSync(filepath, JSON.stringify(entry, null, 2));
		this.updateLastSuccessfulFetch(now.toISOString());
	}

	clear(): void {
		if (fs.existsSync(this.cacheDir)) {
			const files = fs.readdirSync(this.cacheDir);
			for (const file of files) {
				fs.unlinkSync(path.join(this.cacheDir, file));
			}
		}
	}

	private updateLastSuccessfulFetch(timestamp: string): void {
		const meta = { lastSuccessfulFetch: timestamp };
		fs.writeFileSync(this.metaFile, JSON.stringify(meta, null, 2));
	}

	getLastSuccessfulFetch(): string | null {
		if (!fs.existsSync(this.metaFile)) {
			return null;
		}
		try {
			const content = fs.readFileSync(this.metaFile, "utf-8");
			const meta = JSON.parse(content);
			return meta.lastSuccessfulFetch || null;
		} catch {
			return null;
		}
	}

	isWritable(): boolean {
		try {
			this.ensureDir();
			const testFile = path.join(this.cacheDir, "_test_write");
			fs.writeFileSync(testFile, "test");
			fs.unlinkSync(testFile);
			return true;
		} catch {
			return false;
		}
	}
}
