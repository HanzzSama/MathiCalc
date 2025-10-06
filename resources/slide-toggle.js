let btn = document.querySelector(".slide");
let bar = document.querySelector(".main-button");
let btnAlert = document.querySelector("#close-alert");
let alerts = document.querySelectorAll("#main-alert .main-alert");
let barAlert = document.querySelector("#main-alert");
const transitionDuration = 600; // ms, sama dengan CSS transition

function addActive() {
  bar.classList.add("active");
  btn.classList.add("active");
}

function removeActive() {
  bar.classList.remove("active");
  btn.classList.remove("active");
}

btn.onclick = function () {
  bar.classList.toggle("active");
  btn.classList.toggle("active");
};

// btnAlert.onclick = function () {
//   barAlert.classList.toggle("active");
// };

// animasi masuk saat halaman baru di-load
window.addEventListener("load", () => {
  alerts.forEach((alert, index) => {
    setTimeout(() => {
      alert.classList.add("slide-in");
    }, index * 200); // delay bergantian
  });
});

// animasi keluar saat klik close
btnAlert.addEventListener("click", () => {
  alerts.forEach((alert, index) => {
    setTimeout(() => {
      alert.classList.remove("slide-in");
      alert.classList.add("slide-out");
    }, index * 200);
  });

  // setelah animasi terakhir selesai → sembunyikan container
  const totalTime = alerts.length * 200 + transitionDuration;
  setTimeout(() => {
    barAlert.style.display = "none";
  }, totalTime);
});

// Add keyboard shortcut: Shift + Right Arrow to add active class
document.addEventListener("keydown", function (event) {
  if (event.shiftKey && event.key === "ArrowRight") {
    event.preventDefault(); // Prevent default browser behavior if needed
    addActive();
  }
  // Add keyboard shortcut: Shift + Left Arrow to remove active class
  else if (event.shiftKey && event.key === "ArrowLeft") {
    event.preventDefault(); // Prevent default browser behavior if needed
    removeActive();
  }
});
