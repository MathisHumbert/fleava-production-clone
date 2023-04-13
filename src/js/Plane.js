import * as THREE from 'three';
import { gsap } from 'gsap';

import fragment from './shaders/plane-fragment.glsl';
import vertex from './shaders/plane-vertex.glsl';

export default class Plane {
  constructor(el, scene, index, isFullScreen) {
    this.elDom = el;
    this.imgDom = el.querySelector('img');
    this.bgData = el.dataset.bg;
    this.colorData = el.dataset.color;
    this.cursorDom = scene.curorDom;

    this.scene = scene.scene;
    this.width = scene.width;
    this.height = scene.height;
    this.texture = scene.textureLoader.load(this.imgDom.src);
    this.scroll = scene.lenis.scroll;
    this.footer = scene.footer;
    this.index = index;
    this.isFullScreen = isFullScreen;

    this.initPlane();
    this.addEvents();
  }

  addEvents() {
    this.onMouseEnter();
    this.onMouseLeave();
  }

  initPlane() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10);

    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        uTexture: { value: this.texture },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uCorners: {
          value: this.isFullScreen
            ? new THREE.Vector4(1, 1, 1, 1)
            : new THREE.Vector4(0, 0, 0, 0),
        },
        uTextureSize: { value: new THREE.Vector2(0, 0) },
        uQuadSize: { value: new THREE.Vector2(0, 0) },
        uProgress: { value: 0 },
        uHover: { value: this.isFullScreen ? 1 : 0 },
        uVelo: { value: 0 },
      },
      // wireframe: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    this.material.depthTest = false;

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    if (this.isFullScreen) {
      this.mesh.renderOrder = 10;
    }
    this.scene.add(this.mesh);

    this.setBounds();
  }

  setBounds() {
    const rect = this.imgDom.getBoundingClientRect();

    this.bounds = {
      left: this.scroll + rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };

    this.mesh.scale.set(this.bounds.width, this.bounds.height, 1);

    this.mesh.position.x =
      this.scroll + this.bounds.left - this.width / 2 + this.bounds.width / 2;
    this.mesh.position.y =
      -this.bounds.top + this.height / 2 - this.bounds.height / 2;

    this.material.uniforms.uQuadSize.value.x = this.bounds.width;
    this.material.uniforms.uQuadSize.value.y = this.bounds.height;

    this.material.uniforms.uTextureSize.value.x = this.bounds.width;
    this.material.uniforms.uTextureSize.value.y = this.bounds.height;
  }

  updatePosition() {
    this.mesh.position.x =
      -this.scroll + this.bounds.left - this.width / 2 + this.bounds.width / 2;
  }

  onScroll(scroll, velocity) {
    this.scroll = scroll;
    this.material.uniforms.uVelo.value = velocity;
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;

    this.material.uniforms.uResolution.value.x = this.width;
    this.material.uniforms.uResolution.value.y = this.height;

    this.setBounds();
  }

  onMouseEnter() {
    const clientValue = this.elDom.querySelector('.slide__client').textContent;
    const directorValue =
      this.elDom.querySelector('.slide__director').textContent;
    const categoryValue =
      this.elDom.querySelector('.slide__category').textContent;
    const locationValue =
      this.elDom.querySelector('.slide__location').textContent;
    const industryValue =
      this.elDom.querySelector('.slide__industry').textContent;
    const yearValue = this.elDom.querySelector('.slide__year').textContent;

    this.elDom.addEventListener('mouseenter', () => {
      if (!this.isFullScreen) {
        gsap.to(this.material.uniforms.uHover, { value: 1 });

        this.cursorDom.classList.add('active');

        this.footer.showDetail(
          this.colorData,
          clientValue,
          directorValue,
          categoryValue,
          locationValue,
          industryValue,
          yearValue,
          this.index
        );
      }
    });
  }

  onMouseLeave() {
    this.elDom.addEventListener('mouseleave', () => {
      if (!this.isFullScreen) {
        gsap.to(this.material.uniforms.uHover, { value: 0 });

        this.cursorDom.classList.remove('active');

        this.footer.hideDetail();
      }
    });
  }

  onZoom(el) {
    this.timeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onStart: () => {
        this.isFullScreen = true;
        this.mesh.renderOrder = 10;
      },
    });

    return this.timeline
      .to(this.material.uniforms.uCorners.value, {
        x: 1,
        y: 1,
      })
      .to(this.material.uniforms.uCorners.value, { z: 1, w: 1 }, 0.1)
      .to(
        el,
        {
          yPercent: -100,
          duration: 0.3,
          onComplete: () => {
            el.textContent = 'scroll / [esc] to close';
            gsap.set(el, { yPercent: 100 });
          },
        },
        0.2
      )
      .to(el, { yPercent: 0, duration: 0.3 });
  }

  onUnZoom(el) {
    this.timeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        this.mesh.renderOrder = 0;
        this.isFullScreen = false;
      },
    });

    return this.timeline
      .to(this.material.uniforms.uCorners.value, {
        x: 0,
        y: 0,
      })
      .to(this.material.uniforms.uCorners.value, { z: 0, w: 0 }, 0.1)
      .to(
        el,
        {
          yPercent: -100,
          duration: 0.3,
          onComplete: () => {
            el.textContent = 'scroll / drag';
            gsap.set(el, { yPercent: 100 });
          },
        },
        0.2
      )
      .to(el, { yPercent: 0, duration: 0.3 });
  }

  update() {
    this.updatePosition();
  }
}
