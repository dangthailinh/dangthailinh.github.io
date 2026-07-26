# Hướng dẫn dùng Bảng quản trị

Web của bạn chạy trên **GitHub Pages** — chỉ phục vụ file tĩnh, không chạy được server.
Vì vậy "backend" ở đây là một **trang quản trị chạy ngay trong trình duyệt**, ghi bài thẳng
vào repo GitHub qua GitHub API. Không có server nào để hỏng, không có hoá đơn hàng tháng.

```
Bạn viết ở /admin  ─►  GitHub API ghi file vào repo  ─►  Pages build lại  ─►  bài lên web
```

Bảng quản trị quản lý được **7 mục**: Kiến thức · Khoa học · Blog · Game · Manga · Nghệ thuật · Phim.

---

## 1. Đẩy code lên GitHub

```bash
git pull --rebase origin main
git add -A
git commit -m "Cap nhat bang quan tri"
git push origin main
```

> Luôn `git pull --rebase` trước khi push. Bảng quản trị commit thẳng lên GitHub nên
> máy bạn thường bị chậm hơn remote.

---

## 2. Tạo GitHub Token (làm 1 lần duy nhất)

1. Mở https://github.com/settings/personal-access-tokens/new
2. **Token name**: `blog-admin`
3. **Expiration**: `No expiration` (hoặc 1 năm)
4. **Repository access** → `Only select repositories` → chọn **dangthailinh.github.io**
5. **Permissions → Repository permissions** → dòng **Contents** → đổi thành **Read and write**
6. **Generate token** → copy chuỗi token ngay (chỉ hiện một lần)

> Token là chìa khoá nhà. Không đưa ai, không chụp màn hình gửi người khác.
> Lỡ lộ thì vào lại trang trên bấm **Revoke** rồi tạo cái mới.

---

## 3. Đăng nhập

Mở **https://dangthailinh.github.io/admin/**, điền repo `dangthailinh/dangthailinh.github.io`,
nhánh `main`, dán token, tick **Ghi nhớ trên máy này**.

---

## 4. Ba tab

### ◈ Tổng quan

Bốn con số: tổng bài · đang hiện trên web · hẹn đăng · bản nháp.
Bên dưới là biểu đồ bài theo từng mục và danh sách **Sửa gần đây** — bấm vào là mở thẳng bài đó ra sửa.

### ✎ Viết bài

Cột trái là thông tin bài, cột phải là trình soạn thảo. Bấm **👁 Xem trước** trên thanh công cụ
để chia đôi màn hình — bên phải hiện bài thật, tự cập nhật khi bạn gõ. Có nút chuyển
giữa khung máy tính và khung điện thoại.

### ☰ Quản lý bài

Ô tìm kiếm, ba bộ lọc (mục · trạng thái · sắp xếp), và tick chọn nhiều bài để thao tác hàng loạt.

---

## 5. Viết một bài

1. **Đăng vào mục** — chọn 1 trong 7 mục. Danh sách **Chủ đề** tự đổi theo mục
2. **Trạng thái** — Đăng ngay / Hẹn ngày đăng / Lưu nháp (xem mục 6)
3. **Tiêu đề** — đường dẫn tự sinh theo tiêu đề, muốn đổi thì sửa ô bên dưới
4. **Mô tả ngắn** — 1–2 câu, hiện trên thẻ bài ở trang danh sách
5. **Ảnh bìa** — dán URL, hoặc bấm **⬆ Tải ảnh bìa từ máy**
6. **Thẻ / tags** — cách nhau bằng **dấu phẩy** (`code, AI` → hai thẻ; `code;AI` → một thẻ)
7. Viết nội dung, rồi bấm **🚀 Đăng bài lên web**

Bảng quản trị tự chờ GitHub Pages build xong (hiện đồng hồ đếm giây) rồi mới cho mở bài,
nên bạn không bị dính trang 404 bị cache.

### Thanh công cụ

| Nút | Công dụng |
|---|---|
| Ô chọn đầu tiên | Đoạn văn / H2 / H3 / H4 / Trích dẫn / Khối code |
| **B** *I* <u>U</u> ~~S~~ | Đậm, nghiêng, gạch chân, gạch ngang |
| `</>` | Code ngắn trong dòng |
| • List / 1. List | Danh sách chấm và danh sách số |
| 🔗 🖼 ⬆ ▦ ― | Liên kết · ảnh từ URL · tải ảnh lên · bảng · đường kẻ |
| ↶ ↷ | Hoàn tác / làm lại |
| ✕ format | Xoá định dạng phần đang bôi đen |
| HTML | Xem và sửa mã HTML thô |
| 👁 Xem trước | Bật/tắt khung xem trước bên phải |

**Mẹo:** kéo–thả ảnh thẳng vào khung soạn thảo, hoặc `Ctrl+V` ảnh từ clipboard → tự tải lên GitHub.
Dán nội dung từ Word/web sẽ được làm sạch tự động. Dùng **H2** cho các phần chính — mục lục tự sinh từ H2.

---

## 6. Ba trạng thái bài

| Trạng thái | Có file HTML? | Hiện ở trang danh sách? |
|---|---|---|
| **Đăng ngay** | Có | Có, ngay lập tức |
| **Hẹn ngày đăng** | Có | Chỉ từ ngày đăng trở đi |
| **Lưu nháp** | Không | Không |

**Nháp** chỉ nằm trong `data/posts.json`, không sinh file HTML nên không có URL nào để mở.

