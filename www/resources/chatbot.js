document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.querySelector(".chat-box > div");
  const inputField = document.querySelector(".input-chat input");

  // ===============================
  // VARIABEL ALIAS
  // ===============================
  const VAR_ALIAS = {
    p: ["p", "panjang"],
    l: ["l", "lebar"],
    t: ["t", "tinggi"],
    a: ["a", "alas"],
    r: ["r", "jari", "jari-jari", "radius"],
  };

  // ===============================
  // STATE / INGATAN BOT
  // ===============================
  let pendingQuestion = null;

  // ===============================
  // FORMAT TEXT
  // ===============================
  function formatText(text) {
    return text.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  }

  // ===============================
  // JANGAN DIUBAH
  // ===============================
  function addMessage(sender, text) {
    const el = document.createElement("section");
    el.className = `chat ${sender}`;
    el.innerHTML = `<main class="wrapper-chat">
      <div class="username"><h3>${sender}</h3></div>
      <div class="chat-text"><p>${text}</p></div>
    </main>`;
    chatBox.appendChild(el);
    el.scrollIntoView({ behavior: "smooth" });
  }

  // ===============================
  // AMBIL NILAI VARIABEL
  // ===============================
  function getVar(msg, key) {
    const aliases = VAR_ALIAS[key];
    for (const name of aliases) {
      const regex = new RegExp(
        `${name}\\s*(?:=|:)?\\s*(\\d+(?:\\.\\d+)?)`,
        "i"
      );
      const match = msg.match(regex);
      if (match) return parseFloat(match[1]);
    }
    return null;
  }

  // ===============================
  // FORMAT PENJELASAN
  // ===============================
  function explain({ title, formula, known, steps, result }) {
    return `
**${title}**

Rumus:
${formula}

Diketahui:
${known}

Penyelesaian:
${steps}

Hasil:
${result}
`.trim();
  }

  // ===============================
  // BOT LOGIC
  // ===============================
  function botReply(userMsg) {
    const msg = userMsg.toLowerCase();
    let reply = "";

    // ==================================
    // LANJUTAN DARI PERTANYAAN SEBELUMNYA
    // ==================================
    if (pendingQuestion === "luas_segitiga") {
      const a = getVar(msg, "a");
      const t = getVar(msg, "t");

      if (a !== null && t !== null) {
        pendingQuestion = null;
        const hasil = (a * t) / 2;
        reply = explain({
          title: "Luas Segitiga",
          formula: "L = ½ × a × t",
          known: `a = ${a}\nt = ${t}`,
          steps: `L = ½ × ${a} × ${t}\nL = ${hasil}`,
          result: `Luas = ${hasil}`,
        });
      } else {
        reply = "Masukkan **alas** dan **tinggi**.\nContoh: **alas=10 tinggi=6**";
      }

      addMessage("bot", formatText(reply));
      return;
    }

    // ===============================
    // LUAS SEGITIGA
    // ===============================
    if (msg.includes("luas") && msg.includes("segitiga")) {
      const a = getVar(msg, "a");
      const t = getVar(msg, "t");

      if (a === null || t === null) {
        pendingQuestion = "luas_segitiga";
        reply = "Masukkan **alas** dan **tinggi**.\nContoh: **alas=10 tinggi=6**";
      } else {
        const hasil = (a * t) / 2;
        reply = explain({
          title: "Luas Segitiga",
          formula: "L = ½ × a × t",
          known: `a = ${a}\nt = ${t}`,
          steps: `L = ½ × ${a} × ${t}\nL = ${hasil}`,
          result: `Luas = ${hasil}`,
        });
      }
    }

    // ===============================
    // LUAS PERSEGI PANJANG
    // ===============================
    else if (msg.includes("luas") && msg.includes("persegi panjang")) {
      const p = getVar(msg, "p");
      const l = getVar(msg, "l");

      if (p && l) {
        reply = explain({
          title: "Luas Persegi Panjang",
          formula: "L = p × l",
          known: `p = ${p}\nl = ${l}`,
          steps: `L = ${p} × ${l}\nL = ${p * l}`,
          result: `Luas = ${p * l}`,
        });
      } else {
        reply = "Masukkan **panjang** dan **lebar**.\nContoh: **p=5 l=3**";
      }
    }

    // ===============================
    // LUAS LINGKARAN
    // ===============================
    else if (msg.includes("luas") && msg.includes("lingkaran")) {
      const r = getVar(msg, "r");

      if (r) {
        const hasil = (Math.PI * r * r).toFixed(2);
        reply = explain({
          title: "Luas Lingkaran",
          formula: "L = π × r²",
          known: `r = ${r}`,
          steps: `L = π × ${r}²\nL ≈ ${hasil}`,
          result: `Luas ≈ ${hasil}`,
        });
      } else {
        reply = "Masukkan **jari-jari**.\nContoh: **r=7**";
      }
    }

    // ===============================
    // DEFAULT
    // ===============================
    else {
      reply =
        "Aku bisa menghitung:\n- luas segitiga\n- luas persegi panjang\n- luas lingkaran\n\nGunakan **alas / a**, **tinggi / t**, **panjang / p**, **lebar / l**, **r** 😉";
    }

    addMessage("bot", formatText(reply));
  }

  // ===============================
  // ENTER SUBMIT
  // ===============================
  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && inputField.value.trim()) {
      const msg = inputField.value;
      addMessage("user", formatText(msg));
      inputField.value = "";
      botReply(msg);
    }
  });

  // ===============================
  // PESAN AWAL
  // ===============================
  addMessage(
    "bot",
    formatText(
      "Halo 👋 Aku **MathiCalc Bot**\n\nCoba:\n- luas segitiga\n- luas segitiga alas=10 tinggi=6\n- luas persegi panjang p=5 l=3\n- luas lingkaran r=7"
    )
  );
});
