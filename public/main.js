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
const revealEls = document.querySelectorAll('.card, .sector, .timeline li, .why__grid > div, .case__grid > div, .stat, .benefit, .result, .certs__list li');
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

// ===== Effects =====
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

// Header shrink + scroll progress
const header = document.querySelector('.header');
const progress = document.getElementById('progress');
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  header.classList.toggle('scrolled', scrollY > 30);
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Section title underline
if ('IntersectionObserver' in window) {
  const tio = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); tio.unobserve(en.target); } });
  }, { threshold: 0.6 });
  document.querySelectorAll('.section-title').forEach((el) => tio.observe(el));
}

// Count-up numbers in the case study
const counters = document.querySelectorAll('[data-count]');
if (!reduceMotion && 'IntersectionObserver' in window) {
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const end = Number(el.dataset.count);
      const start = performance.now();
      const step = (t) => {
        const k = Math.min((t - start) / 1400, 1);
        el.textContent = `${el.dataset.prefix}${Math.round(end * (1 - Math.pow(1 - k, 3)))}${el.dataset.suffix ?? '%'}`;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => cio.observe(el));
}

// Button ripple
document.querySelectorAll('.btn, .tabs button').forEach((btn) => {
  btn.addEventListener('pointerdown', (e) => {
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const s = document.createElement('span');
    s.className = 'ripple';
    s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    btn.appendChild(s);
    s.addEventListener('animationend', () => s.remove());
  });
});

if (!reduceMotion && finePointer) {
  // Trailing ring behind the logo cursor
  const ring = document.getElementById('cursor-ring');
  let mx = -100, my = -100, rx = -100, ry = -100;
  addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    ring.classList.add('on');
    const t = e.target;
    ring.classList.toggle('hover', !!t.closest('a, button, summary, select, [role="tab"], .sector'));
    ring.classList.toggle('dark', !!t.closest('.hero, .case, .contact'));
  }, { passive: true });
  document.addEventListener('pointerleave', () => ring.classList.remove('on'));
  const follow = () => {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(follow);
  };
  follow();

  // Water-drop ripple on click
  addEventListener('pointerdown', (e) => {
    const d = document.createElement('span');
    d.className = 'drop';
    d.style.left = `${e.clientX}px`; d.style.top = `${e.clientY}px`;
    if (e.target.closest('.hero, .case, .contact')) d.style.borderColor = '#fff';
    document.body.appendChild(d);
    d.addEventListener('animationend', () => d.remove());
  });

}

