(() => {
  'use strict';

  /* ── LOADER ───────────────────────────────────────────────── */
  function initLoader() {
    const loader = document.getElementById('cr-loader');
    if (!loader) return;
    document.body.style.overflow = 'hidden';
    const line = loader.querySelector('.cr-loader__line');
    let w = 0;
    const fill = setInterval(() => {
      w += Math.random() * 18 + 4;
      if (w >= 100) { w = 100; clearInterval(fill); }
      if (line) line.style.width = w + '%';
    }, 60);
    setTimeout(() => {
      loader.classList.add('cr-loader--out');
      document.body.style.overflow = '';
      setTimeout(() => loader.remove(), 900);
    }, 1600);
  }

  /* ── CURSOR ───────────────────────────────────────────────── */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dot  = document.createElement('div');
    const ring = document.createElement('div');
    dot.className  = 'cr-cursor__dot';
    ring.className = 'cr-cursor__ring';
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    (function loop() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll('a,button,.card-wrapper,.button').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('cr-cursor__ring--grow'));
      el.addEventListener('mouseleave', () => ring.classList.remove('cr-cursor__ring--grow'));
    });

    document.querySelectorAll('.card__media,.banner__media,.cr-hero__media').forEach(el => {
      el.addEventListener('mouseenter', () => {
        ring.classList.add('cr-cursor__ring--view');
        ring.setAttribute('data-label', 'VER');
      });
      el.addEventListener('mouseleave', () => {
        ring.classList.remove('cr-cursor__ring--view');
        ring.removeAttribute('data-label');
      });
    });
  }

  /* ── TEXT SPLIT REVEAL ────────────────────────────────────── */
  function splitText(el) {
    const text = el.textContent.trim();
    el.textContent = '';
    el.setAttribute('aria-label', text);
    text.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? ' ' : ch;
      span.className = 'cr-char';
      span.style.setProperty('--i', i);
      el.appendChild(span);
    });
  }

  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('cr-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-cr-reveal]').forEach(el => {
      el.classList.add('cr-reveal');
      const type = el.dataset.crReveal;
      if (type === 'chars') splitText(el);
      const delay = el.dataset.crDelay || 0;
      el.style.setProperty('--delay', delay + 'ms');
      observer.observe(el);
    });

    document.querySelectorAll([
      '.banner__heading',
      '.rich-text__heading',
      '.collection__title',
      '.featured-collection .title',
      '.product__title',
      'h1.h0, h1.hxl, h1.hxxl'
    ].join(',')).forEach((el, i) => {
      if (el.closest('[data-cr-reveal]')) return;
      el.classList.add('cr-reveal');
      el.style.setProperty('--delay', (i * 60) + 'ms');
      observer.observe(el);
    });

    document.querySelectorAll('.card-wrapper').forEach((el, i) => {
      el.classList.add('cr-reveal', 'cr-reveal--up');
      el.style.setProperty('--delay', ((i % 4) * 100) + 'ms');
      observer.observe(el);
    });

    document.querySelectorAll([
      '.rich-text__text',
      '.multicolumn-card__info',
      '.footer-block',
      '.newsletter__wrapper',
      '.image-with-text__content'
    ].join(',')).forEach((el, i) => {
      if (el.closest('[data-cr-reveal]')) return;
      el.classList.add('cr-reveal', 'cr-reveal--up');
      el.style.setProperty('--delay', (i * 80) + 'ms');
      observer.observe(el);
    });
  }

  /* ── PARALLAX ─────────────────────────────────────────────── */
  function initParallax() {
    const items = document.querySelectorAll('[data-cr-parallax],.banner__media,.cr-hero__media');
    if (!items.length) return;

    function update() {
      items.forEach(el => {
        // Skip media containers that hold a video — keep them static
        if (el.querySelector('video')) return;
        const rect  = el.getBoundingClientRect();
        const speed = parseFloat(el.dataset.crParallax || 0.25);
        const cy    = rect.top + rect.height / 2;
        const vy    = (cy - window.innerHeight / 2) * speed;
        el.style.transform = `translateY(${vy}px) scale(1.08)`;
      });
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ── MARQUEE ──────────────────────────────────────────────── */
  function initMarquee() {
    document.querySelectorAll('.cr-marquee__track').forEach(track => {
      const original = track.innerHTML;
      track.innerHTML = original.repeat(4);
    });
  }

  /* ── MAGNETIC BUTTONS ─────────────────────────────────────── */
  function initMagnetic() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.button--primary,.cr-hero__cta').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width  / 2;
        const y = e.clientY - r.top  - r.height / 2;
        btn.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ── SMOOTH HEADER ────────────────────────────────────────── */
  function initHeader() {
    const header = document.querySelector('.header-wrapper,.shopify-section-group-header-group');
    if (!header) return;
    let last = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 80)  header.classList.add('cr-header--scrolled');
      else         header.classList.remove('cr-header--scrolled');
      if (y > last + 8 && y > 200) header.classList.add('cr-header--hidden');
      else if (y < last - 4)       header.classList.remove('cr-header--hidden');
      last = y;
    }, { passive: true });
  }

  /* ── PRODUCT CARD TILT ────────────────────────────────────── */
  function initTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    document.querySelectorAll('.card-wrapper').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r  = card.getBoundingClientRect();
        const x  = (e.clientX - r.left) / r.width  - 0.5;
        const y  = (e.clientY - r.top)  / r.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ── COUNTER ANIMATION ────────────────────────────────────── */
  function initCounters() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el  = entry.target;
        const end = parseInt(el.dataset.crCount, 10);
        let   cur = 0;
        const step = Math.ceil(end / 60);
        const id = setInterval(() => {
          cur = Math.min(cur + step, end);
          el.textContent = cur.toLocaleString();
          if (cur >= end) clearInterval(id);
        }, 16);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-cr-count]').forEach(el => obs.observe(el));
  }

  /* ── SCROLL LINE ──────────────────────────────────────────── */
  function initScrollLine() {
    const bar = document.getElementById('cr-scroll-line');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
      bar.style.width = (p * 100) + '%';
    }, { passive: true });
  }

  /* ── INIT ─────────────────────────────────────────────────── */
  function boot() {
    initLoader();
    initCursor();
    initReveal();
    initParallax();
    initMarquee();
    initMagnetic();
    initHeader();
    initTilt();
    initCounters();
    initScrollLine();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
