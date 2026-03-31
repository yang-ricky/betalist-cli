export const STARTUP_SELECTORS = {
	// Legacy fixtures + current BetaList layouts
	listItem: ".startupCard, .startup-row, div.relative.flex.gap-3.border.border-gray-200",
	listItemRow: ".startup-row",
	listItemCard: "div.relative.flex.gap-3.border.border-gray-200",
	listName:
		".startupCard__name, span.leading-snug.font-medium.text-gray-900, div.font-medium.text-gray-900",
	listTagline: ".startupCard__tagline, span.text-base.text-gray-500, div.text-gray-600",
	listLogo: ".startupCard__logo img, img",
	listLink: '.startupCard__link, a[href^="/startups/"]',
	listDate: ".startupCard__date",
	listDateHeading: '[data-duplicate-id^="day_"]',
	listCategories: '.startupCard__categories a, a[href^="/browse/"]',
	listBoosted: '.startupCard--boosted, #boosted-startup, a[href="/boost"]',

	name: "h1.startup-name, #main h1",
	tagline: ".startup-tagline, #main h2",
	description: ".startup-description, #main .text-lg.mt-8",
	maker: ".startup-maker",
	makerHandle: ".startup-maker-handle",
	categories: ".startup-categories a",
	topics: ".startup-topics a",
	siteLink: 'a.startup-visit, #main a[href$="/visit"]',
	logoImg: ".startup-logo img, #main .size-14 img",
	relatedList: ".related-startups .startupCard, section .startup-row",
} as const;

export const MARKET_SELECTORS = {
	listItem: '.market-item, section h2 a[href^="/browse/"]',
	name: ".market-name",
	slug: ".market-link",
	count: ".market-count, span.text-sm",
	parentSlug: ".market-parent",
} as const;

export const REGION_SELECTORS = {
	listItem: ".region-item", // placeholder
	name: ".region-name", // placeholder
	slug: ".region-link", // placeholder
	count: ".region-count", // placeholder
} as const;
