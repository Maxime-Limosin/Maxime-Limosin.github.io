export class HologramScene {
  constructor() {
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.currentMouseX = 0;
    this.currentMouseY = 0;
    this.scrollY = 0;
    this.colorTime = 0;

    this.init();
  }

  async init() {
    try {
      const response = await fetch('./config.json');
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      this.config = await response.json();
    } catch (error) {
      this.config = this.getDefaultConfig();
    }

    this.palette = this.config.colors.map(hex => new THREE.Color(hex));

    this.applyConfigToDOM();
    this.setupThree();
    this.bindEvents();
    this.animate();
  }

  applyConfigToDOM() {
    if (!this.config.overlay) return;

    const scanlinesEl = document.getElementById('scanlines-layer') || document.querySelector('.scanlines-overlay');
    if (scanlinesEl) {
      scanlinesEl.style.display = this.config.overlay.scanlines !== false ? 'block' : 'none';
    }

    const webglContainer = document.getElementById('webgl-container');
    if (webglContainer && this.config.overlay.opacity !== undefined) {
      webglContainer.style.opacity = this.config.overlay.opacity;
    }
  }

  setupThree() {
    const container = document.getElementById('webgl-container');
    if (!container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5.5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    const geoConfig = this.config.geometries || this.getDefaultConfig().geometries;

    const outerGeo = new THREE.OctahedronGeometry(
      geoConfig.outerOctahedron?.radius || 2.3,
      geoConfig.outerOctahedron?.detail || 0
    );
    const outerWire = new THREE.WireframeGeometry(outerGeo);
    const outerMat = new THREE.LineBasicMaterial({
      color: this.palette[0],
      transparent: true,
      opacity: 0.35,
      linewidth: 1.5
    });
    this.outerMesh = new THREE.LineSegments(outerWire, outerMat);
    this.scene.add(this.outerMesh);

    const innerGeo = new THREE.IcosahedronGeometry(
      geoConfig.innerIcosahedron?.radius || 1.15,
      geoConfig.innerIcosahedron?.detail || 0
    );
    const innerWire = new THREE.WireframeGeometry(innerGeo);
    const innerMat = new THREE.LineBasicMaterial({
      color: this.palette[1] || this.palette[0],
      transparent: true,
      opacity: 0.45,
      linewidth: 1.5
    });
    this.innerMesh = new THREE.LineSegments(innerWire, innerMat);
    this.scene.add(this.innerMesh);

    const positions = outerGeo.attributes.position.array;
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: this.palette[0],
      size: 0.07,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    this.particlesMesh = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particlesMesh);
  }

  bindEvents() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this));
  }

  onMouseMove(e) {
    this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 1.5;
    this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 1.5;
  }

  onScroll() {
    this.scrollY = window.scrollY;
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    if (!this.outerMesh || !this.innerMesh) return;

    const speeds = this.config.animation.autoRotateSpeed;

    this.outerMesh.rotation.x += speeds.outer.x || 0.0018;
    this.outerMesh.rotation.y += speeds.outer.y || 0.003;
    if (speeds.outer.z) this.outerMesh.rotation.z += speeds.outer.z;

    this.innerMesh.rotation.x += speeds.inner.x || -0.0025;
    this.innerMesh.rotation.y += speeds.inner.y || -0.004;
    if (speeds.inner.z) this.innerMesh.rotation.z += speeds.inner.z;

    this.particlesMesh.rotation.copy(this.outerMesh.rotation);

    const sensibility = this.config.animation.mouseSensibility || 0.05;
    this.currentMouseX += (this.targetMouseX - this.currentMouseX) * sensibility;
    this.currentMouseY += (this.targetMouseY - this.currentMouseY) * sensibility;

    const scrollRotation = (this.scrollY / window.innerHeight) * 0.45;
    this.scene.rotation.y = this.currentMouseX * 0.4 + scrollRotation;
    this.scene.rotation.x = -this.currentMouseY * 0.4;

    this.colorTime += this.config.animation.gradientSpeed || 0.001;
    const progress = (this.colorTime % 1) * this.palette.length;
    const index1 = Math.floor(progress) % this.palette.length;
    const index2 = (index1 + 1) % this.palette.length;
    const factor = progress - Math.floor(progress);

    const currentColor = new THREE.Color();
    currentColor.lerpColors(this.palette[index1], this.palette[index2], factor);
    this.outerMesh.material.color.copy(currentColor);

    this.renderer.render(this.scene, this.camera);
  }

  getDefaultConfig() {
    const styles = getComputedStyle(document.documentElement);

    const amber = styles.getPropertyValue('--color-amber').trim();
    const violet = styles.getPropertyValue('--color-violet').trim();
    const gold = styles.getPropertyValue('--color-gold').trim();

    return {
      overlay: { opacity: 0.55, scanlines: true },
      colors: [amber, violet, gold],
      animation: {
        autoRotateSpeed: {
          outer: { x: 0.0018, y: 0.003, z: 0.001 },
          inner: { x: -0.0025, y: -0.004, z: -0.002 }
        },
        gradientSpeed: 0.001,
        mouseSensibility: 0.05
      },
      geometries: {
        outerOctahedron: { radius: 2.3, detail: 0 },
        innerIcosahedron: { radius: 1.15, detail: 0 }
      }
    };
  }
}