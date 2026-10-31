// Smooth scrolling (Lenis) and scroll-driven motion (GSAP). The page still works if these fail to load.
(() => {
  'use strict';
  if (!window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);

  if (window.Lenis) {
    const lenis = new Lenis({ lerp: .09, wheelMultiplier: .9 });
    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    // in-page links glide instead of jumping
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href') === '#' || a.getAttribute('href') === '#next') return;
      const el = document.querySelector(a.getAttribute('href')); if (!el) return;
      e.preventDefault(); lenis.scrollTo(el, { duration: 1.6 });
    });
  }

  const run = () => {
    const stage = document.querySelector('.stage');

    // page-over: the dates sheet slides up over the pinned map, which sinks back and dims
    gsap.to(stage, {
      scale: .9, filter: document.documentElement.classList.contains('lite') ? 'brightness(.35)' : 'brightness(.35) blur(2px)', borderRadius: 28, ease: 'none',
      scrollTrigger: { trigger: '.dates', start: 'top bottom', end: 'top top', scrub: true }
    });
    // same move for the stream sheet over the shop
    ScrollTrigger.create({ trigger: '.shop', start: () => document.querySelector('.shop').offsetHeight > innerHeight ? 'bottom bottom' : 'top top', end: '+=100%', pin: true, pinSpacing: false });
    gsap.to('.shop > *', {
      scale: .94, opacity: .25, ease: 'none', transformOrigin: '50% 0%',
      scrollTrigger: { trigger: '.stream', start: 'top bottom', end: 'top top', scrub: true }
    });

    // headings rise line by line out of a mask
    document.querySelectorAll('.sec-head h2').forEach(h => {
      let lines = [h];
      if (window.SplitText) { const s = SplitText.create(h, { type: 'lines', mask: 'lines' }); lines = s.lines; }
      gsap.from(lines, { yPercent: 110, duration: 1, stagger: .1, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
    });
    gsap.utils.toArray('.kicker, .sec-head .sub, .stream .sub, .stream .btn').forEach(el =>
      gsap.from(el, { y: 20, opacity: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));

    // city cards deal in, then their pieces settle
    gsap.from('.stop', { y: 80, opacity: 0, rotate: i => [-3, 0, 3][i % 3], duration: 1, stagger: .14, ease: 'power3.out', scrollTrigger: { trigger: '.stops', start: 'top 80%' } });
    gsap.utils.toArray('.stop').forEach(card => {
      gsap.from(card.querySelectorAll('.card-code, .card-place, .tag, .times, .count > div, .btn, .drop-row'), {
        y: 16, opacity: 0, duration: .6, stagger: .04, ease: 'power2.out', scrollTrigger: { trigger: card, start: 'top 75%' }
      });
      // tee swings in
      gsap.from(card.querySelector('.drop .spin'), { rotationY: -540, scale: .7, opacity: 0, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 65%' } });
    });

    // shop shelf: items pop up one by one, gentle float on scroll
    gsap.from('.item', { y: 60, opacity: 0, scale: .94, duration: .9, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.shelf', start: 'top 85%' } });
    gsap.utils.toArray('.item .flip').forEach((s, i) => gsap.to(s, { y: i % 2 ? -18 : 18, ease: 'none', scrollTrigger: { trigger: '.shelf', start: 'top bottom', end: 'bottom top', scrub: true } }));
    // each piece turns around to show its back, then settles on the front
    gsap.from('.item .spin', { rotationY: -540, duration: 1.6, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '.shelf', start: 'top 85%' } });
    gsap.from('#shopAll', { y: 20, opacity: 0, duration: .8, scrollTrigger: { trigger: '#shopAll', start: 'top 92%' } });

    // handwritten line writes itself in
    gsap.fromTo('.hand', { clipPath: 'inset(0 0 100% 0)', y: 40, rotate: -3 }, { clipPath: 'inset(0 0 0% 0)', y: 0, rotate: 0, duration: 1.4, ease: 'power2.inOut', scrollTrigger: { trigger: '.stream', start: 'top 70%' } });

    // footer
    gsap.from('.foot > *', { y: 12, opacity: 0, stagger: .1, duration: .6, scrollTrigger: { trigger: '.foot', start: 'top 98%' } });

    ScrollTrigger.refresh();
  };
  if (document.fonts) document.fonts.ready.then(() => requestAnimationFrame(run)); else addEventListener('load', run);
})();
