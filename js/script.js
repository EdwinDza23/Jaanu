/* ==========================================================================
   23 & THREE — interaction layer
   Organized as small, independent init functions, each defensive about
   missing elements so the page never throws if something is edited out.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('hero-entered');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  initPreloader();
  initHeroLuxury();
  initRevealOnScroll();
  initProgressAndNav();
  if (!reduceMotion) initCursorGlow();
  if (!reduceMotion) initParticles();
  if (!reduceMotion) initParallax();
  if (!reduceMotion) initHeroStars();
  initEnvelopes();
  initMemoryGame();
  initTreeGrowth();
  initTreeHoverLink();
  initTimelineYears();
  initLetter();
  initHeartHunt();
  initMusicControls();
  if (!reduceMotion) initTiltEffect('[data-tilt]', { lift: -5, maxTilt: 7 });
  if (!reduceMotion) initMagneticButtons('.btn--primary, .letter__trigger', { lift: -2 });
});

/* ==========================================================================
   PRELOADER
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const enterBtn = document.getElementById('enterBtn');
  const skipBtn = document.getElementById('skipBtn');
  const audio = document.getElementById('bgAudio');
  if (!preloader) return;

  if (audio && audio.load) {
    audio.load();
  }

  const close = () => {
    document.body.classList.add('hero-entered');
    preloader.classList.add('is-hidden');
    document.body.style.overflow = '';
    setTimeout(() => { preloader.style.display = 'none'; }, 900);
  };

  enterBtn && enterBtn.addEventListener('click', () => {
    if (typeof window.__beginWithSound === 'function') {
      window.__beginWithSound();
    } else if (audio) {
      audio.play().catch(err => console.warn('Preloader play fallback:', err));
    }
    close();
  });

  skipBtn && skipBtn.addEventListener('click', close);
}

/* ==========================================================================
   REVEAL ON SCROLL — any [data-reveal] element fades/rises into place
   ========================================================================== */
function initRevealOnScroll() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(el => io.observe(el));
}

/* ==========================================================================
   SCROLL PROGRESS BAR + CHAPTER NAV ACTIVE STATE
   ========================================================================== */
function initProgressAndNav() {
  const fill = document.getElementById('progressFill');
  const navLinks = document.querySelectorAll('.chapter-nav a');
  const sections = ['hero', 'ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch-reveal', 'ch7', 'ch8', 'ch9', 'ch10', 'final']
    .map(id => document.getElementById(id))
    .filter(Boolean);

  let ticking = false;
  const updateProgress = () => {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;
    if (fill) fill.style.width = pct + '%';
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
  }, { passive: true });
  updateProgress();

  if (!navLinks.length || !sections.length || !('IntersectionObserver' in window)) return;

  const navIo = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = document.querySelector(`.chapter-nav a[data-nav="${entry.target.id}"]`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach(sec => navIo.observe(sec));
}

/* ==========================================================================
   CUSTOM CURSOR GLOW (desktop, fine pointer only)
   ========================================================================== */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  window.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    glow.classList.add('is-active');
  }, { passive: true });

  document.addEventListener('mouseleave', () => glow.classList.remove('is-active'));
}

/* ==========================================================================
   AMBIENT PARTICLES — soft floating dust / light motes
   ========================================================================== */
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles, raf;
  let visible = true;

  const COUNT = Math.min(46, Math.floor(window.innerWidth / 26));

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.4,
      speed: Math.random() * 0.35 + 0.08,
      drift: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.35 + 0.08
    };
  }

  function build() {
    resize();
    particles = Array.from({ length: COUNT }, makeParticle);
  }

  function tick() {
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '169,129,74';
    particles.forEach(p => {
      p.y -= p.speed;
      p.x += p.drift;
      if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
      if (p.x < -10) p.x = w + 10;
      if (p.x > w + 10) p.x = -10;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${ctx.fillStyle},${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '169,129,74';
    });
    raf = requestAnimationFrame(tick);
  }

  build();
  tick();
  window.addEventListener('resize', build);
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) tick(); else cancelAnimationFrame(raf);
  });
}

/* ==========================================================================
   PARALLAX — elements with [data-parallax="factor"]
   ========================================================================== */
