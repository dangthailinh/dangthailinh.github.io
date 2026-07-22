(() => {
  const path = window.location.pathname.replace(/\\/g, '/');
  const file = path.split('/').pop() || '';
  const isHub = ['game.html', 'game2.html', 'game3.html'].includes(file);
  const hubPage = file === 'game3.html' ? 3 : file === 'game2.html' ? 2 : 1;
  const isPlayable = /^game-fun\d*\.html$/i.test(file) || /\/game0\/1\/[1-6]\.html$/i.test(path);
  const isArticle = /^game-bai[0-3]\.html$/i.test(file);
  const pageType = isHub ? 'game-hub' : isPlayable ? 'game-playable' : isArticle ? 'game-article' : 'game-feature';

  const cp1252 = new Map([[0x20ac,0x80],[0x201a,0x82],[0x0192,0x83],[0x201e,0x84],[0x2026,0x85],[0x2020,0x86],[0x2021,0x87],[0x02c6,0x88],[0x2030,0x89],[0x0160,0x8a],[0x2039,0x8b],[0x0152,0x8c],[0x017d,0x8e],[0x2018,0x91],[0x2019,0x92],[0x201c,0x93],[0x201d,0x94],[0x2022,0x95],[0x2013,0x96],[0x2014,0x97],[0x02dc,0x98],[0x2122,0x99],[0x0161,0x9a],[0x203a,0x9b],[0x0153,0x9c],[0x017e,0x9e],[0x0178,0x9f]]);
  const broken = /(?:Ã.|Â.|Ä.|Æ.|áº|á»|â€|â†|âš|ðŸ|ï¸)/g;
  const repairOnce = (value) => {
    const bytes = [];
    for (const character of value) {
      const point = character.codePointAt(0);
      if (point <= 255) bytes.push(point);
      else if (cp1252.has(point)) bytes.push(cp1252.get(point));
      else return value;
    }
    try { return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes)); }
    catch (_) { return value; }
  };
  const repairText = (value) => {
    let result = value;
    for (let i = 0; i < 2; i += 1) {
      const before = (result.match(broken) || []).length;
      if (!before) break;
      const candidate = repairOnce(result);
      if (candidate === result || (candidate.match(broken) || []).length >= before) break;
      result = candidate;
    }
    return result;
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => ['SCRIPT','STYLE','CODE','PRE'].includes(node.parentElement?.tagName) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => { if (broken.test(node.nodeValue)) node.nodeValue = repairText(node.nodeValue); broken.lastIndex = 0; });
  document.querySelectorAll('[title],[alt],[aria-label]').forEach((element) => ['title','alt','aria-label'].forEach((attribute) => {
    if (element.hasAttribute(attribute)) element.setAttribute(attribute, repairText(element.getAttribute(attribute)));
  }));
  document.title = repairText(document.title);
  document.body.classList.add('game-site', pageType);
  document.body.dataset.gamePage = file;

  let bar = null;
  if (!isPlayable) {
    bar = document.createElement('header');
    bar.className = 'game-console-bar';
    bar.innerHTML = `
      <a class="game-brand" href="/game0/0/game.html"><span class="game-brand-mark" aria-hidden="true"></span><span>OSIMI<em>//PLAY</em></span></a>
      <nav class="game-console-nav" id="game-console-nav" aria-label="Điều hướng chính">
        <a href="/khoa-hoc0/0/khoa-hoc.html">Khoa học</a><a href="/nghe-thuat0/nghe-thuat.html">Nghệ thuật</a><a href="/phim0/0/phim.html">Movie</a><a href="/manga0/0/truyen-manga.html">Manga</a><a href="/game0/0/game.html" aria-current="page">Game</a><a href="/kienthuc/0/kienthuc.html">Kiến thức</a>
      </nav>
      <a class="game-home" href="/index.html">← Trang chủ</a>
      <button class="game-menu" type="button" aria-expanded="false" aria-controls="game-console-nav" aria-label="Mở menu"><span></span><span></span></button>`;
    document.body.insertAdjacentElement('afterbegin', bar);
    const menuButton = bar.querySelector('.game-menu');
    const menu = bar.querySelector('.game-console-nav');
    const closeMenu = () => { menuButton.setAttribute('aria-expanded','false'); menu.classList.remove('is-open'); };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    });
    menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('resize', () => { if (window.innerWidth > 940) closeMenu(); });
  }

  const hubCopy = {
    1: {
      eyebrow: 'Player archive / Page 01', title: 'Game <span>stories</span>',
      description: 'Nhật ký, review và những câu chuyện còn ở lại rất lâu sau khi màn hình “Game Over”.',
      image: '/game0/assets/captures/uncharted-01.png', action: 'Đọc bài viết', target: '#game-library',
    },
    2: {
      eyebrow: 'Arcade mode / Page 02', title: 'Play <span>games</span>',
      description: 'Toàn bộ mini game được gom vào một phòng arcade riêng để chọn nhanh và bắt đầu chơi ngay.',
      image: '/game0/assets/captures/cyberpunk-01.png', action: 'Chọn game', target: '#game-library',
    },
    3: {
      eyebrow: 'Photo archive / Page 03', title: 'Capture <span>mode</span>',
      description: 'Bộ sưu tập những khoảnh khắc mình đã ghi lại qua nhiều thế giới game.',
      image: '/game0/assets/captures/uncharted-05.png', action: 'Xem ảnh', target: '#game-captures',
    },
  }[hubPage];

  if (isHub) {
    const hero = document.createElement('section');
    hero.className = 'game-hero';
    hero.style.setProperty('--game-hero-image', `url("${hubCopy.image}")`);
    hero.innerHTML = `
      <div class="game-hero-copy"><p class="game-eyebrow">${hubCopy.eyebrow}</p><h1>${hubCopy.title}</h1><p class="game-hero-description">${hubCopy.description}</p>
        <div class="game-hero-actions"><a class="game-button" href="${hubCopy.target}">${hubCopy.action} <span>→</span></a></div>
        <div class="game-status-row"><div><strong>09</strong><span>Articles</span></div><div><strong>09</strong><span>Playable</span></div><div><strong>18</strong><span>Captures</span></div></div>
      </div>
      <aside class="game-player-card"><div class="game-player-top"><span>Player profile</span><b>● Online</b></div><div class="game-avatar"><img src="/game0/assets/ui/ransei-dance.gif" alt="Anime gamer mascot"></div><div class="game-player-info"><div><small>Current player</small><strong>Linh Osimi</strong></div><span class="game-level">LV.9</span></div></aside>
      <img class="game-hero-decal game-hero-decal--frog" src="/game0/assets/ui/frog-color.png" alt=""><img class="game-hero-decal game-hero-decal--kirby" src="/game0/assets/ui/kirby-headphones.png" alt="">`;
    bar.insertAdjacentElement('afterend', hero);
    const tabs = document.createElement('nav');
    tabs.className = 'game-console-tabs';
    tabs.innerHTML = `<a href="/game0/0/game.html" class="${hubPage === 1 ? 'is-active' : ''}"><span>01</span>Bài viết</a><a href="/game0/1/game2.html" class="${hubPage === 2 ? 'is-active' : ''}"><span>02</span>Chơi game</a><a href="/game0/2/game3.html" class="${hubPage === 3 ? 'is-active' : ''}"><span>03</span>Capture mode</a>`;
    hero.insertAdjacentElement('afterend', tabs);

    const main = document.querySelector('main.main');
    if (main) main.id = 'game-library';
    if (hubPage === 1) {
      main?.querySelectorAll('.card-link').forEach((card) => {
        if (/game-fun\d*\.html/i.test(card.getAttribute('href') || '')) card.remove();
      });
      main?.querySelectorAll('.sub-section').forEach((section) => {
        if (!section.querySelector('.card-link')) section.remove();
      });
    }
    if (hubPage === 2 && main) {
      const playableGames = [
        ['/game0/0/game-fun.html','Riddle Quest','Đấu trí sinh tồn','/game0/assets/ui/frog-color.png'],
        ['/game0/0/game-fun2.html','Mini Mario','Platformer · chiến đấu','/game0/assets/ui/mario.png'],
        ['/game0/0/game-fun3.html','Pacman Combat','Pixel maze · săn ma','/game0/assets/ui/frog-pixel.png'],
        ['/game0/1/1.html','Gorillas','Pháo binh · tính hướng gió','/game0/assets/games/gorillas.png'],
        ['/game0/1/2.html','Tìm Cặp','Memory game · mở thẻ','/game0/assets/games/memory-match.png'],
        ['/game0/1/3.html','Zuma','Bắn bi màu · phản xạ','/game0/assets/games/zuma.png'],
        ['/game0/1/4.html','Wildfire','Giải cứu rừng · chữa cháy','/game0/assets/games/wildfire.png'],
        ['/game0/1/5.html','Stick Hero','Canh cầu · phiêu lưu','/game0/assets/games/stick-hero.png'],
        ['/game0/1/6.html','Super Hopper','Arcade · nhảy vượt chướng ngại','/game0/assets/games/super-hopper.png'],
      ];
      main.innerHTML = `<div class="card-grid">${playableGames.map(([href,title,meta,image]) => `<a href="${href}" class="card-link"><div class="card"><img src="${image}" alt="${title}" class="card-img"><div class="playtime">Ready to play</div><h3>${title}</h3><div class="card-meta">${meta}</div></div></a>`).join('')}</div>`;
    }
    if (hubPage === 3 && main) main.innerHTML = '';
    const cards = [...document.querySelectorAll('.card-link')];
    const fallbackCovers = ['uncharted-01.png','uncharted-02.png','cyberpunk-01.png','uncharted-03.png','uncharted-05.png','uncharted-06.png','uncharted-04.png'];
    cards.forEach((card, index) => {
      card.querySelector('.card')?.setAttribute('data-index', String(index + 1).padStart(2,'0'));
      card.dataset.search = repairText(card.textContent).toLocaleLowerCase('vi');
      const cover = card.querySelector('.card-img');
      cover?.addEventListener('error', () => {
        if (!cover.dataset.fallbackApplied) {
          cover.dataset.fallbackApplied = 'true';
          cover.src = `/game0/assets/captures/${fallbackCovers[index % fallbackCovers.length]}`;
        }
      });
    });
    if (hubPage !== 3) {
      const tools = document.createElement('div');
      tools.className = 'game-library-tools';
      const contentType = hubPage === 1 ? 'bài viết' : 'game';
      tools.innerHTML = `<div><span>●</span><strong>${hubPage === 1 ? 'Player stories' : 'Arcade collection'}</strong><span data-game-count>${cards.length} ${contentType}</span></div><label class="game-search"><span>⌕</span><input type="search" placeholder="Tìm ${contentType}..." data-game-search><kbd>/</kbd></label>`;
      tabs.insertAdjacentElement('afterend', tools);
      const search = tools.querySelector('input');
      const count = tools.querySelector('[data-game-count]');
      const updateSearch = () => {
        const value = search.value.toLocaleLowerCase('vi').trim();
        let visible = 0;
        cards.forEach((card) => { const show = !value || card.dataset.search.includes(value); card.classList.toggle('game-card-hidden', !show); if (show) visible += 1; });
        count.textContent = `${visible} ${contentType}`;
      };
      search.addEventListener('input', updateSearch);
      document.addEventListener('keydown', (event) => { if (event.key === '/' && !(event.target instanceof HTMLInputElement)) { event.preventDefault(); search.focus(); } });
    }

    if (hubPage === 3) {
      const shots = [
        ...['uncharted-01.png','uncharted-02.png','uncharted-03.png','uncharted-04.png','uncharted-05.png','uncharted-06.png'].map((file) => ({ file, game: 'Uncharted 4' })),
        { file: 'cyberpunk-01.png', game: 'Cyberpunk 2077' },
        ...['genshin-impact-01.png','genshin-impact-02.png','genshin-impact-03.png'].map((file) => ({ file, game: 'Genshin Impact' })),
        { file: 'puzzle-world-01.png', game: 'Puzzle World' },
        ...['the-last-of-us-part-ii-01.png','the-last-of-us-part-ii-02.png','the-last-of-us-part-ii-03.png','the-last-of-us-part-ii-04.png'].map((file) => ({ file, game: 'The Last of Us Part II' })),
        { file: 'underwater-01.png', game: 'Underwater' },
        ...['cyberpunk-02.png','cyberpunk-03.png'].map((file) => ({ file, game: 'Cyberpunk 2077' })),
      ];
      const gameSequence = new Map();
      const captures = shots.map((shot) => {
        const number = (gameSequence.get(shot.game) || 0) + 1;
        gameSequence.set(shot.game, number);
        return `<button class="game-capture" type="button" data-full="/game0/assets/captures/${shot.file}"><img src="/game0/assets/captures/${shot.file}" alt="Screenshot ${shot.game} ${number}" loading="lazy"><span>${shot.game} / ${String(number).padStart(2, '0')}</span></button>`;
      }).join('');
      const gallery = document.createElement('section');
      gallery.className = 'game-captures';
      gallery.id = 'game-captures';
      gallery.innerHTML = `<div class="game-captures-head"><h2>Capture <span>mode</span></h2><p>Những khoảnh khắc mình đã chụp lại trong các hành trình game — không filter, chỉ có ánh sáng trong game.</p></div><div class="game-capture-grid">${captures}</div>`;
      main?.insertAdjacentElement('afterend', gallery);
      const lightbox = document.createElement('div');
      lightbox.className = 'game-lightbox';
      lightbox.setAttribute('role','dialog'); lightbox.setAttribute('aria-modal','true'); lightbox.setAttribute('aria-label','Xem ảnh game');
      lightbox.innerHTML = '<button type="button" aria-label="Đóng">×</button><img alt="Ảnh game phóng lớn">';
      document.body.appendChild(lightbox);
      const closeLightbox = () => { lightbox.classList.remove('is-open'); document.body.style.overflow = ''; };
      gallery.querySelectorAll('[data-full]').forEach((button) => button.addEventListener('click', () => { lightbox.querySelector('img').src = button.dataset.full; lightbox.classList.add('is-open'); document.body.style.overflow = 'hidden'; }));
      lightbox.querySelector('button').addEventListener('click', closeLightbox);
      lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
      document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeLightbox(); });
    }
  } else if (isArticle) {
    const hero = document.querySelector('.hero-detail, .hero-cyber-detail');
    hero?.classList.add('game-article-hero');
    const main = document.querySelector('main.main');
    if (main) main.id = 'game-content';
    const words = (main?.textContent || '').trim().split(/\s+/).filter(Boolean).length;
    const head = document.createElement('div');
    head.className = 'game-article-head';
    head.innerHTML = `<span><a href="/game0/0/game.html">Game library</a> / Review file</span><span>${Math.max(3,Math.ceil(words / 220))} phút đọc · Player notes</span>`;
    hero?.insertAdjacentElement('beforebegin', head);
    main?.querySelectorAll('img').forEach((image,index) => { image.loading = index ? 'lazy' : 'eager'; image.decoding = 'async'; });
  } else {
    const tag = document.createElement('span');
    tag.className = isPlayable ? 'game-play-tag' : 'game-feature-tag';
    tag.textContent = isPlayable ? 'Arcade session' : 'Feature mode';
    document.body.appendChild(tag);
  }

  if (!isPlayable) {
    const footer = document.createElement('footer');
    footer.className = 'game-console-footer';
    footer.innerHTML = `<div class="game-footer-brand"><span class="game-brand-mark" aria-hidden="true"></span><p><strong>OSIMI//PLAY</strong><span>Games played. Stories remembered.</span></p></div><p class="game-footer-meta">© ${new Date().getFullYear()} Linh Osimi <b>●</b> System online</p>`;
    document.body.appendChild(footer);
    const top = document.createElement('button');
    top.className = 'game-top'; top.type = 'button'; top.textContent = '↑'; top.setAttribute('aria-label','Lên đầu trang');
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(top);
    const updateTop = () => top.classList.toggle('is-visible', window.scrollY > 650);
    window.addEventListener('scroll', updateTop, { passive: true }); updateTop();
  }
})();
