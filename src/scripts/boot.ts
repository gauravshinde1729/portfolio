import { BOOT_LINES } from '../lib/boot-lines';

const root = document.documentElement;
const overlay = document.getElementById('boot');
const log = document.getElementById('boot-log');

if (root.dataset.boot === 'pending' && overlay && log) {
  root.dataset.bootStarted = '1'; // tells the inline watchdog in Boot.astro that this script owns cleanup
  let finishing = false;
  let index = 0;

  const finish = () => {
    if (finishing) return;
    finishing = true;
    try {
      sessionStorage.setItem('booted', '1');
    } catch {
      /* storage unavailable: boot may replay next visit */
    }
    overlay.classList.add('boot-out');
    window.setTimeout(() => {
      delete root.dataset.boot;
      overlay.remove();
      window.dispatchEvent(new Event('boot:done'));
    }, 250);
  };

  window.addEventListener('keydown', finish, { once: true });
  overlay.addEventListener('pointerdown', finish, { once: true });

  const tick = () => {
    if (finishing) return;
    if (index >= BOOT_LINES.length) {
      window.setTimeout(finish, 350);
      return;
    }
    log.textContent += BOOT_LINES[index++] + '\n';
    window.setTimeout(tick, 140);
  };
  tick();
}
