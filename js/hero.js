/**
 * Hero: falling bag of ProGrain atta.
 * - Landscape: plays once on load (real time), bag lands to the right of the copy.
 * - Portrait: the same timed drop, from the top of the hero, behind the copy (no scroll-scrubbing).
 * Both modes sample one physics trajectory (gravity + two damped bounces + squash + sway).
 */
(() => {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;

  const stage = hero.querySelector('[data-stage]');
  const art = hero.querySelector('[data-art]');
  const bag = hero.querySelector('[data-bag]');
  const soft = hero.querySelector('[data-shadow-soft]');
  const contact = hero.querySelector('[data-shadow-contact]');
  const puffHost = hero.querySelector('[data-puffs]');
  const cue = hero.querySelector('[data-cue]');

  const portraitMQ = window.matchMedia('(orientation: portrait)');
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- trajectory (normalised: drop height = 1, drop time = 1) ---------- */
  const DT = 1 / 240, G = 2, REST = 0.22;
  const samples = [];
  const impacts = [];
  (function simulate() {
    let h = 1, v = 0, t = 0, settled = false;
    while (t < 3 && !settled) {
      v -= G * DT; h += v * DT;
      if (h <= 0) {
        h = 0;
        if (-v > 0.25) { impacts.push({ t, s: -v }); v = -v * REST; } else { v = 0; settled = true; }
      }
      samples.push({ t, h });
      t += DT;
    }
  })();
  const END = samples[samples.length - 1].t;
  const FIRST_IMPACT = impacts[0].t;

  function pose(t) {
    const s = samples[Math.min(samples.length - 1, Math.max(0, Math.round(t / DT)))];
    let sq = 0;
    for (const im of impacts) {
      const d = t - im.t;
      if (d >= 0 && d < 0.16) sq += 0.045 * im.s * Math.sin(Math.PI * d / 0.16);
    }
    sq = Math.min(sq, 0.12);
    const fall = clamp(t / FIRST_IMPACT);
    // a light sachet flutters: sway + a little flip about the vertical axis, calming as it nears the ground
    const calm = Math.pow(1 - fall, 1.25);
    let rot = 24 * Math.sin(5.4 * t + 0.6) * calm;
    let rotY = 62 * Math.sin(4.1 * t + 0.4) * calm;
    if (t > FIRST_IMPACT) { const d = t - FIRST_IMPACT; rot = 3.4 * Math.exp(-6 * d) * Math.sin(16 * d); rotY = 0; }
    return { h: s.h, sq, rot, rotY };
  }

  /* ---------- rendering ---------- */
  let H0 = 800; // px from resting position to just above the stage top
  function measure() {
    const a = art.getBoundingClientRect(), s = stage.getBoundingClientRect();
    H0 = a.bottom - s.top + 12;
  }

  function render(t) {
    const p = pose(t);
    const px = p.h * H0;
    bag.style.transform = `perspective(1100px) translate3d(0,${-px}px,0) rotateY(${p.rotY}deg) rotate(${p.rot}deg) scale(${1 + p.sq * 0.7},${1 - p.sq})`;
    const far = clamp(px / 640);
    const widen = 1 + p.sq * 1.2;
    contact.style.opacity = (Math.pow(1 - far, 1.6) * 0.62).toFixed(3);
    contact.style.transform = `translateX(-50%) scale(${(1 - far * 0.3) * widen},1)`;
    soft.style.opacity = (0.16 + (1 - far) * 0.2).toFixed(3);
    soft.style.transform = `translateX(-50%) scale(${(0.85 + far * 0.55) * widen},1)`;
  }

  let lastT = 0, lastPuff = 0;
  function maybePuff(t) {
    lastT = t;
  }

  // Flour puff on landing removed: it read as fake. Kept (unused) in case it is wanted again.
  function puff() {
    if (reduceMQ.matches) return;
    const n = 9;
    for (let i = 0; i < n; i++) {
      const el = document.createElement('i');
      const dir = i % 2 ? 1 : -1;
      const size = 38 + Math.random() * 54;
      el.style.width = el.style.height = size + 'px';
      el.style.left = `calc(50% + ${dir * (20 + Math.random() * 60)}px)`;
      puffHost.appendChild(el);
      const dx = dir * (50 + Math.random() * 130);
      el.animate([
        { transform: 'translate(-50%,0) scale(.3)', opacity: 0 },
        { transform: `translate(calc(-50% + ${dx * 0.5}px),${-18 - Math.random() * 20}px) scale(.9)`, opacity: .8, offset: .25 },
        { transform: `translate(calc(-50% + ${dx}px),${-50 - Math.random() * 50}px) scale(1.5)`, opacity: 0 }
      ], { duration: 1100 + Math.random() * 500, easing: 'cubic-bezier(.2,.7,.3,1)', delay: Math.random() * 60 })
        .onfinish = () => el.remove();
    }
  }

  /* ---------- floating dust motes in the spotlight ---------- */
  const motes = hero.querySelector('[data-motes]');
  if (motes && !reduceMQ.matches) {
    for (let i = 0; i < 26; i++) {
      const m = document.createElement('i');
      const st = m.style;
      st.setProperty('--s', (2 + Math.random() * 5).toFixed(1) + 'px');
      st.setProperty('--b', (Math.random() * 2).toFixed(1) + 'px');
      st.setProperty('--o', (0.25 + Math.random() * 0.55).toFixed(2));
      st.setProperty('--d', (7 + Math.random() * 9).toFixed(1) + 's');
      st.setProperty('--dl', (-Math.random() * 12).toFixed(1) + 's');
      st.setProperty('--dx', (Math.random() * 120 - 60).toFixed(0) + 'px');
      st.left = (45 + Math.random() * 55).toFixed(1) + '%';
      st.top = (30 + Math.random() * 60).toFixed(1) + '%';
      motes.appendChild(m);
    }
  }

  /* ---------- modes ---------- */
  let raf = 0, startTimer = 0;
  function stop() { cancelAnimationFrame(raf); clearTimeout(startTimer); }

  function landscapeMode() {
    measure();
    render(0);
    const SPEED = 0.92; // seconds of real time per normalised second
    const begin = () => {
      const t0 = performance.now();
      const loop = now => {
        const t = Math.min(END, (now - t0) / 1000 / SPEED);
        render(t); maybePuff(t);
        if (t < END) raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };
    startTimer = setTimeout(begin, 450);
  }

  function start() {
    stop();
    lastT = 0;
    if (cue) cue.style.opacity = '';
    if (reduceMQ.matches) { measure(); render(END); if (cue) cue.style.display = 'none'; return; }
    landscapeMode(); // same timed drop on every screen: plays once on load, no scroll-scrubbing
  }

  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { measure(); if (lastT >= END) render(END); }, 120);
  });
  portraitMQ.addEventListener('change', start);
  reduceMQ.addEventListener('change', start);

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start); else start();
})();
