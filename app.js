/* ═══════════════════════════════════════════════════════════════
   808 ALL PURPOSE CLEANERS — JavaScript
   Particle System, Scroll Animations, Interactive Effects
═══════════════════════════════════════════════════════════════ */

/* ── CURSOR SPARKLE ───────────────────────────────────────────── */
(function initCursor() {
  const cursor = document.getElementById('cursorSparkle');
  let mx = -100, my = -100;
  let cx = -100, cy = -100;
  const trail = [];
  const TRAIL_LENGTH = 8;

  // Create trail dots
  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed; border-radius: 50%; pointer-events: none; z-index: 99998;
      transform: translate(-50%,-50%); mix-blend-mode: screen;
      background: radial-gradient(circle, rgba(0,229,255,0.6), transparent);
    `;
    document.body.appendChild(dot);
    trail.push({ el: dot, x: -100, y: -100 });
  }

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    spawnClickSparkles(e.clientX, e.clientY, 1);
  });

  document.addEventListener('mousedown', (e) => {
    spawnClickSparkles(e.clientX, e.clientY, 6);
    cursor.style.width = '40px';
    cursor.style.height = '40px';
  });

  document.addEventListener('mouseup', () => {
    cursor.style.width = '24px';
    cursor.style.height = '24px';
  });

  function spawnClickSparkles(x, y, count) {
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      const size = 6 + Math.random() * 10;
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 60;
      s.style.cssText = `
        position: fixed; width: ${size}px; height: ${size}px;
        border-radius: 50%; pointer-events: none; z-index: 99997;
        left: ${x}px; top: ${y}px; transform: translate(-50%,-50%);
        background: ${Math.random() > 0.5 ? 'rgba(255,215,0,0.9)' : 'rgba(0,229,255,0.9)'};
        box-shadow: 0 0 ${size}px ${Math.random() > 0.5 ? 'rgba(255,215,0,0.6)' : 'rgba(0,229,255,0.6)'};
      `;
      document.body.appendChild(s);
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      s.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
      ], { duration: 600 + Math.random() * 400, easing: 'ease-out', fill: 'forwards' })
        .onfinish = () => s.remove();
    }
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateCursor() {
    cx = lerp(cx, mx, 0.15);
    cy = lerp(cy, my, 0.15);
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';

    // Update trail
    for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
      trail[i].x = lerp(trail[i].x, trail[i-1].x, 0.35);
      trail[i].y = lerp(trail[i].y, trail[i-1].y, 0.35);
    }
    trail[0].x = cx;
    trail[0].y = cy;

    trail.forEach((t, i) => {
      const pct = 1 - i / TRAIL_LENGTH;
      const size = pct * 12;
      t.el.style.cssText = `
        position: fixed; width: ${size}px; height: ${size}px;
        border-radius: 50%; pointer-events: none; z-index: 99998;
        left: ${t.x}px; top: ${t.y}px;
        transform: translate(-50%,-50%);
        mix-blend-mode: screen;
        opacity: ${pct * 0.5};
        background: radial-gradient(circle, rgba(0,229,255,0.8), transparent);
      `;
    });

    requestAnimationFrame(animateCursor);
  }
  animateCursor();
})();

/* ── PARTICLE CANVAS (Bubbles + Sparkles) ─────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.type = Math.random() > 0.5 ? 'bubble' : 'sparkle';
      this.x = Math.random() * W;
      this.y = initial ? Math.random() * H : H + 20;
      this.r = this.type === 'bubble'
        ? 3 + Math.random() * 18
        : 1 + Math.random() * 3;
      this.vx = (Math.random() - 0.5) * 0.8;
      this.vy = -(0.3 + Math.random() * 1.2);
      this.opacity = 0;
      this.maxOpacity = 0.3 + Math.random() * 0.5;
      this.life = 0;
      this.maxLife = 200 + Math.random() * 300;
      this.angle = Math.random() * Math.PI * 2;
      this.angleSpeed = (Math.random() - 0.5) * 0.05;
      this.hue = Math.random() > 0.6 ? 200 : (Math.random() > 0.5 ? 50 : 180);
    }
    update() {
      this.life++;
      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.angleSpeed;
      const progress = this.life / this.maxLife;
      if (progress < 0.1) this.opacity = (progress / 0.1) * this.maxOpacity;
      else if (progress > 0.8) this.opacity = ((1 - progress) / 0.2) * this.maxOpacity;
      else this.opacity = this.maxOpacity;
      if (this.life >= this.maxLife || this.y < -50) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      if (this.type === 'bubble') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(
          this.x - this.r * 0.3, this.y - this.r * 0.3, this.r * 0.1,
          this.x, this.y, this.r
        );
        grad.addColorStop(0, `hsla(${this.hue}, 80%, 95%, 0.8)`);
        grad.addColorStop(0.5, `hsla(${this.hue}, 70%, 70%, 0.2)`);
        grad.addColorStop(1, `hsla(${this.hue}, 60%, 50%, 0.05)`);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = `hsla(${this.hue}, 80%, 80%, 0.4)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        // Bubble shine
        ctx.beginPath();
        ctx.arc(this.x - this.r * 0.35, this.y - this.r * 0.35, this.r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fill();
      } else {
        // Sparkle: 4-point star
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        const s = this.r * 3;
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i * Math.PI) / 2;
          const innerA = a + Math.PI / 4;
          if (i === 0) ctx.moveTo(Math.cos(a) * s, Math.sin(a) * s);
          else ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
          ctx.lineTo(Math.cos(innerA) * s * 0.3, Math.sin(innerA) * s * 0.3);
        }
        ctx.closePath();
        ctx.fillStyle = this.hue === 50
          ? `rgba(255,215,0,0.9)`
          : `rgba(0,229,255,0.9)`;
        ctx.fill();
        ctx.shadowColor = this.hue === 50 ? '#FFD700' : '#00E5FF';
        ctx.shadowBlur = 8;
      }
      ctx.restore();
    }
  }

  // Create particles
  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ── DYNAMIC BUBBLES IN HERO ──────────────────────────────────── */
