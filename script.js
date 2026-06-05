const revealItems = document.querySelectorAll('.menu-column, .menu-item, .process-step, .catering-card, .gallery-thumb, .order-panel');

revealItems.forEach((item) => item.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

revealItems.forEach((item) => observer.observe(item));

const phrases = ['Gawww...', 'Dddaammmnnn!', 'Ate and left no crumbs!', 'Pick one before I do.', 'That one dangerous.'];
const bubbles = document.querySelectorAll('.bubble, .card-bubble');

bubbles.forEach((bubble, index) => {
  setInterval(() => {
    bubble.textContent = phrases[(index + Math.floor(Date.now() / 2500)) % phrases.length];
  }, 2500);
});

const sweetsLayer = document.querySelector('.scroll-sweets');
const crumbColors = ['#b8782e', '#8a4b20', '#d5a15b', '#f0d1a2', '#6b351a'];
let sweetPieces = [];
let ticking = false;

function createSweetPieces() {
  if (!sweetsLayer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const count = window.innerWidth < 700 ? 18 : 32;
  sweetsLayer.innerHTML = '';

  sweetPieces = Array.from({ length: count }, () => {
    const piece = document.createElement('span');
    const size = 4 + Math.random() * 9;

    piece.style.setProperty('--x', `${Math.random() * 100}vw`);
    piece.style.setProperty('--s', `${size}px`);
    piece.style.setProperty('--c', crumbColors[Math.floor(Math.random() * crumbColors.length)]);
    piece.style.setProperty('--y', `${-80 - Math.random() * 120}px`);
    piece.style.setProperty('--r', `${Math.random() * 360}deg`);
    piece.style.setProperty('--o', '0');
    piece.dataset.speed = String(0.16 + Math.random() * 0.64);
    piece.dataset.offset = String(Math.random() * window.innerHeight);
    sweetsLayer.appendChild(piece);
    return piece;
  });
}

function updateSweetPieces() {
  const scrollY = window.scrollY || window.pageYOffset;
  const viewport = window.innerHeight || 800;
  const docHeight = Math.max(document.body.scrollHeight - viewport, 1);
  const progress = scrollY / docHeight;

  sweetPieces.forEach((piece, index) => {
    const speed = Number(piece.dataset.speed || 0.4);
    const offset = Number(piece.dataset.offset || 0);
    const y = ((scrollY * speed + offset) % (viewport + 180)) - 90;
    const xDrift = Math.sin((scrollY + index * 61) / 180) * 16;
    const rotate = scrollY * speed * 0.5 + index * 33;
    const visible = progress > 0.02 ? 0.14 + Math.min(progress * 0.9, 0.34) : 0;

    piece.style.setProperty('--y', `${y}px`);
    piece.style.setProperty('--r', `${rotate}deg`);
    piece.style.transform = `translate3d(${xDrift}px, var(--y), 0) rotate(var(--r))`;
    piece.style.setProperty('--o', visible.toFixed(2));
  });

  ticking = false;
}

function requestSweetUpdate() {
  if (!ticking) {
    window.requestAnimationFrame(updateSweetPieces);
    ticking = true;
  }
}

createSweetPieces();
updateSweetPieces();
window.addEventListener('scroll', requestSweetUpdate, { passive: true });
window.addEventListener('resize', () => {
  createSweetPieces();
  updateSweetPieces();
});

const thumbs = Array.from(document.querySelectorAll('.gallery-thumb'));
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const lightboxCaption = document.querySelector('.lightbox-caption');
const closeBtn = document.querySelector('.lightbox-close');
const prevBtn = document.querySelector('.lightbox-prev');
const nextBtn = document.querySelector('.lightbox-next');
let activeGalleryIndex = 0;
let touchStartX = 0;
let touchEndX = 0;

function openGallery(index) {
  if (!lightbox || !lightboxImg || !thumbs.length) return;
  activeGalleryIndex = (index + thumbs.length) % thumbs.length;
  const thumb = thumbs[activeGalleryIndex];
  const img = thumb.querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = thumb.dataset.title || img.alt || 'Gawddammn gallery image';
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeGallery() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showNext() {
  openGallery(activeGalleryIndex + 1);
}

function showPrev() {
  openGallery(activeGalleryIndex - 1);
}

thumbs.forEach((thumb, index) => {
  thumb.addEventListener('click', () => openGallery(index));
});

closeBtn?.addEventListener('click', closeGallery);
nextBtn?.addEventListener('click', showNext);
prevBtn?.addEventListener('click', showPrev);

lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeGallery();
});

lightbox?.addEventListener('touchstart', (event) => {
  touchStartX = event.changedTouches[0].screenX;
}, { passive: true });

lightbox?.addEventListener('touchend', (event) => {
  touchEndX = event.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 45) {
    diff > 0 ? showNext() : showPrev();
  }
}, { passive: true });

window.addEventListener('keydown', (event) => {
  if (!lightbox?.classList.contains('open')) return;
  if (event.key === 'Escape') closeGallery();
  if (event.key === 'ArrowRight') showNext();
  if (event.key === 'ArrowLeft') showPrev();
});