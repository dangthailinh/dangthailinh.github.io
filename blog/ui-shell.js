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
