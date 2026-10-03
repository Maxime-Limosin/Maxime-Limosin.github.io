export class LedController {
  constructor(selector = '.js-led') {
    this.leds = document.querySelectorAll(selector);
    this.init();
  }

  init() {
    this.leds.forEach(led => {
      led.addEventListener('animationend', (e) => {
        if (e.animationName === 'led-boot-smooth') {
          led.classList.remove('led-boot');
          this.startRoutine(led);
        }
      });
    });
  }

  startRoutine(led) {
    led.classList.add('led-glow');

    setInterval(() => {
      const roll = Math.random();

      if (roll < 0.6) {
        led.classList.add('led-off');
        setTimeout(() => led.classList.remove('led-off'), 500); // Blink 500ms
      } else {
        led.classList.add('led-glitching');
        this.spawnSparks(led, 8);
        setTimeout(() => led.classList.remove('led-glitching'), 1000); // Fast Glitch 1s + sparks
      }
    }, 5000);
  }

  spawnSparks(ledElement, count) {
    const container = ledElement.parentElement;
    if (!container) return;

    for (let i = 0; i < count; i++) {
      const spark = document.createElement('span');
      spark.classList.add('spark-particle');

      const angle = Math.random() * Math.PI * 2;
      const distance = 12 + Math.random() * 20;
      const dx = `${Math.cos(angle) * distance}px`;
      const dy = `${Math.sin(angle) * distance}px`;

      spark.style.setProperty('--dx', dx);
      spark.style.setProperty('--dy', dy);

      container.appendChild(spark);
      setTimeout(() => spark.remove(), 600);
    }
  }
}