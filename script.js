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
const sweetColors = ['#b8782e', '#6b351a', '#f4d0a3', '#ff6aad', '#fff8fb'];
let sweetPieces = [];
let ticking = false;

function createSweetPieces() {
  if (!sweetsLayer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const count = window.innerWidth < 700 ? 14 : 26;
  sweetsLayer.innerHTML = '';
  sweetPieces = Array.from({ length: count }, (_, index) => {
    const piece = document.createElement('span');
    const isDrip = index % 6 === 0;
    if (isDrip) piece.classList.add('drip-dot');

    const size = isDrip ? 10 + Math.random() * 9 : 7 + Math.random() * 13;
    piece.style.setProperty('--x', `${Math.random() * 100}vw`);
    piece.style.setProperty('--s', `${size}px`);
    piece.style.setProperty('--c', sweetColors[Math.floor(Math.random() * sweetColors.length)]);
    piece.style.setProperty('--y', `${-80 - Math.random() * 120}px`);
    piece.style.setProperty('--r', `${Math.random() * 360}deg`);
    piece.style.setProperty('--o', '0');
    piece.dataset.speed = String(0.18 + Math.random() * 0.72);
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
    const xDrift = Math.sin((scrollY + index * 61) / 180) * 18;
    const rotate = scrollY * speed * 0.45 + index * 31;
    const visible = progress > 0.02 ? 0.16 + Math.min(progress * 1.6, 0.62) : 0;

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