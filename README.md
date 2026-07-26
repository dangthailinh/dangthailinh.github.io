# dangthailinh.github.io

Trang cá nhân của Linh Osimi — chạy trên **GitHub Pages**, toàn bộ là file tĩnh.
Không có server, không có build step. Push lên `main` là web cập nhật sau 30–90 giây.

> **Viết bài mới:** vào https://dangthailinh.github.io/admin/ — xem [HUONG-DAN-DANG-BAI.md](HUONG-DAN-DANG-BAI.md)

---

## Bản đồ thư mục

### Nội dung chính

| Thư mục | Dùng để làm gì |
|---|---|
| `index.html` | Trang chủ |
| `kienthuc/` | Mục Kiến thức — DevOps, AWS, AI, Lập trình |
| `khoa-hoc0/` | Mục Khoa học — 5 trang, phân trang thủ công |
| `blog/` | NEET Daily Log — nhật ký dạng dòng thời gian + thư viện ảnh |
| `nghe-thuat0/` | Mục Nghệ thuật |
| `phim0/` | Mục Phim |
| `manga0/` | Mục Manga |
| `game0/` | Mục Game |
| `gai-xinh/` | Bộ sưu tập ảnh, mở từ `assistant.html` |

### Hệ thống đăng bài

| Đường dẫn | Dùng để làm gì |
|---|---|
| `admin/` | Bảng quản trị: đăng nhập GitHub token, soạn thảo WYSIWYG, đăng/sửa/xoá bài |
| `admin/templates.js` | Khuôn HTML sinh ra bài viết cho từng mục |
| `cms/feed.js` | Chèn thẻ bài mới vào trang danh sách Kiến thức và Khoa học |
| `cms/post.js` | Mục lục, thanh tiến độ, bài trước/tiếp, bài liên quan cho bài mới |
| `data/posts.json` | Danh mục toàn bộ bài đăng qua bảng quản trị |
| `uploads/` | Ảnh bạn tải lên từ bảng quản trị, chia theo năm/tháng |

Bài viết mới được sinh ra ở:

```
kienthuc/articles/blog/<tên-bài>.html
khoa-hoc0/bai-viet/<tên-bài>.html
blog/bai-viet/<tên-bài>.html
```

### Trang tương tác & dự án

| Đường dẫn | Dùng để làm gì | Phụ thuộc |
|---|---|---|
| `dist/Solarsysc.html` | Mô phỏng hệ mặt trời (jsOrrery) | `dist/` — **tự chứa, đủ để chạy** |
| `blackhole.html` | Mô phỏng hố đen | `lib/js-libs/`, `lib/main.js`, `lib/raytracer.glsl`, `lib/three-js-monkey-patch.js`, `img/` |
| `coler-test.html` | Mô phỏng chất lỏng WebGL | `lib/script.js`, `lib/dat.gui.min.js`, `lib/iconfont.ttf` |
| `3d/room/`, `3d/cube/` | Cảnh 3D, mở từ `assistant.html` | |
| `discordbot45/` | Trang giới thiệu dự án Discord bot | |
| `assistant.html` | Trợ lý điều hướng, link tới `gai-xinh/` và `3d/cube/` | |
| `achievements.html`, `linh.html` | Trang phụ, link từ trang chủ | |

### Tài nguyên dùng chung

| Đường dẫn | Nội dung |
|---|---|
| `linhkun.css`, `linhkun.js` | Style và script dùng chung, được ~50 trang gọi tới |
| `img/` | Ảnh dùng chung + texture cho `blackhole.html` |
| `muv/` | Nhạc nền |
| `favicon.png`, `cyberpunk 2077.ico` | Icon (`.ico` dùng trong `game0/0/game-bai2.html`) |
| `lib/` | Thư viện bên thứ ba của `blackhole.html` và `coler-test.html` |

### Cấu hình

| File | Vai trò |
|---|---|
| `.nojekyll` | Tắt Jekyll để GitHub Pages phục vụ file nguyên trạng |
| `.gitattributes` | Chuẩn hoá xuống dòng, hết cảnh báo CRLF |
| `robots.txt` | Chặn Google lập chỉ mục `/admin/` |
| `sitemap.xml` | Danh sách trang chính cho công cụ tìm kiếm |
| `LICENSE.md` | Giấy phép MIT của jsOrrery — **phải giữ** vì `dist/jsorrery.js` còn trong repo |

### Công cụ bảo trì

| File | Vai trò |
|---|---|
| `tools/don-dep.ps1` | Dọn file thừa, gom file lẻ vào `lib/`. Chạy `-DryRun` để xem trước |
| `tools/kiem-tra-link.ps1` | Quét link nội bộ hỏng trên toàn site. Chỉ đọc, không sửa gì |

---

## Đừng xoá những thứ này

Trông thì có vẻ thừa, nhưng đều đang được dùng:

- **`kienthuc/0/`, `kienthuc/1/`** — trang chuyển hướng giữ cho URL cũ còn sống. Thanh điều hướng ở `khoa-hoc0/` vẫn trỏ tới `/kienthuc/0/kienthuc.html`
- **`lib/js-libs/`** — 8 thư viện `blackhole.html` cần
- **`cyberpunk 2077.ico`** — logo trong `game0/0/game-bai2.html`
- **`muv/never.mp3.mp3`** — tên hai lần đuôi nhưng `index.html` gọi đúng tên này
- **`dist/`** — trang hệ mặt trời chạy hoàn toàn từ đây
- **`LICENSE.md`** — giấy phép MIT của jsOrrery

---

## Quy trình làm việc

Bảng quản trị commit **thẳng lên GitHub**, nên máy bạn thường bị chậm hơn remote.
Luôn kéo về trước khi push:

```bash
git pull --rebase origin main
git add -A
git commit -m "mô tả thay đổi"
git push origin main
```

Nếu push bị chặn với thông báo `[rejected] main -> main (fetch first)`, đó chính là
lý do trên — chạy `git pull --rebase origin main` rồi push lại.
