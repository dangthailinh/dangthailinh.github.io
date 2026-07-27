/*
  CÁCH THÊM ẢNH SAU NÀY
  1. Chép ảnh vào blog/assets/gallery/
  2. Tìm đúng album trong ALBUMS bên dưới
  3. Thêm một object:
     {
       src: "assets/gallery/ten-anh.png",
       title: "Tên tấm ảnh",
       date: "Ngày/tháng nếu nhớ",
       note: "Câu chuyện hoặc vài dòng ghi chú"
     }
  Trang sẽ tự cập nhật số lượng ảnh, album và lightbox.
*/

const ALBUMS = [
  {
    id: "selfies",
    icon: "☺",
    title: "Selfies",
    subtitle: "camera roll / this is what i looked like",
    story: "Một nơi để lưu lại những phiên bản khác nhau của mình: tóc rối, ánh sáng xấu, mặt mộc, những buổi tối đi lang thang và cả những tấm chụp chẳng có chủ đích.",
    prompt: "Gợi ý để viết sau: lúc đó mình ở đâu, tâm trạng thế nào, điều gì đã xảy ra trước hoặc sau tấm ảnh?",
    photos: [
      {
        src: "assets/gallery/selfie-sunset.png",
        title: "Gió biển & hoàng hôn",
        date: "chưa ghi ngày",
        note: "Một tấm selfie có ánh nắng cuối ngày. Câu chuyện chi tiết sẽ được viết sau."
      },
      {
        src: "assets/gallery/selfie-night-01.png",
        title: "Đêm dưới khu chung cư",
        date: "chưa ghi ngày",
        note: "Ánh đèn xanh, ghế ngoài trời và một buổi tối mình muốn lưu lại."
      },
      {
        src: "assets/gallery/selfie-night-02.png",
        title: "Cùng một tối, góc khác",
        date: "chưa ghi ngày",
        note: "Một khung hình khác của buổi tối đó."
      },
      {
        src: "assets/gallery/selfie-mask.png",
        title: "Đi bộ buổi tối",
        date: "chưa ghi ngày",
        note: "Khẩu trang, ánh đèn đường và một đoạn đường về."
      },
      {
        src: "assets/gallery/selfie-low-angle.png",
        title: "Camera đặt hơi thấp",
        date: "chưa ghi ngày",
        note: "Một góc chụp ngẫu nhiên và biểu cảm rất thật."
      },
      {
        src: "assets/gallery/selfie-motorbike.png",
        title: "Trên đường đi",
        date: "chưa ghi ngày",
        note: "Mũ bảo hiểm, áo khoác đen và một khoảnh khắc chờ xe chạy."
      },
      {
        src: "assets/gallery/selfie-daylight.png",
        title: "Tóc hôm nay",
        date: "chưa ghi ngày",
        note: "Một buổi sáng hoặc trưa bình thường, được giữ lại vì mình thích mái tóc hôm đó."
      }
    ]
  },
  {
    id: "small-moments",
    icon: "✦",
    title: "Khoảnh khắc nhỏ",
    subtitle: "things that made an ordinary day specific",
    story: "Những bức ảnh không hẳn đẹp nhất, nhưng nhìn vào là nhớ ngay một ngày cụ thể: chỗ ngồi kỳ lạ, một bữa ăn, một mẩu giấy cũ hoặc một phút đang phụ mọi người.",
    prompt: "Gợi ý để viết sau: vì sao mình chụp tấm này, ai ở bên cạnh, chi tiết nào trong ảnh khiến mình nhớ nhất?",
    photos: [
      {
        src: "assets/gallery/moment-workstation.png",
        title: "Bàn làm việc kiểu ứng biến",
        date: "chưa ghi ngày",
        note: "Laptop, dây sạc và chiếc ghế từ một bình nước — một khoảnh khắc rất đời thường."
      },
      {
        src: "assets/gallery/moment-serving-food.png",
        title: "Một buổi phụ đồ ăn",
        date: "chưa ghi ngày",
        note: "Khung hình của một buổi tụ họp. Mình sẽ viết lại xem hôm đó là dịp gì."
      },
      {
        src: "assets/gallery/moment-paper-note.png",
        title: "Mẩu giấy từ những ngày đi học",
        date: "chưa ghi ngày",
        note: "Một tờ giấy nhỏ có lời nhắn. Giữ ở đây để nó không bị thất lạc."
      },
      {
        src: "assets/gallery/moment-food-experiment.png",
        title: "Bữa ăn đáng ngờ",
        date: "chưa ghi ngày",
        note: "Một thử nghiệm ẩm thực cần có bài viết riêng để giải thích."
      }
    ]
  },
  {
    id: "favorites",
    icon: "♡",
    title: "Sở thích & đồ nhặt được",
    subtitle: "books / art / little things i brought home",
    story: "Sách, tranh và những món đồ mình dừng lại ngắm lâu hơn bình thường. Đây sẽ là nơi viết review ngắn, kể vì sao mình thích hoặc mình tìm thấy chúng ở đâu.",
    prompt: "Gợi ý để viết sau: mình tìm thấy món này ở đâu, điều gì thu hút mình, có mang nó về nhà không?",
    photos: [
      {
        src: "assets/gallery/favorite-rezero-book.png",
        title: "Re:Zero tập 1",
        date: "chưa ghi ngày",
        note: "Một cuốn sách được cầm trên tay giữa buổi đi chơi."
      },
      {
        src: "assets/gallery/favorite-art-print.png",
        title: "Bức tranh màu hồng",
        date: "chưa ghi ngày",
        note: "Màu sắc, con mèo và nhân vật đeo kính khiến mình dừng lại nhìn."
      },
      {
        src: "assets/gallery/favorite-blue-art.png",
        title: "Căn phòng xanh",
        date: "chưa ghi ngày",
        note: "Một thế giới bằng nét xanh dày đặc — đủ chi tiết để nhìn rất lâu."
      }
    ]
  },
  {
    id: "macro-life",
    icon: "✺",
    title: "Ong @@ & thế giới tí hon",
    subtitle: "macro friends / flowers / tiny depth of field",
    story: "Một album dành cho những người bạn bé xíu sống giữa lá và hoa. Chụp macro giống như bước vào một thế giới khác: chỉ cần lệch vài milimét là vùng nét đã chuyển từ mắt sang bụng, nhưng chính sự khó đoán đó làm mỗi tấm ảnh trở nên thú vị.",
    prompt: "Gợi ý để viết sau: loài gì, tìm thấy ở đâu, ánh sáng lúc đó thế nào và mình đã giữ máy ra sao?",
    photos: [
      {
        src: "assets/gallery/macro-fly-daisy.png",
        title: "Người bạn kawaii ghé uống mật",
        date: "chưa ghi ngày",
        note: "Một người bạn kawaii đang hút chút mật hoa trên bông cúc."
      },
      {
        src: "assets/gallery/macro-spider-leaf.png",
        title: "Giữ máy bằng nắm tay",
        date: "chưa ghi ngày",
        note: "Mẹo chụp: dùng nắm tay như một chiếc túi đậu kê máy, bật chế độ chụp liên tiếp rồi tì máy ảnh vào nắm tay trong lúc bấm máy."
      },
      {
        src: "assets/gallery/macro-spider-window.png",
        title: "Đầu hay bụng?",
        date: "chưa ghi ngày",
        note: "Tương tự, gần như không thể lấy nét đồng thời cả phần đầu lẫn phần bụng."
      },
      {
        src: "assets/gallery/macro-bee-yellow-flower.png",
        title: "Ong @@",
        date: "chưa ghi ngày",
        note: "Một chú ong cắm đầu vào bông hoa vàng — bận rộn đến mức chẳng để ý ống kính."
      },
      {
        src: "assets/gallery/macro-bee-portrait.png",
        title: "Chân dung cận cảnh",
        date: "chưa ghi ngày",
        note: "Thêm một người bạn hút mật, lần này tiến sát tới mức có thể nhìn rõ đôi mắt và lớp lông vàng."
      }
    ]
  },
  {
    id: "places",
    icon: "⌁",
    title: "Đường đi & nơi chốn",
    subtitle: "outside world sightings",
    story: "Những lúc mình thực sự bước ra ngoài: thành phố về đêm, biển tối và đường ray chạy về phía mặt trời. Có thể sau này mỗi nơi sẽ thành một bài travel log riêng.",
    prompt: "Gợi ý để viết sau: địa điểm, thời gian, âm thanh, thời tiết và cảm giác đầu tiên khi mình đến đó.",
    photos: [
      {
        src: "assets/gallery/place-coconut-night.png",
        title: "Dừa lạnh & thành phố đêm",
        date: "chưa ghi ngày",
        note: "Một buổi tối nhìn thành phố từ xa, với trái dừa trên tay."
      },
      {
        src: "assets/gallery/place-beach-night.png",
        title: "Biển lúc trời gần tối",
        date: "chưa ghi ngày",
        note: "Gió, tiếng sóng và một khoảnh khắc hơi mờ nhưng rất đúng cảm giác."
      },
      {
        src: "assets/gallery/place-railway-sunset.png",
        title: "Đường ray về phía hoàng hôn",
        date: "chưa ghi ngày",
        note: "Một khung cảnh trên đường đi — nắng nằm đúng giữa đường ray."
      }
    ]
  }
];