(function initHeroBubbles() {
  const container = document.getElementById('bubblesContainer');
  if (!container) return;

  function createBubble() {
    const b = document.createElement('div');
    b.classList.add('bubble');
    const size = 10 + Math.random() * 60;
    const left = Math.random() * 100;
    const dur = 6 + Math.random() * 10;
    const delay = Math.random() * 5;
    const drift = (Math.random() - 0.5) * 100;

    b.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${left}%;
      bottom: 0;
      --drift: ${drift}px;
      animation-duration: ${dur}s;
      animation-delay: -${delay}s;
      opacity: 0;
    `;
    container.appendChild(b);

    setTimeout(() => {
      if (b.parentNode) b.remove();
      createBubble();
    }, (dur + delay) * 1000);
  }

  for (let i = 0; i < 20; i++) createBubble();
})();

/* ── NAVBAR SCROLL BEHAVIOR ───────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }, { passive: true });

  burger && burger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const spans = burger.querySelectorAll('span');
    if (mobileMenu.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close on link click
  mobileMenu && mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.querySelectorAll('span').forEach(s => {
        s.style.transform = ''; s.style.opacity = '';
      });
    });
  });
})();

/* ── SCROLL REVEAL ────────────────────────────────────────────── */
(function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay || 0);
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  items.forEach(item => observer.observe(item));
})();

/* ── COUNTER ANIMATION ────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
})();

/* ── TESTIMONIALS CAROUSEL DOTS ───────────────────────────────── */
(function initTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  const dotsContainer = document.getElementById('testimonialsDots');
  if (!track || !dotsContainer) return;

  const cards = track.querySelectorAll('.tcard');
  const count = cards.length;
  let currentDot = 0;

  // Scroll only within the horizontal track — never touches page scroll
  function scrollToCard(idx) {
    const card = cards[idx];
    const trackRect = track.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const offset = cardRect.left - trackRect.left + track.scrollLeft - (trackRect.width - cardRect.width) / 2;
    track.scrollTo({ left: offset, behavior: 'smooth' });
  }

  // Create dots
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => scrollToCard(i));
    dotsContainer.appendChild(dot);
  }

  const dots = dotsContainer.querySelectorAll('.dot');

  // Update active dot based on scroll position within the track
  track.addEventListener('scroll', () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(center - cardCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    currentDot = closest;
    dots.forEach(d => d.classList.remove('active'));
    if (dots[closest]) dots[closest].classList.add('active');
  }, { passive: true });

  // Auto-advance: only scrolls the inner track, never the page
  let autoPlay = setInterval(() => {
    currentDot = (currentDot + 1) % count;
    scrollToCard(currentDot);
  }, 4000);

  track.addEventListener('pointerenter', () => clearInterval(autoPlay));
  track.addEventListener('pointerleave', () => {
    autoPlay = setInterval(() => {
      currentDot = (currentDot + 1) % count;
      scrollToCard(currentDot);
    }, 4000);
  });
})();

/* ── SERVICE CARD 3D TILT ─────────────────────────────────────── */
(function initCardTilt() {
  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const tiltX = dy * -8;
      const tiltY = dx * 8;
      card.style.transform = `translateY(-10px) scale(1.01) perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s ease';
      setTimeout(() => card.style.transition = '', 500);
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });
})();

