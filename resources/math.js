document.addEventListener("DOMContentLoaded", () => {
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

  let operation = "";
  let isFinal = false;
  let lastValidResult = "0";
  let history = [];
  let insideNegBracket = false;
  let isCurrencyMode = false;

  // ==== Flag untuk deteksi chatbot ====
  window.chatbotActive = false; // default: normal mode

  // ===== Helper =====
  function isOperator(ch) {
    return ["+", "-", "x", ":"].includes(ch);
  }

  function formatCurrency(value, code) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // ===== Kalkulator =====
  function updatePreview() {
    if (!operation.trim()) {
      resultEl.textContent = "0";
      lastValidResult = "0";
      return;
    }
    try {
      let exp = operation.replace(/x/g, "*").replace(/:/g, "/");
      let preview = eval(exp);
      lastValidResult = preview;
      if (isCurrencyMode) {
        resultEl.textContent = convertCurrency(preview);
      } else {
        resultEl.textContent = preview;
      }
    } catch {
      resultEl.textContent = lastValidResult;
    }
  }

  // ===== History =====
  function renderHistory() {
    historyEl.innerHTML = "";
    if (!history.length) {
      historyEl.innerHTML = `<div class="alert"><p>Belum ada riwayat perhitungan</p></div>`;
      return;
    }

    // Tombol hapus semua
    const clearAllBtn = document.createElement("button");
    clearAllBtn.textContent = "Hapus Semua";
    clearAllBtn.className = "delete-all";
    clearAllBtn.addEventListener("click", () => {
      history = [];
      renderHistory();
    });
    historyEl.appendChild(clearAllBtn);

    // List item history
    const ul = document.createElement("ul");
    history.forEach((item, index) => {
      const li = document.createElement("li");

      const text = document.createElement("span");
      text.textContent = `${item.operation} = ${item.result}`;
      text.style.cursor = "pointer";
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
      delBtn.className = "delete-one";
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

  // ===== Handle Input =====
  function handleInput({ value, action }) {
    const lastChar = operation.slice(-1);

    if (action === "clear") {
      operation = "";
      operationEl.textContent = "0";
      resultEl.textContent = "0";
      operationEl.classList.remove("hidden");
      resultEl.classList.remove("final");
      isFinal = false;
      lastValidResult = "0";
      insideNegBracket = false;
      return;
    }

    if (action === "delete") {
      operation = operation.slice(0, -1);
      operationEl.textContent = operation || "0";
      updatePreview();
      return;
    }

    if (action === "calculate") {
      try {
        let finalResult = eval(operation.replace(/x/g, "*").replace(/:/g, "/"));
        operationEl.classList.add("hidden");
        isFinal = true;
        lastValidResult = finalResult;

        if (isCurrencyMode) {
          resultEl.textContent = convertCurrency(finalResult);
        } else {
          resultEl.textContent = finalResult;
        }
        resultEl.classList.add("final");

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

    if (value) {
      if (isFinal) {
        operation = "";
        resultEl.classList.remove("final");
        operationEl.classList.remove("hidden");
        isFinal = false;
      }

      if (isOperator(value) && insideNegBracket) {
        operation += ")";
        insideNegBracket = false;
      }

      if (isOperator(value)) {
        if (isOperator(lastChar)) {
          if (value === "-" && lastChar !== "-") {
            operation = operation.slice(0, -1) + lastChar + "(-";
            insideNegBracket = true;
          } else if (lastChar === "-" && value === "-") {
            operation = operation.slice(0, -1) + "-(-";
            insideNegBracket = true;
          } else {
            operation = operation.slice(0, -1) + value;
          }
        } else {
          operation += value;
        }
      } else {
        operation += value;
      }

      operationEl.textContent = operation;
      updatePreview();
    }
  }

  // ===== Button Click =====
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (window.chatbotActive) return; // stop kalau chatbot aktif
      handleInput({ value: btn.dataset.value, action: btn.dataset.action });
      btn.classList.add("active");
      setTimeout(() => btn.classList.remove("active"), 150);
    });
  });

  // ===== Keyboard Shortcut =====
  document.addEventListener("keydown", (e) => {
    // stop shortcut kalkulator kalau chatbot aktif
    if (window.chatbotActive) return;

    // ===== Integrasi Shortcut Menu (Alt + H/M/S/A) =====
    if (e.altKey) {
      e.preventDefault();
      if (e.key.toLowerCase() === "h") {
        const historyMenu = document.getElementById("historyMenu");
        if (historyMenu) historyMenu.classList.toggle("hidden");
        return;
      } else if (e.key.toLowerCase() === "m") {
        const moneyMenu = document.getElementById("moneyMenu");
        if (moneyMenu) moneyMenu.classList.toggle("hidden");
        return;
      } else if (e.key.toLowerCase() === "s") {
        const settingMenu = document.getElementById("settingMenu");
        if (settingMenu) settingMenu.classList.toggle("hidden");
        return;
      } else if (e.key.toLowerCase() === "a") {
        const aboutMenu = document.getElementById("aboutMenu");
        if (aboutMenu) aboutMenu.classList.toggle("hidden");
        return;
      }
    }

    if (/Mac|iPod|iPhone|iPad/.test(navigator.platform)) return;
    if (e.ctrlKey && ["-", "+", "=", "0"].includes(e.key)) return;

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

  // ===== Navigation Menu =====
  navIcons.forEach((icon) => {
    if (icon.id === "newui") return;

    icon.addEventListener("click", () => {
      const targetMenuId = icon.getAttribute("data-target");
      const targetMenu = document.getElementById(targetMenuId);
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
      } else mainMenu.classList.remove("active");
    });
  });

  // ===== Konversi Mata Uang =====
  const rates = {
    IDR: { USD: 0.000065, EUR: 0.000061, IDR: 1 },
    USD: { IDR: 15400, EUR: 0.93, USD: 1 },
    EUR: { IDR: 16500, USD: 1.07, EUR: 1 },
  };

  function checkCurrencyMode() {
    if (currencyFrom.value && currencyTo.value) {
      isCurrencyMode = true;
      updatePreview();
    } else {
      isCurrencyMode = false;
      updatePreview();
    }
  }

  function convertCurrency(value) {
    const from = currencyFrom.value;
    const to = currencyTo.value;
    if (!from || !to) return value;

    const rate = rates[from][to];
    const converted = value * rate;

    return `${formatCurrency(value, from)} = ${formatCurrency(converted, to)}`;
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

  renderHistory();
});
