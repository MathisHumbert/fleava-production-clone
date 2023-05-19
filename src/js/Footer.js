export default class Footer {
  constructor() {
    this.footerInfoDomm = document.querySelector('.footer__info');
    this.footerScrollDom = document.querySelector('.footer__scroll__drag');
    this.footerInfoDom = document.querySelector('.footer__info__base');
    this.footerProgressDom = document.querySelector(
      '.footer__progress__toggle'
    );
    this.clientDom = document.querySelector('[data-client]');
    this.directorDom = document.querySelector('[data-director]');
    this.categoryDom = document.querySelector('[data-category]');
    this.locationDom = document.querySelector('[data-location]');
    this.industryDom = document.querySelector('[data-industry]');
    this.yearDom = document.querySelector('[data-year]');
  }

  showDetail(
    color,
    client,
    director,
    category,
    location,
    industry,
    year,
    index
  ) {
    color && document.documentElement.style.setProperty('--main-color', color);

    this.clientDom.textContent = client;
    this.directorDom.textContent = director;
    this.categoryDom.textContent = category;
    this.locationDom.textContent = location;
    this.industryDom.textContent = industry;
    this.yearDom.textContent = year;

    this.footerInfoDomm.classList.add('active');

    this.footerProgressDom.textContent = `0${Number(index) + 1}`;
  }

  hideDetail() {
    document.documentElement.style.setProperty('--main-color', '#ffffff');

    this.footerInfoDomm.classList.remove('active');

    this.footerProgressDom.textContent = `00`;
  }

  hideFooter() {
    this.footerScrollDom.classList.add('hide');
    this.footerInfoDom.classList.add('hide');
  }

  showFooter() {
    this.footerScrollDom.classList.remove('hide');
    this.footerInfoDom.classList.remove('hide');
  }
}
