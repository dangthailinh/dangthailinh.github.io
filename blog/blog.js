const POSTS = [
  {
    id: "2026-07-23-room-day",
    date: "2026-07-23",
    time: "15:40",
    category: "life",
    mood: "૮ ˶ᵔ ᵕ ᵔ˶ ა",
    title: "Ngày đầu tiên của góc nhỏ này",
    excerpt: "Mình dựng một căn phòng bé xíu trên internet để cất những ngày bình thường, không cần thuật toán và cũng chẳng cần hoàn hảo.",
    body: [
      "Hôm nay mình quyết định mở thêm một góc nhật ký. Không phải để biến mọi ngày thành một câu chuyện thật lớn, mà để những điều rất nhỏ không trôi qua mất.",
      "Ở đây có thể sẽ là một bài hát nghe lúc ba giờ sáng, một bức ảnh chụp vội, vài dòng sau một trận game hoặc chỉ là câu “hôm nay mình đã ăn ngon”. Nếu một ngày chẳng có gì xảy ra, thì đó cũng là một ngày đáng được ghi lại.",
      "Mục tiêu duy nhất: viết thật, viết chậm và giữ nơi này giống một căn phòng riêng trên old web."
    ],
    media: {
      type: "image",
      src: "assets/neet-cat.png",
      alt: "Mèo trắng đen nằm thư giãn",
      caption: "webmaster hiện tại",
      contain: true
    }
  },
  {
    id: "2026-07-23-screen-glow",
    date: "2026-07-23",
    time: "02:17",
    category: "video",
    mood: "(－_－) zzZ",
    title: "Ánh sáng từ màn hình lúc hai giờ sáng",
    excerpt: "Một đoạn video ngắn, một căn phòng tối và cảm giác thời gian chạy chậm hơn bình thường.",
    body: [
      "Đêm muộn luôn làm mọi thứ dịu xuống. Ngoài cửa sổ không còn nhiều tiếng xe, còn trong phòng chỉ có tiếng quạt máy và ánh sáng xanh từ màn hình.",
      "Mình lưu lại đoạn video này như một mẩu không khí. Không cần diễn biến, không cần cao trào — chỉ là bằng chứng rằng mình đã ở đây, trong đúng khoảnh khắc này."
    ],
    media: {
      type: "video",
      src: "../hero-vibe.mp4",
      caption: "02:17 AM — room signal"
    }
  },
  {
    id: "2026-07-22-sheep-advice",
    date: "2026-07-22",
    time: "19:26",
    category: "photo",
    mood: "ᏊˊꈊˋᏊ",
    title: "Lời khuyên từ một con cừu pixel",
    excerpt: "Nó không nói gì cả, nhưng nhìn rất giống đang nhắc mình rằng nghỉ ngơi không phải là lười biếng.",
    body: [
      "Mình tìm thấy con cừu pixel này và lập tức muốn đặt nó ở một góc trang. Nó có năng lượng rất “không đi đâu cả” — hoàn hảo cho một ngày ở nhà.",
      "Danh sách việc cần làm vẫn còn dài, nhưng tối nay mình cho phép bản thân đi chậm. Có khi nghỉ ngơi tử tế chính là cách để ngày mai đỡ nặng hơn."
    ],
    media: {
      type: "image",
      src: "assets/pixel-lamb.png",
      alt: "Cừu trắng phong cách pixel",
      caption: "professional rester",
      contain: true
    }
  },
  {
    id: "2026-07-21-small-life",
    date: "2026-07-21",
    time: "23:08",
    category: "thought",
    mood: "(´• ω •`)",
    title: "Một cuộc sống nhỏ không có nghĩa là vô nghĩa",
    excerpt: "Có những ngày phạm vi thế giới chỉ là căn phòng, tai nghe và vài tab đang mở. Mình nghĩ như vậy cũng không sao.",
    body: [
      "Internet thường khiến mình có cảm giác ai cũng đang đi rất nhanh. Người ta hoàn thành dự án, đi thật xa, gặp thật nhiều người. Còn mình có những ngày chỉ quanh quẩn trong một không gian rất nhỏ.",
      "Nhưng một cuộc sống nhỏ vẫn có đủ chi tiết để quan sát: màu trời đổi trên tường, bài hát cũ bỗng nghe hay hơn, một tin nhắn đến đúng lúc. Có lẽ ý nghĩa không phụ thuộc vào độ ồn ào.",
      "Mình viết dòng này để lần sau, khi thấy mình đang đứng yên, sẽ nhớ rằng đứng yên cũng là một trạng thái của hành trình."
    ],
    media: {
      type: "image",
      src: "assets/skeleton-arch.png",
      alt: "Khung xương pixel trắng đen",
      caption: "still here, somehow",
      contain: true
    }
  },
  {
    id: "2026-07-20-todo",
    date: "2026-07-20",
    time: "10:42",
    category: "life",
    mood: "(ง •̀_•́)ง",
    title: "To-do list của người hay để mai",
    excerpt: "Ba việc quan trọng, năm việc linh tinh và một ô “ra ngoài hít thở” vẫn chưa được đánh dấu.",
    body: [
      "Mình thử viết danh sách thật ngắn thay vì chất đầy những mục tiêu khổng lồ. Chỉ ba việc quan trọng cho một ngày là đủ.",
      "Điều buồn cười là khi bớt ép bản thân, mình lại làm được nhiều hơn. Có lẽ bộ não cũng giống một chiếc máy cũ: mở quá nhiều cửa sổ thì nó sẽ đứng hình."
    ],
    media: {
      type: "image",
      src: "assets/todo-note.png",
      alt: "To-do list phong cách pixel",
      caption: "tomorrow is also a day",
      contain: true
    }
  }
];