function initParallax() {
  const els = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!els.length) return;
  let ticking = false;

  function update() {
    const y = window.scrollY;
    els.forEach(el => {
      const factor = parseFloat(el.dataset.parallax) || 0.1;
      el.style.transform = `translateY(${y * factor * -1}px)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
}

/* ==========================================================================
   CHAPTER 8 — 23 REASONS ENVELOPES
   ========================================================================== */
function initEnvelopes() {
  const grid = document.getElementById('envelopeGrid');
  if (!grid) return;

  const reasons = [
    'Because you laugh with your whole body, not just your face — Yencha Ullar, Jaanu.',
    'Because you remember what pastry I like before I do — Master Bake Sundays proved it.',
    'Because you make Balavana Park feel bigger than it is.',
    'Because you order the biryani exactly right, every single time.',
    'Because I still lose every race to finish the panipuri before you.',
    'Because fish curry & Bangada fry in Mangalore taste better when we share them.',
    'Because KFC chicken dates were the best part of our week in Bangalore.',
    'Because even simple boiled rice feels special when we\'re sitting together.',
    'Because you never once hung up first on our 2 a.m. college calls.',
    'Because BCA Fest & Sports Day memories are still my favourite ones from college.',
    'Because our farewell dance still makes me nervous just thinking about it.',
    'Because your idea of a "quick" shopping trip is a beautiful, elaborate lie.',
    'Because you hum songs you don\u2019t know you\u2019re humming.',
    'Because you make me want to be steadier, kinder, better.',
    'Because "I miss you, Jaanu" means something different when it\u2019s you saying it.',
    'Because you somehow talked me into running an entire marathon in 2026.',
    'Because you crossed that marathon finish line still smiling at me.',
    'Because you still get shy when I tell you you\u2019re beautiful — Nanna Preethi.',
    'Because three years in, you still bring so much Kushi into ordinary Tuesdays.',
    'Because you keep every voice note "just in case."',
    'Because our park bench in Balavana is still "ours," no questions asked.',
    'Because your attitude decides the weather in every room you enter.',
    'Because after everything, you still choose me. And I still choose you.'
  ];

  const frag = document.createDocumentFragment();

  reasons.forEach((reason, i) => {
    const num = String(i + 1).padStart(2, '0');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'envelope';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', `Reason ${num} of 23. Press to reveal.`);

    btn.setAttribute('data-tilt', '');
    btn.innerHTML = `
      <span class="envelope__inner">
        <span class="envelope__face envelope__face--front">
          <span class="envelope__num">${num}</span>
          <span class="envelope__seal" aria-hidden="true"></span>
        </span>
        <span class="envelope__face envelope__face--back"></span>
      </span>`;

    // set text via textContent to keep this safely free of markup injection
    btn.querySelector('.envelope__face--back').textContent = reason;

    btn.addEventListener('click', () => {
      const isOpen = btn.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(isOpen));
    });

    frag.appendChild(btn);
  });

  grid.appendChild(frag);
}

/* ==========================================================================
   CHAPTER 5 — MEMORY MATCH MINI GAME
   ========================================================================== */
function initMemoryGame() {
  const gridEl = document.getElementById('gameGrid');
  const statusEl = document.getElementById('gameStatus');
  const winEl = document.getElementById('gameWin');
  const resetBtn = document.getElementById('gameReset');
  if (!gridEl) return;

  const MEMORIES = [
    { key: 'beach', label: 'Beach', icon: '\u{1F30A}' },
    { key: 'pastry', label: 'Pastry', icon: '\u{1F950}' },
    { key: 'park', label: 'Park', icon: '\u{1F333}' },
    { key: 'biryani', label: 'Biryani', icon: '\u{1F35B}' },
    { key: 'ring', label: 'The Ring', icon: '\u{1F48D}' },
    { key: 'guitar', label: 'Guitar', icon: '\u{1F3B8}' }
  ];

  let moves = 0;
  let matches = 0;
  let lockBoard = false;
  let first = null;
  let second = null;

  function shuffledDeck() {
    const deck = [...MEMORIES, ...MEMORIES]
      .map(m => ({ ...m }))
      .sort(() => Math.random() - 0.5);
    return deck;
  }

  function render() {
    gridEl.innerHTML = '';
    moves = 0; matches = 0; lockBoard = false; first = null; second = null;
    winEl && (winEl.hidden = true);
    updateStatus();

    const deck = shuffledDeck();
    const frag = document.createDocumentFragment();

    deck.forEach((mem, i) => {
      const card = document.createElement('div');
      card.className = 'mem-card';
      card.dataset.key = mem.key;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Memory card ${i + 1}, face down`);

      card.innerHTML = `
        <div class="mem-card__inner">
          <div class="mem-card__face mem-card__face--back">&#10022;</div>
          <div class="mem-card__face mem-card__face--front">
            <span aria-hidden="true" style="font-size:1.7rem">${mem.icon}</span>
            <span class="mem-card__label">${mem.label}</span>
          </div>
        </div>`;

      card.addEventListener('click', () => handleFlip(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleFlip(card); }
      });

      frag.appendChild(card);
    });

    gridEl.appendChild(frag);
  }

  function updateStatus() {
    if (statusEl) statusEl.textContent = `Moves: ${moves} \u00B7 Matches: ${matches}/6`;
  }

  function handleFlip(card) {
    if (lockBoard) return;
    if (card.classList.contains('is-flipped') || card.classList.contains('is-matched')) return;

    card.classList.add('is-flipped');
    card.setAttribute('aria-label', card.querySelector('.mem-card__label').textContent);

    if (!first) { first = card; return; }

    second = card;
    moves++;
    updateStatus();
    lockBoard = true;

    if (first.dataset.key === second.dataset.key) {
      first.classList.add('is-matched');
      second.classList.add('is-matched');
      matches++;
      updateStatus();
      resetTurn();
      if (matches === MEMORIES.length && winEl) { winEl.hidden = false; burstCelebration(); }
    } else {
      setTimeout(() => {
        first.classList.remove('is-flipped');
        second.classList.remove('is-flipped');
        first.setAttribute('aria-label', 'Memory card, face down');
        second.setAttribute('aria-label', 'Memory card, face down');
        resetTurn();
      }, 850);
    }
  }

  function resetTurn() {
    first = null; second = null; lockBoard = false;
  }

  resetBtn && resetBtn.addEventListener('click', render);
  render();
}

/* ==========================================================================
   CHAPTER 7 — TIMELINE YEARS (progressive enhancement on <details>)
   ========================================================================== */
function initTimelineYears() {
  const years = document.querySelectorAll('.year');
  years.forEach(y => {
    y.addEventListener('toggle', () => {
      if (y.open) {
        years.forEach(other => { if (other !== y) other.open = false; });
      }
    });
  });
}

/* ==========================================================================
   CHAPTER 9 — TREE GROWTH ON SCROLL
   ========================================================================== */
function initTreeGrowth() {
  const wrap = document.getElementById('treeWrap');
  const chapter = document.getElementById('ch9');
  const sparkField = document.getElementById('treeSparkles');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function grow() {
    wrap.classList.add('is-grown');
    if (!reduceMotion && sparkField && !sparkField.childElementCount) {
      spawnSparkles(sparkField, 10, { starRatio: 0.3 });
    }
  }

  if (!wrap || !chapter || !('IntersectionObserver' in window)) {
    if (wrap) wrap.classList.add('is-grown');
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        grow();
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  io.observe(chapter);
}

/* ==========================================================================
   FINAL CHAPTER — THE LETTER
   ========================================================================== */
function initLetter() {
  const trigger = document.getElementById('letterTrigger');
  const paper = document.getElementById('letterPaper');
  const typeLine = document.getElementById('typewriterLine');
  if (!trigger || !paper) return;

  let typed = false;

  trigger.addEventListener('click', () => {
    paper.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    paper.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (!typed && typeLine) {
      typed = true;
      const fullText = typeLine.dataset.fullText || typeLine.textContent;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        typeLine.textContent = fullText;
      } else {
        typewrite(typeLine, fullText, 32);
      }
    }
  });
}

function typewrite(el, text, speed) {
  el.textContent = '';
  el.classList.add('is-typing');
  let i = 0;
  const step = () => {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      i++;
      setTimeout(step, speed);
    } else {
      el.classList.remove('is-typing');
    }
  };
  step();
}

/* ==========================================================================
   HIDDEN HEART SCAVENGER HUNT — unlocks the two bonus chapters
   Progress is persisted in localStorage so a refresh doesn't wipe it.
   ========================================================================== */