const albumRoot = document.querySelector("#album-root");
const albumTabs = document.querySelector("#album-tabs");
const lightbox = document.querySelector("#photo-lightbox");
const lightboxImage = document.querySelector("#lightbox-image");
const lightboxFile = document.querySelector("#lightbox-file");
const lightboxAlbum = document.querySelector("#lightbox-album");
const lightboxTitle = document.querySelector("#lightbox-title");
const lightboxNote = document.querySelector("#lightbox-note");
const lightboxIndex = document.querySelector("#lightbox-index");

let activeAlbum = "all";
let visiblePhotos = [];
let activePhotoIndex = 0;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function safePhotoSource(value) {
  const source = String(value || "").trim();
  return /^(?:https?:\/\/|\/(?!\/)|assets\/)/i.test(source) ? source : "";
}

function allPhotos() {
  return ALBUMS.flatMap((album) =>
    album.photos.map((photo) => ({ ...photo, albumId: album.id, albumTitle: album.title }))
  );
}

function renderTabs() {
  const total = allPhotos().length;
  albumTabs.innerHTML = `
    <button class="album-tab is-active" type="button" data-album="all">
      <span>▣</span><span>Tất cả</span><span class="album-tab-count">${total}</span>
    </button>
    ${ALBUMS.map((album) => `
      <button class="album-tab" type="button" data-album="${album.id}">
        <span>${album.icon}</span><span>${album.title}</span>
        <span class="album-tab-count">${album.photos.length}</span>
      </button>
    `).join("")}
  `;
}

