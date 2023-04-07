import * as THREE from 'three';
import { gsap } from 'gsap';
import * as dat from 'lil-gui';
import Lenis from '@studio-freight/lenis';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

import fragment from './shaders/composer-fragment.glsl';
import vertex from './shaders/composer-vertex.glsl';
import Plane from './Plane';

export default class Scene {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.time = 0;
    this.velocity = 0;
    this.isFullScreen = false;

    this.initThree();
    this.initScroll();
    this.initPlanes();
    this.initComposerPass();
    this.addEvents();
    // this.addObject();
    // this.onClick();
    // this.setupSettings();
    this.update();
  }

  initThree() {
    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.perspective = 600;
    const fov =
      Math.atan(this.height / 2 / this.perspective) * (180 / Math.PI) * 2;
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
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Texture Loader
    this.textureLoader = new THREE.TextureLoader();
  }

  initScroll() {
    const lenis = new Lenis({
      orientation: 'horizontal',
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    this.lenis = lenis;
  }

  initPlanes() {
    const slides = [...document.querySelectorAll('.slide')];
    this.planes = slides.map((el) => new Plane(el, this));
  }

  initComposerPass() {
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    //custom shader pass
    this.customShaderPass = {
      uniforms: {
        tDiffuse: { value: null },
        uVelo: { value: 0 },
        uTime: { value: 0 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    };

    this.customPass = new ShaderPass(this.customShaderPass);
    this.customPass.renderToScreen = true;

    this.composer.addPass(this.customPass);
  }

  addEvents() {
    this.onResize();
    this.onScroll();
  }

  onResize() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.fov =
        Math.atan(this.height / 2 / this.perspective) * (180 / Math.PI) * 2;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      for (const plane of this.planes) {
        plane.onResize(this.width, this.height);
      }
    });
  }

  onScroll() {
    this.lenis.on('scroll', (e) => {
      for (const plane of this.planes) {
        this.velocity = e.velocity;
        plane.onScroll(e.scroll, e.velocity);
      }
    });
  }

  // addObject() {
  //   this.texture = new THREE.TextureLoader().load('/texture.jpg');

  //   this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10);
  //   this.material = new THREE.RawShaderMaterial({
  //     uniforms: {
  //       uTexture: { value: this.texture },
  //       uResolution: { value: new THREE.Vector2(this.width, this.height) },
  //       uCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
  //       uProgress: { value: 0 },
  //       uTime: { value: 0 },
  //     },
  //     wireframe: true,
  //     vertexShader: vertex,
  //     fragmentShader: fragment,
  //   });

  //   this.mesh = new THREE.Mesh(this.geometry, this.material);
  //   this.mesh.scale.set(650, 310, 1);
  //   this.scene.add(this.mesh);

  //   this.timeline = gsap.timeline();
  //   this.timeline
  //     .to(this.material.uniforms.uCorners.value, {
  //       x: 1,
  //       y: 1,
  //       duration: 1,
  //     })
  //     .to(
  //       this.material.uniforms.uCorners.value,
  //       { z: 1, w: 1, duration: 1 },
  //       0.1
  //     );
  // }

  // setupSettings() {
  //   this.settings = {
  //     progress: 0,
  //   };

  //   this.gui = new dat.GUI();
  //   this.gui.add(this.settings, 'progress', 0, 1, 0.001);
  // }

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
    // this.material.uniforms.uProgress.value = this.settings.progress;
    // this.material.uniforms.uTime.value = this.time;
    // this.timeline.progress(this.settings.progress);

    this.customPass.uniforms.uVelo.value = this.velocity;
    this.customPass.uniforms.uTime.value = this.time;

    for (const plane of this.planes) {
      plane.update(this.time);
    }

    // Post processing
    this.composer.render();

    requestAnimationFrame(this.update.bind(this));
  }
}
