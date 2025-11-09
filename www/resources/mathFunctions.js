// === Fungsi Rumus Matematika ===

// 1. Luas Persegi
function luasPersegi(s) {
  return s * s;
}

// 2. Luas Persegi Panjang
function luasPP(p, l) {
  return p * l;
}

// 3. Luas Segitiga
function luasSegitiga(a, t) {
  return 0.5 * a * t;
}

// 4. Luas Lingkaran
function luasLingkaran(r) {
  return Math.PI * r * r;
}

// 5. Keliling Lingkaran
function kelilingLingkaran(r) {
  return 2 * Math.PI * r;
}

// 6. Volume Kubus
function volumeKubus(s) {
  return s ** 3;
}

// 7. Volume Balok
function volumeBalok(p, l, t) {
  return p * l * t;
}

// 8. Volume Tabung
function volumeTabung(r, t) {
  return Math.PI * r * r * t;
}

// 9. Pythagoras (c² = a² + b²)
function pythagoras(a, b) {
  return Math.sqrt(a * a + b * b);
}

// 10. Faktorial
function faktorial(n) {
  if (n === 0 || n === 1) return 1;
  let hasil = 1;
  for (let i = 2; i <= n; i++) hasil *= i;
  return hasil;
}

// === Fungsi Konversi ===

// Konversi Suhu
function cToF(c) {
  return (c * 9) / 5 + 32;
}
function fToC(f) {
  return ((f - 32) * 5) / 9;
}
function cToK(c) {
  return c + 273.15;
}
function kToC(k) {
  return k - 273.15;
}

// Konversi Berat
function kgToGram(kg) {
  return kg * 1000;
}
function gramToKg(g) {
  return g / 1000;
}
function kgToPound(kg) {
  return kg * 2.20462;
}
function poundToKg(lb) {
  return lb / 2.20462;
}

// Konversi Panjang
function mToCm(m) {
  return m * 100;
}
function cmToM(cm) {
  return cm / 100;
}
function mToKm(m) {
  return m / 1000;
}
function kmToM(km) {
  return km * 1000;
}

// === Export ke global window supaya bisa dipakai di browser ===
window.MathRumus = {
  // Rumus Matematika
  luasPersegi,
  luasPP,
  luasSegitiga,
  luasLingkaran,
  kelilingLingkaran,
  volumeKubus,
  volumeBalok,
  volumeTabung,
  pythagoras,
  faktorial,

  // Konversi Suhu
  cToF,
  fToC,
  cToK,
  kToC,

  // Konversi Berat
  kgToGram,
  gramToKg,
  kgToPound,
  poundToKg,

  // Konversi Panjang
  mToCm,
  cmToM,
  mToKm,
  kmToM,
};
