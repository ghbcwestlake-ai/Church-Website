/* ==========================================================================
   GOOD HOPE BAPTIST CHURCH — SCRIPTS
   - Sticky header scroll-state
   - Mobile nav (hamburger) toggle, with close-on-link / Escape / resize
   - Footer copyright year auto-fill
   ========================================================================== */

(() => {
  // ---- Sticky header: add .scrolled class when page has been scrolled
  const header = document.getElementById('site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Mobile navigation toggle
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
    const isOpen = nav?.classList.contains('open');
    if (isOpen) closeNav();
    else openNav();
  });

  // Close the nav when a link is tapped (mobile UX)
  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });

  // Escape key closes the nav
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNav();
  });

  // If user resizes up to desktop while nav is open, close it
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 960) closeNav();
  });

  // ---- Footer: stamp current year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
