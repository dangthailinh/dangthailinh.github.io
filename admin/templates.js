/* ══════════════════════════════════════════════════════════════
   templates.js — sinh mã HTML cho bài viết mới
   Dùng chung bởi admin.js. Không phụ thuộc thư viện ngoài.
   ══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* Danh mục của mục "Kiến thức" — khớp với kienthuc/assets/js/knowledge-data.js */
  var KNOWLEDGE_CATEGORIES = {
    devops:      { label: 'DevOps căn bản',        short: 'DevOps',    index: '01', symbol: '⌁' },
    aws:         { label: 'AWS & dịch vụ Cloud',   short: 'AWS Cloud', index: '02', symbol: '☁' },
    ai:          { label: 'AI & Machine Learning', short: 'AI',        index: '03', symbol: '✺' },
    programming: { label: 'Lập trình từ nền tảng', short: 'Lập trình', index: '04', symbol: '{ }' },
    web:         { label: 'Web & hiệu năng',       short: 'Web',       index: '05', symbol: '◎' },
    khac:        { label: 'Ghi chép khác',         short: 'Khác',      index: '06', symbol: '✦' }
  };

  /* Danh mục của mục "Blog" — khớp CATEGORY_LABELS trong blog/blog.js */
  var BLOG_CATEGORIES = {
    life:    { label: 'Đời sống', symbol: '☕' },
    photo:   { label: 'Ảnh',      symbol: '✿' },
    video:   { label: 'Video',    symbol: '▶' },
    thought: { label: 'Suy nghĩ', symbol: '✎' }
  };

  /* Danh mục của mục "Khoa học" */
  var SCIENCE_CATEGORIES = {
    'vu-tru':    { label: 'Vũ trụ & Thiên văn', symbol: '🌌' },
    'luong-tu':  { label: 'Vật lý & Lượng tử',  symbol: '⚛️' },
    'sinh-hoc':  { label: 'Sinh học & Sự sống', symbol: '🧬' },
    'cong-nghe': { label: 'Công nghệ & AI',     symbol: '🤖' },
    'bi-an':     { label: 'Bí ẩn & Fact',       symbol: '🔍' },
    'khac':      { label: 'Khoa học khác',      symbol: '🔬' }
  };

  /* ─────────── Tiện ích ─────────── */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* Dải dấu thanh tiếng Việt (combining marks) — viết bằng mã số cho an toàn encoding */
  var COMBINING = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36F) + ']', 'g');

  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .normalize('NFD').replace(COMBINING, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 70);
  }

  /* "2026-07-26" → "Jul 26, 2026" */
  function prettyDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    if (!m) return iso || '';
    var names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return names[parseInt(m[2], 10) - 1] + ' ' + parseInt(m[3], 10) + ', ' + m[1];
  }

  var DEFAULT_COVER_KT = 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=70';
  var DEFAULT_COVER_KH = 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=70';

  /* ═══════════ Bài viết mục KIẾN THỨC ═══════════
     Đường dẫn: /kienthuc/articles/blog/<slug>.html
     Dùng lại đúng CSS/JS sẵn có của khu vực Kiến thức. */
  function kienthucArticle(p) {
    var cat = KNOWLEDGE_CATEGORIES[p.category] || KNOWLEDGE_CATEGORIES.khac;
    var cover = p.cover || DEFAULT_COVER_KT;
    var tagList = (p.tags || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');

    return '<!doctype html>\n' +
'<html lang="vi">\n' +
'<head>\n' +
'  <meta charset="utf-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
'  <meta name="description" content="' + esc(p.description) + '">\n' +
'  <meta name="theme-color" content="#f4efe4">\n' +
'  <meta property="og:type" content="article">\n' +
'  <meta property="og:title" content="' + esc(p.title) + '">\n' +
'  <meta property="og:description" content="' + esc(p.description) + '">\n' +
'  <meta property="og:image" content="' + esc(cover) + '">\n' +
'  <title>' + esc(p.title) + ' — Thư viện kiến thức</title>\n' +
'  <link rel="icon" type="image/png" href="/favicon.png?v=2">\n' +
'  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Lora:ital,wght@0,600;1,500&display=swap" rel="stylesheet">\n' +
'  <link rel="stylesheet" href="/kienthuc/assets/css/article.css">\n' +
'  <script src="/kienthuc/assets/js/knowledge-data.js" defer></script>\n' +
'  <script src="/kienthuc/assets/js/article.js" defer></script>\n' +
'  <script src="/cms/post.js" defer></script>\n' +
'</head>\n' +
'<body data-article-id="' + esc(p.id) + '" data-category="' + esc(p.category) + '" data-cms-post="kienthuc">\n' +
'  <a class="skip-link" href="#article-content">Bỏ qua đến nội dung</a>\n' +
'  <div class="reading-progress" aria-hidden="true"><span></span></div>\n' +
'\n' +
'  <header class="site-header">\n' +
'    <div class="header-inner">\n' +
'      <a class="brand" href="/index.html" aria-label="Về trang chủ">\n' +
'        <span class="brand-mark" aria-hidden="true">L</span>\n' +
'        <span><strong>Linh Osimi</strong><small>Góc ghi chép cá nhân</small></span>\n' +
'      </a>\n' +
'      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">\n' +
'        <span></span><span></span><span></span><span class="sr-only">Mở menu</span>\n' +
'      </button>\n' +
'      <nav class="main-nav" id="main-nav" aria-label="Điều hướng chính">\n' +
'        <a href="/khoa-hoc0/0/khoa-hoc.html">Khoa học</a>\n' +
'        <a href="/nghe-thuat0/nghe-thuat.html">Nghệ thuật</a>\n' +
'        <a href="/phim0/0/phim.html">Phim</a>\n' +
'        <a href="/manga0/0/truyen-manga.html">Manga</a>\n' +
'        <a href="/game0/0/game.html">Game</a>\n' +
'        <a class="active" href="/kienthuc/index.html" aria-current="page">Kiến thức</a>\n' +
'      </nav>\n' +
'    </div>\n' +
'  </header>\n' +
'\n' +
'  <main>\n' +
'    <header class="article-hero">\n' +
'      <div class="hero-inner">\n' +
'        <div class="hero-copy">\n' +
'          <nav class="breadcrumbs" aria-label="Đường dẫn">\n' +
'            <a href="/kienthuc/index.html">Kiến thức</a><span>/</span>\n' +
'            <a href="/kienthuc/index.html?category=' + esc(p.category) + '">' + esc(cat.short) + '</a><span>/</span>\n' +
'            <span>Bài mới</span>\n' +
'          </nav>\n' +
'          <p class="article-kicker">' + esc(cat.index) + ' · ' + esc(cat.label) + '</p>\n' +
'          <h1>' + esc(p.title) + '</h1>\n' +
'          <p class="article-lead">' + esc(p.description) + '</p>\n' +
'          <div class="article-meta">\n' +
'            <img src="/img/linhkun.jpg" alt="Linh Osimi">\n' +
'            <p><strong>' + esc(p.author || 'Linh Osimi') + '</strong><br>' + esc(prettyDate(p.date)) + '</p>\n' +
'            <span data-reading-time>Đang tính thời gian đọc…</span>\n' +
'          </div>\n' +
'        </div>\n' +
'        <figure class="cover-paper">\n' +
'          <img src="' + esc(cover) + '" alt="Ảnh bìa ' + esc(p.title) + '" fetchpriority="high">\n' +
'          <figcaption>' + esc(cat.short) + ' / ghi chép mới</figcaption>\n' +
'        </figure>\n' +
'      </div>\n' +
'    </header>\n' +
'\n' +
'    <div class="reading-layout">\n' +
'      <aside class="article-rail" aria-label="Thông tin bài viết">\n' +
'        <a class="back-library" href="/kienthuc/index.html">← Thư viện</a>\n' +
'        <p class="rail-note">Một ghi chép trong bộ sưu tập ' + esc(cat.label) + '.</p>\n' +
'        <span class="rail-symbol" aria-hidden="true">' + esc(cat.symbol) + '</span>\n' +
'      </aside>\n' +
'\n' +
'      <div class="article-main">\n' +
'        <article class="post" id="article-content">\n' +
p.content + '\n' +
'        </article>\n' +
(tagList ? '        <ul class="article-tags">' + tagList + '</ul>\n' : '') +
'      </div>\n' +
'\n' +
'      <aside class="toc-card" aria-label="Mục lục bài viết">\n' +
'        <p>Trong bài này</p>\n' +
'        <h2>Mục lục</h2>\n' +
'        <ol id="article-toc"></ol>\n' +
'        <div class="toc-reading"><span aria-hidden="true">◷</span><span data-reading-time></span></div>\n' +
'      </aside>\n' +
'    </div>\n' +
'\n' +
'    <nav class="article-pager" aria-label="Điều hướng bài viết"></nav>\n' +
'\n' +
'    <section class="related-section" aria-labelledby="related-title">\n' +
'      <div class="related-inner">\n' +
'        <p class="section-kicker">Đọc tiếp theo</p>\n' +
'        <h2 id="related-title">Cùng chủ đề</h2>\n' +
'        <div class="related-grid"></div>\n' +
'      </div>\n' +
'    </section>\n' +
'  </main>\n' +
'\n' +
'  <footer class="site-footer">\n' +
'    <p>© <span id="current-year">2026</span> Linh Osimi</p>\n' +
'    <p>Được ghi lại bằng sự tò mò ✦</p>\n' +
'    <a href="#top" onclick="window.scrollTo({top:0});return false">Lên đầu trang ↑</a>\n' +
'  </footer>\n' +
'</body>\n' +
'</html>\n';
  }

  /* ═══════════ Bài viết mục KHOA HỌC ═══════════
     Đường dẫn: /khoa-hoc0/bai-viet/<slug>.html */
  function khoahocArticle(p) {
    var cat = SCIENCE_CATEGORIES[p.category] || SCIENCE_CATEGORIES.khac;
    var cover = p.cover || DEFAULT_COVER_KH;
    var tagList = (p.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');

    return '<!doctype html>\n' +
'<html lang="vi">\n' +
'<head>\n' +
'  <meta charset="utf-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
'  <meta name="description" content="' + esc(p.description) + '">\n' +
'  <meta name="theme-color" content="#050513">\n' +
'  <meta property="og:type" content="article">\n' +
'  <meta property="og:title" content="' + esc(p.title) + '">\n' +
'  <meta property="og:description" content="' + esc(p.description) + '">\n' +
'  <meta property="og:image" content="' + esc(cover) + '">\n' +
'  <title>' + esc(p.title) + ' — Khoa học · Linh OSIMI</title>\n' +
'  <link rel="icon" type="image/png" href="/favicon.png?v=2">\n' +
'  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">\n' +
'  <link rel="stylesheet" href="/khoa-hoc0/bai-viet/post.css">\n' +
'  <script src="/cms/post.js" defer></script>\n' +
'</head>\n' +
'<body data-article-id="' + esc(p.id) + '" data-category="' + esc(p.category) + '" data-cms-post="khoahoc">\n' +
'  <div class="reading-progress" aria-hidden="true"><span></span></div>\n' +
'\n' +
'  <header class="sci-header">\n' +
'    <a class="sci-brand" href="/index.html"><span class="orb">⚛️</span><span>Linh OSIMI</span></a>\n' +
'    <nav class="sci-nav">\n' +
'      <a class="active" href="/khoa-hoc0/0/khoa-hoc.html">Khoa Học</a>\n' +
'      <a href="/nghe-thuat0/nghe-thuat.html">Nghệ Thuật</a>\n' +
'      <a href="/phim0/0/phim.html">Phim</a>\n' +
'      <a href="/manga0/0/truyen-manga.html">Manga</a>\n' +
'      <a href="/game0/0/game.html">Game</a>\n' +
'      <a href="/kienthuc/index.html">Kiến thức</a>\n' +
'    </nav>\n' +
'  </header>\n' +
'\n' +
'  <main class="sci-main">\n' +
'    <p class="sci-crumbs"><a href="/khoa-hoc0/0/khoa-hoc.html">← Khoa học</a></p>\n' +
'\n' +
'    <header class="sci-hero">\n' +
'      <span class="sci-kicker">' + esc(cat.symbol) + ' ' + esc(cat.label) + '</span>\n' +
'      <h1>' + esc(p.title) + '</h1>\n' +
'      <p class="sci-lead">' + esc(p.description) + '</p>\n' +
'      <div class="sci-meta">\n' +
'        <span>✍ ' + esc(p.author || 'Linh OSIMI') + '</span>\n' +
'        <span>◷ ' + esc(prettyDate(p.date)) + '</span>\n' +
'        <span data-reading-time>…</span>\n' +
'      </div>\n' +
'      <figure class="sci-cover"><img src="' + esc(cover) + '" alt="Ảnh bìa ' + esc(p.title) + '" fetchpriority="high"></figure>\n' +
'    </header>\n' +
'\n' +
'    <div class="sci-layout">\n' +
'      <article class="sci-post" id="article-content">\n' +
p.content + '\n' +
'      </article>\n' +
'      <aside class="sci-toc">\n' +
'        <p class="toc-label">Mục lục</p>\n' +
'        <ol id="article-toc"></ol>\n' +
'      </aside>\n' +
'    </div>\n' +
(tagList ? '    <div class="sci-tags">' + tagList + '</div>\n' : '') +
'\n' +
'    <nav class="sci-pager" aria-label="Điều hướng bài viết"></nav>\n' +
'\n' +
'    <section class="sci-related">\n' +
'      <h2>Bài khác cùng mục</h2>\n' +
'      <div class="related-grid"></div>\n' +
'    </section>\n' +
'  </main>\n' +
'\n' +
'  <footer class="sci-footer">\n' +
'    <p>© <span id="current-year">2026</span> Linh OSIMI · Khoa học</p>\n' +
'    <a href="#" onclick="window.scrollTo({top:0,behavior:\'smooth\'});return false">Lên đầu trang ↑</a>\n' +
'  </footer>\n' +
'</body>\n' +
'</html>\n';
  }

  /* ═══════════ Bài viết mục BLOG ═══════════
     Đường dẫn: /blog/bai-viet/<slug>.html
     Bài vẫn hiện trong timeline ở /blog/index.html; trang này để chia sẻ link. */
  function blogArticle(p) {
    var cat = BLOG_CATEGORIES[p.category] || BLOG_CATEGORIES.life;
    var cover = p.cover || '';
    var isVideo = /\.(mp4|webm|ogv|mov)(\?|$)/i.test(cover);
    var tagList = (p.tags || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');

    var media = '';
    if (cover) {
      media = '      <figure class="log-media">\n' +
        (isVideo
          ? '        <video src="' + esc(cover) + '" controls playsinline preload="metadata"></video>\n'
          : '        <img src="' + esc(cover) + '" alt="Ảnh của bài ' + esc(p.title) + '" loading="lazy">\n') +
        '        <figcaption>' + esc(p.description) + '</figcaption>\n' +
        '      </figure>\n';
    }

    return '<!doctype html>\n' +
'<html lang="vi">\n' +
'<head>\n' +
'  <meta charset="utf-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
'  <meta name="description" content="' + esc(p.description) + '">\n' +
'  <meta name="theme-color" content="#7a2f24">\n' +
'  <meta property="og:type" content="article">\n' +
'  <meta property="og:title" content="' + esc(p.title) + '">\n' +
'  <meta property="og:description" content="' + esc(p.description) + '">\n' +
(cover && !isVideo ? '  <meta property="og:image" content="' + esc(cover) + '">\n' : '') +
'  <title>' + esc(p.title) + ' — NEET Daily Log</title>\n' +
'  <link rel="icon" href="/favicon.png">\n' +
'  <link rel="stylesheet" href="/blog/bai-viet/post.css">\n' +
'  <script src="/cms/post.js" defer></script>\n' +
'</head>\n' +
'<body data-article-id="' + esc(p.id) + '" data-category="' + esc(p.category) + '" data-cms-post="blog">\n' +
'  <div class="reading-progress" aria-hidden="true"><span></span></div>\n' +
'\n' +
'  <div class="browser-shell">\n' +
'    <header class="browser-chrome">\n' +
'      <nav class="log-nav" aria-label="Điều hướng">\n' +
'        <a class="tool-button" href="/blog/index.html">← daily log</a>\n' +
'        <a class="tool-button" href="/blog/gallery.html">photos</a>\n' +
'        <a class="tool-button" href="/index.html">☆ start</a>\n' +
'      </nav>\n' +
'      <div class="address-row">\n' +
'        <span>Location</span>\n' +
'        <div class="address-box"><span class="address-icon">⌂</span><span>linh-osimi.net/blog/' + esc(p.slug) + '</span></div>\n' +
'      </div>\n' +
'    </header>\n' +
'\n' +
'    <main class="log-main">\n' +
'      <article class="log-paper">\n' +
'        <div class="tape tape-left" aria-hidden="true"></div>\n' +
'        <div class="tape tape-right" aria-hidden="true"></div>\n' +
'\n' +
'        <p class="log-stamp">' + esc(cat.symbol) + ' ' + esc(cat.label) + '</p>\n' +
'        <h1>' + esc(p.title) + '</h1>\n' +
'        <div class="log-meta">\n' +
'          <time datetime="' + esc(p.date) + '">' + esc(prettyDate(p.date)) + '</time>\n' +
'          <span>' + esc(p.time || '') + '</span>\n' +
'          <span>mood: ' + esc(p.mood || '(・_・)') + '</span>\n' +
'          <span data-reading-time>…</span>\n' +
'        </div>\n' +
'        <p class="log-lead">' + esc(p.description) + '</p>\n' +
media +
'\n' +
'        <div class="log-body" id="article-content">\n' +
p.content + '\n' +
'        </div>\n' +
(tagList ? '        <ul class="log-tags">' + tagList + '</ul>\n' : '') +
'      </article>\n' +
'\n' +
'      <nav class="log-pager article-pager" aria-label="Điều hướng bài viết"></nav>\n' +
'\n' +
'      <section class="log-related">\n' +
'        <h2>Mẩu nhật ký khác</h2>\n' +
'        <div class="related-grid"></div>\n' +
'      </section>\n' +
'    </main>\n' +
'\n' +
'    <footer class="taskbar">\n' +
'      <a class="start-button" href="/blog/index.html">☆ daily log</a>\n' +
'      <span class="task-title">▤ ' + esc(p.title) + '</span>\n' +
'      <span class="task-clock">© <span id="current-year">2026</span> linh / osimi</span>\n' +
'    </footer>\n' +
'  </div>\n' +
'</body>\n' +
'</html>\n';
  }

  /* ─────────── Xuất ra ngoài ─────────── */
  global.CMSTemplates = {
    KNOWLEDGE_CATEGORIES: KNOWLEDGE_CATEGORIES,
    SCIENCE_CATEGORIES: SCIENCE_CATEGORIES,
    BLOG_CATEGORIES: BLOG_CATEGORIES,
    slugify: slugify,
    escapeHtml: esc,
    prettyDate: prettyDate,
    defaultCover: function (section) {
      if (section === 'khoahoc') return DEFAULT_COVER_KH;
      if (section === 'blog') return '';   /* blog cho phép bài không có ảnh */
      return DEFAULT_COVER_KT;
    },
    /* Thư mục lưu bài theo từng mục */
    articlePath: function (section, slug) {
      if (section === 'khoahoc') return 'khoa-hoc0/bai-viet/' + slug + '.html';
      if (section === 'blog') return 'blog/bai-viet/' + slug + '.html';
      return 'kienthuc/articles/blog/' + slug + '.html';
    },
    categoriesOf: function (section) {
      if (section === 'khoahoc') return SCIENCE_CATEGORIES;
      if (section === 'blog') return BLOG_CATEGORIES;
      return KNOWLEDGE_CATEGORIES;
    },
    render: function (post) {
      if (post.section === 'khoahoc') return khoahocArticle(post);
      if (post.section === 'blog') return blogArticle(post);
      return kienthucArticle(post);
    }
  };
})(window);
