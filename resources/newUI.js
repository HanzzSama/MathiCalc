const toggleUIBtn = document.getElementById("toggleNewUI");
const txtUI = document.getElementById("uitxt");
const newUIIcon = document.getElementById("newui");
const slide = document.getElementById("slide");
const pageButton = document.getElementById("main-button");
const pageOutput = document.getElementById("main-output");
const newUISection = document.getElementById("newUISection");

let showNewUIIcon = false; // default icon newui disembunyikan
let chatbotActive = false; // default mode normal

// --- global biar file lain bisa pakai ---
window.chatbotActive = false;

// tombol toggle di menu setting
toggleUIBtn.addEventListener("click", () => {
  showNewUIIcon = !showNewUIIcon;

  if (showNewUIIcon) {
    newUIIcon.style.opacity = "1";
    newUIIcon.style.height = "100%";
    newUIIcon.style.borderRadius = "8px";
    newUIIcon.classList.add("show");
    newUIIcon.style.transform = "scale(1)";
    txtUI.textContent = "Disable MathiCalc Chat";
  } else {
    newUIIcon.style.opacity = "0";
    newUIIcon.style.height = "0";
    newUIIcon.classList.remove("show");
    newUIIcon.style.borderRadius = "20px";
    newUIIcon.style.transform = "scale(.8)";
    txtUI.textContent = "Enable MathiCalc Chat";

    // kalau tombol disembunyikan, otomatis kembali ke mode normal
    chatbotActive = false;
    window.chatbotActive = false;
    newUISection.classList.remove("open");
    slide.style.overflowX = "auto";
    slide.style.width = "";
    pageButton.classList.remove("active");
    pageOutput.classList.remove("active");
  }
});

// klik icon newui di navbar → toggle chatbot
newUIIcon.addEventListener("click", () => {
  chatbotActive = !chatbotActive;
  window.chatbotActive = chatbotActive;

  newUISection.classList.toggle("open", chatbotActive);

  if (chatbotActive) {
    slide.style.overflowX = "hidden";
    slide.style.width = "0";
    pageButton.classList.add("active");
    pageOutput.classList.add("active");
  } else {
    slide.style.overflowX = "auto";
    slide.style.width = "";
    pageButton.classList.remove("active");
    pageOutput.classList.remove("active");
  }
});

// saat awal load → default normal mode
window.addEventListener("DOMContentLoaded", () => {
  newUIIcon.style.opacity = "0";
  newUIIcon.style.height = "0";
  newUIIcon.classList.remove("show");
  txtUI.textContent = "Enable MathiCalc Chat";

  chatbotActive = false;
  window.chatbotActive = false;
  newUISection.classList.remove("open");
  slide.style.overflowX = "auto";
  slide.style.width = "";
  pageButton.classList.remove("active");
  pageOutput.classList.remove("active");
});
