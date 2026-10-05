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
    const pgStack = $('[data-pg-stack]', calc);
    const labelEl = $('[data-n-label]');
    let n = cfg.defaultRotis;

    const half = v => Math.max(0.5, Math.round(v * 2) / 2);
    const fmt = v => String(v);
    const vbRatio = icon => { const [, , w, h] = document.getElementById(icon).getAttribute('viewBox').split(' ').map(Number); return w / h; };

    // Pick the grid (columns x rows) that lets each icon render as large as possible in the art box.
    function fitGrid(count, ar, boxW, boxH) {
      let best = { cols: count, rows: 1, size: 0 };
      for (let cols = 1; cols <= count; cols++) {
        const rows = Math.ceil(count / cols);
        const size = Math.min(boxW / cols, (boxH / rows) * ar);
        // prefer fuller last rows when sizes tie
        const fill = count / (cols * rows);
        if (size * (0.9 + 0.1 * fill) > best.size) best = { cols, rows, size: size * (0.9 + 0.1 * fill) };
      }
      return best;
    }

    function cellsHTML(icon, count) {
      const full = Math.floor(count), hasHalf = count % 1 !== 0;
      let h = '';
      for (let i = 0; i < full; i++) h += `<svg class="cell" style="--i:${i}" viewBox="${document.getElementById(icon).getAttribute('viewBox')}" aria-hidden="true"><use href="#${icon}"/></svg>`;
      if (hasHalf) h += `<svg class="cell cell--half" style="--i:${full}" viewBox="${document.getElementById(icon).getAttribute('viewBox')}" aria-hidden="true"><use href="#${icon}"/></svg>`;
      return h;
    }

    function render() {
      const protein = n * cfg.proteinPerProGrainRoti;
      nEl.textContent = n;
      totalEl.textContent = Number.isInteger(protein) ? protein : protein.toFixed(1);
      labelEl.textContent = `${n} ProGrain ${n === 1 ? 'roti' : 'rotis'}`;

      const g0 = fitGrid(n, vbRatio('i-roti-pg'), 260, 100);
      pgStack.style.setProperty('--cols', g0.cols);
      pgStack.style.setProperty('--rows', g0.rows);
      pgStack.innerHTML = cellsHTML('i-roti-pg', n);

      $$('[data-step]', calc).forEach(b => {
        const d = +b.dataset.step;
        b.disabled = (d < 0 && n <= cfg.minRotis) || (d > 0 && n >= cfg.maxRotis);
      });

      grid.innerHTML = cfg.items.map(it => {
        const count = half(protein / it.proteinPerUnit);
        const unit = count === 1 ? it.unit[0] : it.unit[1];
        const slots = Math.ceil(count);
        const g = fitGrid(slots, vbRatio(it.icon), 220, 170);
        let extra = it.note;
        if (it.unitGrams) extra = `About ${Math.round(it.unitGrams * count / 5) * 5} g. ${it.note}`;
        else if (it.unitMl) extra = `${it.unitMl * count} ml in total. ${it.note}`;
        return `
          <article class="item">
            <div class="item__art" style="--cols:${g.cols};--rows:${g.rows}" role="img" aria-label="${fmt(count)} ${unit} of ${it.name.toLowerCase()}">${cellsHTML(it.icon, count)}</div>
            <p class="item__count">${fmt(count)}</p>
            <h3 class="item__name">${it.name}${it.hideUnit ? '' : ` <span>${unit}</span>`}</h3>
            <p class="item__note">${extra}</p>
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
