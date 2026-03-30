// src/selectors.ts — 所有 HTML 选择器集中在此
// 网站改版时只需修改这一个文件
//
// 选择器需在开发时通过浏览器 DevTools 实测确认

export const STARTUP_SELECTORS = {
	// 列表页 (首页)
	listItem: ".startupCard", // placeholder - 每个项目卡片
	listName: ".startupCard__name", // placeholder
	listTagline: ".startupCard__tagline", // placeholder
	listLogo: ".startupCard__logo img", // placeholder
	listLink: ".startupCard__link", // placeholder - 链接到详情页
	listDate: ".startupCard__date", // placeholder
	listCategories: ".startupCard__categories a", // placeholder
	listBoosted: ".startupCard--boosted", // placeholder

	// 详情页
	name: "h1.startup-name", // placeholder
	tagline: ".startup-tagline", // placeholder
	description: ".startup-description", // placeholder
	maker: ".startup-maker", // placeholder
	makerHandle: ".startup-maker-handle", // placeholder
	categories: ".startup-categories a", // placeholder
	topics: ".startup-topics a", // placeholder
	siteLink: "a.startup-visit", // placeholder
	logoImg: ".startup-logo img", // placeholder
	relatedList: ".related-startups .startupCard", // placeholder
} as const;

export const MARKET_SELECTORS = {
	listItem: ".market-item", // placeholder
	name: ".market-name", // placeholder
	slug: ".market-link", // placeholder - href 提取 slug
	count: ".market-count", // placeholder
	parentSlug: ".market-parent", // placeholder
} as const;

export const REGION_SELECTORS = {
	listItem: ".region-item", // placeholder
	name: ".region-name", // placeholder
	slug: ".region-link", // placeholder
	count: ".region-count", // placeholder
} as const;
