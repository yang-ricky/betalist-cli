import * as cheerio from "cheerio";
import { SITE_URL } from "../constants.js";
import { ParseError } from "../errors.js";
import type { Startup, StartupDetail } from "../models/index.js";
import { STARTUP_SELECTORS } from "../selectors.js";

/**
 * Parse startup list from homepage HTML
 */
export function parseStartupList(html: string): Startup[] {
	const $ = cheerio.load(html);
	const startups: Startup[] = [];

	$(STARTUP_SELECTORS.listItem).each((_, el) => {
		const $el = $(el);

		// Extract slug from link href
		const href = $el.find(STARTUP_SELECTORS.listLink).attr("href") || "";
		const slugMatch = href.match(/\/startups\/([^/?#]+)/);
		const slug = slugMatch?.[1];

		const name = $el.find(STARTUP_SELECTORS.listName).text().trim();

		// required fields must exist
		if (!slug || !name) {
			return; // skip this item
		}

		const startup: Startup = {
			slug,
			name,
			url: `${SITE_URL}/startups/${slug}`,
		};

		// optional fields
		const tagline = $el.find(STARTUP_SELECTORS.listTagline).text().trim();
		if (tagline) startup.tagline = tagline;

		const logoUrl = $el.find(STARTUP_SELECTORS.listLogo).attr("src");
		if (logoUrl) startup.logoUrl = logoUrl;

		const date = $el.find(STARTUP_SELECTORS.listDate).text().trim();
		if (date) startup.date = date;

		// fragile fields
		const categories: string[] = [];
		$el.find(STARTUP_SELECTORS.listCategories).each((_, catEl) => {
			const cat = $(catEl).text().trim();
			if (cat) categories.push(cat);
		});
		if (categories.length > 0) startup.categories = categories;

		const isBoosted = $el.is(STARTUP_SELECTORS.listBoosted);
		if (isBoosted) startup.isBoosted = true;

		startups.push(startup);
	});

	return startups;
}

/**
 * Parse startup detail from detail page HTML
 */
export function parseStartupDetail(html: string, slug: string): StartupDetail {
	const $ = cheerio.load(html);

	// required: name
	const name = $(STARTUP_SELECTORS.name).text().trim();
	if (!name) {
		throw new ParseError(`Failed to parse startup name for slug: ${slug}`);
	}

	// required: description
	const description = $(STARTUP_SELECTORS.description).text().trim();
	if (!description) {
		throw new ParseError(`Failed to parse startup description for slug: ${slug}`);
	}

	const startup: StartupDetail = {
		slug,
		name,
		url: `${SITE_URL}/startups/${slug}`,
		description,
	};

	// optional fields
	const tagline = $(STARTUP_SELECTORS.tagline).text().trim();
	if (tagline) startup.tagline = tagline;

	const logoUrl = $(STARTUP_SELECTORS.logoImg).attr("src");
	if (logoUrl) startup.logoUrl = logoUrl;

	const siteUrl = $(STARTUP_SELECTORS.siteLink).attr("href");
	if (siteUrl) startup.siteUrl = siteUrl;

	const maker = $(STARTUP_SELECTORS.maker).text().trim();
	if (maker) startup.maker = maker;

	const makerHandle = $(STARTUP_SELECTORS.makerHandle).text().trim();
	if (makerHandle) startup.makerHandle = makerHandle;

	// fragile fields
	const categories: string[] = [];
	$(STARTUP_SELECTORS.categories).each((_, el) => {
		const cat = $(el).text().trim();
		if (cat) categories.push(cat);
	});
	if (categories.length > 0) startup.categories = categories;

	const topics: string[] = [];
	$(STARTUP_SELECTORS.topics).each((_, el) => {
		const topic = $(el).text().trim();
		if (topic) topics.push(topic);
	});
	if (topics.length > 0) startup.topics = topics;

	// Related startups (fragile)
	const relatedStartups: Startup[] = [];
	$(STARTUP_SELECTORS.relatedList).each((_, el) => {
		const $el = $(el);
		const href = $el.find(STARTUP_SELECTORS.listLink).attr("href") || "";
		const relSlugMatch = href.match(/\/startups\/([^/?#]+)/);
		const relSlug = relSlugMatch?.[1];
		const relName = $el.find(STARTUP_SELECTORS.listName).text().trim();

		if (relSlug && relName) {
			relatedStartups.push({
				slug: relSlug,
				name: relName,
				url: `${SITE_URL}/startups/${relSlug}`,
			});
		}
	});
	if (relatedStartups.length > 0) startup.relatedStartups = relatedStartups;

	return startup;
}
