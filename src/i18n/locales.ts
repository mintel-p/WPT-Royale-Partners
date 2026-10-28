/**
 * The site's languages — the list itself, without the dictionaries; everything else imports these
 * from '@/i18n'.
 *
 * `locales` and `defaultLocale` repeat `i18n` in astro.config.mjs — keep both identical.
 */
export const locales = ['en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

/** <html lang> (BCP 47), og:locale and the language switcher label of every language */
export const localeMeta: Record<Locale, { lang: string; ogLocale: string; label: string }> = {
  en: { lang: 'en', ogLocale: 'en_CA', label: 'EN' },
};

/**
 * A site-data value that may differ per language (src/data/site.ts: name, location, jobTitle,
 * description): a one-language site writes a plain string, a multilingual one a `{ uk: '…', en: '…' }` record.
 */
export type Localized = string | Partial<Record<Locale, string>>;
