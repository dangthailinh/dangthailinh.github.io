/* Cấu hình giao diện do /admin quản lý.
   Chỉ áp dụng các giá trị hợp lệ và luôn giữ CSS gốc làm dự phòng. */
(function () {
  'use strict';

  var FONT_MAP = {
    inter: '"Inter","Segoe UI",system-ui,sans-serif',
    'be-vietnam': '"Be Vietnam Pro","Segoe UI",system-ui,sans-serif',
    lora: 'Lora,Georgia,serif',
    serif: 'Georgia,"Times New Roman",serif',
    mono: '"Courier New",Consolas,monospace',
    comic: '"Comic Sans MS","Segoe Print",cursive',
    'space-grotesk': '"Space Grotesk","Inter",system-ui,sans-serif',
    orbitron: 'Orbitron,"Space Grotesk",system-ui,sans-serif',
    trebuchet: '"Trebuchet MS","Segoe UI",Arial,sans-serif'
  };

  var PAGE_MAP = {
    blog: {
      hero: '.hero', title: '.hero h1', description: '.hero-intro', image: '.hero-cat'
    },
    khoahoc: {
      hero: '.hero-science', title: '.hero-science h1', description: '.hero-science p', backgroundImage: true
    },
    kienthuc: {
      hero: '.hero', title: '#page-title', description: '.hero-description', image: '.hero-character'
    },
    game: {
      hero: '.hero-game', title: '.hero-game h1', description: '.hero-game p', backgroundImage: true
    },
    manga: {
      hero: '.manga-hero', title: '#pageTitle', description: '.hero-main__copy', image: '.hero-character'
    },
    nghethuat: {
      hero: '.collage-hero', title: '#pageTitle', description: '.art-theme-intro', image: '.art-gate__visitor'
    },
    phim: {
      hero: '.hero', title: '#hero-title', description: '.hero-intro', image: '.hero-sticker--cat'
    }
  };

  function sectionName() {
    var body = document.body;
    return body.getAttribute('data-cms-feed') ||
      body.getAttribute('data-cms-post') ||
      body.getAttribute('data-section') || '';
  }

  function safeColor(value, fallback) {
    return /^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback;
  }

  function safeNumber(value, min, max, fallback) {
    var number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function replaceFirstText(element, text) {
    if (!element || !text) return;
    var node = Array.prototype.find.call(element.childNodes, function (child) {
      return child.nodeType === Node.TEXT_NODE && child.textContent.trim();
    });
    if (node) node.textContent = text;
    else element.insertBefore(document.createTextNode(text), element.firstChild);
  }

  function setTitle(section, element, value) {
    if (!element || !value) return;
    var lines = String(value).split(/\n+/);
    if (section === 'blog') {
      var blogLines = element.querySelectorAll(':scope > span');
      if (blogLines.length >= 2) {
        blogLines[0].textContent = lines[0] || '';
        blogLines[1].textContent = lines.slice(1).join(' ') || '';
        return;
      }
    }
    if (section === 'phim') {
      var movieLine = element.querySelector(':scope > span');
      if (movieLine) {
        movieLine.textContent = lines[0] || '';
        replaceFirstText(element, ' ' + (lines.slice(1).join(' ') || ''));
        return;
      }
    }
    if (section === 'kienthuc') {
      var emphasis = element.querySelector('em');
      if (emphasis) {
        replaceFirstText(element, lines[0] || '');
        emphasis.textContent = lines.slice(1).join(' ') || '';
        return;
      }
    }
    if ((section === 'manga' || section === 'nghethuat') && element.querySelector('span')) {
      replaceFirstText(element, lines.join(' '));
      return;
    }
    element.textContent = lines.join(' ');
  }

  function ensureArtDescription(map, text) {
    if (map.description !== '.art-theme-intro' || document.querySelector(map.description) || !text) return;
    var title = document.querySelector(map.title);
    if (!title) return;
    var paragraph = document.createElement('p');
    paragraph.className = 'art-theme-intro';
    title.insertAdjacentElement('afterend', paragraph);
  }

  function apply(section, settings) {
    var map = PAGE_MAP[section];
    var root = document.documentElement;
    var background = safeColor(settings.background, '#f4efe4');
    var surface = safeColor(settings.surface, '#fffdf8');
    var text = safeColor(settings.text, '#2b2620');
    var accent = safeColor(settings.accent, '#b4552d');
    var bodyFont = FONT_MAP[settings.bodyFont] || FONT_MAP.inter;
    var headingFont = FONT_MAP[settings.headingFont] || FONT_MAP['space-grotesk'];
    var bodySize = safeNumber(settings.bodySize, 14, 24, 17);
    var lineHeight = safeNumber(settings.lineHeight, 1.4, 2.2, 1.82);
    var width = safeNumber(settings.contentWidth, 50, 90, 70);
    var radius = safeNumber(settings.radius, 0, 30, 14);

    root.style.setProperty('--cms-user-bg', background);
    root.style.setProperty('--cms-user-surface', surface);
    root.style.setProperty('--cms-user-text', text);
    root.style.setProperty('--cms-user-accent', accent);
    root.style.setProperty('--cms-user-body-font', bodyFont);
    root.style.setProperty('--cms-user-heading-font', headingFont);
    root.style.setProperty('--cms-user-body-size', bodySize + 'px');
    root.style.setProperty('--cms-user-line-height', lineHeight);
    root.style.setProperty('--cms-user-read-width', width + 'ch');
    root.style.setProperty('--cms-user-radius', radius + 'px');

    /* Ghi đè token của đúng mục để bài viết CMS dùng ngay cấu hình mới. */
    root.style.setProperty('--' + section + '-bg', background);
    root.style.setProperty('--' + section + '-surface', surface);
    root.style.setProperty('--' + section + '-text', text);
    root.style.setProperty('--' + section + '-accent', accent);
    root.style.setProperty('--font-body', bodyFont);
    root.style.setProperty('--font-display', headingFont);
    root.style.setProperty('--fs-body', bodySize + 'px');
    root.style.setProperty('--lh-body', lineHeight);
    root.style.setProperty('--read-max', width + 'ch');
    root.style.setProperty('--radius', radius + 'px');

    document.body.style.backgroundColor = background;

    if (map) {
      ensureArtDescription(map, settings.description);
      var hero = document.querySelector(map.hero);
      var title = document.querySelector(map.title);
      var description = document.querySelector(map.description);
      var image = map.image && document.querySelector(map.image);
      setTitle(section, title, settings.title);
      if (description && settings.description) description.textContent = settings.description;
      if (title) {
        title.style.fontFamily = headingFont;
        title.style.color = accent;
      }
      if (description) {
        description.style.fontFamily = bodyFont;
        description.style.color = text;
      }
      if (settings.heroImage && image) image.src = settings.heroImage;
      if (settings.heroImage && hero && map.backgroundImage) {
        hero.style.backgroundImage = 'linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.62)),url("' +
          String(settings.heroImage).replace(/"/g, '%22') + '")';
        hero.style.backgroundSize = 'cover';
        hero.style.backgroundPosition = 'center';
      }
    }

    document.body.setAttribute('data-cms-theme-ready', 'true');
  }

  var style = document.createElement('style');
  style.textContent =
    'body[data-cms-theme-ready="true"]{--bg:var(--cms-user-bg);--surface:var(--cms-user-surface);' +
      '--text:var(--cms-user-text);--accent:var(--cms-user-accent)}' +
    'body[data-cms-theme-ready="true"] :is(.cms-post,.post,.sci-post,.log-body,#article-content){' +
      'max-width:var(--cms-user-read-width);color:var(--cms-user-text);' +
      'font-family:var(--cms-user-body-font)!important;font-size:var(--cms-user-body-size)!important;' +
      'line-height:var(--cms-user-line-height)!important}' +
    'body[data-cms-theme-ready="true"] :is(.cms-post,.post,.sci-post,.log-body,#article-content) ' +
      ':is(h1,h2,h3,h4){font-family:var(--cms-user-heading-font)!important}' +
    'body[data-cms-theme-ready="true"] :is(.cms-post,.post,.sci-post,.log-body,#article-content) ' +
      ':is(img,figure,blockquote,pre,table){border-radius:var(--cms-user-radius)!important}' +
    '.art-theme-intro{position:absolute;z-index:6;left:50%;bottom:7%;width:min(520px,74%);' +
      'margin:0;transform:translateX(-50%);text-align:center;font-size:13px;line-height:1.55}';
  document.head.appendChild(style);

  fetch('/data/site-settings.json?v=' + Math.floor(Date.now() / 60000), { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('Không tải được cấu hình giao diện');
      return response.json();
    })
    .then(function (data) {
      var section = sectionName();
      if (section && data && data.sections && data.sections[section]) {
        apply(section, data.sections[section]);
      }
    })
    .catch(function () { /* CSS gốc vẫn hoạt động nếu file cấu hình lỗi */ });
})();
