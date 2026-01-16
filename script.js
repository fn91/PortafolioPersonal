// === Navigation & Section Tracking ===
const initActiveSectionTracking = () => {
  const animSections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-list a');
  const trackableElements = document.querySelectorAll('section, main[id], footer[id]');

  // Inicialmente ocultamos las secciones para la animación
  animSections.forEach(s => s.classList.add('reveal-hidden'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Activar link de navegación si tiene ID y está visible
      if (entry.isIntersecting && entry.target.id) {
        const targetId = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`);
        });
      }

      // Mostrar con animación solo las etiquetas SECTION
      if (entry.isIntersecting && entry.target.tagName === 'SECTION') {
        entry.target.classList.remove('reveal-hidden');
        entry.target.classList.add('reveal-visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px"
  });

  trackableElements.forEach(el => observer.observe(el));
};

// === Scroll UI ===
const initScrollUI = () => {
  const progress = document.querySelector('.progress');
  const toTop = document.querySelector('.to-top');

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPos = (window.scrollY / totalHeight) * 100;
    if (progress) progress.style.width = `${scrollPos}%`;
    if (toTop) toTop.style.opacity = window.scrollY > 500 ? '1' : '0';
  });
};

// === Command Palette Logic ===
const initCommandPalette = () => {
  const palette = document.getElementById('commandPalette');
  const input = palette.querySelector('.command-input');
  const items = palette.querySelectorAll('.command-item');

  const togglePalette = (show) => {
    palette.classList.toggle('active', show);
    if (show) {
      input.value = '';
      setTimeout(() => input.focus(), 50);
    }
  };

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      togglePalette(!palette.classList.contains('active'));
    }
    if (e.key === 'Escape') togglePalette(false);

    if (palette.classList.contains('active')) {
      const key = e.key.toLowerCase();
      if (key === 'p') executeAction('scroll-proyectos');
      if (key === 'c') executeAction('scroll-contacto');
      if (key === 't') executeAction('toggle-theme');
      if (key === 'd') executeAction('download-cv');

      if (['p', 'c', 't', 'd'].includes(key)) togglePalette(false);
    }
  });

  items.forEach(item => {
    item.addEventListener('click', () => {
      const action = item.dataset.action;
      executeAction(action);
      togglePalette(false);
    });
  });

  const executeAction = (action) => {
    switch (action) {
      case 'scroll-proyectos':
        document.getElementById('Proyectos').scrollIntoView({ behavior: 'smooth' });
        break;
      case 'scroll-contacto':
        document.getElementById('ContactoForm').scrollIntoView({ behavior: 'smooth' });
        break;
      case 'toggle-theme':
        document.querySelector('.theme-toggle').click();
        break;
      case 'download-cv':
        window.open('https://www.dropbox.com/scl/fi/1qlvermybaqxewuaxtrol/Claudio_FanelliRodriguez_CV_es-firmado.pdf?rlkey=in05b3ogo9jm9p31ydbmki1p1&st=3pmq08mc&dl=0', '_blank');
        break;
    }
  };
};

// === Project Modal ===
const initProjectModal = () => {
  const modal = document.getElementById('projectModal');
  const closeBtn = modal.querySelector('.modal-close');

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    if (!card) return;

    e.preventDefault();
    const li = card.closest('li');
    modal.querySelector('#modal-img').src = li.dataset.projectImg;
    modal.querySelector('#modal-title').textContent = li.dataset.projectTitle;
    modal.querySelector('#modal-desc').textContent = li.dataset.projectDesc;
    modal.querySelector('#modal-tech').textContent = li.dataset.projectTech;
    modal.querySelector('#modal-demo').href = li.dataset.projectDemo;
    modal.querySelector('#modal-repo').href = li.dataset.projectRepo;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  });

  closeBtn.addEventListener('click', () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeBtn.click();
  });
};

// === Custom Cursor ===
const initCustomCursor = () => {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor) return;

  window.addEventListener('mousemove', (e) => {
    cursor.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
  });

  document.querySelectorAll('a, button, input, textarea, .project-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
  });
};

// === Theme Management ===
const initTheme = () => {
  const toggle = document.querySelector('.theme-toggle');
  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    toggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  };

  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(savedTheme);

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
};

// === Project Filters ===
const initFilters = () => {
  const buttons = document.querySelectorAll('.btn-filter');
  const projects = document.querySelectorAll('#Proyectos li');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      projects.forEach(project => {
        const techs = project.dataset.tech.toLowerCase();
        if (filter === 'all' || techs.includes(filter)) {
          project.style.display = 'flex';
        } else {
          project.style.display = 'none';
        }
      });
    });
  });
};

// === Start All ===
document.addEventListener('DOMContentLoaded', () => {
  initActiveSectionTracking();
  initScrollUI();
  initCommandPalette();
  initProjectModal();
  initCustomCursor();
  initTheme();
  initFilters();

  // Mobile Menu
  const menuBtn = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');
  menuBtn?.addEventListener('click', () => {
    navList.style.display = navList.style.display === 'flex' ? 'none' : 'flex';
  });
});