const CATEGORY_LABELS = {
  life: "đời sống",
  photo: "ảnh",
  video: "video",
  thought: "suy nghĩ"
};

const MONTHS = [
  "tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
  "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"
];

const timeline = document.querySelector("#timeline");
const emptyState = document.querySelector("#empty-state");
const visibleCount = document.querySelector("#visible-count");
const searchInput = document.querySelector("#post-search");
const filterButtons = [...document.querySelectorAll("[data-filter]")];
const archiveList = document.querySelector("#archive-list");
const dialog = document.querySelector("#post-dialog");
const dialogContent = document.querySelector("#dialog-content");
const dialogTitle = document.querySelector("#dialog-window-title");

let activeFilter = "all";
let activeMonth = "all";
let searchTerm = "";

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getDateParts(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return {
    day: String(date.getDate()).padStart(2, "0"),
    month: MONTHS[date.getMonth()],
    year: date.getFullYear(),
    monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    full: new Intl.DateTimeFormat("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date)
  };
}

function mediaMarkup(media, controls = false) {
  if (!media) return "";
  const containClass = media.contain ? " is-contain" : "";
  const caption = media.caption || "";

  if (media.type === "video") {
    return `
      <div class="post-media${containClass}" data-caption="${caption}">
        <video src="${media.src}" ${controls ? "controls" : ""} muted playsinline preload="metadata"></video>
      </div>
    `;
  }

  return `
    <div class="post-media${containClass}" data-caption="${caption}">
      <img src="${media.src}" alt="${media.alt || ""}" loading="lazy">
    </div>
  `;
}

function getVisiblePosts() {
  return POSTS.filter((post) => {
    const matchFilter = activeFilter === "all" || post.category === activeFilter;
    const matchMonth = activeMonth === "all" || post.date.startsWith(activeMonth);
    const haystack = normalizeText(`${post.title} ${post.excerpt} ${post.body.join(" ")}`);
    return matchFilter && matchMonth && haystack.includes(searchTerm);
  });
}

function groupByDate(posts) {
  return posts.reduce((groups, post) => {
    (groups[post.date] ||= []).push(post);
    return groups;
  }, {});
}

function renderTimeline() {
  const posts = getVisiblePosts();
  const groups = groupByDate(posts);

  visibleCount.textContent = posts.length;
  emptyState.hidden = posts.length !== 0;
  timeline.innerHTML = Object.entries(groups).map(([date, dayPosts]) => {
    const parts = getDateParts(date);
    const cards = dayPosts.map((post) => `
      <article class="post-card" data-category="${post.category}">
        <div class="post-copy">
          <div class="post-meta">
            <span class="post-tag">${CATEGORY_LABELS[post.category]}</span>
            <time datetime="${post.date}T${post.time}">${post.time}</time>
            <span>mood: ${post.mood}</span>
          </div>
          <h3>${post.title}</h3>
          <p>${post.excerpt}</p>
          <button class="read-more" type="button" data-post-id="${post.id}">
            mở bài viết <span aria-hidden="true">↗</span>
          </button>
        </div>
        ${mediaMarkup(post.media)}
      </article>
    `).join("");

    return `
      <section class="day-group" data-month="${parts.monthKey}">
        <div class="day-marker" aria-label="${parts.full}">
          <strong>${parts.day}</strong>
          <span>${parts.month}<br>${parts.year}</span>
        </div>
        <div class="day-posts">${cards}</div>
      </section>
    `;
  }).join("");
}

function renderArchive() {
  const counts = POSTS.reduce((result, post) => {
    const key = post.date.slice(0, 7);
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});

  const monthButtons = Object.entries(counts)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, count]) => {
      const [year, month] = key.split("-").map(Number);
      return `
        <button class="archive-button" type="button" data-month="${key}">
          <span>⌗ ${MONTHS[month - 1]} ${year}</span>
          <span>${count}</span>
        </button>
      `;
    }).join("");

  archiveList.innerHTML = `
    <button class="archive-button is-active" type="button" data-month="all">
      <span>⌗ tất cả</span>
      <span>${POSTS.length}</span>
    </button>
    ${monthButtons}
  `;
}

