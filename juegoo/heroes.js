// Muestra información de habilidades al pasar el mouse
const heroes = document.querySelectorAll('.hero');
const infoPanel = document.getElementById('info-panel');
const heroName = document.getElementById('hero-name');
const heroSkill = document.getElementById('hero-skill');

heroes.forEach(hero => {
  hero.addEventListener('mouseenter', () => {
    const name = hero.getAttribute('data-name');
    const skill = hero.getAttribute('data-skill');
    heroName.textContent = name;
    heroSkill.textContent = skill;
    infoPanel.classList.add('show');
  });

  hero.addEventListener('mouseleave', () => {
    infoPanel.classList.remove('show');
  });
});

