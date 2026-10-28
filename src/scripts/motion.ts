/**
 * Motion module — the typical animation set for client sites, enabled per page with
 * `<BaseLayout motion>`. Without it the page ships no JavaScript and every `data-reveal`
 * element is simply visible (the reveal styles in utilities.css are gated by `[data-motion]`).
 *
 * 1. Lenis smooth scrolling (autoRaf), also to an anchor of the same page (nav items such as
 *    `/#about` on the home page; the native jump is prevented here, otherwise the page flashes at
 *    the target for a frame before Lenis animates — the hash still lands in the address, and the focus
 *    moves to the target: <main> for the skip link, the section for an anchor). A header that opens a mobile menu dispatches
 *    `menu:toggle` ({ detail: { open } }) on `document`; scrolling stops while it is open and while
 *    a modal <dialog> is open. The menu panel and the dialog carry `data-lenis-prevent` to scroll natively.
 * 2. Reveal on scroll: `[data-reveal]` gets `is--visible` when it enters the viewport;
 *    `data-reveal="stagger"` animates the element's children one by one;
 *    `data-reveal-delay="1…5"` delays a single element by that many stagger steps.
 *    An element that contains a photo waits for the photo to load first. Reveals start after the
 *    stylesheets and `document.fonts.ready` so the first paint is never caught half-hidden.
 * 3. Hiding header: src/scripts/header.ts (also available alone via `<BaseLayout hidingHeader>`).
 * 4. Intro: the section with `data-intro` (the hero) reveals its elements in order
 *    (data-reveal-delay 0 → 1 → 2 …); the header keeps `is--intro` (hidden, no transition) only until
 *    the reveals start and slides in together with the first element — it never waits for the whole
 *    sequence or for the hero photo to load.
 * `prefers-reduced-motion: reduce` → everything static, header still hides/shows.
 *
 * Do not put `data-reveal` on an element with its own scoped `transition` (a button): scoped styles
 * are unlayered and would override the utility animation — reveal a wrapper <div> instead.
 */
import Lenis from 'lenis';
import { SCROLL_OFFSET } from './header';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Bottom part of the viewport (10 %) in which an element does not count as visible yet (observer rootMargin)
const REVEAL_MARGIN = 0.1;
// Turns on the reveal styles; without this attribute the page renders as is
document.documentElement.dataset.motion = '';

// Smooth scrolling; the page behind the open mobile menu or a modal <dialog> (popups) stays still.
// Panels that scroll themselves carry data-lenis-prevent (the menu, a popup).
// Same-page anchors are handled below (anchors: false): Lenis' own handler would override the focus move
const lenis = new Lenis({ autoRaf: true, anchors: false });
let menuOpen = false;
const syncScroll = () => {
  if (menuOpen || document.querySelector('dialog:modal')) lenis.stop();
  else lenis.start();
};
document.addEventListener('menu:toggle', (event) => {
  menuOpen = (event as CustomEvent<{ open: boolean }>).detail.open;
  syncScroll();
});
// showModal() and close() set and remove the dialog's `open` attribute
new MutationObserver(syncScroll).observe(document.body, { attributeFilter: ['open'], subtree: true });

// Same-page anchors: cancel the browser's jump, scroll with Lenis and move the focus to the target
// like the native jump would (keyboard and screen-reader users continue from there).
// The target lands right under the header when the header will be visible at the end of the scroll
// (header.ts: near the top, or after SCROLL_OFFSET of scrolling up), at the very top of the viewport when
// the header will have hidden (SCROLL_OFFSET of scrolling down); a shorter move keeps the header as it is.
// The header height is html's scroll-padding-top.
const landing = (target: HTMLElement) => {
  const from = window.scrollY;
  const top = target.getBoundingClientRect().top + from;
  const headerHeight = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const header = document.querySelector<HTMLElement>('.header-fixed');
  if (!header) return top;
  const under = top - headerHeight;
  const shown =
    under <= header.offsetHeight ||
    under <= from - SCROLL_OFFSET ||
    (top < from + SCROLL_OFFSET && !header.classList.contains('is--hidden'));
  return shown ? under : top;
};
const focusTarget = (target: HTMLElement) => {
  if (!target.matches('a[href], button, input, select, textarea, [tabindex]')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
};
document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href]') : null;
  if (!link) return;
  const url = new URL(link.href);
  if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
  const target = document.querySelector<HTMLElement>(decodeURIComponent(url.hash));
  if (!target) return;
  event.preventDefault();
  history.pushState(null, '', url.hash);
  if (link.classList.contains('skip-link')) {
    // Keyboard users skip the header: land at once
    lenis.scrollTo(landing(target), { immediate: true });
    focusTarget(target);
  } else {
    lenis.scrollTo(landing(target), { onComplete: () => focusTarget(target) });
  }
});

// Intro: the header stays hidden until the reveals start, then slides in with the first element
// of the data-intro section (released in the reveal start below)
const header = document.querySelector<HTMLElement>('.header-fixed');
if (header && document.querySelector('[data-intro]') && !reduceMotion) header.classList.add('is--intro');

// Reveal on scroll; an element that holds a photo waits for it to load first. Only a rendered image counts:
// a lazy one behind a visibility utility (desktop-only / desktop-hide) has no box and never loads.
// At most 3 s, so a slow or broken file never keeps the content hidden.
const show = (target: Element) => {
  const visible = () => target.classList.add('is--visible');
  const photo = [...target.querySelectorAll('img')].find((img) => img.getClientRects().length > 0);
  if (photo && !photo.complete) {
    photo.addEventListener('load', visible, { once: true });
    photo.addEventListener('error', visible, { once: true });
    setTimeout(visible, 3000);
  } else {
    visible();
  }
};
const reveal = () => {
  const targets = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    targets.forEach((target) => target.classList.add('is--visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        show(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: `0px 0px -${REVEAL_MARGIN * 100}% 0px` },
  );
  targets.forEach((target) => observer.observe(target));
};
// The module can run before the stylesheet arrives on a cold load: wait for it, and for the fonts —
// at most 400 ms, so a font needed only below the first screen does not hold the intro back
const stylesReady = Promise.all(
  [...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')].map((link) =>
    link.sheet
      ? Promise.resolve()
      : new Promise((resolve) => {
          link.addEventListener('load', resolve, { once: true });
          link.addEventListener('error', resolve, { once: true });
        }),
  ),
);
const fontsReady = Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 400))]);
Promise.all([stylesReady, fontsReady]).then(() => {
  reveal();
  // The observer reports the visible elements on the next frame: the header starts in the same one
  requestAnimationFrame(() => header?.classList.remove('is--intro'));
});
