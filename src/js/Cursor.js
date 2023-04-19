import { gsap } from 'gsap';

import { lerp } from './utils';

export default class Cursor {
  constructor(isMobileOrTablet) {
    this.cursor = document.querySelector('.cursor');
    this.cursor.style.opacity = 0;

    this.bounds = this.cursor.getBoundingClientRect();
    this.mouse = { x: 0, y: 0 };
    this.renderedStyles = {
      tx: { previous: 0, current: 0, amt: 0.2 },
      ty: { previous: 0, current: 0, amt: 0.2 },
    };

    if (isMobileOrTablet) {
      this.cursor.classList.add('hide');
    }

    this.addEvents();
  }

  addEvents() {
    this.initMouseMove();
    this.onMouseMove();
  }

  initMouseMove() {
    this.onMouseMoveEv = () => {
      this.renderedStyles.tx.previous = this.renderedStyles.tx.current =
        this.mouse.x - this.bounds.width / 2;
      this.renderedStyles.ty.previous = this.renderedStyles.ty.current =
        this.mouse.y - this.bounds.height / 2;

      gsap.to(this.cursor, { opacity: 1, duration: 1 });

      requestAnimationFrame(() => this.render());
      window.removeEventListener('mousemove', this.onMouseMoveEv);
    };

    window.addEventListener('mousemove', this.onMouseMoveEv);
  }

  onMouseMove() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
  }

  onResize(isMobileOrTablet) {
    if (isMobileOrTablet) {
      this.cursor.classList.add('hide');
    } else {
      this.cursor.classList.remove('hide');
    }
  }

  render() {
    this.renderedStyles.tx.current = this.mouse.x - this.bounds.width / 2;
    this.renderedStyles.ty.current = this.mouse.y - this.bounds.height / 2;

    for (const key in this.renderedStyles) {
      this.renderedStyles[key].previous = lerp(
        this.renderedStyles[key].previous,
        this.renderedStyles[key].current,
        this.renderedStyles[key].amt
      );
    }

    this.cursor.style.transform = `translate(${this.renderedStyles['tx'].previous}px, ${this.renderedStyles['ty'].previous}px)`;

    requestAnimationFrame(() => this.render());
  }
}
