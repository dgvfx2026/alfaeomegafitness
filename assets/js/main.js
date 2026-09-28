/**
 * Alfa & Ômega Fitness Academia
 * Main JavaScript — Interactions, Carousel & Animations
 */

(function () {
  'use strict';

  // ===== DOM Elements =====
  const header    = document.getElementById('header');
  const nav       = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelectorAll('.nav__link');
  const revealEls = document.querySelectorAll('[data-reveal]');

  // ===== Header Scroll =====
  function handleHeaderScroll() {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }

  // ===== Mobile Menu =====
  function openMenu() {
    nav.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    nav.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    nav.classList.contains('active') ? closeMenu() : openMenu();
  }

  // ===== Smooth Scroll =====
  function smoothScroll(target) {
    const el = document.querySelector(target);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - header.offsetHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // ===== Active Nav Link =====
  function updateActiveNavLink() {
    const sections      = document.querySelectorAll('section[id]');
    const scrollPos     = window.scrollY + header.offsetHeight + 120;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  // ===== Scroll Reveal =====
  function setupReveal() {
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => observer.observe(el));
  }

  // ===== Stagger Reveal for Grid Items =====
  function staggerReveal() {
    const grids = document.querySelectorAll(
      '.benefits__grid, .plans__grid, .testimonials__grid, .stats__grid'
    );
    grids.forEach(grid => {
      grid.querySelectorAll('[data-reveal]').forEach((item, i) => {
        item.style.transitionDelay = `${i * 100}ms`;
      });
    });
  }

  // ===== Gallery Carousel =====
  function initGalleryCarousel() {
    const wrap   = document.querySelector('.structure__carousel-wrap');
    const track  = document.getElementById('structureTrack');
    const prevBtn = document.getElementById('structurePrev');
    const nextBtn = document.getElementById('structureNext');
    const dotsEl  = document.getElementById('structureDots');

    if (!track || !prevBtn || !nextBtn) return;

    const slides = Array.from(track.querySelectorAll('.structure__slide'));
    const total  = slides.length;
    let current  = 0;
    let autoTimer = null;
    let touchStartX = null;

    // ---- Build dots ----
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'structure__dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir para foto ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });

    function getDots() {
      return Array.from(dotsEl.querySelectorAll('.structure__dot'));
    }

    // ---- How many slides visible? ----
    function getPerView() {
      const w = window.innerWidth;
      if (w <= 640)  return 1;
      if (w <= 1024) return 2;
      return 3;
    }

    // ---- Slide width (including gap) ----
    function getSlideWidth() {
      const gap     = parseInt(getComputedStyle(track).gap) || 16;
      const perView = getPerView();
      return (wrap.offsetWidth - gap * (perView - 1)) / perView + gap;
    }

    // ---- Go to index ----
    function goTo(idx) {
      const perView = getPerView();
      const maxIdx  = total - perView;
      current = Math.max(0, Math.min(idx, maxIdx));
      track.style.transform = `translateX(-${current * getSlideWidth()}px)`;

      // Update dots
      getDots().forEach((d, i) => d.classList.toggle('active', i === current));

      // Update caption visibility on mobile
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === current);
      });

      // Button states
      prevBtn.style.opacity = current === 0     ? '0.4' : '1';
      nextBtn.style.opacity = current >= maxIdx ? '0.4' : '1';
    }

    // ---- Autoplay ----
    function startAuto() {
      autoTimer = setInterval(() => {
        const perView = getPerView();
        const maxIdx  = total - perView;
        goTo(current >= maxIdx ? 0 : current + 1);
      }, 4500);
    }

    function stopAuto() { clearInterval(autoTimer); }

    // ---- Button controls ----
    prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
    nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

    // ---- Touch / swipe ----
    track.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      stopAuto();
    }, { passive: true });

    track.addEventListener('touchend', e => {
      if (touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) > 44) {
        goTo(dx < 0 ? current + 1 : current - 1);
      }
      startAuto();
    }, { passive: true });

    // Pause autoplay on hover
    wrap.addEventListener('mouseenter', stopAuto);
    wrap.addEventListener('mouseleave', startAuto);

    // ---- Resize ----
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => goTo(current), 150);
    }, { passive: true });

    // ---- Init ----
    goTo(0);
    startAuto();
  }

  // ===== Initialize =====
  function init() {
    handleHeaderScroll();
    setupReveal();
    staggerReveal();
    initGalleryCarousel();

    // Scroll events
    window.addEventListener('scroll', () => {
      handleHeaderScroll();
      updateActiveNavLink();
    }, { passive: true });

    // Resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) closeMenu();
    }, { passive: true });

    // Hamburger
    if (hamburger) {
      hamburger.addEventListener('click', toggleMenu);
    }

    // Nav links — smooth scroll + close menu
    navLinks.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const target = link.getAttribute('href');
        closeMenu();
        setTimeout(() => smoothScroll(target), 80);
      });
    });

    // Footer nav links
    document.querySelectorAll('.footer__links a').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        smoothScroll(link.getAttribute('href'));
      });
    });

    // ESC closes menu
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && nav.classList.contains('active')) closeMenu();
    });

    // Click outside nav closes it
    document.addEventListener('click', e => {
      if (
        nav.classList.contains('active') &&
        !nav.contains(e.target) &&
        !hamburger.contains(e.target)
      ) closeMenu();
    });

    // Logo — scroll to top
    document.querySelectorAll('.logo').forEach(logo => {
      logo.addEventListener('click', e => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Smooth scroll for any in-page link not handled above
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      if (a.closest('.nav') || a.closest('.footer__links') || a.classList.contains('logo')) return;
      a.addEventListener('click', e => {
        const target = a.getAttribute('href');
        if (!target || target === '#') return;
        const el = document.querySelector(target);
        if (!el) return;
        e.preventDefault();
        smoothScroll(target);
      });
    });
  }

  // DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
