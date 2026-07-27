import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function sectionOf(file) {
  const value = file.replaceAll('\\', '/');
  if (/^blog\/bai-viet\/[^/]+\.html$/i.test(value)) return 'blog';
  if (/^kienthuc\/articles\/.+\.html$/i.test(value)) return 'kienthuc';
  if (/^khoa-hoc0\/0\/khoa-hoc-(?:nang-cao-)?bai\d+\.html$/i.test(value)) return 'khoahoc';
  if (/^game0\/0\/game-(?:nang-cao-)?bai\d+\.html$/i.test(value)) return 'game';
  if (/^manga0\/0\/truyen-manga-(?:nang-cao-)?bai\d+\.html$/i.test(value)) return 'manga';
  if (/^phim0\/0\/(?:cold-fish|phim-(?:nang-cao-)?bai\d+)\.html$/i.test(value)) return 'phim';
  if (/^nghe-thuat0\/(?:[123]|dark-art)\.html$/i.test(value)) return 'nghethuat';
  return '';
}

function walk(folder, prefix = '') {
  const output = [];
  for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const absolute = path.join(folder, entry.name);
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) output.push(...walk(absolute, relative));
    else if (entry.name.toLowerCase().endsWith('.html')) output.push(relative);
  }
  return output;
}

let changed = 0;
for (const relative of walk(root)) {
  const section = sectionOf(relative);
  if (!section) continue;
  const absolute = path.join(root, relative);
  const original = fs.readFileSync(absolute, 'utf8');
  let html = original;

  if (!/<script\b[^>]*src=["']\/cms\/theme\.js["']/i.test(html)) {
    html = html.replace(/<\/head>/i, '  <script src="/cms/theme.js" defer></script>\n</head>');
  }
  html = html.replace(/<body\b([^>]*)>/i, (match, attrs) => {
    if (/\bdata-cms-(?:post|feed)=/i.test(attrs)) return match;
    return `<body${attrs} data-cms-post="${section}">`;
  });

  if (html !== original) {
    fs.writeFileSync(absolute, html, 'utf8');
    changed += 1;
  }
}

console.log(`Đã tích hợp giao diện CMS vào ${changed} bài cũ.`);
