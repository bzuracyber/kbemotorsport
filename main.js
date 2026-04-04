/* ============================================================
   KBE MOTORSPORT — MAIN JS
   Nav · Hamburger · Smooth scroll · Lightbox · Reveal · Form
   ============================================================ */

(function () {
  'use strict';

  /* ── NAV SCROLL ──────────────────────────────────────────── */
  const nav = document.getElementById('nav');

  function updateNav() {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }

  let scrollTick = false;
  window.addEventListener('scroll', function () {
    if (!scrollTick) {
      requestAnimationFrame(function () { updateNav(); scrollTick = false; });
      scrollTick = true;
    }
  }, { passive: true });
  updateNav();

  /* ── HAMBURGER / DRAWER ──────────────────────────────────── */
  const hamburger  = document.getElementById('hamburger');
  const navDrawer  = document.getElementById('navDrawer');
  const drawerLinks = navDrawer.querySelectorAll('.nav__drawer-link');

  function openMenu() {
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    navDrawer.classList.add('open');
    navDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navDrawer.classList.remove('open');
    navDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    hamburger.classList.contains('open') ? closeMenu() : openMenu();
  });
  drawerLinks.forEach(function (l) { l.addEventListener('click', closeMenu); });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ── SMOOTH SCROLL (offset by nav height) ────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - nav.offsetHeight;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ── GALLERY LIGHTBOX ────────────────────────────────────── */
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const lightboxCap   = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev  = document.getElementById('lightboxPrev');
  const lightboxNext  = document.getElementById('lightboxNext');
  const galleryItems  = Array.from(document.querySelectorAll('.grid-item'));

  let currentIndex = 0;

  function setLightboxItem(index, animate) {
    const item = galleryItems[index];
    if (animate) {
      lightboxImg.style.opacity = '0';
      setTimeout(function () {
        lightboxImg.src         = item.dataset.src;
        lightboxImg.alt         = item.querySelector('img').alt;
        lightboxCap.textContent = item.dataset.caption || '';
        lightboxImg.style.opacity = '1';
      }, 170);
    } else {
      lightboxImg.src         = item.dataset.src;
      lightboxImg.alt         = item.querySelector('img').alt;
      lightboxCap.textContent = item.dataset.caption || '';
    }
  }

  function openLightbox(index) {
    currentIndex = index;
    setLightboxItem(index, false);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    galleryItems[currentIndex].focus();
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    setLightboxItem(currentIndex, true);
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % galleryItems.length;
    setLightboxItem(currentIndex, true);
  }

  galleryItems.forEach(function (item, i) {
    item.addEventListener('click', function () { openLightbox(i); });
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', showPrev);
  lightboxNext.addEventListener('click', showNext);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Touch swipe
  var touchStartX = 0;
  lightbox.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    var d = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(d) > 50) { d > 0 ? showNext() : showPrev(); }
  }, { passive: true });

  /* ── SCROLL REVEAL ───────────────────────────────────────── */
  // Per-container stagger caps: grid items animate faster, more tightly
  const STAGGER_FAST = 45;   // gallery grid
  const STAGGER_SLOW = 80;   // service / review cards
  const CAP_FAST     = 240;
  const CAP_SLOW     = 320;

  function getStaggerConfig(el) {
    if (el.classList.contains('grid-item'))    return [STAGGER_FAST, CAP_FAST];
    if (el.classList.contains('service-card')) return [STAGGER_SLOW, CAP_SLOW];
    if (el.classList.contains('review-card'))  return [STAGGER_SLOW, CAP_SLOW];
    return [60, 180]; // single elements — minimal stagger
  }

  const revealEls = document.querySelectorAll([
    '.service-card',
    '.review-card',
    '.section__header',
    '.featured__image',
    '.featured__content',
    '.grid-item',
    '.contact__info',
    '.contact__form-wrap',
    '.footer__inner'
  ].join(', '));

  revealEls.forEach(function (el) { el.classList.add('reveal'); });

  const revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;

      const el      = entry.target;
      const cfg     = getStaggerConfig(el);
      const stagger = cfg[0];
      const cap     = cfg[1];

      // Count siblings of same type that haven't revealed yet
      const parent   = el.parentElement;
      const pending  = Array.from(parent.querySelectorAll('.reveal:not(.visible)'));
      const idx      = pending.indexOf(el);
      const delay    = Math.min(idx * stagger, cap);

      setTimeout(function () { el.classList.add('visible'); }, delay);
      revealObs.unobserve(el);
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -36px 0px' });

  revealEls.forEach(function (el) { revealObs.observe(el); });

  /* ── NAV SCROLLSPY ───────────────────────────────────────── */
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navLinks = Array.from(document.querySelectorAll('.nav__link'));

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      const active = link.getAttribute('href') === '#' + id;
      link.classList.toggle('nav__link--active', active);
    });
  }

  // Use scroll position directly for reliability (avoids threshold edge cases)
  function updateScrollspy() {
    const scrollMid = window.scrollY + window.innerHeight * 0.4;
    let active = sections[0];
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollMid) active = section;
    });
    if (active) setActiveLink(active.id);
  }

  window.addEventListener('scroll', function () {
    if (!scrollTick) {
      requestAnimationFrame(function () { updateScrollspy(); scrollTick = false; });
    }
  }, { passive: true });
  updateScrollspy();

  /* ── HERO PARALLAX ───────────────────────────────────────── */
  const heroVideo = document.querySelector('.hero-video');
  const heroEl    = document.querySelector('.hero');

  if (heroVideo && heroEl && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
    let pTick = false;
    window.addEventListener('scroll', function () {
      if (!pTick) {
        requestAnimationFrame(function () {
          if (window.scrollY < heroEl.offsetHeight) {
            heroVideo.style.transform = 'translateY(' + (window.scrollY * 0.18) + 'px)';
          }
          pTick = false;
        });
        pTick = true;
      }
    }, { passive: true });
  }

  /* ── CONTACT FORM ────────────────────────────────────────── */
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    const requiredFields = [
      { id: 'field-name',    msg: 'Full name is required.' },
      { id: 'field-phone',   msg: 'Phone number is required.' },
      { id: 'field-email',   msg: 'A valid email address is required.' },
      { id: 'field-vehicle', msg: 'Vehicle year, make, and model are required.' },
      { id: 'field-service', msg: 'Please select a service.' }
    ];

    function getErrorEl(el) {
      return el.closest('.form__group').querySelector('.form__error');
    }

    function setError(el, msg) {
      el.classList.add('form__input--error');
      var errEl = getErrorEl(el);
      if (errEl) errEl.textContent = msg;
    }

    function clearError(el) {
      el.classList.remove('form__input--error');
      var errEl = getErrorEl(el);
      if (errEl) errEl.textContent = '';
    }

    function validateField(el) {
      var val = el.value.trim();
      if (!val) {
        var cfg = requiredFields.find(function (f) { return f.id === el.id; });
        setError(el, cfg ? cfg.msg : 'This field is required.');
        return false;
      }
      if (el.id === 'field-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        setError(el, 'A valid email address is required.');
        return false;
      }
      clearError(el);
      return true;
    }

    requiredFields.forEach(function (cfg) {
      var el = document.getElementById(cfg.id);
      if (!el) return;
      el.addEventListener('blur', function () { validateField(el); });
      el.addEventListener('input', function () {
        if (el.classList.contains('form__input--error')) validateField(el);
      });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      requiredFields.forEach(function (cfg) {
        var el = document.getElementById(cfg.id);
        if (el && !validateField(el)) valid = false;
      });
      if (!valid) {
        var first = contactForm.querySelector('.form__input--error');
        if (first) first.focus();
        return;
      }

      var btn = contactForm.querySelector('.form__submit');
      btn.disabled = true;
      btn.innerHTML = 'Sending&hellip;';

      setTimeout(function () {
        contactForm.style.display = 'none';
        formSuccess.setAttribute('aria-hidden', 'false');
        formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 800);
    });
  }

})();
