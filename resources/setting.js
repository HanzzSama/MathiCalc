const themes = [
  {
    primary: "#a23333",
    secondary: "#802121",
    accent: "#c39797",
    background: "#1e1e1e",
    text: "#f5f5f5",
  }, // default merah gelap
  {
    primary: "#3f4a72",
    secondary: "#2f3658",
    accent: "#5dade2",
    background: "#1c1f2a",
    text: "#ecf0f1",
  }, // dark blue
  {
    primary: "#5c4438",
    secondary: "#3e2f27",
    accent: "#d7a86e",
    background: "#2b211c",
    text: "#fdfaf6",
  }, // dark brown
  {
    primary: "#3c5c4f",
    secondary: "#2e463b",
    accent: "#58d68d",
    background: "#1f2f27",
    text: "#eafaf1",
  }, // dark green
  {
    primary: "#5a4b6e",
    secondary: "#413555",
    accent: "#af7ac5",
    background: "#241f2c",
    text: "#f4ecf7",
  }, // dark purple
];

const wrapper = document.querySelector(".wrapper-theme");
const preview = document.querySelector(".theme-preview");

// ===== Generate HTML pilihan tema =====
themes.forEach((theme) => {
  const figure = document.createElement("figure");
  figure.classList.add("theme-color");
  figure.dataset.colors = JSON.stringify(theme);
  figure.style.borderColor = theme.accent;

  const main = document.createElement("main");

  const div1 = document.createElement("div");
  div1.style.background = theme.primary;

  const div2 = document.createElement("div");
  div2.style.background = theme.secondary;

  main.appendChild(div1);
  main.appendChild(div2);

  figure.appendChild(main);
  wrapper.appendChild(figure);
});

const themeOptions = document.querySelectorAll(".theme-color");

// ===== Terapkan Tema =====
function applyTheme(theme) {
  document.documentElement.style.setProperty("--primary-color", theme.primary);
  document.documentElement.style.setProperty(
    "--secondary-color",
    theme.secondary
  );
  document.documentElement.style.setProperty("--accent-color", theme.accent);
  document.documentElement.style.setProperty(
    "--background-color",
    theme.background
  );
  document.documentElement.style.setProperty("--text-color", theme.text);

  // update preview 3 warna
  if (preview) {
    preview.innerHTML = `
    <main class="preview-theme">
    <div style="background:${theme.text};width:30px;height:30px;border-radius:6px"></div>
    <div style="background:${theme.accent};width:30px;height:30px;border-radius:6px"></div>
    <div style="background:${theme.primary};width:30px;height:30px;border-radius:6px"></div>
    <div style="background:${theme.secondary};width:30px;height:30px;border-radius:6px"></div>
    <div style="background:${theme.background};width:30px;height:30px;border-radius:6px"></div>
    </main>
    `;
  }
}

// ===== Event Pilih Tema =====
themeOptions.forEach((option) => {
  option.addEventListener("click", () => {
    themeOptions.forEach((o) => o.classList.remove("active"));
    option.classList.add("active");

    const theme = JSON.parse(option.dataset.colors);
    applyTheme(theme);

    localStorage.setItem("theme", JSON.stringify(theme));
  });
});

// ===== Load Theme Tersimpan / Default =====
const savedTheme = localStorage.getItem("theme");

if (savedTheme) {
  const theme = JSON.parse(savedTheme);
  applyTheme(theme);

  themeOptions.forEach((option) => {
    const data = JSON.parse(option.dataset.colors);
    if (
      data.primary === theme.primary &&
      data.secondary === theme.secondary &&
      data.accent === theme.accent
    ) {
      option.classList.add("active");
    }
  });
} else {
  const theme = themes[0];
  themeOptions[0].classList.add("active");
  applyTheme(theme);
}

const fontWrapper = document.querySelector(".wrapper-font");
const fontSizes = ["14px", "16px", "18px", "20px", "22px"];
if (fontWrapper) {
  fontSizes.forEach((size) => {
    const btn = document.createElement("button");
    btn.className = "font-size-option";
    btn.textContent = size;
    btn.dataset.size = size;
    fontWrapper.appendChild(btn);
  });
}
const fontButtons = document.querySelectorAll(".font-size-option");
function applyFontSize(size) {
  document.documentElement.style.setProperty("--font-size", size);
}
fontButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    fontButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const size = btn.dataset.size;
    applyFontSize(size);
    localStorage.setItem("font-size", size);
  });
});

const savedFont = localStorage.getItem("font-size");
if (savedFont) {
  applyFontSize(savedFont);
  fontButtons.forEach((btn) => {
    if (btn.dataset.size === savedFont) btn.classList.add("active");
  });
} else {
  applyFontSize("16px");
  if (fontButtons[1]) fontButtons[1].classList.add("active");
}
