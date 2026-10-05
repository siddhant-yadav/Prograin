(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ---------- Nav ---------- */
  const nav = $('[data-nav]');
  const toggle = $('[data-menu-toggle]');
  const sheet = $('#mobileMenu');
  const onScroll = () => nav.classList.toggle('is-stuck', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    sheet.hidden = !open;
    nav.classList.toggle('is-open', open);
  }
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', sheet).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  $$('[data-focus-waitlist]').forEach(a => a.addEventListener('click', () => {
    setTimeout(() => $('#email-hero').focus({ preventScroll: true }), 500);
  }));

  /* ---------- Waitlist ----------
     Set WAITLIST_ENDPOINT to a URL that accepts a JSON POST ({ email, source }).
     Until then, signups are only kept in this browser's localStorage (demo mode). */
  const WAITLIST_ENDPOINT = '';
  $$('[data-waitlist]').forEach(form => {
    const input = $('input[type=email]', form);
    const msg = $('.waitlist__msg', form);
    const btn = $('button[type=submit]', form);
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = input.value.trim();
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      form.classList.remove('is-error', 'is-done');
      if (!valid) {
        form.classList.add('is-error');
        msg.textContent = email ? 'That email looks incomplete. Check it and try again.' : 'Enter your email so we know where to send your early-bird discount.';
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      btn.disabled = true;
      btn.classList.add('is-loading');
      try {
        if (WAITLIST_ENDPOINT) {
          const res = await fetch(WAITLIST_ENDPOINT, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, source: form.id })
          });
          if (!res.ok) throw new Error(String(res.status));
        } else {
          await new Promise(r => setTimeout(r, 500));
          try {
            const list = JSON.parse(localStorage.getItem('prograin_waitlist') || '[]');
            if (!list.includes(email)) list.push(email);
            localStorage.setItem('prograin_waitlist', JSON.stringify(list));
          } catch (_) { /* storage unavailable: still show success in demo mode */ }
        }
        form.classList.add('is-done');
        msg.textContent = "You're on the list. We'll email your early-bird discount the day ProGrain launches.";
        input.value = '';
      } catch (_) {
        form.classList.add('is-error');
        msg.textContent = "We couldn't save that just now. Check your connection and try again.";
      } finally {
        btn.disabled = false;
        btn.classList.remove('is-loading');
      }
    });
  });

  /* ---------- Video: play only while visible ---------- */
  const video = $('[data-video]');
  if (video && 'IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => {
      if (en.isIntersecting) { const p = video.play(); if (p) p.catch(() => {}); } else video.pause();
    }, { threshold: 0.15 }).observe(video);
  }

  /* ---------- Protein calculator ---------- */
  const cfg = window.PROGRAIN_CALC;
  const calc = $('[data-calc]');
  if (cfg && calc) {
    const grid = $('[data-grid]', calc);
    const nEl = $('[data-n]', calc);
    const totalEl = $('[data-total]', calc);
    const labelEl = $('[data-n-label]');
    const cluster = $('[data-cluster]', calc);
    let n = cfg.defaultRotis;

    const amount = (it, protein) => {
      const raw = protein / it.proteinPerUnit;
      return it.grams ? Math.max(5, Math.round(raw / 5) * 5) : Math.max(0.5, Math.round(raw * 2) / 2);
    };

    function render() {
      const protein = n * cfg.proteinPerProGrainRoti;
      nEl.textContent = n;
      totalEl.textContent = Number.isInteger(protein) ? protein : protein.toFixed(1);
      labelEl.textContent = `${n} ProGrain ${n === 1 ? 'roti' : 'rotis'}`;
      // roti cluster: 1 point, 2 line, 3 triangle, 4 square, 5 pentagon, 6 hexagon
      const SHAPE = { 1: [60, 0, 0], 2: [44, 24, 180], 3: [42, 26, -90], 4: [36, 27, -45], 5: [33, 30, -90], 6: [30, 32, -90] };
      const [d, R, start] = SHAPE[Math.min(6, Math.max(1, n))];
      cluster.innerHTML = Array.from({ length: n }, (_, i) => {
        const ang = (start + (360 / n) * i) * Math.PI / 180;
        const x = 50 + R * Math.cos(ang) - d / 2, y = 50 + R * Math.sin(ang) - d / 2;
        return `<use href="#i-roti-pg" x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${d}" height="${d}"/>`;
      }).join('');
      $$('[data-step]', calc).forEach(b => {
        const d = +b.dataset.step;
        b.disabled = (d < 0 && n <= cfg.minRotis) || (d > 0 && n >= cfg.maxRotis);
      });

      grid.innerHTML = cfg.items.map(it => {
        const count = amount(it, protein);
        const unit = count === 1 ? it.unit[0] : it.unit[1];
        const label = it.grams || it.hideUnit ? it.name : `${it.name} · ${unit}`;
        const vb = document.getElementById(it.icon).getAttribute('viewBox');
        return `
          <article class="mini" title="${it.note || ''}">
            ${cfg.photos && it.photo
              ? `<img class="mini__icon mini__photo" src="${it.photo}" alt="${it.name}" loading="lazy">`
              : `<svg class="mini__icon" viewBox="${vb}" role="img" aria-label="${it.name}"><use href="#${it.icon}"/></svg>`}
            <p class="mini__count">${count}${it.grams ? '<small>g</small>' : ''}</p>
            <h3 class="mini__name">${label}</h3>
          </article>`;
      }).join('');
    }

    calc.addEventListener('click', e => {
      const b = e.target.closest('[data-step]');
      if (!b) return;
      n = Math.min(cfg.maxRotis, Math.max(cfg.minRotis, n + +b.dataset.step));
      render();
    });
    render();
  }

  /* ---------- Recipes carousel ----------
     Desktop (mouse/trackpad): the section is pinned (see .recipes in CSS) and page scroll drives the plates 1 -> 6;
     afterwards the page continues down. Touch: no pinning, swipe left/right, vertical scroll never stops here. */
  const mount = $('#plateCarouselMount');
  const recipes = $('[data-recipes]');
  if (mount && recipes && window.PlateCarousel) {
    const pinned = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const items = [
      { name: 'ProGrain Roti', sub: '3 rotis + bowl of dal', protein: '40g', img: 'assets/recipes/Roti.webp' },
      { name: 'Poori with Chole', sub: '3 poori + bowl of chole', protein: '35g', img: 'assets/recipes/Poori.webp' },
      { name: 'Thepla with Chutney', sub: '3 thepla + green chutney', protein: '29g', img: 'assets/recipes/Thepla.webp' },
      { name: 'Stuffed Parantha', sub: '2 parantha + curd', protein: '25g', img: 'assets/recipes/Parantha.webp' },
      { name: 'Upma', sub: 'Bowl of upma + chutney', protein: '20g', img: 'assets/recipes/Upma.webp' },
      { name: 'Cookies', sub: '4 high-protein cookies', protein: '13g', img: 'assets/recipes/Cookies.webp' }
    ];
    recipes.style.setProperty('--steps', items.length);
    const carousel = new PlateCarousel('#plateCarouselMount', { items, trapScroll: false, stickyNavbarOffset: nav.offsetHeight });
    const N = items.length;

    if (pinned) {
      const travel = () => Math.max(1, recipes.offsetHeight - window.innerHeight);
      const top = () => window.scrollY + recipes.getBoundingClientRect().top;
      const indexFromScroll = () => {
        const p = Math.min(1, Math.max(0, -recipes.getBoundingClientRect().top / travel()));
        return Math.min(N - 1, Math.floor(p * N));
      };
      let ticking = false, current = -1;
      const sync = () => {
        ticking = false;
        const idx = indexFromScroll();
        if (idx !== current) { current = idx; carousel.goTo(idx); }
      };
      window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } }, { passive: true });
      window.addEventListener('resize', sync);
      sync();

      // Arrows, dots and keys move the page to the matching plate so the scroll position and carousel never disagree.
      const goToPlate = i => {
        i = Math.min(N - 1, Math.max(0, i));
        window.scrollTo({ top: top() + ((i + 0.5) / N) * travel(), behavior: 'smooth' });
      };
      mount.addEventListener('click', e => {
        const prev = e.target.closest('.pc-prev'), next = e.target.closest('.pc-next'), dot = e.target.closest('.lpc-dot');
        if (!prev && !next && !dot) return;
        e.stopPropagation();
        if (prev) goToPlate(carousel.currentIndex - 1);
        else if (next) goToPlate(carousel.currentIndex + 1);
        else goToPlate(Array.from(mount.querySelectorAll('.lpc-dot')).indexOf(dot));
      }, true);
      mount.addEventListener('keydown', e => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        e.stopPropagation(); e.preventDefault();
        goToPlate(carousel.currentIndex + (e.key === 'ArrowRight' ? 1 : -1));
      }, true);
    } else {
      let x0 = 0, y0 = 0;
      mount.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      mount.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) dx < 0 ? carousel.next() : carousel.prev();
      }, { passive: true });
    }
  }
})();
