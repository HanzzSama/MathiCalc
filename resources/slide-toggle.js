let btn = document.querySelector(".slide");
let bar = document.querySelector(".main-button");

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
