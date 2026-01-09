document.addEventListener("DOMContentLoaded", () => {
  // ===================== ELEMENT SELECTOR =====================
  const buttons = document.querySelectorAll(".button");
  const operationEl = document.getElementById("operation");
  const resultEl = document.getElementById("result");
  const historyEl = document.getElementById("history");
  const navIcons = document.querySelectorAll(".nav .icon");
  const menus = document.querySelectorAll(".menu");

  // Currency elements
  const currencyFrom = document.getElementById("currency-from");
  const currencyTo = document.getElementById("currency-to");
  const reverseBtn = document.getElementById("reverse-currency");

  // ===================== VARIABLE GLOBAL =====================
  let operation = "";
  let isFinal = false;
  let lastValidResult = "0";
  let lastResult = null;
  let history = [];
  let isCurrencyMode = false;

  // Flag chatbot (aktif = input dinonaktifkan)
  window.chatbotActive = false;

  // ===================== HELPER FUNCTION =====================
  const isOperator = (ch) => ["+", "-", "x", ":", "%"].includes(ch);

  const formatCurrency = (value, code) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);

  // ===================== EVALUASI EKSPRESI =====================
  function evaluateExpression(expr) {
    try {
      expr = expr
        .replace(/[x×]/g, "*")
        .replace(/[÷:]/g, "/")
        .replace(/π/g, "Math.PI")
        .replace(/%/g, "/100");

      // ✅ Tangani akar kuadrat (√)
      // Ubah "√9" → "Math.sqrt(9)"
      expr = expr.replace(/√(\d+(\.\d+)?)/g, "Math.sqrt($1)");
      // Ubah "√(9+16)" → "Math.sqrt(9+16)"
      expr = expr.replace(/√\(([^()]+)\)/g, "Math.sqrt($1)");

      // ✅ Tangani fungsi trigonometri tanpa/tanpa tanda kurung
      expr = expr.replace(/sin\(/g, "Math.sin(");
      expr = expr.replace(/cos\(/g, "Math.cos(");
      expr = expr.replace(/tan\(/g, "Math.tan(");

      // Ubah "sin30" → "Math.sin(30)"
      expr = expr.replace(/sin(\d+(\.\d+)?)/g, "Math.sin($1)");
      expr = expr.replace(/cos(\d+(\.\d+)?)/g, "Math.cos($1)");
      expr = expr.replace(/tan(\d+(\.\d+)?)/g, "Math.tan($1)");

      // ✅ Logaritma
      expr = expr.replace(/log\(/g, "Math.log10(");
      expr = expr.replace(/ln\(/g, "Math.log(");

      // ✅ Kuadrat
      expr = expr.replace(/(\d+|\([^()]+\))²/g, "Math.pow($1,2)");
      expr = expr.replace(/x2/g, "**2");

      // ✅ Evaluasi hasil
      let result = eval(expr);
      if (!isFinite(result)) throw "Math Error";

      // ✅ Hasil dibulatkan 8 digit
      return parseFloat(result.toFixed(8));
    } catch (e) {
      return "tak terdefinisi";
    }
  }

  // ===================== UPDATE PREVIEW =====================
  function updatePreview() {
    if (!operation.trim()) {
      resultEl.textContent = "0";
      return;
    }
    try {
      const preview = evaluateExpression(operation);
      resultEl.textContent = isCurrencyMode
        ? convertCurrency(preview)
        : preview;
      lastValidResult = preview;
    } catch {
      resultEl.textContent = lastValidResult;
    }
  }

  // ===================== RENDER HISTORY =====================
  function renderHistory() {
    historyEl.innerHTML = "";

    if (!history.length) {
      historyEl.innerHTML = `<div class="alert"><p>Belum ada riwayat perhitungan</p></div>`;
      return;
    }

    const clearAllBtn = document.createElement("button");
    clearAllBtn.textContent = "Hapus Semua";
    clearAllBtn.className = "delete-all";
    clearAllBtn.addEventListener("click", () => {
      history = [];
      renderHistory();
    });
    historyEl.appendChild(clearAllBtn);

    const ul = document.createElement("ul");
    history.forEach((item, index) => {
      const li = document.createElement("li");
      const text = document.createElement("span");

      text.textContent = `${item.operation} = ${item.result}`;
      text.addEventListener("click", () => {
        operation = item.operation;
        operationEl.textContent = operation;
        resultEl.textContent = item.result;
        resultEl.classList.add("final");
        operationEl.classList.add("hidden");
        isFinal = true;
      });

      const delBtn = document.createElement("button");
      delBtn.innerHTML = "<i class='bx bx-x'></i>";
      delBtn.addEventListener("click", () => {
        history.splice(index, 1);
        renderHistory();
      });

      li.appendChild(text);
      li.appendChild(delBtn);
      ul.appendChild(li);
    });

    historyEl.appendChild(ul);
  }

  // ===================== INPUT HANDLER =====================
  function handleInput({ value, action }) {
    const lastChar = operation.slice(-1);

    // Clear
    if (action === "clear") {
      operation = "";
      operationEl.textContent = "0";
      resultEl.textContent = "0";
      isFinal = false;
      return;
    }

    // Delete
    if (action === "delete") {
      operation = operation.slice(0, -1);
      operationEl.textContent = operation || "0";
      updatePreview();
      return;
    }

    // Hitung (=)
    if (action === "calculate") {
      try {
        const finalResult = evaluateExpression(operation);
        lastResult = finalResult;
        isFinal = true;

        operationEl.classList.add("hidden");
        resultEl.classList.add("final");

        resultEl.textContent = isCurrencyMode
          ? convertCurrency(finalResult)
          : finalResult;

        history.unshift({
          operation,
          result: isCurrencyMode ? convertCurrency(finalResult) : finalResult,
        });

        if (history.length > 10) history.pop();
        renderHistory();
      } catch {
        resultEl.textContent = lastValidResult;
      }
      return;
    }

    // Input biasa
    if (value) {
      if (isFinal) {
        // Lanjut dari hasil terakhir jika tekan operator
        if (isOperator(value)) {
          operation = String(lastResult || 0) + value;
        } else {
          // Mulai baru jika tekan angka
          operation = value;
        }

        isFinal = false;
        resultEl.classList.remove("final");
        operationEl.classList.remove("hidden");
        operationEl.textContent = operation;
        updatePreview();
        return;
      }

      // Tangani input kompleks
      if (isOperator(value) && isOperator(lastChar)) {
        operation = operation.slice(0, -1) + value;
      } else if (["sin", "cos", "tan"].includes(value)) {
        operation += /\d$/.test(operation) ? `*${value}` : value;
      } else if (value === "()") {
        const open = (operation.match(/\(/g) || []).length;
        const close = (operation.match(/\)/g) || []).length;
        operation += open > close ? ")" : "(";
      } else if (value === "√") {
        operation += /\d$/.test(operation) ? "*√" : "√";
      } else if (value === "x2") {
        if (!/x2$/.test(operation)) operation += "x2";
      } else {
        const isNeg = value === "-" && isOperator(lastChar);
        operation += isNeg ? "(-" : value;
      }

      // Bersihkan operator ganda
      operation = operation.replace(/([+\-x:%]){2,}/g, (m) => m.slice(-1));
      operation = operation.replace(/\(\-([0-9.]+)(?!\))/g, "(-$1)");

      operationEl.textContent = operation;
      updatePreview();
    }
  }

  // ===================== EVENT BUTTON =====================
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (window.chatbotActive) return;

      handleInput({
        value: btn.dataset.value,
        action: btn.dataset.action,
      });

      btn.classList.add("active");
      setTimeout(() => btn.classList.remove("active"), 150);
    });
  });

  // ===================== KEYBOARD SHORTCUT =====================
  document.addEventListener("keydown", (e) => {
    if (window.chatbotActive) return;

    // Alt + (H/M/S/A) → Navigasi menu
    if (e.altKey) {
      e.preventDefault();
      const key = e.key.toLowerCase();
      if (key === "h") toggleMenu("historyMenu");
      else if (key === "m") toggleMenu("moneyMenu");
      else if (key === "s") toggleMenu("settingMenu");
      else if (key === "a") toggleMenu("aboutMenu");
      return;
    }

    // Cegah zoom (Ctrl + ... di Windows)
    if (!/Mac|iPod|iPhone|iPad/.test(navigator.platform)) {
      if (e.ctrlKey && ["-", "+", "=", "0"].includes(e.key)) return;
    }

    const keyMap = {
      "+": { value: "+", action: null },
      "-": { value: "-", action: null },
      "*": { value: "x", action: null },
      x: { value: "x", action: null },
      "/": { value: ":", action: null },
      ":": { value: ":", action: null },
      ".": { value: ".", action: null },
      ",": { value: ".", action: null },
      "(": { value: "(", action: null },
      ")": { value: ")", action: null },
      Enter: { value: null, action: "calculate" },
      Backspace: { value: null, action: "delete" },
      Delete: { value: null, action: "clear" },
      c: { value: null, action: "clear" },
      C: { value: null, action: "clear" },
    };

    let value = null;
    let action = null;

    if (!isNaN(e.key) && e.key !== " ") value = e.key;
    else if (keyMap[e.key]) {
      value = keyMap[e.key].value;
      action = keyMap[e.key].action;
    }

    if (value !== null || action !== null) {
      e.preventDefault();
      handleInput({ value, action });

      const targetBtn = document.querySelector(
        value
          ? `.button[data-value="${value}"]`
          : action
          ? `.button[data-action="${action}"]`
          : null
      );

      if (targetBtn) {
        targetBtn.classList.add("active");
        setTimeout(() => targetBtn.classList.remove("active"), 150);
      }
    }
  });

  // ===================== NAVIGASI MENU =====================
  function toggleMenu(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden");
  }

  navIcons.forEach((icon) => {
    if (icon.id === "newui") return;

    icon.addEventListener("click", () => {
      const targetId = icon.getAttribute("data-target");
      const targetMenu = document.getElementById(targetId);
      const isActive = icon.classList.contains("active");
      const mainMenu = document.querySelector(".main-menu");

      navIcons.forEach((i) => i.classList.remove("active"));
      menus.forEach((m) => m.classList.remove("show"));

      if (!isActive) {
        icon.classList.add("active");
        if (targetMenu) {
          targetMenu.style.display = "flex";
          setTimeout(() => targetMenu.classList.add("show"), 10);
        }
      }

      if (Array.from(navIcons).some((i) => i.classList.contains("active"))) {
        mainMenu.classList.add("active");
      } else {
        mainMenu.classList.remove("active");
      }
    });
  });

  // ===================== KONVERSI MATA UANG =====================
  const rates = {
    IDR: { USD: 0.000065, EUR: 0.000061, IDR: 1 },
    USD: { IDR: 15400, EUR: 0.93, USD: 1 },
    EUR: { IDR: 16500, USD: 1.07, EUR: 1 },
  };

  function convertCurrency(value) {
    const from = currencyFrom.value;
    const to = currencyTo.value;
    if (!from || !to) return value;

    const rate = rates[from][to];
    const converted = value * rate;

    return `${formatCurrency(value, from)} = ${formatCurrency(converted, to)}`;
  }

  function checkCurrencyMode() {
    isCurrencyMode = !!(currencyFrom.value && currencyTo.value);
    updatePreview();
  }

  if (currencyFrom && currencyTo) {
    currencyFrom.addEventListener("change", checkCurrencyMode);
    currencyTo.addEventListener("change", checkCurrencyMode);
  }

  if (reverseBtn) {
    reverseBtn.addEventListener("click", () => {
      const temp = currencyFrom.value;
      currencyFrom.value = currencyTo.value;
      currencyTo.value = temp;
      checkCurrencyMode();
    });
  }

  // ===================== INIT =====================
  renderHistory();
});
