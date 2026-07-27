/* Ảnh được quản lý từ admin và phân phối tới đúng trang đích.
   Bản ghi cũ không có destination vẫn thuộc Photos cá nhân. */
(function () {
  'use strict';

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function safeSource(value) {
    value = String(value || '').trim();
    return /^(?:https?:\/\/|\/(?!\/))/i.test(value) ? value : '';
  }

  function safeLink(value, fallback) {
    value = String(value || '').trim();
    return /^(?:https?:\/\/|\/(?!\/))/i.test(value) ? value : fallback;
  }

  function newestFirst(a, b) {
    return String(b.updatedAt || b.date || '').localeCompare(String(a.updatedAt || a.date || ''));
  }

  function renderArt(photos) {
    var grid = document.querySelector('.gallery-grid');
    if (!grid) return;
    var list = photos.filter(function (photo) {
      return photo.destination === 'nghethuat' && safeSource(photo.src);
    }).sort(newestFirst);
    if (!list.length) return;

    var fragment = document.createDocumentFragment();
    list.forEach(function (photo) {
      var source = safeSource(photo.src);
      var link = safeLink(photo.link, source);
      var item = document.createElement('article');
      item.className = 'gallery-item gallery-item--managed';
      item.setAttribute('data-managed-photo', photo.id || '');
      item.innerHTML =
        '<img src="' + esc(source) + '" alt="' + esc(photo.title || 'Tác phẩm nghệ thuật') + '" loading="lazy">' +
        '<h3>' + esc(photo.title || 'Tác phẩm chưa đặt tên') + '</h3>' +
        '<p>' + esc(photo.note || 'Chưa có chú thích cho tác phẩm này.') + '</p>' +
        '<a href="' + esc(link) + '"' + (/^https?:\/\//i.test(link) ? ' target="_blank" rel="noopener"' : '') + '>' +
          (photo.link ? 'Mở bài / trang liên kết →' : 'Xem ảnh đầy đủ →') +
        '</a>';
      fragment.appendChild(item);
    });
    grid.insertBefore(fragment, grid.firstChild);
  }

  function renderGameCaptures(photos) {
    if (!/\/game0\/2\/game3\.html$/i.test(location.pathname)) return;
    var grid = document.querySelector('.game-capture-grid');
    if (!grid) return;
    var list = photos.filter(function (photo) {
      return photo.destination === 'game-capture' && safeSource(photo.src);
    }).sort(newestFirst);
    if (!list.length) return;

    var fragment = document.createDocumentFragment();
    list.forEach(function (photo) {
      var source = safeSource(photo.src);
      var game = photo.game || 'Game capture';
      var button = document.createElement('button');
      button.className = 'game-capture game-capture--managed';
      button.type = 'button';
      button.setAttribute('data-full', source);
      button.setAttribute('data-title', photo.title || game);
      button.setAttribute('data-note', photo.note || '');
      button.innerHTML =
        '<img src="' + esc(source) + '" alt="' + esc(photo.title || game) + '" loading="lazy">' +
        '<span>' + esc(game) + '</span>';
      fragment.appendChild(button);
    });
    grid.insertBefore(fragment, grid.firstChild);
    document.dispatchEvent(new CustomEvent('cms:media-updated', {
      detail: { section: 'game-capture' }
    }));
  }

  function run() {
    fetch('/data/photos.json?v=' + Math.floor(Date.now() / 60000), { cache: 'no-store' })
      .then(function (response) { return response.ok ? response.json() : { photos: [] }; })
      .then(function (data) {
        var photos = data && Array.isArray(data.photos) ? data.photos : [];
        if (/\/nghe-thuat0\//i.test(location.pathname)) renderArt(photos);
        renderGameCaptures(photos);
      })
      .catch(function () { /* Giao diện tĩnh vẫn hoạt động khi dữ liệu ảnh lỗi. */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