function photoCard(photo, album, photoNumber) {
  const isUnwritten = !photo.note || photo.note.toLowerCase().includes("sẽ được viết sau");
  const source = safePhotoSource(photo.src);
  if (!source) return "";
  return `
    <figure class="photo-card" data-photo-src="${escapeHtml(source)}">
      <button type="button" data-open-photo="${escapeHtml(source)}" aria-label="Mở ảnh: ${escapeHtml(photo.title)}">
        <img src="${escapeHtml(source)}" alt="${escapeHtml(photo.title)}" loading="lazy">
        <figcaption class="photo-card-copy">
          <span class="photo-card-meta">
            <span>${String(photoNumber).padStart(2, "0")}.PNG</span>
            <span>${escapeHtml(photo.date)}</span>
          </span>
          <h3>${escapeHtml(photo.title)}</h3>
          <p class="${isUnwritten ? "unwritten-note" : ""}">${escapeHtml(photo.note || "Chưa viết câu chuyện cho tấm ảnh này.")}</p>
        </figcaption>
      </button>
    </figure>
  `;
}

function renderAlbums() {
  const albums = activeAlbum === "all"
    ? ALBUMS
    : ALBUMS.filter((album) => album.id === activeAlbum);

  albumRoot.innerHTML = albums.map((album, albumIndex) => `
    <section class="album-section" id="album-${album.id}">
      <header class="album-header">
        <div>
          <span class="eyebrow">${album.icon} folder / ${album.photos.length} items</span>
          <h2 class="album-title">
            <span class="album-number">${String(ALBUMS.indexOf(album) + 1).padStart(2, "0")}</span>
            ${album.title}
          </h2>
          <p class="album-subtitle">${album.subtitle}</p>
        </div>
        <article class="album-story">
          <p>${album.story}</p>
          <span class="album-story-prompt">${album.prompt}</span>
        </article>
      </header>
      <div class="photo-grid">
        ${album.photos.map((photo, index) => photoCard(photo, album, index + 1)).join("")}
      </div>
    </section>
  `).join("");

  visiblePhotos = albums.flatMap((album) =>
    album.photos.map((photo) => ({ ...photo, albumId: album.id, albumTitle: album.title }))
  );
}

