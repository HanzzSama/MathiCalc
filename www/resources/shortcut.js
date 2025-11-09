const display = document.getElementById("calc-display"); // pastikan ada <input id="calc-display">

// ambil semua tombol kalkulator
const buttons = document.querySelectorAll(".button");

buttons.forEach((btn) => {
  const isMobile = window.matchMedia("(max-width: 650px)").matches;

  const removeActive = () => {
    btn.classList.remove("active");
    // 🔄 Paksa browser render ulang supaya efek hilang
    void btn.offsetWidth;
  };

  const addActive = () => {
    btn.classList.add("active");

    if (isMobile) {
      // 🕒 Hapus otomatis 300ms agar efek tak nyangkut
      clearTimeout(btn._activeTimeout);
      btn._activeTimeout = setTimeout(removeActive, 2000);
    }
  };

  // Klik logika
  btn.addEventListener("click", () => {
    const value = btn.dataset.value;
    const action = btn.dataset.action;
    if (value) insertValue(value);
    else if (action) handleAction(action);
  });

  // === Desktop mouse ===
  btn.addEventListener("mousedown", addActive);
  btn.addEventListener("mouseup", removeActive);
  btn.addEventListener("mouseleave", removeActive);

  // === Mobile ===
  btn.addEventListener("touchstart", (e) => {
    e.preventDefault();
    addActive();
  });

  btn.addEventListener("touchend", () => {
    // tetap hapus paksa di akhir
    removeActive();
  });

  btn.addEventListener("touchcancel", removeActive);
});

// fungsi untuk input angka/operator
function insertValue(val) {
  if (val === "x") val = "*";
  if (val === ":") val = "/";
  display.value += val;
}

// fungsi untuk action (clear, delete, calculate)
function handleAction(action) {
  if (action === "clear") {
    display.value = "";
  } else if (action === "delete") {
    display.value = display.value.slice(0, -1);
  } else if (action === "calculate") {
    try {
      display.value = eval(display.value);
    } catch {
      display.value = "Error";
    }
  }
}

// ====================
// Keyboard Shortcut
// ====================
function isDesktop() {
  return window.innerWidth > 768;
}

document.addEventListener("keydown", (e) => {
  if (!isDesktop()) return;

  const key = e.key;

  if (!isNaN(key)) insertValue(key); // angka
  if (key === "+") insertValue("+");
  if (key === "-") insertValue("-");
  if (key.toLowerCase() === "x") insertValue("*");
  if (key === ":") insertValue("/");
  if (key === ",") insertValue("."); // koma jadi titik

  if (key.toLowerCase() === "c") handleAction("clear"); // clear
  if (key === "Backspace") handleAction("delete"); // hapus 1
  if (key === "Enter") handleAction("calculate"); // hitung
});
