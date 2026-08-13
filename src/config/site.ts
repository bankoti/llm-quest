// ─── CHANGE THIS FILE TO REBRAND ───────────────────────────────────────────
// Every domain reference, display name, and tagline flows from here.
// Nothing else in the codebase hardcodes the product name or URL.

export const SITE = {
  name: 'ZeroOne',
  domain: 'zeroone.dev',
  tagline: 'LLM Engineering from First Principles',
  description:
    'Eight courses. 65 levels. Build a GPT from scratch, then ship a production AI system — all in code.',
  repoUrl: 'https://github.com/bankoti/llm-from-first-principles',
  // Social / meta
  twitterHandle: '',           // fill in later
  ogImage: '/og.png',          // fill in later
  // Pricing
  priceUsd: 250,
  currency: 'USD',
} as const

export type SiteConfig = typeof SITE
