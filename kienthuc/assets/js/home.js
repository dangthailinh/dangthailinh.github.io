(() => {
  const searchInput = document.querySelector('#knowledge-search');
  const searchShell = document.querySelector('.search-shell');
  const clearButton = document.querySelector('.clear-search');
  const resetButton = document.querySelector('#reset-search');
  const cards = [...document.querySelectorAll('.article-card')];
  const sections = [...document.querySelectorAll('.topic-section')];
  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const emptyState = document.querySelector('.empty-state');
  const visibleCount = document.querySelector('#visible-count');
  const resultTitle = document.querySelector('#result-title');
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('#main-nav');

  const categoryNames = {
    all: 'Tất cả ghi chép',
    devops: 'DevOps căn bản',
    aws: 'AWS & dịch vụ Cloud',
    ai: 'AI & Machine Learning',
    programming: 'Lập trình từ nền tảng',
    web: 'Web & hiệu năng'
  };

  let activeCategory = 'all';

  const normalize = (value) => value
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();

  cards.forEach((card) => {
    card.dataset.search = normalize(`${card.textContent} ${card.dataset.tags || ''}`);
  });

  function updateFilters() {
    const query = normalize(searchInput.value);
    let count = 0;

    sections.forEach((section) => {
      const categoryMatches = activeCategory === 'all' || section.dataset.category === activeCategory;
      let sectionMatches = 0;

      section.querySelectorAll('.article-card').forEach((card) => {
        const matches = categoryMatches && (!query || card.dataset.search.includes(query));
        card.hidden = !matches;
        if (matches) {
          sectionMatches += 1;
          count += 1;
        }
      });

      section.hidden = sectionMatches === 0;
      const counter = section.querySelector('.topic-heading > span');
      if (counter && query) counter.textContent = `${sectionMatches} bài phù hợp`;
      else if (counter) counter.textContent = `${section.querySelectorAll('.article-card').length} bài`;
    });

    visibleCount.textContent = count;
    emptyState.hidden = count !== 0;
    searchShell.classList.toggle('has-value', searchInput.value.length > 0);
    resultTitle.textContent = query ? `Kết quả cho “${searchInput.value.trim()}”` : categoryNames[activeCategory];
  }

  function setCategory(category) {
    activeCategory = category;
    filterButtons.forEach((button) => {
      const selected = button.dataset.filter === category;
      button.classList.toggle('active', selected);
      if (button.classList.contains('filter-chip')) button.setAttribute('aria-pressed', String(selected));
    });
    updateFilters();
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => setCategory(button.dataset.filter));
  });

  searchInput.addEventListener('input', updateFilters);
  clearButton.addEventListener('click', () => {
    searchInput.value = '';
    updateFilters();
    searchInput.focus();
  });
  resetButton.addEventListener('click', () => {
    searchInput.value = '';
    setCategory('all');
    searchInput.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && document.activeElement !== searchInput) {
      event.preventDefault();
      searchInput.focus();
    }
    if (event.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      updateFilters();
      searchInput.blur();
    }
  });

  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.querySelector('#current-year').textContent = new Date().getFullYear();

  const requestedCategory = new URLSearchParams(window.location.search).get('category');
  setCategory(categoryNames[requestedCategory] ? requestedCategory : 'all');
})();
