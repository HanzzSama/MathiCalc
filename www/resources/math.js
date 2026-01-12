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
  const isOperator = (ch) => ["+", "-", "x", ":", "^"].includes(ch);

  const formatCurrency = (value, code) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);

  const endsWithOperator = (expr) => /[+\-x:%÷:]$/.test(expr);

  const isIncompleteExpression = (expr) => {
    if (!expr) return true;

    // Kurung tidak seimbang
    const open = (expr.match(/\(/g) || []).length;
    const close = (expr.match(/\)/g) || []).length;
    if (open > close) return true;

    // Diakhiri operator
    if (endsWithOperator(expr)) {
      // kecuali pola ":0" atau "/0"
      if (/[:÷]0$/.test(expr)) return false;
      return true;
    }

    // Akar / fungsi belum diisi
    if (/√$/.test(expr)) return true;
    if (/(sin|cos|tan|log|ln)$/.test(expr)) return true;

    return false;
  };

  const supers = {
    0: "⁰",
    1: "¹",
    2: "²",
    3: "³",
    4: "⁴",
    5: "⁵",
    6: "⁶",
    7: "⁷",
    8: "⁸",
    9: "⁹",
  };

  function toSuper(n) {
    return n
      .toString()
      .split("")
      .map((d) => supers[d] || d)
      .join("");
  }

  function renderSuperscript(expr) {
    return expr.replace(
      /(\d+|\([^()]+\))\^(\d+)/g,
      (_, base, power) => `${base}${toSuper(power)}`
    );
  }

  function getLastToken(expr) {
    const match = expr.match(
      /(sin|cos|tan|log|ln|√|\^|\(|\)|[+\-x:%]|\d+\.?\d*)$/
    );
    return match ? match[0] : "";
  }

  function isFunction(token) {
    return ["sin", "cos", "tan", "log", "ln", "√"].includes(token);
  }

  const FUNCTIONS = ["sin", "cos", "tan", "log", "ln"];
  const OPERATORS = ["+", "-", "x", ":", "^"];
  const POSTFIX = ["%"];

  function isNumber(t) {
    return /^\d+(\.\d+)?$/.test(t);
  }

  function tokenize(expr) {
    return expr.match(/(sin|cos|tan|log|ln|√|\d+\.\d+|\d+|[()+\-x:%^])/g) || [];
  }

  function sanitizeExpression(expr) {
    const tokens = tokenize(expr);
    const clean = [];

    let openParen = 0;
    let expectOperand = true;

    for (const t of tokens) {
      // 🔢 ANGKA
      if (isNumber(t)) {
        if (!expectOperand) clean.push("x");
        clean.push(t);
        expectOperand = false;
        continue;
      }

      // √ (PREFIX)
      if (t === "√") {
        if (expectOperand) {
          clean.push("√");
          expectOperand = true;
        }
        continue;
      }

      // FUNGSI
      if (FUNCTIONS.includes(t)) {
        if (expectOperand) {
          clean.push(t, "(");
          openParen++;
          expectOperand = true;
        }
        continue;
      }

      // (
      if (t === "(") {
        if (expectOperand) {
          clean.push("(");
          openParen++;
        }
        continue;
      }

      // )
      if (t === ")") {
        if (!expectOperand && openParen > 0) {
          clean.push(")");
          openParen--;
          expectOperand = false;
        }
        continue;
      }

      // % (POSTFIX ONLY)
      if (t === "%") {
        if (!expectOperand && clean.at(-1)?.match(/\d|\)/)) {
          clean.push("%");
          expectOperand = false;
        }
        continue;
      }

      // OPERATOR INFIX
      if (OPERATORS.includes(t)) {
        if (!expectOperand) {
          clean.push(t);
          expectOperand = true;
        }
        continue;
      }
    }

    // Tutup kurung sisa
    while (openParen-- > 0) clean.push(")");
    if (!clean.length) return "0";

    const result = clean
      .join("")
      .replace(/([+\-x:^])$/, "")
      .replace(/√$/, "");

    return result || "0";
  }

  // ===================== EVALUASI EKSPRESI =====================
  function evaluateExpression(expr) {
    try {
      expr = expr
        .replace(/[x×]/g, "*")
        .replace(/[÷:]/g, "/")
        .replace(/π/g, "Math.PI")
        .replace(/%/g, "/100");

      // 🔥 DETEKSI PEMBAGIAN NOL (REAL-TIME FRIENDLY)
      // contoh: 4/0 , (8+2)/0 , 10/(5-5)
      if (/\/\s*0(\D|$)/.test(expr)) {
        return "Tak Terdefinisi";
      }

      expr = expr.replace(/√(\d+(\.\d+)?)/g, "Math.sqrt($1)");
      expr = expr.replace(/√\(([^()]+)\)/g, "Math.sqrt($1)");

      expr = expr.replace(/sin\(/g, "Math.sin(");
      expr = expr.replace(/cos\(/g, "Math.cos(");
      expr = expr.replace(/tan\(/g, "Math.tan(");

      expr = expr.replace(/sin(\d+(\.\d+)?)/g, "Math.sin($1)");
      expr = expr.replace(/cos(\d+(\.\d+)?)/g, "Math.cos($1)");
      expr = expr.replace(/tan(\d+(\.\d+)?)/g, "Math.tan($1)");

      expr = expr.replace(/log\(/g, "Math.log10(");
      expr = expr.replace(/ln\(/g, "Math.log(");

      expr = expr.replace(/(\d+|\([^()]+\))²/g, "Math.pow($1,2)");
      expr = expr.replace(/x2/g, "**2");
      expr = expr.replace(
        /(\([^()]+\)|\d+(\.\d+)?)[\s]*\^[\s]*(\([^()]+\)|\d+(\.\d+)?)/g,
        "Math.pow($1,$3)"
      );

      const result = eval(expr);

      if (result === Infinity || result === -Infinity || isNaN(result)) {
        return "Tak Terdefinisi";
      }

      return parseFloat(result.toFixed(8));
    } catch {
      return "Error";
    }
  }

  // ===================== UPDATE PREVIEW =====================
  function updatePreview() {
    if (!operation.trim()) {
      resultEl.textContent = "0";
      return;
    }

    const safeExpr = sanitizeExpression(operation);

    if (isIncompleteExpression(safeExpr)) {
      resultEl.textContent = "...";
      return;
    }

    const preview = evaluateExpression(safeExpr);

    if (preview === "Tak Terdefinisi" || preview === "Error") {
      resultEl.textContent = preview;
      return;
    }

    resultEl.textContent = preview;
    lastValidResult = preview;
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
        operation = sanitizeExpression(item.operation);
        operationEl.innerHTML = renderSuperscript(operation);
        resultEl.textContent = item.result;
        resultEl.classList.add("final");
        operationEl.classList.add("hidden");
        updatePreview();
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
      lastResult = null;
      lastValidResult = "0";

      resultEl.classList.remove("final");
      operationEl.classList.remove("hidden");
      return;
    }

    // Delete
    if (action === "delete") {
      operation = operation.slice(0, -1);
      operationEl.innerHTML = renderSuperscript(operation || "0");
      updatePreview();
      return;
    }

    // Hitung (=)
    if (action === "calculate") {
      const safeExpr = sanitizeExpression(operation);
      const finalResult = evaluateExpression(safeExpr);

      lastResult = finalResult;
      isFinal = true;

      operationEl.classList.add("hidden");
      resultEl.classList.add("final");

      resultEl.textContent = finalResult;

      history.unshift({
        operation: safeExpr,
        result: finalResult,
      });

      if (history.length > 10) history.pop();
      renderHistory();
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
        operationEl.innerHTML = renderSuperscript(operation);
        updatePreview();
        return;
      }

      if (value === "^") {
        const lastToken = getLastToken(operation);
        if (!lastToken || isOperator(lastToken) || lastToken === "(") return;
      }

      // Tangani input kompleks
      if (isOperator(value)) {
        const lastToken = getLastToken(operation);
        if (isOperator(lastToken)) {
          operation = operation.slice(0, -lastToken.length) + value;
        } else {
          operation += value;
        }
      } else if (["sin", "cos", "tan", "log", "ln", "√"].includes(value)) {
        const lastToken = getLastToken(operation);
        if (isFunction(lastToken)) return;
        if (/\d|\)$/.test(lastToken)) {
          operation += "*" + value;
        } else {
          operation += value;
        }
      } else if (value === "()") {
        const lastToken = getLastToken(operation);
        const open = (operation.match(/\(/g) || []).length;
        const close = (operation.match(/\)/g) || []).length;

        const canOpen =
          !operation || // awal
          isOperator(lastToken) || // setelah operator
          isFunction(lastToken); // setelah fungsi

        const canClose =
          open > close && // masih ada yg dibuka
          !isOperator(lastToken) && // bukan setelah operator
          lastToken !== "(" && // bukan setelah (
          lastToken !== "√"; // bukan setelah √

        if (canOpen) {
          operation += "(";
        } else if (canClose) {
          operation += ")";
        }
      } else if (value === "√") {
        const lastToken = getLastToken(operation);
        if (lastToken === "√") return;

        if (/\d|\)$/.test(lastToken)) {
          operation += "*√";
        } else {
          operation += "√";
        }
      } else if (value === "x2") {
        if (!/x2$/.test(operation)) operation += "x2";
      } else {
        const isNeg = value === "-" && isOperator(lastChar);
        operation += isNeg ? "(-" : value;
      }

      // Bersihkan operator ganda
      operation = operation.replace(/([+\-x:^]){2,}/g, (m) => m.slice(-1));
      operation = operation.replace(/\(\-([0-9.]+)(?!\))/g, "(-$1)");

      operationEl.innerHTML = renderSuperscript(operation);
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
      "^": { value: "^", action: null },
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
