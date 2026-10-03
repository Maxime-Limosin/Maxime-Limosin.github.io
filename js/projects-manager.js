export class ProjectsManager {
  constructor() {
    this.projectsData = {};
    this.templateHTML = '';
    this.modalEl = document.getElementById('project-modal');
    this.containerEl = document.getElementById('modal-content');

    this.init();
  }

  async init() {
    try {
      const [dataRes, templateRes] = await Promise.all([
        fetch('./data/projects.json'),
        fetch('./templates/project-modal.html')
      ]);

      if (!dataRes.ok || !templateRes.ok) throw new Error('Failed to load project assets');

      this.projectsData = await dataRes.json();
      this.templateHTML = await templateRes.text();

      if (this.modalEl) {
        this.modalEl.addEventListener('click', (e) => {
          const rect = this.containerEl.getBoundingClientRect();
          const isInCard = (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          );
          if (!isInCard) {
            this.closeModal();
          }
        });

        this.modalEl.addEventListener('close', () => {
          document.body.classList.remove('overflow-hidden');
          const videoEl = this.containerEl.querySelector('video');
          if (videoEl) videoEl.pause();
        });
      }
    } catch (err) {
      console.error('Error initializing ProjectManager:', err);
    }
  }

  openModal(projectId) {
    const project = this.projectsData[projectId];
    if (!project || !this.containerEl) return;

    this.containerEl.innerHTML = this.templateHTML;

    this.containerEl.querySelector('[data-modal-category]').textContent = project.category;
    this.containerEl.querySelector('[data-modal-title]').textContent = project.title;
    this.containerEl.querySelector('[data-modal-desc]').textContent = project.desc;
    this.containerEl.querySelector('[data-modal-github]').href = project.github;

    const videoEl = this.containerEl.querySelector('[data-modal-video]');
    if (videoEl) {
      const sourceEl = videoEl.querySelector('source');
      sourceEl.src = project.video;
      videoEl.load();
    }

    const specsContainer = this.containerEl.querySelector('[data-modal-specs]');
    if (specsContainer) {
      specsContainer.innerHTML = project.specs.map(s => `
        <div class="p-3 bg-chassis-titanium/80 border border-white/5 rounded flex justify-between">
          <span class="text-chassis-slate">${s.label}:</span>
          <span class="text-white font-medium">${s.value}</span>
        </div>
      `).join('');
    }

    const closeBtn = this.containerEl.querySelector('#close-modal-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.closeModal();
    }

    document.body.classList.add('overflow-hidden');
    this.modalEl.showModal();
  }

  closeModal() {
    if (!this.modalEl) return;
    const videoEl = this.containerEl.querySelector('video');
    if (videoEl) videoEl.pause();

    document.body.classList.remove('overflow-hidden');
    this.modalEl.close();
  }
}