const themes = [
  {
    name: "neonPulse",
    btn: "#9B5EFF",
    btn_dark: "#4B2A7A",
    txt: "#EAE2FF",
    txt_hover: "#FFFFFF",
    txt_soft: "#C9B8F0",
    output_bg: "#0F0A18",
    nav: "#1A1425",
    box: "#1F1830",
    box_hover: "#271F3A",
    menu: "#171222",
    menu_box: "#1E1830",
    strip: "#161020",
    body: "#0A0710",
  },
  {
    name: "violetMist",
    btn: "#A78BFA",
    btn_dark: "#5D4B96",
    txt: "#F0E9FF",
    txt_hover: "#FFFFFF",
    txt_soft: "#CCC1E8",
    output_bg: "#161225",
    nav: "#1E1930",
    box: "#221D36",
    box_hover: "#29243E",
    menu: "#1A162C",
    menu_box: "#221D34",
    strip: "#1A1629",
    body: "#0F0C18",
  },
  {
    name: "emberShadow",
    btn: "#FF9E5E",
    btn_dark: "#B06438",
    txt: "#F7EFE8",
    txt_hover: "#FFFFFF",
    txt_soft: "#E6D1C2",
    output_bg: "#1C1612",
    nav: "#261E18",
    box: "#2B221C",
    box_hover: "#332A23",
    menu: "#211A15",
    menu_box: "#2A221C",
    strip: "#201914",
    body: "#130F0C",
  },
  {
    name: "rusticNight",
    btn: "#C7A17A",
    btn_dark: "#7A5A3A",
    txt: "#F3E9DD",
    txt_hover: "#FFFFFF",
    txt_soft: "#D9C7B8",
    output_bg: "#1B1612",
    nav: "#241F19",
    box: "#29231D",
    box_hover: "#302A23",
    menu: "#201B16",
    menu_box: "#29231E",
    strip: "#1E1915",
    body: "#120F0C",
  },
  {
    name: "midnightBlush",
    btn: "#D77FA1",
    btn_dark: "#8A4E63",
    txt: "#F5E8EC",
    txt_hover: "#FFFFFF",
    txt_soft: "#D9C3C9",
    output_bg: "#1C1417",
    nav: "#251A1D",
    box: "#2A1E22",
    box_hover: "#312428",
    menu: "#21171A",
    menu_box: "#2A1E21",
    strip: "#1F1619",
    body: "#120E10",
  },
  {
    name: "jadeMoon",
    btn: "#74C7A5",
    btn_dark: "#3F715F",
    txt: "#E3F4EE",
    txt_hover: "#FFFFFF",
    txt_soft: "#C4E3D8",
    output_bg: "#101A17",
    nav: "#182521",
    box: "#1C2B26",
    box_hover: "#23332E",
    menu: "#15201C",
    menu_box: "#1C2A26",
    strip: "#141E1B",
    body: "#0A120F",
  },
  {
    name: "forestNight",
    btn: "#6A8F7C",
    btn_dark: "#3D5C4F",
    txt: "#E6E6E6",
    txt_hover: "#ffffff",
    txt_soft: "#C8D9D2",
    output_bg: "#1E2624",
    nav: "#2A3432",
    box: "#2F3A38",
    box_hover: "#364240",
    menu: "#27312F",
    menu_box: "#313C3A",
    strip: "#25302E",
    body: "#181D1C",
  },
  {
    name: "obsidianBlue",
    btn: "#4DA3FF",
    btn_dark: "#1E4E81",
    txt: "#DDEBFF",
    txt_hover: "#FFFFFF",
    txt_soft: "#B4CCE6",
    output_bg: "#0E141F",
    nav: "#15202D",
    box: "#182533",
    box_hover: "#1F2E3F",
    menu: "#121C28",
    menu_box: "#1A2533",
    strip: "#111A25",
    body: "#090E14",
  },
  {
    name: "oceanDeep",
    btn: "#5FA8D3",
    btn_dark: "#2E5F7A",
    txt: "#E7EEF2",
    txt_hover: "#ffffff",
    txt_soft: "#C4D7E1",
    output_bg: "#121A22",
    nav: "#19242E",
    box: "#1E2B36",
    box_hover: "#253541",
    menu: "#162029",
    menu_box: "#1C2934",
    strip: "#152028",
    body: "#0D141A",
  },
  { name: "dynamicCycle", dynamic: true },
];

const wrapper = document.querySelector(".wrapper-theme");
const preview = document.querySelector(".theme-preview");
let cycleInterval = null;
let autoMode = false;

