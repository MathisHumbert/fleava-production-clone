import * as THREE from 'three';
import { gsap } from 'gsap';
import Lenis from '@studio-freight/lenis';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import barba from '@barba/core';

import fragment from './shaders/composer-fragment.glsl';
import vertex from './shaders/composer-vertex.glsl';
import Plane from './Plane';
import Footer from './Footer';
import Cursor from './Cursor';
import Header from './Header';
import Video from './Video';

export default class Scene {
  constructor(canvas, pageWrapper) {
    this.canvas = canvas;
    this.pageWrapper = pageWrapper;
    this.page = pageWrapper.dataset.page;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.time = 0;
    this.velocity = 0;
    this.isFullScreen = false;

    this.curorDom = document.querySelector('.cursor');
    this.footerScrollDom = document.querySelector('.footer__scroll');
    this.headerToggleDom = document.querySelector('.header__toggle');

    this.footer = new Footer();
    this.cursor = new Cursor();
    if (this.page === 'work') {
      this.video = new Video(this);
    }
    this.header = new Header(this.curorDom);

    this.initThree();
    this.initScroll();
    this.initPlanes();
    this.initComposerPass();
    this.initBarbara();
    this.addEvents();
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
    this.planes = slides.map((el, index) => {
      let isFullScreen = false;
      if (
        this.page === 'work' &&
        Number(this.pageWrapper.dataset.index) === index
      ) {
        isFullScreen = true;
      }
      return new Plane(el, this, index, isFullScreen);
    });
  }

  initComposerPass() {
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // custom shader pass
    this.customShaderPass = {
      uniforms: {
        tDiffuse: { value: null },
        uVelo: { value: 0 },
      },
      vertexShader: vertex,
      fragmentShader: fragment,
    };

    this.customPass = new ShaderPass(this.customShaderPass);
    this.customPass.renderToScreen = true;

    this.composer.addPass(this.customPass);
  }

  initBarbara() {
    let that = this;

    barba.init({
      preventRunning: true,
      transitions: [
        {
          name: 'from-home-to-work',
          from: {
            namespace: ['home'],
          },
          to: {
            namespace: ['work'],
          },
          leave(data) {
            that.lenis.stop();

            const planeIndex = Number(data.next.container.dataset.index);

            return that.planes[planeIndex].onZoom(
              that.footerScrollDom,
              that.headerToggleDom
            );
          },
          enter() {
            if (that.video) {
              that.video.removeEvents();
            }

            that.lenis.start();
            that.page = 'work';

            document.querySelector('.footer__info').classList.add('active');
            that.video = new Video(that);
          },
        },
        {
          name: 'from-work-to-home',
          from: {
            namespace: ['work'],
          },
          to: {
            namespace: ['home'],
          },
          leave(data) {
            that.page = 'home';

            document.querySelector('.cursor').classList.remove('close');

            that.video.removeEvents();

            const planeIndex = Number(data.current.container.dataset.index);
            return that.planes[planeIndex].onUnZoom(
              that.footerScrollDom,
              that.headerToggleDom
            );
          },
          enter() {},
        },
      ],
    });
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
    const progressBar = document.querySelector('.footer__progress__bar__line');
    this.lenis.on('scroll', (e) => {
      if (this.page === 'work') {
        barba.go('/');
        this.page = 'home';
      }

      for (const plane of this.planes) {
        this.velocity = e.velocity;
        plane.onScroll(e.scroll, e.velocity);
        gsap.to(progressBar, {
          scaleX: e.scroll / (e.dimensions.scrollWidth - this.width),
        });
      }
    });
  }

  update() {
    this.customPass.uniforms.uVelo.value = this.velocity;

    for (const plane of this.planes) {
      plane.update();
    }

    // Post processing
    this.composer.render();

    requestAnimationFrame(this.update.bind(this));
  }
}
