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

  // Handle top of page explicitly
  window.addEventListener('scroll', () => {
    if (window.scrollY < 100) {
      navLinks.forEach(a => a.classList.remove('active'));
      const navHome = byId('Inicio');
      if (navHome) navHome.classList.add('active');
    }
  });
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
  // Handle all links to #Inicio (nav and back-to-top)
  const homeLinks = $$('a[href="#Inicio"]');
  homeLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      history.pushState(null, '', '#Inicio');

      // Update active state manually
      $$('.nav-list a').forEach(a => a.classList.remove('active'));
      const navHome = document.querySelector('.nav-list a[href="#Inicio"]');
      if (navHome) navHome.classList.add('active');
    });
  });
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

    // Don't open lightbox for project cards (they use modal instead)
    if (a.classList.contains('project-card')) return;

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

      // Close project modal
      const modal = $('#projectModal');
      if (modal && !modal.hidden) {
        modal.hidden = true;
        document.body.style.overflow = '';
      }
    }
  });
};

// === Project Modal ===
const initProjectModal = () => {
  const modal = $('#projectModal');
  const modalClose = $('.modal-close', modal);

  // Open modal when clicking on project cards
  document.addEventListener('click', (e) => {
    const projectCard = e.target.closest('.project-card');
    if (!projectCard) return;

    e.preventDefault();
    const li = projectCard.closest('li');

    // Populate modal with project data
    $('#modal-img').src = li.dataset.projectImg;
    $('#modal-img').alt = li.dataset.projectTitle;
    $('#modal-title').textContent = li.dataset.projectTitle;
    $('#modal-desc').textContent = li.dataset.projectDesc;
    $('#modal-tech').textContent = `Tecnologías: ${li.dataset.projectTech}`;
    $('#modal-demo').href = li.dataset.projectDemo;
    $('#modal-repo').href = li.dataset.projectRepo;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.focus();
  });

  // Close modal
  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
};

// === Contact Form Validation ===
const initContactForm = () => {
  const form = $('#contactForm');
  if (!form) return;

  const fields = {
    name: $('#name'),
    email: $('#email'),
    message: $('#message')
  };

  const errors = {
    name: $('#name-error'),
    email: $('#email-error'),
    message: $('#message-error')
  };

  const validateField = (field, errorEl) => {
    const value = field.value.trim();
    let error = '';

    if (field.name === 'name') {
      if (!value) error = 'El nombre es requerido';
      else if (value.length < 2) error = 'El nombre debe tener al menos 2 caracteres';
    }

    if (field.name === 'email') {
      if (!value) error = 'El email es requerido';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Email inválido';
    }

    if (field.name === 'message') {
      if (!value) error = 'El mensaje es requerido';
      else if (value.length < 10) error = 'El mensaje debe tener al menos 10 caracteres';
    }

    errorEl.textContent = error;
    field.classList.toggle('error', !!error);
    field.classList.toggle('valid', !error && value);

    return !error;
  };

  // Real-time validation
  Object.entries(fields).forEach(([name, field]) => {
    field.addEventListener('blur', () => validateField(field, errors[name]));
    field.addEventListener('input', () => {
      if (field.classList.contains('error')) {
        validateField(field, errors[name]);
      }
    });
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const isValid = Object.entries(fields).every(([name, field]) =>
      validateField(field, errors[name])
    );

    if (isValid) {
      const successMsg = $('.form-success');
      successMsg.textContent = '✓ ¡Mensaje enviado con éxito! Te contactaré pronto.';
      successMsg.style.display = 'block';
      form.reset();

      // Clear validation states
      Object.values(fields).forEach(field => {
        field.classList.remove('valid', 'error');
      });

      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 5000);
    }
  });
};

// === Custom Cursor ===
const initCustomCursor = () => {
  const cursor = $('.custom-cursor');
  if (!cursor) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth cursor animation
  const animateCursor = () => {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;

    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;

    requestAnimationFrame(animateCursor);
  };
  animateCursor();

  // Expand cursor on interactive elements
  const interactiveEls = 'a, button, input, textarea, .project-card';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveEls)) {
      cursor.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveEls)) {
      cursor.classList.remove('cursor-hover');
    }
  });
};

// === Enhanced Social Media Animations ===
const initSocialAnimations = () => {
  const socialLinks = $$('.social-links a');

  socialLinks.forEach(link => {
    link.addEventListener('mouseenter', function () {
      this.style.transform = 'translateY(-5px) rotate(5deg) scale(1.1)';
    });

    link.addEventListener('mouseleave', function () {
      this.style.transform = '';
    });
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

  // New features
  initProjectModal();
  initContactForm();
  initCustomCursor();
  initSocialAnimations();
};

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);