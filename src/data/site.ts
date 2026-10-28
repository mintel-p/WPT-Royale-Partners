/**
 * Site-wide data — the single object the site reads the client's name, contacts and socials from.
 * BaseLayout (og:site_name), the header, the footer and src/data/schema.ts read `site`, so one edit
 * updates every page.
 * Fill in only what the client provided and leave the rest empty: nothing here may be invented.
 * An empty TEXT contact (a phone line in the footer) is not rendered; a contact the design draws as an
 * element (icon row, messenger button) is rendered with `href` undefined + a TODO so the section keeps
 * its design height until the data arrives.
 * A value that differs per language (name, location, jobTitle, description) is `Localized`: a string
 * for a one-language site, `{ uk: '…', en: '…' }` when the site has several —
 * `localized(value, Astro.currentLocale)` reads it.
 *
 * The site languages (<html lang>, og:locale, the texts) live in src/i18n/.
 */
import type { ImageMetadata } from 'astro';
import logoSchema from '@/assets/shared/logo-schema.png';
import type { Localized } from '@/i18n';

export const site = {
  /** Client or brand name: og:site_name, Schema.org name; a string or one per language */
  name: 'WPT Royale Partners' as Localized,
  /** Legal entity as written on the site (the footer copyright: "Brand Inc."); Schema.org legalName. Empty = `name` */
  legalName: '',
  /** Contacts exactly as they appear on the site */
  phone: '',
  email: 'Affiliate@wptroyalepartners.com',
  /** City / "online", as written in the footer; a string or one per language */
  location: '' as Localized,
  /** Real links only (`https://…`, or an app scheme such as `viber://chat?number=…`); an empty link is not rendered.
   * Schema.org `sameAs` takes only the profile networks (telegram, instagram, facebook, linkedin, youtube):
   * a messenger chat link (wa.me, viber://) opens a conversation and identifies no profile. */
  socials: {
    telegram: '',
    whatsapp: '',
    viber: '',
    instagram: '',
    facebook: '',
    linkedin: '',
    youtube: '',
  },
  /** Where every sign-up button leads (Register, Login, Become a Partner, Click here to apply) — the developer's answer */
  signUpUrl: 'https://tracking.wptpartners.com/v2/sign-up',
  /** Languages the client works in, e.g. ['uk', 'en'] (Schema.org knowsLanguage) */
  languages: ['en'] as string[],
  /** The build year; set a fixed number if the client wants one */
  copyrightYear: new Date().getFullYear(),
  /** Schema.org entity behind the site (src/data/schema.ts) */
  schema: {
    type: 'Organization' as 'Person' | 'Organization',
    /** Person only, as written on the site (e.g. the hero tagline); a string or one per language */
    jobTitle: '' as Localized,
    /** One paragraph that is visible on the site (e.g. the "about" lead); a string or one per language */
    description:
      "A premium, fully licensed affiliate partner platform tailored specifically to support verified traffic acquisition in Ontario's regulated market." as Localized,
    /** Portrait (Person) or logo (Organization): `import portrait from '@/assets/hero/portrait.jpg'` and set it here */
    // the horizontal logo on the page background: its white "PARTNERS" would vanish on Google's white background
    image: logoSchema as ImageMetadata | undefined,
  },
};
