// document.addEventListener("DOMContentLoaded", () => {
//   const characters = document.querySelectorAll(".character");
//   const panel = document.getElementById("info-panel");
//   const nameField = document.getElementById("char-name");
//   const roleField = document.getElementById("char-role");
//   const powerField = document.getElementById("char-power");
//   const originField = document.getElementById("char-origin");
//   const backBtn = document.getElementById("back-btn");

//   characters.forEach(character => {
//     character.addEventListener("mouseenter", () => {
//       nameField.textContent = character.dataset.name;
//       roleField.textContent = character.dataset.role;
//       powerField.textContent = character.dataset.power;
//       originField.textContent = character.dataset.origin;
//       panel.classList.remove("oculto");
//     });

//     character.addEventListener("mouseleave", () => {
//       panel.classList.add("oculto");
//     });
//   });

//   backBtn.addEventListener("click", () => {
//     window.location.href = "index.html";
//   });
// });

// Autoarranque visual (efecto al cargar)











window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  const scene = document.querySelector(".villains-scene");

  // Espera a que los iframes estén listos
  setTimeout(() => {
    loader.style.display = "none";
    scene.classList.add("show");
    scene.classList.remove("hidden");
  }, 2500);
});








