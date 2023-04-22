import barba from '@barba/core';
import { gsap } from 'gsap';

import Works from './Works';
import About from './About';

export default class Transition {
  constructor(scene) {
    this.scene = scene;

    this.initBarbara();
  }

  initBarbara() {
    let that = this.scene;

    barba.init({
      preventRunning: true,
      transitions: [
        {
          once(data) {
            const tl = gsap.timeline();

            if (that.page === 'home') {
              return tl
                .add(() => {
                  that.header.start();
                  document.documentElement.classList.remove('loading');
                  that.lenis.start();
                }, 1)
                .add(
                  () =>
                    that.planes.forEach((plane, index) => {
                      plane.initOpacity(index);
                    }),
                  1.5
                );
            }

            if (that.page === 'work') {
              that.lenis.stop();
              const {
                client,
                director,
                category,
                location,
                industry,
                year,
                index,
              } = data.next.container.dataset;

              const plane = that.planes[Number(index)];
              const carouselDom = document.querySelector('.slider__carousel');

              const planePos =
                plane.bounds.left *
                (that.lenis.dimensions.height /
                  (carouselDom.offsetWidth - that.width / 2));

              that.footer.showDetail(
                null,
                client,
                director,
                category,
                location,
                industry,
                year,
                index
              );
              document.querySelector('.footer__info').classList.add('active');
              document.querySelector('.header__toggle').classList.add('active');

              return tl
                .add(() => {
                  that.lenis.scrollTo(planePos, {
                    duration: 0.5,
                    force: true,
                  });
                }, 0.75)
                .add(() => {
                  plane.initOpacity(0);
                }, 1.25)
                .add(() => {
                  that.header.start();
                  document.documentElement.classList.remove('loading');
                  that.works = new Works(that);
                }, 1.75)
                .add(
                  () =>
                    that.planes.forEach((plane, index) => {
                      plane.initOpacity(index);
                    }),
                  2.5
                );
            }

            if (that.page === 'about') {
              that.lenis.stop();

              return tl
                .add(() => {
                  that.header.start();
                  document.documentElement.classList.remove('loading');

                  that.about = new About(that);
                  that.about.showAbout();
                }, 1)
                .add(
                  () =>
                    that.planes.forEach((plane, index) => {
                      plane.initOpacity(index);
                    }),
                  1.5
                );
            }
          },
        },
        {
          name: 'from-home-to-work',
          from: {
            namespace: ['home'],
          },
          to: {
            namespace: ['work'],
          },
          leave(data) {
            that.lenis.stop();

            const planeIndex = Number(data.next.container.dataset.index);
            that.page = 'work';

            return that.planes[planeIndex].onZoom(
              that.footerScrollDom,
              that.headerToggleDom
            );
          },
          enter() {
            if (that.works) {
              that.works.addEvents();
            } else {
              that.works = new Works(that);
            }

            document.querySelector('.footer__info').classList.add('active');
          },
        },
        {
          name: 'from-work-to-home',
          from: {
            namespace: ['work'],
          },
          to: {
            namespace: ['home'],
          },
          leave(data) {
            that.page = 'home';

            document.querySelector('.cursor').classList.remove('close');

            that.works.removeEvents();

            const planeIndex = Number(data.current.container.dataset.index);
            return that.planes[planeIndex].onUnZoom(
              that.footerScrollDom,
              that.headerToggleDom,
              that.isMobileOrTablet
            );
          },
          enter() {
            if (that.isMobileOrTablet) {
              document.documentElement.style.setProperty(
                '--main-color',
                '#ffffff'
              );
            }

            that.lenis.start();
          },
        },
        {
          name: 'from-home-to-about',
          from: {
            namespace: ['home'],
          },
          to: {
            namespace: ['about'],
          },
          leave() {
            that.page = 'about';
            document.documentElement.style.setProperty(
              '--main-color',
              '#e0ccbb'
            );

            that.lenis.stop();

            const tl = gsap.timeline();

            return tl
              .add(() => {
                that.footer.hideFooter();
              })
              .set(that.transitionPathDom, {
                attr: { d: 'M 0 100 V 100 Q 50 100 100 100 V 100 z' },
              })
              .to(that.transitionPathDom, {
                attr: { d: 'M 0 100 V 50 Q 50 0 100 50 V 100 z' },
                duration: 0.8,
                ease: 'power4.in',
              })
              .to(that.transitionPathDom, {
                attr: { d: 'M 0 100 V 0 Q 50 0 100 0 V 100 z' },
                duration: 0.3,
                ease: 'power2',
              })
              .add(() => that.headerToggleDom.classList.add('active'));
          },

          enter() {
            if (that.about) {
              that.about.addEvents();
              that.about.initDom();
            } else {
              that.about = new About(that);
            }

            return that.about.showAbout();
          },
        },
        {
          name: 'from-about-to-home',
          from: {
            namespace: ['about'],
          },
          to: {
            namespace: ['home'],
          },
          leave() {
            that.page = 'home';

            that.about.removeEvents();

            return that.about.hideAbout();
          },

          enter() {
            that.lenis.start();
            document.documentElement.style.setProperty(
              '--main-color',
              '#ffffff'
            );

            const tl = gsap.timeline();

            return tl
              .set(that.transitionPathDom, {
                attr: { d: 'M 0 0 V 100 Q 50 100 100 100 V 0 z' },
              })
              .to(that.transitionPathDom, {
                attr: { d: 'M 0 0 V 50 Q 50 0 100 50 V 0 z' },
                duration: 0.3,
                ease: 'power2.in',
              })
              .to(that.transitionPathDom, {
                attr: { d: 'M 0 0 V 0 Q 50 0 100 0 V 0 z' },
                duration: 0.8,
                ease: 'power4',
              })
              .add(() => {
                that.footer.showFooter();
              }, 0.2)
              .add(() => that.headerToggleDom.classList.remove('active'));
          },
        },
      ],
    });
  }
}
