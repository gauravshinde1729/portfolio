// Types out [data-typed] elements after the boot overlay closes.
// The text is real HTML; it is only cleared/retyped when a boot sequence is about to play.
const els = [...document.querySelectorAll<HTMLElement>('[data-typed]')];

if (els.length && document.documentElement.dataset.boot === 'pending') {
  const texts = els.map((el) => el.textContent ?? '');
  els.forEach((el) => (el.textContent = ''));

  window.addEventListener(
    'boot:done',
    async () => {
      for (let i = 0; i < els.length; i++) {
        for (const ch of texts[i]) {
          els[i].textContent += ch;
          await new Promise((r) => setTimeout(r, 65));
        }
      }
    },
    { once: true },
  );
}
