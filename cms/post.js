/* ══════════════════════════════════════════════════════════════
   cms/post.js — chạy trên các trang bài viết do bảng quản trị sinh ra.
   • Kiến thức: bổ sung phần "Bài trước / Bài tiếp" và "Cùng chủ đề"
     (article.js gốc chỉ biết các bài tĩnh trong knowledge-data.js).
   • Khoa học: dựng mục lục, thanh tiến độ đọc, thời gian đọc, bài liên quan.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var mode = document.body.getAttribute('data-cms-post');
  if (!mode) return;

  var id = document.body.getAttribute('data-article-id');
  var category = document.body.getAttribute('data-category');
  var post = document.querySelector('#article-content');
  var COMBINING = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36F) + ']', 'g');

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function slugify(text) {
    return String(text || '')
      .toLocaleLowerCase('vi')
      .normalize('NFD').replace(COMBINING, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /* ─────────── Phần dùng chung cho mục Khoa học ─────────── */
  function buildToc() {
    var tocList = document.querySelector('#article-toc');
    if (!tocList || !post) return 0;
    var headings = Array.prototype.slice.call(post.querySelectorAll('h2'));
    var used = {};
    headings.forEach(function (h, i) {
      var hid = h.id || slugify(h.textContent) || ('phan-' + (i + 1));
      var base = hid, n = 2;
      while (used[hid]) hid = base + '-' + (n++);
      used[hid] = true;
      h.id = hid;
      var li = document.createElement('li');
      li.innerHTML = '<a href="#' + hid + '">' + esc(h.textContent) + '</a>';
      tocList.appendChild(li);
    });
    if (!headings.length) {
      var card = document.querySelector('.sci-toc');
      if (card) card.hidden = true;
    }
    return headings.length;
  }

  function readingTime() {
    if (!post) return;
    var words = post.textContent.trim().split(/\s+/).length;
    var minutes = Math.max(1, Math.ceil(words / 220));
    document.querySelectorAll('[data-reading-time]').forEach(function (n) {
      n.textContent = minutes + ' phút đọc';
    });
  }

  function progressBar() {
    var bar = document.querySelector('.reading-progress span');
    if (!bar) return;
    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var v = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
      bar.style.width = v + '%';
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }

  function wrapTables() {
    if (!post) return;
    post.querySelectorAll('table').forEach(function (t) {
      if (t.parentElement && t.parentElement.classList.contains('table-scroll')) return;
      var w = document.createElement('div');
      w.className = 'table-scroll';
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });
  }

  function year() {
    var el = document.querySelector('#current-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ─────────── Bài trước / tiếp / liên quan ─────────── */
  function linkPosts(posts) {
    var same = posts
      .filter(function (p) { return p.section === mode; })
      .filter(function (p) { return p.category === category; })
      .sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });

    var pos = -1;
    same.forEach(function (p, i) { if (p.id === id) pos = i; });

    var pager = document.querySelector('.article-pager') || document.querySelector('.sci-pager');
    if (pager && pos >= 0) {
      pager.innerHTML = '';
      if (pos > 0) pager.appendChild(pagerLink(same[pos - 1], 'previous'));
      else pager.appendChild(document.createElement('span'));
      if (pos < same.length - 1) pager.appendChild(pagerLink(same[pos + 1], 'next'));
    }

    var grid = document.querySelector('.related-grid');
    var related = same.filter(function (p) { return p.id !== id; }).slice(-3).reverse();

    /* Nếu chưa đủ 3 bài cùng chủ đề, lấy thêm bài mới nhất cùng mục */
    if (related.length < 3) {
      posts.filter(function (p) {
        return p.section === mode && p.id !== id;
      }).slice(0, 6).forEach(function (p) {
        if (related.length >= 3) return;
        if (related.some(function (r) { return r.id === p.id; })) return;
        related.push(p);
      });
    }

    var CARD_CLASS = { khoahoc: 'sci-related-card', blog: 'log-related-card', kienthuc: 'related-card' };

    if (grid && related.length) {
      related.forEach(function (p) {
        var a = document.createElement('a');
        a.className = CARD_CLASS[mode] || 'related-card';
        a.href = p.url;
        if (mode === 'khoahoc') {
          a.innerHTML = '<img src="' + esc(p.cover) + '" alt="" loading="lazy"><h3>' + esc(p.title) + '</h3><p>' + esc(p.description) + '</p>';
        } else if (mode === 'blog') {
          a.innerHTML = (p.cover ? '<img src="' + esc(p.cover) + '" alt="" loading="lazy">' : '') +
            '<h3>' + esc(p.title) + '</h3><p>' + esc(p.description) + '</p>';
        } else {
          a.innerHTML = '<span>✦</span><small>Bài mới</small><h3>' + esc(p.title) + '</h3><p>' + esc(p.description) + '</p><b>Đọc bài ↗</b>';
        }
        grid.appendChild(a);
      });
    } else if (grid) {
      var section = grid.closest('.related-section') || grid.closest('.sci-related') || grid.closest('.log-related');
      if (section) section.hidden = true;
    }
  }

  function pagerLink(p, dir) {
    var a = document.createElement('a');
    a.className = 'pager-link ' + dir;
    a.href = p.url;
    a.innerHTML = dir === 'previous'
      ? '<small>← Bài trước</small><strong>' + esc(p.title) + '</strong>'
      : '<small>Bài tiếp theo →</small><strong>' + esc(p.title) + '</strong>';
    return a;
  }

  /* ─────────── Chạy ─────────── */
  function run() {
    /* Trang Kiến thức đã có article.js lo phần này; hai mục còn lại tự dựng. */
    if (mode === 'khoahoc' || mode === 'blog') {
      buildToc();
      readingTime();
      progressBar();
      wrapTables();
      year();
    }
    fetch('/data/posts.json?v=' + Math.floor(Date.now() / 60000))
      .then(function (r) { return r.ok ? r.json() : { posts: [] }; })
      .then(function (db) {
        var posts = (db && Array.isArray(db.posts)) ? db.posts : [];
        if (posts.length) linkPosts(posts);
      })
      .catch(function () { /* offline thì bỏ qua */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
