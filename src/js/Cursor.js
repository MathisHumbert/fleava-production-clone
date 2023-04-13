import { gsap } from 'gsap';

export default class Cursor {
  constructor() {
    this.cursor = document.querySelector('.cursor');
    this.cursor.style.opacity = 0;

    this.bounds = this.cursor.getBoundingClientRect();
    this.mouse = { x: 0, y: 0 };
    this.renderedStyles = {
      tx: { previous: 0, current: 0, amt: 0.2 },
      ty: { previous: 0, current: 0, amt: 0.2 },
    };

    this.lerp = (a, b, n) => (1 - n) * a + n * b;

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

  render() {
    this.renderedStyles.tx.current = this.mouse.x - this.bounds.width / 2;
    this.renderedStyles.ty.current = this.mouse.y - this.bounds.height / 2;

    for (const key in this.renderedStyles) {
      this.renderedStyles[key].previous = this.lerp(
        this.renderedStyles[key].previous,
        this.renderedStyles[key].current,
        this.renderedStyles[key].amt
      );
    }

    this.cursor.style.transform = `translate(${this.renderedStyles['tx'].previous}px, ${this.renderedStyles['ty'].previous}px)`;

    requestAnimationFrame(() => this.render());
  }
}
