// === Elemen DOM utama ===
const wallpaperInput = document.getElementById("wallpaperInput");
const resetBtn = document.getElementById("resetWallpaper");
const mainOutput = document.querySelector(".main-output");
const previewContainer = document.querySelector(".preview-img");
const videoOutput = document.querySelector(".video-output video");
const videoFigure = document.querySelector(".video-output");

// === IndexedDB setup ===
let db;
const DB_NAME = "WallpaperDB";
const STORE_NAME = "wallpaperStore";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    request.onerror = (event) => reject(event.target.error);
  });
}

function saveToDB(key, value) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = (event) => reject(event.target.error);
  });
}

function getFromDB(key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function clearDB() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = (event) => reject(event.target.error);
  });
}

// === Fungsi UI dasar ===
function addCover() {
  if (!mainOutput.querySelector(".cover-output")) {
    const cover = document.createElement("figure");
    cover.className = "cover-output";
    mainOutput.appendChild(cover);
  }
}

function removeCover() {
  const cover = mainOutput.querySelector(".cover-output");
  if (cover) cover.remove();
}

function updatePreview(url, type) {
  previewContainer.innerHTML = "";
  if (url) {
    const wrapper = document.createElement("div");
    if (type === "video") {
      const video = document.createElement("video");
      video.src = url;
      video.controls = true;
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
      wrapper.appendChild(video);
    } else if (type === "youtube") {
      const iframe = document.createElement("iframe");
      iframe.src = url;
      iframe.allow = "autoplay; fullscreen";
      iframe.frameBorder = "0";
      wrapper.appendChild(iframe);
    } else {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Wallpaper Preview";
      wrapper.appendChild(img);
    }
    previewContainer.appendChild(wrapper);
  }
}

// === Fungsi utama pasang wallpaper ===
function applyWallpaper(url, type) {
  // Reset semua media dulu
  videoOutput.pause();
  videoOutput.removeAttribute("src");
  videoOutput.load();
  videoFigure.style.background = "none";
  removeCover();
  if (document.querySelector(".yt-wallpaper")) {
    document.querySelector(".yt-wallpaper").remove();
  }

  if (!url) {
    mainOutput.style.backgroundImage = "none";
    mainOutput.style.background = "var(--dark-mode-item)";
    updatePreview(null);
    return;
  }

  if (type === "video") {
    mainOutput.style.backgroundImage = "none";
    videoOutput.src = url;
    videoOutput.autoplay = true;
    videoOutput.muted = true;
    videoOutput.loop = true;
    videoOutput.play().catch(() => {});
    videoFigure.style.background = "#000";
    updatePreview(url, "video");
  } else if (type === "youtube") {
    const ytIframe = document.createElement("iframe");
    ytIframe.src = url;
    ytIframe.allow =
      "autoplay; fullscreen; picture-in-picture; loop; clipboard-write";
    ytIframe.className = "yt-wallpaper";
    ytIframe.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      border: none;
      z-index: 0;
      pointer-events: none;
    `;
    mainOutput.appendChild(ytIframe);
    updatePreview(url, "youtube");
    showFloatButton();
  } else {
    mainOutput.style.backgroundImage = `url(${url})`;
    mainOutput.style.backgroundPosition = "50% 50%";
    mainOutput.style.backgroundSize = "cover";
    mainOutput.style.backgroundColor = "transparent";
    addCover();
    updatePreview(url, "image");
  }
}

// === Event upload wallpaper ===
wallpaperInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    const blob = file;
    const url = URL.createObjectURL(blob);
    const type = file.type.startsWith("video") ? "video" : "image";

    await clearDB();
    await saveToDB("wallpaper", { blob, type });
    applyWallpaper(url, type);
  }
});

// === Reset wallpaper ===
resetBtn.addEventListener("click", async () => {
  await clearDB();
  applyWallpaper(null);
});

// === Inisialisasi saat halaman dibuka ===
openDB().then(async () => {
  const saved = await getFromDB("wallpaper");
  if (saved) {
    if (saved.blob) {
      const blobUrl = URL.createObjectURL(saved.blob);
      applyWallpaper(blobUrl, saved.type);
    } else if (saved.type === "youtube" && saved.url) {
      applyWallpaper(saved.url, "youtube");
    }
  } else {
    applyWallpaper(null);
  }
});

// === YOUTUBE WALLPAPER ===
const ytInput = document.querySelector(".input-yt input");
let ytIframe = null;
let floatBtn = null;
let isFloating = false;

function getYouTubeEmbedLink(url) {
  const match = url.match(
    /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (match && match[1]) {
    const id = match[1];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}`;
  }
  return null;
}

function applyYouTubeWallpaper(embedUrl) {
  applyWallpaper(embedUrl, "youtube");

  clearDB().then(() => {
    saveToDB("wallpaper", { type: "youtube", url: embedUrl });
  });
}

function showFloatButton() {
  if (floatBtn) floatBtn.remove();

  floatBtn = document.createElement("button");
  floatBtn.textContent = "📺 Video Apung";
  floatBtn.className = "float-video-btn";
  floatBtn.style.cssText = `
    position: fixed;
    top: 15px; left: 15px;
    z-index: 9999;
    background: #000a;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 14px;
  `;
  document.body.appendChild(floatBtn);

  floatBtn.addEventListener("click", toggleFloatingVideo);
}

function toggleFloatingVideo() {
  ytIframe = document.querySelector(".yt-wallpaper");
  if (!ytIframe) return;

  if (!isFloating) {
    ytIframe.classList.add("yt-floating"); // tambahkan class ini
    isFloating = true;
    floatBtn.textContent = "🖥️ Jadikan Latar Belakang";
  } else {
    ytIframe.classList.remove("yt-floating"); // hapus class saat kembali
    isFloating = false;
    floatBtn.textContent = "📺 Video Apung";
  }
}

ytInput.addEventListener("change", (e) => {
  const url = e.target.value.trim();
  const embed = getYouTubeEmbedLink(url);
  if (embed) {
    applyYouTubeWallpaper(embed);
  } else {
    alert("Link YouTube tidak valid!");
  }
});

//
