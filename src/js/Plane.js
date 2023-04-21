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
    this.cursorDom = scene.cursorDom;

    this.scene = scene.scene;
    this.width = scene.width;
    this.height = scene.height;
    this.texture = scene.loadedTextures[this.imgDom.getAttribute('src')];
    this.footer = scene.footer;
    this.index = index;
    this.isFullScreen = isFullScreen;
    this.initScrolPos = scene.lenis.targetScroll;

    this.initPlane();
    this.addEvents();
  }

  addEvents() {
    this.onMouseEnter();
    this.onMouseLeave();
  }

  initPlane() {
    this.geometry = new THREE.PlaneGeometry(1, 1, 100, 100);

    this.material = new THREE.RawShaderMaterial({
      uniforms: {
        uTexture: { value: this.texture },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uCorners: {
          value: this.isFullScreen
            ? new THREE.Vector4(1, 1, 1, 1)
            : new THREE.Vector4(0, 0, 0, 0),
        },
        uTextureSize: { value: new THREE.Vector2(2500, 1556) },
        uQuadSize: { value: new THREE.Vector2(0, 0) },
        uProgress: { value: 0 },
        uHover: { value: this.isFullScreen ? 1 : 0 },
        uVelo: { value: 0 },
        uOpacity: { value: 1 },
      },
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

  initOpacity(index) {
    gsap.to(this.material.uniforms.uOpacity, {
      value: 1,
      duration: 2,
      delay: index * 0.25,
      ease: 'power2.out',
    });
  }

  getBounds() {
    const rect = this.imgDom.getBoundingClientRect();

    this.bounds = {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  setBounds() {
    this.getBounds();

    this.mesh.scale.set(this.bounds.width, this.bounds.height, 1);

    this.material.uniforms.uQuadSize.value.set(
      this.bounds.width,
      this.bounds.height
    );
  }

  setPostion() {
    this.getBounds();

    this.updatePosition();
  }

  updatePosition() {
    this.mesh.position.x =
      this.bounds.left - this.width / 2 + this.bounds.width / 2;
    this.mesh.position.y =
      -this.bounds.top + this.height / 2 - this.bounds.height / 2;
  }

  onScroll(velocity) {
    this.material.uniforms.uVelo.value = velocity;
  }

  onResize(width, height) {
    this.width = width;
    this.height = height;

    this.material.uniforms.uResolution.value.set(this.width, this.height);

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

  onZoom(footerDom, headerDom) {
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
      .add(() => {
        headerDom.classList.add('active');
        footerDom.classList.add('active');
      }, 0.2);
  }

  onUnZoom(footerDom, headerDom, isMobileOrTablet) {
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
      .to(this.material.uniforms.uHover, { value: 0 }, 0)
      .add(() => {
        headerDom.classList.remove('active');
        footerDom.classList.remove('active');
        if (isMobileOrTablet) {
          this.footer.hideDetail();
        }
      }, 0.2);
  }

  update() {
    this.setPostion();
  }
}
