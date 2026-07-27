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

  var BLOCK_MAP = {
    blog: {
      hero: '.hero', owner: '.owner-card', archive: '.archive-widget', music: '.music-widget',
      daily: '.daily-column', todo: '.todo-card', now: '.now-widget', shrine: '.shrine-widget',
      guestbook: '.guestbook-widget', ending: '.end-zone'
    },
    khoahoc: {
      hero: '.hero-science', articles: 'main.main', pagination: '.pagination-container'
    },
    kienthuc: {
      hero: '.hero', quick: '.quick-categories', library: '.library-layout'
    },
    game: {
      hero: '.hero-game', articles: 'main.main', pagination: '.pg-wrap'
    },
    manga: {
      hero: '.manga-hero',
      mainCollection: 'section[aria-labelledby="mainCollection"]',
      extraCollection: 'section[aria-labelledby="extraCollection"]'
    },
    nghethuat: {
      hero: '.collage-hero', featured: '#featured', collection: '#collection', guestbook: '#guestbook'
    },
    phim: {
      hero: '.hero', library: '.library', intermission: '.intermission'
    }
  };
  var BLOCK_TITLE_MAP = {
    blog: {
      owner: '.owner-card h2', archive: '.archive-widget h2', music: '.music-widget h2',
      daily: '.daily-column h2', todo: '.todo-card h2', now: '.now-widget h2',
      shrine: '.shrine-widget h2', guestbook: '.guestbook-widget h2'
    },
    kienthuc: { library: '#result-title' },
    manga: { mainCollection: '#mainCollection', extraCollection: '#extraCollection' },
    nghethuat: { featured: '#featuredTitle', collection: '#collectionTitle', guestbook: '#guestbookTitle' },
    phim: { library: '#library-title', intermission: '#intermission-title' }
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

  function safeImage(value) {
    value = String(value || '').trim();
    return /^(https?:\/\/|\/(?!\/))/i.test(value) ? value.replace(/"/g, '%22') : '';
  }

  function allowed(value, list, fallback) {
    return list.indexOf(value) >= 0 ? value : fallback;
  }

  function applyBlocks(section, blocks) {
    var map = BLOCK_MAP[section] || {};
    if (!Array.isArray(blocks)) return;
    var groups = [];
    blocks.forEach(function (block, index) {
      var selector = map[block.key];
      if (!selector) return;
      var element = document.querySelector(selector);
      if (!element) return;
      element.hidden = block.visible === false;
      element.setAttribute('data-cms-block', block.key);
      element.style.setProperty('--cms-block-order', index);
      var titleSelector = BLOCK_TITLE_MAP[section] && BLOCK_TITLE_MAP[section][block.key];
      if (titleSelector && block.title) {
        replaceFirstText(document.querySelector(titleSelector), block.title);
      }
      var group = groups.find(function (item) { return item.parent === element.parentNode; });
      if (!group) {
        group = { parent: element.parentNode, items: [] };
        groups.push(group);
      }
      group.items.push({ element: element, index: index });
    });
    /* Chỉ đổi thứ tự những phần đang cùng một khu vực để không phá HTML gốc. */
    groups.forEach(function (group) {
      if (group.items.length < 2) return;
      group.items.sort(function (a, b) { return a.index - b.index; })
        .forEach(function (item) { group.parent.appendChild(item.element); });
    });
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
    var pageBackgroundImage = safeImage(settings.pageBackgroundImage);
    var heroBackgroundImage = safeImage(settings.heroBackgroundImage);
    var backgroundPosition = allowed(settings.backgroundPosition,
      ['center', 'top', 'bottom', 'left', 'right'], 'center');
    var heroOverlay = safeNumber(settings.heroOverlay, 0, 0.85, 0.4);
    var heroAlign = allowed(settings.heroAlign,
      ['original', 'left', 'center', 'right'], 'original');
    var heroHeight = allowed(settings.heroHeight,
      ['original', 'compact', 'normal', 'tall', 'screen'], 'original');
    var pageWidth = allowed(settings.pageWidth,
      ['original', 'narrow', 'normal', 'wide', 'full'], 'original');
    var density = allowed(settings.density,
      ['original', 'compact', 'comfortable', 'spacious'], 'original');

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
    root.style.setProperty('--cms-page-max',
      pageWidth === 'narrow' ? '980px' :
      pageWidth === 'normal' ? '1280px' :
      pageWidth === 'wide' ? '1600px' :
      pageWidth === 'full' ? '100%' : 'unset');

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
    if (pageBackgroundImage) {
      document.body.style.backgroundImage =
        'linear-gradient(rgba(0,0,0,.10),rgba(0,0,0,.10)),url("' + pageBackgroundImage + '")';
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = backgroundPosition;
      document.body.style.backgroundAttachment = 'fixed';
    }
    document.body.setAttribute('data-cms-hero-align', heroAlign);
    document.body.setAttribute('data-cms-hero-height', heroHeight);
    document.body.setAttribute('data-cms-page-width', pageWidth);
    document.body.setAttribute('data-cms-density', density);

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
      var decorativeImage = safeImage(settings.heroImage);
      if (decorativeImage && image) image.src = decorativeImage;
      var heroBackground = heroBackgroundImage || (map.backgroundImage ? decorativeImage : '');
      if (heroBackground && hero) {
        hero.style.backgroundImage = 'linear-gradient(rgba(0,0,0,' + heroOverlay +
          '),rgba(0,0,0,' + heroOverlay + ')),url("' + heroBackground + '")';
        hero.style.backgroundSize = 'cover';
        hero.style.backgroundPosition = backgroundPosition;
      }
      if (hero) hero.hidden = settings.showHero === false;
    }

    var navigation = document.querySelector('body > header, .manga-header, .site-header');
    var footer = document.querySelector('body > footer, footer');
    if (navigation) navigation.hidden = settings.showNavigation === false;
    if (footer) footer.hidden = settings.showFooter === false;
    applyBlocks(section, settings.blocks);

    document.body.setAttribute('data-cms-theme-ready', 'true');
  }

  var style = document.createElement('style');
  style.textContent =
    'body[data-cms-theme-ready="true"]{--bg:var(--cms-user-bg);--surface:var(--cms-user-surface);' +
      '--text:var(--cms-user-text);--accent:var(--cms-user-accent)}' +
    'body[data-cms-theme-ready="true"] [hidden]{display:none!important}' +
    'body[data-cms-theme-ready="true"] :is(.cms-post,.post,.sci-post,.log-body,#article-content){' +
      'max-width:var(--cms-user-read-width);color:var(--cms-user-text);' +
      'font-family:var(--cms-user-body-font)!important;font-size:var(--cms-user-body-size)!important;' +
      'line-height:var(--cms-user-line-height)!important}' +
    'body[data-cms-theme-ready="true"] :is(.cms-post,.post,.sci-post,.log-body,#article-content) ' +
      ':is(h1,h2,h3,h4){font-family:var(--cms-user-heading-font)!important}' +
    'body[data-cms-theme-ready="true"] :is(.cms-post,.post,.sci-post,.log-body,#article-content) ' +
      ':is(img,figure,blockquote,pre,table){border-radius:var(--cms-user-radius)!important}' +
    'body[data-cms-post][data-cms-theme-ready="true"] ' +
      ':is(#article-content,.cold-article,main.main,.post-content,.article-content,article.post){' +
      'max-width:var(--cms-user-read-width);color:var(--cms-user-text);' +
      'font-family:var(--cms-user-body-font)!important;font-size:var(--cms-user-body-size)!important;' +
      'line-height:var(--cms-user-line-height)!important}' +
    'body[data-cms-post][data-cms-theme-ready="true"] ' +
      ':is(#article-content,.cold-article,main.main,.post-content,.article-content,article.post) ' +
      ':is(h1,h2,h3,h4){font-family:var(--cms-user-heading-font)!important}' +
    'body[data-cms-page-width]:not([data-cms-page-width="original"]) ' +
      ':is(main.main,.manga-shell,.shell,.content-board,.library-layout,.desk){' +
      'width:min(calc(100% - 32px),var(--cms-page-max))!important;max-width:var(--cms-page-max)!important;' +
      'margin-inline:auto!important}' +
    'body[data-cms-hero-align="left"] :is(.hero,.hero-game,.hero-science,.manga-hero,.collage-hero)>:not(img){text-align:left!important}' +
    'body[data-cms-hero-align="center"] :is(.hero,.hero-game,.hero-science,.manga-hero,.collage-hero)>:not(img){text-align:center!important;margin-inline:auto!important}' +
    'body[data-cms-hero-align="right"] :is(.hero,.hero-game,.hero-science,.manga-hero,.collage-hero)>:not(img){text-align:right!important;margin-left:auto!important}' +
    'body[data-cms-hero-height="compact"] :is(.hero,.hero-game,.hero-science,.manga-hero,.collage-hero){min-height:220px!important;padding-block:35px!important}' +
    'body[data-cms-hero-height="normal"] :is(.hero,.hero-game,.hero-science,.manga-hero,.collage-hero){min-height:440px!important}' +
    'body[data-cms-hero-height="tall"] :is(.hero,.hero-game,.hero-science,.manga-hero,.collage-hero){min-height:650px!important}' +
    'body[data-cms-hero-height="screen"] :is(.hero,.hero-game,.hero-science,.manga-hero,.collage-hero){min-height:100vh!important}' +
    'body[data-cms-density="compact"] :is(main.main,.manga-content,.content-board,.library,.desk){gap:12px!important;padding-block:20px!important}' +
    'body[data-cms-density="comfortable"] :is(main.main,.manga-content,.content-board,.library,.desk){gap:24px!important;padding-block:38px!important}' +
    'body[data-cms-density="spacious"] :is(main.main,.manga-content,.content-board,.library,.desk){gap:40px!important;padding-block:65px!important}' +
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
