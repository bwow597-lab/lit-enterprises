/* LIT Enterprises — shared interactions */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Header scroll state ---- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 24) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Mobile menu ---- */
  var menuBtn = document.querySelector('.menu-btn');
  var mobileMenu = document.querySelector('.mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mobileMenu.classList.remove('open'); });
    });
  }

  /* ---- Reveal on scroll ---- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce) {
    reveals.forEach(function (r) { r.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { io.observe(r); });
  }

  /* ---- Subtle spark canvas (hero) ---- */
  var canvas = document.getElementById('sparks');
  if (canvas) {
    var ctx = canvas.getContext('2d');
    var w, h, dpr, particles = [], raf;
    var COLORS = ['#C9A86A', '#B08D57', '#C2683E'];
    var MAX = 46;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function mk() {
      return {
        x: Math.random() * w, y: h + Math.random() * h * 0.4,
        r: Math.random() * 1.8 + 0.5,
        vy: -(Math.random() * 0.4 + 0.12),
        vx: (Math.random() - 0.5) * 0.18,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        tw: Math.random() * Math.PI * 2, tws: Math.random() * 0.025 + 0.008,
        base: Math.random() * 0.4 + 0.25
      };
    }
    function init() {
      particles = [];
      var count = Math.min(MAX, Math.round(w / 26));
      for (var i = 0; i < count; i++) { var p = mk(); p.y = Math.random() * h; particles.push(p); }
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y += p.vy; p.x += p.vx; p.tw += p.tws;
        if (p.y < -10) { Object.assign(p, mk()); p.y = h + 10; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        var alpha = p.base + Math.sin(p.tw) * 0.28;
        ctx.beginPath();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.shadowBlur = 10; ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    }
    function start() {
      resize(); init();
      if (reduce) {
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < particles.length; i++) {
          var p = particles[i];
          ctx.beginPath(); ctx.globalAlpha = p.base; ctx.shadowBlur = 8; ctx.shadowColor = p.color;
          ctx.fillStyle = p.color; ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      } else { cancelAnimationFrame(raf); draw(); }
    }
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(start, 180); }, { passive: true });
    start();
    document.addEventListener('visibilitychange', function () {
      if (reduce) return;
      if (document.hidden) cancelAnimationFrame(raf);
      else { cancelAnimationFrame(raf); draw(); }
    });
  }

  /* ---- Gallery filter ---- */
  var chips = document.querySelectorAll('.chip[data-filter]');
  var figures = document.querySelectorAll('.gallery figure[data-cat]');
  if (chips.length && figures.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('active'); });
        chip.classList.add('active');
        var f = chip.getAttribute('data-filter');
        figures.forEach(function (fig) {
          var show = f === 'all' || fig.getAttribute('data-cat') === f;
          fig.style.display = show ? '' : 'none';
        });
      });
    });
  }

  /* ---- Lightbox ---- */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    var lbCap = lightbox.querySelector('.lb-cap');
    var lbClose = lightbox.querySelector('.lb-close');
    function open(src, cap) {
      lbImg.src = src; lbCap.textContent = cap || '';
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() { lightbox.classList.remove('open'); document.body.style.overflow = ''; }
    document.querySelectorAll('.gallery figure').forEach(function (fig) {
      fig.addEventListener('click', function () {
        var img = fig.querySelector('img');
        var cap = fig.querySelector('figcaption');
        open(img.getAttribute('data-full') || img.src, cap ? cap.textContent : '');
      });
    });
    lbClose && lbClose.addEventListener('click', close);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* ---- Footer year ---- */
  var yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
