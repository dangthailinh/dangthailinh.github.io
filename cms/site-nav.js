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
    { key: 'khoahoc',   label: 'Khoa học',   href: '/khoa-hoc0/0/khoa-hoc.html' },
    { key: 'nghethuat', label: 'Nghệ thuật', href: '/nghe-thuat0/nghe-thuat.html' },
    { key: 'phim',      label: 'Phim',       href: '/phim0/0/phim.html' },
    { key: 'manga',     label: 'Manga',      href: '/manga0/0/truyen-manga.html' },
    { key: 'game',      label: 'Game',       href: '/game0/0/game.html' },
    { key: 'kienthuc',  label: 'Kiến thức',  href: '/kienthuc/index.html' },
    { key: 'blog',      label: 'Blog',       href: '/blog/index.html' }
  ];

  /* Một bộ icon SVG nét mảnh, thống nhất cho toàn bộ menu.
     Không dùng emoji để tránh khác biệt hiển thị giữa Windows, Android và iOS. */
  var ICON_PATHS = {
    khoahoc: '<circle cx="12" cy="12" r="1.6"/><ellipse cx="12" cy="12" rx="9" ry="3.8"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(120 12 12)"/>',
    nghethuat: '<path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 0-4H12a1.8 1.8 0 0 1 0-3.6h2.4A6.6 6.6 0 0 0 21 6.8C21 4.7 17 3 12 3Z"/><circle cx="7.8" cy="9" r=".8" fill="currentColor"/><circle cx="10.5" cy="6.7" r=".8" fill="currentColor"/><circle cx="14.2" cy="6.6" r=".8" fill="currentColor"/>',
    phim: '<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M7 6l3-3m2 3 3-3m2 3 3-3"/>',
    manga: '<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H11v18H7.5A3.5 3.5 0 0 0 4 23V5.5Zm16 0A3.5 3.5 0 0 0 16.5 2H13v18h3.5A3.5 3.5 0 0 1 20 23V5.5Z"/>',
    game: '<path d="M8.5 7h7a5.5 5.5 0 0 1 5.2 7.3l-1 2.9a2.4 2.4 0 0 1-4.1.7L14 16h-4l-1.6 1.9a2.4 2.4 0 0 1-4.1-.7l-1-2.9A5.5 5.5 0 0 1 8.5 7Z"/><path d="M7 10v4m-2-2h4"/><circle cx="16.8" cy="11" r=".7" fill="currentColor"/><circle cx="18.7" cy="13" r=".7" fill="currentColor"/>',
    kienthuc: '<path d="M9 18h6m-5 3h4m-7.3-7.4A7 7 0 1 1 17.3 14c-1.3 1-1.8 2-1.8 3h-7c0-1-.5-2.1-1.8-3.4Z"/>',
    blog: '<path d="M5 3h11a3 3 0 0 1 3 3v15H8a3 3 0 0 1-3-3V3Z"/><path d="M8 3v18m3-13h5m-5 4h5m-5 4h3"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>'
  };

  function icon(key) {
    return '<svg class="sn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICON_PATHS[key] || ICON_PATHS.kienthuc) + '</svg>';
  }

  var BRAND = { label: 'Linh Osimi', href: '/index.html' };

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
             icon(m.key) + '<span>' + esc(m.label) + '</span></a>';
    }).join('');

    var drawer = MENU.map(function (m, i) {
      return '<li style="--i:' + i + '"><a href="' + esc(m.href) + '"' +
             (m.key === active ? ' class="is-active" aria-current="page"' : '') + '>' +
             '<span class="ic">' + icon(m.key) + '</span>' + esc(m.label) + '</a></li>';
    }).join('');

    mount.innerHTML =
      '<header class="sn-bar">' +
        '<a class="sn-brand" href="' + esc(BRAND.href) + '">' +
          '<span class="sn-mark" aria-hidden="true">LO</span>' +
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
            '<span class="sn-mark" aria-hidden="true">LO</span>' +
            esc(BRAND.label) +
          '</span>' +
          '<button class="sn-close" type="button" aria-label="Đóng menu">' + icon('close') + '</button>' +
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
    var restoreFocus = null;
    var previousOverflow = '';
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    function open() {
      restoreFocus = document.activeElement;
      previousOverflow = document.body.style.overflow;
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      backdrop.hidden = false;
      requestAnimationFrame(function () { backdrop.classList.add('is-on'); });
      burger.setAttribute('aria-expanded', 'true');
      burger.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function close() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      backdrop.classList.remove('is-on');
      setTimeout(function () { backdrop.hidden = true; }, 300);
      burger.setAttribute('aria-expanded', 'false');
      burger.classList.remove('is-open');
      document.body.style.overflow = previousOverflow;
      if (restoreFocus && document.contains(restoreFocus)) restoreFocus.focus();
    }

    burger.addEventListener('click', function () {
      if (drawer.classList.contains('is-open')) close(); else open();
    });
    backdrop.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    drawer.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
      if (e.key === 'Tab' && drawer.classList.contains('is-open')) {
        var focusable = Array.prototype.slice.call(
          drawer.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')
        );
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
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
