/**
 * text-animations.js
 *
 * Implements curated text animations from the animate-text skill catalog.
 * Uses WAAPI (Web Animations API) — zero external dependencies.
 *
 * Effects applied:
 *   h1#acercademi-title  → soft-blur-in    (per-character, Apple hero reveal)
 *   .about-meta h2       → mask-reveal-up  (per-line, Apple section transition)
 *   .tagline             → typewriter      (per-character, stepped reveal)
 *   section h2 (others)  → micro-scale-fade (whole, premium label polish)
 *   .badge-available     → micro-scale-fade (whole, label polish)
 *
 * All animations are triggered once via IntersectionObserver (or immediately
 * for elements already in the viewport on load).
 * Respects prefers-reduced-motion.
 */

// ─────────────────────────────────────────────
// Motion preference
// ─────────────────────────────────────────────
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Detect gradient text BEFORE splitting (computed style must be read while
 * the element has its original text content and styling).
 */
function isGradientTextEl(el) {
  const cs = window.getComputedStyle(el);
  return (
    cs.webkitTextFillColor === 'transparent' ||
    cs.backgroundClip === 'text' ||
    el.tagName === 'H1'           // h1 is always gradient in this design
  );
}

/**
 * Split an element's text content into per-character <span> elements.
 * Uses display:inline to avoid spacing artefacts.
 * For animations that need transform (translateY), we use inline-block on
 * each span. Spaces are rendered as a normal space character in a span.
 *
 * @param {HTMLElement} el        - Target element
 * @param {boolean}     needsXform - true when translateY will be applied
 * @returns {HTMLElement[]} Array of character spans
 */
function splitIntoChars(el, needsXform = true) {
  const text = el.textContent;
  el.textContent = '';
  el.setAttribute('aria-label', text);

  return [...text].map(ch => {
    const span = document.createElement('span');
    span.textContent = ch;
    span.setAttribute('aria-hidden', 'true');
    // Always use inline-block for reliable animation + white-space:pre for spacing
    span.style.display = 'inline-block';
    span.style.whiteSpace = 'pre';
    span.style.willChange = 'opacity, transform, filter';
    el.appendChild(span);
    return span;
  });
}

/**
 * Split an element's text into per-LINE animated blocks.
 * Strategy: render words inline, measure offsetTop, group into lines,
 * then re-wrap each line in an overflow:hidden container with an inner
 * inline-block that we animate.
 *
 * @param {HTMLElement} el
 * @returns {HTMLElement[]} Array of inner span elements (one per line) to animate
 */
function splitIntoLines(el) {
  const originalText = el.textContent.trim();
  el.setAttribute('aria-label', originalText);

  // Phase 1 – render words inline for measurement
  const tokens = originalText.split(/(\s+)/);
  el.innerHTML = '';
  const wordSpans = tokens.map(t => {
    const s = document.createElement('span');
    s.textContent = t;
    s.style.display = 'inline';
    el.appendChild(s);
    return s;
  });

  // Phase 2 – group by vertical position
  const lines = [];
  let currentLine = [];
  let lastTop = null;

  wordSpans.forEach(span => {
    const top = Math.round(span.getBoundingClientRect().top);
    if (lastTop === null || Math.abs(top - lastTop) > 3) {
      if (currentLine.length) lines.push(currentLine);
      currentLine = [span];
      lastTop = top;
    } else {
      currentLine.push(span);
    }
  });
  if (currentLine.length) lines.push(currentLine);

  // Phase 3 – re-wrap into animated containers
  el.innerHTML = '';
  return lines.map(lineTokens => {
    const wrapper = document.createElement('span');
    wrapper.style.display = 'block';
    wrapper.style.overflow = 'hidden';
    wrapper.setAttribute('aria-hidden', 'true');

    const inner = document.createElement('span');
    inner.style.display = 'inline-block';
    lineTokens.forEach(t => inner.appendChild(t));
    wrapper.appendChild(inner);
    el.appendChild(wrapper);
    return inner;   // this is what we animate
  });
}

// ─────────────────────────────────────────────
// soft-blur-in  (per-character)
// Spec: enter 900ms, stagger 25ms, easing cubic-bezier(0.22,1,0.36,1)
//       from { opacity:0, y:16px, blur:12px } → { opacity:1, y:0, blur:0 }
// For gradient-text (h1): skip blur filter (incompatible with clip-path text).
// ─────────────────────────────────────────────
function applySoftBlurIn(el, delayOffset = 0) {
  if (!el) return;

  // Detect gradient BEFORE splitting (DOM mutation would change computed style)
  const gradientText = isGradientTextEl(el);

  const chars = splitIntoChars(el, true);   // needs translateY → inline-block

  // Set initial hidden state
  chars.forEach(span => {
    span.style.opacity = '0';
    span.style.transform = 'translateY(16px)';
    if (!gradientText) span.style.filter = 'blur(12px)';
  });

  if (prefersReducedMotion) {
    chars.forEach(span => {
      span.style.opacity = '1';
      span.style.transform = '';
      span.style.filter = '';
    });
    return;
  }

  const EASING   = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const DURATION = 900;
  const STAGGER  = 25;

  chars.forEach((span, i) => {
    const delay = delayOffset + i * STAGGER;
    const kf = gradientText
      ? [{ opacity: 0, transform: 'translateY(16px)' },
         { opacity: 1, transform: 'translateY(0px)' }]
      : [{ opacity: 0, transform: 'translateY(16px)', filter: 'blur(12px)' },
         { opacity: 1, transform: 'translateY(0px)',  filter: 'blur(0px)' }];

    const anim = span.animate(kf, { duration: DURATION, delay, easing: EASING, fill: 'both' });
    anim.finished.then(() => {
      span.style.opacity   = '1';
      span.style.transform = '';
      if (!gradientText) span.style.filter = '';
    }).catch(() => {});
  });
}

