import * as cheerio from "cheerio";
import type { Market } from "../models/index.js";
import { MARKET_SELECTORS } from "../selectors.js";

const CATEGORY_PATH_RE = /^\/browse\/([^/?#]+)$/;

/**
 * Parse market list from browse page HTML
 */
export function parseMarketList(html: string): Market[] {
	const $ = cheerio.load(html);
	const markets: Market[] = [];
	const seen = new Set<string>();

	$(MARKET_SELECTORS.listItem).each((_, el) => {
		const $el = $(el);
		const href = $el.is("a") ? $el.attr("href") || "" : $el.find(MARKET_SELECTORS.slug).attr("href") || "";
		const slug = href.match(CATEGORY_PATH_RE)?.[1];

		let name = "";
		if ($el.is("a")) {
			const clone = $el.clone();
			clone.find(MARKET_SELECTORS.count).remove();
			name = normalizeText(clone.text().replace(/\p{Extended_Pictographic}/gu, ""));
		} else {
			name = normalizeText($el.find(MARKET_SELECTORS.name).first().text());
		}

		if (!slug || !name || seen.has(slug)) {
			return;
		}

		const market: Market = {
			slug,
			name,
		};

		const countSource = $el.is("a")
			? $el.find(MARKET_SELECTORS.count).first().text() || $el.text()
			: $el.find(MARKET_SELECTORS.count).text();
		const countMatch = countSource.match(/(\d[\d,]*)/);
		if (countMatch) {
			market.startupCount = Number.parseInt(countMatch[1].replace(/,/g, ""), 10);
		}

		const parentHref = $el.find(MARKET_SELECTORS.parentSlug).attr("href") || "";
		const parentMatch = parentHref.match(/\/browse\/([^/?#]+)/);
		if (parentMatch && parentMatch[1] !== slug) {
			market.parentSlug = parentMatch[1];
		}

		seen.add(slug);
		markets.push(market);
	});

	return markets;
}

function normalizeText(value: string): string {
	return value.replace(/\s+/g, " ").trim();
}
