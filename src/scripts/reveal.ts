const items = document.querySelectorAll<HTMLElement>('.reveal');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduced || !('IntersectionObserver' in window)) {
  items.forEach((el) => el.classList.add('is-visible'));
} else {
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.08 },
  );
  items.forEach((el) => io.observe(el));
}