function initHeartHunt() {
  const hearts = document.querySelectorAll('.hidden-heart');
  const counterEl = document.getElementById('heartCount');
  const counterWrap = document.getElementById('heartCounter');
  const gateProgress = document.getElementById('huntProgressText');
  const fallback = document.getElementById('huntFallback');
  const bonus = document.getElementById('bonus');
  if (!hearts.length) return;

  /* ---- restore from storage ---- */
  const STORAGE_KEY = '23andthree_hearts_v1';
  let savedRaw = '[]';
  try { savedRaw = localStorage.getItem(STORAGE_KEY) || '[]'; } catch (e) { }
  const found = new Set(JSON.parse(savedRaw));

  function saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...found])); } catch (e) { }
  }

  function syncUI() {
    if (counterEl) counterEl.textContent = String(found.size);
    if (gateProgress) gateProgress.textContent = String(found.size);
    hearts.forEach(heart => {
      if (found.has(heart.dataset.heart)) {
        heart.classList.add('is-found');
        heart.disabled = true;
        heart.setAttribute('aria-label', 'Hidden heart found');
      }
    });
    if (found.size >= 3) revealBonus(false);
  }

  function pulse() {
    if (!counterWrap) return;
    counterWrap.classList.add('is-pulse');
    setTimeout(() => counterWrap.classList.remove('is-pulse'), 300);
  }

  function revealBonus(animate) {
    if (!bonus || !bonus.hidden) return;
    bonus.hidden = false;
    if (animate) {
      burstCelebration();
      setTimeout(() => { bonus.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250);
    }
  }

  /* apply saved state immediately */
  syncUI();

  hearts.forEach(heart => {
    heart.addEventListener('click', () => {
      const id = heart.dataset.heart;
      if (found.has(id)) return;
      found.add(id);
      saveProgress();
      heart.classList.add('is-found');
      heart.disabled = true;
      heart.setAttribute('aria-label', 'Hidden heart found');

      if (counterEl) counterEl.textContent = String(found.size);
      if (gateProgress) gateProgress.textContent = String(found.size);
      pulse();

      if (found.size >= 3) revealBonus(true);
    });
  });

  fallback && fallback.addEventListener('click', () => revealBonus(true));
}

/* ==========================================================================
   (music toggle logic now lives in initMusicControls, appended below,
   which drives both the floating toggle and the bonus player from one
   shared #bgAudio element)
   ========================================================================== */

/* ==========================================================================
   AMBIENT SPARKLES — reusable star/dust field generator (hero + tree)
   ========================================================================== */
function spawnSparkles(container, count, opts) {
  opts = opts || {};
  if (!container) return;
  const starRatio = opts.starRatio || 0.25;
  const avoidCenter = !!opts.avoidCenter;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const isStar = Math.random() < starRatio;
    const span = document.createElement('span');
    span.className = 'spark ' + (isStar ? 'spark--star' : 'spark--dust');

    let x = Math.random() * 100;
    if (avoidCenter && x > 32 && x < 68) x = x < 50 ? x - 22 : x + 22;
    const y = Math.random() * 100;
    const size = isStar ? (9 + Math.random() * 7) : (3 + Math.random() * 4);

    span.style.left = x + '%';
    span.style.top = y + '%';
    span.style.setProperty('--s', size + 'px');
    span.style.setProperty('--dur', (3.2 + Math.random() * 3.4).toFixed(2) + 's');
    span.style.setProperty('--delay', (Math.random() * 4).toFixed(2) + 's');
    span.style.setProperty('--peak', String((isStar ? 0.75 : 0.45) + Math.random() * 0.25));
    frag.appendChild(span);
  }
  container.appendChild(frag);
}

function initHeroStars() {
  const field = document.getElementById('heroStars');
  if (!field) return;
  spawnSparkles(field, window.innerWidth < 640 ? 14 : 22, { starRatio: 0.28, avoidCenter: true });
}

/* ==========================================================================
   TILT — subtle mouse-follow 3D tilt for card-like elements
   ========================================================================== */
