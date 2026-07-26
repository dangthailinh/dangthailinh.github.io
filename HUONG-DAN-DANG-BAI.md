# Hướng dẫn dùng Bảng quản trị (viết bài không cần sửa code)

Web của bạn chạy trên **GitHub Pages** — chỉ phục vụ file tĩnh, không chạy được server.
Vì vậy "backend" ở đây là một **trang quản trị chạy ngay trong trình duyệt**, ghi bài thẳng
vào repo GitHub qua GitHub API. Không có server nào để hỏng, không có hoá đơn hàng tháng.

```
Bạn viết bài ở /admin  ─►  GitHub API ghi file vào repo  ─►  GitHub Pages build lại  ─►  bài hiện lên web
```

---

## 1. Đẩy code lên GitHub

Mở terminal trong thư mục `C:\linhkun`:

```bash
git add .
git commit -m "Them bang quan tri viet bai"
git push origin main
```

Đợi khoảng 1 phút để GitHub Pages build xong.

---

## 2. Tạo GitHub Token (làm 1 lần duy nhất)

1. Mở https://github.com/settings/personal-access-tokens/new
2. **Token name**: `blog-admin`
3. **Expiration**: chọn `No expiration` (hoặc 1 năm — hết hạn thì tạo lại)
4. **Repository access** → `Only select repositories` → chọn **dangthailinh.github.io**
5. Kéo xuống **Permissions → Repository permissions**, tìm dòng **Contents**, đổi thành **Read and write**
6. Bấm **Generate token** → copy chuỗi token (chỉ hiện 1 lần, copy ngay)

> Token này giống chìa khoá nhà. Đừng đưa cho ai, đừng chụp màn hình gửi người khác.
> Nếu lỡ lộ, vào lại trang trên bấm **Revoke** rồi tạo cái mới.

---

## 3. Đăng nhập bảng quản trị

Mở: **https://dangthailinh.github.io/admin/**

| Ô | Điền gì |
|---|---|
| Kho lưu trữ | `dangthailinh/dangthailinh.github.io` (đã điền sẵn) |
| Nhánh | `main` |
| Token | dán token vừa tạo |

Tick **Ghi nhớ trên máy này** → lần sau vào là tự đăng nhập.

---

## 4. Viết và đăng một bài

Tab **✎ Viết bài**:

1. **Đăng vào mục** — chọn `Kiến thức` hoặc `Khoa học`
2. **Chủ đề** — chọn nhóm (DevOps, AWS, AI… / Vũ trụ, Lượng tử, Bí ẩn…)
3. **Tiêu đề** — đường dẫn tự sinh theo tiêu đề, muốn đổi thì sửa ô bên dưới
4. **Mô tả ngắn** — 1–2 câu, hiện trên thẻ bài ở trang danh sách
5. **Ảnh bìa** — dán URL ảnh, hoặc bấm **⬆ Tải ảnh bìa từ máy**
6. **Thẻ / tags** — cách nhau bằng dấu phẩy
7. Viết nội dung ở khung bên phải
8. Bấm **👁 Xem trước** để kiểm tra
9. Bấm **🚀 Đăng bài lên web**

Sau 30–90 giây GitHub Pages build xong, bài sẽ tự hiện ở trang danh sách — **không cần sửa code gì cả**.

### Thanh công cụ soạn thảo

| Nút | Công dụng |
|---|---|
| Ô chọn đầu tiên | Đổi kiểu khối: Đoạn văn / H2 / H3 / H4 / Trích dẫn / Khối code |
| **B** *I* <u>U</u> ~~S~~ | In đậm, nghiêng, gạch chân, gạch ngang |
| `</>` | Code ngắn trong dòng |
| • List / 1. List | Danh sách chấm và danh sách số |
| 🔗 | Chèn liên kết |
| 🖼 | Chèn ảnh bằng URL |
| ⬆ | Tải ảnh từ máy lên GitHub rồi chèn |
| ▦ | Chèn bảng |
| ― | Đường kẻ ngang |
| ↶ ↷ | Hoàn tác / làm lại |
| ✕ format | Xoá định dạng của phần đang bôi đen |
| HTML | Xem và sửa mã HTML thô |

