const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer:fine)').matches;

const revealItems = document.querySelectorAll(
  '.section-head, .story, .cup-grid article, .cup-alt, .packaging-art, .packaging-copy, .menu-columns > div, .order-card'
);

revealItems.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach(el => observer.observe(el));

const parallax = document.querySelector('[data-parallax]');
if (parallax && !reduceMotion && finePointer) {
  parallax.addEventListener('pointermove', e => {
    const rect = parallax.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const layers = [
      ['.hero-strawberry', 18, 8],
      ['.hero-oreo', 24, -10],
      ['.hero-biscoff', 16, -3],
      ['.hero-brandmark', 8, 0]
    ];

    layers.forEach(([selector, amount, rotation]) => {
      const el = parallax.querySelector(selector);
      if (!el) return;
      el.style.transform = `translate(${x * amount}px, ${y * amount}px) rotate(${rotation + x * 2}deg)`;
    });
  });

  parallax.addEventListener('pointerleave', () => {
    const resets = {
      '.hero-strawberry': 'rotate(8deg)',
      '.hero-oreo': 'rotate(-10deg)',
      '.hero-biscoff': 'rotate(-3deg)',
      '.hero-brandmark': 'none'
    };

    Object.entries(resets).forEach(([selector, transform]) => {
      const el = parallax.querySelector(selector);
      if (el) el.style.transform = transform;
    });
  });
}

document.querySelectorAll('.product-orbit').forEach(orbit => {
  if (reduceMotion || !finePointer) return;

  orbit.addEventListener('pointermove', e => {
    const rect = orbit.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const main = orbit.querySelector('img:not(.alt)');
    const alt = orbit.querySelector('.alt');

    if (main) main.style.transform = `translate(${x * 12}px, ${y * 10}px) rotate(${x * 3}deg)`;
    if (alt) alt.style.transform = `translate(${x * -18}px, ${y * -14}px) rotate(${-12 + x * -5}deg)`;
  });

  orbit.addEventListener('pointerleave', () => {
    const main = orbit.querySelector('img:not(.alt)');
    const alt = orbit.querySelector('.alt');
    if (main) main.style.transform = '';
    if (alt) alt.style.transform = 'rotate(-12deg)';
  });
});

const orderForm = document.getElementById('orderForm');
orderForm?.addEventListener('submit', async event => {
  event.preventDefault();

  const data = new FormData(orderForm);
  const text = [
    'Gawddammn Desserts order request',
    `Name: ${data.get('name') || ''}`,
    `Contact: ${data.get('contact') || ''}`,
    `Dessert: ${data.get('dessert') || ''}`,
    `Quantity/size: ${data.get('qty') || ''}`,
    `Notes: ${data.get('notes') || ''}`
  ].join('\n');

  try {
    await navigator.clipboard.writeText(text);
  } catch (_) {}

  const button = orderForm.querySelector('button');
  if (button) {
    const original = button.textContent;
    button.textContent = 'ORDER COPIED';
    setTimeout(() => { button.textContent = original; }, 2200);
  }

  window.open('https://www.instagram.com/gawddammn_llc/', '_blank', 'noopener,noreferrer');
});