function initTiltEffect(selector, opts) {
  opts = opts || {};
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  const lift = opts.lift || 0;
  const maxTilt = opts.maxTilt || 8;

  els.forEach(el => {
    let raf = null;
    let rect = null;

    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        rect = rect || el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * maxTilt;
        const ry = (px - 0.5) * (maxTilt * 1.15);
        el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(${lift}px)`;
      });
    };
    const onEnter = () => { rect = el.getBoundingClientRect(); };
    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      el.style.transform = '';
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
  });
}

/* ==========================================================================
   MAGNETIC BUTTONS — subtle pull toward the cursor for primary CTAs
   ========================================================================== */
function initMagneticButtons(selector, opts) {
  opts = opts || {};
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const els = document.querySelectorAll(selector);
  if (!els.length) return;
  const lift = opts.lift || 0;
  const strength = 0.28;

  els.forEach(el => {
    let raf = null, rect = null;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        rect = rect || el.getBoundingClientRect();
        const mx = (e.clientX - rect.left - rect.width / 2) * strength;
        const my = (e.clientY - rect.top - rect.height / 2) * strength;
        el.style.transform = `translate(${mx.toFixed(1)}px, ${(my + lift).toFixed(1)}px)`;
      });
    };
    const onEnter = () => { rect = el.getBoundingClientRect(); };
    const onLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      el.style.transform = '';
    };
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
  });
}

/* ==========================================================================
   TREE — hover-link a branch and its label so either lights the other up
   ========================================================================== */
function initTreeHoverLink() {
  const wrap = document.getElementById('treeWrap');
  if (!wrap) return;

  function link(a, b) {
    if (!a || !b) return;
    const on = () => { a.classList.add('is-active'); b.classList.add('is-active'); };
    const off = () => { a.classList.remove('is-active'); b.classList.remove('is-active'); };
    [a, b].forEach(el => {
      el.addEventListener('mouseenter', on);
      el.addEventListener('mouseleave', off);
    });
  }

  const nums = new Set();
  wrap.querySelectorAll('.tree-branch').forEach(b => nums.add(b.dataset.branch));
  wrap.querySelectorAll('.tree-label').forEach(l => nums.add(l.dataset.branchLabel));

  nums.forEach(n => {
    const branch = wrap.querySelector(`.tree-branch[data-branch="${n}"]`);
    const label = wrap.querySelector(`.tree-label[data-branch-label="${n}"]`);
    link(branch, label);
  });
}

/* ==========================================================================
   CELEBRATION BURST — soft confetti/hearts, used on hunt-unlock + game win
   ========================================================================== */
function burstCelebration() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas || !canvas.getContext || reduceMotion) return;

  const ctx = canvas.getContext('2d');
  const w = canvas.width = window.innerWidth;
  const h = canvas.height = window.innerHeight;
  const colors = ['#A9814A', '#D9BD8B', '#C99089', '#A86C66', '#EADFC3'];
  const COUNT = 46;

  const pieces = Array.from({ length: COUNT }, () => ({
    x: w / 2 + (Math.random() - 0.5) * 140,
    y: h * 0.32 + (Math.random() - 0.5) * 60,
    vx: (Math.random() - 0.5) * 7,
    vy: -Math.random() * 6 - 3,
    size: Math.random() * 5 + 3,
    heart: Math.random() < 0.32,
    color: colors[Math.floor(Math.random() * colors.length)],
    rot: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * 0.2
  }));

  const gravity = 0.16;
  const DURATION = 1500;
  let start = null;

  function drawHeart(x, y, size, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.beginPath();
    ctx.moveTo(0, size * 0.3);
    ctx.bezierCurveTo(-size, -size * 0.4, -size * 0.4, -size, 0, -size * 0.2);
    ctx.bezierCurveTo(size * 0.4, -size, size, -size * 0.4, 0, size * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function frame(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    ctx.clearRect(0, 0, w, h);

    pieces.forEach(p => {
      p.vy += gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      const life = Math.max(0, 1 - elapsed / DURATION);

      ctx.globalAlpha = life;
      ctx.fillStyle = p.color;
      if (p.heart) {
        drawHeart(p.x, p.y, p.size, p.rot);
      } else {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.62);
        ctx.restore();
      }
    });
    ctx.globalAlpha = 1;

    if (elapsed < DURATION) {
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0, 0, w, h);
    }
  }
  requestAnimationFrame(frame);
}

/* ==========================================================================
   SHARED AUDIO ENGINE — one shared audio element, two synced UIs, real-time visualizer
   with a fully self-contained synthetic fallback if Web Audio isn't available
   ========================================================================== */
let audioCtx = null;
let analyser = null;
let freqData = null;
let audioSourceNode = null;
let visualizerRAF = null;

function ensureAudioGraph(audioEl) {
  if (audioCtx) return true;
  if (window.location.protocol === 'file:') {
    return false;
  }
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    audioCtx = new Ctx();
    audioSourceNode = audioCtx.createMediaElementSource(audioEl);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.75;
    freqData = new Uint8Array(analyser.frequencyBinCount);
    audioSourceNode.connect(analyser);
    analyser.connect(audioCtx.destination);
    return true;
  } catch (err) {
    audioCtx = null;
    analyser = null;
    return false;
  }
}

function readLevels(count) {
  const out = new Array(count).fill(0);
  if (analyser && freqData) {
    analyser.getByteFrequencyData(freqData);
    const bucket = Math.max(1, Math.floor(freqData.length / count));
    for (let i = 0; i < count; i++) {
      let sum = 0;
      for (let j = 0; j < bucket; j++) sum += freqData[i * bucket + j] || 0;
      out[i] = (sum / bucket) / 255;
    }
    return out;
  }
  const t = performance.now() / 1000;
  for (let i = 0; i < count; i++) {
    out[i] = 0.35 + 0.3 * Math.abs(Math.sin(t * 2.1 + i * 1.3)) + 0.15 * Math.abs(Math.sin(t * 4.7 + i));
  }
  return out;
}

function drawViz(ctx, canvas, levels) {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  const n = levels.length;
  const gap = 2;
  const barW = (w - gap * (n - 1)) / n;
  const grad = ctx.createLinearGradient(0, h, 0, 0);
  grad.addColorStop(0, '#A9814A');
  grad.addColorStop(1, '#EADFC3');
  ctx.fillStyle = grad;
  levels.forEach((v, i) => {
    const barH = Math.max(2, v * h);
    ctx.fillRect(i * (barW + gap), h - barH, barW, barH);
  });
}

function drawStaticViz(canvas) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#D9BD8B';
  const n = 20, gap = 2;
  const barW = (w - gap * (n - 1)) / n;
  for (let i = 0; i < n; i++) ctx.fillRect(i * (barW + gap), h - h * 0.42, barW, h * 0.42);
}

function startVisualizer() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bars = document.querySelectorAll('.music-toggle__bars i');
  const canvas = document.getElementById('bonusViz');

  if (reduceMotion) {
    bars.forEach(b => { b.style.height = '55%'; });
    drawStaticViz(canvas);
    return;
  }

  const vctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;

  function tick() {
    const levels = readLevels(Math.max(bars.length, 20));
    bars.forEach((b, i) => {
      const idx = Math.floor(i * levels.length / bars.length);
      b.style.height = (18 + (levels[idx] || 0) * 82) + '%';
    });
    if (vctx) drawViz(vctx, canvas, levels);
    visualizerRAF = requestAnimationFrame(tick);
  }
  cancelAnimationFrame(visualizerRAF);
  tick();
}

function stopVisualizer() {
  cancelAnimationFrame(visualizerRAF);
  visualizerRAF = null;
  document.querySelectorAll('.music-toggle__bars i').forEach(b => { b.style.height = '30%'; });
  const canvas = document.getElementById('bonusViz');
  if (canvas && canvas.getContext) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function initMusicControls() {
  const audio = document.getElementById('bgAudio');
  const toggle = document.getElementById('musicToggle');
  const bonusBtn = document.getElementById('bonusPlayerBtn');
  const bonusIconPlay = document.getElementById('bonusIconPlay');
  const bonusIconPause = document.getElementById('bonusIconPause');
  if (!audio) return;

  function setPlayingUI(isPlaying) {
    if (toggle) {
      toggle.classList.toggle('is-playing', isPlaying);
      toggle.setAttribute('aria-pressed', String(isPlaying));
      toggle.setAttribute('aria-label', isPlaying ? 'Pause our song' : 'Play our song');
    }
    if (bonusBtn) {
      bonusBtn.setAttribute('aria-pressed', String(isPlaying));
      bonusBtn.setAttribute('aria-label', isPlaying ? 'Pause our song' : 'Play our song');
    }
    if (bonusIconPlay && bonusIconPause) {
      bonusIconPlay.style.display = isPlaying ? 'none' : '';
      bonusIconPause.style.display = isPlaying ? '' : 'none';
    }
    if (isPlaying) startVisualizer(); else stopVisualizer();
  }

  function play() {
    try {
      ensureAudioGraph(audio);
      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => { });
    } catch (e) { }

    if (audio.readyState === 0) {
      audio.load();
    }

    const promise = audio.play();
    if (promise !== undefined) {
      promise.then(() => setPlayingUI(true)).catch((err) => {
        console.warn('Audio play error:', err);
        setPlayingUI(false);
      });
    } else {
      setPlayingUI(!audio.paused);
    }
  }
  function pause() { audio.pause(); }
  function toggleAudio() { if (audio.paused) play(); else pause(); }

  toggle && toggle.addEventListener('click', toggleAudio);
  bonusBtn && bonusBtn.addEventListener('click', toggleAudio);

  audio.addEventListener('play', () => setPlayingUI(true));
  audio.addEventListener('pause', () => setPlayingUI(false));
  audio.addEventListener('ended', () => setPlayingUI(false));

  // lets the preloader's "begin, with sound" button use the same engine
  window.__beginWithSound = play;
}

/* ==========================================================================
   HERO LUXURY — Full interactive love journal hero
   ========================================================================== */
function initHeroLuxury() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  buildHeroMarquee();
  buildHeroEasterEggs();
  initHeroLightbox();
  initHeroCTA();

  if (!reduceMotion) {
    initHeroParticleCanvas();
    initHeroFloatingElements();
    initHeroCursor();
    initHeroScrollEffect();
    initHeroMicroInteractions();
  }
  initHeroMoonEgg();
  initHeroLongPress();

  // Watch for preloader close → start typography reveal
  const obs = new MutationObserver(() => {
    if (document.body.classList.contains('hero-entered')) {
      obs.disconnect();
      setTimeout(initHeroTypographyReveal, 120);
    }
  });
  obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if (document.body.classList.contains('hero-entered')) setTimeout(initHeroTypographyReveal, 120);
}

/* --- Cinematic typography reveal sequence --- */
function initHeroTypographyReveal() {
  const seq = [
    { id: 'heroLabel', delay: 200 },
    { id: 'heroHeadingTop', delay: 560 },
    { id: 'heroHeadingName', delay: 940 },
    { id: 'heroQuote1', delay: 1420 },
    { id: 'heroQuote2', delay: 1840 },
    { id: 'heroStats', delay: 2360 },
    { id: 'heroMarquee', delay: 2760 },
    { id: 'heroCta', delay: 3260 },
  ];
  seq.forEach(({ id, delay }) => {
    const el = document.getElementById(id);
    if (!el) return;
    setTimeout(() => el.classList.add('is-revealed'), delay);
  });
}

/* --- Particle canvas: stars, dust, bokeh circles --- */
function initHeroParticleCanvas() {
  const canvas = document.getElementById('heroParticleCanvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles, raf;
  let pageVisible = true;

  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }

  function mkP() {
    const r = Math.random();
    if (r < 0.14) return { kind: 'bokeh', x: Math.random() * 100, y: Math.random() * 100, rad: 18 + Math.random() * 55, alpha: .05 + Math.random() * .08, phase: Math.random() * Math.PI * 2, speed: .3 + Math.random() * .5 };
    if (r < 0.34) return { kind: 'star', x: Math.random() * w, y: Math.random() * h, rad: .7 + Math.random() * 1.5, peakA: .45 + Math.random() * .55, phase: Math.random() * Math.PI * 2, speed: .5 + Math.random() * 1.2 };
    return { kind: 'dust', x: Math.random() * w, y: Math.random() * h, rad: .5 + Math.random() * 1.1, alpha: .07 + Math.random() * .16, vx: (Math.random() - .5) * .2, vy: -.04 - Math.random() * .24, phase: Math.random() * Math.PI * 2 };
  }

  function build() {
    resize();
    particles = Array.from({ length: Math.min(80, Math.floor(w / 16)) }, mkP);
  }

  function tick(ts) {
    if (!pageVisible) return;
    ctx.clearRect(0, 0, w, h);
    const t = (ts || 0) / 1000;
    particles.forEach(p => {
      if (p.kind === 'dust') {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(208,172,98,${p.alpha})`; ctx.fill();
      } else if (p.kind === 'star') {
        const a = p.peakA * (0.5 + 0.5 * Math.sin(t * p.speed + p.phase));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.rad, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(238,212,158,${a})`; ctx.fill();
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.rad * 4);
        g.addColorStop(0, `rgba(238,212,158,${a * .28})`); g.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(p.x, p.y, p.rad * 4, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
      } else {
        const xp = p.x / 100 * w, yp = p.y / 100 * h;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(t * p.speed + p.phase));
        ctx.beginPath(); ctx.arc(xp, yp, p.rad, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(212,172,88,${a})`; ctx.lineWidth = .7; ctx.stroke();
      }
    });
    raf = requestAnimationFrame(tick);
  }

  build(); tick(0);
  window.addEventListener('resize', build);
  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    if (pageVisible) tick(0); else cancelAnimationFrame(raf);
  });
}

