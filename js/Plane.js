import * as THREE from 'three';
import { gsap } from 'gsap';

import fragment from './shaders/plane-fragment.glsl';
import vertex from './shaders/plane-vertex.glsl';

export default class Plane {
  constructor(el, scene, index) {
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
    this.isFullScreen = false;

    this.initPlane();
    this.addEvents();
  }

  addEvents() {
    this.onMouseEnter();
    this.onMouseLeave();
    this.onMouseClick();
  }

  initPlane() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10);

    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        uTexture: { value: this.texture },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
        uTextureSize: { value: new THREE.Vector2(0, 0) },
        uQuadSize: { value: new THREE.Vector2(0, 0) },
        uProgress: { value: 0 },
        uHover: { value: 0 },
        uVelo: { value: 0 },
      },
      // wireframe: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });
    this.material.depthTest = false;
    this.mesh = new THREE.Mesh(this.geometry, this.material);
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
    });
  }

  onMouseLeave() {
    this.elDom.addEventListener('mouseleave', () => {
      gsap.to(this.material.uniforms.uHover, { value: 0 });

      this.cursorDom.classList.remove('active');

      this.footer.hideDetail();
    });
  }

  onMouseClick() {
    this.elDom.addEventListener('click', () => {
      const value = this.isFullScreen ? 0 : 1;

      this.timeline = gsap.timeline({
        onStart: () => {
          if (!this.isFullScreen) {
            this.mesh.renderOrder = 10;
          }
          this.isFullScreen = !this.isFullScreen;
        },
        onComplete: () => {
          if (!this.isFullScreen) {
            this.mesh.renderOrder = 0;
          }
        },
      });

      this.timeline
        .to(this.material.uniforms.uCorners.value, {
          x: value,
          y: value,
          duration: 1,
        })
        .to(
          this.material.uniforms.uCorners.value,
          { z: value, w: value, duration: 1 },
          0.1
        );
    });
  }

  update() {
    this.updatePosition();
  }
}
