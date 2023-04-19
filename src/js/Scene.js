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
import Loader from './Loader';

gsap.registerPlugin(ScrollTrigger);

export default class Scene {
  constructor(canvas, pageWrapper) {
    this.canvas = canvas;
    this.pageWrapper = pageWrapper;
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

    this.loader = new Loader(this.start.bind(this));

    this.initThree();
    this.initScroll();
    this.footer = new Footer();
    this.header = new Header(this.cursorDom);
    this.cursor = new Cursor(this.isMobileOrTablet);

    if (this.page === 'work') {
      this.works = new Works(this);
    }

    if (this.page === 'about') {
      this.about = new About(this);
    }
  }

  start() {
    this.initBarbara();
    this.initPlanes();
    this.initComposerPass();

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

    requestAnimationFrame(raf);

    lenis.stop();

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

  initBarbara() {
    let that = this;

    barba.init({
      preventRunning: true,
      transitions: [
        {
          once() {
            console.log('first loading');

            if (that.page === 'home') {
              that.lenis.start();
            }

            for (const plane of that.planes) {
              plane.initOpacity();
            }

            that.header.start();
            console.log(document.documentElement);
            document.documentElement.classList.remove('loading');
          },
        },
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
            that.page = 'work';

            return that.planes[planeIndex].onZoom(
              that.footerScrollDom,
              that.headerToggleDom
            );
          },
          enter() {
            if (that.works) {
              that.works.addEvents();
            } else {
              that.works = new Works(that);
            }

            document.querySelector('.footer__info').classList.add('active');
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

            that.works.removeEvents();

            const planeIndex = Number(data.current.container.dataset.index);
            return that.planes[planeIndex].onUnZoom(
              that.footerScrollDom,
              that.headerToggleDom,
              that.isMobileOrTablet
            );
          },
          enter() {
            if (that.isMobileOrTablet) {
              document.documentElement.style.setProperty(
                '--main-color',
                '#ffffff'
              );
            }

            that.lenis.start();
          },
        },
        {
          name: 'from-home-to-about',
          from: {
            namespace: ['home'],
          },
          to: {
            namespace: ['about'],
          },
          leave() {
            that.page = 'about';
            document.documentElement.style.setProperty(
              '--main-color',
              '#e0ccbb'
            );

            that.lenis.stop();

            const tl = gsap.timeline();

            return tl
              .add(() => {
                that.footer.hideFooter();
              })
              .set(that.transitionPathDom, {
                attr: { d: 'M 0 100 V 100 Q 50 100 100 100 V 100 z' },
              })
              .to(that.transitionPathDom, {
                attr: { d: 'M 0 100 V 50 Q 50 0 100 50 V 100 z' },
                duration: 0.8,
                ease: 'power4.in',
              })
              .to(that.transitionPathDom, {
                attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 z' },
                duration: 0.3,
                ease: 'power2',
              })
              .add(() => that.headerToggleDom.classList.add('active'));
          },

          enter() {
            if (that.about) {
              that.about.addEvents();
              that.about.initDom();
            } else {
              that.about = new About(that);
            }

            return that.about.showAbout();
          },
        },
        {
          name: 'from-about-to-home',
          from: {
            namespace: ['about'],
          },
          to: {
            namespace: ['home'],
          },
          leave() {
            that.page = 'home';

            that.about.removeEvents();

            return that.about.hideAbout();
          },

          enter() {
            that.lenis.start();
            document.documentElement.style.setProperty(
              '--main-color',
              '#ffffff'
            );

            const tl = gsap.timeline();

            return tl
              .set(that.transitionPathDom, {
                attr: { d: 'M 0 0 V 100 Q 50 100 100 100 V 0 z' },
              })
              .to(that.transitionPathDom, {
                attr: { d: 'M 0 0 V 50 Q 50 0 100 50 V 0 z' },
                duration: 0.3,
                ease: 'power2.in',
              })
              .to(that.transitionPathDom, {
                attr: { d: 'M 0 0 V 0 Q 50 0 100 0 V 0 z' },
                duration: 0.8,
                ease: 'power4',
              })
              .add(() => {
                that.footer.showFooter();
              }, 0.2)
              .add(() => that.headerToggleDom.classList.remove('active'));
          },
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
