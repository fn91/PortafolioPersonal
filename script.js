// === Utility Functions ===
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// === Navigation Helpers ===
const handleSmoothScroll = (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  
  const id = a.getAttribute('href').slice(1);
  const el = document.getElementById(id);
  if (el) {
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', `#${id}`);
  }
};

// === Mobile Menu ===
const initMobileMenu = () => {
  const menuBtn = $('.menu-toggle');
  const navList = $('.nav-list');
  
  if (menuBtn && navList) {
    menuBtn.addEventListener('click', () => {
      const open = navList.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
  }
};

// === Active Section Tracking ===
const initActiveSectionTracking = () => {
  const sections = $$('section[id], div[id], header[id], footer[id]');
  const navLinks = $$('.nav-list a');
  const byId = (id) => navLinks.find(a => a.getAttribute('href') === `#${id}`);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = byId(entry.target.id);
      if (link && entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });

  sections.forEach(s => s.id && io.observe(s));
};

// === Scroll UI Elements ===
const initScrollUI = () => {
  const toTop = $('.to-top');
  const progress = $('.progress');

  const updateScrollUI = () => {
    const y = window.scrollY;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (toTop) toTop.hidden = y < 300;
    if (progress) progress.style.width = `${(y / h) * 100}%`;
  };

  document.addEventListener('scroll', updateScrollUI);
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
};

// === Theme Switcher ===
const initThemeSwitcher = () => {
  const applyTheme = (theme) => document.documentElement.setAttribute('data-theme', theme);
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  $('.theme-toggle')?.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });
};

// === Reveal Animations ===
const initRevealAnimations = () => {
  const revealEls = $$('[data-reveal], .Habilidades img, .softskills li, #Proyectos li');
  revealEls.forEach(el => el.style.opacity = 0);

  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) {
        target.animate(
          [
            { opacity: 0, transform: 'translateY(10px)' },
            { opacity: 1, transform: 'none' }
          ],
          { duration: 400, fill: 'forwards', easing: 'ease-out' }
        );
        io.unobserve(target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => io.observe(el));
};

// === Project Filters ===
const initProjectFilters = () => {
  const filtros = $$('button.btn-filter'); // Antes: $$('.btn-filter')
const items = $$('#Proyectos li');

filtros.forEach(boton => {
    boton.addEventListener('click', () => {
        const key = boton.dataset.filter;

        filtros.forEach(b => b.classList.remove('active'));
        boton.classList.add('active');

        items.forEach(li => {
            if (key === 'all' || li.dataset.tech.toLowerCase().includes(key)) {
                li.style.display = '';
            } else {
                li.style.display = 'none';
            }
        });
    });
});
};

// === Lightbox ===
const initLightbox = () => {
  let overlay = null;

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.lightbox');
    if (!a) return;
    
    e.preventDefault();
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `<img src="${a.getAttribute('href')}" alt="">`;
    overlay.addEventListener('click', () => overlay?.remove());
    document.body.appendChild(overlay);
  });

  return overlay;
};

// === Keyboard Navigation ===
const initKeyboardNav = (overlay) => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $('.nav-list')?.classList.remove('open');
      overlay?.remove();
    }
  });
};

// === Initialize Everything ===
const init = () => {
  // smooth scroll ahora lo maneja CSS (html{scroll-behavior:smooth})
initMobileMenu();
  initActiveSectionTracking();
  initScrollUI();
  initThemeSwitcher();
  initRevealAnimations();
  initProjectFilters();
  const overlay = initLightbox();
  initKeyboardNav(overlay);
};

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);