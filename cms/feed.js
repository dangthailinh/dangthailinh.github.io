/* ══════════════════════════════════════════════════════════════
   cms/feed.js — chèn bài viết mới (từ /data/posts.json) vào
   trang danh sách của mục Kiến thức và Khoa học.
   Không sửa gì của giao diện cũ; chỉ thêm thẻ bài vào đúng chỗ.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var COMBINING = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36F) + ']', 'g');

  function normalize(value) {
    return String(value || '')
      .toLocaleLowerCase('vi')
      .normalize('NFD').replace(COMBINING, '')
      .replace(/đ/g, 'd')
      .trim();
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function prettyDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return iso || '';
    var names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return names[parseInt(m[2], 10) - 1] + ' ' + parseInt(m[3], 10) + ', ' + m[1];
  }

  /* Bài chỉ được hiện khi đã đăng, hoặc hẹn đăng và đã tới ngày.
     Bản nháp không bao giờ lọt ra ngoài. */
  function isLive(p) {
    var status = p.status || 'published';
    if (status === 'draft') return false;
    if (status === 'scheduled') {
      return String(p.date || '') <= new Date().toISOString().slice(0, 10);
    }
    return true;
  }

  function fetchPosts() {
    return fetch('/data/posts.json?v=' + Math.floor(Date.now() / 60000))
      .then(function (r) { return r.ok ? r.json() : { posts: [] }; })
      .then(function (db) { return (db && Array.isArray(db.posts)) ? db.posts.filter(isLive) : []; })
      .catch(function () { return []; });
  }

  /* Thêm nút lọc + mục lục bên trái cho chủ đề mới xuất hiện */
  function addFilterControls(cat, meta) {
    var chipBar = document.querySelector('.quick-categories');
    if (chipBar && !chipBar.querySelector('[data-filter="' + cat + '"]')) {
      var chip = document.createElement('button');
      chip.className = 'filter-chip';
      chip.type = 'button';
      chip.setAttribute('data-filter', cat);
      chip.setAttribute('aria-pressed', 'false');
      chip.innerHTML = '<span class="chip-icon">' + meta.symbol + '</span><span>' + esc(meta.label) + '</span><small>0</small>';
      chipBar.appendChild(chip);
      bindFilter(chip, cat);
    }
    var nav = document.querySelector('.index-card nav');
    if (nav && !nav.querySelector('[data-filter="' + cat + '"]')) {
      var link = document.createElement('button');
      link.className = 'index-link';
      link.type = 'button';
      link.setAttribute('data-filter', cat);
      link.innerHTML = '<span><i class="dot ' + cat + '"></i>' + esc(meta.label) + '</span><b>0</b>';
      nav.appendChild(link);
      bindFilter(link, cat);
    }
  }

  /* home.js đã chạy trước nên nút mới cần tự gắn hành vi lọc */
  function bindFilter(button, cat) {
    button.addEventListener('click', function () {
      document.querySelectorAll('[data-filter]').forEach(function (b) {
        var on = b.dataset.filter === cat;
        b.classList.toggle('active', on);
        if (b.classList.contains('filter-chip')) b.setAttribute('aria-pressed', String(on));
      });
      document.querySelectorAll('.topic-section').forEach(function (sec) {
        sec.hidden = sec.dataset.category !== cat;
      });
      var title = document.querySelector('#result-title');
      if (title) title.textContent = button.textContent.replace(/\d+$/, '').trim();
      var count = document.querySelector('#visible-count');
      var shown = document.querySelector('.topic-section[data-category="' + cat + '"]');
      if (count && shown) count.textContent = shown.querySelectorAll('.article-card').length;
    });
  }

  /* ═══════════ MỤC KIẾN THỨC ═══════════ */
  function renderKienthuc(posts) {
    var list = posts.filter(function (p) { return p.section === 'kienthuc'; });
    if (!list.length) return;

    var content = document.querySelector('.library-content');
    if (!content) return;

    var LABELS = {
      devops:      { label: 'DevOps căn bản',        index: '01', symbol: '⌁' },
      aws:         { label: 'AWS & dịch vụ Cloud',   index: '02', symbol: '☁' },
      ai:          { label: 'AI & Machine Learning', index: '03', symbol: '✺' },
      programming: { label: 'Lập trình từ nền tảng', index: '04', symbol: '{ }' },
      web:         { label: 'Web & hiệu năng',       index: '05', symbol: '◎' },
      khac:        { label: 'Ghi chép khác',         index: '06', symbol: '✦' }
    };

    /* Nhóm bài mới theo chủ đề */
    var byCat = {};
    list.forEach(function (p) {
      var c = LABELS[p.category] ? p.category : 'khac';
      (byCat[c] = byCat[c] || []).push(p);
    });

    Object.keys(byCat).forEach(function (cat) {
      var section = content.querySelector('.topic-section[data-category="' + cat + '"]');

      /* Chưa có mục này trên trang → tạo mục mới kèm nút lọc */
      if (!section) {
        var meta = LABELS[cat];
        section = document.createElement('section');
        section.className = 'topic-section';
        section.setAttribute('data-category', cat);
        section.innerHTML =
          '<header class="topic-heading">' +
            '<div class="topic-symbol ' + cat + '">' + meta.symbol + '</div>' +
            '<div><p>' + meta.index + ' · Mới</p><h3>' + esc(meta.label) + '</h3></div>' +
            '<span>0 bài</span>' +
          '</header><div class="article-grid"></div>';
        content.appendChild(section);
        addFilterControls(cat, meta);
      }

      var grid = section.querySelector('.article-grid');
      if (!grid) return;
      var offset = grid.querySelectorAll('.article-card').length;

      byCat[cat].forEach(function (p, i) {
        if (grid.querySelector('[href="' + p.url + '"]')) return;
        var card = document.createElement('a');
        card.className = 'article-card';
        card.href = p.url;
        card.setAttribute('data-tags', (p.tags || []).join(' ').toLowerCase());
        card.setAttribute('data-cms', '1');
        card.innerHTML =
          '<span class="article-number">' + String(offset + i + 1).padStart(2, '0') + '</span>' +
          '<div><h4>' + esc(p.title) + '</h4><p>' + esc(p.description) + '</p><ul>' +
          (p.tags || []).slice(0, 3).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') +
          '</ul></div><span class="arrow">↗</span>';
        card.dataset.search = normalize(card.textContent + ' ' + (p.tags || []).join(' '));
        grid.appendChild(card);
      });
    });

    /* Cập nhật lại các con số đếm trên giao diện */
    var total = 0;
    document.querySelectorAll('.topic-section').forEach(function (sec) {
      var n = sec.querySelectorAll('.article-card').length;
      total += n;
      var cat = sec.dataset.category;
      var counter = sec.querySelector('.topic-heading > span');
      if (counter) counter.textContent = n + ' bài';
      var chip = document.querySelector('.filter-chip[data-filter="' + cat + '"] small');
      if (chip) chip.textContent = n;
      var link = document.querySelector('.index-link[data-filter="' + cat + '"] b');
      if (link) link.textContent = n;
    });
    var allChip = document.querySelector('.filter-chip[data-filter="all"] small');
    if (allChip) allChip.textContent = total;
    var allLink = document.querySelector('.index-link[data-filter="all"] b');
    if (allLink) allLink.textContent = total;
    var visible = document.querySelector('#visible-count');
    if (visible) visible.textContent = total;
    var note = document.querySelector('.note-footer span');
    if (note) note.textContent = total + ' bài ghi chép';

    /* Bắt home.js tính lại bộ lọc */
    var search = document.querySelector('#knowledge-search');
    if (search) search.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /* ═══════════ MỤC KHOA HỌC ═══════════ */
  function renderKhoahoc(posts) {
    var list = posts.filter(function (p) { return p.section === 'khoahoc'; });
    if (!list.length) return;

    var grid = document.querySelector('.card-grid');
    if (!grid) return;

    var CAT = {
      'vu-tru': 'Vũ trụ', 'luong-tu': 'Lượng tử', 'sinh-hoc': 'Sinh học',
      'cong-nghe': 'Công nghệ', 'bi-an': 'Bí ẩn', 'khac': 'Khoa học'
    };

    /* Bài mới nhất lên đầu trang 1 */
    list.slice().reverse().forEach(function (p) {
      if (grid.querySelector('[href="' + p.url + '"]')) return;
      var a = document.createElement('a');
      a.href = p.url;
      a.className = 'card-link';
      a.setAttribute('data-cms', '1');
      a.innerHTML =
        '<div class="card">' +
          '<img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" class="card-img" loading="lazy">' +
          '<h3>' + esc(p.title) + '</h3>' +
          '<div class="card-meta">' + esc(prettyDate(p.date)) + ' | ' + esc(CAT[p.category] || 'Khoa học') + '</div>' +
        '</div>';
      grid.insertBefore(a, grid.firstChild);
    });
  }

  /* ═══════════ MỤC GAME ═══════════
     Thẻ: .card-grid > a.card-link > div.card > img.card-img + h3 + .card-meta */
  function renderGame(posts) {
    var grid = document.querySelector('.card-grid');
    if (!grid) return;
    var CAT = {
      review: 'Review', guide: 'Hướng dẫn', news: 'Tin tức',
      ranking: 'Xếp hạng', indie: 'Indie', khac: 'Game'
    };
    posts.filter(bySection('game')).slice().reverse().forEach(function (p) {
      if (grid.querySelector('[href="' + p.url + '"]')) return;
      var a = document.createElement('a');
      a.href = p.url;
      a.className = 'card-link';
      a.setAttribute('data-cms', '1');
      a.innerHTML =
        '<div class="card">' +
          '<img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" class="card-img" loading="lazy">' +
          '<h3>' + esc(p.title) + '</h3>' +
          '<div class="card-meta">' + esc(prettyDate(p.date)) + ' | ' + esc(CAT[p.category] || 'Game') + '</div>' +
        '</div>';
      grid.insertBefore(a, grid.firstChild);
    });
  }

  /* ═══════════ MỤC MANGA ═══════════
     Thẻ: .card-grid > a.card-link > article.card > img + .genre-tags + h3 + .card-meta */
  function renderManga(posts) {
    var grid = document.querySelector('.card-grid');
    if (!grid) return;
    var CAT = {
      review: 'Review', character: 'Nhân vật', theory: 'Giả thuyết',
      seinen: 'Seinen', shonen: 'Shonen', khac: 'Manga'
    };
    posts.filter(bySection('manga')).slice().reverse().forEach(function (p) {
      if (grid.querySelector('[href="' + p.url + '"]')) return;
      var tags = (p.tags || []).slice(0, 3)
        .map(function (t) { return '<span class="genre-tag">' + esc(t) + '</span>'; }).join('');
      var a = document.createElement('a');
      a.href = p.url;
      a.className = 'card-link';
      a.setAttribute('data-cms', '1');
      a.innerHTML =
        '<article class="card">' +
          '<img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" class="card-img" loading="lazy">' +
          (tags ? '<div class="genre-tags">' + tags + '</div>' : '') +
          '<h3>' + esc(p.title) + '</h3>' +
          '<div class="card-meta">' + esc(prettyDate(p.date)) + ' | ' + esc(CAT[p.category] || 'Manga') + '</div>' +
        '</article>';
      grid.insertBefore(a, grid.firstChild);
    });
  }

  /* ═══════════ MỤC NGHỆ THUẬT ═══════════
     Thẻ: .gallery-grid > article.gallery-item > img + h3 + p + a */
  function renderNghethuat(posts) {
    var grid = document.querySelector('.gallery-grid');
    if (!grid) return;
    posts.filter(bySection('nghethuat')).slice().reverse().forEach(function (p) {
      if (grid.querySelector('[href="' + p.url + '"]')) return;
      var item = document.createElement('article');
      item.className = 'gallery-item';
      item.setAttribute('data-cms', '1');
      item.innerHTML =
        '<img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" loading="lazy">' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p>' + esc(p.description) + '</p>' +
        '<a href="' + esc(p.url) + '">Xem Chi Tiết →</a>';
      grid.insertBefore(item, grid.firstChild);
    });
  }

  /* ═══════════ MỤC PHIM ═══════════
     Thẻ: [data-movie-grid] > article.movie-card (có data-category, data-searchable) */
  function renderPhim(posts) {
    var grid = document.querySelector('[data-movie-grid]');
    if (!grid) return;
    var CAT = {
      analysis: 'Phân tích', review: 'Review', list: 'Tuyển chọn',
      character: 'Nhân vật', essay: 'Tiểu luận', khac: 'Phim'
    };
    var added = 0;

    posts.filter(bySection('phim')).slice().reverse().forEach(function (p) {
      if (grid.querySelector('a[href="' + p.url + '"]')) return;
      var article = document.createElement('article');
      article.className = 'movie-card';
      article.setAttribute('data-cms', '1');
      /* Giữ đúng thuộc tính mà bộ lọc sẵn có của trang Phim đang dùng */
      article.setAttribute('data-category', p.category || 'analysis');
      article.setAttribute('data-searchable',
        normalize([p.title, p.description, (p.tags || []).join(' ')].join(' ')));
      article.innerHTML =
        '<a class="poster" href="' + esc(p.url) + '" aria-label="Đọc ' + esc(p.title) + '">' +
          '<span class="poster-index">Mới</span>' +
          '<img src="' + esc(p.cover) + '" alt="' + esc(p.title) + '" loading="lazy">' +
        '</a>' +
        '<div class="card-body">' +
          '<div class="card-topline"><span>' + esc(CAT[p.category] || 'Phim') + ' · ' + esc(prettyDate(p.date)) + '</span></div>' +
          '<h3><a href="' + esc(p.url) + '">' + esc(p.title) + '</a></h3>' +
          '<p>' + esc(p.description) + '</p>' +
          '<a class="card-link" href="' + esc(p.url) + '">Đọc bài <span>↗</span></a>' +
        '</div>';
      grid.insertBefore(article, grid.firstChild);
      added++;
    });

    /* Cập nhật lại con số "Đang hiển thị N bài viết" của trang Phim */
    if (added) {
      var counter = document.querySelector('[data-result-count]');
      if (counter) {
        var total = grid.querySelectorAll('.movie-card').length;
        counter.textContent = 'Đang hiển thị ' + total + ' bài viết';
      }
    }
  }

  function bySection(name) {
    return function (p) { return p.section === name; };
  }

  /* ═══════════ Khởi chạy ═══════════ */
  var RENDERERS = {
    kienthuc: renderKienthuc,
    khoahoc: renderKhoahoc,
    game: renderGame,
    manga: renderManga,
    nghethuat: renderNghethuat,
    phim: renderPhim
  };

  function guessMode() {
    var path = location.pathname;
    if (/\/kienthuc\//.test(path)) return 'kienthuc';
    if (/\/khoa-hoc0\//.test(path)) return 'khoahoc';
    if (/\/game0\//.test(path)) return 'game';
    if (/\/manga0\//.test(path)) return 'manga';
    if (/\/nghe-thuat0\//.test(path)) return 'nghethuat';
    if (/\/phim0\//.test(path)) return 'phim';
    return '';
  }

  function run() {
    var mode = document.body.getAttribute('data-cms-feed') || guessMode();
    if (!RENDERERS[mode]) return;
    fetchPosts().then(function (posts) {
      if (!posts.length) return;
      try {
        RENDERERS[mode](posts);
      } catch (e) {
        if (window.console) console.warn('[cms] Không chèn được bài mới:', e);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
