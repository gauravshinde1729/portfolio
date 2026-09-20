import { buildMailto } from '../lib/mailto';

const form = document.getElementById('contact-form') as HTMLFormElement | null;
const status = document.getElementById('contact-status');

// `required` on the textarea keeps the no-JS form validated natively; with JS, opt out so the
// submit handler below shows the terminal-style error instead of the browser's bubble.
if (form) form.noValidate = true;

form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const subject = String(data.get('subject') ?? '').trim();
  const body = String(data.get('body') ?? '').trim();

  if (!body) {
    if (status) status.textContent = 'error: message is empty';
    form.querySelector<HTMLTextAreaElement>('textarea')?.focus();
    return;
  }

  if (status) status.textContent = 'opening your mail client...';
  window.location.href = buildMailto(form.dataset.to ?? '', subject, body);
});
