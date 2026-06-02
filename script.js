const revealItems = document.querySelectorAll('.product-card, .process-step, .catering-card, .gallery-strip img, .order-panel');

revealItems.forEach((item) => item.classList.add('reveal'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

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
    const visible = progress > 0.02 ? 0.2 + Math.min(progress * 1.25, 0.46) : 0;

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