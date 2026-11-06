// Plan:
// 1. Mouse spotlight tracking (rAF-throttled).
// 2. Horizontal project reel: arrow navigation, drag-to-scroll, keyboard support.
// 3. Email clipboard copy with visual feedback toast.
// 4. Image fallbacks (logo + avatar) — replaces inline onerror.

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const spotlight = document.getElementById('spotlight');
    const copyBtn = document.getElementById('copy-email-btn');
    const toast = document.getElementById('toast');
    const year = document.getElementById('current-year');
    if (year) year.textContent = String(new Date().getFullYear());
    const track = document.getElementById('projects-track');
    const prevBtn = document.getElementById('scroll-prev');
    const nextBtn = document.getElementById('scroll-next');

    /* ---------- 1. Image fallbacks ---------- */
    const logoSrc = document.querySelector('.nav-logo');
    const logoFallback = document.getElementById('logo-fallback');
    if (logoSrc && logoFallback) {
      logoSrc.addEventListener('error', () => {
        logoSrc.style.display = 'none';
        logoFallback.style.display = 'flex';
      }, { once: true });
    }

    const avatar = document.querySelector('[data-fallback-avatar]');
    if (avatar) {
      avatar.addEventListener('error', () => {
        const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'><rect width='180' height='180' fill='%23161b22'/><text x='50%25' y='52%25' dominant-baseline='middle' text-anchor='middle' fill='%2338bdf8' font-family='sans-serif' font-size='42' font-weight='700'>AJ</text></svg>`;
        avatar.src = `data:image/svg+xml;utf8,${svg}`;
        avatar.classList.add('missing');
      }, { once: true });
    }

    /* ---------- 2. Ambient mouse spotlight (rAF throttled) ---------- */
    if (spotlight && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let rafId = null;
      let lastX = 0;
      let lastY = 0;

      window.addEventListener('pointermove', (e) => {
        lastX = e.clientX;
        lastY = e.clientY;
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          spotlight.style.transform = `translate3d(${lastX - 300}px, ${lastY - 300}px, 0)`;
          rafId = null;
        });
      }, { passive: true });
    }

    /* ---------- 3. Horizontal project scroll ---------- */
    if (track && prevBtn && nextBtn) {
      const scrollAmount = 360;

      prevBtn.addEventListener('click', () => {
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });

      nextBtn.addEventListener('click', () => {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });

      // Keyboard support
      track.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      });

      // Drag-to-scroll (mouse only — touch uses native scroll)
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      let moved = false;

      const onMouseDown = (e) => {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        isDown = true;
        moved = false;
        track.classList.add('active');
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
      };

      const onMouseMove = (e) => {
        if (!isDown) return;
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5;
        if (Math.abs(walk) > 3) moved = true;
        track.scrollLeft = scrollLeft - walk;
      };

      const onMouseUp = () => {
        isDown = false;
        track.classList.remove('active');
      };

      track.addEventListener('mousedown', onMouseDown);
      track.addEventListener('mousemove', onMouseMove);
      track.addEventListener('mouseup', onMouseUp);
      track.addEventListener('mouseleave', onMouseUp);

      // Prevent click-after-drag only if actually dragged
      track.addEventListener('click', (e) => {
        if (moved) {
          e.preventDefault();
          e.stopPropagation();
          moved = false;
        }
      }, true);
    }

    /* ---------- 4. Copy email ---------- */
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const email = copyBtn.getAttribute('data-email');
        if (!email) return;

        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(email);
          } else {
            // Fallback for non-secure contexts
            const ta = document.createElement('textarea');
            ta.value = email;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          showToast('Email address copied!');
        } catch {
          showToast(`Contact: ${email}`);
        }
      });
    }

    /* ---------- Toast helper ---------- */
    let toastTimer = null;
    function showToast(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('show');
      }, 2200);
    }
  });
})();