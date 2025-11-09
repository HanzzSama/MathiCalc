// === Elemen DOM utama ===
const wallpaperInput = document.getElementById("wallpaperInput");
const resetBtn = document.getElementById("resetWallpaper");
const mainOutput = document.querySelector(".main-output");
const previewContainer = document.querySelector(".preview-img");
const videoOutput = document.querySelector(".video-output video");
const videoFigure = document.querySelector(".video-output");
const pageUpload = document.querySelector(".page-upload");
const liveImg = document.querySelector(".live-img");
const ytInput = document.querySelector(".input-yt input");

// === IndexedDB setup ===
let db;
let currentBlobUrl = null;
const DB_NAME = "WallpaperDB";
const STORE_NAME = "wallpaperStore";

// Fungsi bantu untuk ubah lebar live-img
function updateLiveImgWidth(isActive) {
  if (!liveImg) return;
  liveImg.style.width = isActive ? "100%" : "auto";
}

// === Buka / Buat Database ===
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

// === UI Dasar ===
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

// === Preview ===
function updatePreview(url, type) {
  previewContainer.innerHTML = "";
  if (!url) return;

  const wrapper = document.createElement("div");

  if (type === "video") {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.style.width = "100%";
    video.style.borderRadius = "10px";
    wrapper.appendChild(video);
  } else if (type === "youtube") {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.allow = "autoplay; fullscreen";
    iframe.frameBorder = "0";
    iframe.style.width = "100%";
    iframe.style.aspectRatio = "16 / 9";
    iframe.style.borderRadius = "10px";
    wrapper.appendChild(iframe);
  } else {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Wallpaper Preview";
    img.style.width = "100%";
    img.style.borderRadius = "10px";
    wrapper.appendChild(img);
  }

  previewContainer.appendChild(wrapper);
}

// === Terapkan Wallpaper ===
function applyWallpaper(url, type) {
  // Reset media
  videoOutput.pause();
  videoOutput.removeAttribute("src");
  videoOutput.load();
  videoOutput.style.zIndex = "-1";
  videoFigure.style.background = "none";
  removeCover();

  const oldYT = document.querySelector(".yt-wallpaper");
  if (oldYT) oldYT.remove();

  if (floatBtn) {
    floatBtn.remove();
    floatBtn = null;
    isFloating = false;
  }

  if (!url) {
    mainOutput.style.backgroundImage = "none";
    mainOutput.style.background = "var(--dark-mode-item)";
    updatePreview(null);
    return;
  }

  // === Jenis Wallpaper ===
  if (type === "video") {
    mainOutput.style.backgroundImage = "none";
    videoOutput.src = url;
    videoOutput.autoplay = true;
    videoOutput.muted = true;
    videoOutput.loop = true;
    videoOutput.play().catch(() => {});
    videoFigure.style.zIndex = "5";
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
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 0;
    `;
    mainOutput.appendChild(ytIframe);
    updatePreview(url, "youtube");
    showFloatButton();
  } else {
    mainOutput.style.backgroundImage = `url(${url})`;
    mainOutput.style.backgroundPosition = "center";
    mainOutput.style.backgroundSize = "cover";
    mainOutput.style.backgroundRepeat = "no-repeat";
    mainOutput.style.backgroundColor = "transparent";
    addCover();
    updatePreview(url, "image");
  }
}

// === Upload File Lokal (Gambar/Video) ===
wallpaperInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const blob = file;
  if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);

  const url = URL.createObjectURL(blob);
  currentBlobUrl = url;
  const type = file.type.startsWith("video") ? "video" : "image";

  await clearDB();
  await saveToDB("wallpaper", { blob, type });
  applyWallpaper(url, type);
});

// === Reset Wallpaper ===
resetBtn.addEventListener("click", async () => {
  await clearDB();

  // Hapus URL blob yang aktif
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }

  // Reset video output
  videoOutput.pause();
  videoOutput.removeAttribute("src");
  videoOutput.load();
  videoFigure.style.zIndex = "-1";

  // Hapus YouTube wallpaper jika ada
  const yt = document.querySelector(".yt-wallpaper");
  if (yt) yt.remove();

  // Hapus tombol float jika ada
  if (floatBtn) {
    floatBtn.remove();
    floatBtn = null;
    isFloating = false;
  }

  // 🔹 Reset input file (supaya kosong lagi)
  wallpaperInput.value = "";

  // 🔹 Reset input YouTube (kosongkan juga)
  if (ytInput) ytInput.value = "";

  // 🔹 Reset ukuran live-img (kalau ada)
  updateLiveImgWidth(false);

  // Terapkan wallpaper kosong (balik ke default)
  applyWallpaper(null);
});

// === Inisialisasi Otomatis Saat Halaman Dibuka ===
openDB().then(async () => {
  const saved = await getFromDB("wallpaper");
  if (saved) {
    if (saved.blob) {
      if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
      const blobUrl = URL.createObjectURL(saved.blob);
      currentBlobUrl = blobUrl;
      applyWallpaper(blobUrl, saved.type);
    } else if (saved.type === "youtube" && saved.url) {
      applyWallpaper(saved.url, "youtube");
    }
  } else {
    applyWallpaper(null);
  }
});

// === YOUTUBE WALLPAPER ===
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
  clearDB().then(() =>
    saveToDB("wallpaper", { type: "youtube", url: embedUrl })
  );
}

// === Tombol Float Setting ===
function showFloatButton() {
  if (floatBtn) floatBtn.remove();

  floatBtn = document.createElement("button");
  floatBtn.textContent = "📺 Setting Video";
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
    ytIframe.classList.add("yt-floating");
    ytIframe.style.cssText = `
      position: fixed;
      bottom: 10px; right: 10px;
      width: 300px; height: 170px;
      z-index: 9998;
      pointer-events: auto;
      border-radius: 10px;
    `;
    isFloating = true;
    floatBtn.textContent = "🖥️ Jadikan Latar Belakang";
  } else {
    ytIframe.classList.remove("yt-floating");
    ytIframe.style.cssText = `
      position: absolute;
      width: 100%; height: 100%;
      pointer-events: none;
      z-index: 0;
    `;
    isFloating = false;
    floatBtn.textContent = "📺 Setting Video";
  }
}

// === Input Link YouTube ===
if (ytInput) {
  ytInput.addEventListener("change", (e) => {
    const url = e.target.value.trim();
    const embed = getYouTubeEmbedLink(url);
    if (embed) {
      applyYouTubeWallpaper(embed);
    } else {
      alert("Link YouTube tidak valid!");
    }
  });
}

// Fungsi untuk sembunyikan upload panel
function hideUploadSection() {
  if (pageUpload) {
    pageUpload.classList.remove("active");
    pageUpload.style.display = "none";
  }
}

// Fungsi untuk tampilkan kembali upload panel
function showUploadSection() {
  if (pageUpload) {
    pageUpload.classList.add("active");
    pageUpload.style.display = "flex"; // atau 'block' tergantung desain kamu
  }
}

// === Override fungsi applyWallpaper ===
const oldApplyWallpaper = applyWallpaper;
applyWallpaper = function (url, type) {
  oldApplyWallpaper(url, type);

  // Kalau ada wallpaper aktif (gambar/video/youtube)
  if (url) {
    hideUploadSection();
    updateLiveImgWidth(true); // aktif → width 100%
  } else {
    showUploadSection();
    updateLiveImgWidth(false); // tidak aktif → width auto
  }
};