// Generate theme boxes
if (wrapper) {
  themes.forEach((theme) => {
    const figure = document.createElement("figure");
    figure.classList.add("theme-color");

    if (!theme.dynamic) {
      figure.dataset.colors = JSON.stringify(theme);
      figure.style.borderColor = theme.strip;
      const main = document.createElement("main");
      const div1 = document.createElement("div");
      const div2 = document.createElement("div");
      div1.style.background = theme.btn;
      div2.style.background = theme.body;
      main.appendChild(div1);
      main.appendChild(div2);
      figure.appendChild(main);
    } else {
      figure.dataset.dynamic = "true";
      figure.classList.add("dynamic-theme-box");

      // Bungkus ikon dalam div
      figure.innerHTML = `
        <div class="auto-wrapper">
          <i class='bx bx-sync auto-icon'></i>
        </div>
      `;
      figure.style.borderColor = "#666";
    }
    wrapper.appendChild(figure);
  });
}

const themeOptions = document.querySelectorAll(".theme-color");

// Apply theme
function applyTheme(theme) {
  if (theme.dynamic) return; // jangan trigger dynamic manual
  if (autoMode) stopDynamicTheme();

  const set = (v, x) => document.documentElement.style.setProperty(v, x);

  set("--btn-color", theme.btn);
  set("--btn-dark", theme.btn_dark);
  set("--txt-color", theme.txt);
  set("--txt-hover", theme.txt_hover);
  set("--txt-soft", theme.txt_soft);
  set("--output-bg", theme.output_bg);
  set("--nav-color", theme.nav);
  set("--box-color", theme.box);
  set("--box-hover", theme.box_hover);
  set("--menu-color", theme.menu);
  set("--menu-box", theme.menu_box);
  set("--strip-color", theme.strip);
  set("--body-bg", theme.body);

  if (preview) {
    preview.innerHTML = `
      <main class="preview-theme">
        <div style="background:${theme.txt}" class="pv"></div>
        <div style="background:${theme.btn}" class="pv"></div>
        <div style="background:${theme.btn_dark}" class="pv"></div>
        <div style="background:${theme.box}" class="pv"></div>
        <div style="background:${theme.menu}" class="pv"></div>
        <div style="background:${theme.strip}" class="pv"></div>
        <div style="background:${theme.body}" class="pv"></div>
      </main>`;
  }
}

// Klik tema
themeOptions.forEach((option) => {
  option.addEventListener("click", () => {
    themeOptions.forEach((o) => o.classList.remove("active"));
    option.classList.add("active");

    if (option.dataset.dynamic === "true") {
      // Toggle auto
      if (!autoMode) startDynamicTheme(option);
      else stopDynamicTheme(option);
      return;
    }

    // Tema statis
    const theme = JSON.parse(option.dataset.colors);
    applyTheme(theme);
    localStorage.setItem("theme-v2", JSON.stringify(theme));
    stopDynamicTheme(); // pastikan auto mati → ikon berhenti
  });
});

// Start auto
function startDynamicTheme(option) {
  stopDynamicTheme(); // pastikan tidak ada interval lama
  autoMode = true;

  const staticThemes = themes.filter((t) => !t.dynamic);
  let i = 0;

  applyTheme(staticThemes[i]);

  cycleInterval = setInterval(() => {
    i = (i + 1) % staticThemes.length;
    applyTheme(staticThemes[i]);
  }, 5000);

  // Tambahkan animasi ikon
  if (option) {
    const autoIcon = option.querySelector(".auto-icon");
    if (autoIcon) autoIcon.classList.add("rotate");
  }

  localStorage.setItem("theme-auto", "on");
}

// Stop auto
function stopDynamicTheme(option) {
  clearInterval(cycleInterval);
  autoMode = false;

  // Hapus animasi ikon
  const autoIcon = option
    ? option.querySelector(".auto-icon")
    : document.querySelector(".auto-icon");
  if (autoIcon) autoIcon.classList.remove("rotate");

  localStorage.setItem("theme-auto", "off");
}

// Load saved theme & auto
const saved = localStorage.getItem("theme-v2");
const savedAuto = localStorage.getItem("theme-auto");

if (savedAuto === "on") {
  startDynamicTheme();
  themeOptions[themeOptions.length - 1].classList.add("active");
} else if (saved) {
  const theme = JSON.parse(saved);
  applyTheme(theme);
  themeOptions.forEach((option) => {
    if (option.dataset.colors) {
      const data = JSON.parse(option.dataset.colors);
      if (JSON.stringify(data) === saved) option.classList.add("active");
    }
  });
} else {
  applyTheme(themes[0]);
  themeOptions[0]?.classList.add("active");
}

// Font Size
const fontWrapper = document.querySelector(".wrapper-font");
const fontSizes = ["14px", "16px", "18px", "20px", "22px", "25px"];
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
    applyFontSize(btn.dataset.size);
    localStorage.setItem("font-size", btn.dataset.size);
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
  fontButtons[1]?.classList.add("active");
}
