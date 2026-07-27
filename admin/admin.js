/* ══════════════════════════════════════════════════════════════
   admin.js — Bảng quản trị bài viết
   Chạy hoàn toàn trên trình duyệt, ghi bài trực tiếp vào GitHub
   qua Contents API. Không cần server.

   Ba tab: Tổng quan · Viết bài · Quản lý bài
   Ba trạng thái bài: draft (nháp) · scheduled (hẹn đăng) · published
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var T = window.CMSTemplates;
  var API = 'https://api.github.com';
  var DATA_PATH = 'data/posts.json';
  var TAX_PATH = 'data/taxonomy.json';
  var THEME_PATH = 'data/site-settings.json';
  var PHOTO_PATH = 'data/photos.json';
  var PAGE_URLS = {
    blog: '/blog/',
    khoahoc: '/khoa-hoc0/0/khoa-hoc.html',
    kienthuc: '/kienthuc/',
    game: '/game0/0/game.html',
    manga: '/manga0/0/truyen-manga.html',
    nghethuat: '/nghe-thuat0/nghe-thuat.html',
    phim: '/phim0/0/phim.html'
  };
  var PAGE_FILES = {
    blog: 'blog/index.html',
    khoahoc: 'khoa-hoc0/0/khoa-hoc.html',
    kienthuc: 'kienthuc/index.html',
    game: 'game0/0/game.html',
    manga: 'manga0/0/truyen-manga.html',
    nghethuat: 'nghe-thuat0/nghe-thuat.html',
    phim: 'phim0/0/phim.html'
  };
  var PAGE_BLOCKS = {
    blog: [
      { key: 'hero', label: 'Phần giới thiệu', selector: '.hero' },
      { key: 'owner', label: 'Thông tin cá nhân', selector: '.owner-card', titleSelector: '.owner-card h2' },
      { key: 'archive', label: 'Kho lưu trữ', selector: '.archive-widget', titleSelector: '.archive-widget h2' },
      { key: 'music', label: 'Đang nghe', selector: '.music-widget', titleSelector: '.music-widget h2' },
      { key: 'daily', label: 'Nhật ký hằng ngày', selector: '.daily-column', titleSelector: '.daily-column h2' },
      { key: 'todo', label: 'Danh sách việc cần làm', selector: '.todo-card', titleSelector: '.todo-card h2' },
      { key: 'now', label: 'Cuộc sống hiện tại', selector: '.now-widget', titleSelector: '.now-widget h2' },
      { key: 'shrine', label: 'Góc yêu thích', selector: '.shrine-widget', titleSelector: '.shrine-widget h2' },
      { key: 'guestbook', label: 'Sổ lưu bút', selector: '.guestbook-widget', titleSelector: '.guestbook-widget h2' },
      { key: 'ending', label: 'Ảnh trang trí cuối trang', selector: '.end-zone' }
    ],
    khoahoc: [
      { key: 'hero', label: 'Phần giới thiệu khoa học', selector: '.science-hero, .hero-science' },
      { key: 'collections', label: 'Thanh chia bộ sưu tập', selector: '.science-collections' },
      { key: 'articles', label: 'Danh sách bài khoa học', selector: 'main.main' },
      { key: 'pagination', label: 'Chuyển trang', selector: '.pagination-container' }
    ],
    kienthuc: [
      { key: 'hero', label: 'Phần giới thiệu kiến thức', selector: '.hero' },
      { key: 'quick', label: 'Chọn nhanh chủ đề', selector: '.quick-categories' },
      { key: 'library', label: 'Thư viện bài viết', selector: '.library-layout', titleSelector: '#result-title' }
    ],
    game: [
      { key: 'hero', label: 'Phần giới thiệu Game', selector: '.game-hero, .hero-game' },
      { key: 'tabs', label: 'Thanh Bài viết · Chơi game · Capture', selector: '.game-console-tabs' },
      { key: 'tools', label: 'Tìm kiếm và số lượng', selector: '.game-library-tools' },
      { key: 'articles', label: 'Danh sách bài và game', selector: 'main.main' },
      { key: 'captures', label: 'Thư viện Capture Mode', selector: '.game-captures' },
      { key: 'pagination', label: 'Chuyển trang', selector: '.pg-wrap' }
    ],
    manga: [
      { key: 'hero', label: 'Phần giới thiệu Manga', selector: '.manga-hero' },
      { key: 'mainCollection', label: 'Bộ sưu tập chính', selector: 'section[aria-labelledby="mainCollection"]', titleSelector: '#mainCollection' },
      { key: 'extraCollection', label: 'Bộ sưu tập bổ sung', selector: 'section[aria-labelledby="extraCollection"]', titleSelector: '#extraCollection' }
    ],
    nghethuat: [
      { key: 'hero', label: 'Phần giới thiệu nghệ thuật', selector: '.collage-hero' },
      { key: 'featured', label: 'Tác phẩm nổi bật', selector: '#featured', titleSelector: '#featuredTitle' },
      { key: 'collection', label: 'Bộ sưu tập', selector: '#collection', titleSelector: '#collectionTitle' },
      { key: 'guestbook', label: 'Sổ lưu bút', selector: '#guestbook', titleSelector: '#guestbookTitle' }
    ],
    phim: [
      { key: 'hero', label: 'Phần giới thiệu Phim', selector: '.hero' },
      { key: 'library', label: 'Kệ phim', selector: '.library', titleSelector: '#library-title' },
      { key: 'intermission', label: 'Gợi ý phim cuối trang', selector: '.intermission', titleSelector: '#intermission-title' }
    ]
  };
  var LS = {
    token: 'cms.token',
    repo: 'cms.repo',
    branch: 'cms.branch',
    draft: 'cms.draft'
  };

  /* Trạng thái phiên làm việc */
  var S = {
    token: '', owner: '', repo: '', branch: 'main',
    user: null,
    db: null,          // nội dung posts.json
    dbSha: null,       // sha của posts.json trên GitHub
    editingId: null,   // id bài đang sửa (null = bài mới)
    postTime: '',      // giờ đăng, giữ nguyên khi sửa bài blog cũ
    selected: {},      // các bài được tick trong tab Quản lý
    tax: null,         // nội dung taxonomy.json
    taxSha: null,
    taxDirty: false,
    theme: null,       // chữ, ảnh, màu và kiểu chữ của từng mục
    themeSaved: null,  // bản đã lưu gần nhất để hoàn tác
    themeSha: null,
    themeDirty: false,
    photos: null,      // thư viện ảnh dùng chung cho Photos · Nghệ thuật · Game Capture
    photosSha: null,
    editingPhotoId: null,
    pendingPhotoUploads: [],
    legacyPosts: [],   // bài HTML cũ chưa được ghi vào posts.json
    editingLegacy: null
  };

  /* ───────────────── Tiện ích DOM ───────────────── */
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); };

  function show(id) {
    $$('.screen').forEach(function (s) { s.classList.remove('active'); });
    $(id).classList.add('active');
  }

  var toastTimer;
  function toast(msg, kind) {
    var el = $('#toast');
    el.textContent = msg;
    el.className = 'toast' + (kind ? ' ' + kind : '');
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 4200);
  }

  function busy(on, text) {
    $('#overlay-text').textContent = text || 'Đang xử lý…';
    $('#overlay').hidden = !on;
  }

  /* Hộp thoại nhỏ thay cho prompt/confirm */
  function ask(opts) {
    return new Promise(function (resolve) {
      var modal = $('#modal');
      $('#modal-title').textContent = opts.title || '';
      $('#modal-body').innerHTML = opts.body || '';
      $('#modal-ok').textContent = opts.okText || 'Đồng ý';
      $('#modal-ok').className = 'btn ' + (opts.danger ? 'danger' : 'primary');
      modal.hidden = false;
      var first = modal.querySelector('input,textarea,select');
      if (first) setTimeout(function () { first.focus(); if (first.select) first.select(); }, 40);

      function done(value) {
        modal.hidden = true;
        $('#modal-ok').onclick = null;
        $('#modal-cancel').onclick = null;
        modal.onkeydown = null;
        resolve(value);
      }
      $('#modal-ok').onclick = function () {
        var out = {};
        modal.querySelectorAll('[data-name]').forEach(function (f) { out[f.dataset.name] = String(f.value).trim(); });
        done(out);
      };
      $('#modal-cancel').onclick = function () { done(null); };
      modal.onkeydown = function (e) {
        if (e.key === 'Escape') done(null);
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); $('#modal-ok').click(); }
      };
    });
  }

  var COMBINING = new RegExp('[' + String.fromCharCode(0x300) + '-' + String.fromCharCode(0x36F) + ']', 'g');
  function normalize(v) {
    return String(v || '').toLocaleLowerCase('vi').normalize('NFD')
      .replace(COMBINING, '').replace(/đ/g, 'd').trim();
  }

  function todayISO() {
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 10);
  }

  function relativeTime(iso) {
    if (!iso) return '';
    var diff = Date.now() - new Date(iso).getTime();
    var m = Math.round(diff / 60000);
    if (m < 1) return 'vừa xong';
    if (m < 60) return m + ' phút trước';
    var h = Math.round(m / 60);
    if (h < 24) return h + ' giờ trước';
    var d = Math.round(h / 24);
    if (d < 30) return d + ' ngày trước';
    return new Date(iso).toLocaleDateString('vi-VN');
  }

  /* ───────────────── Base64 hỗ trợ tiếng Việt ───────────────── */
  function toB64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }
  function fromB64(b64) {
    var bin = atob(String(b64).replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }

  /* ───────────────── Gọi GitHub API ───────────────── */
  function gh(path, options) {
    options = options || {};
    var headers = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (S.token) headers.Authorization = 'Bearer ' + S.token;
    if (options.body) headers['Content-Type'] = 'application/json';

    return fetch(API + path, {
      method: options.method || 'GET',
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (res) {
      if (res.status === 404 && options.allow404) return null;
      return res.text().then(function (text) {
        var data = null;
        try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
        if (!res.ok) {
          var msg = (data && data.message) || ('Lỗi HTTP ' + res.status);
          if (res.status === 401) msg = 'Token không hợp lệ hoặc đã hết hạn.';
          if (res.status === 403) msg = 'Token thiếu quyền "Contents: Read and write" cho repo này.';
          if (res.status === 409) msg = 'Nội dung vừa bị thay đổi ở nơi khác. Bấm "Tải lại" rồi thử lại.';
          if (res.status === 422 && /sha/i.test(msg)) msg = 'File đã tồn tại hoặc phiên bản không khớp. Thử đổi đường dẫn bài viết.';
          var err = new Error(msg);
          err.status = res.status;
          throw err;
        }
        return data;
      });
    });
  }

  function repoPath(p) {
    return '/repos/' + S.owner + '/' + S.repo + '/contents/' + p.split('/').map(encodeURIComponent).join('/');
  }

  function readFile(path) {
    return gh(repoPath(path) + '?ref=' + encodeURIComponent(S.branch) + '&t=' + Date.now(), { allow404: true })
      .then(function (data) {
        if (!data || !data.content) return null;
        return { text: fromB64(data.content), sha: data.sha };
      });
  }

  function writeFile(path, content, message, sha) {
    var body = {
      message: message,
      content: typeof content === 'string' ? toB64(content) : content.b64,
      branch: S.branch
    };
    if (sha) body.sha = sha;
    return gh(repoPath(path), { method: 'PUT', body: body });
  }

  /* Ghi nhiều file trong cùng một commit Git. Đăng bài cần cập nhật đồng thời
     HTML và posts.json; gom chúng lại tránh tạo hai lượt GitHub Pages rồi lượt
     đầu bị đánh dấu "cancelled" khi commit sau tới ngay lập tức. */
  function writeFiles(changes, message) {
    var root = '/repos/' + S.owner + '/' + S.repo;
    var branchPath = S.branch.split('/').map(encodeURIComponent).join('/');
    var headSha = '';
    var baseTreeSha = '';
    var blobResults = [];

    return gh(root + '/git/ref/heads/' + branchPath)
      .then(function (ref) {
        headSha = ref.object.sha;
        return gh(root + '/git/commits/' + headSha);
      })
      .then(function (commit) {
        baseTreeSha = commit.tree.sha;
        return Promise.all(changes.map(function (change) {
          if (change.remove) return Promise.resolve(null);
          var b64 = typeof change.content === 'string' ? toB64(change.content) : change.content.b64;
          return gh(root + '/git/blobs', {
            method: 'POST',
            body: { content: b64, encoding: 'base64' }
          });
        }));
      })
      .then(function (blobs) {
        blobResults = blobs;
        var tree = changes.map(function (change, index) {
          return {
            path: change.path,
            mode: '100644',
            type: 'blob',
            sha: change.remove ? null : blobs[index].sha
          };
        });
        return gh(root + '/git/trees', {
          method: 'POST',
          body: { base_tree: baseTreeSha, tree: tree }
        });
      })
      .then(function (tree) {
        return gh(root + '/git/commits', {
          method: 'POST',
          body: { message: message, tree: tree.sha, parents: [headSha] }
        });
      })
      .then(function (commit) {
        return gh(root + '/git/refs/heads/' + branchPath, {
          method: 'PATCH',
          body: { sha: commit.sha, force: false }
        });
      })
      .then(function (ref) {
        return { ref: ref, blobs: blobResults };
      });
  }

  function deleteFile(path, message, sha) {
    return gh(repoPath(path), { method: 'DELETE', body: { message: message, sha: sha, branch: S.branch } });
  }

  /* Xoá file nếu nó tồn tại; im lặng nếu không có */
  function removeIfExists(path, message) {
    return readFile(path).then(function (f) {
      if (f) return deleteFile(path, message, f.sha);
    });
  }

  /* ───────────────── Đăng nhập ───────────────── */
  function doLogin(silent) {
    var repoFull = $('#in-repo').value.trim()
      .replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/\/$/, '');
    var parts = repoFull.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      return loginMsg('Kho lưu trữ phải có dạng tên-tài-khoản/tên-repo', 'err');
    }
    S.owner = parts[0];
    S.repo = parts[1];
    S.branch = $('#in-branch').value.trim() || 'main';
    S.token = $('#in-token').value.trim();
    if (!S.token) return loginMsg('Bạn chưa nhập token.', 'err');

    busy(true, 'Đang kiểm tra token…');
    gh('/user')
      .then(function (user) {
        S.user = user;
        return gh('/repos/' + S.owner + '/' + S.repo);
      })
      .then(function (repo) {
        if (repo.permissions && repo.permissions.push === false) {
          throw new Error('Token không có quyền ghi vào repo này. Hãy bật Contents: Read and write.');
        }
        if ($('#in-remember').checked) {
          localStorage.setItem(LS.token, S.token);
          localStorage.setItem(LS.repo, S.owner + '/' + S.repo);
          localStorage.setItem(LS.branch, S.branch);
        }
        $('#who').textContent = '👤 ' + (S.user.login || '') + ' · ' + S.owner + '/' + S.repo;
        return loadTaxonomy();
      })
      .then(function () { return loadTheme(); })
      .then(function () { return loadPhotos(); })
      .then(function () { return loadDb(); })
      .then(function () {
        return scanLegacyPosts(true).catch(function () {
          S.legacyPosts = [];
          $('#legacy-scan-status').textContent = 'Chưa quét được bài cũ';
        });
      })
      .then(function () {
        busy(false);
        show('#screen-app');
        restoreDraft();
        renderPostList();
        renderDashboard();
        renderTaxonomy();
        renderThemeEditor();
        renderPhotoList();
        applyRouteFromUrl();
      })
      .catch(function (err) {
        busy(false);
        if (silent) logout(true);
        loginMsg(err.message, 'err');
      });
  }

  function loginMsg(text, kind) {
    var el = $('#login-msg');
    el.textContent = text;
    el.className = 'msg ' + (kind || '');
  }

  function logout(keepFields) {
    localStorage.removeItem(LS.token);
    S.token = '';
    S.user = null;
    if (!keepFields) $('#in-token').value = '';
    show('#screen-login');
  }

  /* ───────────────── Kho dữ liệu posts.json ───────────────── */
  function loadDb() {
    return readFile(DATA_PATH).then(function (file) {
      if (!file) {
        S.db = { version: 1, updatedAt: new Date().toISOString(), posts: [] };
        S.dbSha = null;
        return;
      }
      try { S.db = JSON.parse(file.text); }
      catch (e) {
        throw new Error('File data/posts.json không đúng định dạng JSON. Trang admin đã dừng để tránh ghi đè và làm mất danh mục bài.');
      }
      if (!S.db || typeof S.db !== 'object') {
        throw new Error('File data/posts.json không có cấu trúc hợp lệ.');
      }
      if (!Array.isArray(S.db.posts)) {
        throw new Error('File data/posts.json thiếu mảng "posts". Trang admin đã dừng để bảo vệ dữ liệu.');
      }
      /* Bài cũ chưa có trường status thì coi như đã đăng */
      S.db.posts.forEach(function (p) { if (!p.status) p.status = 'published'; });
      S.dbSha = file.sha;
    });
  }

  function saveDb(message) {
    S.db.updatedAt = new Date().toISOString();
    S.db.posts.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    var json = JSON.stringify(S.db, null, 2) + '\n';
    return writeFile(DATA_PATH, json, message, S.dbSha).then(function (res) {
      S.dbSha = res.content.sha;
    });
  }

  /* ───────────────── Kho ảnh Photos ───────────────── */
  function loadPhotos() {
    return readFile(PHOTO_PATH).then(function (file) {
      if (!file) {
        S.photos = { version: 1, updatedAt: new Date().toISOString(), photos: [] };
        S.photosSha = null;
        return;
      }
      try { S.photos = JSON.parse(file.text); }
      catch (e) {
        throw new Error('File data/photos.json không đúng định dạng JSON. Admin đã dừng để bảo vệ kho ảnh.');
      }
      if (!S.photos || !Array.isArray(S.photos.photos)) {
        throw new Error('File data/photos.json thiếu mảng "photos".');
      }
      S.photosSha = file.sha;
    });
  }

  function savePhotos(message) {
    S.photos.version = 1;
    S.photos.updatedAt = new Date().toISOString();
    var json = JSON.stringify(S.photos, null, 2) + '\n';
    return writeFile(PHOTO_PATH, json, message, S.photosSha).then(function (res) {
      S.photosSha = res.content.sha;
    });
  }

  /* ───────────────── Quét các bài HTML cũ ─────────────────
     Chỉ đọc cây file một lần. Không tự sửa hay di chuyển file cũ. */
  function legacySection(path) {
    if (/^blog\/bai-viet\/[^/]+\.html$/i.test(path)) return 'blog';
    if (/^kienthuc\/articles\/.+\.html$/i.test(path)) return 'kienthuc';
    if (/^khoa-hoc0\/0\/khoa-hoc-(?:nang-cao-)?bai\d+\.html$/i.test(path)) return 'khoahoc';
    if (/^game0\/0\/game-(?:nang-cao-)?bai\d+\.html$/i.test(path)) return 'game';
    if (/^manga0\/0\/truyen-manga-(?:nang-cao-)?bai\d+\.html$/i.test(path)) return 'manga';
    if (/^phim0\/0\/(?:cold-fish|phim-(?:nang-cao-)?bai\d+)\.html$/i.test(path)) return 'phim';
    if (/^nghe-thuat0\/(?:[123]|dark-art)\.html$/i.test(path)) return 'nghethuat';
    return '';
  }

  function prettyLegacyTitle(path) {
    var file = path.split('/').pop().replace(/\.html$/i, '');
    var text = file.replace(/[-_]+/g, ' ').replace(/\b(bai)(\d+)\b/i, 'bài $2');
    return text.charAt(0).toLocaleUpperCase('vi') + text.slice(1);
  }

  function linkPath(basePath, href) {
    if (!href || /^(?:https?:|mailto:|javascript:|#)/i.test(href)) return '';
    try {
      return decodeURIComponent(new URL(href, 'https://cms.local/' + basePath).pathname).replace(/^\/+/, '');
    } catch (error) {
      return '';
    }
  }

  function hydrateLegacyMetadata() {
    var byPath = {};
    (S.legacyPosts || []).forEach(function (post) { byPath[post.path] = post; });
    return Promise.all(Object.keys(PAGE_FILES).map(function (section) {
      var pagePath = PAGE_FILES[section];
      return readFile(pagePath).then(function (file) {
        if (!file) return;
        var doc = new DOMParser().parseFromString(file.text, 'text/html');
        Array.prototype.forEach.call(doc.querySelectorAll('a[href]'), function (anchor) {
          var target = byPath[linkPath(pagePath, anchor.getAttribute('href'))];
          if (!target) return;
          var title = anchor.querySelector('h3,h2,.card-title,.post-title');
          var description = anchor.querySelector('.card-meta,.post-excerpt,.excerpt,p');
          var image = anchor.querySelector('img');
          if (title && title.textContent.trim()) target.title = title.textContent.trim();
          if (description && description.textContent.trim()) target.description = description.textContent.trim();
          if (image && image.getAttribute('src')) {
            var src = image.getAttribute('src');
            target.cover = linkPath(pagePath, src) ? '/' + linkPath(pagePath, src) : src;
            if (/^https?:\/\//i.test(src)) target.cover = src;
          }
        });
      }).catch(function () { /* Tên file vẫn là dữ liệu dự phòng. */ });
    }));
  }

  function scanLegacyPosts(silent) {
    if (!silent) {
      busy(true, 'Đang quét các bài HTML cũ…');
      $('#legacy-scan-status').textContent = 'Đang quét…';
    }
    return gh('/repos/' + S.owner + '/' + S.repo + '/git/trees/' +
      encodeURIComponent(S.branch) + '?recursive=1')
      .then(function (tree) {
        var managed = {};
        ((S.db && S.db.posts) || []).forEach(function (post) {
          if (post.path) managed[String(post.path).replace(/^\/+/, '')] = true;
        });
        S.legacyPosts = (tree.tree || []).filter(function (entry) {
          return entry.type === 'blob' && legacySection(entry.path) && !managed[entry.path];
        }).map(function (entry) {
          var section = legacySection(entry.path);
          var slug = entry.path.split('/').pop().replace(/\.html$/i, '');
          return {
            id: 'legacy:' + entry.path,
            _legacy: true,
            section: section,
            category: '',
            status: 'published',
            title: prettyLegacyTitle(entry.path),
            slug: slug,
            description: 'Bài HTML cũ — mở để đọc và chỉnh nội dung.',
            cover: '',
            tags: [],
            date: '',
            path: entry.path,
            url: '/' + entry.path,
            blobSha: entry.sha
          };
        });
        return hydrateLegacyMetadata();
      })
      .then(function () {
        $('#legacy-scan-status').textContent = 'Đã tìm thấy ' + S.legacyPosts.length + ' bài cũ';
        if (!silent) {
          busy(false);
          renderPostList();
          toast('Đã thêm ' + S.legacyPosts.length + ' bài cũ vào danh sách quản lý', 'ok');
        }
      })
      .catch(function (error) {
        if (!silent) {
          busy(false);
          $('#legacy-scan-status').textContent = 'Quét thất bại';
          toast(error.message, 'err');
        }
        throw error;
      });
  }

  /* ───────────────── Kho chủ đề taxonomy.json ───────────────── */
  function loadTaxonomy() {
    return readFile(TAX_PATH).then(function (file) {
      if (!file) {
        /* Repo chưa có file — dựng bản đầu tiên từ danh sách mặc định */
        S.tax = T.defaultTaxonomy();
        S.taxSha = null;
      } else {
        try { S.tax = JSON.parse(file.text); }
        catch (e) {
          throw new Error('File data/taxonomy.json không đúng định dạng JSON. Hãy sửa file rồi tải lại trang admin.');
        }
        S.taxSha = file.sha;
      }
      if (!S.tax.sections || typeof S.tax.sections !== 'object') {
        throw new Error('File data/taxonomy.json thiếu đối tượng "sections". Trang admin đã dừng để bảo vệ dữ liệu.');
      }
      T.setTaxonomy(S.tax);
      S.taxDirty = false;
    });
  }

  function saveTaxonomy() {
    S.tax.updatedAt = new Date().toISOString();
    var json = JSON.stringify(S.tax, null, 2) + '\n';
    return writeFile(TAX_PATH, json, 'Cập nhật danh sách chủ đề', S.taxSha)
      .then(function (res) {
        S.taxSha = res.content.sha;
        S.taxDirty = false;
        T.setTaxonomy(S.tax);
      });
  }

  /* ───────────────── Cấu hình giao diện toàn site ───────────────── */
  function defaultThemeDb() {
    var light = {
      background: '#f4efe4', surface: '#fffdf8', text: '#2b2620', accent: '#b4552d'
    };
    var dark = {
      background: '#08080a', surface: '#151217', text: '#dcd8d6', accent: '#ff4d5a'
    };
    var out = { version: 2, updatedAt: new Date().toISOString(), sections: {} };
    T.SECTIONS.forEach(function (section) {
      var palette = ['game', 'manga', 'phim'].indexOf(section) >= 0 ? dark : light;
      out.sections[section] = {
        title: T.sectionLabel(section),
        description: 'Góc lưu trữ ' + T.sectionLabel(section).toLocaleLowerCase('vi') + ' của Linh Osimi.',
        heroImage: '',
        pageBackgroundImage: '',
        heroBackgroundImage: '',
        backgroundPosition: 'center',
        heroOverlay: 0.4,
        background: palette.background,
        surface: palette.surface,
        text: palette.text,
        accent: palette.accent,
        bodyFont: 'inter',
        headingFont: 'space-grotesk',
        bodySize: 17,
        lineHeight: 1.8,
        contentWidth: 70,
        radius: 14,
        heroAlign: 'original',
        heroHeight: 'original',
        pageWidth: 'original',
        density: 'original',
        showNavigation: true,
        showHero: true,
        showFooter: true,
        blocks: (PAGE_BLOCKS[section] || []).map(function (block) {
          return { key: block.key, visible: true };
        })
      };
    });
    return out;
  }

  function mergeThemeDefaults(data) {
    var defaults = defaultThemeDb();
    T.SECTIONS.forEach(function (section) {
      var target = data.sections[section] || {};
      var base = defaults.sections[section];
      Object.keys(base).forEach(function (key) {
        if (target[key] === undefined || target[key] === null) target[key] = base[key];
      });
      var oldBlocks = {};
      (target.blocks || []).forEach(function (block) { oldBlocks[block.key] = block; });
      var definitions = PAGE_BLOCKS[section] || [];
      var ordered = [];
      (target.blocks || []).forEach(function (block) {
        if (definitions.some(function (definition) { return definition.key === block.key; })) {
          ordered.push(block.key);
        }
      });
      definitions.forEach(function (block) {
        if (ordered.indexOf(block.key) < 0) ordered.push(block.key);
      });
      target.blocks = ordered.map(function (key) {
        return {
          key: key,
          visible: !oldBlocks[key] || oldBlocks[key].visible !== false,
          title: oldBlocks[key] && oldBlocks[key].title ? oldBlocks[key].title : ''
        };
      });
      data.sections[section] = target;
    });
    return data;
  }

  function loadTheme() {
    return readFile(THEME_PATH).then(function (file) {
      if (!file) {
        S.theme = defaultThemeDb();
        S.themeSha = null;
      } else {
        try { S.theme = JSON.parse(file.text); }
        catch (e) {
          throw new Error('File data/site-settings.json không đúng định dạng JSON. Trang admin đã dừng để bảo vệ cấu hình giao diện.');
        }
        if (!S.theme || !S.theme.sections || typeof S.theme.sections !== 'object') {
          throw new Error('File data/site-settings.json thiếu đối tượng "sections".');
        }
        S.themeSha = file.sha;
      }
      S.theme = mergeThemeDefaults(S.theme);
      S.themeSaved = JSON.parse(JSON.stringify(S.theme));
      S.themeDirty = false;
    });
  }

  function saveTheme() {
    S.theme.version = 2;
    S.theme.updatedAt = new Date().toISOString();
    var json = JSON.stringify(S.theme, null, 2) + '\n';
    return writeFile(THEME_PATH, json, 'Cập nhật giao diện website', S.themeSha)
      .then(function (res) {
        S.themeSha = res.content.sha;
        S.themeSaved = JSON.parse(JSON.stringify(S.theme));
        S.themeDirty = false;
      });
  }

  function findPost(id) {
    var hit = null;
    (S.db && S.db.posts || []).forEach(function (p) { if (p.id === id) hit = p; });
    return hit;
  }

  function upsertPost(record) {
    var idx = -1;
    S.db.posts.forEach(function (p, i) { if (p.id === record.id) idx = i; });
    if (idx >= 0) S.db.posts[idx] = record; else S.db.posts.push(record);
  }

  /* ───────────────── Trình soạn thảo ───────────────── */
  var editor = $('#editor');
  var editorPointer = document.createElement('span');
  editorPointer.className = 'admin-editor-cursor';
  editorPointer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(editorPointer);
  document.documentElement.classList.add('has-admin-editor-cursor');

  function moveEditorPointer(event) {
    editorPointer.style.left = event.clientX + 'px';
    editorPointer.style.top = event.clientY + 'px';
    editorPointer.classList.add('is-visible');
  }

  function hideEditorPointer() {
    editorPointer.classList.remove('is-visible');
  }

  editor.addEventListener('pointerenter', moveEditorPointer);
  editor.addEventListener('pointermove', moveEditorPointer);
  editor.addEventListener('pointerleave', hideEditorPointer);
  editor.addEventListener('pointercancel', hideEditorPointer);
  window.addEventListener('blur', hideEditorPointer);

  function focusEditor() { if (document.activeElement !== editor) editor.focus(); }

  function exec(cmd, value) {
    focusEditor();
    document.execCommand(cmd, false, value === undefined ? null : value);
    syncToolbar();
    afterEdit();
  }

  function setBlock(tag) {
    focusEditor();
    document.execCommand('formatBlock', false, tag);
    afterEdit();
  }

  function insertHtml(html) {
    focusEditor();
    document.execCommand('insertHTML', false, html);
    afterEdit();
  }

  function afterEdit() {
    countWords();
    saveDraftSoon();
    schedulePreview();
    updateFormStatus();
  }

  function syncToolbar() {
    ['bold', 'italic', 'underline', 'strikeThrough', 'insertUnorderedList', 'insertOrderedList']
      .forEach(function (cmd) {
        var btn = document.querySelector('.tb[data-cmd="' + cmd + '"]');
        if (!btn) return;
        var on = false;
        try { on = document.queryCommandState(cmd); } catch (e) { on = false; }
        btn.classList.toggle('on', on);
      });
  }

  function countWords() {
    var text = editor.innerText.trim();
    var n = text ? text.split(/\s+/).length : 0;
    $('#wordcount').textContent = n + ' từ · ~' + Math.max(1, Math.ceil(n / 220)) + ' phút đọc';
  }

  /* Làm sạch HTML dán từ Word/web */
  function cleanHtml(raw) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = raw;
    wrapper.querySelectorAll('script,style,meta,link,noscript').forEach(function (n) { n.remove(); });
    wrapper.querySelectorAll('*').forEach(function (el) {
      if (!el.parentNode) return;
      Array.prototype.slice.call(el.attributes).forEach(function (attr) {
        var name = attr.name.toLowerCase();
        var keep = (name === 'href' || name === 'src' || name === 'alt' || name === 'title' ||
                    name === 'colspan' || name === 'rowspan' || name === 'id');
        if (!keep || name.indexOf('on') === 0) el.removeAttribute(attr.name);
      });
      if (el.tagName === 'A') {
        var href = el.getAttribute('href') || '';
        if (/^javascript:/i.test(href)) el.removeAttribute('href');
        if (/^https?:/i.test(href)) { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
      }
      if (el.tagName === 'FONT' || el.tagName === 'SPAN') {
        while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
        el.remove();
      }
    });
    return wrapper.innerHTML;
  }

  function syncFromHtmlView() {
    var view = $('#html-view');
    if (!view.hidden) editor.innerHTML = view.value;
  }

  /* Chuẩn hoá nội dung trước khi lưu */
  function exportContent() {
    syncFromHtmlView();
    var wrapper = document.createElement('div');
    wrapper.innerHTML = editor.innerHTML;
    wrapper.querySelectorAll('figure figure').forEach(function (inner) {
      var outer = inner.parentElement && inner.parentElement.closest('figure');
      if (outer && outer.parentNode) outer.parentNode.insertBefore(inner, outer.nextSibling);
    });
    wrapper.querySelectorAll('div:not([class])').forEach(function (d) {
      if (!d.parentNode) return;
      if (!d.querySelector('p,h2,h3,h4,ul,ol,figure,pre,table,blockquote')) {
        var p = document.createElement('p');
        while (d.firstChild) p.appendChild(d.firstChild);
        d.replaceWith(p);
      }
    });
    wrapper.querySelectorAll('h2').forEach(function (h, i) {
      if (!h.id) h.id = T.slugify(h.textContent) || ('phan-' + (i + 1));
    });
    wrapper.querySelectorAll('img').forEach(function (img) {
      img.setAttribute('loading', 'lazy');
      if (!img.getAttribute('alt')) img.setAttribute('alt', '');
    });
    return wrapper.innerHTML
      .replace(/<div><br><\/div>/g, '')
      .replace(/<p><br><\/p>/g, '')
      .trim();
  }

  /* ───── Thanh công cụ ───── */
  $('#toolbar').addEventListener('click', function (e) {
    var btn = e.target.closest('.tb');
    if (!btn) return;
    e.preventDefault();
    if (btn.dataset.cmd) return exec(btn.dataset.cmd);

    var act = btn.dataset.act;
    if (act === 'clean') return exec('removeFormat');
    if (act === 'inlinecode') {
      var sel = window.getSelection().toString();
      return insertHtml('<code>' + (sel || 'code') + '</code>&nbsp;');
    }
    if (act === 'link') return actionLink();
    if (act === 'image-url') return actionImageUrl();
    if (act === 'image-upload') return pickImage(function (url, name) { insertFigure(url, name); });
    if (act === 'table') return actionTable();
    if (act === 'html') return toggleHtmlView();
    if (act === 'preview') return togglePreview();
  });

  $('#toolbar').querySelector('[data-block]').addEventListener('change', function (e) {
    setBlock(e.target.value);
    e.target.value = 'p';
  });

  $('#html-view').addEventListener('input', function () { saveDraftSoon(); schedulePreview(); updateFormStatus(); });
  editor.addEventListener('keyup', function () { syncToolbar(); afterEdit(); });
  editor.addEventListener('mouseup', syncToolbar);
  editor.addEventListener('input', afterEdit);

  editor.addEventListener('paste', function (e) {
    var items = (e.clipboardData || {}).items || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) {
        e.preventDefault();
        var file = items[i].getAsFile();
        return uploadImage(file)
          .then(function (url) { insertFigure(url, ''); })
          .catch(function () { /* uploadImage đã hiển thị lỗi */ });
      }
    }
    var html = e.clipboardData && e.clipboardData.getData('text/html');
    if (html) { e.preventDefault(); insertHtml(cleanHtml(html)); }
  });

  ['dragenter', 'dragover'].forEach(function (ev) {
    editor.addEventListener(ev, function (e) { e.preventDefault(); editor.classList.add('drag'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    editor.addEventListener(ev, function (e) { e.preventDefault(); editor.classList.remove('drag'); });
  });
  editor.addEventListener('drop', function (e) {
    var files = Array.prototype.slice.call(e.dataTransfer && e.dataTransfer.files || [])
      .filter(function (file) { return /^image\//.test(file.type); });
    if (!files.length) return;
    files.reduce(function (chain, file) {
      return chain
        .then(function () { return uploadImage(file); })
        .then(function (url) { insertFigure(url, file.name.replace(/\.[^.]+$/, '')); });
    }, Promise.resolve()).catch(function () { /* uploadImage đã hiển thị lỗi */ });
  });

  document.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    if (e.key === 's') { e.preventDefault(); saveDraft(); toast('Đã lưu nháp trên máy', 'ok'); }
  });

  function actionLink() {
    var sel = window.getSelection().toString();
    ask({
      title: 'Chèn liên kết',
      body: '<label class="field"><span>Địa chỉ (URL)</span><input data-name="url" type="text" placeholder="https://..."></label>' +
            (sel ? '' : '<label class="field"><span>Chữ hiển thị</span><input data-name="text" type="text"></label>')
    }).then(function (r) {
      if (!r || !r.url) return;
      if (sel) exec('createLink', r.url);
      else insertHtml('<a href="' + T.escapeHtml(r.url) + '" target="_blank" rel="noopener">' + T.escapeHtml(r.text || r.url) + '</a>&nbsp;');
    });
  }

  function actionImageUrl() {
    ask({
      title: 'Chèn ảnh bằng đường dẫn',
      body: '<label class="field"><span>URL ảnh</span><input data-name="url" type="text" placeholder="https://..."></label>' +
            '<label class="field"><span>Chú thích (không bắt buộc)</span><input data-name="cap" type="text"></label>'
    }).then(function (r) {
      if (!r || !r.url) return;
      insertFigure(r.url, r.cap);
    });
  }

  function actionTable() {
    ask({
      title: 'Chèn bảng',
      body: '<label class="field"><span>Số cột</span><input data-name="cols" type="number" value="3" min="1" max="10"></label>' +
            '<label class="field"><span>Số dòng (không tính dòng tiêu đề)</span><input data-name="rows" type="number" value="3" min="1" max="30"></label>'
    }).then(function (r) {
      if (!r) return;
      var cols = Math.min(10, Math.max(1, parseInt(r.cols, 10) || 3));
      var rows = Math.min(30, Math.max(1, parseInt(r.rows, 10) || 3));
      var html = '<table><thead><tr>';
      for (var c = 0; c < cols; c++) html += '<th>Cột ' + (c + 1) + '</th>';
      html += '</tr></thead><tbody>';
      for (var i = 0; i < rows; i++) {
        html += '<tr>';
        for (var j = 0; j < cols; j++) html += '<td>&nbsp;</td>';
        html += '</tr>';
      }
      html += '</tbody></table><p><br></p>';
      insertHtml(html);
    });
  }

  function insertFigure(url, caption) {
    /* Luôn đặt figure ở cấp cao nhất. Cách chèn cũ dùng execCommand có thể
       lồng figure mới vào figure trước đó khi tải nhiều ảnh liên tiếp. */
    var figure = document.createElement('figure');
    var image = document.createElement('img');
    image.src = url;
    image.alt = caption || '';
    image.loading = 'lazy';
    figure.appendChild(image);
    if (caption) {
      var figcaption = document.createElement('figcaption');
      figcaption.textContent = caption;
      figure.appendChild(figcaption);
    }
    var spacer = document.createElement('p');
    spacer.appendChild(document.createElement('br'));

    var selection = window.getSelection();
    var node = selection && selection.rangeCount ? selection.anchorNode : null;
    if (node && node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    var topBlock = node;
    while (topBlock && topBlock !== editor && topBlock.parentNode !== editor) {
      topBlock = topBlock.parentNode;
    }

    if (topBlock && topBlock !== editor && topBlock.parentNode === editor) {
      topBlock.after(figure, spacer);
    } else {
      editor.append(figure, spacer);
    }

    var range = document.createRange();
    range.selectNodeContents(spacer);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    editor.focus();
    afterEdit();
  }

  function toggleHtmlView() {
    var view = $('#html-view');
    if (view.hidden) {
      view.value = exportContent();
      view.hidden = false;
      editor.hidden = true;
    } else {
      editor.innerHTML = view.value;
      view.hidden = true;
      editor.hidden = false;
      countWords();
    }
  }

  /* ───────────────── Xem trước tại chỗ ───────────────── */
  var previewOn = false;
  var previewTimer;

  function togglePreview() {
    previewOn = !previewOn;
    $('#preview-pane').hidden = !previewOn;
    $('#editor-stage').classList.toggle('split', previewOn);
    document.querySelector('.tb[data-act="preview"]').classList.toggle('on', previewOn);
    if (previewOn) renderPreview();
  }

  function schedulePreview() {
    if (!previewOn) return;
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 600);
  }

  function buildPreviewHtml() {
    var p = readForm();
    if (!p.title) p.title = 'Bài chưa có tiêu đề';
    if (!p.description) p.description = 'Chưa có mô tả ngắn.';
    if (!p.cover) p.cover = T.defaultCover(p.section);
    return T.render(p)
      .replace(/<script[^>]*><\/script>/g, '')
      .replace('</head>', '<base href="' + location.origin + '/"></head>');
  }

  function renderPreview() {
    try { $('#preview-frame').srcdoc = buildPreviewHtml(); }
    catch (e) { /* bỏ qua */ }
  }

  $('#btn-preview-new').addEventListener('click', function () {
    var w = window.open('', '_blank');
    if (!w) return toast('Trình duyệt đã chặn cửa sổ mới', 'err');
    w.document.open(); w.document.write(buildPreviewHtml()); w.document.close();
  });

  document.querySelector('.preview-devices').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-device]');
    if (!btn) return;
    $$('.preview-devices .dev').forEach(function (b) { b.classList.toggle('active', b === btn); });
    $('#preview-frame-wrap').classList.toggle('mobile', btn.dataset.device === 'mobile');
  });

  /* ───────────────── Tải ảnh lên repo ───────────────── */
  var pendingPick = null;
  $('#file-input').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file || !pendingPick) return;
    var cb = pendingPick; pendingPick = null;
    uploadImage(file)
      .then(function (url) { cb(url, file.name.replace(/\.[^.]+$/, '')); })
      .catch(function () { /* uploadImage đã hiển thị lỗi */ });
  });

  function pickImage(cb) { pendingPick = cb; $('#file-input').click(); }

  function uploadImage(file, options) {
    options = options || {};
    if (!file) return Promise.reject(new Error('Không có file'));
    if (file.size > 5 * 1024 * 1024) {
      if (!options.quiet) toast('Ảnh lớn hơn 5MB, hãy nén bớt trước khi tải lên.', 'err');
      return Promise.reject(new Error('Ảnh quá lớn'));
    }
    if (!options.quiet) busy(true, 'Đang tải ảnh lên GitHub…');
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var b64 = String(reader.result).split(',')[1];
        var now = new Date();
        var safe = T.slugify(file.name.replace(/\.[^.]+$/, '')) || 'anh';
        var ext = (file.name.match(/\.[a-z0-9]+$/i) || ['.png'])[0].toLowerCase();
        var path = 'uploads/' + now.getFullYear() + '/' +
                   String(now.getMonth() + 1).padStart(2, '0') + '/' +
                   Date.now() + '-' + Math.random().toString(36).slice(2, 7) + '-' + safe + ext;
        writeFile(path, { b64: b64 }, 'Tải ảnh: ' + path)
          .then(function () {
            if (!options.quiet) { busy(false); toast('Đã tải ảnh lên', 'ok'); }
            resolve('/' + path);
          })
          .catch(function (err) {
            if (!options.quiet) { busy(false); toast(err.message, 'err'); }
            reject(err);
          });
      };
      reader.onerror = function () {
        if (!options.quiet) busy(false);
        reject(new Error('Không đọc được file'));
      };
      reader.readAsDataURL(file);
    });
  }

  function uploadPhotoFiles(files) {
    var list = Array.prototype.slice.call(files || []).filter(function (file) {
      return /^image\//.test(file.type);
    });
    if (!list.length) return Promise.resolve([]);
    var tooLarge = list.find(function (file) { return file.size > 5 * 1024 * 1024; });
    if (tooLarge) {
      toast('Ảnh "' + tooLarge.name + '" lớn hơn 5MB. Hãy nén ảnh rồi chọn lại.', 'err');
      return Promise.reject(new Error('Ảnh quá lớn'));
    }
    var uploaded = [];
    return list.reduce(function (chain, file, index) {
      return chain.then(function () {
        busy(true, 'Đang tải ảnh ' + (index + 1) + ' / ' + list.length + ' lên GitHub…');
        return uploadImage(file, { quiet: true }).then(function (url) {
          uploaded.push({
            url: url,
            name: file.name.replace(/\.[^.]+$/, '') || ('Ảnh ' + (index + 1))
          });
        });
      });
    }, Promise.resolve()).then(function () {
      busy(false);
      toast('✅ Đã tải lên ' + uploaded.length + ' ảnh', 'ok');
      return uploaded;
    }).catch(function (error) {
      busy(false);
      toast(error.message, 'err');
      throw error;
    });
  }

  var PHOTO_ALBUM_LABELS = {
    selfies: 'Selfies',
    'small-moments': 'Khoảnh khắc nhỏ',
    favorites: 'Sở thích & đồ nhặt được',
    'macro-life': 'Ong @@ & thế giới tí hon',
    places: 'Đường đi & nơi chốn'
  };
  var PHOTO_DESTINATION_LABELS = {
    blog: 'Photos cá nhân',
    nghethuat: 'Nghệ thuật',
    'game-capture': 'Game · Capture Mode'
  };

  function photoDestination(photo) {
    return photo && photo.destination ? photo.destination : 'blog';
  }

  function updatePhotoDestinationUi() {
    var destination = $('#photo-destination').value;
    $('#photo-album-wrap').hidden = destination !== 'blog';
    $('#photo-art-category-wrap').hidden = destination !== 'nghethuat';
    $('#photo-game-wrap').hidden = destination !== 'game-capture';
    $('#photo-link-wrap').hidden = destination === 'blog';
    $('#photo-form-title').textContent = S.editingPhotoId
      ? 'Sửa ảnh trong ' + PHOTO_DESTINATION_LABELS[destination]
      : 'Thêm ảnh vào ' + PHOTO_DESTINATION_LABELS[destination];
    $('#btn-photo-save').textContent = S.editingPhotoId
      ? '💾 Lưu thay đổi ảnh'
      : (destination === 'game-capture' ? '▧ Thêm vào Capture Mode' :
        destination === 'nghethuat' ? '▧ Thêm vào Nghệ thuật' : '▧ Thêm vào Photos');
    $('#btn-photo-open-gallery').textContent = destination === 'nghethuat'
      ? 'Mở trang Nghệ thuật ↗'
      : destination === 'game-capture' ? 'Mở Capture Mode ↗' : 'Mở trang Photos ↗';
  }

  function updatePhotoPreview() {
    var src = $('#photo-src').value.trim();
    var preview = $('#photo-preview');
    var uploads = S.pendingPhotoUploads || [];
    if (uploads.length) {
      preview.hidden = false;
      preview.classList.toggle('is-single', uploads.length === 1);
      preview.innerHTML = uploads.map(function (item) {
        return '<img src="' + T.escapeHtml(item.url) + '" alt="' + T.escapeHtml(item.name) + '">';
      }).join('') + '<span class="photo-upload-preview-count">Đã chọn ' + uploads.length +
        ' ảnh · mỗi ảnh sẽ được lưu thành một mục riêng</span>';
      return;
    }
    var valid = /^(?:https?:\/\/|\/(?!\/))/i.test(src);
    preview.hidden = !valid;
    preview.classList.add('is-single');
    preview.innerHTML = valid ? '<img src="' + T.escapeHtml(src) + '" alt="Ảnh xem trước">' : '';
  }

  function resetPhotoForm() {
    S.editingPhotoId = null;
    S.pendingPhotoUploads = [];
    $('#photo-edit-pill').textContent = 'Ảnh mới';
    $('#photo-edit-pill').classList.remove('editing');
    $('#photo-title').value = '';
    $('#photo-src').value = '';
    $('#photo-note').value = '';
    $('#photo-game').value = '';
    $('#photo-link').value = '';
    $('#photo-date').value = todayISO();
    $('#photo-preview').hidden = true;
    $('#photo-preview').innerHTML = '';
    $('#btn-photo-upload').textContent = '⬆ Chọn một hoặc nhiều ảnh';
    $('#btn-photo-cancel').hidden = true;
    updatePhotoDestinationUi();
  }

  function renderPhotoList() {
    if (!S.photos) return;
    var list = S.photos.photos.slice().sort(function (a, b) {
      return String(b.updatedAt || b.date || '').localeCompare(String(a.updatedAt || a.date || ''));
    });
    $('#photo-list-summary').textContent = list.length
      ? list.length + ' ảnh được quản lý tại đây · mỗi ảnh chỉ hiện ở nơi đã chọn'
      : 'Chưa có ảnh nào được thêm bằng admin';
    var root = $('#photo-admin-list');
    if (!list.length) {
      root.innerHTML = '<div class="photo-admin-empty">Tải tấm ảnh đầu tiên để bắt đầu kho Photos.</div>';
      return;
    }
    root.innerHTML = list.map(function (photo) {
      return '<article class="photo-admin-item" data-photo-id="' + T.escapeHtml(photo.id) + '">' +
        '<img src="' + T.escapeHtml(photo.src) + '" alt="">' +
        '<div class="photo-admin-copy">' +
          '<span class="photo-admin-meta">' + T.escapeHtml(PHOTO_DESTINATION_LABELS[photoDestination(photo)]) +
            ' · ' + T.escapeHtml(photoDestination(photo) === 'blog'
              ? (PHOTO_ALBUM_LABELS[photo.album] || photo.album)
              : (photoDestination(photo) === 'game-capture' ? (photo.game || 'Game') : (photo.category || 'Nghệ thuật'))) +
            ' · ' + T.escapeHtml(photo.date || '') + '</span>' +
          '<h3>' + T.escapeHtml(photo.title || 'Ảnh chưa đặt tên') + '</h3>' +
          '<p>' + T.escapeHtml(photo.note || 'Chưa có ghi chú.') + '</p>' +
        '</div>' +
        '<div class="photo-admin-buttons">' +
          '<button class="btn ghost small" type="button" data-photo-action="edit">Sửa</button>' +
          '<button class="btn danger small" type="button" data-photo-action="delete">Xóa</button>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  function editPhoto(photo) {
    S.editingPhotoId = photo.id;
    S.pendingPhotoUploads = [];
    $('#photo-edit-pill').textContent = 'Đang sửa';
    $('#photo-edit-pill').classList.add('editing');
    $('#photo-destination').value = PHOTO_DESTINATION_LABELS[photoDestination(photo)]
      ? photoDestination(photo) : 'blog';
    $('#photo-album').value = PHOTO_ALBUM_LABELS[photo.album] ? photo.album : 'small-moments';
    $('#photo-art-category').value = photo.category || 'khac';
    $('#photo-game').value = photo.game || '';
    $('#photo-title').value = photo.title || '';
    $('#photo-src').value = photo.src || '';
    $('#photo-date').value = photo.date || todayISO();
    $('#photo-note').value = photo.note || '';
    $('#photo-link').value = photo.link || '';
    $('#btn-photo-cancel').hidden = false;
    $('#btn-photo-upload').textContent = '⬆ Chọn ảnh thay thế';
    updatePhotoDestinationUi();
    updatePhotoPreview();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function savePhotoFromForm() {
    var title = $('#photo-title').value.trim();
    var src = $('#photo-src').value.trim();
    var queued = !S.editingPhotoId ? (S.pendingPhotoUploads || []).slice() : [];
    if (!queued.length && !title) {
      $('#photo-title').focus();
      return toast('Hãy đặt tiêu đề cho ảnh hoặc chọn file để dùng tên file.', 'err');
    }
    if (!queued.length && !/^(?:https?:\/\/|\/(?!\/))/i.test(src)) {
      $('#photo-src').focus();
      return toast('Hãy tải ảnh từ máy hoặc nhập URL ảnh hợp lệ.', 'err');
    }
    var old = null;
    (S.photos.photos || []).forEach(function (item) {
      if (item.id === S.editingPhotoId) old = item;
    });
    var now = new Date().toISOString();
    var destination = $('#photo-destination').value;
    var sources = queued.length ? queued : [{ url: src, name: title }];
    var stamp = Date.now().toString(36);
    var records = sources.map(function (item, itemIndex) {
      var itemTitle = title
        ? (sources.length > 1 ? title + ' · ' + String(itemIndex + 1).padStart(2, '0') : title)
        : item.name;
      return {
        id: old ? old.id : ('photo-' + stamp + '-' + itemIndex.toString(36)),
        destination: destination,
        album: $('#photo-album').value,
        category: $('#photo-art-category').value,
        game: $('#photo-game').value.trim(),
        title: itemTitle || ('Ảnh ' + (itemIndex + 1)),
        src: item.url,
        date: $('#photo-date').value || todayISO(),
        note: $('#photo-note').value.trim(),
        link: $('#photo-link').value.trim(),
        author: 'Linh Osimi',
        createdAt: old && old.createdAt ? old.createdAt : now,
        updatedAt: now
      };
    });
    records.forEach(function (photo) {
      var index = S.photos.photos.findIndex(function (item) { return item.id === photo.id; });
      if (index >= 0) S.photos.photos[index] = photo;
      else S.photos.photos.push(photo);
    });
    busy(true, old ? 'Đang lưu thay đổi ảnh…' : 'Đang thêm ' + records.length + ' ảnh vào thư viện…');
    var messageTitle = title || (records.length === 1 ? records[0].title : records.length + ' ảnh');
    savePhotos((old ? 'Cập nhật ảnh: ' : 'Thêm ảnh vào ' + PHOTO_DESTINATION_LABELS[destination] + ': ') + messageTitle)
      .then(function () {
        busy(false);
        resetPhotoForm();
        renderPhotoList();
        toast(old ? '✅ Đã cập nhật ảnh' :
          '✅ Đã thêm ' + records.length + ' ảnh vào ' + PHOTO_DESTINATION_LABELS[destination], 'ok');
      })
      .catch(function (error) {
        busy(false);
        /* Khôi phục dữ liệu mới nhất nếu lần ghi thất bại. */
        loadPhotos().then(renderPhotoList);
        toast(error.message, 'err');
      });
  }

  $('#photo-src').addEventListener('input', function () {
    S.pendingPhotoUploads = [];
    updatePhotoPreview();
  });
  $('#photo-destination').addEventListener('change', updatePhotoDestinationUi);
  $('#btn-photo-upload').addEventListener('click', function () {
    var input = $('#photo-file-input');
    input.multiple = !S.editingPhotoId;
    input.click();
  });
  $('#photo-file-input').addEventListener('change', function (event) {
    var files = Array.prototype.slice.call(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    uploadPhotoFiles(files).then(function (uploads) {
      if (!uploads.length) return;
      if (S.editingPhotoId) {
        S.pendingPhotoUploads = [];
        $('#photo-src').value = uploads[0].url;
        if (!$('#photo-title').value.trim()) $('#photo-title').value = uploads[0].name;
      } else {
        S.pendingPhotoUploads = uploads;
        $('#photo-src').value = uploads[0].url;
        if (uploads.length === 1 && !$('#photo-title').value.trim()) {
          $('#photo-title').value = uploads[0].name;
        }
        $('#btn-photo-upload').textContent = '⬆ Đổi danh sách ảnh (' + uploads.length + ')';
      }
      updatePhotoPreview();
    }).catch(function () { /* uploadPhotoFiles đã hiển thị lỗi */ });
  });
  $('#btn-photo-save').addEventListener('click', savePhotoFromForm);
  $('#btn-photo-cancel').addEventListener('click', resetPhotoForm);
  $('#btn-open-photos').addEventListener('click', function () {
    $('#photo-destination').value = 'blog';
    resetPhotoForm();
    switchTab('photos');
  });
  $('#btn-open-game-captures').addEventListener('click', function () {
    $('#photo-destination').value = 'game-capture';
    resetPhotoForm();
    switchTab('photos');
  });
  $('#btn-photo-open-gallery').addEventListener('click', function () {
    var destination = $('#photo-destination').value;
    var url = destination === 'nghethuat'
      ? '/nghe-thuat0/nghe-thuat.html'
      : destination === 'game-capture' ? '/game0/2/game3.html' : '/blog/gallery.html';
    window.open(url, '_blank');
  });
  $('#btn-photo-reload').addEventListener('click', function () {
    busy(true, 'Đang tải lại kho ảnh…');
    loadPhotos().then(function () {
      busy(false); resetPhotoForm(); renderPhotoList(); toast('Đã tải lại kho ảnh');
    }).catch(function (error) { busy(false); toast(error.message, 'err'); });
  });
  $('#photo-admin-list').addEventListener('click', function (event) {
    var button = event.target.closest('[data-photo-action]');
    var row = event.target.closest('[data-photo-id]');
    if (!button || !row) return;
    var photo = S.photos.photos.find(function (item) { return item.id === row.dataset.photoId; });
    if (!photo) return;
    if (button.dataset.photoAction === 'edit') return editPhoto(photo);
    ask({
      title: 'Xóa ảnh khỏi thư viện?',
      body: '<p>Ảnh <b>' + T.escapeHtml(photo.title) + '</b> sẽ biến mất khỏi ' +
        T.escapeHtml(PHOTO_DESTINATION_LABELS[photoDestination(photo)]) +
        '. File ảnh đã tải lên vẫn được giữ để tránh xóa nhầm.</p>',
      okText: 'Xóa khỏi thư viện', danger: true
    }).then(function (answer) {
      if (!answer) return;
      S.photos.photos = S.photos.photos.filter(function (item) { return item.id !== photo.id; });
      busy(true, 'Đang xóa ảnh khỏi thư viện…');
      savePhotos('Xóa ảnh khỏi thư viện: ' + photo.title).then(function () {
        busy(false); resetPhotoForm(); renderPhotoList(); toast('Đã xóa ảnh khỏi thư viện', 'ok');
      }).catch(function (error) {
        busy(false); loadPhotos().then(renderPhotoList); toast(error.message, 'err');
      });
    });
  });

  /* ───────────────── Biểu mẫu thông tin bài ───────────────── */
  var MANGA_STRUCTURE =
      '<h2>Bối cảnh</h2>' +
      '<p>Giới thiệu arc, chương truyện hoặc vấn đề cần phân tích.</p>' +
      '<figure><div class="manga-image-placeholder">THÊM KHUNG MANGA</div><figcaption>Bối cảnh của bài viết.</figcaption></figure>' +
      '<h2>Luận điểm chính</h2>' +
      '<p>Trình bày ý chính và các chi tiết trong truyện hỗ trợ cho nhận định.</p>' +
      '<blockquote>Một câu thoại, biểu tượng hoặc chi tiết then chốt.</blockquote>' +
      '<h2>Đối chiếu</h2>' +
      '<p>So sánh các nhân vật, biến cố hoặc cách tác giả triển khai chủ đề.</p>' +
      '<h2>Kết luận</h2>' +
      '<p>Tóm lại ý nghĩa của chủ đề đối với toàn bộ tác phẩm.</p>';

  var FILM_STRUCTURE =
      '<h2>Tóm tắt cốt truyện</h2>' +
      '<p>Giới thiệu tiền đề của bộ phim và hoàn cảnh chính, tránh tiết lộ nút thắt quan trọng.</p>' +
      '<figure><div class="film-image-placeholder">THÊM ẢNH CẢNH PHIM</div><figcaption>Chú thích cho cảnh phim.</figcaption></figure>' +
      '<h2>Dàn diễn viên và nhân vật</h2>' +
      '<p>Giới thiệu những nhân vật quan trọng và cách diễn viên thể hiện họ.</p>' +
      '<h2>Cảm nhận</h2>' +
      '<p>Phân tích nhịp phim, cảm xúc và điều khiến bộ phim đáng nhớ.</p>' +
      '<blockquote>Một câu thoại hoặc câu hỏi trung tâm của bộ phim.</blockquote>' +
      '<h2>Hình ảnh và âm thanh</h2>' +
      '<p>Nhận xét về máy quay, màu sắc, dựng phim, âm nhạc và thiết kế âm thanh.</p>' +
      '<h2>Chủ đề</h2>' +
      '<p>Trình bày chủ đề chính và cách bộ phim phát triển thông điệp đó.</p>' +
      '<h2>Đánh giá</h2>' +
      '<p>Kết luận không spoil: bộ phim phù hợp với ai và có nên xem hay không.</p>';

  function applyMangaStructure() {
    var html = MANGA_STRUCTURE;
    function useStructure() {
      editor.innerHTML = html;
      $('#html-view').value = html;
      $('#html-view').hidden = true;
      editor.hidden = false;
      afterEdit();
      toast('Đã tạo khung bài Manga — hãy thay nội dung gợi ý và thêm ảnh', 'ok');
    }
    syncFromHtmlView();
    if (!editor.innerText.trim()) return useStructure();
    ask({
      title: 'Thay nội dung hiện tại bằng khung Manga?',
      body: '<p>Thao tác này sẽ thay phần nội dung đang soạn. Tiêu đề, ảnh bìa và các thông tin khác vẫn được giữ nguyên.</p>',
      okText: 'Dùng khung mới',
      danger: true
    }).then(function (answer) {
      if (answer) useStructure();
    });
  }

  function applyFilmStructure() {
    var html = FILM_STRUCTURE;
    function useStructure() {
      editor.innerHTML = html;
      $('#html-view').value = html;
      $('#html-view').hidden = true;
      editor.hidden = false;
      afterEdit();
      toast('Đã tạo khung bài Phim theo mẫu Cold Fish — hãy thay nội dung gợi ý và thêm ảnh', 'ok');
    }
    syncFromHtmlView();
    if (!editor.innerText.trim()) return useStructure();
    ask({
      title: 'Thay nội dung hiện tại bằng khung bài Phim?',
      body: '<p>Thao tác này sẽ thay phần nội dung đang soạn. Tiêu đề, ảnh bìa và hồ sơ phim vẫn được giữ nguyên.</p>',
      okText: 'Dùng khung Cold Fish',
      danger: true
    }).then(function (answer) {
      if (answer) useStructure();
    });
  }

  function fillCategories() {
    var section = $('#f-section').value;
    var map = T.categoriesOf(section);
    var sel = $('#f-category');
    var current = sel.value;
    sel.innerHTML = '';
    Object.keys(map).forEach(function (key) {
      var opt = document.createElement('option');
      opt.value = key;
      opt.textContent = map[key].label;
      sel.appendChild(opt);
    });
    if (map[current]) sel.value = current;
    applySectionUi(section);
  }

  function applySectionUi(section) {
    var isBlog = section === 'blog';
    var isGame = section === 'game';
    var isManga = section === 'manga';
    var isFilm = section === 'phim';
    var gamePlacement = $('#f-game-placement').value || 'article';
    var isBlogPhoto = isBlog && $('#f-category').value === 'photo' && !S.editingId && !S.editingLegacy;
    var isGameCapture = isGame && gamePlacement === 'capture' && !S.editingId && !S.editingLegacy;
    $('#wrap-mood').hidden = !isBlog;
    $('#wrap-game-placement').hidden = !isGame;
    $('#wrap-game-target').hidden = !(isGame && gamePlacement === 'play');
    $('#wrap-manga-options').hidden = !isManga;
    $('#wrap-film-options').hidden = !isFilm;
    $('#blog-photo-notice').hidden = !isBlogPhoto;
    $('#game-capture-notice').hidden = !isGameCapture;
    var coverLabel = $('#f-cover').parentNode.querySelector('span');
    if (coverLabel) coverLabel.textContent = isBlog ? 'Ảnh hoặc video kèm bài (URL)' : 'Ảnh bìa (URL)';
    var uploadBtn = $('#btn-cover-upload');
    if (uploadBtn) uploadBtn.textContent = isBlog ? '⬆ Tải ảnh kèm bài từ máy' : '⬆ Tải ảnh bìa từ máy';
    if (isBlogPhoto || isGameCapture) {
      $('#btn-publish').textContent = isGameCapture ? '▧ Mở Thư viện ảnh Game' : '▧ Mở Kho ảnh';
      $('#btn-save-draft').hidden = true;
    } else {
      applyStatusUi();
    }
  }

  var STATUS_HINT = {
    published: 'Bài hiện ngay trên trang danh sách sau khi GitHub Pages build xong.',
    scheduled: 'Bài được ghi lên web nhưng chỉ hiện ở trang danh sách từ ngày đăng trở đi. Người biết URL vẫn mở được sớm.',
    draft: 'Chỉ lưu trong data/posts.json, không sinh file HTML và không hiện ở đâu. Lưu ý repo là công khai nên nội dung nháp vẫn đọc được nếu ai đó mở file đó.'
  };

  function applyStatusUi() {
    var routesToPhotos = (
      ($('#f-section').value === 'blog' && $('#f-category').value === 'photo') ||
      ($('#f-section').value === 'game' && $('#f-game-placement').value === 'capture')
    ) && !S.editingId && !S.editingLegacy;
    if (routesToPhotos) {
      $('#btn-publish').textContent = $('#f-section').value === 'game'
        ? '▧ Mở Thư viện ảnh Game' : '▧ Mở Kho ảnh';
      $('#btn-save-draft').hidden = true;
      return;
    }
    var st = $('#f-status').value;
    $('#status-hint').textContent = STATUS_HINT[st] || '';
    $('#btn-publish').textContent = st === 'draft'
      ? '💾 Lưu nháp lên GitHub'
      : ((S.editingId || S.editingLegacy) ? '💾 Cập nhật bài viết' : '🚀 Đăng bài lên web');
    $('#btn-save-draft').hidden = st === 'draft' || !!S.editingLegacy;
  }

  $('#f-section').addEventListener('change', function () { fillCategories(); saveDraftSoon(); schedulePreview(); updateFormStatus(); });
  $('#f-game-placement').addEventListener('change', function () {
    applySectionUi($('#f-section').value);
    saveDraftSoon();
    schedulePreview();
    updateFormStatus();
  });
  ['#f-manga-kicker', '#f-manga-quote'].forEach(function (sel) {
    $(sel).addEventListener('input', function () { saveDraftSoon(); schedulePreview(); });
  });
  ['#f-film-year', '#f-film-director', '#f-film-duration', '#f-film-warning'].forEach(function (sel) {
    $(sel).addEventListener('input', function () { saveDraftSoon(); schedulePreview(); });
  });
  $('#btn-manga-structure').addEventListener('click', applyMangaStructure);
  $('#btn-film-structure').addEventListener('click', applyFilmStructure);
  $('#f-status').addEventListener('change', function () { applyStatusUi(); saveDraftSoon(); updateFormStatus(); });

  $('#mood-picker').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-mood]');
    if (!btn) return;
    $('#f-mood').value = btn.dataset.mood;
    saveDraft();
  });
  $('#f-mood').addEventListener('input', saveDraftSoon);

  var slugTouched = false;
  $('#f-slug').addEventListener('input', function () { slugTouched = true; saveDraftSoon(); });
  $('#f-title').addEventListener('input', function () {
    if (!slugTouched) $('#f-slug').value = T.slugify($('#f-title').value);
    saveDraftSoon();
    schedulePreview();
  });
  ['#f-desc', '#f-cover', '#f-tags', '#f-date', '#f-category'].forEach(function (sel) {
    $(sel).addEventListener('input', function () {
      if (sel === '#f-category') applySectionUi($('#f-section').value);
      saveDraftSoon(); schedulePreview(); updateFormStatus();
    });
  });
  $('#f-cover').addEventListener('input', updateCoverPreview);

  function updateCoverPreview() {
    var url = $('#f-cover').value.trim();
    var box = $('#cover-preview');
    if (!url || /\.(mp4|webm|ogv|mov)(\?|$)/i.test(url)) { box.hidden = true; return; }
    box.hidden = false;
    box.querySelector('img').src = url;
  }

  $('#btn-cover-upload').addEventListener('click', function () {
    pickImage(function (url) { $('#f-cover').value = url; updateCoverPreview(); saveDraft(); schedulePreview(); });
  });

  function readForm(lightweight) {
    var title = $('#f-title').value.trim();
    var slug = T.slugify($('#f-slug').value.trim() || title);
    var section = $('#f-section').value;
    return {
      section: section,
      category: $('#f-category').value,
      placement: section === 'game' ? ($('#f-game-placement').value || 'article') : '',
      targetUrl: section === 'game' ? $('#f-target-url').value.trim() : '',
      mangaKicker: section === 'manga' ? $('#f-manga-kicker').value.trim() : '',
      mangaQuote: section === 'manga' ? $('#f-manga-quote').value.trim() : '',
      filmYear: section === 'phim' ? $('#f-film-year').value.trim() : '',
      filmDirector: section === 'phim' ? $('#f-film-director').value.trim() : '',
      filmDuration: section === 'phim' ? $('#f-film-duration').value.trim() : '',
      filmWarning: section === 'phim' ? $('#f-film-warning').value.trim() : '',
      status: $('#f-status').value,
      title: title,
      slug: slug,
      id: (S.editingId || (T.idPrefix(section) + slug)),
      description: $('#f-desc').value.trim(),
      cover: $('#f-cover').value.trim(),
      tags: $('#f-tags').value.split(/[,;\n]+/).map(function (s) { return s.trim(); }).filter(Boolean),
      date: $('#f-date').value || todayISO(),
      time: S.postTime || new Date().toTimeString().slice(0, 5),
      mood: $('#f-mood').value.trim(),
      author: 'Linh Osimi',
      content: lightweight
        ? ($('#html-view').hidden ? editor.innerHTML : $('#html-view').value)
        : exportContent()
    };
  }

  function writeForm(p) {
    $('#f-section').value = p.section || 'kienthuc';
    S.postTime = p.time || '';
    fillCategories();
    var map = T.categoriesOf(p.section || 'kienthuc');
    $('#f-category').value = (p.category && map[p.category]) ? p.category : Object.keys(map)[0];
    $('#f-game-placement').value = p.placement || 'article';
    $('#f-target-url').value = p.targetUrl || '';
    $('#f-manga-kicker').value = p.mangaKicker || '';
    $('#f-manga-quote').value = p.mangaQuote || '';
    $('#f-film-year').value = p.filmYear || '';
    $('#f-film-director').value = p.filmDirector || '';
    $('#f-film-duration').value = p.filmDuration || '';
    $('#f-film-warning').value = p.filmWarning || '';
    $('#f-status').value = p.status || 'published';
    $('#f-mood').value = p.mood || '';
    $('#f-title').value = p.title || '';
    $('#f-slug').value = p.slug || '';
    $('#f-desc').value = p.description || '';
    $('#f-cover').value = p.cover || '';
    $('#f-tags').value = (p.tags || []).join(', ');
    $('#f-date').value = p.date || todayISO();
    editor.innerHTML = p.content || '';
    $('#html-view').hidden = true;
    editor.hidden = false;
    slugTouched = !!p.slug;
    updateCoverPreview();
    updateFormStatus();
    countWords();
    applyStatusUi();
    applySectionUi($('#f-section').value);
    updateEditPill();
    schedulePreview();
  }

  function updateEditPill() {
    var pill = $('#edit-pill');
    if (S.editingId || S.editingLegacy) {
      pill.textContent = S.editingLegacy ? 'Đang sửa bài cũ' : 'Đang sửa bài';
      pill.classList.add('editing');
    } else {
      pill.textContent = 'Bài mới';
      pill.classList.remove('editing');
    }
  }

  function resetForm() {
    S.editingId = null;
    S.editingLegacy = null;
    writeForm({ date: todayISO(), status: 'published' });
    localStorage.removeItem(LS.draft);
    $('#draft-note').textContent = '';
  }

  /* ───────────────── Bản nháp trên máy ───────────────── */
  var draftTimer;
  function saveDraftSoon() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 1200);
  }
  function saveDraft() {
    try {
      var d = readForm();
      d.editingId = S.editingId;
      localStorage.setItem(LS.draft, JSON.stringify(d));
      $('#draft-note').textContent = 'Lưu tạm ' + new Date().toLocaleTimeString('vi-VN');
    } catch (e) { /* bỏ qua */ }
  }
  function restoreDraft() {
    var raw = localStorage.getItem(LS.draft);
    if (!raw) { resetForm(); return; }
    try {
      var d = JSON.parse(raw);
      S.editingId = d.editingId || null;
      S.editingLegacy = null;
      writeForm(d);
      $('#draft-note').textContent = 'Khôi phục bản chưa lưu';
    } catch (e) { resetForm(); }
  }

  $('#btn-newdraft').addEventListener('click', function () {
    ask({
      title: 'Xóa nháp hiện tại?',
      body: '<p>Nội dung đang soạn sẽ bị xóa khỏi trình duyệt. Bài đã đăng trên web không bị ảnh hưởng.</p>',
      okText: 'Xóa nháp', danger: true
    }).then(function (r) { if (r) { resetForm(); toast('Đã tạo bài mới'); } });
  });

  /* ───────────────── Kiểm tra biểu mẫu ───────────────── */
  function contentText(html) {
    var box = document.createElement('div');
    box.innerHTML = html || '';
    return (box.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function validateAll(p) {
    var problems = [];
    if (!p.title) problems.push({ field: '#f-title', message: 'Thiếu tiêu đề bài viết' });
    if (!p.slug) problems.push({ field: '#f-slug', message: 'Đường dẫn không hợp lệ, hãy sửa lại' });
    if (!p.description) problems.push({ field: '#f-desc', message: 'Thiếu mô tả ngắn' });

    var text = contentText(p.content);
    var hasMedia = /<(img|video|audio|iframe)\b/i.test(p.content || '');
    if (text.length < 20 && !hasMedia) {
      problems.push({ field: '#editor', message: 'Nội dung cần ít nhất 20 ký tự hoặc có một ảnh / video' });
    }

    if (p.status === 'scheduled' && p.date < todayISO()) {
      problems.push({ field: '#f-date', message: 'Ngày hẹn đăng phải là hôm nay hoặc một ngày trong tương lai' });
    }

    if (p.cover && /^\s*javascript:/i.test(p.cover)) {
      problems.push({ field: '#f-cover', message: 'Đường dẫn ảnh bìa không an toàn' });
    }

    var targetPath = T.articlePath(p.section, p.slug);
    var collision = (S.db && S.db.posts || []).some(function (item) {
      return item.id !== S.editingId && (item.id === p.id || item.path === targetPath);
    });
    if (collision) {
      problems.push({ field: '#f-slug', message: 'Đường dẫn này đã được một bài khác sử dụng' });
    }
    return problems;
  }

  function validate(p) {
    return validateAll(p)[0] || null;
  }

  function clearFieldErrors() {
    $$('.field.has-error').forEach(function (field) { field.classList.remove('has-error'); });
    $$('[aria-invalid="true"]').forEach(function (field) { field.removeAttribute('aria-invalid'); });
  }

  function showProblem(problem) {
    clearFieldErrors();
    var field = problem && $(problem.field);
    if (field) {
      field.setAttribute('aria-invalid', 'true');
      var label = field.closest('.field');
      if (label) label.classList.add('has-error');
      field.focus();
      field.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    toast(problem.message, 'err');
    updateFormStatus();
  }

  ['#f-title', '#f-slug', '#f-section', '#f-category', '#f-game-placement', '#f-target-url',
    '#f-status', '#f-desc', '#f-cover', '#f-tags', '#f-date']
    .forEach(function (selector) {
      $(selector).addEventListener('input', function () {
        this.removeAttribute('aria-invalid');
        var label = this.closest('.field');
        if (label) label.classList.remove('has-error');
        updateFormStatus();
      });
    });

  function updateFormStatus() {
    $('#f-title-count').textContent = $('#f-title').value.length + ' / 120';
    $('#f-desc-count').textContent = $('#f-desc').value.length + ' / 240';
    var status = $('#form-status');
    var p = readForm(true);
    if ((p.section === 'blog' && p.category === 'photo') ||
        (p.section === 'game' && p.placement === 'capture')) {
      status.className = 'form-status ok';
      status.querySelector('strong').textContent = '✓ Sẵn sàng thêm ảnh';
      status.querySelector('span').textContent = 'Bấm nút bên dưới để tải ảnh và viết chú thích trong Thư viện ảnh.';
      return;
    }
    var problems = validateAll(p);
    status.className = 'form-status ' + (problems.length ? 'warn' : 'ok');
    status.querySelector('strong').textContent = problems.length ? 'Bài viết chưa sẵn sàng' : '✓ Sẵn sàng để đăng';
    status.querySelector('span').textContent = problems.length
      ? ('Còn ' + problems.length + ' mục cần sửa · ' + problems[0].message)
      : 'Tiêu đề, đường dẫn, mô tả và nội dung đều hợp lệ.';
  }

  /* ───────────────── Lưu bài (chung cho mọi trạng thái) ───────────────── */
  function savePost(forceStatus) {
    if (S.editingLegacy) return saveLegacyPost(forceStatus);
    var p = readForm();
    if (p.section === 'blog' && p.category === 'photo' && !S.editingId && !S.editingLegacy) {
      $('#photo-destination').value = 'blog';
      resetPhotoForm();
      switchTab('photos');
      toast('Hãy tải ảnh vào album tại đây; admin sẽ không tạo bài blog riêng.', 'ok');
      return;
    }
    if (p.section === 'game' && p.placement === 'capture' && !S.editingId && !S.editingLegacy) {
      $('#photo-destination').value = 'game-capture';
      resetPhotoForm();
      switchTab('photos');
      toast('Hãy tải ảnh, điền tên game và chú thích; ảnh sẽ vào đúng tab Capture Mode.', 'ok');
      return;
    }
    if (forceStatus) p.status = forceStatus;

    var problem = validate(p);
    if (problem) { showProblem(problem); return; }

    var isEdit = !!S.editingId;
    var existing = isEdit ? findPost(S.editingId) : null;
    var oldPath = existing && existing.path;
    var wasDraft = existing && (existing.status || 'published') === 'draft';

    p.path = T.articlePath(p.section, p.slug);
    p.url = '/' + p.path;
    if (!p.cover) p.cover = T.defaultCover(p.section);

    var isDraft = p.status === 'draft';

    busy(true, isDraft ? 'Đang lưu nháp lên GitHub…' : (isEdit ? 'Đang cập nhật bài viết…' : 'Đang đăng bài…'));

    var chain = Promise.resolve();

    /* Không ghi đè một file tĩnh có cùng slug nhưng chưa được quản lý
       trong posts.json. Đây là bước bảo vệ các bài viết tạo thủ công. */
    if (!isDraft && (!isEdit || wasDraft || oldPath !== p.path)) {
      chain = chain
        .then(function () { return readFile(p.path); })
        .then(function (file) {
          if (file) throw new Error('Đã có file tại /' + p.path + '. Hãy đổi đường dẫn để tránh ghi đè bài cũ.');
        });
    }

    chain
      .then(function () { return loadDb(); })
      .then(function () {
        var record = {
          id: p.id, section: p.section, category: p.category, status: p.status,
          placement: p.placement || '',
          targetUrl: p.targetUrl || '',
          mangaKicker: p.mangaKicker || '',
          mangaQuote: p.mangaQuote || '',
          filmYear: p.filmYear || '',
          filmDirector: p.filmDirector || '',
          filmDuration: p.filmDuration || '',
          filmWarning: p.filmWarning || '',
          title: p.title, slug: p.slug, description: p.description,
          cover: p.cover, tags: p.tags, date: p.date, author: p.author,
          path: p.path, url: p.url,
          updatedAt: new Date().toISOString()
        };
        /* Blog cần nội dung để dựng dòng thời gian; nháp cần nội dung để mở lại sửa */
        if (p.section === 'blog' || isDraft) record.bodyHtml = p.content;
        if (p.section === 'blog') { record.time = p.time; record.mood = p.mood || '(・_・)'; }

        upsertPost(record);
        S.db.updatedAt = new Date().toISOString();
        S.db.posts.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
        var dbJson = JSON.stringify(S.db, null, 2) + '\n';
        var changes = [];

        if (!isDraft) {
          changes.push({ path: p.path, content: T.render(p) });
        }
        if (oldPath && !wasDraft && (isDraft || oldPath !== p.path)) {
          changes.push({ path: oldPath, remove: true });
        }
        changes.push({ path: DATA_PATH, content: dbJson });

        var message = (isDraft ? 'Lưu nháp: ' : (isEdit ? 'Cập nhật bài: ' : 'Đăng bài: ')) + p.title;
        return writeFiles(changes, message).then(function (result) {
          var dataIndex = changes.length - 1;
          if (result.blobs[dataIndex]) S.dbSha = result.blobs[dataIndex].sha;
        });
      })
      .then(function () {
        localStorage.removeItem(LS.draft);
        S.editingId = null;
        updateEditPill();
        renderPostList();
        renderDashboard();
        if (isDraft) {
          busy(false);
          toast('✅ Đã lưu nháp lên GitHub', 'ok');
          resetForm();
          return null;
        }
        return waitForPages(p.url).then(function (ready) {
          busy(false);
          finishPublish(p, ready);
        });
      })
      .catch(function (err) {
        busy(false);
        toast('Lỗi: ' + err.message, 'err');
      });
  }

  function finishPublish(p, ready) {
    toast(ready ? '✅ Bài đã lên web!' : '✅ Đã lưu, GitHub Pages đang build…', 'ok');
    ask({
      title: ready ? 'Bài đã lên web' : 'Đã lưu, đang chờ build',
      body: '<p>Bài <b>' + T.escapeHtml(p.title) + '</b> đã được ghi vào repo.</p>' +
            (p.status === 'scheduled'
              ? '<p style="color:#a2711f;font-size:13.5px">Trạng thái <b>Hẹn đăng</b>: bài chỉ hiện ở trang danh sách từ ngày ' + T.escapeHtml(p.date) + '.</p>'
              : '') +
            (ready
              ? '<p style="color:#2f7a4a;font-size:13.5px">GitHub Pages đã build xong, bài xem được ngay.</p>'
              : '<p style="color:#7a5a2a;font-size:13.5px">Pages build hơi lâu hơn bình thường. Nếu thấy trang 404, đợi thêm 1 phút rồi bấm <b>Ctrl+Shift+R</b>.</p>') +
            '<p><code>' + T.escapeHtml(p.url) + '</code></p>',
      okText: 'Mở bài viết'
    }).then(function (r) {
      if (r) window.open(p.url + '?v=' + Date.now(), '_blank');
      resetForm();
    });
  }

  /* Chờ GitHub Pages build xong để không dính trang 404 bị cache */
  function waitForPages(url) {
    var deadline = Date.now() + 180000;
    var started = Date.now();
    function tick() {
      busy(true, 'Đã ghi xong. Đang chờ GitHub Pages build… (' + Math.round((Date.now() - started) / 1000) + 's)');
      return fetch(url + '?ping=' + Date.now(), { method: 'GET', cache: 'no-store' })
        .then(function (res) {
          if (res.ok) return true;
          if (Date.now() > deadline) return false;
          return new Promise(function (r) { setTimeout(r, 4000); }).then(tick);
        })
        .catch(function () {
          if (Date.now() > deadline) return false;
          return new Promise(function (r) { setTimeout(r, 4000); }).then(tick);
        });
    }
    return tick();
  }

  $('#btn-publish').addEventListener('click', function () { savePost(null); });
  $('#btn-save-draft').addEventListener('click', function () { savePost('draft'); });

  /* ═══════════════════ TAB QUẢN LÝ ═══════════════════ */
  var listState = { q: '', section: 'all', status: 'all', sort: 'date-desc' };

  $('#list-search').addEventListener('input', function () { listState.q = normalize(this.value); renderPostList(); });
  $('#list-section').addEventListener('change', function () { listState.section = this.value; renderPostList(); });
  $('#list-status').addEventListener('change', function () { listState.status = this.value; renderPostList(); });
  $('#list-sort').addEventListener('change', function () { listState.sort = this.value; renderPostList(); });

  function visiblePosts() {
    var all = ((S.db && S.db.posts) || []).concat(S.legacyPosts || []);
    var out = all.filter(function (p) {
      if (listState.section !== 'all' && p.section !== listState.section) return false;
      if (listState.status !== 'all' && (p.status || 'published') !== listState.status) return false;
      if (!listState.q) return true;
      var hay = normalize([p.title, p.description, (p.tags || []).join(' '), p.slug].join(' '));
      return hay.indexOf(listState.q) !== -1;
    });

    var by = listState.sort;
    out.sort(function (a, b) {
      if (by === 'date-asc')     return String(a.date).localeCompare(String(b.date));
      if (by === 'title-asc')    return String(a.title).localeCompare(String(b.title), 'vi');
      if (by === 'title-desc')   return String(b.title).localeCompare(String(a.title), 'vi');
      if (by === 'updated-desc') return String(b.updatedAt || '').localeCompare(String(a.updatedAt || ''));
      if (a._legacy !== b._legacy) return a._legacy ? 1 : -1;
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    return out;
  }

  var STATUS_LABEL = { published: 'Đã đăng', draft: 'Nháp', scheduled: 'Hẹn đăng' };

  function renderPostList() {
    var wrap = $('#post-list');
    var managedPosts = (S.db && S.db.posts) || [];
    var all = managedPosts.concat(S.legacyPosts || []);
    var posts = visiblePosts();

    $('#list-summary').textContent = all.length
      ? ('Hiển thị ' + posts.length + ' / ' + all.length + ' bài · ' +
        managedPosts.length + ' bài quản trị · ' + (S.legacyPosts || []).length + ' bài cũ')
      : '';

    wrap.innerHTML = '';
    if (!posts.length) {
      wrap.innerHTML = all.length
        ? '<div class="empty">Không có bài nào khớp bộ lọc.</div>'
        : '<div class="empty">Chưa có bài nào được đăng qua bảng quản trị.<br>Chuyển sang tab <b>Viết bài</b> để bắt đầu.</div>';
      refreshBulkBar();
      return;
    }

    posts.forEach(function (p) {
      var status = p.status || 'published';
      var item = document.createElement('div');
      item.className = 'post-item' + (S.selected[p.id] ? ' selected' : '');
      item.innerHTML =
        ((p._legacy || p.importedLegacy)
          ? '<span class="legacy-pick" aria-hidden="true">⌁</span>'
          : '<input class="pick" type="checkbox"' + (S.selected[p.id] ? ' checked' : '') + ' aria-label="Chọn bài">') +
        (p.cover
          ? '<img class="thumb" src="' + T.escapeHtml(p.cover) + '" alt="" loading="lazy">'
          : '<div class="thumb thumb-empty" aria-hidden="true">✎</div>') +
        '<div>' +
          '<h4>' + T.escapeHtml(p.title) + '</h4>' +
          '<p class="meta-line">' +
            '<span class="badge">' + T.escapeHtml(T.sectionLabel(p.section)) + '</span>' +
            (p._legacy
              ? '<span class="status-tag legacy">Bài cũ</span>'
              : '<span class="status-tag ' + status + '">' + STATUS_LABEL[status] + '</span>') +
            '<span>' + T.escapeHtml(p.date || '') + '</span>' +
            (p.updatedAt ? '<span>· sửa ' + T.escapeHtml(relativeTime(p.updatedAt)) + '</span>' : '') +
            '<span class="path">' + T.escapeHtml(p.url || '') + '</span>' +
          '</p>' +
        '</div>' +
        '<div class="post-actions">' +
          (status === 'draft' ? '' : '<button class="btn ghost small" data-act="open">Xem</button>') +
          '<button class="btn ghost small" data-act="edit">Sửa</button>' +
          (p._legacy ? '' :
            '<button class="btn ghost small" data-act="dup">Nhân bản</button>' +
            '<button class="btn danger small" data-act="del">Xoá</button>') +
        '</div>';

      var pick = item.querySelector('.pick');
      if (pick) pick.onchange = function () {
          if (this.checked) S.selected[p.id] = true; else delete S.selected[p.id];
          item.classList.toggle('selected', !!S.selected[p.id]);
          refreshBulkBar();
        };
      var openBtn = item.querySelector('[data-act="open"]');
      if (openBtn) openBtn.onclick = function () { window.open(p.url + '?v=' + Date.now(), '_blank'); };
      item.querySelector('[data-act="edit"]').onclick = function () {
        if (p._legacy || p.importedLegacy) editLegacyPost(p); else editPost(p);
      };
      var duplicate = item.querySelector('[data-act="dup"]');
      var remove = item.querySelector('[data-act="del"]');
      if (duplicate) duplicate.onclick = function () { duplicatePost(p); };
      if (remove) remove.onclick = function () { deletePosts([p]); };
      wrap.appendChild(item);
    });

    refreshBulkBar();
  }

  /* ───────────────── Chọn hàng loạt ───────────────── */
  function selectedPosts() {
    return ((S.db && S.db.posts) || []).filter(function (p) { return S.selected[p.id]; });
  }

  function refreshBulkBar() {
    var n = Object.keys(S.selected).length;
    $('#bulk-bar').hidden = n === 0;
    $('#bulk-count').textContent = 'Đã chọn ' + n + ' bài';
    var visible = visiblePosts().filter(function (p) { return !p._legacy && !p.importedLegacy; });
    var allPicked = visible.length > 0 && visible.every(function (p) { return S.selected[p.id]; });
    $('#bulk-all').checked = allPicked;
  }

  $('#bulk-all').addEventListener('change', function () {
    var visible = visiblePosts().filter(function (p) { return !p._legacy && !p.importedLegacy; });
    if (this.checked) visible.forEach(function (p) { S.selected[p.id] = true; });
    else visible.forEach(function (p) { delete S.selected[p.id]; });
    renderPostList();
  });

  $('#bulk-actions').addEventListener('click', function (e) {
    var btn = e.target.closest('[data-bulk]');
    if (!btn) return;
    var act = btn.dataset.bulk;
    var picked = selectedPosts();

    if (act === 'clear') { S.selected = {}; renderPostList(); return; }
    if (!picked.length) return;
    if (act === 'delete') return deletePosts(picked);
    if (act === 'publish') return changeStatusBulk(picked, 'published');
    if (act === 'draft') return changeStatusBulk(picked, 'draft');
  });

  /* ───────────────── Sửa · Nhân bản · Xoá ───────────────── */
  function loadContent(p) {
    /* Nháp giữ nội dung ngay trong posts.json; bài đã đăng thì đọc từ file HTML */
    if ((p.status || 'published') === 'draft' || !p.path) {
      return Promise.resolve(p.bodyHtml || '');
    }
    return readFile(p.path).then(function (file) {
      if (!file) return p.bodyHtml || '';
      var doc = new DOMParser().parseFromString(file.text, 'text/html');
      var body = legacyContentNode(doc);
      if (!body) return p.bodyHtml || '';
      /* Mẫu Manga mới bọc từng chương trong panel để trình bày. Khi mở lại
         trong editor chỉ lấy nội dung bên trong, tránh bọc panel lồng nhau. */
      if (body.classList && body.classList.contains('manga-story')) {
        var panels = Array.prototype.slice.call(body.children).filter(function (child) {
          return child.classList && child.classList.contains('manga-story-panel');
        });
        if (panels.length) return panels.map(function (panel) { return panel.innerHTML.trim(); }).join('\n');
      }
      return body.innerHTML.trim();
    });
  }

  function editPost(p) {
    S.editingLegacy = null;
    busy(true, 'Đang tải nội dung bài…');
    loadContent(p)
      .then(function (content) {
        busy(false);
        S.editingId = p.id;
        writeForm({
          section: p.section, category: p.category, status: p.status || 'published',
          placement: p.placement || 'article', targetUrl: p.targetUrl || '',
          mangaKicker: p.mangaKicker || '', mangaQuote: p.mangaQuote || '',
          title: p.title, slug: p.slug, description: p.description, cover: p.cover,
          tags: p.tags, date: p.date, time: p.time, mood: p.mood, content: content
        });
        switchTab('write');
        toast('Đã tải bài để chỉnh sửa');
        saveDraft();
      })
      .catch(function (err) { busy(false); toast(err.message, 'err'); });
  }

  var LEGACY_CONTENT_SELECTORS = [
    '#article-content',
    '[data-cms-content]',
    '.cold-article',
    'main.main',
    '.post-content',
    '.article-content',
    'article.post',
    'main',
    'article'
  ];

  function legacyContentNode(doc) {
    var node = null;
    LEGACY_CONTENT_SELECTORS.some(function (selector) {
      node = doc.querySelector(selector);
      return !!node;
    });
    return node;
  }

  function metaValue(doc, selector) {
    var node = doc.querySelector(selector);
    return node ? (node.getAttribute('content') || '') : '';
  }

  function parseLegacyFile(post, file) {
    var doc = new DOMParser().parseFromString(file.text, 'text/html');
    var contentNode = legacyContentNode(doc);
    if (!contentNode) throw new Error('Chưa xác định được vùng nội dung của bài cũ này.');
    var heading = doc.querySelector('h1');
    var title = heading ? heading.textContent.trim() :
      ((doc.querySelector('title') && doc.querySelector('title').textContent.trim()) || post.title);
    var description = metaValue(doc, 'meta[name="description"]') ||
      metaValue(doc, 'meta[property="og:description"]') ||
      'Bài viết cũ của Linh Osimi.';
    var cover = metaValue(doc, 'meta[property="og:image"]');
    if (!cover) {
      var firstImage = contentNode.querySelector('img');
      cover = firstImage ? (firstImage.getAttribute('src') || '') : '';
    }
    return {
      doc: doc,
      source: file.text,
      sha: file.sha,
      node: contentNode,
      heading: heading,
      title: title,
      description: description,
      cover: cover,
      content: contentNode.innerHTML.trim()
    };
  }

  function editLegacyPost(post) {
    busy(true, 'Đang đọc bài HTML cũ…');
    readFile(post.path)
      .then(function (file) {
        if (!file) throw new Error('File bài cũ không còn tồn tại.');
        var parsed = parseLegacyFile(post, file);
        var categories = T.categoriesOf(post.section);
        S.editingId = post.importedLegacy ? post.id : null;
        S.editingLegacy = {
          post: post,
          path: post.path,
          sha: parsed.sha,
          source: parsed.source
        };
        writeForm({
          section: post.section,
          category: Object.keys(categories)[0],
          status: 'published',
          title: parsed.title,
          slug: post.slug,
          description: parsed.description,
          cover: parsed.cover,
          tags: [],
          date: todayISO(),
          content: parsed.content
        });
        busy(false);
        switchTab('write');
        updateEditPill();
        $('#btn-save-draft').hidden = true;
        $('#draft-note').textContent = 'Bài HTML cũ · sẽ giữ nguyên giao diện gốc';
        toast('Đã mở bài cũ. Khi lưu, bài sẽ được thêm vào danh sách quản trị.', 'ok');
      })
      .catch(function (error) {
        busy(false);
        toast(error.message, 'err');
      });
  }

  function ensureMeta(doc, attr, name, value) {
    var selector = 'meta[' + attr + '="' + name + '"]';
    var meta = doc.querySelector(selector);
    if (!meta) {
      meta = doc.createElement('meta');
      meta.setAttribute(attr, name);
      doc.head.appendChild(meta);
    }
    meta.setAttribute('content', value || '');
  }

  function serializeDocument(doc, source) {
    var match = String(source || '').match(/^\s*(<!doctype[^>]*>)/i);
    return (match ? match[1] : '<!doctype html>') + '\n' + doc.documentElement.outerHTML + '\n';
  }

  function saveLegacyPost(forceStatus) {
    if (!S.editingLegacy) return;
    if (forceStatus === 'draft' || $('#f-status').value === 'draft') {
      $('#f-status').value = 'published';
      applyStatusUi();
      return toast('Hãy lưu bài cũ lần đầu ở trạng thái Đã đăng. Sau đó bạn có thể chuyển bài về nháp.', 'err');
    }
    var p = readForm();
    p.status = 'published';
    var problem = validate(p);
    if (problem) return showProblem(problem);
    var context = S.editingLegacy;
    var parsed;
    try {
      parsed = parseLegacyFile(context.post, { text: context.source, sha: context.sha });
    } catch (error) {
      return toast(error.message, 'err');
    }
    parsed.node.innerHTML = p.content;
    parsed.node.setAttribute('data-cms-content', '');
    if (parsed.heading) parsed.heading.textContent = p.title;
    var titleNode = parsed.doc.querySelector('title');
    if (titleNode) titleNode.textContent = p.title + ' — Linh Osimi';
    ensureMeta(parsed.doc, 'name', 'description', p.description);
    ensureMeta(parsed.doc, 'property', 'og:title', p.title);
    ensureMeta(parsed.doc, 'property', 'og:description', p.description);
    if (p.cover) ensureMeta(parsed.doc, 'property', 'og:image', p.cover);
    parsed.doc.body.setAttribute('data-cms-post', p.section);
    if (!parsed.doc.querySelector('script[src="/cms/theme.js"]')) {
      var themeScript = parsed.doc.createElement('script');
      themeScript.src = '/cms/theme.js';
      themeScript.defer = true;
      parsed.doc.head.appendChild(themeScript);
    }
    var html = serializeDocument(parsed.doc, context.source);

    busy(true, 'Đang cập nhật bài cũ và đưa vào hệ thống quản lý…');
    writeFile(context.path, html, 'Cập nhật bài cũ: ' + p.title, context.sha)
      .then(function (result) {
        context.sha = result.content.sha;
        return loadDb();
      })
      .then(function () {
        var record = {
          id: S.editingId || (T.idPrefix(p.section) + p.slug),
          section: p.section,
          category: p.category,
          status: 'published',
          title: p.title,
          slug: p.slug,
          description: p.description,
          cover: p.cover,
          tags: p.tags,
          date: p.date,
          author: p.author,
          path: context.path,
          url: '/' + context.path,
          updatedAt: new Date().toISOString(),
          importedLegacy: true
        };
        upsertPost(record);
        return saveDb('Đưa bài cũ vào quản trị: ' + p.title);
      })
      .then(function () {
        S.legacyPosts = S.legacyPosts.filter(function (item) { return item.path !== context.path; });
        S.editingLegacy = null;
        S.editingId = null;
        localStorage.removeItem(LS.draft);
        busy(false);
        renderPostList();
        renderDashboard();
        resetForm();
        toast('Đã sửa và đưa bài cũ vào hệ thống quản trị', 'ok');
      })
      .catch(function (error) {
        busy(false);
        toast(error.message, 'err');
      });
  }

  function duplicatePost(p) {
    S.editingLegacy = null;
    busy(true, 'Đang tạo bản sao…');
    loadContent(p)
      .then(function (content) {
        busy(false);
        S.editingId = null;
        var newSlug = p.slug + '-ban-sao';
        var n = 2;
        while (findPost(T.idPrefix(p.section) + newSlug)) {
          newSlug = p.slug + '-ban-sao-' + (n++);
        }
        writeForm({
          section: p.section, category: p.category,
          placement: p.placement || 'article', targetUrl: p.targetUrl || '',
          mangaKicker: p.mangaKicker || '', mangaQuote: p.mangaQuote || '',
          status: 'draft',                       /* bản sao luôn bắt đầu ở dạng nháp */
          title: p.title + ' (bản sao)',
          slug: newSlug,
          description: p.description, cover: p.cover, tags: p.tags,
          date: todayISO(), mood: p.mood, content: content
        });
        slugTouched = true;
        switchTab('write');
        toast('Đã tạo bản sao ở dạng nháp — sửa rồi bấm Đăng');
        saveDraft();
      })
      .catch(function (err) { busy(false); toast(err.message, 'err'); });
  }

  function deletePosts(list) {
    var many = list.length > 1;
    ask({
      title: many ? ('Xoá ' + list.length + ' bài?') : 'Xoá bài viết?',
      body: (many
        ? '<p>Sẽ xoá ' + list.length + ' bài khỏi web và khỏi danh mục:</p><ul>' +
          list.slice(0, 6).map(function (p) { return '<li>' + T.escapeHtml(p.title) + '</li>'; }).join('') +
          (list.length > 6 ? '<li>… và ' + (list.length - 6) + ' bài nữa</li>' : '') + '</ul>'
        : '<p>Bài <b>' + T.escapeHtml(list[0].title) + '</b> sẽ bị xoá khỏi web và khỏi danh mục.</p>') +
        '<p style="color:#b23c3c;font-size:13px">Hành động này không hoàn tác được từ bảng quản trị (vẫn khôi phục được bằng git).</p>',
      okText: 'Xoá vĩnh viễn', danger: true
    }).then(function (r) {
      if (!r) return;
      busy(true, 'Đang xoá…');
      var chain = Promise.resolve();
      list.forEach(function (p) {
        if ((p.status || 'published') !== 'draft' && p.path) {
          chain = chain.then(function () { return removeIfExists(p.path, 'Xoá bài: ' + p.title); });
        }
      });
      chain
        .then(function () { return loadDb(); })
        .then(function () {
          var ids = {};
          list.forEach(function (p) { ids[p.id] = true; delete S.selected[p.id]; });
          S.db.posts = S.db.posts.filter(function (p) { return !ids[p.id]; });
          return saveDb('Xoá ' + list.length + ' bài khỏi danh mục');
        })
        .then(function () {
          busy(false); renderPostList(); renderDashboard();
          toast('Đã xoá ' + list.length + ' bài', 'ok');
        })
        .catch(function (err) { busy(false); toast(err.message, 'err'); });
    });
  }

  function changeStatusBulk(list, status) {
    var verb = status === 'draft' ? 'chuyển về nháp' : 'chuyển sang đã đăng';
    ask({
      title: 'Đổi trạng thái ' + list.length + ' bài?',
      body: '<p>Sẽ ' + verb + ' cho ' + list.length + ' bài đã chọn.</p>' +
            (status === 'draft'
              ? '<p style="color:#a2711f;font-size:13px">File HTML của các bài này sẽ bị gỡ khỏi web. Nội dung vẫn giữ trong posts.json để sửa lại sau.</p>'
              : '<p style="color:#7c7264;font-size:13px">Các bài nháp sẽ được sinh file HTML và hiện lên web.</p>'),
      okText: 'Đồng ý'
    }).then(function (r) {
      if (!r) return;
      busy(true, 'Đang đổi trạng thái…');

      var chain = Promise.resolve();
      var updates = [];

      list.forEach(function (p) {
        chain = chain.then(function () {
          var current = p.status || 'published';
          if (current === status) return null;

          if (status === 'draft') {
            /* Đã đăng → nháp: lấy nội dung từ file rồi gỡ file đi */
            return loadContent(p).then(function (content) {
              return removeIfExists(p.path, 'Chuyển về nháp: ' + p.title).then(function () {
                updates.push({ id: p.id, status: 'draft', bodyHtml: content });
              });
            });
          }
          /* Nháp → đã đăng: dựng lại file HTML từ nội dung đang lưu */
          return loadContent(p).then(function (content) {
            var full = {};
            Object.keys(p).forEach(function (k) { full[k] = p[k]; });
            full.content = content;
            full.status = 'published';
            return readFile(p.path).then(function (file) {
              return writeFile(p.path, T.render(full), 'Đăng bài: ' + p.title, file ? file.sha : null);
            }).then(function () {
              updates.push({ id: p.id, status: 'published', bodyHtml: null });
            });
          });
        });
      });

      chain
        .then(function () { return loadDb(); })
        .then(function () {
          updates.forEach(function (u) {
            var rec = findPost(u.id);
            if (!rec) return;
            rec.status = u.status;
            rec.updatedAt = new Date().toISOString();
            if (u.bodyHtml === null && rec.section !== 'blog') delete rec.bodyHtml;
            else if (u.bodyHtml) rec.bodyHtml = u.bodyHtml;
          });
          return saveDb('Đổi trạng thái ' + updates.length + ' bài');
        })
        .then(function () {
          busy(false); S.selected = {}; renderPostList(); renderDashboard();
          toast('Đã đổi trạng thái ' + updates.length + ' bài', 'ok');
        })
        .catch(function (err) { busy(false); toast(err.message, 'err'); });
    });
  }

  $('#btn-reload').addEventListener('click', reloadAll);
  $('#btn-dash-refresh').addEventListener('click', reloadAll);
  $('#btn-scan-legacy').addEventListener('click', function () { scanLegacyPosts(false); });

  function reloadAll() {
    busy(true, 'Đang tải lại…');
    loadDb()
      .then(function () { return scanLegacyPosts(true); })
      .then(function () { busy(false); renderPostList(); renderDashboard(); toast('Đã tải lại danh sách'); })
      .catch(function (e) { busy(false); toast(e.message, 'err'); });
  }

  /* ═══════════════════ TAB TỔNG QUAN ═══════════════════ */
  function renderDashboard() {
    var managedPosts = (S.db && S.db.posts) || [];
    var legacyPosts = S.legacyPosts || [];
    var posts = managedPosts.concat(legacyPosts);
    var today = todayISO();

    var counts = { published: 0, draft: 0, scheduled: 0 };
    posts.forEach(function (p) { counts[p.status || 'published'] = (counts[p.status || 'published'] || 0) + 1; });

    var liveNow = posts.filter(function (p) {
      var st = p.status || 'published';
      return st === 'published' || (st === 'scheduled' && String(p.date) <= today);
    }).length;

    $('#dash-sub').textContent = S.db && S.db.updatedAt
      ? ('Cập nhật lần cuối ' + relativeTime(S.db.updatedAt))
      : '';

    $('#stat-row').innerHTML =
      stat(posts.length, 'Tổng số bài', '') +
      stat(liveNow, 'Đang hiện trên web', 'ok') +
      stat(legacyPosts.length, 'Bài cũ có thể sửa', 'mute') +
      stat(counts.scheduled || 0, 'Hẹn đăng', 'warn') +
      stat(counts.draft || 0, 'Bản nháp', 'mute');

    /* Bài theo mục */
    var bySection = {};
    T.SECTIONS.forEach(function (s) { bySection[s] = 0; });
    posts.forEach(function (p) { bySection[p.section] = (bySection[p.section] || 0) + 1; });
    var max = Math.max.apply(null, [1].concat(Object.keys(bySection).map(function (k) { return bySection[k]; })));

    $('#dash-sections').innerHTML = T.SECTIONS.map(function (s) {
      var n = bySection[s] || 0;
      return '<div class="bar-row">' +
        '<span class="name">' + T.escapeHtml(T.sectionLabel(s)) + '</span>' +
        '<span class="bar-track"><span class="bar-fill" style="width:' + Math.round(n / max * 100) + '%"></span></span>' +
        '<span class="num">' + n + '</span>' +
      '</div>';
    }).join('');

    /* Sửa gần đây */
    var recent = managedPosts.slice().sort(function (a, b) {
      return String(b.updatedAt || b.date).localeCompare(String(a.updatedAt || a.date));
    }).slice(0, 7);

    var box = $('#dash-recent');
    box.innerHTML = '';
    if (!recent.length) {
      box.innerHTML = '<div class="empty">Chưa có bài nào.</div>';
      return;
    }
    recent.forEach(function (p) {
      var el = document.createElement('div');
      el.className = 'recent-item';
      el.innerHTML =
        '<span class="badge">' + T.escapeHtml(T.sectionLabel(p.section)) + '</span>' +
        '<span class="r-title">' + T.escapeHtml(p.title) + '</span>' +
        '<span class="r-when">' + T.escapeHtml(relativeTime(p.updatedAt || p.date)) + '</span>';
      el.onclick = function () {
        if (p.importedLegacy) editLegacyPost(p); else editPost(p);
      };
      box.appendChild(el);
    });
  }

  function stat(value, label, kind) {
    return '<div class="stat ' + (kind || '') + '"><b>' + value + '</b><span>' + label + '</span></div>';
  }

  /* ═══════════════════ TAB GIAO DIỆN ═══════════════════ */
  var THEME_FONT_STACKS = {
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

  function themeRecord() {
    if (!S.theme) return null;
    var section = $('#theme-section').value;
    return S.theme.sections[section] || null;
  }

  function readThemeForm() {
    return {
      title: $('#theme-title').value.trim(),
      description: $('#theme-description').value.trim(),
      heroImage: $('#theme-image').value.trim(),
      pageBackgroundImage: $('#theme-page-bg-image').value.trim(),
      heroBackgroundImage: $('#theme-hero-bg-image').value.trim(),
      backgroundPosition: $('#theme-bg-position').value,
      heroOverlay: Number($('#theme-overlay').value),
      background: $('#theme-bg').value,
      surface: $('#theme-surface').value,
      text: $('#theme-text').value,
      accent: $('#theme-accent').value,
      bodyFont: $('#theme-body-font').value,
      headingFont: $('#theme-heading-font').value,
      bodySize: Number($('#theme-size').value),
      lineHeight: Number($('#theme-line').value),
      contentWidth: Number($('#theme-width').value),
      radius: Number($('#theme-radius').value),
      heroAlign: $('#theme-hero-align').value,
      heroHeight: $('#theme-hero-height').value,
      pageWidth: $('#theme-page-width').value,
      density: $('#theme-density').value,
      showNavigation: $('#theme-show-nav').checked,
      showHero: $('#theme-show-hero').checked,
      showFooter: $('#theme-show-footer').checked,
      blocks: $$('#theme-block-list .theme-block').map(function (row) {
        var title = row.querySelector('.theme-block-title');
        return {
          key: row.dataset.key,
          visible: row.querySelector('input[type="checkbox"]').checked,
          title: title ? title.value.trim() : ''
        };
      })
    };
  }

  function writeThemeForm(settings) {
    if (!settings) return;
    $('#theme-title').value = settings.title || '';
    $('#theme-description').value = settings.description || '';
    $('#theme-image').value = settings.heroImage || '';
    $('#theme-page-bg-image').value = settings.pageBackgroundImage || '';
    $('#theme-hero-bg-image').value = settings.heroBackgroundImage || '';
    $('#theme-bg-position').value = settings.backgroundPosition || 'center';
    $('#theme-overlay').value = String(settings.heroOverlay === undefined ? 0.4 : settings.heroOverlay);
    $('#theme-bg').value = settings.background || '#f4efe4';
    $('#theme-surface').value = settings.surface || '#fffdf8';
    $('#theme-text').value = settings.text || '#2b2620';
    $('#theme-accent').value = settings.accent || '#b4552d';
    $('#theme-body-font').value = THEME_FONT_STACKS[settings.bodyFont] ? settings.bodyFont : 'inter';
    $('#theme-heading-font').value = THEME_FONT_STACKS[settings.headingFont] ? settings.headingFont : 'space-grotesk';
    $('#theme-size').value = settings.bodySize || 17;
    $('#theme-line').value = settings.lineHeight || 1.8;
    $('#theme-width').value = settings.contentWidth || 70;
    $('#theme-radius').value = settings.radius === undefined ? 14 : settings.radius;
    $('#theme-hero-align').value = settings.heroAlign || 'original';
    $('#theme-hero-height').value = settings.heroHeight || 'original';
    $('#theme-page-width').value = settings.pageWidth || 'original';
    $('#theme-density').value = settings.density || 'original';
    $('#theme-show-nav').checked = settings.showNavigation !== false;
    $('#theme-show-hero').checked = settings.showHero !== false;
    $('#theme-show-footer').checked = settings.showFooter !== false;
    renderThemeBlocks(settings);
    updateThemePreview();
  }

  function renderThemeBlocks(settings) {
    var section = $('#theme-section').value;
    var definitions = PAGE_BLOCKS[section] || [];
    $('#theme-block-list').innerHTML = '';
    var saved = {};
    (settings.blocks || []).forEach(function (block) { saved[block.key] = block; });
    var order = (settings.blocks || []).map(function (block) { return block.key; });
    definitions.slice().sort(function (a, b) {
      var ai = order.indexOf(a.key);
      var bi = order.indexOf(b.key);
      if (ai < 0) ai = definitions.indexOf(a);
      if (bi < 0) bi = definitions.indexOf(b);
      return ai - bi;
    }).forEach(function (block, index, list) {
      var row = document.createElement('div');
      row.className = 'theme-block';
      row.dataset.key = block.key;
      row.innerHTML =
        '<input type="checkbox" aria-label="Hiện phần này"' +
          ((!saved[block.key] || saved[block.key].visible !== false) ? ' checked' : '') + '>' +
        '<span>' + T.escapeHtml(block.label) + '</span>' +
        '<div class="theme-block-move">' +
          '<button type="button" data-move="-1" title="Đưa lên"' + (index === 0 ? ' disabled' : '') + '>↑</button>' +
          '<button type="button" data-move="1" title="Đưa xuống"' + (index === list.length - 1 ? ' disabled' : '') + '>↓</button>' +
        '</div>' +
        (block.titleSelector
          ? '<input class="theme-block-title" type="text" maxlength="100" placeholder="Đổi tiêu đề phần này (để trống = giữ nguyên)" value="' +
            T.escapeHtml((saved[block.key] && saved[block.key].title) || '') + '">'
          : '');
      $('#theme-block-list').appendChild(row);
    });
  }

  function updateThemeOutputs(settings) {
    $('#theme-size-out').textContent = settings.bodySize + 'px';
    $('#theme-line-out').textContent = Number(settings.lineHeight).toFixed(2).replace(/0$/, '');
    $('#theme-width-out').textContent = settings.contentWidth + 'ch';
    $('#theme-radius-out').textContent = settings.radius + 'px';
  }

  function updateThemePreview() {
    var settings = readThemeForm();
    updateThemeOutputs(settings);
    var preview = $('#theme-preview');
    preview.style.setProperty('--pv-bg', settings.background);
    preview.style.setProperty('--pv-surface', settings.surface);
    preview.style.setProperty('--pv-text', settings.text);
    preview.style.setProperty('--pv-accent', settings.accent);
    preview.style.setProperty('--pv-body', THEME_FONT_STACKS[settings.bodyFont] || THEME_FONT_STACKS.inter);
    preview.style.setProperty('--pv-head', THEME_FONT_STACKS[settings.headingFont] || THEME_FONT_STACKS['space-grotesk']);
    preview.style.setProperty('--pv-size', settings.bodySize + 'px');
    preview.style.setProperty('--pv-line', settings.lineHeight);
    preview.style.setProperty('--pv-width', settings.contentWidth + 'ch');
    preview.style.setProperty('--pv-radius', settings.radius + 'px');
    preview.style.setProperty('--pv-overlay', settings.heroOverlay);
    preview.dataset.heroAlign = settings.heroAlign;
    preview.dataset.heroHeight = settings.heroHeight;
    preview.dataset.density = settings.density;
    preview.style.backgroundPosition = settings.backgroundPosition;
    preview.style.backgroundImage = settings.pageBackgroundImage
      ? 'linear-gradient(rgba(0,0,0,.12),rgba(0,0,0,.12)),url("' +
        settings.pageBackgroundImage.replace(/"/g, '%22') + '")'
      : 'none';
    $('#theme-preview-title').textContent = settings.title || 'Tiêu đề mục';
    $('#theme-preview-description').textContent = settings.description || 'Đoạn giới thiệu của mục.';
    var previewHero = preview.querySelector('.theme-preview-hero');
    previewHero.hidden = !settings.showHero;
    previewHero.style.backgroundImage = settings.heroBackgroundImage
      ? 'linear-gradient(rgba(0,0,0,' + settings.heroOverlay + '),rgba(0,0,0,' +
        settings.heroOverlay + ')),url("' + settings.heroBackgroundImage.replace(/"/g, '%22') + '")'
      : '';
    previewHero.style.backgroundSize = settings.heroBackgroundImage ? 'cover' : '';
    previewHero.style.backgroundPosition = settings.backgroundPosition;

    var image = $('#theme-preview-image');
    if (settings.heroImage) {
      image.hidden = false;
      image.src = settings.heroImage;
    } else {
      image.hidden = true;
      image.removeAttribute('src');
    }
  }

  function markThemeDirty() {
    if (!S.theme) return;
    S.theme.sections[$('#theme-section').value] = readThemeForm();
    S.themeDirty = true;
    $('#theme-dirty').hidden = false;
    updateThemePreview();
  }

  function renderThemeEditor() {
    if (!S.theme) return;
    var settings = themeRecord();
    if (!settings) return;
    $('#theme-dirty').hidden = !S.themeDirty;
    writeThemeForm(settings);
  }

  $('#theme-section').addEventListener('change', renderThemeEditor);
  $('#tab-theme .theme-controls').addEventListener('input', function (event) {
    if (event.target.id === 'theme-section') return;
    markThemeDirty();
  });
  $('#tab-theme .theme-controls').addEventListener('change', function (event) {
    if (event.target.id === 'theme-section' || event.target.type === 'range' || event.target.type === 'color') return;
    markThemeDirty();
  });
  $('#theme-block-list').addEventListener('click', function (event) {
    var button = event.target.closest('[data-move]');
    if (!button) return;
    var row = button.closest('.theme-block');
    var direction = Number(button.dataset.move);
    var sibling = direction < 0 ? row.previousElementSibling : row.nextElementSibling;
    if (!sibling) return;
    if (direction < 0) row.parentNode.insertBefore(row, sibling);
    else row.parentNode.insertBefore(sibling, row);
    $$('#theme-block-list .theme-block').forEach(function (item, index, list) {
      item.querySelector('[data-move="-1"]').disabled = index === 0;
      item.querySelector('[data-move="1"]').disabled = index === list.length - 1;
    });
    markThemeDirty();
  });

  $('#theme-preview-image').addEventListener('error', function () { this.hidden = true; });
  $('#theme-preview-image').addEventListener('load', function () { this.hidden = false; });

  $('#btn-theme-upload').addEventListener('click', function () {
    pickImage(function (url) {
      $('#theme-image').value = url;
      markThemeDirty();
      toast('Ảnh mới đã sẵn sàng trong bản xem trước', 'ok');
    });
  });

  $('#btn-theme-image-clear').addEventListener('click', function () {
    $('#theme-image').value = '';
    markThemeDirty();
  });

  function bindThemeBackground(uploadSelector, inputSelector, clearSelector, label) {
    $(uploadSelector).addEventListener('click', function () {
      pickImage(function (url) {
        $(inputSelector).value = url;
        markThemeDirty();
        toast(label + ' đã sẵn sàng trong bản xem trước', 'ok');
      });
    });
    $(clearSelector).addEventListener('click', function () {
      $(inputSelector).value = '';
      markThemeDirty();
    });
  }

  bindThemeBackground('#btn-theme-page-bg-upload', '#theme-page-bg-image',
    '#btn-theme-page-bg-clear', 'Ảnh nền trang');
  bindThemeBackground('#btn-theme-hero-bg-upload', '#theme-hero-bg-image',
    '#btn-theme-hero-bg-clear', 'Ảnh nền đầu trang');

  $('#btn-theme-open-page').addEventListener('click', function () {
    var url = PAGE_URLS[$('#theme-section').value];
    if (url) window.open(url + '?v=' + Date.now(), '_blank');
  });

  $('#btn-theme-reset').addEventListener('click', function () {
    var section = $('#theme-section').value;
    ask({
      title: 'Hoàn tác thay đổi giao diện?',
      body: '<p>Khôi phục mục <b>' + T.escapeHtml(T.sectionLabel(section)) + '</b> về lần lưu gần nhất.</p>',
      okText: 'Hoàn tác'
    }).then(function (answer) {
      if (!answer || !S.themeSaved) return;
      S.theme.sections[section] = JSON.parse(JSON.stringify(S.themeSaved.sections[section]));
      S.themeDirty = JSON.stringify(S.theme.sections) !== JSON.stringify(S.themeSaved.sections);
      renderThemeEditor();
      toast('Đã hoàn tác thay đổi của mục này');
    });
  });

  $('#btn-theme-save').addEventListener('click', function () {
    var settings = readThemeForm();
    if (!settings.title) {
      $('#theme-title').focus();
      return toast('Tiêu đề đầu trang không được để trống', 'err');
    }
    S.theme.sections[$('#theme-section').value] = settings;
    busy(true, 'Đang lưu giao diện lên GitHub…');
    saveTheme()
      .then(function () {
        busy(false);
        $('#theme-dirty').hidden = true;
        toast('✅ Đã lưu giao diện website', 'ok');
      })
      .catch(function (err) { busy(false); toast(err.message, 'err'); });
  });

  /* ═══════════════════ TAB CHỦ ĐỀ ═══════════════════ */
  function taxOf(section) {
    if (!S.tax.sections[section]) S.tax.sections[section] = [];
    return S.tax.sections[section];
  }

  function markTaxDirty() {
    S.taxDirty = true;
    $('#tax-dirty').hidden = false;
  }

  /* Đếm số bài đang dùng chủ đề này — để cảnh báo trước khi xoá */
  function countUsing(section, key) {
    return ((S.db && S.db.posts) || []).filter(function (p) {
      return p.section === section && p.category === key;
    }).length;
  }

  function renderTaxonomy() {
    if (!S.tax) return;
    var section = $('#tax-section').value;
    var list = taxOf(section);
    var wrap = $('#tax-list');
    $('#tax-dirty').hidden = !S.taxDirty;
    wrap.innerHTML = '';

    if (!list.length) {
      wrap.innerHTML = '<div class="empty">Mục này chưa có chủ đề nào. Bấm <b>+ Thêm chủ đề</b>.</div>';
      return;
    }

    list.forEach(function (cat, i) {
      var used = countUsing(section, cat.key);
      var row = document.createElement('div');
      row.className = 'tax-row';
      row.innerHTML =
        '<div class="move">' +
          '<button type="button" data-move="up" title="Lên"' + (i === 0 ? ' disabled' : '') + '>▲</button>' +
          '<button type="button" data-move="down" title="Xuống"' + (i === list.length - 1 ? ' disabled' : '') + '>▼</button>' +
        '</div>' +
        '<input class="sym" type="text" value="' + T.escapeHtml(cat.symbol || '') + '" maxlength="4" aria-label="Biểu tượng">' +
        '<input class="label" type="text" value="' + T.escapeHtml(cat.label || '') + '" placeholder="Tên hiển thị" aria-label="Tên chủ đề">' +
        '<span class="key-wrap"><input class="key" type="text" value="' + T.escapeHtml(cat.key || '') + '" spellcheck="false" placeholder="ma-chu-de" aria-label="Mã chủ đề"></span>' +
        '<span class="used">' + (used ? used + ' bài' : 'chưa có bài') + '</span>' +
        '<button class="del" type="button"' + (used ? ' disabled title="Còn ' + used + ' bài đang dùng"' : '') + '>Xoá</button>';

      row.querySelector('.sym').oninput = function () { cat.symbol = this.value; markTaxDirty(); };
      row.querySelector('.label').oninput = function () { cat.label = this.value; markTaxDirty(); };
      row.querySelector('.key').oninput = function () {
        cat.key = T.slugify(this.value) || this.value.trim();
        markTaxDirty();
      };
      row.querySelector('.key').onblur = function () { this.value = cat.key; renderTaxonomy(); };

      row.querySelectorAll('[data-move]').forEach(function (btn) {
        btn.onclick = function () {
          var to = btn.dataset.move === 'up' ? i - 1 : i + 1;
          if (to < 0 || to >= list.length) return;
          var tmp = list[i]; list[i] = list[to]; list[to] = tmp;
          markTaxDirty(); renderTaxonomy();
        };
      });

      row.querySelector('.del').onclick = function () {
        if (used) return;
        list.splice(i, 1);
        markTaxDirty(); renderTaxonomy();
      };

      wrap.appendChild(row);
    });

    var hint = document.createElement('p');
    hint.className = 'tax-hint';
    hint.innerHTML =
      '<b>Mã chủ đề</b> là phần xuất hiện trong đường dẫn lọc, chỉ dùng chữ thường và dấu gạch ngang — tự chuẩn hoá khi bạn gõ.<br>' +
      'Chủ đề đang có bài thì không xoá được. Muốn xoá, hãy chuyển các bài đó sang chủ đề khác trước.<br>' +
      'Nhớ bấm <b>💾 Lưu lên GitHub</b> sau khi sửa, nếu không thay đổi sẽ mất khi tải lại trang.';
    wrap.appendChild(hint);
  }

  $('#tax-section').addEventListener('change', renderTaxonomy);

  $('#btn-tax-add').addEventListener('click', function () {
    var section = $('#tax-section').value;
    ask({
      title: 'Thêm chủ đề mới',
      body: '<label class="field"><span>Tên hiển thị</span><input data-name="label" type="text" placeholder="VD: Hóa học"></label>' +
            '<label class="field"><span>Biểu tượng (không bắt buộc)</span><input data-name="symbol" type="text" placeholder="🧪" maxlength="4"></label>'
    }).then(function (r) {
      if (!r || !r.label) return;
      var list = taxOf(section);
      var key = T.slugify(r.label);
      if (!key) return toast('Tên chủ đề không hợp lệ', 'err');
      if (list.some(function (c) { return c.key === key; })) {
        return toast('Đã có chủ đề với mã này', 'err');
      }
      list.push({ key: key, label: r.label, symbol: r.symbol || '✦' });
      markTaxDirty();
      renderTaxonomy();
      toast('Đã thêm — nhớ bấm Lưu lên GitHub');
    });
  });

  $('#btn-tax-save').addEventListener('click', function () {
    /* Kiểm tra trùng mã trước khi ghi */
    var bad = null;
    Object.keys(S.tax.sections).forEach(function (section) {
      var seen = {};
      S.tax.sections[section].forEach(function (c) {
        if (!c.key) bad = 'Có chủ đề chưa đặt mã trong mục ' + T.sectionLabel(section);
        if (seen[c.key]) bad = 'Mã "' + c.key + '" bị trùng trong mục ' + T.sectionLabel(section);
        seen[c.key] = true;
      });
    });
    if (bad) return toast(bad, 'err');

    busy(true, 'Đang lưu danh sách chủ đề…');
    saveTaxonomy()
      .then(function () {
        busy(false);
        $('#tax-dirty').hidden = true;
        fillCategories();          /* cập nhật ngay ô Chủ đề bên tab Viết bài */
        renderTaxonomy();
        toast('✅ Đã lưu danh sách chủ đề', 'ok');
      })
      .catch(function (err) { busy(false); toast(err.message, 'err'); });
  });

  /* ───────────────── Tab ───────────────── */
  function switchTab(name) {
    $$('.tab').forEach(function (t) { t.classList.toggle('active', t.dataset.tab === name); });
    $$('.tabpanel').forEach(function (p) { p.classList.toggle('active', p.id === 'tab-' + name); });
    if (name === 'dashboard') renderDashboard();
    if (name === 'photos') renderPhotoList();
    if (name === 'manage') renderPostList();
    if (name === 'theme') renderThemeEditor();
    if (name === 'taxonomy') renderTaxonomy();
  }
  $$('.tab').forEach(function (t) {
    t.addEventListener('click', function () { switchTab(t.dataset.tab); });
  });

  function applyRouteFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var tab = params.get('tab');
    var section = params.get('section');
    if (tab === 'photos') {
      resetPhotoForm();
      switchTab('photos');
      return;
    }
    if (tab === 'theme') {
      if (section && PAGE_URLS[section]) $('#theme-section').value = section;
      switchTab('theme');
      renderThemeEditor();
      return;
    }
    if (tab === 'write') {
      if (section && PAGE_URLS[section]) {
        $('#f-section').value = section;
        fillCategories();
        var category = params.get('category');
        var categories = T.categoriesOf(section);
        if (category && categories[category]) $('#f-category').value = category;
        applySectionUi(section);
      }
      switchTab('write');
    }
  }

  /* ───────────────── Khởi động ───────────────── */
  $('#btn-login').addEventListener('click', function () { doLogin(false); });
  $('#in-token').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(false); });
  $('#btn-logout').addEventListener('click', function () {
    ask({ title: 'Đăng xuất?', body: '<p>Token sẽ được xóa khỏi trình duyệt này. Bản nháp vẫn được giữ.</p>', okText: 'Đăng xuất' })
      .then(function (r) { if (r) logout(); });
  });

  window.addEventListener('beforeunload', function (event) {
    if (!S.taxDirty && !S.themeDirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  (function init() {
    fillCategories();
    $('#f-date').value = todayISO();
    $('#photo-date').value = todayISO();
    applyStatusUi();
    var savedRepo = localStorage.getItem(LS.repo);
    var savedBranch = localStorage.getItem(LS.branch);
    var savedToken = localStorage.getItem(LS.token);
    if (savedRepo) $('#in-repo').value = savedRepo;
    if (savedBranch) $('#in-branch').value = savedBranch;
    if (savedToken) {
      $('#in-token').value = savedToken;
      loginMsg('Đang tự đăng nhập bằng token đã lưu…', '');
      doLogin(true);
    }
    updateFormStatus();
  })();
})();
