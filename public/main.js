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
        el.textContent = `${el.dataset.prefix}${Math.round(end * (1 - Math.pow(1 - k, 3)))}%`;
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

  // 3D tilt on the hero product
  const tilt = document.getElementById('tilt');
  tilt.addEventListener('pointermove', (e) => {
    const r = tilt.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
  });
  tilt.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
}

// Rising bubbles in the hero
const canvas = document.getElementById('bubbles');
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext('2d');
  const hero = canvas.parentElement;
  let w, h, bubbles = [], visible = true;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const spawn = (y) => ({
    x: Math.random() * w, y: y ?? h + 20,
    r: 2 + Math.random() * 7, v: 0.3 + Math.random() * 0.9,
    a: Math.random() * Math.PI * 2, o: 0.15 + Math.random() * 0.35,
  });
  resize();
  bubbles = Array.from({ length: Math.round(w / 28) }, () => spawn(Math.random() * h));
  addEventListener('resize', resize);
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(hero);
  let px = -999, py = -999;
  hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; });
  hero.addEventListener('pointerleave', () => { px = py = -999; });
  const draw = () => {
    if (visible) {
      ctx.clearRect(0, 0, w, h);
      bubbles.forEach((b, i) => {
        b.y -= b.v; b.a += 0.02; b.x += Math.sin(b.a) * 0.4;
        const dx = b.x - px, dy = b.y - py, dist = Math.hypot(dx, dy);
        if (dist > 0 && dist < 90) { b.x += dx / dist * 1.5; b.y += dy / dist * 1.5; }
        if (b.y < -20) bubbles[i] = spawn();
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${b.o})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, b.r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.o})`;
        ctx.fill();
      });
    }
    requestAnimationFrame(draw);
  };
  draw();
}

// Slow parallax for the background ripples
const bgRipples = document.getElementById('bg-ripples');
if (bgRipples && !reduceMotion) {
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      bgRipples.style.transform = `translateY(${-(scrollY * 0.15) % 900}px)`;
      ticking = false;
    });
  }, { passive: true });
}
