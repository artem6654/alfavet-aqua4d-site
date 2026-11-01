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


// Installation video plays only while it is on screen
const installVideo = document.getElementById('install-video');
if (installVideo && !reduceMotion && 'IntersectionObserver' in window) {
  new IntersectionObserver(([en]) => {
    if (en.isIntersecting) installVideo.play().catch(() => {});
    else installVideo.pause();
  }, { threshold: 0.4 }).observe(installVideo);
}

// Product turntable: rotates while on screen, drag to turn by hand
const spin = document.getElementById('gear360');
if (spin) {
  const frames = 31;
  const srcAt = (n) => `/assets/official/360/${n}.jpg`;
  let frame = 1, loaded = false, visible = false, dragX = null;
  const show = (n) => { frame = ((n - 1 + frames) % frames) + 1; spin.src = srcAt(frame); };
  const preload = () => {
    if (loaded) return;
    loaded = true;
    for (let i = 2; i <= frames; i += 1) new Image().src = srcAt(i);
  };
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) preload();
  }, { rootMargin: '200px' }).observe(spin);
  if (!reduceMotion) setInterval(() => { if (visible && dragX === null) show(frame + 1); }, 130);
  spin.addEventListener('pointerdown', (e) => { dragX = e.clientX; spin.setPointerCapture(e.pointerId); });
  spin.addEventListener('pointermove', (e) => {
    if (dragX === null || Math.abs(e.clientX - dragX) < 12) return;
    show(frame + (e.clientX > dragX ? 1 : -1));
    dragX = e.clientX;
  });
  ['pointerup', 'pointercancel'].forEach((ev) => spin.addEventListener(ev, () => { dragX = null; }));
}

// Payback calculator: same formulas as the ROI sheet of the financial model
const calcForm = document.getElementById('calc-form');
if (calcForm) {
  const num = (id) => Math.max(0, Number(document.getElementById(id).value) || 0);
  const uah = (v) => `${Math.round(v).toLocaleString('uk-UA')} грн`;
  const investInput = document.getElementById('c-invest');
  const investPerUnit = { farm: 170000, drip: 61600 };
  const units = { farm: () => num('c-houses'), drip: () => num('d-ha') };
  let mode = 'farm';
  let investEdited = false;

  const yearlyBenefit = () => {
    if (mode === 'farm') {
      const revenue = num('c-houses') * num('c-birds') * num('c-cycles') * num('c-weight') * num('c-price');
      return revenue * num('c-up-farm') / 100 + num('c-houses') * num('c-cycles') * num('c-clean');
    }
    const revenue = num('d-ha') * num('d-yield') * 1000 * num('d-price');
    const energy = num('d-ha') * num('d-water') * num('d-saving') / 100 * num('d-kwh') * num('d-tariff');
    return revenue * num('d-up') / 100 + energy + num('d-ha') * num('d-clean');
  };

  const paybackText = (months) => {
    if (months < 1) return 'менше місяця';
    if (months <= 36) return `≈${Math.round(months)} міс.`;
    return `≈${(months / 12).toFixed(1).replace('.', ',')} року`;
  };

  const update = () => {
    if (!investEdited) investInput.value = units[mode]() * investPerUnit[mode];
    const benefit = yearlyBenefit();
    const invest = num('c-invest');
    document.getElementById('r-payback').textContent = benefit > 0 ? paybackText(invest / benefit * 12) : 'не окупається';
    document.getElementById('r-year').textContent = uah(benefit);
    document.getElementById('r-invest').textContent = uah(invest);
    document.getElementById('r-five').textContent = uah(benefit * 5 - invest);
  };

  calcForm.addEventListener('input', (e) => {
    if (e.target === investInput) investEdited = true;
    update();
  });
  calcForm.addEventListener('submit', (e) => e.preventDefault());

  document.querySelectorAll('[data-calc]').forEach((tab, _, all) => {
    tab.addEventListener('click', () => {
      mode = tab.dataset.calc;
      investEdited = false;
      all.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
      document.querySelectorAll('[data-calc-panel]').forEach((p) => { p.hidden = p.dataset.calcPanel !== mode; });
      update();
    });
  });

  // Carry the estimate into the lead form
  document.getElementById('calc-cta').addEventListener('click', () => {
    const scope = mode === 'farm' ? `${num('c-houses')} пташн.` : `${num('d-ha')} га`;
    form.elements.sector.value = mode === 'farm' ? 'Птахівництво' : 'Теплиці / крапельний полив';
    form.elements.msg.value = `Калькулятор: ${scope}, вигода ${uah(yearlyBenefit())} на рік, окупність ${document.getElementById('r-payback').textContent}`;
  });

  update();
}
