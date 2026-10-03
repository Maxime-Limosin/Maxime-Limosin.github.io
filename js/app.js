import { HologramScene } from './hologram-scene.js';
import { ProjectsManager } from './projects-manager.js';
import { LedController } from './led-controller.js';
import { initAnimatedFavicon } from './favicon-animator.js';

document.addEventListener('DOMContentLoaded', () => {
  new HologramScene();
  new LedController();
  
  const projectsManager = new ProjectsManager();
  window.openProjectModal = (id) => projectsManager.openModal(id);

  initAnimatedFavicon();
});
