// Plan:
// 1. Mouse spotlight tracking.
// 2. Horizontal project reel: arrow navigation buttons + drag-to-scroll support.
// 3. Email clipboard copy with visual feedback toast.

document.addEventListener('DOMContentLoaded', () => {
  const spotlight = document.getElementById('spotlight');
  const copyBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('toast');
  const track = document.getElementById('projects-track');
  const prevBtn = document.getElementById('scroll-prev');
  const nextBtn = document.getElementById('scroll-next');

  // 1. Ambient mouse spotlight
  window.addEventListener('pointermove', (e) => {
    if (spotlight) {
      spotlight.style.left = `${e.clientX}px`;
      spotlight.style.top = `${e.clientY}px`;
    }
  });

  // 2. Horizontal Project Scroll Buttons
  if (track && prevBtn && nextBtn) {
    const scrollAmount = 360;

    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Drag-to-scroll functionality for mouse users
    let isDown = false;
    let startX;
    let scrollLeft;

    track.addEventListener('mousedown', (e) => {
      isDown = true;
      track.classList.add('active');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      isDown = false;
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5; // Scroll speed factor
      track.scrollLeft = scrollLeft - walk;
    });
  }

  // 3. Quick Email Copy with feedback
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const email = copyBtn.getAttribute('data-email');
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email address copied!');
      }).catch(() => {
        showToast(`Contact: ${email}`);
      });
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }
});