/* --- Floating hearts, petals, fireflies, bokeh DOM elements --- */
function initHeroFloatingElements() {
  const c = document.getElementById('heroFloaters');
  if (!c) return;
  const heartSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M12 20S3.5 14.3 3.5 8.8C3.5 5.6 5.9 4 8.5 4c1.8 0 3.3 1 4 2.4C13.2 5 14.7 4 16.5 4c2.6 0 5 1.6 5 4.8 0 5.5-9.5 11.2-9.5 11.2Z"/></svg>`;
  const hPos = [[5, 20], [12, 65], [85, 35], [92, 70], [48, 85], [25, 45], [70, 18], [38, 75], [15, 50], [80, 55], [55, 30], [35, 88], [62, 60], [8, 38], [44, 15], [76, 80], [20, 72], [90, 22], [50, 50], [32, 30], [68, 45]];
  hPos.forEach(([x, y]) => {
    const el = document.createElement('div'); el.className = 'hero-heart-float';
    const sz = 10 + Math.random() * 10;
    el.style.cssText = `left:${x}%;top:${y}%;--sz:${sz}px;--rot:${(Math.random() - .5) * 30}deg;--dur:${10 + Math.random() * 8}s;--delay:${Math.random() * 8}s;--peak:${.38 + Math.random() * .22};--travel:-${160 + Math.random() * 80}px;`;
    el.innerHTML = heartSVG; c.appendChild(el);
  });
  for (let i = 0; i < 15; i++) {
    const el = document.createElement('div'); el.className = 'hero-petal';
    el.style.cssText = `left:${Math.random() * 100}%;top:${-5 + Math.random() * 20}%;--dur:${7 + Math.random() * 6}s;--delay:${Math.random() * 10}s;--peak:${.28 + Math.random() * .2};--drift:${(Math.random() - .5) * 120}px;`;
    c.appendChild(el);
  }
  for (let i = 0; i < 8; i++) {
    const el = document.createElement('div'); el.className = 'hero-firefly';
    el.style.cssText = `left:${10 + Math.random() * 80}%;top:${20 + Math.random() * 60}%;--dur:${12 + Math.random() * 8}s;--delay:${Math.random() * 6}s;--dx1:${(Math.random() - .5) * 80}px;--dy1:${(Math.random() - .5) * 60}px;--dx2:${(Math.random() - .5) * 80}px;--dy2:${(Math.random() - .5) * 60}px;--dx3:${(Math.random() - .5) * 80}px;--dy3:${(Math.random() - .5) * 60}px;`;
    c.appendChild(el);
  }
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div'); el.className = 'hero-bokeh';
    const s = 18 + Math.random() * 82;
    el.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;width:${s}px;height:${s}px;--dur:${5 + Math.random() * 8}s;--delay:${Math.random() * 5}s;--alpha:${.07 + Math.random() * .14};`;
    c.appendChild(el);
  }
}

/* --- Premium custom cursor with lag ring --- */
function initHeroCursor() {
  const hero = document.getElementById('hero');
  const cursor = document.getElementById('heroCursor');
  const ring = document.getElementById('heroCursorRing');
  if (!cursor || !ring || !hero) return;
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  let mx = 0, my = 0, rx = 0, ry = 0, raf = null;
  function animRing() {
    rx += (mx - rx) * .13; ry += (my - ry) * .13;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    raf = requestAnimationFrame(animRing);
  }

  hero.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
    cursor.style.opacity = '1'; ring.style.opacity = '1';
    if (!raf) animRing();
  }, { passive: true });
  hero.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0'; ring.style.opacity = '0';
    cancelAnimationFrame(raf); raf = null;
  });

  hero.querySelectorAll('.hero-btn-primary,.hero-btn-secondary,.marquee-photo,.hero-stat,#heroMoon,.hero-hidden-heart,.hero-hidden-rose').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('is-hov'); ring.classList.add('is-hov'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('is-hov'); ring.classList.remove('is-hov'); });
  });

  hero.addEventListener('click', e => {
    const h = document.createElement('div');
    h.className = 'cursor-click-heart'; h.textContent = '\u2665';
    h.style.left = e.clientX + 'px'; h.style.top = e.clientY + 'px';
    document.body.appendChild(h); setTimeout(() => h.remove(), 700);
  });
}

/* --- Build dual infinite image marquees --- */
function buildHeroMarquee() {
  const allPhotos = [
    { src: 'assets/The Beginning.jpg', cap: 'First Hello' },
    { src: 'assets/College/DSC_0154_1-PHOTO_FRAME.jpg', cap: 'St. Philomena Day' },
    { src: 'assets/College/Classroom_.jpg', cap: 'Classroom Days' },
    { src: 'assets/College/Clg day.jpg', cap: 'College Fest Day' },
    { src: 'assets/College/Clg day 2.jpg', cap: 'College Day Smile' },
    { src: 'assets/College/College_.jpg', cap: 'Campus Memories' },
    { src: 'assets/College/College last_.jpg', cap: 'Corridor Talks' },
    { src: 'assets/College/Last day of clg.jpg', cap: 'Last Day of College' },
    { src: 'assets/Old img.jpg', cap: 'Early Days' },
    { src: 'assets/Old collage_.jpg', cap: 'College Collage' },
    { src: 'assets/St Philomena day.jpg', cap: 'Photo Shoot Day' },
    { src: 'assets/Mangalore/Mangalore 1.jpg', cap: 'Panambur Sunset' },
    { src: 'assets/Mangalore/Mangalore 2.jpg', cap: 'Coastal Breeze' },
    { src: 'assets/Mangalore/Mangalore 3.jpg', cap: 'Golden Hour' },
    { src: 'assets/Mangalore/Bike ride.jpg', cap: 'Coastal Highway Ride' },
    { src: 'assets/Mangalore/Mansoon ride.jpg', cap: 'Monsoon Ride' },
    { src: 'assets/Mangalore/Karinjeshwara parvathi gudda_.jpg', cap: 'Karinjeshwara Temple' },
    { src: 'assets/Kabari katte.jpg', cap: 'Koragajjana Katte' },
    { src: 'assets/Wonderla.jpg', cap: 'Wonderla Trip' },
    { src: 'assets/Small Moments/Kochi trip.jpg', cap: 'Kochi Sea Breeze' },
    { src: 'assets/Kochi 2.jpg', cap: 'Kochi Streets' },
    { src: 'assets/Foodie Us/Aramane biryani_.jpg', cap: 'Aramane Biryani' },
    { src: 'assets/Foodie Us/Arabian puttur_.jpg', cap: 'Arabian Puttur Treats' },
    { src: 'assets/Foodie Us/Kfc.jpg', cap: 'KFC Chicken Dates' },
    { src: 'assets/Foodie Us/Mandi biryani 2.jpg', cap: 'Mandi Biryani' },
    { src: 'assets/Foodie Us/Lunch home.jpg', cap: 'Special Lunch Date' },
    { src: 'assets/Small Moments/JP Nagar ground_.jpg', cap: 'JP Nagar Ground Sunset' },
    { src: 'assets/Bangalore/Empire hotel_.jpg', cap: 'Empire Hotel Midnight' },
    { src: 'assets/Bangalore/Us.png', cap: 'Bangalore Life' },
    { src: 'assets/Bangalore/us 2.png', cap: 'Silly Bangalore Moments' },
    { src: 'assets/Bangalore/Mall of asia.jpg', cap: 'Mall of Asia Evening' },
    { src: 'assets/Bangalore/Mall of Asia 2.jpg', cap: 'Mall of Asia Lights' },
    { src: 'assets/Bangalore/Christmas 2024 w.jpg', cap: 'Christmas 2024' },
    { src: 'assets/Bangalore/Christmas 24.7', cap: 'Christmas Party' },
    { src: 'assets/Bangalore/GB Palya.jpg', cap: 'GB Palya Walk' },
    { src: 'assets/Bangalore/GB Palya 2.jpg', cap: 'GB Palya Stroll' },
    { src: 'assets/Bangalore/Bangalore_.jpg', cap: 'City Outing' },
    { src: 'assets/Bangalore/Near pg.jpg', cap: 'Near PG Morning Talks' },
    { src: 'assets/Bangalore/Marathon_.jpg', cap: 'Marathon 2026 Finish' },
    { src: 'assets/Bangalore/Marathon 2.jpg', cap: 'Marathon Medals' },
    { src: 'assets/Bangalore/Marathon 3.jpg', cap: 'Marathon Energy' },
    { src: 'assets/Bangalore/Marathon 4.jpg', cap: 'Race Day Smiles' },
    { src: 'assets/Bangalore/Marathon 5.jpg', cap: 'Full Marathon Celebration' },
    { src: 'assets/Bangalore/Marathon 6.jpg', cap: 'Victory Smile' },
    { src: 'assets/Small Moments/Balavana.jpg', cap: 'Balavana Park Bench' },
    { src: 'assets/Small Moments/At Darbe.jpg', cap: 'At Darbe Hangout' },
    { src: 'assets/Small Moments/Bharat mall.jpg', cap: 'Bharat Mall Movies' },
    { src: 'assets/Small Moments/Chawthi.jpg', cap: 'Chawthi Festival' },
    { src: 'assets/Small Moments/Going home_.jpg', cap: 'Bus Seat Heading Home' },
    { src: 'assets/Small Moments/Holy rosary_.jpg', cap: 'Holy Rosary Church' },
    { src: 'assets/Small Moments/Park.jpg', cap: 'Park Breeze' },
    { src: 'assets/Small Moments/Reliance puttur_.jpg', cap: 'Reliance Puttur Outing' },
    { src: 'assets/Small Moments/Sai cafe_.jpg', cap: 'Sai Cafe Tea Date' },
    { src: 'assets/Small Moments/The bangle.jpg', cap: 'The Silver Bangle' },
    { src: 'assets/Small Moments/The ring_.jpg', cap: 'The Ring' },
    { src: 'assets/Same watch_.jpg', cap: 'Matching Watches' },
    { src: 'assets/Small Moments/SAVE_20240502_021619.jpg', cap: 'Random Quiet Selfie' },
    { src: 'assets/Small Moments/SAVE_20250511_200419.jpg', cap: 'Sunlit Afternoon' },
    { src: 'assets/2024.jpg', cap: '7th Heaven 2024' },
    { src: 'assets/Bangalore/Reunion_.jpg', cap: 'Reunion Celebration' },
    { src: 'assets/We.jpg', cap: 'Us Together' },
    { src: 'assets/Jaanu.jpg', cap: 'My Jaanu' },
    { src: 'assets/Small Moments/file_00000000a95471f8b55e93b551f335ab.png', cap: 'Candid Radiance' }
  ];

  // Assign random rotation between -3 and 3 deg
  allPhotos.forEach(p => {
    p.rot = Number(((Math.random() * 6) - 3).toFixed(1));
  });

  // Split photos into two even rows
  const row1 = allPhotos.slice(0, Math.ceil(allPhotos.length / 2));
  const row2 = allPhotos.slice(Math.ceil(allPhotos.length / 2));

  function makeTrack(photos) {
    const photos2x = [...photos, ...photos]; // duplicate for seamless -50% infinite loop
    return photos2x.map(p => {
      const fig = document.createElement('figure');
      fig.className = 'marquee-photo';
      fig.style.setProperty('--rot', (p.rot || 0) + 'deg');
      fig.dataset.caption = p.cap;
      fig.innerHTML = `<div class="marquee-photo__inner"><img src="${p.src}" alt="${p.cap}" loading="lazy"></div><figcaption>${p.cap}</figcaption>`;
      return fig;
    });
  }

  const t1 = document.getElementById('marqueeTrack1');
  const t2 = document.getElementById('marqueeTrack2');
  if (t1) makeTrack(row1).forEach(f => t1.appendChild(f));
  if (t2) makeTrack(row2).forEach(f => t2.appendChild(f));
}

/* --- Fullscreen lightbox for marquee photos --- */
function initHeroLightbox() {
  const lb = document.getElementById('heroLightbox');
  const lbImg = document.getElementById('heroLightboxImg');
  const lbCap = document.getElementById('heroLightboxCaption');
  const lbX = document.getElementById('heroLightboxClose');
  if (!lb) return;

  const open = (src, cap) => { lbImg.src = src; lbImg.alt = cap; if (lbCap) lbCap.textContent = cap; lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; };
  const close = () => { lb.classList.remove('is-open'); document.body.style.overflow = ''; lbImg.src = ''; };

  document.addEventListener('click', e => {
    const ph = e.target.closest('.marquee-photo');
    if (ph) { const img = ph.querySelector('img'); if (img) open(img.src, ph.dataset.caption || ''); }
  });
  lbX && lbX.addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && lb.classList.contains('is-open')) close(); });
}

/* --- CTA: primary button behaviors --- */
function initHeroCTA() {
  const pBtn = document.getElementById('heroPrimaryBtn');
  const sBtn = document.getElementById('heroSkipMusicBtn');
  const audio = document.getElementById('bgAudio');
  const indicator = document.getElementById('heroMusicIndicator');
  const vinyl = document.getElementById('heroVinyl');
  const waveform = document.getElementById('heroWaveform');

  function showMusicUI() { if (indicator) indicator.classList.add('is-visible'); if (vinyl) vinyl.classList.add('is-spinning'); if (waveform) waveform.classList.add('is-playing'); }
  function hideMusicSpinner() { if (vinyl) vinyl.classList.remove('is-spinning'); if (waveform) waveform.classList.remove('is-playing'); }

  // Recurring glow pulse every 8 s
  if (pBtn) {
    setInterval(() => { pBtn.classList.add('is-pulsing'); setTimeout(() => pBtn.classList.remove('is-pulsing'), 850); }, 8000);

    pBtn.addEventListener('click', e => {
      // Ripple
      const rect = pBtn.getBoundingClientRect();
      const rip = document.createElement('span'); rip.className = 'hero-btn-ripple';
      const sz = Math.max(rect.width, rect.height);
      rip.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - rect.left - sz / 2}px;top:${e.clientY - rect.top - sz / 2}px;`;
      pBtn.appendChild(rip); setTimeout(() => rip.remove(), 700);
      // Heart burst
      heroHeartBurst(e.clientX, e.clientY, 7);
      // Music
      if (typeof window.__beginWithSound === 'function') window.__beginWithSound();
      setTimeout(showMusicUI, 900);
      // Scroll to story
      setTimeout(() => { const ch = document.getElementById('ch1'); if (ch) ch.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 1500);
    });

    // Magnetic hover
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
      let rect = null, raf = null;
      pBtn.addEventListener('pointerenter', () => { rect = pBtn.getBoundingClientRect(); });
      pBtn.addEventListener('pointermove', e => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null; if (!rect) return;
          const mx = (e.clientX - rect.left - rect.width / 2) * .28;
          const my = (e.clientY - rect.top - rect.height / 2) * .28;
          pBtn.style.transform = `translate(${mx.toFixed(1)}px,${my.toFixed(1)}px) translateY(-2px)`;
        });
      });
      pBtn.addEventListener('pointerleave', () => { cancelAnimationFrame(raf); raf = null; pBtn.style.transform = ''; });
    }
  }

  sBtn && sBtn.addEventListener('click', () => { const ch = document.getElementById('ch1'); if (ch) ch.scrollIntoView({ behavior: 'smooth', block: 'start' }); });

  if (audio) {
    audio.addEventListener('play', () => showMusicUI());
    audio.addEventListener('pause', () => hideMusicSpinner());
  }
}

