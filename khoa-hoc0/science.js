(() => {
  const pagePath = window.location.pathname.replace(/\\/g, '/');
  const fileName = pagePath.split('/').pop() || '';
  const hubMatch = fileName.match(/^khoa-hoc(\d*)\.html$/i);
  const isHub = Boolean(hubMatch);
  const pageNumber = isHub ? (Number(hubMatch[1]) || 1) : Number(pagePath.match(/khoa-hoc0\/(\d+)\//)?.[1] || 0) + 1;

  const cp1252Reverse = new Map([
    [0x20ac, 0x80], [0x201a, 0x82], [0x0192, 0x83], [0x201e, 0x84], [0x2026, 0x85],
    [0x2020, 0x86], [0x2021, 0x87], [0x02c6, 0x88], [0x2030, 0x89], [0x0160, 0x8a],
    [0x2039, 0x8b], [0x0152, 0x8c], [0x017d, 0x8e], [0x2018, 0x91], [0x2019, 0x92],
    [0x201c, 0x93], [0x201d, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
    [0x02dc, 0x98], [0x2122, 0x99], [0x0161, 0x9a], [0x203a, 0x9b], [0x0153, 0x9c],
    [0x017e, 0x9e], [0x0178, 0x9f],
  ]);
  const brokenPattern = /(?:Ã.|Â.|Ä.|Æ.|áº|á»|â€|â†|âš|ðŸ|ï¸)/g;

  const repairOnce = (value) => {
    const bytes = [];
    for (const character of value) {
      const point = character.codePointAt(0);
      if (point <= 255) bytes.push(point);
      else if (cp1252Reverse.has(point)) bytes.push(cp1252Reverse.get(point));
      else return value;
    }
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes));
    } catch (_) {
      return value;
    }
  };

  const repairText = (value) => {
    let result = value;
    for (let pass = 0; pass < 2; pass += 1) {
      const before = (result.match(brokenPattern) || []).length;
      if (!before) break;
      const candidate = repairOnce(result);
      const after = (candidate.match(brokenPattern) || []).length;
      if (candidate === result || after >= before) break;
      result = candidate;
    }
    return result;
  };

  const repairDocument = () => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return ['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(node.parentElement?.tagName)
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (brokenPattern.test(node.nodeValue)) node.nodeValue = repairText(node.nodeValue);
      brokenPattern.lastIndex = 0;
    });
    document.querySelectorAll('[title], [alt], [placeholder], [aria-label]').forEach((element) => {
      ['title', 'alt', 'placeholder', 'aria-label'].forEach((attribute) => {
        if (element.hasAttribute(attribute)) element.setAttribute(attribute, repairText(element.getAttribute(attribute)));
      });
    });
    document.title = repairText(document.title);
  };

  repairDocument();
  document.body.classList.add('science-site', isHub ? 'science-hub' : 'science-article');

  const nav = document.createElement('header');
  nav.className = 'science-bar';
  nav.innerHTML = `
    <a class="science-brand" href="/khoa-hoc0/0/khoa-hoc.html" aria-label="Linh does science — Trang khoa học">
      <span class="science-brand-mark" aria-hidden="true"></span>
      <span>linhdoes.<em>science</em></span>
    </a>
    <nav class="science-nav" id="science-nav" aria-label="Điều hướng chính">
      <a href="/khoa-hoc0/0/khoa-hoc.html" aria-current="page">Khoa học</a>
      <a href="/nghe-thuat0/nghe-thuat.html">Nghệ thuật</a>
      <a href="/phim0/0/phim.html">Movie</a>
      <a href="/manga0/0/truyen-manga.html">Manga</a>
      <a href="/game0/0/game.html">Game</a>
      <a href="/kienthuc/0/kienthuc.html">Kiến thức</a>
    </nav>
    <a class="science-home" href="/index.html">← Trang chủ</a>
    <button class="science-menu" type="button" aria-expanded="false" aria-controls="science-nav" aria-label="Mở menu"><span></span><span></span></button>
    <span class="science-progress" aria-hidden="true"></span>`;
  document.body.insertAdjacentElement('afterbegin', nav);
  document.body.insertAdjacentHTML('afterbegin', '<a class="science-skip" href="#science-content">Đi đến nội dung</a>');
  document.body.insertAdjacentHTML('beforeend', '<div class="science-backdrop" aria-hidden="true"><span></span><span></span><span></span></div>');

  const menuButton = nav.querySelector('.science-menu');
  const menu = nav.querySelector('.science-nav');
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('is-open', open);
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 920) closeMenu(); });

  const hubContent = [
    {
      eyebrow: 'Lab notes / Collection 01',
      title: 'Hiểu thế giới.<em>Từ điều nhỏ nhất.</em>',
      description: 'Những khái niệm nền tảng, công nghệ mới và các câu hỏi khoa học được kể lại theo cách gần gũi, ngắn gọn và dễ hiểu.',
      note: 'Bắt đầu ở đây',
    },
    {
      eyebrow: 'Cosmos / Collection 02',
      title: 'Nhìn lên trời.<em>Chạm vào vũ trụ.</em>',
      description: 'Thiên thạch, bức xạ, thời gian và những chiều không gian — một chuyến đi từ bầu trời đêm đến rìa của hiểu biết.',
      note: 'Vũ trụ & vật lý',
    },
    {
      eyebrow: 'Living world / Collection 03',
      title: 'Sự sống lạ kỳ.<em>Ngay trên Trái Đất.</em>',
      description: 'Từ gấu nước bé xíu đến cá voi xanh khổng lồ: khám phá những chiến lược sinh tồn đáng kinh ngạc của tự nhiên.',
      note: 'Sinh học & tự nhiên',
    },
    {
      eyebrow: 'Ideas / Collection 04',
      title: 'Đặt câu hỏi.<em>Rồi nghĩ sâu hơn.</em>',
      description: 'Toán học, ý thức, tương lai máy tính và những giả thuyết khiến ta nhìn thế giới bằng một góc hoàn toàn khác.',
      note: 'Tư duy & giả thuyết',
    },
    {
      eyebrow: 'Visual atlas / Collection 05',
      title: 'Thấy điều kỳ diệu.<em>Qua từng khung hình.</em>',
      description: 'Một atlas thị giác về vũ trụ, quang học và những hiện tượng đẹp đến mức trông như không thuộc về thế giới thật.',
      note: 'Ảnh & hiện tượng',
    },
  ];
  const collectionLinks = [
    ['/khoa-hoc0/0/khoa-hoc.html', 'Nền tảng'],
    ['/khoa-hoc0/1/khoa-hoc2.html', 'Vũ trụ'],
    ['/khoa-hoc0/2/khoa-hoc3.html', 'Tự nhiên'],
    ['/khoa-hoc0/3/khoa-hoc4.html', 'Tư duy'],
    ['/khoa-hoc0/4/khoa-hoc5.html', 'Thị giác'],
  ];

  if (isHub) {
    const content = hubContent[Math.min(pageNumber - 1, hubContent.length - 1)];
    const hero = document.createElement('section');
    hero.className = 'science-hero';
    hero.innerHTML = `
      <div class="science-hero-copy">
        <p class="science-kicker">${content.eyebrow}</p>
        <h1>${content.title}</h1>
        <p class="science-hero-description">${content.description}</p>
        <div class="science-hero-meta"><span>31 bài đọc</span><span>5 chủ đề</span><span>Curated by Linh</span></div>
      </div>
      <div class="science-hero-visual" aria-label="Mascot của Linh Does Science">
        <span class="science-microbe science-microbe--one"></span><span class="science-microbe science-microbe--two"></span><span class="science-microbe science-microbe--three"></span>
        <img src="/khoa-hoc0/assets/science-mascot.png" alt="Nhân vật mèo xanh mặc áo blouse trắng">
        <div class="science-note"><strong>${content.note}</strong><span>Quan sát kỹ. Đặt câu hỏi. Đừng ngại chưa biết.</span></div>
      </div>`;
    nav.insertAdjacentElement('afterend', hero);

    const collections = document.createElement('nav');
    collections.className = 'science-collections';
    collections.setAttribute('aria-label', 'Bộ sưu tập khoa học');
    collections.innerHTML = collectionLinks.map(([href, label], index) => `<a href="${href}" class="${index + 1 === pageNumber ? 'is-active' : ''}"><span>0${index + 1}</span>${label}</a>`).join('');
    hero.insertAdjacentElement('afterend', collections);

    const main = document.querySelector('main.main');
    if (main) main.id = 'science-content';
    document.querySelectorAll('.card').forEach((card, index) => card.setAttribute('data-index', String(index + 1).padStart(2, '0')));
  } else {
    const title = document.querySelector('.detail-title, .hero-science-detail h1, .wrap > header.hero h1, main.main > h1, h1');
    const hero = title?.closest('.detail-header, .hero-science-detail, header.hero');
    if (hero) hero.classList.add('science-article-hero');

    const prose = document.querySelector('.detail-content, article.card, main.main');
    if (prose) {
      prose.classList.add('science-prose');
      prose.id = 'science-content';
    }
    const layout = prose?.closest('.container-detail, .container, .wrap');
    if (layout) layout.classList.add('science-layout');

    const words = (prose?.textContent || '').trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(2, Math.ceil(words / 220));
    const articleHead = document.createElement('div');
    articleHead.className = 'science-article-head';
    articleHead.innerHTML = `<div class="science-breadcrumb"><a href="/khoa-hoc0/0/khoa-hoc.html">Khoa học</a><i>/</i><span>Bài đọc</span></div><span class="science-readtime">Khoảng ${readingTime} phút đọc</span>`;
    (hero || layout || prose)?.insertAdjacentElement('beforebegin', articleHead);

    const headings = [...(prose?.querySelectorAll('h2') || [])].filter((heading) => heading.textContent.trim()).slice(0, 10);
    headings.forEach((heading, index) => {
      if (!heading.id) heading.id = `section-${index + 1}`;
    });
    const sidebar = document.querySelector('.sidebar-detail, aside.sidebar');
    if (sidebar && headings.length > 1) {
      const toc = document.createElement('nav');
      toc.className = 'science-toc';
      toc.setAttribute('aria-label', 'Mục lục bài viết');
      toc.innerHTML = `<h3>Trong bài này</h3><ol>${headings.map((heading) => `<li><a href="#${heading.id}">${heading.textContent.trim()}</a></li>`).join('')}</ol>`;
      sidebar.insertAdjacentElement('afterbegin', toc);
    }
    prose?.querySelectorAll('img').forEach((image, index) => {
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';
    });
  }

  const footer = document.createElement('footer');
  footer.className = 'science-footer';
  footer.innerHTML = `
    <div class="science-footer-brand"><span class="science-brand-mark" aria-hidden="true"></span><p><strong>linhdoes.science</strong><span>Curiosity is a very good habit.</span></p></div>
    <p class="science-footer-meta">© ${new Date().getFullYear()} Linh Osimi <b>●</b> End of notes</p>`;
  document.body.appendChild(footer);

  const topButton = document.createElement('button');
  topButton.className = 'science-top';
  topButton.type = 'button';
  topButton.setAttribute('aria-label', 'Lên đầu trang');
  topButton.textContent = '↑';
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(topButton);

  const progress = nav.querySelector('.science-progress');
  const updateScroll = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0}%`;
    topButton.classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();
})();
