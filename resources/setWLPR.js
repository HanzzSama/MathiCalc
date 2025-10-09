// Ambil elemen
const wallpaperInput = document.getElementById("wallpaperInput");
const resetBtn = document.getElementById("resetWallpaper");
const mainOutput = document.querySelector(".main-output");
const previewContainer = document.querySelector(".preview-img");
const videoOutput = document.querySelector(".video-output video");

// Tambah cover (shadow overlay)
function addCover() {
  if (!mainOutput.querySelector(".cover-output")) {
    const cover = document.createElement("figure");
    cover.className = "cover-output";
    mainOutput.appendChild(cover);
  }
}

// Hapus cover
function removeCover() {
  const cover = mainOutput.querySelector(".cover-output");
  if (cover) cover.remove();
}

// Update preview
function updatePreview(url, type = "image") {
  previewContainer.innerHTML = "";
  if (!url) return;

  const wrapper = document.createElement("div");
  if (type.startsWith("video")) {
    const video = document.createElement("video");
    video.src = url;
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.style.maxWidth = "100%";
    wrapper.appendChild(video);
  } else {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Wallpaper Preview";
    wrapper.appendChild(img);
  }
  previewContainer.appendChild(wrapper);
}

// Terapkan wallpaper
function applyWallpaper(url, type = "image") {
  if (url) {
    if (type.startsWith("video")) {
      // ---- Mode video ----
      // Hapus background gambar
      mainOutput.style.backgroundImage = "none";
      mainOutput.style.backgroundColor = "transparent";

      // Tampilkan video
      videoOutput.src = url;
      videoOutput.style.display = "block";
      videoOutput.muted = true;
      videoOutput.loop = true;
      videoOutput.autoplay = true;
      videoOutput.playsInline = true;
      videoOutput.currentTime = 0; // reset waktu video
      videoOutput.play().catch(() => {});
    } else {
      // ---- Mode gambar ----
      // Reset dan sembunyikan video
      videoOutput.pause();
      videoOutput.removeAttribute("src");
      videoOutput.load(); // benar-benar reset video
      videoOutput.style.display = "none";

      // Tampilkan gambar
      mainOutput.style.backgroundImage = `url(${url})`;
      mainOutput.style.backgroundPosition = "center";
      mainOutput.style.backgroundSize = "cover";
    }

    addCover();
    updatePreview(url, type);
  } else {
    // ---- Reset semua ----
    mainOutput.style.backgroundImage = "none";
    mainOutput.style.background = "var(--dark-mode-item)";
    videoOutput.pause();
    videoOutput.removeAttribute("src");
    videoOutput.load();
    videoOutput.style.display = "none";
    removeCover();
    updatePreview(null);
  }
}

// Cek localStorage
const savedWallpaper = localStorage.getItem("wallpaper");
const savedType = localStorage.getItem("wallpaperType");
if (savedWallpaper) {
  applyWallpaper(savedWallpaper, savedType || "image");
} else {
  applyWallpaper(null);
}

// Event upload
wallpaperInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const type = file.type;
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileUrl = event.target.result;
      applyWallpaper(fileUrl, type);
      localStorage.setItem("wallpaper", fileUrl);
      localStorage.setItem("wallpaperType", type);
    };
    reader.readAsDataURL(file);
  }
});

// Event reset
resetBtn.addEventListener("click", () => {
  localStorage.removeItem("wallpaper");
  localStorage.removeItem("wallpaperType");
  applyWallpaper(null);
});
