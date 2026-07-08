(function () {
  const app = document.getElementById('h5');
  const pages = Array.from(document.querySelectorAll('.page'));
  const bgm = document.getElementById('bgm');
  const startBtn = document.getElementById('startBtn');
  const musicBtn = document.getElementById('musicBtn');
  const dots = document.getElementById('progressDots');

  const setVh = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  setVh();
  window.addEventListener('resize', setVh, { passive: true });

  pages.forEach((_, index) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.addEventListener('click', () => pages[index].scrollIntoView({ behavior: 'smooth' }));
    dots.appendChild(b);
  });
  const dotButtons = Array.from(dots.children);

  let activeIndex = 0;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const page = entry.target;
      activeIndex = pages.indexOf(page);
      pages.forEach((p, i) => p.classList.toggle('active', i === activeIndex));
      dotButtons.forEach((d, i) => d.classList.toggle('active', i === activeIndex));
    });
  }, { root: app, threshold: 0.56 });
  pages.forEach(p => observer.observe(p));
  dotButtons[0].classList.add('active');

  async function playMusic() {
    try {
      await bgm.play();
      musicBtn.classList.add('playing');
      musicBtn.textContent = '♫';
    } catch (e) {
      musicBtn.classList.remove('playing');
      musicBtn.textContent = '♪';
    }
  }
  function pauseMusic() {
    bgm.pause();
    musicBtn.classList.remove('playing');
    musicBtn.textContent = '♪';
  }
  startBtn.addEventListener('click', () => {
    playMusic();
    pages[1].scrollIntoView({ behavior: 'smooth' });
  });
  musicBtn.addEventListener('click', () => bgm.paused ? playMusic() : pauseMusic());
  document.addEventListener('WeixinJSBridgeReady', () => playMusic(), false);


  document.querySelectorAll('.slide img, .photo-grid img').forEach((img) => {
    const figure = img.closest('figure');
    if (!figure) return;
    const src = img.getAttribute('src');
    if (src) figure.style.setProperty('--bg', `url("${src}")`);
  });

  document.querySelectorAll('[data-carousel]').forEach((carousel, carouselIndex) => {
    const slides = Array.from(carousel.querySelectorAll('.slide'));
    if (slides.length <= 1) return;
    let i = 0;
    const interval = 3600 + carouselIndex * 450;
    setInterval(() => {
      i = (i + 1) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('active', n === i));
    }, interval);
  });

  const canvas = document.getElementById('sparkCanvas');
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, particles = [];
  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const count = Math.max(42, Math.floor(w * h / 16000));
    particles = Array.from({ length: count }, () => makeParticle(true));
  }
  function makeParticle(randomY) {
    return {
      x: Math.random() * w,
      y: randomY ? Math.random() * h : h + 20,
      r: Math.random() * 1.8 + .55,
      vx: (Math.random() - .5) * .22,
      vy: -(Math.random() * .48 + .18),
      a: Math.random() * .58 + .18,
      tw: Math.random() * Math.PI * 2,
      hue: Math.random() > .82 ? 42 : 50
    };
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.tw += .035;
      if (p.y < -18 || p.x < -18 || p.x > w + 18) particles[idx] = makeParticle(false);
      const alpha = p.a * (.62 + Math.sin(p.tw) * .38);
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 7);
      grd.addColorStop(0, `hsla(${p.hue}, 100%, 82%, ${alpha})`);
      grd.addColorStop(.38, `hsla(${p.hue}, 100%, 65%, ${alpha * .45})`);
      grd.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`);
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 7, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });
  draw();
})();