> **Lưu ý thật:** repo của bạn là công khai, nên nội dung nháp trong `data/posts.json`
> vẫn đọc được nếu ai đó mở đúng file đó. Đừng để thông tin nhạy cảm ở đây.
> Tương tự, bài **hẹn đăng** đã có file thật trên web — người biết URL vẫn mở được sớm.
> Đây là giới hạn của mọi trang tĩnh, không riêng gì hệ thống này.

---

## 7. Quản lý bài

- **Tìm kiếm** theo tiêu đề, mô tả, thẻ, đường dẫn
- **Lọc** theo mục và theo trạng thái
- **Sắp xếp**: mới nhất · cũ nhất · vừa sửa gần đây · tiêu đề A→Z / Z→A

Mỗi dòng có 4 nút:

| Nút | Làm gì |
|---|---|
| **Xem** | Mở bài trên web (bài nháp không có nút này) |
| **Sửa** | Tải bài về trình soạn thảo |
| **Nhân bản** | Tạo bản sao ở dạng **nháp**, dùng bài cũ làm khuôn |
| **Xoá** | Xoá file bài viết và gỡ khỏi danh mục |

### Thao tác hàng loạt

Tick ô vuông đầu mỗi dòng → thanh thao tác hiện ra:

- **Chuyển sang Đã đăng** — sinh file HTML cho các bài nháp
- **Chuyển sang Nháp** — gỡ file HTML khỏi web, giữ nội dung để sửa lại sau
- **Xoá đã chọn**

---

## 8. Bài mới hiện ở đâu

| Mục | Trang danh sách | File bài viết |
|---|---|---|
| Kiến thức | `/kienthuc/index.html` | `kienthuc/articles/blog/` |
| Khoa học | `/khoa-hoc0/0/khoa-hoc.html` | `khoa-hoc0/bai-viet/` |
| Blog | `/blog/index.html` (dòng thời gian + popup) | `blog/bai-viet/` |
| Game | `/game0/0/game.html` | `game0/bai-viet/` |
| Manga | `/manga0/0/truyen-manga.html` | `manga0/bai-viet/` |
| Nghệ thuật | `/nghe-thuat0/nghe-thuat.html` | `nghe-thuat0/bai-viet/` |
| Phim | `/phim0/0/phim.html` | `phim0/bai-viet/` |

Bài mới được chèn vào **đầu** trang danh sách, đúng kiểu thẻ mà mục đó đang dùng —
thẻ Game có ảnh + ngày, thẻ Manga có nhãn thể loại, thẻ Nghệ thuật kiểu gallery,
thẻ Phim có poster và giữ đúng thuộc tính lọc sẵn có của trang.

Bài Blog xuất hiện ở **hai nơi**: trong dòng thời gian (đọc bằng popup như bài cũ)
và một trang riêng để chia sẻ link.

---

## 9. Cấu trúc hệ thống

```
/admin/
  index.html        Giao diện 3 tab
  admin.css         Giao diện
  admin.js          Đăng nhập, soạn thảo, gọi GitHub API
  templates.js      Khuôn HTML sinh ra bài viết cho từng mục

/data/posts.json    Danh mục toàn bộ bài đăng qua bảng quản trị

/cms/
  feed.js           Chèn thẻ bài mới vào 6 trang danh sách
  post.js           Mục lục, bài trước/tiếp, bài liên quan
  article.css       Giao diện bài viết cho Game · Manga · Nghệ thuật · Phim

/khoa-hoc0/bai-viet/post.css   Giao diện bài mục Khoa học
/blog/bai-viet/post.css        Giao diện bài mục Blog
/uploads/<năm>/<tháng>/        Ảnh bạn tải lên
```

Các trang cũ chỉ bị thêm **một dòng `<script>`** và **một thuộc tính `data-cms-feed`** trên thẻ `<body>`.
Bài viết cũ không bị đụng vào.

---

## 10. Gặp trục trặc

| Hiện tượng | Cách xử lý |
|---|---|
| "Token không hợp lệ hoặc đã hết hạn" | Tạo token mới ở bước 2 |
| "Token thiếu quyền Contents" | Vào lại token, bật **Contents: Read and write** |
| "Nội dung vừa bị thay đổi ở nơi khác" | Bấm **⟳ Tải lại** rồi thử lại |
| Mở bài ra thấy **404 Page not found** | Bạn mở link lúc Pages chưa build xong, CDN cache lại trang 404. Bấm `Ctrl+Shift+R`. Bảng quản trị nay đã tự chờ build xong nên hiếm khi gặp |
| Bài không hiện ở trang danh sách | Mở `https://dangthailinh.github.io/data/posts.json` xem bài có trong đó và `status` là gì. Nháp thì không hiện là đúng |
| Ảnh tải lên bị lỗi | Ảnh phải nhỏ hơn 5MB |
| `[rejected] main -> main (fetch first)` khi push | Chạy `git pull --rebase origin main` rồi push lại |

---

## 11. An toàn

- Trang `/admin/` ai cũng mở được, **nhưng không đăng bài được nếu không có token của bạn**
- Token lưu trong `localStorage` trên máy bạn. Máy công cộng thì đừng tick "Ghi nhớ", xong bấm **Đăng xuất**
- `robots.txt` đã chặn Google lập chỉ mục `/admin/`
- Mọi thay đổi đều là commit Git nên **luôn khôi phục được** nếu lỡ tay xoá bài
