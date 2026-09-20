const nav = document.querySelector<HTMLElement>('.nav');
const burger = nav?.querySelector<HTMLButtonElement>('.burger');

function setOpen(open: boolean) {
  if (!nav || !burger) return;
  nav.toggleAttribute('data-open', open);
  burger.setAttribute('aria-expanded', String(open));
}

burger?.addEventListener('click', () => setOpen(!nav?.hasAttribute('data-open')));
nav?.querySelectorAll('.tabs a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setOpen(false);
});

// Highlight the tab of the section currently in view (home page only).
const links = new Map<string, HTMLElement>();
nav?.querySelectorAll<HTMLElement>('.tabs a[data-nav]').forEach((a) => links.set(a.dataset.nav!, a));
const sections = document.querySelectorAll<HTMLElement>('main section[id]');

if (sections.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a, id) => {
          if (id === entry.target.id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      }
    },
    { rootMargin: '-40% 0px -55% 0px' },
  );
  sections.forEach((s) => io.observe(s));
}
