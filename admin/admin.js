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
    selected: {}       // các bài được tick trong tab Quản lý
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

  function todayISO() { return new Date().toISOString().slice(0, 10); }

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
        return loadDb();
      })
      .then(function () {
        busy(false);
        show('#screen-app');
        restoreDraft();
        renderPostList();
        renderDashboard();
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
      catch (e) { S.db = { version: 1, updatedAt: new Date().toISOString(), posts: [] }; }
      if (!Array.isArray(S.db.posts)) S.db.posts = [];
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

  $('#html-view').addEventListener('input', function () { saveDraftSoon(); schedulePreview(); });
  editor.addEventListener('keyup', function () { syncToolbar(); afterEdit(); });
  editor.addEventListener('mouseup', syncToolbar);
  editor.addEventListener('input', afterEdit);

  editor.addEventListener('paste', function (e) {
    var items = (e.clipboardData || {}).items || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) {
        e.preventDefault();
        var file = items[i].getAsFile();
        return uploadImage(file).then(function (url) { insertFigure(url, ''); });
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
    var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && /^image\//.test(file.type)) {
      uploadImage(file).then(function (url) { insertFigure(url, file.name.replace(/\.[^.]+$/, '')); });
    }
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
    insertHtml(
      '<figure><img src="' + T.escapeHtml(url) + '" alt="' + T.escapeHtml(caption || '') + '" loading="lazy">' +
      (caption ? '<figcaption>' + T.escapeHtml(caption) + '</figcaption>' : '') +
      '</figure><p><br></p>'
    );
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
    uploadImage(file).then(function (url) { cb(url, file.name.replace(/\.[^.]+$/, '')); });
  });

  function pickImage(cb) { pendingPick = cb; $('#file-input').click(); }

  function uploadImage(file) {
    if (!file) return Promise.reject(new Error('Không có file'));
    if (file.size > 5 * 1024 * 1024) {
      toast('Ảnh lớn hơn 5MB, hãy nén bớt trước khi tải lên.', 'err');
      return Promise.reject(new Error('Ảnh quá lớn'));
    }
    busy(true, 'Đang tải ảnh lên GitHub…');
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var b64 = String(reader.result).split(',')[1];
        var now = new Date();
        var safe = T.slugify(file.name.replace(/\.[^.]+$/, '')) || 'anh';
        var ext = (file.name.match(/\.[a-z0-9]+$/i) || ['.png'])[0].toLowerCase();
        var path = 'uploads/' + now.getFullYear() + '/' +
                   String(now.getMonth() + 1).padStart(2, '0') + '/' +
                   Date.now() + '-' + safe + ext;
        writeFile(path, { b64: b64 }, 'Tải ảnh: ' + path)
          .then(function () { busy(false); toast('Đã tải ảnh lên', 'ok'); resolve('/' + path); })
          .catch(function (err) { busy(false); toast(err.message, 'err'); reject(err); });
      };
      reader.onerror = function () { busy(false); reject(new Error('Không đọc được file')); };
      reader.readAsDataURL(file);
    });
  }

  /* ───────────────── Biểu mẫu thông tin bài ───────────────── */
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
    $('#wrap-mood').hidden = !isBlog;
    var coverLabel = $('#f-cover').parentNode.querySelector('span');
    if (coverLabel) coverLabel.textContent = isBlog ? 'Ảnh hoặc video kèm bài (URL)' : 'Ảnh bìa (URL)';
    var uploadBtn = $('#btn-cover-upload');
    if (uploadBtn) uploadBtn.textContent = isBlog ? '⬆ Tải ảnh kèm bài từ máy' : '⬆ Tải ảnh bìa từ máy';
  }

  var STATUS_HINT = {
    published: 'Bài hiện ngay trên trang danh sách sau khi GitHub Pages build xong.',
    scheduled: 'Bài được ghi lên web nhưng chỉ hiện ở trang danh sách từ ngày đăng trở đi. Người biết URL vẫn mở được sớm.',
    draft: 'Chỉ lưu trong data/posts.json, không sinh file HTML và không hiện ở đâu. Lưu ý repo là công khai nên nội dung nháp vẫn đọc được nếu ai đó mở file đó.'
  };

  function applyStatusUi() {
    var st = $('#f-status').value;
    $('#status-hint').textContent = STATUS_HINT[st] || '';
    $('#btn-publish').textContent = st === 'draft'
      ? '💾 Lưu nháp lên GitHub'
      : (S.editingId ? '💾 Cập nhật bài viết' : '🚀 Đăng bài lên web');
    $('#btn-save-draft').hidden = st === 'draft';
  }

  $('#f-section').addEventListener('change', function () { fillCategories(); saveDraftSoon(); schedulePreview(); });
  $('#f-status').addEventListener('change', function () { applyStatusUi(); saveDraftSoon(); });

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
    $(sel).addEventListener('input', function () { saveDraftSoon(); schedulePreview(); });
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

  function readForm() {
    var title = $('#f-title').value.trim();
    var slug = T.slugify($('#f-slug').value.trim() || title);
    var section = $('#f-section').value;
    return {
      section: section,
      category: $('#f-category').value,
      status: $('#f-status').value,
      title: title,
      slug: slug,
      id: (S.editingId || (T.idPrefix(section) + slug)),
      description: $('#f-desc').value.trim(),
      cover: $('#f-cover').value.trim(),
      tags: $('#f-tags').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
      date: $('#f-date').value || todayISO(),
      time: S.postTime || new Date().toTimeString().slice(0, 5),
      mood: $('#f-mood').value.trim(),
      author: 'Linh Osimi',
      content: exportContent()
    };
  }

  function writeForm(p) {
    $('#f-section').value = p.section || 'kienthuc';
    S.postTime = p.time || '';
    fillCategories();
    var map = T.categoriesOf(p.section || 'kienthuc');
    $('#f-category').value = (p.category && map[p.category]) ? p.category : Object.keys(map)[0];
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
    countWords();
    applyStatusUi();
    updateEditPill();
    schedulePreview();
  }

  function updateEditPill() {
    var pill = $('#edit-pill');
    if (S.editingId) {
      pill.textContent = 'Đang sửa bài';
      pill.classList.add('editing');
    } else {
      pill.textContent = 'Bài mới';
      pill.classList.remove('editing');
    }
  }

  function resetForm() {
    S.editingId = null;
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
  function validate(p) {
    if (!p.title) return 'Thiếu tiêu đề bài viết';
    if (!p.slug) return 'Đường dẫn không hợp lệ, hãy sửa lại';
    if (!p.description) return 'Thiếu mô tả ngắn';
    if (!p.content || p.content.replace(/<[^>]+>/g, '').trim().length < 20) {
      return 'Nội dung bài viết còn quá ngắn';
    }
    if (!S.editingId && findPost(p.id)) return 'Đã có bài với đường dẫn này. Hãy đổi đường dẫn.';
    return null;
  }

  /* ───────────────── Lưu bài (chung cho mọi trạng thái) ───────────────── */
  function savePost(forceStatus) {
    var p = readForm();
    if (forceStatus) p.status = forceStatus;

    var problem = validate(p);
    if (problem) { toast(problem, 'err'); return; }

    var isEdit = !!S.editingId;
    var existing = isEdit ? findPost(S.editingId) : null;
    var oldPath = existing && existing.path;

    p.path = T.articlePath(p.section, p.slug);
    p.url = '/' + p.path;
    if (!p.cover) p.cover = T.defaultCover(p.section);

    var isDraft = p.status === 'draft';

    busy(true, isDraft ? 'Đang lưu nháp lên GitHub…' : (isEdit ? 'Đang cập nhật bài viết…' : 'Đang đăng bài…'));

    var chain = Promise.resolve();

    if (isDraft) {
      /* Nháp: không sinh file HTML. Nếu trước đó đã có file thì gỡ đi. */
      if (oldPath) chain = chain.then(function () { return removeIfExists(oldPath, 'Chuyển về nháp: ' + p.title); });
      if (oldPath !== p.path) chain = chain.then(function () { return removeIfExists(p.path, 'Dọn file: ' + p.path); });
    } else {
      chain = chain
        .then(function () { return readFile(p.path); })
        .then(function (file) {
          return writeFile(p.path, T.render(p),
            (isEdit ? 'Cập nhật bài: ' : 'Đăng bài mới: ') + p.title,
            file ? file.sha : null);
        })
        .then(function () {
          if (oldPath && oldPath !== p.path) return removeIfExists(oldPath, 'Dọn file cũ: ' + oldPath);
        });
    }

    chain
      .then(function () { return loadDb(); })
      .then(function () {
        var record = {
          id: p.id, section: p.section, category: p.category, status: p.status,
          title: p.title, slug: p.slug, description: p.description,
          cover: p.cover, tags: p.tags, date: p.date, author: p.author,
          path: p.path, url: p.url,
          updatedAt: new Date().toISOString()
        };
        /* Blog cần nội dung để dựng dòng thời gian; nháp cần nội dung để mở lại sửa */
        if (p.section === 'blog' || isDraft) record.bodyHtml = p.content;
        if (p.section === 'blog') { record.time = p.time; record.mood = p.mood || '(・_・)'; }

        upsertPost(record);
        return saveDb((isDraft ? 'Lưu nháp: ' : (isEdit ? 'Cập nhật: ' : 'Thêm bài: ')) + p.title);
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
    var all = (S.db && S.db.posts) || [];
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
      return String(b.date).localeCompare(String(a.date));
    });
    return out;
  }

  var STATUS_LABEL = { published: 'Đã đăng', draft: 'Nháp', scheduled: 'Hẹn đăng' };

  function renderPostList() {
    var wrap = $('#post-list');
    var all = (S.db && S.db.posts) || [];
    var posts = visiblePosts();

    $('#list-summary').textContent = all.length
      ? ('Hiển thị ' + posts.length + ' / ' + all.length + ' bài')
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
        '<input class="pick" type="checkbox"' + (S.selected[p.id] ? ' checked' : '') + ' aria-label="Chọn bài">' +
        (p.cover
          ? '<img class="thumb" src="' + T.escapeHtml(p.cover) + '" alt="" loading="lazy">'
          : '<div class="thumb thumb-empty" aria-hidden="true">✎</div>') +
        '<div>' +
          '<h4>' + T.escapeHtml(p.title) + '</h4>' +
          '<p class="meta-line">' +
            '<span class="badge">' + T.escapeHtml(T.sectionLabel(p.section)) + '</span>' +
            '<span class="status-tag ' + status + '">' + STATUS_LABEL[status] + '</span>' +
            '<span>' + T.escapeHtml(p.date || '') + '</span>' +
            (p.updatedAt ? '<span>· sửa ' + T.escapeHtml(relativeTime(p.updatedAt)) + '</span>' : '') +
            '<span class="path">' + T.escapeHtml(p.url || '') + '</span>' +
          '</p>' +
        '</div>' +
        '<div class="post-actions">' +
          (status === 'draft' ? '' : '<button class="btn ghost small" data-act="open">Xem</button>') +
          '<button class="btn ghost small" data-act="edit">Sửa</button>' +
          '<button class="btn ghost small" data-act="dup">Nhân bản</button>' +
          '<button class="btn danger small" data-act="del">Xoá</button>' +
        '</div>';

      item.querySelector('.pick').onchange = function () {
        if (this.checked) S.selected[p.id] = true; else delete S.selected[p.id];
        item.classList.toggle('selected', !!S.selected[p.id]);
        refreshBulkBar();
      };
      var openBtn = item.querySelector('[data-act="open"]');
      if (openBtn) openBtn.onclick = function () { window.open(p.url + '?v=' + Date.now(), '_blank'); };
      item.querySelector('[data-act="edit"]').onclick = function () { editPost(p); };
      item.querySelector('[data-act="dup"]').onclick = function () { duplicatePost(p); };
      item.querySelector('[data-act="del"]').onclick = function () { deletePosts([p]); };
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
    var visible = visiblePosts();
    var allPicked = visible.length > 0 && visible.every(function (p) { return S.selected[p.id]; });
    $('#bulk-all').checked = allPicked;
  }

  $('#bulk-all').addEventListener('change', function () {
    var visible = visiblePosts();
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
      var body = doc.querySelector('#article-content');
      return body ? body.innerHTML.trim() : (p.bodyHtml || '');
    });
  }

  function editPost(p) {
    busy(true, 'Đang tải nội dung bài…');
    loadContent(p)
      .then(function (content) {
        busy(false);
        S.editingId = p.id;
        writeForm({
          section: p.section, category: p.category, status: p.status || 'published',
          title: p.title, slug: p.slug, description: p.description, cover: p.cover,
          tags: p.tags, date: p.date, time: p.time, mood: p.mood, content: content
        });
        switchTab('write');
        toast('Đã tải bài để chỉnh sửa');
        saveDraft();
      })
      .catch(function (err) { busy(false); toast(err.message, 'err'); });
  }

  function duplicatePost(p) {
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

  function reloadAll() {
    busy(true, 'Đang tải lại…');
    loadDb()
      .then(function () { busy(false); renderPostList(); renderDashboard(); toast('Đã tải lại danh sách'); })
      .catch(function (e) { busy(false); toast(e.message, 'err'); });
  }

  /* ═══════════════════ TAB TỔNG QUAN ═══════════════════ */
  function renderDashboard() {
    var posts = (S.db && S.db.posts) || [];
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
    var recent = posts.slice().sort(function (a, b) {
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
      el.onclick = function () { editPost(p); };
      box.appendChild(el);
    });
  }

  function stat(value, label, kind) {
    return '<div class="stat ' + (kind || '') + '"><b>' + value + '</b><span>' + label + '</span></div>';
  }

  /* ───────────────── Tab ───────────────── */
  function switchTab(name) {
    $$('.tab').forEach(function (t) { t.classList.toggle('active', t.dataset.tab === name); });
    $$('.tabpanel').forEach(function (p) { p.classList.toggle('active', p.id === 'tab-' + name); });
    if (name === 'dashboard') renderDashboard();
    if (name === 'manage') renderPostList();
  }
  $$('.tab').forEach(function (t) {
    t.addEventListener('click', function () { switchTab(t.dataset.tab); });
  });

  /* ───────────────── Khởi động ───────────────── */
  $('#btn-login').addEventListener('click', function () { doLogin(false); });
  $('#in-token').addEventListener('keydown', function (e) { if (e.key === 'Enter') doLogin(false); });
  $('#btn-logout').addEventListener('click', function () {
    ask({ title: 'Đăng xuất?', body: '<p>Token sẽ được xóa khỏi trình duyệt này. Bản nháp vẫn được giữ.</p>', okText: 'Đăng xuất' })
      .then(function (r) { if (r) logout(); });
  });

  (function init() {
    fillCategories();
    $('#f-date').value = todayISO();
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
  })();
})();
