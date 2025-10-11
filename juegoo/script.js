const playBtn = document.getElementById('play-btn');
const volverBtn = document.getElementById('volver');
const mainMenu = document.getElementById('main-menu');
const gameMenu = document.getElementById('game-menu');
const nuevaPartida = document.getElementById('nueva-partida');
const loadingScreen = document.getElementById('loading-screen');
const factionMenu = document.getElementById('faction-menu');
const heroesChoice = document.getElementById('heroes-choice');
const villainsChoice = document.getElementById('villains-choice');
const backFromFaction = document.getElementById('back-from-faction');

// Texto de la sinopsis
const storyText = "En un continente devastado por la guerra y las bestias, los brujos son cazadores mutantes que viven entre el bien y el mal. Geralt de Rivia busca a Ciri, una niña marcada por la profecía, mientras una amenaza sobrenatural conocida como la Cacería Salvaje se aproxima desde otro mundo.";

// Crear partículas flotantes
function createParticles() {
  const particlesContainer = document.getElementById('particles');
  const particleCount = 30;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
    particle.style.animationDelay = Math.random() * 5 + 's';
    particlesContainer.appendChild(particle);
  }
}

// Efecto de escritura automática
function typeWriter(text, element, speed = 30) {
  let i = 0;
  element.textContent = '';
  
  return new Promise((resolve) => {
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
      } else {
        resolve();
      }
    }
    type();
  });
}

// Animar barra de carga
function animateLoadingBar(duration) {
  const loadingBar = document.getElementById('loading-bar');
  let progress = 0;
  const interval = 50;
  const increment = (100 / duration) * interval;
  
  return new Promise((resolve) => {
    const timer = setInterval(() => {
      progress += increment;
      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);
        loadingBar.style.width = '100%';
        setTimeout(resolve, 500);
      } else {
        loadingBar.style.width = progress + '%';
      }
    }, interval);
  });
}

// Secuencia de carga
async function startLoadingSequence() {
  // Mostrar pantalla de carga
  gameMenu.classList.add('oculto');
  setTimeout(() => {
    gameMenu.style.display = 'none';
    loadingScreen.classList.remove('oculto');
  }, 500);
  
  // Esperar un momento antes de empezar
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Escribir la historia
  const storyElement = document.getElementById('story-text');
  const writingPromise = typeWriter(storyText, storyElement, 25);
  
  // Animar barra de carga al mismo tiempo
  const loadingPromise = animateLoadingBar(8000);
  
  // Esperar a que ambas terminen
  await Promise.all([writingPromise, loadingPromise]);
  
  // Esperar un poco más
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mostrar menú de selección de facción
  loadingScreen.classList.add('oculto');
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    factionMenu.classList.remove('oculto');
  }, 500);
}

// Inicializar
createParticles();

// Event listeners
playBtn.addEventListener('click', () => {
  mainMenu.classList.add('oculto');
  setTimeout(() => {
    mainMenu.style.display = 'none';
    gameMenu.classList.remove('oculto');
    gameMenu.classList.add('visible');
  }, 800);
});

volverBtn.addEventListener('click', () => {
  gameMenu.classList.remove('visible');
  gameMenu.classList.add('oculto');
  setTimeout(() => {
    gameMenu.style.display = 'none';
    mainMenu.style.display = 'block';
    mainMenu.classList.remove('oculto');
  }, 800);
});

nuevaPartida.addEventListener('click', () => {
  startLoadingSequence();
});

heroesChoice.addEventListener('click', () => {
  window.location.href = 'heroes.html';
});

villainsChoice.addEventListener('click', () => {
  window.location.href = 'antagonistas.html';
});

backFromFaction.addEventListener('click', () => {
  factionMenu.classList.add('oculto');
  setTimeout(() => {
    factionMenu.style.display = 'none';
    gameMenu.style.display = 'block';
    gameMenu.classList.remove('oculto');
  }, 500);
});