**Mẹo:**
- Kéo–thả ảnh thẳng vào khung soạn thảo, hoặc `Ctrl+V` ảnh từ clipboard → tự tải lên GitHub
- Dán nội dung từ Word/web sẽ được làm sạch tự động
- Bài đang soạn được lưu nháp trong trình duyệt, đóng tab rồi mở lại vẫn còn
- Dùng **H2** cho các phần chính — mục lục bên phải tự sinh từ H2

---

## 5. Sửa hoặc xoá bài đã đăng

Tab **☰ Quản lý bài**:

- **Xem** — mở bài trên web
- **Sửa** — tải bài về trình soạn thảo, sửa xong bấm **💾 Cập nhật bài viết**
- **Xoá** — xoá file bài viết khỏi repo và gỡ khỏi danh mục

---

## 6. Cấu trúc hệ thống (để sau này bạn nhớ)

```
/admin/
  index.html        Giao diện bảng quản trị
  admin.css         Giao diện
  admin.js          Đăng nhập, soạn thảo, gọi GitHub API
  templates.js      Khuôn HTML sinh ra bài viết

/data/posts.json    Danh mục toàn bộ bài đăng qua bảng quản trị

/cms/
  feed.js           Chèn thẻ bài mới vào trang danh sách
  post.js           Mục lục, bài trước/tiếp, bài liên quan cho bài mới

/kienthuc/articles/blog/<ten-bai>.html    Bài mục Kiến thức
/khoa-hoc0/bai-viet/<ten-bai>.html        Bài mục Khoa học
/khoa-hoc0/bai-viet/post.css              Giao diện bài mục Khoa học
/uploads/<năm>/<tháng>/...                Ảnh bạn tải lên
```

Các file cũ **không bị đụng vào**. Chỉ có 3 thay đổi nhỏ:

- `kienthuc/index.html` — thêm 1 dòng `<script>` và thuộc tính `data-cms-feed`
- `khoa-hoc0/0/khoa-hoc.html` — tương tự
- `kienthuc/assets/css/article.css` — thêm kiểu cho thẻ tag

---

## 7. Gặp trục trặc

| Hiện tượng | Nguyên nhân & cách xử lý |
|---|---|
| "Token không hợp lệ hoặc đã hết hạn" | Token sai hoặc hết hạn → tạo token mới ở bước 2 |
| "Token thiếu quyền Contents" | Vào lại token, bật **Contents: Read and write** |
| "Nội dung vừa bị thay đổi ở nơi khác" | Bấm **⟳ Tải lại** ở tab Quản lý rồi đăng lại |
| Đăng xong mà web chưa đổi | Đợi thêm 1–2 phút, rồi `Ctrl+Shift+R` để xoá cache |
| Bài không hiện ở trang danh sách | Mở `https://dangthailinh.github.io/data/posts.json` xem bài có trong đó không. Nếu có mà vẫn không hiện, mở Console (F12) xem báo lỗi gì |
| Ảnh tải lên bị lỗi | Ảnh phải nhỏ hơn 5MB — nén bớt rồi thử lại |

---

## 8. Vài lưu ý an toàn

- Trang `/admin/` ai cũng mở được, **nhưng không đăng bài được nếu không có token của bạn**. Token mới là thứ bảo vệ, không phải mật khẩu trang.
- Token lưu trong `localStorage` của trình duyệt trên máy bạn. Nếu dùng máy công cộng, đừng tick "Ghi nhớ", và bấm **Đăng xuất** khi xong.
- File `robots.txt` đã chặn Google lập chỉ mục `/admin/`.
- Mọi thay đổi đều là commit Git, nên **luôn khôi phục được** nếu lỡ tay xoá bài.
