export default class Header {
  constructor(cursor) {
    this.cursorDom = cursor;
    this.logoDom = document.querySelector('.header__logo__link');
    this.aboutLinkDom = document.querySelector('.about__link');

    this.logoDom.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.logoDom.addEventListener('mouseleave', this.onMouseLeave.bind(this));

    this.aboutLinkDom.addEventListener(
      'mouseenter',
      this.onMouseEnter.bind(this)
    );
    this.aboutLinkDom.addEventListener(
      'mouseleave',
      this.onMouseLeave.bind(this)
    );
  }

  onMouseEnter() {
    this.cursorDom.classList.add('active');
  }

  onMouseLeave() {
    this.cursorDom.classList.remove('active');
  }
}
