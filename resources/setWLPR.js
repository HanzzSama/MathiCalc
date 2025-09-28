const wallpaperInput = document.getElementById("wallpaperInput");
const resetBtn = document.getElementById("resetWallpaper");
const mainOutput = document.querySelector(".main-output");
const previewContainer = document.querySelector(".preview-img");

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

// Update preview thumbnail
function updatePreview(url) {
  previewContainer.innerHTML = ""; // kosongkan dulu
  if (url) {
    const wrapper = document.createElement("div");
    const img = document.createElement("img");
    img.src = url;
    img.alt = "Wallpaper Preview";
    wrapper.appendChild(img);
    previewContainer.appendChild(wrapper);
  }
}

// Terapkan wallpaper ke main-output
function applyWallpaper(url) {
  if (url) {
    mainOutput.style.backgroundImage = `url(${url})`;
    mainOutput.style.backgroundColor = "transparent";
    mainOutput.style.backgroundPosition = "50% 50%";
    mainOutput.style.backgroundSize = "cover";
    addCover();
    updatePreview(url);
  } else {
    mainOutput.style.backgroundImage = "none";
    mainOutput.style.background = "var(--dark-mode-item)";
    removeCover();
    updatePreview(null);
  }
}

// Cek localStorage untuk wallpaper tersimpan
const savedWallpaper = localStorage.getItem("wallpaper");
if (savedWallpaper) {
  applyWallpaper(savedWallpaper);
} else {
  applyWallpaper(null);
}

// Event upload wallpaper
wallpaperInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const imageUrl = event.target.result;
      applyWallpaper(imageUrl);
      localStorage.setItem("wallpaper", imageUrl);
    };
    reader.readAsDataURL(file);
  }
});

// Event reset wallpaper
resetBtn.addEventListener("click", () => {
  localStorage.removeItem("wallpaper");
  applyWallpaper(null);
});
