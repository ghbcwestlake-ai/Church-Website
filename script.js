/* ==========================================================================
   GOOD HOPE BAPTIST CHURCH — SCRIPTS
   - Mobile nav (hamburger) toggle, with close-on-link / Escape / resize
   - Sticky header scroll-state
   - Scroll-spy: highlight the section currently in view in the nav
   - Back-to-top button (injected)
   - Reveal-on-scroll animations (skipped when prefers-reduced-motion)
   - Footer copyright year auto-fill
   ========================================================================== */

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.getElementById('site-header');
  const headerHeight = () => (header ? header.offsetHeight : 72);

  /* ---- Mobile navigation toggle ------------------------------------------ */
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');

  const closeNav = () => {
    nav?.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
  };
  const openNav = () => {
    nav?.classList.add('open');
    toggle?.setAttribute('aria-expanded', 'true');
  };

  toggle?.addEventListener('click', () => {
    if (nav?.classList.contains('open')) closeNav();
    else openNav();
  });

  // Close the nav when a link is tapped (mobile UX)
  nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeNav));

  // Escape key closes the nav
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });

  // If the user resizes up to desktop while the nav is open, close it
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 960) closeNav();
  });

  /* ---- Scroll-spy: which section are we looking at? ----------------------- */
  const navLinks = Array.from(document.querySelectorAll('.primary-nav a[href^="#"]'));
  // One entry per real section (skip the duplicate "Plan Your Visit" CTA link)
  const spySections = navLinks
    .filter((link) => !link.classList.contains('nav-cta'))
    .map((link) => {
      const target = document.querySelector(link.getAttribute('href'));
      return target ? { link, target } : null;
    })
    .filter(Boolean);

  const setActiveLink = (active) => {
    navLinks.forEach((link) => {
      if (link === active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const updateSpy = () => {
    const triggerLine = headerHeight() + 48;
    let current = null;
    for (const section of spySections) {
      if (section.target.getBoundingClientRect().top <= triggerLine) current = section;
    }
    setActiveLink(current ? current.link : null);
  };

  /* ---- Back-to-top button (injected; pure JS enhancement) ---------------- */
  const toTop = document.createElement('button');
  toTop.type = 'button';
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(toTop);
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  const updateToTop = () => {
    toTop.classList.toggle('is-visible', window.scrollY > 640);
  };

  /* ---- One scroll listener: header shadow + scroll-spy + back-to-top ----- */
  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
    updateSpy();
    updateToTop();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateSpy);
  onScroll();

  /* ---- Reveal-on-scroll -------------------------------------------------- */
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealEls = document.querySelectorAll(
      '.welcome-copy, .welcome-figure, .heritage-content, ' +
      '.timeline-item, .belief-list li, .ministry-card, ' +
      '.connect-card, .faq-item, .pastor-figure, .pastor-copy, ' +
      '.visit-info, .visit-map, ' +
      // Sub-page reveals
      '.page-hero-content, .story-entry, .schedule-card, .shepherds-grid li, ' +
      '.invitation-content, .visit-cta-card'
    );

    // Stagger siblings that sit in the same grid or list
    document
      .querySelectorAll(
        '.service-card, .ministry-card, .belief-list li, .connect-card, ' +
        '.timeline-item, .faq-item, .schedule-card, .story-entry, .shepherds-grid li'
      )
      .forEach((el) => {
        const index = Array.prototype.indexOf.call(el.parentElement.children, el);
        el.style.setProperty('--reveal-delay', `${Math.min(index, 5) * 80}ms`);
      });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );

    revealEls.forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  /* ---- Footer: stamp current year ---------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
