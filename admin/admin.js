/* ══════════════════════════════════════════════════════════════
   admin.js — Bảng quản trị bài viết
   Chạy hoàn toàn trên trình duyệt, ghi bài trực tiếp vào GitHub
   qua Contents API. Không cần server.
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
    token: '',
    owner: '',
    repo: '',
    branch: 'main',
    user: null,
    db: null,        // nội dung posts.json
    dbSha: null,     // sha của posts.json trên GitHub
    editingId: null  // id bài đang sửa (null = bài mới)
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

  /* Hộp thoại nhập liệu đơn giản (thay cho prompt/confirm) */
  function ask(opts) {
    return new Promise(function (resolve) {
      var modal = $('#modal');
      $('#modal-title').textContent = opts.title || '';
      $('#modal-body').innerHTML = opts.body || '';
      $('#modal-ok').textContent = opts.okText || 'Đồng ý';
      $('#modal-ok').className = 'btn ' + (opts.danger ? 'danger' : 'primary');
      modal.hidden = false;
      var first = modal.querySelector('input,textarea');
      if (first) setTimeout(function () { first.focus(); first.select && first.select(); }, 40);

      function done(value) {
        modal.hidden = true;
        $('#modal-ok').onclick = null;
        $('#modal-cancel').onclick = null;
        modal.onkeydown = null;
        resolve(value);
      }
      $('#modal-ok').onclick = function () {
        var out = {};
        modal.querySelectorAll('[data-name]').forEach(function (f) { out[f.dataset.name] = f.value.trim(); });
        done(out);
      };
      $('#modal-cancel').onclick = function () { done(null); };
      modal.onkeydown = function (e) {
        if (e.key === 'Escape') done(null);
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); $('#modal-ok').click(); }
      };
    });
  }

  /* ───────────────── Mã hóa Base64 hỗ trợ tiếng Việt ───────────────── */
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

  /* Đọc 1 file trong repo. Trả về {text, sha} hoặc null nếu chưa có. */
  function readFile(path) {
    return gh(repoPath(path) + '?ref=' + encodeURIComponent(S.branch) + '&t=' + Date.now(), { allow404: true })
      .then(function (data) {
        if (!data || !data.content) return null;
        return { text: fromB64(data.content), sha: data.sha };
      });
  }

  /* Ghi/ghi đè 1 file trong repo. */
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
    return gh(repoPath(path), {
      method: 'DELETE',
      body: { message: message, sha: sha, branch: S.branch }
    });
  }

  /* ───────────────── Đăng nhập ───────────────── */
  function doLogin(silent) {
    var repoFull = $('#in-repo').value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '').replace(/\/$/, '');
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
        /* Một số loại token không trả về trường permissions — chỉ chặn khi biết chắc là thiếu quyền */
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
      })
      .catch(function (err) {
        busy(false);
        if (silent) { logout(true); }
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
      try {
        S.db = JSON.parse(file.text);
      } catch (e) {
        S.db = { version: 1, updatedAt: new Date().toISOString(), posts: [] };
      }
      if (!Array.isArray(S.db.posts)) S.db.posts = [];
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

  /* ───────────────── Trình soạn thảo ───────────────── */
  var editor = $('#editor');

  function focusEditor() {
    if (document.activeElement !== editor) editor.focus();
  }

  function exec(cmd, value) {
    focusEditor();
    document.execCommand(cmd, false, value === undefined ? null : value);
    syncToolbar();
    countWords();
  }

  function setBlock(tag) {
    focusEditor();
    if (tag === 'pre') {
      document.execCommand('formatBlock', false, 'pre');
    } else if (tag === 'blockquote') {
      document.execCommand('formatBlock', false, 'blockquote');
    } else {
      document.execCommand('formatBlock', false, tag);
    }
    countWords();
  }

  function insertHtml(html) {
    focusEditor();
    document.execCommand('insertHTML', false, html);
    countWords();
  }

  function syncToolbar() {
    [['bold', 'bold'], ['italic', 'italic'], ['underline', 'underline'], ['strikeThrough', 'strikeThrough'],
     ['insertUnorderedList', 'insertUnorderedList'], ['insertOrderedList', 'insertOrderedList']]
      .forEach(function (pair) {
        var btn = document.querySelector('.tb[data-cmd="' + pair[0] + '"]');
        if (!btn) return;
        var on = false;
        try { on = document.queryCommandState(pair[1]); } catch (e) { on = false; }
        btn.classList.toggle('on', on);
      });
  }

  function countWords() {
    var text = editor.innerText.trim();
    var n = text ? text.split(/\s+/).length : 0;
    $('#wordcount').textContent = n + ' từ · ~' + Math.max(1, Math.ceil(n / 220)) + ' phút đọc';
  }

  /* Làm sạch HTML dán từ Word/web: bỏ style rác, script, class lạ */
  function cleanHtml(root) {
    var wrapper = document.createElement('div');
    wrapper.innerHTML = root;
    wrapper.querySelectorAll('script,style,meta,link,noscript,iframe[src^="javascript"]').forEach(function (n) { n.remove(); });
    wrapper.querySelectorAll('*').forEach(function (el) {
      if (!el.parentNode) return;
      Array.prototype.slice.call(el.attributes).forEach(function (attr) {
        var name = attr.name.toLowerCase();
        var keep = (name === 'href' || name === 'src' || name === 'alt' || name === 'title' ||
                    name === 'colspan' || name === 'rowspan' || name === 'id');
        if (!keep) el.removeAttribute(attr.name);
        if (name.indexOf('on') === 0) el.removeAttribute(attr.name);
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

  /* Nếu đang ở chế độ HTML thô, lấy nội dung từ ô đó (không đổi giao diện) */
  function syncFromHtmlView() {
    var view = $('#html-view');
    if (!view.hidden) editor.innerHTML = view.value;
  }

  /* Chuẩn hóa nội dung trước khi lưu: bọc bảng, gắn id cho H2 */
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

  /* ───── Sự kiện thanh công cụ ───── */
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
  });

  $('#toolbar').querySelector('[data-block]').addEventListener('change', function (e) {
    setBlock(e.target.value);
    e.target.value = 'p';
  });

  $('#html-view').addEventListener('input', saveDraftSoon);
  editor.addEventListener('keyup', function () { syncToolbar(); countWords(); saveDraftSoon(); });
  editor.addEventListener('mouseup', syncToolbar);
  editor.addEventListener('input', function () { countWords(); saveDraftSoon(); });

  /* Dán nội dung: làm sạch trước */
  editor.addEventListener('paste', function (e) {
    var items = (e.clipboardData || {}).items || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) {
        e.preventDefault();
        var file = items[i].getAsFile();
        return uploadImage(file).then(function (url) { insertFigure(url, file.name || 'anh'); });
      }
    }
    var html = e.clipboardData && e.clipboardData.getData('text/html');
    if (html) {
      e.preventDefault();
      insertHtml(cleanHtml(html));
    }
  });

  /* Kéo–thả ảnh */
  ['dragenter', 'dragover'].forEach(function (ev) {
    editor.addEventListener(ev, function (e) { e.preventDefault(); editor.classList.add('drag'); });
  });
  ['dragleave', 'drop'].forEach(function (ev) {
    editor.addEventListener(ev, function (e) { e.preventDefault(); editor.classList.remove('drag'); });
  });
  editor.addEventListener('drop', function (e) {
    var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && /^image\//.test(file.type)) {
      uploadImage(file).then(function (url) { insertFigure(url, file.name); });
    }
  });

  /* Phím tắt */
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
    var html = '<figure><img src="' + T.escapeHtml(url) + '" alt="' + T.escapeHtml(caption || '') + '" loading="lazy">' +
      (caption ? '<figcaption>' + T.escapeHtml(caption) + '</figcaption>' : '') +
      '</figure><p><br></p>';
    insertHtml(html);
  }

  /* Ẩn/hiện chế độ xem HTML thô */
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

  /* ───────────────── Tải ảnh lên repo ───────────────── */
  var pendingPick = null;
  $('#file-input').addEventListener('change', function (e) {
    var file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file || !pendingPick) return;
    var cb = pendingPick; pendingPick = null;
    uploadImage(file).then(function (url) { cb(url, file.name.replace(/\.[^.]+$/, '')); });
  });

  function pickImage(cb) {
    pendingPick = cb;
    $('#file-input').click();
  }

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
          .then(function () {
            busy(false);
            toast('Đã tải ảnh lên', 'ok');
            resolve('/' + path);
          })
          .catch(function (err) { busy(false); toast(err.message, 'err'); reject(err); });
      };
      reader.onerror = function () { busy(false); reject(new Error('Không đọc được file')); };
      reader.readAsDataURL(file);
    });
  }

  /* ───────────────── Biểu mẫu thông tin bài ───────────────── */
  function fillCategories() {
    var section = $('#f-section').value;
    var map = section === 'khoahoc' ? T.SCIENCE_CATEGORIES : T.KNOWLEDGE_CATEGORIES;
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
  }

  $('#f-section').addEventListener('change', function () { fillCategories(); saveDraftSoon(); });

  var slugTouched = false;
  $('#f-slug').addEventListener('input', function () { slugTouched = true; });
  $('#f-title').addEventListener('input', function () {
    if (!slugTouched) $('#f-slug').value = T.slugify($('#f-title').value);
    saveDraftSoon();
  });
  ['#f-desc', '#f-cover', '#f-tags', '#f-date', '#f-category'].forEach(function (sel) {
    $(sel).addEventListener('input', saveDraftSoon);
  });
  $('#f-cover').addEventListener('input', updateCoverPreview);

  function updateCoverPreview() {
    var url = $('#f-cover').value.trim();
    var box = $('#cover-preview');
    if (!url) { box.hidden = true; return; }
    box.hidden = false;
    box.querySelector('img').src = url;
  }

  $('#btn-cover-upload').addEventListener('click', function () {
    pickImage(function (url) { $('#f-cover').value = url; updateCoverPreview(); saveDraft(); });
  });

  function readForm() {
    var title = $('#f-title').value.trim();
    var slug = T.slugify($('#f-slug').value.trim() || title);
    return {
      section: $('#f-section').value,
      category: $('#f-category').value,
      title: title,
      slug: slug,
      id: (S.editingId || (($('#f-section').value === 'khoahoc' ? 'kh-' : 'kt-') + slug)),
      description: $('#f-desc').value.trim(),
      cover: $('#f-cover').value.trim(),
      tags: $('#f-tags').value.split(',').map(function (s) { return s.trim(); }).filter(Boolean),
      date: $('#f-date').value || new Date().toISOString().slice(0, 10),
      author: 'Linh Osimi',
      content: exportContent()
    };
  }

  function writeForm(p) {
    $('#f-section').value = p.section || 'kienthuc';
    fillCategories();
    $('#f-category').value = p.category || 'khac';
    $('#f-title').value = p.title || '';
    $('#f-slug').value = p.slug || '';
    $('#f-desc').value = p.description || '';
    $('#f-cover').value = p.cover || '';
    $('#f-tags').value = (p.tags || []).join(', ');
    $('#f-date').value = p.date || new Date().toISOString().slice(0, 10);
    editor.innerHTML = p.content || '';
    $('#html-view').hidden = true;
    editor.hidden = false;
    slugTouched = !!p.slug;
    updateCoverPreview();
    countWords();
  }

  function resetForm() {
    S.editingId = null;
    writeForm({ date: new Date().toISOString().slice(0, 10) });
    localStorage.removeItem(LS.draft);
    $('#draft-note').textContent = '';
    $('#btn-publish').textContent = '🚀 Đăng bài lên web';
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
      $('#draft-note').textContent = 'Đã lưu nháp lúc ' + new Date().toLocaleTimeString('vi-VN');
    } catch (e) { /* bỏ qua */ }
  }
  function restoreDraft() {
    var raw = localStorage.getItem(LS.draft);
    if (!raw) { resetForm(); return; }
    try {
      var d = JSON.parse(raw);
      S.editingId = d.editingId || null;
      writeForm(d);
      if (S.editingId) $('#btn-publish').textContent = '💾 Cập nhật bài viết';
      $('#draft-note').textContent = 'Đã khôi phục bản nháp chưa đăng';
    } catch (e) { resetForm(); }
  }

  $('#btn-newdraft').addEventListener('click', function () {
    ask({ title: 'Xóa nháp hiện tại?', body: '<p>Nội dung đang soạn sẽ bị xóa khỏi trình duyệt. Bài đã đăng trên web không bị ảnh hưởng.</p>', okText: 'Xóa nháp', danger: true })
      .then(function (r) { if (r) { resetForm(); toast('Đã tạo bài mới'); } });
  });

  /* ───────────────── Xem trước ───────────────── */
  $('#btn-preview').addEventListener('click', function () {
    var p = readForm();
    if (!p.title) return toast('Hãy nhập tiêu đề trước khi xem trước', 'err');
    var html = T.render(p)
      .replace(/<script[^>]*><\/script>/g, '')
      .replace('</head>', '<base href="' + location.origin + '/"></head>');
    var w = window.open('', '_blank');
    if (!w) return toast('Trình duyệt đã chặn cửa sổ mới', 'err');
    w.document.open(); w.document.write(html); w.document.close();
  });

  /* ───────────────── Đăng bài ───────────────── */
  $('#btn-publish').addEventListener('click', function () {
    var p = readForm();
    if (!p.title) return toast('Thiếu tiêu đề bài viết', 'err');
    if (!p.slug) return toast('Đường dẫn không hợp lệ, hãy sửa lại', 'err');
    if (!p.description) return toast('Thiếu mô tả ngắn', 'err');
    if (!p.content || p.content.replace(/<[^>]+>/g, '').trim().length < 20) {
      return toast('Nội dung bài viết còn quá ngắn', 'err');
    }

    var isEdit = !!S.editingId;
    var existing = isEdit ? S.db.posts.filter(function (x) { return x.id === S.editingId; })[0] : null;

    if (!isEdit) {
      var dup = S.db.posts.filter(function (x) { return x.id === p.id; })[0];
      if (dup) return toast('Đã có bài với đường dẫn này. Hãy đổi đường dẫn.', 'err');
    }

    p.path = T.articlePath(p.section, p.slug);
    p.url = '/' + p.path;
    if (!p.cover) p.cover = T.defaultCover(p.section);

    busy(true, isEdit ? 'Đang cập nhật bài viết…' : 'Đang đăng bài lên GitHub…');

    var oldPath = existing && existing.path;
    var chain = Promise.resolve();

    /* Nếu đổi đường dẫn khi sửa bài → xóa file cũ sau khi ghi file mới */
    chain = chain
      .then(function () { return readFile(p.path); })
      .then(function (file) {
        var html = T.render(p);
        return writeFile(p.path, html,
          (isEdit ? 'Cập nhật bài: ' : 'Đăng bài mới: ') + p.title,
          file ? file.sha : null);
      })
      .then(function () {
        if (oldPath && oldPath !== p.path) {
          return readFile(oldPath).then(function (f) {
            if (f) return deleteFile(oldPath, 'Dọn file cũ: ' + oldPath, f.sha);
          });
        }
      })
      .then(function () { return loadDb(); })
      .then(function () {
        var record = {
          id: p.id, section: p.section, category: p.category,
          title: p.title, slug: p.slug, description: p.description,
          cover: p.cover, tags: p.tags, date: p.date, author: p.author,
          path: p.path, url: p.url,
          updatedAt: new Date().toISOString()
        };
        var idx = -1;
        S.db.posts.forEach(function (x, i) { if (x.id === record.id) idx = i; });
        if (idx >= 0) S.db.posts[idx] = record; else S.db.posts.push(record);
        return saveDb((isEdit ? 'Cập nhật danh mục: ' : 'Thêm vào danh mục: ') + p.title);
      })
      .then(function () {
        busy(false);
        localStorage.removeItem(LS.draft);
        S.editingId = null;
        $('#btn-publish').textContent = '🚀 Đăng bài lên web';
        renderPostList();
        toast('✅ Đã đăng! GitHub Pages cần ~1 phút để cập nhật.', 'ok');
        ask({
          title: 'Đăng bài thành công',
          body: '<p>Bài <b>' + T.escapeHtml(p.title) + '</b> đã được ghi vào repo.</p>' +
                '<p style="color:#7c7264;font-size:13.5px">GitHub Pages thường mất 30–90 giây để build xong. Sau đó bài sẽ hiện ở:</p>' +
                '<p><code>' + T.escapeHtml(p.url) + '</code></p>',
          okText: 'Mở bài viết'
        }).then(function (r) {
          if (r) window.open(p.url, '_blank');
          resetForm();
        });
      })
      .catch(function (err) {
        busy(false);
        toast('Lỗi: ' + err.message, 'err');
      });
  });

  /* ───────────────── Danh sách bài ───────────────── */
  function renderPostList() {
    var wrap = $('#post-list');
    wrap.innerHTML = '';
    var posts = (S.db && S.db.posts) || [];
    if (!posts.length) {
      wrap.innerHTML = '<div class="empty">Chưa có bài nào được đăng qua bảng quản trị.<br>Chuyển sang tab <b>Viết bài</b> để bắt đầu.</div>';
      return;
    }
    posts.forEach(function (p) {
      var item = document.createElement('div');
      item.className = 'post-item';
      item.innerHTML =
        '<img class="thumb" src="' + T.escapeHtml(p.cover || '') + '" alt="">' +
        '<div>' +
          '<h4>' + T.escapeHtml(p.title) + '</h4>' +
          '<p><span class="badge">' + (p.section === 'khoahoc' ? 'Khoa học' : 'Kiến thức') + '</span>' +
             T.escapeHtml(p.date || '') + ' · ' + T.escapeHtml(p.url || '') + '</p>' +
        '</div>' +
        '<div class="post-actions">' +
          '<button class="btn ghost small" data-act="open">Xem</button>' +
          '<button class="btn ghost small" data-act="edit">Sửa</button>' +
          '<button class="btn danger small" data-act="del">Xóa</button>' +
        '</div>';
      item.querySelector('[data-act="open"]').onclick = function () { window.open(p.url, '_blank'); };
      item.querySelector('[data-act="edit"]').onclick = function () { editPost(p); };
      item.querySelector('[data-act="del"]').onclick = function () { deletePost(p); };
      wrap.appendChild(item);
    });
  }

  function editPost(p) {
    busy(true, 'Đang tải nội dung bài…');
    readFile(p.path)
      .then(function (file) {
        busy(false);
        if (!file) return toast('Không tìm thấy file bài viết trong repo', 'err');
        var doc = new DOMParser().parseFromString(file.text, 'text/html');
        var body = doc.querySelector('#article-content');
        S.editingId = p.id;
        writeForm({
          section: p.section, category: p.category, title: p.title, slug: p.slug,
          description: p.description, cover: p.cover, tags: p.tags, date: p.date,
          content: body ? body.innerHTML.trim() : ''
        });
        $('#btn-publish').textContent = '💾 Cập nhật bài viết';
        switchTab('write');
        toast('Đã tải bài để chỉnh sửa');
        saveDraft();
      })
      .catch(function (err) { busy(false); toast(err.message, 'err'); });
  }

  function deletePost(p) {
    ask({
      title: 'Xóa bài viết?',
      body: '<p>Bài <b>' + T.escapeHtml(p.title) + '</b> sẽ bị xóa khỏi web và khỏi danh mục.</p>' +
            '<p style="color:#b23c3c;font-size:13px">Hành động này không hoàn tác được.</p>',
      okText: 'Xóa vĩnh viễn', danger: true
    }).then(function (r) {
      if (!r) return;
      busy(true, 'Đang xóa…');
      readFile(p.path)
        .then(function (f) { if (f) return deleteFile(p.path, 'Xóa bài: ' + p.title, f.sha); })
        .then(function () { return loadDb(); })
        .then(function () {
          S.db.posts = S.db.posts.filter(function (x) { return x.id !== p.id; });
          return saveDb('Gỡ khỏi danh mục: ' + p.title);
        })
        .then(function () { busy(false); renderPostList(); toast('Đã xóa bài', 'ok'); })
        .catch(function (err) { busy(false); toast(err.message, 'err'); });
    });
  }

  $('#btn-reload').addEventListener('click', function () {
    busy(true, 'Đang tải lại…');
    loadDb().then(function () { busy(false); renderPostList(); toast('Đã tải lại danh sách'); })
      .catch(function (e) { busy(false); toast(e.message, 'err'); });
  });

  /* ───────────────── Tab ───────────────── */
  function switchTab(name) {
    $$('.tab').forEach(function (t) { t.classList.toggle('active', t.dataset.tab === name); });
    $$('.tabpanel').forEach(function (p) { p.classList.toggle('active', p.id === 'tab-' + name); });
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
    $('#f-date').value = new Date().toISOString().slice(0, 10);
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
