const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const revealItems = document.querySelectorAll('.story, .cup-grid article, .cup-alt, .brand-reveal-copy, .logo-stage, .packaging, .menu-columns > div, .order-card');
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

const logoStage = document.querySelector('.logo-stage');
if (logoStage) {
  if (reduceMotion) {
    logoStage.classList.add('play');
  } else {
    const logoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) logoStage.classList.add('play');
        else logoStage.classList.remove('play');
      });
    }, { threshold: 0.35 });
    logoObserver.observe(logoStage);
  }
}

const parallax = document.querySelector('[data-parallax]');
if (parallax && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
  parallax.addEventListener('pointermove', e => {
    const rect = parallax.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - .5;
    const y = (e.clientY - rect.top) / rect.height - .5;
    const layers = [
      ['.hero-strawberry', 14, -8],
      ['.hero-oreo', 22, 8],
      ['.hero-biscoff', 18, -8]
    ];
    layers.forEach(([sel, amount, rotate]) => {
      const el = parallax.querySelector(sel);
      if (el) el.style.transform = `translate(${x * amount}px, ${y * amount}px) rotate(${rotate + x * 3}deg)`;
    });
  });
  parallax.addEventListener('pointerleave', () => {
    const reset = {'.hero-strawberry':'rotate(-8deg)', '.hero-oreo':'rotate(8deg)', '.hero-biscoff':'rotate(-8deg)'};
    Object.entries(reset).forEach(([sel, transform]) => {
      const el = parallax.querySelector(sel);
      if (el) el.style.transform = transform;
    });
  });
}

document.querySelectorAll('.product-orbit').forEach(orbit => {
  if (reduceMotion || !window.matchMedia('(pointer:fine)').matches) return;
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