// ─────────────────────────────────────────────
// mask-reveal-up  (per-line)
// Spec: enter 760ms, stagger 90ms, easing cubic-bezier(0.22,1,0.36,1)
//       from { opacity:0, y:30px, blur:6px } → { opacity:1, y:0, blur:0 }
// ─────────────────────────────────────────────
function applyMaskRevealUp(el, delayOffset = 0) {
  if (!el) return;
  const lines = splitIntoLines(el);

  lines.forEach(line => {
    line.style.opacity   = '0';
    line.style.transform = 'translateY(30px)';
    line.style.filter    = 'blur(6px)';
  });

  if (prefersReducedMotion) {
    lines.forEach(line => {
      line.style.opacity   = '1';
      line.style.transform = '';
      line.style.filter    = '';
    });
    return;
  }

  const EASING   = 'cubic-bezier(0.22, 1, 0.36, 1)';
  const DURATION = 760;
  const STAGGER  = 90;

  lines.forEach((line, i) => {
    const delay = delayOffset + i * STAGGER;
    const anim = line.animate(
      [{ opacity: 0, transform: 'translateY(30px)', filter: 'blur(6px)' },
       { opacity: 1, transform: 'translateY(0px)',  filter: 'blur(0px)' }],
      { duration: DURATION, delay, easing: EASING, fill: 'both' }
    );
    anim.finished.then(() => {
      line.style.opacity   = '1';
      line.style.transform = '';
      line.style.filter    = '';
    }).catch(() => {});
  });
}

// ─────────────────────────────────────────────
// typewriter  (per-character)
// Spec: enter 240ms, stagger 46ms, easing steps(1, end)
//       from { opacity:0 } → { opacity:1 }
// Uses inline spans (no transform) to preserve natural character spacing.
// ─────────────────────────────────────────────
function applyTypewriter(el, delayOffset = 0) {
  if (!el) return;
  const chars = splitIntoChars(el, false);   // uses inline-block + white-space:pre

  if (prefersReducedMotion) {
    chars.forEach(span => { span.style.opacity = '1'; });
    return;
  }

  const STAGGER = 46;

  chars.forEach((span, i) => {
    const delay = delayOffset + i * STAGGER;
    span.style.opacity = '0'; // Initial state

    setTimeout(() => {
      span.style.opacity = '1';
      // Optional: add a tiny scale pop or sound here if requested later
    }, delay);
  });
}

// ─────────────────────────────────────────────
// micro-scale-fade  (whole element)
// Spec: enter 600ms, easing cubic-bezier(0.32,0.72,0,1)
//       from { opacity:0, scale:0.96 } → { opacity:1, scale:1 }
// ─────────────────────────────────────────────
function applyMicroScaleFade(el, delayOffset = 0) {
  if (!el) return;
  el.style.opacity   = '0';
  el.style.transform = 'scale(0.96)';

  if (prefersReducedMotion) {
    el.style.opacity   = '1';
    el.style.transform = '';
    return;
  }

  const EASING   = 'cubic-bezier(0.32, 0.72, 0, 1)';
  const DURATION = 600;

  const anim = el.animate(
    [{ opacity: 0, transform: 'scale(0.96)' },
     { opacity: 1, transform: 'scale(1)' }],
    { duration: DURATION, delay: delayOffset, easing: EASING, fill: 'both' }
  );
  anim.finished.then(() => {
    el.style.opacity   = '1';
    el.style.transform = '';
  }).catch(() => {});
}

// ─────────────────────────────────────────────
// Observer factory
// Triggers animFn once when el enters the viewport.
// ─────────────────────────────────────────────
function observeOnce(el, animFn, delayOffset = 0) {
  if (!el) return;
  const obs = new IntersectionObserver(
    (entries, o) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animFn(el, delayOffset);
          o.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  obs.observe(el);
}

// ─────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────
function initTextAnimations() {
  // ── Hero section (immediately in viewport on load) ──────────────────────

  // 1. Badge — micro-scale-fade (first, no delay)
  const badge = document.querySelector('.badge-available');
  applyMicroScaleFade(badge, 80);

  // 2. h1 hero name — soft-blur-in per-character
  const heroName = document.getElementById('acercademi-title');
  applySoftBlurIn(heroName, 200);

  // 3. h2 subtitle — mask-reveal-up per-line
  const heroSubtitle = document.querySelector('.about-meta h2');
  applyMaskRevealUp(heroSubtitle, 500);

  // 4. Tagline — typewriter (starts after hero title completes ≈900ms)
  const tagline = document.querySelector('.tagline');
  applyTypewriter(tagline, 950);

  // ── Remaining section headings — revealed as user scrolls ───────────────

  // 5. All other h2 headings (skip about-meta ones handled above)
  document.querySelectorAll('section h2, aside h2').forEach(h2 => {
    if (h2.closest('.about-meta')) return;
    observeOnce(h2, applyMicroScaleFade, 0);
  });

  // 6. All h3 headings
  document.querySelectorAll('section h3').forEach(h3 => {
    observeOnce(h3, applyMicroScaleFade, 80);
  });
}

document.addEventListener('DOMContentLoaded', initTextAnimations);
