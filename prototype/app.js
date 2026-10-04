const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeHint = document.querySelector('#theme-hint');
const dialog = document.querySelector('.detail-dialog');
const closeButton = document.querySelector('.dialog-close');
const returnButton = document.querySelector('.return-link');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let closeTimer;

const views = {
  about: {
    eyebrow: 'A little about me',
    title: 'Small things, made carefully.',
    paragraphs: [
      "I'm Xu, a developer and independent maker. I enjoy the whole process: finding an idea, building the first version, and making it feel just right.",
      'This is my little corner of the internet. A place for the things I make, the details I notice, and whatever I learn along the way.',
    ],
  },
  readleaf: {
    eyebrow: 'A small product',
    title: 'Readleaf',
    paragraphs: [
      'A quieter place for things worth reading. Save an article, come back when you have time, and pick up where you left off.',
      'The idea is simple: less collecting, more reading. A small library that feels personal, without turning it into another inbox.',
    ],
  },
  draft: {
    eyebrow: 'A small product',
    title: 'Draft',
    paragraphs: [
      'A small writing tool built around focus. Just your words, a little Markdown, and enough room to think.',
      'Good tools leave space for the work. Draft explores how little an editor needs to help a thought become something worth sharing.',
    ],
  },
  notes: {
    eyebrow: 'A note on making things',
    title: 'The details that make a difference',
    paragraphs: [
      "Sometimes the most useful change is the smallest one. A little less space, a clearer sentence, a button that responds exactly when you'd expect it to.",
      "I'm learning to notice those details, and to build with enough care that someone else won't have to think about them.",
      'That is what these notes are for: keeping track of the small things that make the next thing better.',
    ],
  },
  lab: {
    eyebrow: 'Unfinished, on purpose',
    title: 'A little lab',
    paragraphs: [
      'A place for small interface experiments, half-formed ideas, and things that might become something later.',
      'Right now, the experiments are in the details of this page: a link that offers a quiet hint, a theme that remembers your choice, and transitions that make room for the next state.',
    ],
  },
  hello: {
    eyebrow: 'Good things start with a conversation',
    title: 'Say hello.',
    paragraphs: [
      "An idea, a thoughtful product, or a detail you can't stop thinking about. I'd love to hear about it.",
    ],
    email: 'hello@example.com',
  },
};

function syncThemeControl() {
  const isDark = root.dataset.theme === 'dark';
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', label);
  themeHint.textContent = label;
}

themeToggle.addEventListener('click', () => {
  const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = theme;
  try { localStorage.setItem('xwtaidev-site-theme', theme); } catch {}
  syncThemeControl();
});
syncThemeControl();

function openDetails(key) {
  const view = views[key];
  if (!view) return;
  clearTimeout(closeTimer);
  document.querySelector('#detail-eyebrow').textContent = view.eyebrow;
  document.querySelector('#detail-title').textContent = view.title;
  const copy = document.querySelector('#detail-description');
  const paragraphs = view.paragraphs.map((text) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    return paragraph;
  });
  if (view.email) {
    const paragraph = document.createElement('p');
    const link = document.createElement('a');
    link.href = `mailto:${view.email}`;
    link.textContent = view.email;
    paragraph.append(link);
    paragraphs.push(paragraph);
  }
  copy.replaceChildren(...paragraphs);
  dialog.classList.remove('is-closing', 'is-open');
  if (!dialog.open) dialog.showModal();
  requestAnimationFrame(() => requestAnimationFrame(() => dialog.classList.add('is-open')));
}

function closeDetails() {
  if (!dialog.open || dialog.classList.contains('is-closing')) return;
  dialog.classList.remove('is-open');
  dialog.classList.add('is-closing');
  const closeMs = reducedMotion.matches ? 0 : parseFloat(getComputedStyle(root).getPropertyValue('--modal-close-dur')) || 150;
  closeTimer = setTimeout(() => {
    dialog.close();
    dialog.classList.remove('is-closing');
  }, closeMs);
}

document.querySelectorAll('[data-view]').forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openDetails(trigger.dataset.view);
  });
});
closeButton.addEventListener('click', closeDetails);
returnButton.addEventListener('click', closeDetails);
dialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeDetails();
});
dialog.addEventListener('click', (event) => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) closeDetails();
});
