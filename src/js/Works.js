export default class Works {
  constructor(scene) {
    this.cursorDom = scene.cursorDom;
    this.cursorDom.classList.add('active');

    this.addEvents();
  }

  addEvents() {
    this.controlDom = document.querySelector('.video__control');

    this.controlDom.addEventListener(
      'mouseenter',
      this.onControlEnter.bind(this)
    );
    this.controlDom.addEventListener(
      'mouseleave',
      this.onControlLeave.bind(this)
    );
  }

  removeEvents() {
    this.controlDom.removeEventListener(
      'mouseenter',
      this.onControlEnter.bind(this)
    );
    this.controlDom.removeEventListener(
      'mouseleave',
      this.onControlLeave.bind(this)
    );
  }

  onControlEnter() {
    this.cursorDom.classList.add('active', 'close');
  }

  onControlLeave() {
    this.cursorDom.classList.remove('active', 'close');
  }
}