function heroHeartBurst(x, y, count) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const h = document.createElement('div');
      h.className = 'cursor-click-heart'; h.textContent = '\u2665';
      h.style.left = (x + (Math.random() - .5) * 44) + 'px';
      h.style.top = (y + (Math.random() - .5) * 44) + 'px';
      h.style.fontSize = (11 + Math.random() * 10) + 'px';
      document.body.appendChild(h); setTimeout(() => h.remove(), 700);
    }, i * 55);
  }
}

/* --- Micro-interactions: sparkles on title hover, petals on HBD --- */
function initHeroMicroInteractions() {
  const nameEl = document.getElementById('heroHeadingName');
  const topEl = document.getElementById('heroHeadingTop');

  function spawnSparks(el, e) {
    const rect = el.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      const sp = document.createElement('div');
      sp.className = 'hero-title-sparkle';
      const ox = (e.clientX - rect.left) + (Math.random() - .5) * 60;
      const oy = (e.clientY - rect.top) + (Math.random() - .5) * 28;
      sp.style.cssText = `left:${rect.left + ox}px;top:${rect.top + oy}px;--dx:${(Math.random() - .5) * 80}px;--dy:${-18 - Math.random() * 48}px;`;
      document.body.appendChild(sp); setTimeout(() => sp.remove(), 700);
    }
  }

  let lastSpark = 0;
  [nameEl, topEl].forEach(el => {
    if (!el) return;
    el.addEventListener('mousemove', e => { const now = Date.now(); if (now - lastSpark > 110) { lastSpark = now; spawnSparks(el, e); } });
  });

  // HBD line hover → burst petals
  topEl && topEl.addEventListener('mouseenter', () => {
    const rect = topEl.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const p = document.createElement('div');
        p.className = 'hero-petal';
        p.style.cssText = `position:fixed;left:${rect.left + Math.random() * rect.width}px;top:${rect.top}px;--dur:1.6s;--delay:0s;--peak:.65;--drift:${(Math.random() - .5) * 90}px;`;
        document.body.appendChild(p); setTimeout(() => p.remove(), 1800);
      }, i * 90);
    }
  });
}

