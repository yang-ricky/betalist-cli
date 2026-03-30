import * as cheerio from "cheerio";
import { SITE_URL } from "../constants.js";
import { ParseError } from "../errors.js";
import type { Startup, StartupDetail } from "../models/index.js";
import { STARTUP_SELECTORS } from "../selectors.js";

const STARTUP_PATH_RE = /^\/startups\/([^/?#]+)$/;
const BROWSE_PATH_RE = /^\/browse\/([^/?#]+)(?:\/([^/?#]+))?$/;
const MONTHS = new Map<string, number>(
	[
		["jan", 1],
		["january", 1],
		["feb", 2],
		["february", 2],
		["mar", 3],
		["march", 3],
		["apr", 4],
		["april", 4],
		["may", 5],
		["jun", 6],
		["june", 6],
		["jul", 7],
		["july", 7],
		["aug", 8],
		["august", 8],
		["sep", 9],
		["sept", 9],
		["september", 9],
		["oct", 10],
		["october", 10],
		["nov", 11],
		["november", 11],
		["dec", 12],
		["december", 12],
	] as const,
);

/**
 * Parse startup list from homepage HTML
 */
export function parseStartupList(html: string): Startup[] {
	const $ = cheerio.load(html);
	const startups: Startup[] = [];
	const seen = new Set<string>();

	$(STARTUP_SELECTORS.listItem).each((_, el) => {
		const startup = parseStartupListItem($, $(el), { includeDate: true });
		if (!startup || seen.has(startup.slug)) {
			return;
		}
		seen.add(startup.slug);
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
	const name = normalizeText($(STARTUP_SELECTORS.name).first().text());
	if (!name) {
		throw new ParseError(`Failed to parse startup name for slug: ${slug}`);
	}

	// required: description
	const description = normalizeText($(STARTUP_SELECTORS.description).first().text());
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
	const tagline = normalizeText($(STARTUP_SELECTORS.tagline).first().text());
	if (tagline) startup.tagline = tagline;

	const logoUrl = $(STARTUP_SELECTORS.logoImg).first().attr("src");
	if (logoUrl) startup.logoUrl = toAbsoluteUrl(logoUrl);

	const siteUrl = $(STARTUP_SELECTORS.siteLink).first().attr("href");
	if (siteUrl) startup.siteUrl = toAbsoluteUrl(siteUrl);

	const maker = normalizeText($(STARTUP_SELECTORS.maker).first().text());
	if (maker) {
		startup.maker = maker;
	} else {
		const makerLink = getSectionLinks($, "Makers").first();
		const makerName = extractLinkLabel($, makerLink);
		if (makerName) startup.maker = makerName;

		const href = makerLink.attr("href");
		const handleMatch = href?.match(/\/(@[^/?#]+)/);
		if (handleMatch) startup.makerHandle = handleMatch[1];
	}

	const makerHandle = normalizeText($(STARTUP_SELECTORS.makerHandle).first().text());
	if (makerHandle) startup.makerHandle = makerHandle;

	// fragile fields
	const categories = extractTexts($(STARTUP_SELECTORS.categories));
	if (categories.length > 0) startup.categories = categories;

	const topics = extractTexts($(STARTUP_SELECTORS.topics));
	if (topics.length > 0) startup.topics = topics;
	else {
		const topicLinks = getSectionLinks($, "Topics");
		const parsedTopics = topicLinks
			.toArray()
			.map((el) => extractLinkLabel($, $(el)))
			.filter((topic): topic is string => Boolean(topic));

		if (parsedTopics.length > 0) {
			startup.topics = dedupe(parsedTopics);
		}

		if (!startup.categories) {
			const parsedCategories = topicLinks
				.toArray()
				.map((el) => {
					const href = $(el).attr("href") || "";
					const match = href.match(BROWSE_PATH_RE);
					return match?.[1] ? humanizeSlug(match[1]) : null;
				})
				.filter((category): category is string => Boolean(category));

			if (parsedCategories.length > 0) {
				startup.categories = dedupe(parsedCategories);
			}
		}
	}

	const featuredDate = extractFeaturedDate($);
	if (featuredDate) startup.date = featuredDate;

	// Related startups (fragile)
	const relatedStartups: Startup[] = [];
	const relatedSeen = new Set<string>();
	$(STARTUP_SELECTORS.relatedList).each((_, el) => {
		const related = parseStartupListItem($, $(el), { includeDate: false });
		if (related && !relatedSeen.has(related.slug)) {
			relatedSeen.add(related.slug);
			relatedStartups.push(related);
		}
	});
	if (relatedStartups.length > 0) startup.relatedStartups = relatedStartups;

	return startup;
}

function parseStartupListItem(
	$: cheerio.CheerioAPI,
	$context: cheerio.Cheerio<any>,
	options: { includeDate: boolean },
): Startup | null {
	const href = findStartupHref($, $context);
	const slug = href?.match(STARTUP_PATH_RE)?.[1];
	const name = extractName($context);

	if (!slug || !name) {
		return null;
	}

	const startup: Startup = {
		slug,
		name,
		url: `${SITE_URL}/startups/${slug}`,
	};

	const tagline = normalizeText($context.find(STARTUP_SELECTORS.listTagline).first().text());
	if (tagline) startup.tagline = tagline;

	const logoUrl = $context.find(STARTUP_SELECTORS.listLogo).first().attr("src");
	if (logoUrl) startup.logoUrl = toAbsoluteUrl(logoUrl);

	if (options.includeDate) {
		const date = extractListDate($, $context);
		if (date) startup.date = date;
	}

	const categories = $context
		.find(STARTUP_SELECTORS.listCategories)
		.toArray()
		.map((el) => {
			const href = $(el).attr("href") || "";
			return BROWSE_PATH_RE.test(href) ? normalizeText($(el).text()) : null;
		})
		.filter((category): category is string => Boolean(category));

	if (categories.length > 0) startup.categories = dedupe(categories);

	if (
		$context.is(STARTUP_SELECTORS.listBoosted) ||
		$context.find(STARTUP_SELECTORS.listBoosted).length > 0
	) {
		startup.isBoosted = true;
	}

	return startup;
}

function findStartupHref(
	$: cheerio.CheerioAPI,
	$context: cheerio.Cheerio<any>,
): string | null {
	for (const el of $context.find(STARTUP_SELECTORS.listLink).toArray()) {
		const href = $(el).attr("href") || "";
		if (STARTUP_PATH_RE.test(href)) {
			return href;
		}
	}
	return null;
}

function extractName($context: cheerio.Cheerio<any>): string {
	const $name = $context.find(STARTUP_SELECTORS.listName).first();
	if ($name.length === 0) {
		return "";
	}
	return textWithoutChildren($name) || normalizeText($name.text());
}

function extractListDate(
	$: cheerio.CheerioAPI,
	$context: cheerio.Cheerio<any>,
): string | undefined {
	const inlineDate = normalizeText($context.find(STARTUP_SELECTORS.listDate).first().text());
	if (inlineDate) {
		return normalizeDate(inlineDate);
	}

	if ($context.is(STARTUP_SELECTORS.listItemRow)) {
		const heading = $context.prevAll(STARTUP_SELECTORS.listDateHeading).first();
		const date = normalizeDate(normalizeText(heading.text()));
		if (date) {
			return date;
		}
	}

	return undefined;
}

function extractTexts(collection: cheerio.Cheerio<any>): string[] {
	const values = collection
		.toArray()
		.map((el) => normalizeText(collection.eq(collection.index(el)).text()))
		.filter((value): value is string => Boolean(value));
	return dedupe(values);
}

function getSectionLinks($: cheerio.CheerioAPI, heading: string): cheerio.Cheerio<any> {
	const section = $("h3")
		.filter((_, el) => normalizeText($(el).text()) === heading)
		.first()
		.parent();

	if (section.length === 0) {
		return $([]);
	}

	return section.find("a");
}

function extractLinkLabel(
	$: cheerio.CheerioAPI,
	$link: cheerio.Cheerio<any>,
): string | null {
	if ($link.length === 0) {
		return null;
	}

	const spanText = normalizeText($link.find("span").last().text());
	if (spanText) {
		return spanText;
	}

	const label = normalizeText($link.text());
	return label || null;
}

function extractFeaturedDate($: cheerio.CheerioAPI): string | undefined {
	const section = $("h3")
		.filter((_, el) => normalizeText($(el).text()) === "Featured")
		.first()
		.parent();

	if (section.length === 0) {
		return undefined;
	}

	const date = normalizeText(section.find("a").first().text());
	return date ? normalizeDate(date) : undefined;
}

function normalizeText(value: string): string {
	return value.replace(/\s+/g, " ").trim();
}

function textWithoutChildren($el: cheerio.Cheerio<any>): string {
	const clone = $el.clone();
	clone.children().remove();
	return normalizeText(clone.text());
}

function dedupe(values: string[]): string[] {
	return [...new Set(values)];
}

function toAbsoluteUrl(url: string): string {
	return url.startsWith("http://") || url.startsWith("https://")
		? url
		: new URL(url, SITE_URL).toString();
}

function humanizeSlug(slug: string): string {
	return slug
		.split("-")
		.map((part) => {
			if (part === "ai") return "AI";
			if (part === "hr") return "HR";
			if (part === "api") return "API";
			if (part === "saas") return "SaaS";
			return part.charAt(0).toUpperCase() + part.slice(1);
		})
		.join(" ");
}

function normalizeDate(value: string): string {
	if (!value) {
		return value;
	}

	const relativeMatch = value.match(
		/^(Today|Yesterday)\s+([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?$/i,
	);
	if (relativeMatch) {
		const month = parseMonth(relativeMatch[2]);
		const day = Number.parseInt(relativeMatch[3], 10);
		if (!month || Number.isNaN(day)) {
			return value;
		}

		const year = resolveClosestYear(month, day, new Date());
		return formatIsoDate(year, month, day);
	}

	const fullMatch = value.match(
		/^([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,\s*|\s+)(\d{4})$/,
	);
	if (fullMatch) {
		const month = parseMonth(fullMatch[1]);
		const day = Number.parseInt(fullMatch[2], 10);
		const year = Number.parseInt(fullMatch[3], 10);
		if (!month || Number.isNaN(day) || Number.isNaN(year)) {
			return value;
		}
		return formatIsoDate(year, month, day);
	}

	return value;
}

function parseMonth(value: string): number | undefined {
	return MONTHS.get(value.toLowerCase());
}

function resolveClosestYear(month: number, day: number, now: Date): number {
	const candidates = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];
	let bestYear = now.getFullYear();
	let bestDiff = Number.POSITIVE_INFINITY;

	for (const year of candidates) {
		const candidate = new Date(Date.UTC(year, month - 1, day));
		const diff = Math.abs(candidate.getTime() - now.getTime());
		if (diff < bestDiff) {
			bestDiff = diff;
			bestYear = year;
		}
	}

	return bestYear;
}

function formatIsoDate(year: number, month: number, day: number): string {
	return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
