import * as THREE from 'three';
import { gsap } from 'gsap';

import fragment from './shaders/plane-fragment.glsl';
import vertex from './shaders/plane-vertex.glsl';

export default class Plane {
  constructor(el, scene) {
    this.elDom = el;
    this.imgDom = el.querySelector('img');
    this.scene = scene.scene;
    this.width = scene.width;
    this.height = scene.height;
    this.texture = scene.textureLoader.load(this.imgDom.src);
    this.scroll = scene.lenis.scroll;

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
        uCorners: { value: new THREE.Vector4(0, 0, 0, 0) },
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uHover: { value: 0 },
        uVelo: { value: 0 },
      },
      // wireframe: true,
      vertexShader: vertex,
      fragmentShader: fragment,
    });

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
    this.elDom.addEventListener('mouseenter', () => {
      gsap.to(this.material.uniforms.uHover, { value: 1 });
    });
  }

  onMouseLeave() {
    this.elDom.addEventListener('mouseleave', () => {
      gsap.to(this.material.uniforms.uHover, { value: 0 });
    });
  }

  update(time) {
    this.material.uniforms.uTime.value = time;
    this.updatePosition();
  }
}
