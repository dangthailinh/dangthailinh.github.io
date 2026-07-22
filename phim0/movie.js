(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');
  const search = document.querySelector('[data-search]');
  const cards = [...document.querySelectorAll('.movie-card')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const resultCount = document.querySelector('[data-result-count]');
  const emptyState = document.querySelector('[data-empty]');
  const resetButton = document.querySelector('[data-reset]');
  const savedCount = document.querySelector('[data-saved-count]');
  const savedToggle = document.querySelector('[data-show-saved]');
  const saveButtons = [...document.querySelectorAll('[data-save]')];

  let activeFilter = 'all';
  let showSavedOnly = false;
  let saved = new Set();

  try {
    saved = new Set(JSON.parse(localStorage.getItem('linh-movie-saved') || '[]'));
  } catch (_) {
    saved = new Set();
  }

  const normalize = (value) => value
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  const closeMenu = () => {
    if (!menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  };

  menuButton?.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    menu.classList.toggle('is-open', willOpen);
  });

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => {
    if (window.innerWidth > 820) closeMenu();
  });

  const updateSavedUI = () => {
    saveButtons.forEach((button) => {
      const isSaved = saved.has(button.dataset.save);
      button.classList.toggle('is-saved', isSaved);
      button.setAttribute('aria-pressed', String(isSaved));
      button.querySelector('span').textContent = isSaved ? '♥' : '♡';
    });
    savedCount.textContent = saved.size;
  };

  const updateResults = () => {
    const query = normalize(search.value);
    let visible = 0;

    cards.forEach((card) => {
      const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
      const matchesSearch = !query || normalize(card.dataset.searchable).includes(query);
      const saveId = card.querySelector('[data-save]')?.dataset.save;
      const matchesSaved = !showSavedOnly || saved.has(saveId);
      const shouldShow = matchesFilter && matchesSearch && matchesSaved;
      card.hidden = !shouldShow;
      if (shouldShow) visible += 1;
    });

    resultCount.textContent = `Đang hiển thị ${visible} bài viết`;
    emptyState.hidden = visible !== 0;
  };

  filters.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter;
      filters.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
      updateResults();
    });
  });

  search?.addEventListener('input', updateResults);

  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    if (event.key === '/' && !isTyping) {
      event.preventDefault();
      search.focus();
    }
    if (event.key === 'Escape') {
      search.blur();
      closeMenu();
    }
  });

  saveButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.save;
      saved.has(id) ? saved.delete(id) : saved.add(id);
      try {
        localStorage.setItem('linh-movie-saved', JSON.stringify([...saved]));
      } catch (_) {
        // The interface remains usable even when local storage is unavailable.
      }
      updateSavedUI();
      updateResults();
    });
  });

  savedToggle?.addEventListener('click', () => {
    showSavedOnly = !showSavedOnly;
    savedToggle.classList.toggle('is-active', showSavedOnly);
    savedToggle.setAttribute('aria-pressed', String(showSavedOnly));
    updateResults();
  });

  resetButton?.addEventListener('click', () => {
    activeFilter = 'all';
    showSavedOnly = false;
    search.value = '';
    filters.forEach((button) => {
      const isActive = button.dataset.filter === 'all';
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
    savedToggle.classList.remove('is-active');
    savedToggle.setAttribute('aria-pressed', 'false');
    updateResults();
  });

  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  updateSavedUI();
  updateResults();
})();
