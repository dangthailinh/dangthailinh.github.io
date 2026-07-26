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

  function fetchPosts() {
    return fetch('/data/posts.json?v=' + Math.floor(Date.now() / 60000))
      .then(function (r) { return r.ok ? r.json() : { posts: [] }; })
      .then(function (db) { return (db && Array.isArray(db.posts)) ? db.posts : []; })
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

  /* ═══════════ Khởi chạy ═══════════ */
  function run() {
    var mode = document.body.getAttribute('data-cms-feed');
    /* Dự phòng: đoán theo đường dẫn nếu thuộc tính bị mất */
    if (!mode) {
      if (/\/kienthuc\//.test(location.pathname)) mode = 'kienthuc';
      else if (/\/khoa-hoc0\//.test(location.pathname)) mode = 'khoahoc';
      else return;
    }
    fetchPosts().then(function (posts) {
      if (!posts.length) return;
      try {
        if (mode === 'kienthuc') renderKienthuc(posts);
        else if (mode === 'khoahoc') renderKhoahoc(posts);
      } catch (e) {
        if (window.console) console.warn('[cms] Không chèn được bài mới:', e);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
