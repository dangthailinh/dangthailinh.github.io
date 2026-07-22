/*
 * Community API and static server for the Linh Osimi site.
 * Start with: node community-server.js
 * Data is written to data/community.json (created automatically).
 */
'use strict';

var crypto = require('crypto');
var fs = require('fs');
var http = require('http');
var path = require('path');
var url = require('url');

var root = __dirname;
var dataPath = path.join(root, 'data', 'community.json');
var port = Number(process.env.PORT || 2018);
var maxBodySize = 20 * 1024;
var sessionLifetime = 1000 * 60 * 60 * 24 * 30;

function emptyData() {
  return { users: [], comments: [], sessions: [] };
}

function loadData() {
  try {
    var data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    return {
      users: Array.isArray(data.users) ? data.users : [],
      comments: Array.isArray(data.comments) ? data.comments : [],
      sessions: Array.isArray(data.sessions) ? data.sessions : []
    };
  } catch (error) {
    return emptyData();
  }
}

function saveData(data) {
  fs.mkdirSync(path.dirname(dataPath), { recursive: true });
  var tempPath = dataPath + '.tmp';
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, dataPath);
}

function id(prefix) {
  return prefix + '_' + crypto.randomBytes(12).toString('hex');
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

function publicUser(user) {
  return { id: user.id, username: user.username, displayName: user.displayName };
}

function publicComment(comment) {
  return {
    id: comment.id,
    message: comment.message,
    createdAt: comment.createdAt,
    user: comment.user
  };
}

function readJson(request) {
  return new Promise(function (resolve, reject) {
    var body = '';
    request.setEncoding('utf8');
    request.on('data', function (chunk) {
      body += chunk;
      if (body.length > maxBodySize) reject(new Error('Nội dung gửi lên quá lớn.'));
    });
    request.on('end', function () {
      if (!body) return resolve({});
      try { resolve(JSON.parse(body)); } catch (error) { reject(new Error('Dữ liệu gửi lên không hợp lệ.')); }
    });
    request.on('error', reject);
  });
}

function findSessionUser(request, data) {
  var token = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  var now = Date.now();
  data.sessions = data.sessions.filter(function (session) { return session.createdAt + sessionLifetime > now; });
  var session = data.sessions.find(function (item) { return item.token === token; });
  if (!session) return null;
  return data.users.find(function (user) { return user.id === session.userId; }) || null;
}

function createSession(data, user) {
  var token = crypto.randomBytes(32).toString('hex');
  data.sessions.push({ token: token, userId: user.id, createdAt: Date.now() });
  data.sessions = data.sessions.slice(-200);
  return token;
}

function validUsername(value) {
  return /^[a-zA-Z0-9_-]{3,24}$/.test(value);
}

function serveStatic(request, response, pathname) {
  var requested = pathname === '/' ? '/index.html' : pathname;
  var relative;
  try { relative = decodeURIComponent(requested).replace(/^[/\\]+/, ''); } catch (error) { return sendJson(response, 400, { error: 'Đường dẫn không hợp lệ.' }); }
  var segments = relative.split(/[/\\]+/);
  if (segments.some(function (segment) { return segment === 'data' || segment.charAt(0) === '.'; })) return sendJson(response, 403, { error: 'Không được phép.' });
  var filePath = path.resolve(root, relative);
  if (path.relative(root, filePath).startsWith('..') || path.isAbsolute(path.relative(root, filePath))) return sendJson(response, 403, { error: 'Không được phép.' });
  fs.stat(filePath, function (error, stat) {
    if (error || !stat.isFile()) return sendJson(response, 404, { error: 'Không tìm thấy tệp.' });
    var extension = path.extname(filePath).toLowerCase();
    var types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.ico': 'image/x-icon', '.ttf': 'font/ttf' };
    response.writeHead(200, { 'Content-Type': types[extension] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(response);
  });
}

function handleApi(request, response, pathname) {
  var data = loadData();
  if (request.method === 'GET' && pathname === '/api/community/comments') {
    var comments = data.comments.slice().sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); }).slice(0, 100).map(publicComment);
    return sendJson(response, 200, { comments: comments });
  }

  if (request.method === 'POST' && (pathname === '/api/community/register' || pathname === '/api/community/login')) {
    return readJson(request).then(function (body) {
      var username = String(body.username || '').trim().toLowerCase();
      var password = String(body.password || '');
      if (!validUsername(username)) return sendJson(response, 400, { error: 'Tên đăng nhập cần 3–24 ký tự: chữ, số, dấu gạch dưới hoặc gạch ngang.' });
      if (password.length < 8) return sendJson(response, 400, { error: 'Mật khẩu cần ít nhất 8 ký tự.' });
      var user = data.users.find(function (item) { return item.username === username; });
      if (pathname.endsWith('/register')) {
        var displayName = String(body.displayName || '').trim().replace(/\s+/g, ' ');
        if (displayName.length < 2 || displayName.length > 40) return sendJson(response, 400, { error: 'Tên hiển thị cần từ 2 đến 40 ký tự.' });
        if (user) return sendJson(response, 409, { error: 'Tên đăng nhập này đã được sử dụng.' });
        var salt = crypto.randomBytes(16).toString('hex');
        user = { id: id('user'), username: username, displayName: displayName, salt: salt, passwordHash: hashPassword(password, salt), createdAt: new Date().toISOString() };
        data.users.push(user);
      } else {
        if (!user || hashPassword(password, user.salt) !== user.passwordHash) return sendJson(response, 401, { error: 'Tên đăng nhập hoặc mật khẩu chưa đúng.' });
      }
      var token = createSession(data, user);
      saveData(data);
      return sendJson(response, 200, { token: token, user: publicUser(user) });
    }).catch(function (error) { return sendJson(response, 400, { error: error.message || 'Không thể xử lý yêu cầu.' }); });
  }

  if (request.method === 'POST' && pathname === '/api/community/comments') {
    return readJson(request).then(function (body) {
      var user = findSessionUser(request, data);
      if (!user) return sendJson(response, 401, { error: 'Hãy đăng nhập trước khi bình luận.' });
      var message = String(body.message || '').trim();
      if (!message || message.length > 500) return sendJson(response, 400, { error: 'Bình luận cần có từ 1 đến 500 ký tự.' });
      var comment = { id: id('comment'), message: message, createdAt: new Date().toISOString(), user: publicUser(user) };
      data.comments.push(comment);
      data.comments = data.comments.slice(-1000);
      saveData(data);
      return sendJson(response, 201, { comment: publicComment(comment) });
    }).catch(function (error) { return sendJson(response, 400, { error: error.message || 'Không thể xử lý yêu cầu.' }); });
  }

  return sendJson(response, 404, { error: 'Không tìm thấy API.' });
}

http.createServer(function (request, response) {
  var pathname = url.parse(request.url).pathname;
  if (pathname.indexOf('/api/community/') === 0) return handleApi(request, response, pathname);
  if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'Phương thức không được hỗ trợ.' });
  return serveStatic(request, response, pathname);
}).listen(port, function () {
  console.log('Community server running at http://localhost:' + port);
  console.log('Community data: ' + dataPath);
});
