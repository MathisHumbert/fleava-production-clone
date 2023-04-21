import { gsap } from 'gsap';
import SplitType from 'split-type';

import { wrapLines } from './utils';

export default class About {
  constructor(scene) {
    this.cursorDom = scene.cursorDom;

    this.initDom();
    this.addEvents();
  }

  initDom() {
    this.infoTitleDom = document.querySelector(
      '.about__info__title .line__inner'
    );
    this.infoTextDom = document.querySelector('.about__info__text');
    this.footerLeftDom = document.querySelector(
      '.about__footer__left .line__inner'
    );
    this.footerMiddlePreProdDom = document.querySelectorAll(
      '.about__preprod .line__inner'
    );
    this.footerMiddleProdDom = document.querySelectorAll(
      '.about__prod .line__inner'
    );
    this.footerMiddlePostProdDom = document.querySelectorAll(
      '.about__postprod .line__inner'
    );
    this.footerRightLinksDom = document.querySelectorAll(
      '.about__footer__right .line__inner'
    );

    this.splitAboutText();
  }

  addEvents() {
    this.footerLeftDom.addEventListener(
      'mouseenter',
      this.onMouseEnter.bind(this)
    );

    this.footerLeftDom.addEventListener(
      'mouseleave',
      this.onMouseLeave.bind(this)
    );

    for (const link of this.footerRightLinksDom) {
      link.addEventListener('mouseenter', this.onMouseEnter.bind(this));

      link.addEventListener('mouseleave', this.onMouseLeave.bind(this));
    }

    window.addEventListener('resize', this.onResize.bind(this));
  }

  removeEvents() {
    this.footerLeftDom.removeEventListener(
      'mouseenter',
      this.onMouseEnter.bind(this)
    );

    this.footerLeftDom.removeEventListener(
      'mouseleave',
      this.onMouseLeave.bind(this)
    );

    for (const link of this.footerRightLinksDom) {
      link.removeEventListener('mouseenter', this.onMouseEnter.bind(this));

      link.removeEventListener('mouseleave', this.onMouseLeave.bind(this));
    }

    window.removeEventListener('resize', this.onResize.bind(this));
  }

  showAbout() {
    const tl = gsap.timeline();

    return tl
      .fromTo(this.infoTitleDom, { yPercent: 100 }, { yPercent: 0 })
      .fromTo(this.infoTextLineDom.lines, { yPercent: 100 }, { yPercent: 0 }, 0)
      .fromTo(this.footerLeftDom, { yPercent: 100 }, { yPercent: 0 }, 0.1)
      .fromTo(
        this.footerMiddlePreProdDom,
        { yPercent: 100 },
        { yPercent: 0, stagger: 0.05 },
        0.1
      )
      .fromTo(
        this.footerMiddleProdDom,
        { yPercent: 100 },
        { yPercent: 0, stagger: 0.05 },
        0.2
      )
      .fromTo(
        this.footerMiddlePostProdDom,
        { yPercent: 100 },
        { yPercent: 0, stagger: 0.05 },
        0.3
      )
      .fromTo(
        this.footerRightLinksDom,
        { yPercent: 100 },
        { yPercent: 0, stagger: 0.05 },
        0.5
      );
  }

  hideAbout() {
    return gsap.to(
      [
        this.infoTitleDom,
        this.infoTextLineDom.lines,
        this.footerLeftDom,
        this.footerMiddlePreProdDom,
        this.footerMiddleProdDom,
        this.footerMiddlePostProdDom,
        this.footerRightLinksDom,
      ],
      { yPercent: -100 }
    );
  }

  onMouseEnter() {
    this.cursorDom.classList.add('active');
  }

  onMouseLeave() {
    this.cursorDom.classList.remove('active');
  }

  splitAboutText() {
    this.infoTextLineDom = new SplitType(this.infoTextDom, {
      types: 'lines',
      lineClass: 'line__inner',
    });

    wrapLines(this.infoTextLineDom.lines, 'span', 'line');
  }

  onResize() {
    this.infoTextLineDom.split();

    wrapLines(this.infoTextLineDom.lines, 'span', 'line');

    this.splitAboutText();
  }
}
