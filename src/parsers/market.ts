import * as cheerio from "cheerio";
import type { Market } from "../models/index.js";
import { MARKET_SELECTORS } from "../selectors.js";

/**
 * Parse market list from browse page HTML
 */
export function parseMarketList(html: string): Market[] {
	const $ = cheerio.load(html);
	const markets: Market[] = [];

	$(MARKET_SELECTORS.listItem).each((_, el) => {
		const $el = $(el);

		// Extract slug from link href
		const href = $el.find(MARKET_SELECTORS.slug).attr("href") || "";
		const slugMatch = href.match(/\/browse\/([^/?#]+)/);
		const slug = slugMatch?.[1];

		const name = $el.find(MARKET_SELECTORS.name).text().trim();

		// required fields must exist
		if (!slug || !name) {
			return; // skip this item
		}

		const market: Market = {
			slug,
			name,
		};

		// optional fields
		const countText = $el.find(MARKET_SELECTORS.count).text().trim();
		const countMatch = countText.match(/(\d+)/);
		if (countMatch) {
			market.startupCount = Number.parseInt(countMatch[1], 10);
		}

		const parentHref = $el.find(MARKET_SELECTORS.parentSlug).attr("href") || "";
		const parentMatch = parentHref.match(/\/browse\/([^/?#]+)/);
		if (parentMatch) {
			market.parentSlug = parentMatch[1];
		}

		markets.push(market);
	});

	return markets;
}
