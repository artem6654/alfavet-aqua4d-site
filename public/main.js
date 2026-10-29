// Mobile menu
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
});
nav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    nav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
});

// Model tabs
const tabs = document.querySelectorAll('[data-tab]');
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    document.querySelectorAll('[data-panel]').forEach((p) => {
      p.hidden = p.dataset.panel !== tab.dataset.tab;
    });
  });
});

// Reveal on scroll
const revealEls = document.querySelectorAll('.card, .sector, .timeline li, .why__grid > div, .case__grid > div');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}

// Lead form: no backend, opens a prepared email to Alfa-Vet
const form = document.getElementById('lead-form');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  let ok = true;
  ['name', 'phone'].forEach((field) => {
    const input = form.elements[field];
    const empty = !String(data.get(field) || '').trim();
    input.setAttribute('aria-invalid', String(empty));
    if (empty) ok = false;
  });
  if (!ok) {
    document.getElementById('form-hint').textContent = 'Вкажіть ім\'я та телефон.';
    return;
  }
  const body = [
    `Ім'я: ${data.get('name')}`,
    `Телефон: ${data.get('phone')}`,
    `Господарство: ${data.get('farm') || '—'}`,
    `Напрямок: ${data.get('sector')}`,
    `Коментар: ${data.get('msg') || '—'}`,
  ].join('\n');
  const subject = `AQUA4D: заявка на аналіз води — ${data.get('sector')}`;
  window.location.href = `mailto:info@alfa-vet.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  document.getElementById('form-hint').textContent = 'Відкрили лист у вашій пошті — залишилось натиснути «Надіслати».';
});