/* ── PARALLAX SPONGES ─────────────────────────────────────────── */
(function initParallax() {
  const sponges = document.querySelectorAll('.sponge');
  const speeds = [0.3, 0.5, 0.2, 0.4, 0.6, 0.25];

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    sponges.forEach((s, i) => {
      const speed = speeds[i % speeds.length];
      s.style.transform = `translateY(${scrollY * speed * -0.3}px)`;
    });
  }, { passive: true });
})();

/* ── AURORA MOUSE PARALLAX ────────────────────────────────────── */
(function initAuroraParallax() {
  const auroras = document.querySelectorAll('.aurora');
  document.addEventListener('mousemove', (e) => {
    const cx = (e.clientX / window.innerWidth - 0.5) * 2;
    const cy = (e.clientY / window.innerHeight - 0.5) * 2;
    auroras.forEach((a, i) => {
      const depth = (i + 1) * 15;
      a.style.transform = `translate(${cx * depth}px, ${cy * depth}px) scale(1)`;
    });
  });
})();

/* ── SMOOTH ANCHOR SCROLL ─────────────────────────────────────── */
(function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();

/* ── SPARKLE TRAIL ON SCROLL ──────────────────────────────────── */
(function initScrollSparkle() {
  let lastScrollY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const delta = Math.abs(window.scrollY - lastScrollY);
        if (delta > 5) {
          // Create sparkle at random position
          const s = document.createElement('div');
          const x = 10 + Math.random() * (window.innerWidth - 20);
          const y = Math.random() * window.innerHeight;
          s.style.cssText = `
            position: fixed; left: ${x}px; top: ${y}px;
            width: 6px; height: 6px; border-radius: 50%;
            pointer-events: none; z-index: 9999;
            background: ${Math.random() > 0.5 ? 'rgba(255,215,0,0.8)' : 'rgba(0,229,255,0.8)'};
            box-shadow: 0 0 10px currentColor;
            transform: translate(-50%,-50%);
          `;
          document.body.appendChild(s);
          s.animate([
            { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
            { transform: `translate(-50%, calc(-50% - 30px)) scale(0)`, opacity: 0 }
          ], { duration: 800, easing: 'ease-out', fill: 'forwards' })
            .onfinish = () => s.remove();
        }
        lastScrollY = window.scrollY;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();

/* ── SPONGE MASCOT INTERACTIVE ────────────────────────────────── */
(function initSponge() {
  const spongeBody = document.querySelector('.sponge-body');
  if (!spongeBody) return;

  spongeBody.addEventListener('click', () => {
    spongeBody.style.animation = 'none';
    spongeBody.style.transform = 'scale(1.2)';
    spongeBody.style.transition = 'transform 0.1s';

    // Burst bubbles
    for (let i = 0; i < 12; i++) {
      const b = document.createElement('div');
      const size = 6 + Math.random() * 16;
      const angle = (i / 12) * Math.PI * 2;
      const dist = 40 + Math.random() * 60;
      b.style.cssText = `
        position: absolute; width: ${size}px; height: ${size}px;
        border-radius: 50%; pointer-events: none;
        border: 1.5px solid rgba(0,229,255,0.7);
        background: rgba(0,229,255,0.1);
        left: 50%; top: 50%;
        transform: translate(-50%,-50%);
        z-index: 100;
      `;
      spongeBody.appendChild(b);
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      b.animate([
        { transform: `translate(-50%,-50%) scale(1)`, opacity: 0.8 },
        { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1.5)`, opacity: 0 }
      ], { duration: 600, easing: 'ease-out', fill: 'forwards' })
        .onfinish = () => b.remove();
    }

    setTimeout(() => {
      spongeBody.style.transform = '';
      spongeBody.style.animation = '';
    }, 200);
  });
})();

/* ── PAGE LOAD ANIMATION ──────────────────────────────────────── */
(function initPageLoad() {
  /* ---- inject keyframes ---- */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes loaderLogoIn {
      0%   { transform: scale(0.55) translateY(30px); opacity: 0; }
      65%  { transform: scale(1.05) translateY(-5px); opacity: 1; }
      100% { transform: scale(1)   translateY(0);     opacity: 1; }
    }
    @keyframes loaderGlowPulse {
      0%, 100% { filter: drop-shadow(0 0 22px rgba(255,215,0,0.45)) drop-shadow(0 0 55px rgba(0,71,171,0.35)); }
      50%       { filter: drop-shadow(0 0 38px rgba(255,215,0,0.8))  drop-shadow(0 0 80px rgba(0,71,171,0.5));  }
    }
    @keyframes loaderRippleOut {
      0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.75; }
      100% { transform: translate(-50%,-50%) scale(5); opacity: 0; }
    }
    @keyframes loaderBarShine {
      0%   { background-position: -200% center; }
      100% { background-position:  200% center; }
    }
    @keyframes loaderTagIn {
      0%   { opacity: 0; transform: translateY(8px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes loaderWipeLeft  { 0% { transform: translateX(0); } 100% { transform: translateX(-102%); } }
    @keyframes loaderWipeRight { 0% { transform: translateX(0); } 100% { transform: translateX( 102%); } }
  `;
  document.head.appendChild(style);

  /* ---- wrapper ---- */
  const loader = document.createElement('div');
  loader.id = 'siteLoader';
  loader.style.cssText = `
    position:fixed; inset:0; z-index:99999;
    background: radial-gradient(ellipse 90% 70% at 50% 60%, #0D2050 0%, #080C1A 65%);
    display:flex; align-items:center; justify-content:center; flex-direction:column;
    overflow:hidden; font-family:'Space Grotesk',sans-serif;
  `;

  /* ---- bubble canvas ---- */
  const bCanvas = document.createElement('canvas');
  bCanvas.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:0;`;
  loader.appendChild(bCanvas);
  bCanvas.width  = window.innerWidth;
  bCanvas.height = window.innerHeight;

  const bCtx = bCanvas.getContext('2d');

  /* 60 bubbles: mix of clear/soapy, gold-tinted, blue-tinted */
  const bubbles = Array.from({ length: 60 }, (_, i) => ({
    x:           Math.random() * bCanvas.width,
    y:           bCanvas.height + Math.random() * bCanvas.height * 0.6,
    r:           3 + Math.random() * 24,
    speed:       0.4 + Math.random() * 1.9,
    wobble:      Math.random() * Math.PI * 2,
    wobbleSpeed: 0.012 + Math.random() * 0.04,
    wobbleAmp:   6 + Math.random() * 18,
    alpha:       0.10 + Math.random() * 0.28,
    type:        i < 22 ? 0 : i < 44 ? 1 : 2,   /* 0=clear, 1=blue, 2=gold */
  }));

  let bubbleRAF;
  function drawBubbles() {
    bCtx.clearRect(0, 0, bCanvas.width, bCanvas.height);
    bubbles.forEach(b => {
      b.y     -= b.speed;
      b.wobble += b.wobbleSpeed;
      const x = b.x + Math.sin(b.wobble) * b.wobbleAmp;
      if (b.y + b.r < 0) { b.y = bCanvas.height + b.r; b.x = Math.random() * bCanvas.width; }

      /* body gradient */
      const g = bCtx.createRadialGradient(x - b.r*0.35, b.y - b.r*0.35, b.r*0.05, x, b.y, b.r);
      if (b.type === 2) {          /* gold */
        g.addColorStop(0,   `rgba(255,255,255,${b.alpha * 1.6})`);
        g.addColorStop(0.4, `rgba(255,215,0,${b.alpha * 0.9})`);
        g.addColorStop(1,   `rgba(160,100,0,${b.alpha * 0.2})`);
      } else if (b.type === 1) {   /* blue */
        g.addColorStop(0,   `rgba(255,255,255,${b.alpha * 1.6})`);
        g.addColorStop(0.4, `rgba(96,165,250,${b.alpha})`);
        g.addColorStop(1,   `rgba(0,71,171,${b.alpha * 0.3})`);
      } else {                     /* clear/soapy */
        g.addColorStop(0,   `rgba(255,255,255,${b.alpha * 1.9})`);
        g.addColorStop(0.5, `rgba(210,230,255,${b.alpha * 0.5})`);
        g.addColorStop(1,   `rgba(80,120,200,${b.alpha * 0.1})`);
      }
      bCtx.beginPath();
      bCtx.arc(x, b.y, b.r, 0, Math.PI * 2);
      bCtx.fillStyle = g;
      bCtx.fill();

      /* rim */
      bCtx.beginPath();
      bCtx.arc(x, b.y, b.r, 0, Math.PI * 2);
      bCtx.strokeStyle = `rgba(255,255,255,${b.alpha * 0.65})`;
      bCtx.lineWidth = 0.7;
      bCtx.stroke();

      /* specular shine dot */
      if (b.r > 7) {
        bCtx.beginPath();
        bCtx.arc(x - b.r*0.32, b.y - b.r*0.32, b.r * 0.22, 0, Math.PI * 2);
        bCtx.fillStyle = `rgba(255,255,255,${b.alpha * 1.1})`;
        bCtx.fill();
      }
    });
    bubbleRAF = requestAnimationFrame(drawBubbles);
  }
  drawBubbles();

  /* ---- three staggered ripple rings ---- */
  [0, 700, 1400].forEach((delay, i) => {
    const ring = document.createElement('div');
    const size = 180 + i * 90;
    ring.style.cssText = `
      position:absolute; left:50%; top:50%;
      width:${size}px; height:${size}px; border-radius:50%;
      border:1.5px solid rgba(255,215,0,${0.5 - i*0.12});
      transform:translate(-50%,-50%) scale(0); pointer-events:none; z-index:1;
      animation: loaderRippleOut 2.8s ease-out ${delay}ms infinite;
    `;
    loader.appendChild(ring);
  });

  /* ---- center content ---- */
  const center = document.createElement('div');
  center.style.cssText = `
    position:relative; z-index:2;
    display:flex; flex-direction:column; align-items:center; gap:2.2rem;
  `;

  /* PNG logo */
  const logoImg = document.createElement('img');
  logoImg.src = 'Untitled-3.png';
  logoImg.alt = '808 All Purpose Cleaners';
  logoImg.style.cssText = `
    width: clamp(290px, 52vw, 540px);
    height: auto; display:block;
    animation: loaderLogoIn 1.05s cubic-bezier(0.34,1.56,0.64,1) 0.25s both,
               loaderGlowPulse 2.2s ease-in-out 1.3s infinite;
  `;

  /* tagline beneath logo */
  const tag = document.createElement('div');
  tag.style.cssText = `
    font-size: clamp(0.65rem, 1.8vw, 0.9rem);
    font-weight: 600; letter-spacing: 0.3em; text-transform: uppercase;
    color: rgba(255,215,0,0.75);
    animation: loaderTagIn 0.5s ease-out 1.2s both;
  `;
  tag.textContent = '\u2605  Hawaii\'s Trusted Cleaning Crew  \u2605';

  /* slim progress bar */
  const barWrap = document.createElement('div');
  barWrap.style.cssText = `
    width: clamp(220px, 40vw, 400px); height: 3px;
    background: rgba(255,255,255,0.07); border-radius: 3px; overflow:hidden;
  `;
  const barFill = document.createElement('div');
  barFill.style.cssText = `
    height:100%; width:0%;
    background: linear-gradient(90deg, #001f5b, #0047AB, #FFD700, #FFA500, #FFD700, #0047AB, #001f5b);
    background-size: 250% 100%; border-radius:3px;
    transition: width 1.85s cubic-bezier(0.4,0,0.2,1);
    animation: loaderBarShine 2s linear 0.4s infinite;
  `;
  barWrap.appendChild(barFill);

  center.appendChild(logoImg);
  center.appendChild(tag);
  center.appendChild(barWrap);
  loader.appendChild(center);
  document.body.appendChild(loader);

  /* fill bar on next frame */
  requestAnimationFrame(() => { barFill.style.width = '100%'; });

  /* ---- squeegee wipe exit ---- */
  setTimeout(() => {
    cancelAnimationFrame(bubbleRAF);
    const panelL = document.createElement('div');
    const panelR = document.createElement('div');
    [panelL, panelR].forEach(p => {
      p.style.cssText = `
        position:absolute; top:0; bottom:0; width:51%;
        background: radial-gradient(ellipse 90% 70% at 50% 60%, #0D2050 0%, #080C1A 65%);
      `;
    });
    panelL.style.left  = '0';
    panelR.style.right = '0';
    loader.appendChild(panelL);
    loader.appendChild(panelR);

    setTimeout(() => {
      center.style.transition = 'opacity 0.15s';
      center.style.opacity    = '0';
      panelL.style.animation  = 'loaderWipeLeft  0.7s cubic-bezier(0.76,0,0.24,1) forwards';
      panelR.style.animation  = 'loaderWipeRight 0.7s cubic-bezier(0.76,0,0.24,1) forwards';
      setTimeout(() => loader.remove(), 730);
    }, 60);
  }, 2500);
})();

/* ── DYNAMIC SPARKLE FIELD ON HERO HOVER ─────────────────────── */
(function initHeroSparkles() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  hero.addEventListener('mousemove', throttle((e) => {
    if (Math.random() > 0.4) return;
    const sparkle = document.createElement('div');
    const size = 4 + Math.random() * 8;
    sparkle.style.cssText = `
      position: absolute; width: ${size}px; height: ${size}px;
      border-radius: 50%; pointer-events: none; z-index: 20;
      left: ${e.clientX}px; top: ${e.clientY + window.scrollY}px;
      transform: translate(-50%,-50%);
      background: ${Math.random() > 0.5 ? 'rgba(255,215,0,0.9)' : 'rgba(0,229,255,0.9)'};
      box-shadow: 0 0 8px currentColor;
    `;
    hero.appendChild(sparkle);

    sparkle.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(-50%,calc(-50% - ${20 + Math.random()*30}px)) scale(0)`, opacity: 0 }
    ], { duration: 500 + Math.random() * 300, easing: 'ease-out', fill: 'forwards' })
      .onfinish = () => sparkle.remove();
  }, 30));

  function throttle(fn, ms) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= ms) { last = now; fn(...args); }
    };
  }
})();

console.log('%c808 All Purpose Cleaners 🧽✨', 'color: #FFD700; font-size: 20px; font-weight: bold; font-family: serif;');
console.log('%cWe Clean It All!! | 808-723-1011', 'color: #00E5FF; font-size: 12px;');