/* --- Easter eggs: 23 hidden hearts + 3 hidden roses --- */
function buildHeroEasterEggs() {
  const c = document.getElementById('heroEasterEggs');
  if (!c) return;

  const hPos = [
    [8, 12], [15, 45], [22, 78], [30, 25], [37, 62], [44, 88], [51, 18], [58, 52], [65, 82], [72, 35],
    [79, 68], [86, 15], [93, 50], [10, 92], [20, 38], [33, 72], [46, 10], [55, 48], [63, 85], [77, 28],
    [88, 62], [4, 55], [95, 38]
  ];
  const heartSVG = `<svg viewBox="0 0 24 24"><path d="M12 20S3.5 14.3 3.5 8.8C3.5 5.6 5.9 4 8.5 4c1.8 0 3.3 1 4 2.4C13.2 5 14.7 4 16.5 4c2.6 0 5 1.6 5 4.8 0 5.5-9.5 11.2-9.5 11.2Z"/></svg>`;

  hPos.forEach(([x, y], i) => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'hero-hidden-heart';
    btn.style.cssText = `left:${x}%;top:${y}%;`;
    btn.setAttribute('aria-label', 'A tiny hidden heart');
    btn.innerHTML = heartSVG;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (btn.classList.contains('is-found')) return;
      btn.classList.add('is-found');
      showHeroLoveMsg();
      heroHeartBurst(e.clientX, e.clientY, 4);
    });
    c.appendChild(btn);
  });

  let rosesFound = 0;
  [[18, 28], [72, 14], [44, 67]].forEach(([x, y]) => {
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'hero-hidden-rose';
    btn.style.cssText = `left:${x}%;top:${y}%;`;
    btn.setAttribute('aria-label', 'A hidden rose');
    btn.textContent = '\uD83C\uDF39';
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (btn.classList.contains('is-found')) return;
      btn.classList.add('is-found'); rosesFound++;
      heroHeartBurst(e.clientX, e.clientY, 3);
      if (rosesFound >= 3) setTimeout(() => { const o = document.getElementById('heroLoveNoteOverlay'); if (o) o.classList.add('is-open'); }, 550);
    });
    c.appendChild(btn);
  });

  const noteClose = document.getElementById('heroLoveNoteClose');
  const noteOverlay = document.getElementById('heroLoveNoteOverlay');
  noteClose && noteClose.addEventListener('click', () => noteOverlay && noteOverlay.classList.remove('is-open'));
  noteOverlay && noteOverlay.addEventListener('click', e => { if (e.target === noteOverlay) noteOverlay.classList.remove('is-open'); });
}

