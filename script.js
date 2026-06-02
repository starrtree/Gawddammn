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
