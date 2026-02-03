// === Navigation & Section Tracking ===
const initActiveSectionTracking = () => {
  const animSections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-list a');
  const trackableElements = document.querySelectorAll('section, main[id], footer[id]');

  // Animation observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        entry.target.classList.remove('reveal-hidden');
        
        // Staggered children animation if they have [data-stagger]
        const staggerItems = entry.target.querySelectorAll('.stagger-item');
        staggerItems.forEach((item, index) => {
          item.style.transitionDelay = `${index * 0.1}s`;
          item.style.opacity = '1';
          item.style.transform = 'translateY(0)';
        });
      }
    });
  }, { threshold: 0.15 });

  animSections.forEach(s => {
    s.classList.add('reveal-hidden');
    revealObserver.observe(s);
  });

  // Nav tracking observer
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.target.id) {
        const targetId = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`);
        });
      }
    });
  }, { threshold: 0.5 });

  trackableElements.forEach(el => navObserver.observe(el));
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
    
    // Smooth Parallax for Hero
    const aboutImg = document.querySelector('.about_img');
    if (aboutImg) {
      const scrollY = window.scrollY;
      aboutImg.style.transform = `scale(1.2) translateY(${scrollY * 0.05}px)`;
    }
  });
};

// === Command Palette Logic ===
const initCommandPalette = () => {
  const palette = document.getElementById('commandPalette');
  const input = palette.querySelector('.command-input');
  const list = palette.querySelector('.command-list');
  const defaultItems = list.innerHTML;

  const togglePalette = (show) => {
    palette.classList.toggle('active', show);
    if (show) {
      input.value = '';
      list.innerHTML = defaultItems; // Restore original actions
      setTimeout(() => input.focus(), 50);
    }
  };

  // Search Logic
  input.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (query === '') {
      list.innerHTML = defaultItems;
      return;
    }

    const projects = Array.from(document.querySelectorAll('#Proyectos li'));
    const matches = projects.filter(p => 
      p.dataset.projectTitle.toLowerCase().includes(query) || 
      p.dataset.tech.toLowerCase().includes(query)
    );

    if (matches.length > 0) {
      list.innerHTML = matches.map((p, idx) => `
        <div class="command-item result-item" data-id="${idx}">
          <span>📁 Proyecto: ${p.dataset.projectTitle}</span>
          <span class="command-shortcut">ENTER</span>
        </div>
      `).join('');

      list.querySelectorAll('.result-item').forEach((item, idx) => {
        item.addEventListener('click', () => {
          matches[idx].scrollIntoView({ behavior: 'smooth' });
          matches[idx].click(); // Open modal
          togglePalette(false);
        });
      });
    } else {
      list.innerHTML = '<div class="command-item">No se encontraron resultados</div>';
    }
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      togglePalette(!palette.classList.contains('active'));
    }
    if (e.key === 'Escape') togglePalette(false);

    // Contextual shortcuts when empty
    if (palette.classList.contains('active') && input.value === '') {
      const key = e.key.toLowerCase();
      const actions = { p: 'scroll-proyectos', c: 'scroll-contacto', t: 'toggle-theme', d: 'download-cv' };
      if (actions[key]) {
        executeAction(actions[key]);
        togglePalette(false);
      }
    }
  });

  palette.addEventListener('click', (e) => {
    const item = e.target.closest('.command-item:not(.result-item)');
    if (item) {
      executeAction(item.dataset.action);
      togglePalette(false);
    } else if (e.target === palette) {
      togglePalette(false);
    }
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
    modal.querySelector('#modal-img').alt = li.dataset.projectTitle;
    modal.querySelector('#modal-title').textContent = li.dataset.projectTitle;
    modal.querySelector('#modal-desc').textContent = li.dataset.projectDesc;
    modal.querySelector('#modal-tech').textContent = li.dataset.projectTech;
    modal.querySelector('#modal-demo').href = li.dataset.projectDemo;
    modal.querySelector('#modal-repo').href = li.dataset.projectRepo;

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  });

  const closeModal = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
};

// === Custom Cursor ===
const initCustomCursor = () => {
  const cursor = document.querySelector('.custom-cursor');
  if (!cursor || window.matchMedia("(pointer: coarse)").matches) {
    if (cursor) cursor.style.display = 'none';
    return;
  }

  let posX = 0, posY = 0, mouseX = 0, mouseY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // Smooth lerp for cursor
  const ticker = () => {
    posX += (mouseX - posX) * 0.15;
    posY += (mouseY - posY) * 0.15;
    cursor.style.transform = `translate(${posX - 10}px, ${posY - 10}px)`;
    requestAnimationFrame(ticker);
  };
  ticker();

  document.querySelectorAll('a, button, input, textarea, .project-card, .btn-filter').forEach(el => {
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
    toggle.innerHTML = theme === 'dark' ? '<span>🌙</span>' : '<span>☀️</span>';
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
        const matches = (filter === 'all' || techs.includes(filter));
        
        project.style.opacity = '0';
        setTimeout(() => {
          project.style.display = matches ? 'flex' : 'none';
          if (matches) setTimeout(() => project.style.opacity = '1', 10);
        }, 300);
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

  // Optimized Mobile Menu
  const menuBtn = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');
  const navLinks = document.querySelectorAll('.nav-list a');

  menuBtn?.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('is-open');
    menuBtn.innerHTML = isOpen ? '✕' : '☰';
    menuBtn.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('is-open');
      menuBtn.innerHTML = '☰';
      document.body.style.overflow = '';
    });
  });
});