function showHeroLoveMsg() {
  const msg = document.getElementById('heroLoveMsg');
  if (!msg || msg.classList.contains('is-showing')) return;
  msg.classList.add('is-showing');
  setTimeout(() => msg.classList.remove('is-showing'), 2100);
}

/* --- Moon easter egg → shooting star --- */
function initHeroMoonEgg() {
  const moon = document.getElementById('heroMoon');
  if (!moon) return;
  moon.addEventListener('mouseenter', () => moon.style.opacity = '.6');
  moon.addEventListener('mouseleave', () => moon.style.opacity = '.16');
  moon.addEventListener('click', e => {
    e.stopPropagation();
    const rect = moon.getBoundingClientRect();
    const star = document.createElement('div');
    star.className = 'hero-shooting-star';
    star.style.left = (rect.left + rect.width / 2) + 'px';
    star.style.top = (rect.top + rect.height / 2) + 'px';
    document.body.appendChild(star);
    setTimeout(() => star.remove(), 1500);
    heroHeartBurst(e.clientX, e.clientY, 2);
  });
}

/* --- Long press on hero background → "I'll always choose you." --- */
function initHeroLongPress() {
  const hero = document.getElementById('hero');
  const msg = document.getElementById('heroLongPressMsg');
  if (!hero || !msg) return;
  let timer = null;
  hero.addEventListener('pointerdown', e => {
    if (e.target.closest('button,.marquee-photo,a')) return;
    timer = setTimeout(() => { msg.classList.add('is-showing'); setTimeout(() => msg.classList.remove('is-showing'), 2600); }, 1500);
  });
  ['pointerup', 'pointerleave', 'pointermove'].forEach(ev => hero.addEventListener(ev, () => clearTimeout(timer)));
}

/* --- Scroll parallax: hero zooms out, marquee slows, text fades up --- */
function initHeroScrollEffect() {
  const hero = document.getElementById('hero');
  const content = document.getElementById('heroContent');
  const marquee = document.getElementById('heroMarquee');
  if (!hero || !content) return;
  let tick = false;
  window.addEventListener('scroll', () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      const sy = window.scrollY, hh = hero.offsetHeight;
      const p = Math.min(sy / hh, 1);
      content.style.transform = `scale(${1 - p * .05}) translateY(${-p * 55}px)`;
      content.style.opacity = Math.max(0, 1 - p * 2.4);
      if (marquee) { marquee.style.transform = `translateY(${p * 28}px)`; }
      tick = false;
    });
  }, { passive: true });
}
