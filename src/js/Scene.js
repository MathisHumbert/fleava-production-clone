import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import barba from '@barba/core';

import fragment from './shaders/composer-fragment.glsl';
import vertex from './shaders/composer-vertex.glsl';
import Plane from './Plane';
import Footer from './Footer';
import Cursor from './Cursor';
import Header from './Header';
import Works from './Works';
import About from './About';
import { checkMobileOrTablet } from './utils';
import Transition from './Transition';

gsap.registerPlugin(ScrollTrigger);

export default class Scene {
  constructor(canvas, pageWrapper, loadedTextures) {
    this.canvas = canvas;
    this.pageWrapper = pageWrapper;
    this.loadedTextures = loadedTextures;
    this.page = pageWrapper.dataset.page;
    this.width = document.documentElement.offsetWidth;
    this.height = document.documentElement.offsetHeight;
    this.scroll = 0;
    this.currentScroll = 0;
    this.velocity = 0;
    this.isFullScreen = false;
    this.isMobileOrTablet = checkMobileOrTablet();

    this.cursorDom = document.querySelector('.cursor');
    this.footerScrollDom = document.querySelector('.footer__scroll');
    this.headerToggleDom = document.querySelector('.header__toggle');
    this.transitionPathDom = document.querySelector(
      '.transition__overlay__path'
    );

    this.start();
  }

  start() {
    this.initThree();
    this.initScroll();
    this.footer = new Footer();
    this.header = new Header(this.cursorDom);
    this.cursor = new Cursor(this.isMobileOrTablet);

    this.initPlanes();
    this.initComposerPass();
    new Transition(this);

    this.addEvents();
    this.update();
  }

  initThree() {
    this.scene = new THREE.Scene();

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

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  initScroll() {
    const lenis = new Lenis({
      wheelMultiplier: 0.35,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    lenis.scrollTo(0, {
      duration: 0.5,
    });

    requestAnimationFrame(raf);

    this.lenis = lenis;

    const carouselDom = document.querySelector('.slider__carousel');
    const sliderDom = document.querySelector('.slider');
    const sliderContainerDom = document.querySelector('.slider__container');
    const progressBar = document.querySelector('.footer__progress__bar__line');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sliderDom,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.to(sliderContainerDom, {
      x: () => `-${carouselDom.offsetWidth - this.width + this.width * 0.275}`,
      ease: 'none',
    }).to(progressBar, { scaleX: 1 }, 0);
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

  addEvents() {
    this.onResize();
    this.onScroll();
  }

  onResize() {
    window.addEventListener('resize', () => {
      this.width = document.documentElement.offsetWidth;
      this.height = document.documentElement.offsetHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.fov =
        Math.atan(this.height / 2 / this.perspective) * (180 / Math.PI) * 2;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      this.isMobileOrTablet = checkMobileOrTablet();

      this.cursor.onResize(this.isMobileOrTablet);

      for (const plane of this.planes) {
        plane.onResize(this.width, this.height);
      }
    });
  }

  onScroll() {
    this.lenis.on('scroll', (e) => {
      if (!this.isMobileOrTablet) {
        this.velocity = e.velocity;
      } else {
        this.scroll = e.scroll;
      }

      for (const plane of this.planes) {
        plane.onScroll(this.velocity);
      }
    });
  }

  update() {
    if (this.isMobileOrTablet) {
      this.velocity = Math.min(Math.abs(this.currentScroll - this.scroll), 15);
      this.currentScroll = this.scroll;
    }

    this.customPass.uniforms.uVelo.value = this.velocity;

    for (const plane of this.planes) {
      plane.update();
    }

    this.composer.render();

    requestAnimationFrame(this.update.bind(this));
  }
}
