/* ══════════════════════════════════════════════════════════════════════
   cms/site-nav.js — THANH ĐIỀU HƯỚNG DÙNG CHUNG CHO CẢ SITE

   ┌─ Muốn thêm / bớt / đổi tên một mục trên menu?
   └─ Sửa đúng một chỗ: mảng MENU ngay bên dưới. Mọi trang tự cập nhật.

   Cách gắn vào một trang:
       <link rel="stylesheet" href="/cms/site-nav.css">
       <div data-site-nav="khoahoc"></div>     ← đặt ngay đầu <body>
       <script src="/cms/site-nav.js" defer></script>

   Giá trị của data-site-nav là mã mục đang mở, dùng để tô sáng menu.
   Bỏ trống cũng được, khi đó script tự đoán theo đường dẫn.
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────
     MENU — sửa ở đây là sửa toàn site
     ───────────────────────────────────────────────────────── */
  var MENU = [
    { key: 'khoahoc',   label: 'Khoa học',   icon: '🔬', href: '/khoa-hoc0/0/khoa-hoc.html' },
    { key: 'nghethuat', label: 'Nghệ thuật', icon: '🎨', href: '/nghe-thuat0/nghe-thuat.html' },
    { key: 'phim',      label: 'Phim',       icon: '🎬', href: '/phim0/0/phim.html' },
    { key: 'manga',     label: 'Manga',      icon: '📖', href: '/manga0/0/truyen-manga.html' },
    { key: 'game',      label: 'Game',       icon: '🎮', href: '/game0/0/game.html' },
    { key: 'kienthuc',  label: 'Kiến thức',  icon: '💡', href: '/kienthuc/index.html' },
    { key: 'blog',      label: 'Blog',       icon: '📔', href: '/blog/index.html' }
  ];

  var BRAND = { label: 'Linh Osimi', href: '/index.html' };

  /* Biểu tượng hiện trong ô vuông cạnh tên, theo từng mục */
  var BRAND_ICON = {
    khoahoc: '⚛', kienthuc: '✦', blog: '☕',
    game: '▶', manga: '墨', nghethuat: '✎', phim: '★'
  };

  /* ─────────────────────────────────────────────────────────
     Dựng thanh điều hướng
     ───────────────────────────────────────────────────────── */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function guessSection() {
    var p = location.pathname;
    if (/\/khoa-hoc0\//.test(p)) return 'khoahoc';
    if (/\/nghe-thuat0\//.test(p)) return 'nghethuat';
    if (/\/phim0\//.test(p)) return 'phim';
    if (/\/manga0\//.test(p)) return 'manga';
    if (/\/game0\//.test(p)) return 'game';
    if (/\/kienthuc\//.test(p)) return 'kienthuc';
    if (/\/blog\//.test(p)) return 'blog';
    return '';
  }

  function build(mount) {
    var active = mount.getAttribute('data-site-nav') ||
                 document.body.getAttribute('data-section') ||
                 guessSection();

    var desktop = MENU.map(function (m) {
      return '<a href="' + esc(m.href) + '"' + (m.key === active ? ' class="is-active" aria-current="page"' : '') + '>' +
             esc(m.label) + '</a>';
    }).join('');

    var drawer = MENU.map(function (m, i) {
      return '<li style="--i:' + i + '"><a href="' + esc(m.href) + '"' +
             (m.key === active ? ' class="is-active"' : '') + '>' +
             '<span class="ic">' + esc(m.icon) + '</span>' + esc(m.label) + '</a></li>';
    }).join('');

    mount.innerHTML =
      '<header class="sn-bar">' +
        '<a class="sn-brand" href="' + esc(BRAND.href) + '">' +
          '<span class="sn-mark" aria-hidden="true">' + esc(BRAND_ICON[active] || '✦') + '</span>' +
          '<span>' + esc(BRAND.label) + '</span>' +
        '</a>' +
        '<nav class="sn-desktop" aria-label="Điều hướng chính">' + desktop + '</nav>' +
        '<button class="sn-burger" type="button" aria-expanded="false" aria-controls="sn-drawer" aria-label="Mở menu">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
      '</header>' +
      '<div class="sn-backdrop" hidden></div>' +
      '<nav class="sn-drawer" id="sn-drawer" aria-label="Menu" aria-hidden="true">' +
        '<div class="sn-drawer-head">' +
          '<span class="sn-brand-sm">' +
            '<span class="sn-mark" aria-hidden="true">' + esc(BRAND_ICON[active] || '✦') + '</span>' +
            esc(BRAND.label) +
          '</span>' +
          '<button class="sn-close" type="button" aria-label="Đóng menu">✕</button>' +
        '</div>' +
        '<ul class="sn-drawer-nav">' + drawer + '</ul>' +
        '<p class="sn-drawer-foot">© <span data-sn-year></span> Linh Osimi</p>' +
      '</nav>';

    wire(mount);
  }

  function wire(mount) {
    var burger   = mount.querySelector('.sn-burger');
    var drawer   = mount.querySelector('.sn-drawer');
    var backdrop = mount.querySelector('.sn-backdrop');
    var closeBtn = mount.querySelector('.sn-close');
    var yearEl   = mount.querySelector('[data-sn-year]');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    function open() {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      backdrop.hidden = false;
      requestAnimationFrame(function () { backdrop.classList.add('is-on'); });
      burger.setAttribute('aria-expanded', 'true');
      burger.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      backdrop.classList.remove('is-on');
      setTimeout(function () { backdrop.hidden = true; }, 300);
      burger.setAttribute('aria-expanded', 'false');
      burger.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', function () {
      if (drawer.classList.contains('is-open')) close(); else open();
    });
    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });

    /* Cuộn xuống thì ẩn thanh, cuộn lên thì hiện lại — đỡ chật màn hình nhỏ */
    var bar = mount.querySelector('.sn-bar');
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      if (drawer.classList.contains('is-open')) return;
      if (y > lastY && y > 220) bar.classList.add('is-hidden');
      else bar.classList.remove('is-hidden');
      lastY = y;
    }, { passive: true });
  }

  function init() {
    document.querySelectorAll('[data-site-nav]').forEach(build);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
