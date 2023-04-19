export default class Header {
  constructor(cursor) {
    this.cursorDom = cursor;
    this.logoDom = document.querySelector('.header__logo__link');
    this.linksDom = document.querySelectorAll('.header__toggle__link');
  }

  start() {
    this.logoDom.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.logoDom.addEventListener('mouseleave', this.onMouseLeave.bind(this));

    for (const link of this.linksDom) {
      link.addEventListener('mouseenter', this.onMouseEnter.bind(this));
      link.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    }
  }

  onMouseEnter() {
    this.cursorDom.classList.add('active');
  }

  onMouseLeave() {
    this.cursorDom.classList.remove('active');
  }
}
