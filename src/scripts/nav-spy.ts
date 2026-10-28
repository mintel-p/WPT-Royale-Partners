/**
 * Section links of the header and footer menus (ui/NavLink) — loaded by NavLink.
 * A `.nav-link` that points at a section of this page (`/#faq` on the home page) gets aria-current="location"
 * while that section crosses a line 30 % down the viewport (below the fixed header); none above the first
 * section or between the linked ones. Links to other pages are left alone.
 */

const LINE = 0.3;

const sectionLinks = [...document.querySelectorAll<HTMLAnchorElement>('a.nav-link[href*="#"]')].flatMap((link) => {
  const url = new URL(link.href);
  if (url.pathname !== location.pathname || !url.hash) return [];
  const section = document.querySelector<HTMLElement>(decodeURIComponent(url.hash));
  return section ? [{ link, section }] : [];
});

if (sectionLinks.length > 0) {
  let active: HTMLElement | undefined;
  let ticking = false;

  const update = () => {
    ticking = false;
    const line = window.innerHeight * LINE;
    const current = sectionLinks.find(({ section }) => {
      const rect = section.getBoundingClientRect();
      return rect.top <= line && rect.bottom > line;
    })?.section;
    if (current === active) return;
    active = current;
    for (const { link, section } of sectionLinks) {
      if (section === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  const schedule = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();
}

// a module: its names stay out of the global scope shared with the other scripts
export {};
