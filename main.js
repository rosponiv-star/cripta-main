/* La Crypta — status, the signature drinks, entrances */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Aperto adesso? Every night 18:00–02:00, Rovereto time ── */
  const status = document.getElementById('status');
  const romeNow = () => {
    const p = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date());
    const h = +p.find(x => x.type === 'hour').value;
    const m = +p.find(x => x.type === 'minute').value;
    return h * 60 + m;
  };
  const span = (min) => {
    const h = Math.floor(min / 60), m = min % 60;
    if (!h) return `${m} min`;
    return m ? `${h} h ${m} min` : `${h} h`;
  };
  const tick = () => {
    if (!status) return;
    const t = romeNow();
    const open = 18 * 60, close = 2 * 60;
    if (t >= open || t < close) {
      const left = t >= open ? 24 * 60 - t + close : close - t;
      status.classList.remove('is-closed');
      status.innerHTML = `<span class="dot"></span><b>Aperto adesso</b> · chiude tra ${span(left)}`;
    } else {
      status.classList.add('is-closed');
      status.innerHTML = `<span class="dot"></span><b>Apre alle 18</b> · tra ${span(open - t)}`;
    }
  };
  tick();
  setInterval(tick, 30000);

  /* ── Hero: shutter, then a slow drift with the scroll ── */
  const hero = document.querySelector('.hero');
  const heroImg = document.querySelector('.shutter img');
  const start = () => {
    hero.classList.add('is-ready');
    setTimeout(() => hero.classList.add('is-settled'), 1700);
  };
  if (heroImg.complete) requestAnimationFrame(start); else { heroImg.addEventListener('load', start); setTimeout(start, 1500); }

  if (!reduce) {
    let raf = 0;
    addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = Math.min(scrollY, innerHeight * 1.2);
        heroImg.style.setProperty('--drift', `${y * -0.12}px`);
      });
    }, { passive: true });
  }

  /* ── Bar hides on the way down, returns on the way up ── */
  const bar = document.querySelector('.bar');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    bar.classList.toggle('is-hidden', y > lastY && y > 240);
    lastY = y;
  }, { passive: true });

  /* ── Le firme ── */
  const drinks = [
    {
      name: 'Portici', field: 'bottle',
      desc: 'Secco, freddo e dritto come la fila di archi qui sopra. La genziana scende dalle montagne di Rovereto e lascia un amaro pulito, che chiede subito un altro sorso.',
      ing: ['60 ml gin', '10 ml vermouth dry', '5 ml liquore di genziana', 'olio di scorza di limone'],
      note: 'Il gin più asciutto della carta, servito ghiacciato in coppa.'
    },
    {
      name: 'Velluto di volta', field: 'oxblood',
      desc: 'Rosso come le pareti quando la luce si abbassa. Amarena e lampone tengono il lime al suo posto, la lavanda resta sul bordo e ti segue fino al tavolo.',
      ing: ['40 ml vodka', '20 ml liquore all’amarena', '20 ml succo di lime', '10 ml cordiale al lampone', 'un rametto di lavanda'],
      note: 'Il più chiesto dopo le dieci. Rotondo, mai dolce.'
    },
    {
      name: 'Lume', field: 'amber',
      desc: 'Il bicchiere che si accende quando la candela è quasi finita. Miele di castagno dei boschi trentini, bourbon e scorza d’arancia su un solo grande cubo di ghiaccio.',
      ing: ['50 ml bourbon', '7 ml miele di castagno', '3 dash bitter all’arancia', 'scorza d’arancia, amarena'],
      note: 'Da bere piano. Il ghiaccio dura quanto la conversazione.'
    },
    {
      name: 'Marzemino sbagliato', field: 'stone',
      desc: 'Il Negroni sbagliato, ma di casa. Al posto dello spumante il Marzemino frizzante della Vallagarina, lo stesso che Don Giovanni chiede di versare nell’opera di Mozart.',
      ing: ['30 ml bitter', '30 ml vermouth rosso', 'top di Marzemino frizzante', 'fetta d’arancia'],
      note: 'Il vino arriva da pochi chilometri, la ricetta da Milano.'
    },
    {
      name: 'Ultima discesa', field: 'night',
      desc: 'Il nostro White Russian per l’ultimo giro prima delle due. Caffè, panna appena montata e un velo di noce moscata: morbido come il ritorno a casa sotto i portici.',
      ing: ['40 ml vodka', '20 ml liquore al caffè', '30 ml panna fresca', 'noce moscata'],
      note: 'Si ordina quando la musica rallenta.'
    }
  ];

  const section = document.querySelector('.firme');
  const card = document.querySelector('.firme__card');
  const imgs = [...document.querySelectorAll('.firme__arch img')];
  const picks = [...document.querySelectorAll('.firme__pick')];
  const el = (id) => document.getElementById(id);
  let current = 0;

  const show = (i) => {
    if (i === current) return;
    current = i;
    const d = drinks[i];
    picks.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
    imgs.forEach((im) => im.classList.toggle('is-on', +im.dataset.for === i));
    section.dataset.field = d.field;
    const swap = () => {
      el('f-num').textContent = `0${i + 1}.`;
      el('f-name').textContent = d.name;
      el('f-desc').textContent = d.desc;
      el('f-ing').innerHTML = d.ing.map((x) => `<li>- ${x}</li>`).join('');
      el('f-note').textContent = d.note;
      card.classList.remove('is-swapping');
    };
    if (reduce) return swap();
    card.classList.add('is-swapping');
    setTimeout(swap, 260);
  };
  picks.forEach((b) => {
    b.addEventListener('click', () => show(+b.dataset.i));
    b.addEventListener('mouseenter', () => { if (matchMedia('(hover: hover)').matches) show(+b.dataset.i); });
  });

  /* ── Entrances: each part of a section, staggered ── */
  const rise = [...document.querySelectorAll('[data-rise]')];
  if (reduce || !('IntersectionObserver' in window)) {
    rise.forEach((n) => n.classList.add('is-in'));
  } else {
    const groups = new Map();
    rise.forEach((n) => {
      const g = n.parentElement;
      const list = groups.get(g) || [];
      n.style.setProperty('--d', `${Math.min(list.length, 8) * 75}ms`);
      list.push(n); groups.set(g, list);
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px 0px 0px', threshold: 0 });
    rise.forEach((n) => io.observe(n));
    // never leave content hidden
    setTimeout(() => rise.forEach((n) => { if (n.getBoundingClientRect().top < innerHeight) n.classList.add('is-in'); }), 2500);
  }

  /* ── Footer mark: arches rise one by one as it comes into view ── */
  const mark = document.querySelector('.mark');
  if (mark && !reduce && 'IntersectionObserver' in window) {
    new IntersectionObserver((es, o) => {
      if (es[0].isIntersecting) { mark.classList.add('is-playing'); o.disconnect(); }
    }, { threshold: 0.15 }).observe(mark);
  }
})();
