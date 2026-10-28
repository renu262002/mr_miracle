(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. HERO LION: tilts toward the cursor, click to replay the intro -- */
  const hero = $('.hero');
  const lion = $('.miracle-character');
  const body = $('.miracle-body');

  if (hero && lion && body) {
    if (!reduce) {
      hero.addEventListener('pointermove', (e) => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 .. 0.5
        body.style.setProperty('--tilt', (x * 6).toFixed(2) + 'deg');
        body.style.setProperty('--shift', (x * 10).toFixed(1) + 'px');
      });
      hero.addEventListener('pointerleave', () => {
        body.style.setProperty('--tilt', '0deg');
        body.style.setProperty('--shift', '0px');
      });
    }

    lion.title = 'Click me!';
    lion.addEventListener('click', () => {
      // restart the whole intro: lion, orb, then text
      [lion, $('.miracle-magic'), $('.miracle-message'), $('.miracle-ring')]
        .filter(Boolean)
        .forEach((el) => {
          el.style.animation = 'none';
          void el.offsetWidth; // force reflow
          el.style.animation = '';
        });
      lion.classList.remove('is-roaring');
      void lion.offsetWidth;
      lion.classList.add('is-roaring');
      setTimeout(() => lion.classList.remove('is-roaring'), 800);
    });
  }

  /* 2. GUIDE LION: speech bubble changes with each section ----------- */
  const guide = $('#guide');
  const bubble = $('#guide-text');
  const sections = $$('[data-say]');
  let current = null;
  let timer;

  const say = (section) => {
    if (!guide || !bubble || current === section.id) return;
    current = section.id;

    // hidden while the big hero lion is on screen
    guide.classList.toggle('is-visible', section.id !== 'home');

    bubble.classList.remove('is-in');
    clearTimeout(timer);
    timer = setTimeout(() => {
      bubble.textContent = section.dataset.say;
      bubble.classList.add('is-in');
      guide.classList.remove('is-talking');
      void guide.offsetWidth;
      guide.classList.add('is-talking');
    }, 180);
  };

  if (guide && sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && say(e.target)),
      { rootMargin: '-45% 0px -45% 0px' } // the section crossing mid-screen
    );
    sections.forEach((s) => io.observe(s));
  }

  // scroll progress fills the ring around the guide
  let ticking = false;
  const progress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? (scrollY / max) * 100 : 0;
    guide && guide.style.setProperty('--p', p.toFixed(1));
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(progress);
    }
  }, { passive: true });
  progress();

  // clicking the guide: jump to contact, or open the email when already there
  $('.guide-avatar') && $('.guide-avatar').addEventListener('click', () => {
    if (current === 'contact') {
      const cta = $('.btn-light');
      cta && cta.click();
    } else {
      $('#contact').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    }
  });

  /* 3. SCROLL REVEALS ------------------------------------------------ */
  if (!reduce && 'IntersectionObserver' in window) {
    const items = $$(
      '.about-grid > div, .section-heading, .service-card, .why-grid > div, .benefit, .cta-inner'
    );
    items.forEach((el) => {
      const idx = [...el.parentElement.children].indexOf(el);
      el.style.setProperty('--d', Math.min(idx, 5) * 0.08 + 's');
      el.classList.add('reveal');
    });

    const ro = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add('is-in');
        ro.unobserve(el);
        // hand control back to the element's own hover styles
        setTimeout(() => el.classList.remove('reveal', 'is-in'), 1500);
      });
    }, { threshold: 0.12 });
    items.forEach((el) => ro.observe(el));
  }
})();