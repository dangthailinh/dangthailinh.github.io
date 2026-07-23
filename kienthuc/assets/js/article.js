(() => {
  const articles = window.KNOWLEDGE_ARTICLES || [];
  const categories = window.KNOWLEDGE_CATEGORIES || {};
  const id = document.body.dataset.articleId;
  const current = articles.find((article) => article.id === id);
  const post = document.querySelector('#article-content');
  const tocList = document.querySelector('#article-toc');
  const progress = document.querySelector('.reading-progress span');
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('#main-nav');

  const slugify = (text) => text
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const headings = [...post.querySelectorAll('h2')];
  const usedIds = new Set();
  headings.forEach((heading, index) => {
    let headingId = heading.id || slugify(heading.textContent) || `phan-${index + 1}`;
    const baseId = headingId;
    let suffix = 2;
    while (usedIds.has(headingId)) headingId = `${baseId}-${suffix++}`;
    heading.id = headingId;
    usedIds.add(headingId);

    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${headingId}`;
    link.textContent = heading.textContent;
    item.append(link);
    tocList.append(item);
  });

  if (!headings.length) document.querySelector('.toc-card').hidden = true;

  const words = post.textContent.trim().split(/\s+/).length;
  const readingMinutes = Math.max(1, Math.ceil(words / 220));
  document.querySelectorAll('[data-reading-time]').forEach((node) => {
    node.textContent = `${readingMinutes} phút đọc`;
  });

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const value = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
    progress.style.width = `${value}%`;
  }
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);

  if ('IntersectionObserver' in window && headings.length) {
    const tocLinks = [...tocList.querySelectorAll('a')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
      });
    }, { rootMargin: '-18% 0px -70% 0px' });
    headings.forEach((heading) => observer.observe(heading));
  }

  function createPagerLink(article, direction) {
    const link = document.createElement('a');
    link.className = `pager-link ${direction}`;
    link.href = `../${article.path}`;
    link.innerHTML = direction === 'previous'
      ? `<small>← Bài trước</small><strong>${article.title}</strong>`
      : `<small>Bài tiếp theo →</small><strong>${article.title}</strong>`;
    return link;
  }

  if (current) {
    const cover = document.querySelector('.cover-paper');
    const coverImage = cover?.querySelector('img');
    const markMissingCover = () => {
      cover.dataset.symbol = categories[current.category]?.symbol || '✦';
      cover.classList.add('image-missing');
    };
    if (coverImage) {
      coverImage.addEventListener('error', markMissingCover);
      if (coverImage.complete && !coverImage.naturalWidth) markMissingCover();
    }

    const categoryArticles = articles.filter((article) => article.category === current.category);
    const position = categoryArticles.findIndex((article) => article.id === current.id);
    const pager = document.querySelector('.article-pager');
    if (position > 0) pager.append(createPagerLink(categoryArticles[position - 1], 'previous'));
    else pager.append(document.createElement('span'));
    if (position < categoryArticles.length - 1) pager.append(createPagerLink(categoryArticles[position + 1], 'next'));

    const related = categoryArticles.filter((article) => article.id !== current.id).slice(0, 3);
    const relatedGrid = document.querySelector('.related-grid');
    related.forEach((article) => {
      const link = document.createElement('a');
      link.className = 'related-card';
      link.href = `../${article.path}`;
      link.innerHTML = `<span>${categories[article.category]?.symbol || '✦'}</span><small>${categories[article.category]?.short || article.category} · ${String(article.order).padStart(2, '0')}</small><h3>${article.title}</h3><p>${article.description}</p><b>Đọc bài ↗</b>`;
      relatedGrid.append(link);
    });
    if (!related.length) document.querySelector('.related-section').hidden = true;
  }

  document.querySelectorAll('table').forEach((table) => {
    if (table.parentElement?.classList.contains('table-scroll')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'table-scroll';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.append(table);
  });

  post.querySelectorAll('figure img').forEach((image) => {
    const markMissingImage = () => {
      const figure = image.closest('figure');
      if (!figure || figure.classList.contains('image-missing')) return;
      figure.classList.add('image-missing');
      image.hidden = true;
      const notice = document.createElement('div');
      notice.className = 'image-placeholder';
      notice.innerHTML = '<span aria-hidden="true">⌁</span><p>Hình minh họa tạm thời không khả dụng</p>';
      figure.prepend(notice);
    };
    image.addEventListener('error', markMissingImage);
    if (image.complete && !image.naturalWidth) markMissingImage();
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
})();