function openPost(postId) {
  const post = POSTS.find((item) => item.id === postId);
  if (!post) return;

  const date = getDateParts(post.date);
  const paragraphs = post.body.map((paragraph) => `<p>${paragraph}</p>`).join("");
  const figure = post.media ? `
    <figure>
      ${post.media.type === "video"
        ? `<video src="${post.media.src}" controls playsinline preload="metadata"></video>`
        : `<img src="${post.media.src}" alt="${post.media.alt || ""}">`}
      <figcaption>${post.media.caption || ""}</figcaption>
    </figure>
  ` : "";

  dialogTitle.textContent = `${post.date}_${post.id.split("-").slice(3).join("-")}.txt`;
  dialogContent.innerHTML = `
    <div class="dialog-meta">${date.full} · ${post.time} · ${CATEGORY_LABELS[post.category]} · mood ${post.mood}</div>
    <h2>${post.title}</h2>
    <div class="dialog-body">${paragraphs}</div>
    ${figure}
  `;
  dialog.showModal();
  document.body.style.overflow = "hidden";
}

function closeDialog() {
  const playingVideo = dialog.querySelector("video");
  if (playingVideo) playingVideo.pause();
  dialog.close();
  document.body.style.overflow = "";
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    renderTimeline();
  });
});

archiveList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-month]");
  if (!button) return;
  activeMonth = button.dataset.month;
  archiveList.querySelectorAll("[data-month]").forEach((item) => {
    item.classList.toggle("is-active", item === button);
  });
  renderTimeline();
  document.querySelector("#daily-log").scrollIntoView({ behavior: "smooth", block: "start" });
});

searchInput.addEventListener("input", () => {
  searchTerm = normalizeText(searchInput.value.trim());
  renderTimeline();
});

timeline.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-post-id]");
  if (trigger) openPost(trigger.dataset.postId);
});

document.querySelector("#dialog-close").addEventListener("click", closeDialog);
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) closeDialog();
});
dialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeDialog();
});

const song = document.querySelector("#tiny-song");
const musicToggle = document.querySelector("#music-toggle");
const musicState = document.querySelector("#music-state");
const musicWidget = document.querySelector(".music-widget");

musicToggle.addEventListener("click", async () => {
  if (song.paused) {
    try {
      await song.play();
      musicToggle.textContent = "❚❚ pause tiny song";
      musicState.textContent = "PLAYING";
      musicWidget.classList.add("is-playing");
    } catch {
      musicState.textContent = "FILE NOT FOUND";
    }
  } else {
    song.pause();
    musicToggle.textContent = "▶ play tiny song";
    musicState.textContent = "PAUSED";
    musicWidget.classList.remove("is-playing");
  }
});

song.addEventListener("ended", () => {
  musicToggle.textContent = "▶ play tiny song";
  musicState.textContent = "PAUSED";
  musicWidget.classList.remove("is-playing");
});

document.querySelector("#guestbook-button").addEventListener("click", () => {
  const note = document.querySelector("#guestbook-note");
  note.hidden = false;
  localStorage.setItem("neet-blog-guestbook-signed", "yes");
});

if (localStorage.getItem("neet-blog-guestbook-signed") === "yes") {
  document.querySelector("#guestbook-note").hidden = false;
}

function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString("vi-VN");
  document.querySelector("#local-clock").textContent = time;
  document.querySelector("#footer-clock").textContent = time;
  document.querySelector("#footer-date").textContent = date;
}

renderArchive();
renderTimeline();
updateClock();
setInterval(updateClock, 30_000);
