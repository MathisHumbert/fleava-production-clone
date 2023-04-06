import * as THREE from 'three';
import { gsap } from 'gsap';
import * as dat from 'lil-gui';

import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

export default class Scene {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.time = 0;
    this.isFullScreen = false;

    this.initThree();
    this.addObject();
    // this.onClick();
    this.setupSettings();
    this.update();
  }

  initThree() {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.perspective = 600;
    const fov =
      Math.atan(this.height / 2 / this.perspective) * (180 / Math.PI) * 2;
    console.log(fov);
    this.camera = new THREE.PerspectiveCamera(
      fov,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.z = this.perspective;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(1);
  }

  addObject() {
    this.texture = new THREE.TextureLoader().load('/texture.jpg');

    this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10);
    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        uTexture: { value: this.texture },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
        uProgress: { value: 0 },
        uTime: { value: 0 },
      },
      wireframe: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.scale.set(650, 310, 1);
    this.scene.add(this.mesh);

    this.timeline = gsap.timeline();
    this.timeline
      .to(this.material.uniforms.uCorners.value, {
        x: 1,
        y: 1,
        duration: 1,
      })
      .to(
        this.material.uniforms.uCorners.value,
        { z: 1, w: 1, duration: 1 },
        0.1
      );
  }

  setupSettings() {
    this.settings = {
      progress: 0,
    };

    this.gui = new dat.GUI();
    this.gui.add(this.settings, 'progress', 0, 1, 0.001);
  }

  onClick() {
    this.canvas.addEventListener('click', () => {
      const endValue = this.isFullScreen ? 0 : 1;

      const tl = gsap.timeline({
        onStart: () => {
          this.isFullScreen = !this.isFullScreen;
          this.material.uniforms.uProgress.value = 0;
        },
      });

      tl.to(this.material.uniforms.uCorners.value, {
        x: endValue,
        y: endValue,
        duration: 1,
      })
        .to(
          this.material.uniforms.uCorners.value,
          { z: endValue, w: endValue, duration: 1 },
          0.1
        )
        .to(this.material.uniforms.uProgress, { value: 1, duration: 1.1 }, 0);
    });
  }

  update() {
    this.time += 0.05;

    // update uniforms
    this.material.uniforms.uProgress.value = this.settings.progress;
    this.material.uniforms.uTime.value = this.time;
    this.timeline.progress(this.settings.progress);

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.update.bind(this));
  }
}
