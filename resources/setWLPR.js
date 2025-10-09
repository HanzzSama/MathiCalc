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

// === UI functions ===
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
    } else {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Wallpaper Preview";
      wrapper.appendChild(img);
    }
    previewContainer.appendChild(wrapper);
  }
}

function applyWallpaper(url, type) {
  if (!url) {
    mainOutput.style.backgroundImage = "none";
    mainOutput.style.background = "var(--dark-mode-item)";
    removeCover();
    updatePreview(null);

    videoOutput.pause();
    videoOutput.removeAttribute("src");
    videoOutput.load();
    videoFigure.style.background = "none";
    return;
  }

  if (type === "video") {
    // Reset gambar
    mainOutput.style.backgroundImage = "none";
    removeCover();

    // Pasang video
    videoOutput.pause();
    videoOutput.removeAttribute("src");
    videoOutput.load();
    videoOutput.src = url;
    videoOutput.autoplay = true;
    videoOutput.muted = true;
    videoOutput.loop = true;
    videoOutput.play().catch(() => {});
    videoFigure.style.background = "#000";
    updatePreview(url, "video");
  } else {
    // Reset video
    videoOutput.pause();
    videoOutput.removeAttribute("src");
    videoOutput.load();
    videoFigure.style.background = "none";

    // Pasang gambar
    mainOutput.style.backgroundImage = `url(${url})`;
    mainOutput.style.backgroundColor = "transparent";
    mainOutput.style.backgroundPosition = "50% 50%";
    mainOutput.style.backgroundSize = "cover";
    addCover();
    updatePreview(url, "image");
  }
}

// === Initialize ===
openDB().then(async () => {
  const savedData = await getFromDB("wallpaper");
  if (savedData) {
    const { blob, type } = savedData;
    const blobUrl = URL.createObjectURL(blob);
    applyWallpaper(blobUrl, type);
  } else {
    applyWallpaper(null);
  }
});

// === Upload Event ===
wallpaperInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    const blob = file; // simpan blob asli
    const url = URL.createObjectURL(blob);
    const type = file.type.startsWith("video") ? "video" : "image";

    applyWallpaper(url, type);

    // Simpan blob ke IndexedDB
    await saveToDB("wallpaper", { blob, type });
  }
});

// === Reset Event ===
resetBtn.addEventListener("click", async () => {
  await clearDB();
  applyWallpaper(null);
});
