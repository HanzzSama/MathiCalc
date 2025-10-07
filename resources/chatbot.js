document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.querySelector(".chat-box > div");
  const inputField = document.querySelector(".input-chat input");
  const livePreview = document.getElementById("live-preview");

  // === Fungsi Live Kalkulator Preview ===
  function liveCalc(msg) {
    msg = msg.toLowerCase().trim();
    let result = "";

    try {
      if (/^[0-9+\-*/().\s]+$/.test(msg)) {
        const evalRes = Function("return " + msg)();
        if (!isNaN(evalRes)) result = `Hasil = ${evalRes}`;
      }
    } catch (e) {}

    if (msg.includes("luas persegi")) {
      const s = parseFloat(msg.match(/\d+/));
      if (!isNaN(s)) result = `Luas persegi = ${s * s}`;
    } else if (msg.includes("luas lingkaran")) {
      const r = parseFloat(msg.match(/\d+/));
      if (!isNaN(r))
        result = `Luas lingkaran ≈ ${(Math.PI * r * r).toFixed(2)}`;
    } else if (msg.includes("volume kubus")) {
      const s = parseFloat(msg.match(/\d+/));
      if (!isNaN(s)) result = `Volume kubus = ${s ** 3}`;
    } else if (msg.includes("faktorial")) {
      const n = parseInt(msg.match(/\d+/));
      if (!isNaN(n)) {
        let f = 1;
        for (let i = 2; i <= n; i++) f *= i;
        result = `Faktorial(${n}) = ${f}`;
      }
    }

    return result;
  }

  // === Tambah Pesan ke Chat ===
  function addMessage(sender, text) {
    const section = document.createElement("section");
    section.className = `chat ${sender}`;
    section.innerHTML = `
      <main class="wrapper-chat">
        <div class="username"><h3>${sender}</h3></div>
        <div class="chat-text"><p>${text}</p></div>
        <div></div>
      </main>
    `;
    chatBox.appendChild(section);

    // Scroll ke bawah dengan efek halus
    section.scrollIntoView({ behavior: "smooth" });
  }


  // === Hapus Semua Chat ===
  function clearChat() {
    chatBox.innerHTML = "";
    addMessage("bot", "💡 Semua chat sudah dihapus.");
  }

  // === Balasan Bot ===
  function botReply(userMsg) {
    const msg = userMsg.toLowerCase().trim();
    let reply = "";

    // Command clear
    if (["cls", "clear", "del", "delete", "remove"].includes(msg)) {
      clearChat();
      return;
    }

    // Command umum
    if (msg.includes("halo") || msg.includes("hai")) {
      reply = "Halo juga! 👋 Aku bot MathiCalc, siap bantu hitung 😊";
    } else if (msg.includes("about")) {
      reply =
        "MathiCalc adalah kalkulator + chatbot untuk bantu hitung rumus matematika dan konversi.";
    } else if (msg.includes("help")) {
      reply = `
      Contoh pertanyaan:
      - luas persegi sisi 5
      - hitung luas lingkaran jari 7
      - volume kubus sisi 3
      - pythagoras 3 4
      - faktorial 5
      - konversi 30 c ke f
      - ubah 10 kg ke pound
      - 1000 m ke km
      `;
    }

    // Rumus Matematika
    else if (msg.includes("luas persegi")) {
      const s = parseFloat(msg.match(/\d+/));
      reply = `Luas persegi = ${MathRumus.luasPersegi(s)}`;
    } else if (msg.includes("luas persegi panjang")) {
      const nums = msg.match(/\d+/g).map(Number);
      reply = `Luas persegi panjang = ${MathRumus.luasPP(nums[0], nums[1])}`;
    } else if (msg.includes("luas segitiga")) {
      const nums = msg.match(/\d+/g).map(Number);
      reply = `Luas segitiga = ${MathRumus.luasSegitiga(nums[0], nums[1])}`;
    } else if (msg.includes("luas lingkaran")) {
      const r = parseFloat(msg.match(/\d+/));
      reply = `Luas lingkaran = ${MathRumus.luasLingkaran(r).toFixed(2)}`;
    } else if (msg.includes("keliling lingkaran")) {
      const r = parseFloat(msg.match(/\d+/));
      reply = `Keliling lingkaran = ${MathRumus.kelilingLingkaran(r).toFixed(
        2
      )}`;
    } else if (msg.includes("volume kubus")) {
      const s = parseFloat(msg.match(/\d+/));
      reply = `Volume kubus = ${MathRumus.volumeKubus(s)}`;
    } else if (msg.includes("volume balok")) {
      const nums = msg.match(/\d+/g).map(Number);
      reply = `Volume balok = ${MathRumus.volumeBalok(
        nums[0],
        nums[1],
        nums[2]
      )}`;
    } else if (msg.includes("volume tabung")) {
      const nums = msg.match(/\d+/g).map(Number);
      reply = `Volume tabung = ${MathRumus.volumeTabung(
        nums[0],
        nums[1]
      ).toFixed(2)}`;
    } else if (msg.includes("pythagoras")) {
      const nums = msg.match(/\d+/g).map(Number);
      reply = `Sisi miring = ${MathRumus.pythagoras(nums[0], nums[1]).toFixed(
        2
      )}`;
    } else if (msg.includes("faktorial")) {
      const n = parseFloat(msg.match(/\d+/));
      reply = `Hasil faktorial = ${MathRumus.faktorial(n)}`;
    }

    // Konversi Suhu
    else if (msg.includes("c ke f")) {
      const c = parseFloat(msg.match(/\d+/));
      reply = `${c}°C = ${MathRumus.cToF(c).toFixed(2)}°F`;
    } else if (msg.includes("f ke c")) {
      const f = parseFloat(msg.match(/\d+/));
      reply = `${f}°F = ${MathRumus.fToC(f).toFixed(2)}°C`;
    } else if (msg.includes("c ke k")) {
      const c = parseFloat(msg.match(/\d+/));
      reply = `${c}°C = ${MathRumus.cToK(c).toFixed(2)}K`;
    } else if (msg.includes("k ke c")) {
      const k = parseFloat(msg.match(/\d+/));
      reply = `${k}K = ${MathRumus.kToC(k).toFixed(2)}°C`;
    }

    // Konversi Berat
    else if (msg.includes("kg ke gram")) {
      const kg = parseFloat(msg.match(/\d+/));
      reply = `${kg} kg = ${MathRumus.kgToGram(kg)} gram`;
    } else if (msg.includes("gram ke kg")) {
      const g = parseFloat(msg.match(/\d+/));
      reply = `${g} gram = ${MathRumus.gramToKg(g)} kg`;
    } else if (msg.includes("kg ke pound")) {
      const kg = parseFloat(msg.match(/\d+/));
      reply = `${kg} kg = ${MathRumus.kgToPound(kg).toFixed(2)} lb`;
    } else if (msg.includes("pound ke kg")) {
      const lb = parseFloat(msg.match(/\d+/));
      reply = `${lb} lb = ${MathRumus.poundToKg(lb).toFixed(2)} kg`;
    }

    // Konversi Panjang
    else if (msg.includes("m ke cm")) {
      const m = parseFloat(msg.match(/\d+/));
      reply = `${m} m = ${MathRumus.mToCm(m)} cm`;
    } else if (msg.includes("cm ke m")) {
      const cm = parseFloat(msg.match(/\d+/));
      reply = `${cm} cm = ${MathRumus.cmToM(cm)} m`;
    } else if (msg.includes("m ke km")) {
      const m = parseFloat(msg.match(/\d+/));
      reply = `${m} m = ${MathRumus.mToKm(m)} km`;
    } else if (msg.includes("km ke m")) {
      const km = parseFloat(msg.match(/\d+/));
      reply = `${km} km = ${MathRumus.kmToM(km)} m`;
    } else {
      reply = "Aku tidak paham, coba ketik 'help' 😊";
    }

    addMessage("bot", reply);
  }

  // === Event Tekan Enter ===
  inputField.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && inputField.value.trim() !== "") {
      const userMsg = inputField.value.trim();
      addMessage("user", userMsg);
      inputField.value = "";
      livePreview.style.display = "none"; // sembunyikan preview setelah kirim
      setTimeout(() => botReply(userMsg), 500);
    }
  });

  // === Event Saat User Mengetik (Live Preview) ===
  inputField.addEventListener("input", () => {
    const msg = inputField.value;
    const preview = liveCalc(msg);
    if (preview) {
      livePreview.style.display = "block";
      livePreview.textContent = preview;
    } else {
      livePreview.style.display = "none";
    }
  });

  // === Pesan Awal ===
  addMessage(
    "bot",
    "Halo! Ada yang bisa saya bantu? (ketik 'help' untuk daftar perintah)"
  );
});