function openPhoto(src) {
  const index = visiblePhotos.findIndex((photo) => photo.src === src);
  if (index < 0) return;
  activePhotoIndex = index;
  updateLightbox();
  lightbox.showModal();
  document.body.style.overflow = "hidden";
}

function updateLightbox() {
  const photo = visiblePhotos[activePhotoIndex];
  if (!photo) return;
  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.title;
  lightboxFile.textContent = photo.src.split("/").pop();
  lightboxAlbum.textContent = photo.albumTitle;
  lightboxTitle.textContent = photo.title;
  lightboxNote.textContent = photo.note || "Chưa viết câu chuyện cho tấm ảnh này.";
  lightboxIndex.textContent = `${activePhotoIndex + 1} / ${visiblePhotos.length}`;
}

function stepPhoto(direction) {
  activePhotoIndex = (activePhotoIndex + direction + visiblePhotos.length) % visiblePhotos.length;
  updateLightbox();
}

function closeLightbox() {
  lightbox.close();
  document.body.style.overflow = "";
}

albumTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-album]");
  if (!button) return;
  activeAlbum = button.dataset.album;
  albumTabs.querySelectorAll("[data-album]").forEach((item) => {
    item.classList.toggle("is-active", item === button);
  });
  renderAlbums();
  albumRoot.scrollIntoView({ behavior: "smooth", block: "start" });
});

albumRoot.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-open-photo]");
  if (trigger) openPhoto(trigger.dataset.openPhoto);
});

document.querySelector("#lightbox-close").addEventListener("click", closeLightbox);
document.querySelector("#lightbox-prev").addEventListener("click", () => stepPhoto(-1));
document.querySelector("#lightbox-next").addEventListener("click", () => stepPhoto(1));

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft") stepPhoto(-1);
  if (event.key === "ArrowRight") stepPhoto(1);
});

function mergeManagedPhotos(db) {
  const photos = Array.isArray(db?.photos) ? db.photos : [];
  photos.forEach((photo) => {
    const album = ALBUMS.find((item) => item.id === photo.album);
    const source = safePhotoSource(photo.src);
    if (!album || !source) return;
    album.photos.unshift({
      src: source,
      title: String(photo.title || "Ảnh chưa đặt tên"),
      date: String(photo.date || "chưa ghi ngày"),
      note: String(photo.note || "")
    });
  });
}

function initGallery() {
  document.querySelector("#photo-total").textContent = allPhotos().length;
  document.querySelector("#album-total").textContent = ALBUMS.length;
  renderTabs();
  renderAlbums();
}

fetch(`/data/photos.json?v=${Math.floor(Date.now() / 60000)}`)
  .then((response) => response.ok ? response.json() : { photos: [] })
  .then(mergeManagedPhotos)
  .catch(() => {})
  .finally(initGallery);
