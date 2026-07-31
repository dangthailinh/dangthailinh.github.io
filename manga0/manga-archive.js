(function () {
  'use strict';

  var PAGE_SIZE = 9;
  var archive = document.querySelector('[data-manga-archive]');
  var pagination = document.querySelector('[data-manga-pagination]');
  if (!archive || !pagination) return;

  var primaryGrid = archive.querySelector('[data-manga-archive-grid]');
  Array.prototype.forEach.call(
    archive.querySelectorAll('.collection-section'),
    function (section, index) {
      if (index === 0 || !primaryGrid) return;
      Array.prototype.forEach.call(section.querySelectorAll('.card-grid > .card-link'), function (link) {
        primaryGrid.appendChild(link);
      });
      section.remove();
    }
  );

  var previousButton = pagination.querySelector('[data-manga-prev]');
  var nextButton = pagination.querySelector('[data-manga-next]');
  var viewport = pagination.querySelector('[data-manga-page-viewport]');
  var track = pagination.querySelector('[data-manga-page-track]');
  var status = pagination.querySelector('[data-manga-page-status]');
  var currentPage = readPageFromUrl();
  var totalPages = 1;
  var refreshFrame = 0;

  function readPageFromUrl() {
    var value = parseInt(new URL(location.href).searchParams.get('page'), 10);
    return Number.isFinite(value) && value > 0 ? value : 1;
  }

  function getCards() {
    return Array.prototype.slice.call(
      archive.querySelectorAll('.card-grid > .card-link')
    );
  }

  function formatNumber(value) {
    return String(value).padStart(2, '0');
  }

  function updateUrl(mode) {
    var url = new URL(location.href);
    if (currentPage === 1) url.searchParams.delete('page');
    else url.searchParams.set('page', String(currentPage));
    history[mode === 'push' ? 'pushState' : 'replaceState'](
      { mangaPage: currentPage },
      '',
      url.pathname + url.search + url.hash
    );
  }

  function setText(selector, value) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (node) {
      node.textContent = value;
    });
  }

  function updateSections() {
    Array.prototype.forEach.call(
      archive.querySelectorAll('.collection-section'),
      function (section) {
        section.hidden = !section.querySelector('.card-link:not([hidden])');
      }
    );
  }

  function centerActiveButton() {
    var active = track.querySelector('[aria-current="page"]');
    if (!active || !viewport) return;
    var target = active.offsetLeft - ((viewport.clientWidth - active.offsetWidth) / 2);
    viewport.scrollTo({
      left: Math.max(0, target),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  }

  function renderButtons() {
    var fragment = document.createDocumentFragment();
    for (var page = 1; page <= totalPages; page += 1) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'page-switcher__page';
      button.textContent = formatNumber(page);
      button.setAttribute('aria-label', 'Mở trang Manga ' + page);
      button.setAttribute('data-manga-page', String(page));
      if (page === currentPage) {
        button.classList.add('active');
        button.setAttribute('aria-current', 'page');
      }
      fragment.appendChild(button);
    }
    track.replaceChildren(fragment);
    requestAnimationFrame(centerActiveButton);
  }

  function render(options) {
    options = options || {};
    var cards = getCards();
    var requestedPage = currentPage;
    totalPages = Math.max(1, Math.ceil(cards.length / PAGE_SIZE));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);

    var first = (currentPage - 1) * PAGE_SIZE;
    var last = first + PAGE_SIZE;
    cards.forEach(function (link, index) {
      var isVisible = index >= first && index < last;
      link.hidden = !isVisible;
      link.setAttribute('data-page', String(Math.floor(index / PAGE_SIZE) + 1));
      link.setAttribute('data-page-position', String((index % PAGE_SIZE) + 1));
      var card = link.querySelector('.card');
      if (card) card.setAttribute('data-index', formatNumber((index % PAGE_SIZE) + 1));
      if (isVisible && options.animate) {
        link.classList.remove('is-page-entering');
        void link.offsetWidth;
        link.classList.add('is-page-entering');
      }
    });

    updateSections();
    renderButtons();

    previousButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    var visibleCount = Math.max(0, Math.min(PAGE_SIZE, cards.length - first));
    setText('[data-manga-current-page]', formatNumber(currentPage));
    setText('[data-manga-total-pages]', formatNumber(totalPages));
    setText('[data-manga-entry-count]', visibleCount + ' ENTRIES');
    status.textContent = 'Trang Manga ' + currentPage + ' trên ' + totalPages +
      ', hiển thị ' + visibleCount + ' trong tổng số ' + cards.length + ' bài.';

    if (!(options.deferInvalidUrl && requestedPage > totalPages)) {
      updateUrl(options.historyMode || 'replace');
    }
    if (options.scroll) {
      archive.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }
  }

  function goToPage(page) {
    var nextPage = Math.min(Math.max(1, page), totalPages);
    if (nextPage === currentPage) return;
    currentPage = nextPage;
    render({ historyMode: 'push', scroll: true, animate: true });
  }

  pagination.addEventListener('click', function (event) {
    var pageButton = event.target.closest('[data-manga-page]');
    if (pageButton) {
      goToPage(parseInt(pageButton.getAttribute('data-manga-page'), 10));
      return;
    }
    if (event.target.closest('[data-manga-prev]')) goToPage(currentPage - 1);
    if (event.target.closest('[data-manga-next]')) goToPage(currentPage + 1);
  });

  window.addEventListener('popstate', function () {
    currentPage = readPageFromUrl();
    render({ historyMode: 'replace', animate: true });
  });

  function scheduleRefresh() {
    cancelAnimationFrame(refreshFrame);
    refreshFrame = requestAnimationFrame(function () {
      render({ historyMode: 'replace' });
    });
  }

  document.addEventListener('cms:feed-updated', function (event) {
    if (!event.detail || event.detail.section === 'manga') {
      currentPage = readPageFromUrl();
      scheduleRefresh();
    }
  });

  var gridObserver = new MutationObserver(scheduleRefresh);
  Array.prototype.forEach.call(archive.querySelectorAll('.card-grid'), function (grid) {
    gridObserver.observe(grid, { childList: true });
  });

  render({ historyMode: 'replace', deferInvalidUrl: true });
}());
