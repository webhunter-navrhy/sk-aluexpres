(() => {
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // hero – slová postupne
  const h1 = $('[data-words]');
  if (h1) {
    let i = 0;
    const wrap = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w';
          const s = document.createElement('span'); s.textContent = t; s.style.animationDelay = (0.35 + i++ * 0.08) + 's';
          w.append(s); frag.append(w);
        });
        n.replaceWith(frag);
      } else wrap(n);
    });
    wrap(h1);
  }

  // navigácia
  const nav = $('#nav'), hero = $('.hero');
  const onScroll = () => nav.classList.toggle('is-solid', scrollY > (hero ? hero.offsetHeight - 90 : 40));
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const burger = $('#burger');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => { nav.classList.remove('is-open'); document.body.style.overflow = ''; }));

  // reveal
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('.rv, .clip').forEach((el, k) => {
    const sib = el.parentElement ? [...el.parentElement.children].filter(c => c.classList.contains('rv')) : [];
    const idx = sib.indexOf(el); if (idx > 0) el.style.transitionDelay = Math.min(idx, 4) * 0.08 + 's';
    io.observe(el);
  });

  // počítadlá
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), d = 1400;
    const step = t => { const p = Math.min(1, (t - t0) / d); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => { el.textContent = '0'; cio.observe(el); });

  // prístrešky – náhľad fotky pri kurzore
  const pv = $('#spreview'), pvi = pv && $('img', pv);
  if (pv && matchMedia('(hover:hover) and (min-width:961px)').matches) {
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0, on = false;
    const loop = () => { cx += (x - cx) * .18; cy += (y - cy) * .18; pv.style.left = cx + 'px'; pv.style.top = cy + 'px';
      raf = (on || Math.abs(x - cx) > .5) ? requestAnimationFrame(loop) : 0; };
    $$('.srow').forEach(r => {
      r.addEventListener('mouseenter', e => { pvi.src = r.dataset.img; on = true; pv.classList.add('is-on'); x = cx = e.clientX + 200; y = cy = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
      r.addEventListener('mousemove', e => { x = e.clientX + 200; y = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
      r.addEventListener('mouseleave', () => { on = false; pv.classList.remove('is-on'); });
    });
  }

  // galéria – filter, viac, lightbox
  const items = $$('.gi'), more = $('#more'), LIMIT = 15;
  let filter = 'all', showAll = false;
  const visible = () => items.filter(i => filter === 'all' || i.dataset.k === filter);
  const render = () => {
    const vis = visible();
    items.forEach(i => { i.classList.remove('is-in', 'big', 'big-r'); i.classList.add('is-hidden'); });
    vis.forEach((i, n) => { if (showAll || n < LIMIT) { i.classList.remove('is-hidden'); if (n % 5 === 0) i.classList.add(n % 10 ? 'big-r' : 'big'); void i.offsetWidth; i.classList.add('is-in'); i.style.animationDelay = (n % LIMIT) * 0.03 + 's'; } });
    more.parentElement.hidden = showAll || vis.length <= LIMIT;
  };
  $$('.filters button').forEach(b => b.addEventListener('click', () => {
    $$('.filters button').forEach(x => x.classList.toggle('is-on', x === b)); filter = b.dataset.f; showAll = false; render();
  }));
  more.addEventListener('click', () => { showAll = true; render(); });
  render();

  const lb = $('#lb'), lbimg = $('#lbimg'), lbcap = $('#lbcap'); let cur = 0, list = [];
  const show = n => { cur = (n + list.length) % list.length; const g = list[cur]; lbimg.src = g.dataset.full; lbimg.alt = $('img', g).alt; lbcap.textContent = $('figcaption', g).textContent + '  ·  ' + (cur + 1) + ' / ' + list.length; };
  items.forEach(g => g.addEventListener('click', () => { list = visible(); show(list.indexOf(g)); lb.hidden = false; document.body.style.overflow = 'hidden'; }));
  const close = () => { lb.hidden = true; document.body.style.overflow = ''; };
  $('#lbx').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  $('#lbp').addEventListener('click', () => show(cur - 1));
  $('#lbn').addEventListener('click', () => show(cur + 1));
  addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });

  // formulár (náhľad)
  $('#form').addEventListener('submit', e => { e.preventDefault(); $('#formok').hidden = false; });
})();
