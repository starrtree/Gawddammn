const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer:fine)').matches;

// Opening logo film. It stays muted so browsers can autoplay it.
// Reduced-motion/data-saver/slow-network users skip it automatically.
// On iOS, Low Power Mode can block programmatic autoplay; if that happens,
// play() rejects and the intro closes immediately instead of leaving a dead screen.
const introOverlay = document.getElementById('introOverlay');
const introVideo = document.getElementById('introVideo');
const skipIntro = document.getElementById('skipIntro');
let introCloseTimer = 0;
let introClosed = false;

function closeIntro(immediate = false) {
  if (!introOverlay || introClosed) return;
  introClosed = true;
  clearTimeout(introCloseTimer);
  document.body.classList.remove('intro-active');
  if (introVideo) introVideo.pause();

  if (immediate || motionPreference.matches) {
    introOverlay.hidden = true;
    introOverlay.setAttribute('aria-hidden', 'true');
    return;
  }

  introOverlay.classList.add('is-exiting');
  window.setTimeout(() => {
    introOverlay.hidden = true;
    introOverlay.setAttribute('aria-hidden', 'true');
  }, 520);
}

async function shouldSkipIntro() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const reducedData = window.matchMedia?.('(prefers-reduced-data: reduce)')?.matches;
  if (
    motionPreference.matches ||
    reducedData ||
    connection?.saveData ||
    ['slow-2g', '2g'].includes(connection?.effectiveType)
  ) return true;

  if (navigator.getBattery) {
    try {
      const battery = await navigator.getBattery();
      if (!battery.charging && battery.level <= 0.15) return true;
    } catch (_) {}
  }

  return false;
}

async function startIntro() {
  if (!introOverlay || !introVideo) return;
  if (await shouldSkipIntro()) {
    closeIntro(true);
    return;
  }

  introClosed = false;
  introOverlay.hidden = false;
  introOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('intro-active');
  introVideo.currentTime = 0;
  introVideo.load();

  const armSafetyTimer = () => {
    clearTimeout(introCloseTimer);
    const durationMs = Number.isFinite(introVideo.duration)
      ? Math.min(Math.max(introVideo.duration * 1000 + 600, 3500), 14000)
      : 10000;
    introCloseTimer = window.setTimeout(() => closeIntro(), durationMs);
  };

  introVideo.addEventListener('loadedmetadata', armSafetyTimer, { once: true });

  try {
    await introVideo.play();
    armSafetyTimer();
  } catch (_) {
    // Safari/iOS may reject autoplay in Low Power Mode or other constrained states.
    closeIntro(true);
  }
}

skipIntro?.addEventListener('click', () => closeIntro());
introVideo?.addEventListener('ended', () => closeIntro(), { once: true });
introVideo?.addEventListener('error', () => closeIntro(true), { once: true });
startIntro();


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
if (parallax && finePointer) {
  parallax.addEventListener('pointermove', e => {
    if (motionPreference.matches) return;
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
  if (!finePointer) return;

  orbit.addEventListener('pointermove', e => {
    if (motionPreference.matches) return;
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

// Keep the cookie artwork moving gently as its section passes through the viewport.
const scrollCookies = [...document.querySelectorAll('.hero-cookie, .product-orbit img')];
const smallScreen = window.matchMedia('(max-width: 620px)');
let scrollFrame = 0;

function updateScrollCookies() {
  scrollFrame = 0;
  if (motionPreference.matches) return;

  const viewportHeight = window.innerHeight;
  const mobile = smallScreen.matches;
  scrollCookies.forEach((cookie, index) => {
    const area = cookie.closest('.hero-stage, .product-orbit');
    const rect = area.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1,
      (viewportHeight - rect.top) / (viewportHeight + rect.height)
    ));
    const travel = (progress - .5) * 2;
    const direction = index % 2 === 0 ? 1 : -1;

    cookie.style.setProperty('--scroll-x', `${(travel * (mobile ? 6 : 18) * direction).toFixed(1)}px`);
    cookie.style.setProperty('--scroll-y', `${(travel * (mobile ? 10 : 26)).toFixed(1)}px`);
    cookie.style.setProperty('--scroll-scale', (1 + travel * (mobile ? .02 : .045)).toFixed(3));
  });
}

function scheduleScrollCookies() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollCookies);
}

window.addEventListener('scroll', scheduleScrollCookies, { passive: true });
window.addEventListener('resize', scheduleScrollCookies);
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) {
    scrollCookies.forEach(cookie => {
      cookie.style.removeProperty('--scroll-x');
      cookie.style.removeProperty('--scroll-y');
      cookie.style.removeProperty('--scroll-scale');
      cookie.style.transform = '';
    });
    if (parallax) parallax.querySelector('.hero-brandmark').style.transform = '';
  } else {
    scheduleScrollCookies();
  }
});
scheduleScrollCookies();

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
