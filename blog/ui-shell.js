const backButton = document.querySelector("[data-history-back]");
const forwardButton = document.querySelector("[data-history-forward]");
const topButton = document.querySelector("[data-scroll-top]");
const themeButton = document.querySelector("[data-theme-toggle]");
const copyButton = document.querySelector("[data-copy-link]");

function fallbackBackUrl() {
  return document.body.classList.contains("gallery-page") ? "index.html" : "../index.html";
}

backButton?.addEventListener("click", () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = fallbackBackUrl();
  }
});

forwardButton?.addEventListener("click", () => {
  window.history.forward();
});

topButton?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

function setNightMode(isNight) {
  document.body.classList.toggle("night-mode", isNight);
  themeButton?.setAttribute("aria-pressed", String(isNight));

  const icon = themeButton?.querySelector("[data-theme-icon]");
  const label = themeButton?.querySelector("[data-theme-label]");
  if (icon) icon.textContent = isNight ? "☀" : "☾";
  if (label) label.textContent = isNight ? "Day" : "Night";
}

const savedTheme = localStorage.getItem("neet-ui-theme");
setNightMode(savedTheme === "night");

themeButton?.addEventListener("click", () => {
  const nextNightMode = !document.body.classList.contains("night-mode");
  setNightMode(nextNightMode);
  localStorage.setItem("neet-ui-theme", nextNightMode ? "night" : "day");
});

copyButton?.addEventListener("click", async () => {
  const originalLabel = "copy link";
  try {
    await navigator.clipboard.writeText(window.location.href);
    copyButton.textContent = "copied ✓";
  } catch {
    copyButton.textContent = "copy failed";
  }

  window.setTimeout(() => {
    copyButton.textContent = originalLabel;
  }, 1600);
});

function openBlogAdmin(route, title) {
  let dialog = document.querySelector("#blog-admin-dialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "blog-admin-dialog";
    dialog.className = "blog-admin-dialog";
    dialog.innerHTML = `
      <div class="blog-admin-dialog__bar">
        <strong data-admin-title>Chỉnh Blog</strong>
        <a data-admin-open href="/admin/" target="_blank" rel="noopener">Mở toàn màn hình ↗</a>
        <button type="button" data-admin-close aria-label="Đóng">Đóng ×</button>
      </div>
      <iframe title="Công cụ quản trị Blog"></iframe>
    `;
    document.body.appendChild(dialog);
    dialog.querySelector("[data-admin-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      dialog.close();
    });
  }
  const url = `/admin/${route}`;
  dialog.querySelector("[data-admin-title]").textContent = title;
  dialog.querySelector("[data-admin-open]").href = url;
  dialog.querySelector("iframe").src = url;
  dialog.showModal();
}

function mountBlogAdminDock() {
  if (!localStorage.getItem("cms.token")) return;
  const dock = document.createElement("aside");
  dock.className = "blog-edit-dock";
  dock.setAttribute("aria-label", "Chỉnh Blog nhanh");
  dock.innerHTML = `
    <button type="button" data-admin-route="?tab=write&section=blog&category=life" data-admin-title="Viết nhật ký">✎ Viết nhật ký</button>
    <button type="button" data-admin-route="?tab=photos" data-admin-title="Thêm ảnh vào Photos">▧ Tải ảnh</button>
    <button type="button" data-admin-route="?tab=theme&section=blog" data-admin-title="Chỉnh giao diện Blog">▦ Giao diện</button>
  `;
  dock.addEventListener("click", (event) => {
    const button = event.target.closest("[data-admin-route]");
    if (button) openBlogAdmin(button.dataset.adminRoute, button.dataset.adminTitle);
  });
  document.body.appendChild(dock);
}

mountBlogAdminDock();
