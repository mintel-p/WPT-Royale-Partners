/**
 * Table of contents of a long document (TermsAgreement, ui/TocList) — loaded by the component that renders it.
 *
 * 1. Current section: the last `[data-toc-section]` whose top has passed a line a quarter down the viewport
 *    (the last one at the very bottom of the page). Every `[data-toc-link]` to it gets `is--active` +
 *    aria-current="location"; `[data-toc-current]` (the tablet bar) shows its title; a visible contents list
 *    (`[data-toc-scroller]`) scrolls so the item stays in view.
 * 2. Scroll indicator: the `[data-toc-thumb]` next to a scroller follows the scroller's position
 *    (the track is hidden with `is--hidden` when the list fits); the scroller gets `is--scrolled`
 *    once it is scrolled (its top fade).
 * 3. Panel (tablet and mobile): `[data-toc-toggle]` (aria-expanded, data-menu-toggle) opens `[data-toc-panel]` (`is--open`);
 *    `[data-toc-close]`, a link inside, Esc and the desktop width close it. `menu:toggle` stops Lenis (motion.ts)
 *    while it is open; the page scroll lock is `html:has([data-menu-toggle][aria-expanded='true'])`.
 * 4. Back to top (tablet and mobile, the CSS ignores it on desktop): `[data-back-to-top]` gets `is--visible`
 *    while the header is shown by scrolling up (header.ts) and the page is more than one screen down.
 */

const sections = [...document.querySelectorAll<HTMLElement>('[data-toc-section]')];
const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
const currentLabels = document.querySelectorAll<HTMLElement>('[data-toc-current]');
const scrollers = [...document.querySelectorAll<HTMLElement>('[data-toc-scroller]')];

let active = '';

const keepInView = (link: HTMLElement) => {
  const scroller = scrollers.find((item) => item.contains(link) && item.getClientRects().length > 0);
  if (!scroller || scroller.scrollHeight <= scroller.clientHeight) return;
  const top = link.offsetTop;
  const bottom = top + link.offsetHeight;
  if (top < scroller.scrollTop || bottom > scroller.scrollTop + scroller.clientHeight) {
    scroller.scrollTo({ top: top - scroller.clientHeight / 3, behavior: 'smooth' });
  }
};

const setActive = (id: string) => {
  if (!id || id === active) return;
  active = id;
  for (const link of links) {
    const on = link.hash === `#${id}`;
    link.classList.toggle('is--active', on);
    if (on) {
      link.setAttribute('aria-current', 'location');
      keepInView(link);
    } else {
      link.removeAttribute('aria-current');
    }
  }
  const title = links.find((link) => link.hash === `#${id}`)?.textContent?.trim();
  if (title) currentLabels.forEach((label) => (label.textContent = title));
};

const updateActive = () => {
  if (sections.length === 0) return;
  const root = document.documentElement;
  if (window.scrollY + window.innerHeight >= root.scrollHeight - 2) {
    setActive(sections[sections.length - 1].dataset.tocSection ?? '');
    return;
  }
  const line = window.innerHeight / 4;
  let current = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= line) current = section;
    else break;
  }
  setActive(current.dataset.tocSection ?? '');
};

// Scroll indicators
const updateThumb = (scroller: HTMLElement) => {
  // the top fade of the list appears once it is scrolled
  scroller.classList.toggle('is--scrolled', scroller.scrollTop > 0);
  const thumb = scroller.parentElement?.querySelector<HTMLElement>('[data-toc-thumb]');
  const track = thumb?.parentElement;
  if (!thumb || !track) return;
  const range = scroller.scrollHeight - scroller.clientHeight;
  track.classList.toggle('is--hidden', range <= 0);
  if (range <= 0) return;
  const travel = track.clientHeight - thumb.offsetHeight - 2;
  thumb.style.translate = `0 ${(scroller.scrollTop / range) * travel}px`;
};
for (const scroller of scrollers) {
  scroller.addEventListener('scroll', () => updateThumb(scroller), { passive: true });
  updateThumb(scroller);
}

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    updateActive();
  });
};
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', () => {
  onScroll();
  scrollers.forEach(updateThumb);
});
updateActive();

// Panel (tablet and mobile)
const panel = document.querySelector<HTMLElement>('[data-toc-panel]');
const toggle = document.querySelector<HTMLButtonElement>('[data-toc-toggle]');
if (panel && toggle) {
  const desktop = window.matchMedia('(min-width: 992px)');
  const isOpen = () => toggle.getAttribute('aria-expanded') === 'true';
  const setOpen = (open: boolean, returnFocus = false) => {
    if (open === isOpen()) return;
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is--open', open);
    document.dispatchEvent(new CustomEvent('menu:toggle', { detail: { open } }));
    if (open) {
      // the panel hangs under the header: bring a hidden header back
      document.querySelector('.header-fixed')?.classList.remove('is--hidden');
      // the panel itself takes the focus (tabindex -1, no ring): Tab leads to the close button and the links
      panel.focus({ preventScroll: true });
      const scroller = panel.querySelector<HTMLElement>('[data-toc-scroller]');
      if (scroller) updateThumb(scroller);
      const current = panel.querySelector<HTMLElement>('[data-toc-link].is--active');
      if (current) keepInView(current);
    } else if (returnFocus) {
      toggle.focus();
    }
  };
  toggle.addEventListener('click', () => setOpen(!isOpen()));
  panel.querySelector('[data-toc-close]')?.addEventListener('click', () => setOpen(false, true));
  // a link closes the panel first, so motion.ts (on document) scrolls with Lenis running again
  panel.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a[href]')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false, true);
  });
  desktop.addEventListener('change', () => {
    if (desktop.matches) setOpen(false);
  });
}

// Back to top: follows the header (shown on the way up, hidden on the way down), never near the top
const backToTop = document.querySelector<HTMLElement>('[data-back-to-top]');
const pageHeader = document.querySelector<HTMLElement>('.header-fixed');
if (backToTop && pageHeader) {
  const syncBackToTop = () =>
    backToTop.classList.toggle('is--visible', !pageHeader.classList.contains('is--hidden') && window.scrollY > window.innerHeight);
  new MutationObserver(syncBackToTop).observe(pageHeader, { attributeFilter: ['class'] });
  window.addEventListener('scroll', syncBackToTop, { passive: true });
  syncBackToTop();
}
