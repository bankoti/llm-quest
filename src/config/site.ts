// ─── CHANGE THIS FILE TO REBRAND ───────────────────────────────────────────
// Every domain reference, display name, and tagline flows from here.
// Nothing else in the codebase hardcodes the product name or URL.

export const SITE = {
  name: 'ZeroOne',
  domain: 'zeroone.dev',
  tagline: 'LLM Engineering from First Principles',
  description:
    'Ten courses. 64 levels. Build a GPT from scratch, then ship a production AI system — all in code.',
  repoUrl: 'https://github.com/bankoti/llm-quest',
  // Social / meta
  twitterHandle: '',           // fill in later
  ogImage: '/og.png',          // fill in later
  // Admin: visit ?admin=<adminKey> to enable admin mode (?admin=off to exit).
  // Client-side only — change before launch, and know it ships in the bundle.
  adminKey: 'quest-master-42',
  // Pricing
  priceUsd: 250,
  currency: 'USD',
} as const

export type SiteConfig = typeof SITE
