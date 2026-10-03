const revealItems = document.querySelectorAll('.story, .cup-grid article, .cup-alt, .brand-section, .menu-columns > div, .order-card');
revealItems.forEach(el => el.classList.add('reveal'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });
revealItems.forEach(el => observer.observe(el));

const parallax = document.querySelector('[data-parallax]');
if (parallax && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  parallax.addEventListener('pointermove', e => {
    const rect = parallax.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - .5;
    const y = (e.clientY - rect.top) / rect.height - .5;
    const layers = [
      ['.hero-strawberry', 14, -9],
      ['.hero-oreo', 22, 10],
      ['.hero-biscoff', 18, -8],
      ['.hero-mascot', 10, 0]
    ];
    layers.forEach(([sel, amount, rotate]) => {
      const el = parallax.querySelector(sel);
      if (el) el.style.transform = `translate(${x * amount}px, ${y * amount}px) rotate(${rotate + x * 3}deg)`;
    });
  });
  parallax.addEventListener('pointerleave', () => {
    const reset = {'.hero-strawberry':'rotate(-9deg)', '.hero-oreo':'rotate(10deg)', '.hero-biscoff':'rotate(-8deg)', '.hero-mascot':'none'};
    Object.entries(reset).forEach(([sel, transform]) => {
      const el = parallax.querySelector(sel);
      if (el) el.style.transform = transform;
    });
  });
}

document.querySelectorAll('.product-orbit').forEach(orbit => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  orbit.addEventListener('pointermove', e => {
    const r = orbit.getBoundingClientRect();
    const x = (e.clientX-r.left)/r.width-.5;
    const y = (e.clientY-r.top)/r.height-.5;
    const main = orbit.querySelector('img:not(.alt)');
    const alt = orbit.querySelector('.alt');
    if(main) main.style.transform = `translate(${x*12}px,${y*10}px) rotate(${x*3}deg)`;
    if(alt) alt.style.transform = `translate(${x*-18}px,${y*-14}px) rotate(${-12+x*-5}deg)`;
  });
  orbit.addEventListener('pointerleave', () => {
    const main = orbit.querySelector('img:not(.alt)');
    const alt = orbit.querySelector('.alt');
    if(main) main.style.transform = '';
    if(alt) alt.style.transform = 'rotate(-12deg)';
  });
});

const orderForm = document.getElementById('orderForm');
orderForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const data = new FormData(orderForm);
  const text = [
    'Gawddammn order request',
    `Name: ${data.get('name') || ''}`,
    `Contact: ${data.get('contact') || ''}`,
    `Dessert: ${data.get('dessert') || ''}`,
    `Quantity/size: ${data.get('qty') || ''}`,
    `Notes: ${data.get('notes') || ''}`
  ].join('\n');
  try { await navigator.clipboard.writeText(text); } catch (_) {}
  const btn = orderForm.querySelector('button');
  if (btn) {
    const old = btn.textContent;
    btn.textContent = 'GAWDDAMMN. COPIED.';
    setTimeout(() => btn.textContent = old, 2200);
  }
  window.open('https://www.instagram.com/gawddammn_llc/', '_blank', 'noopener,noreferrer');
});