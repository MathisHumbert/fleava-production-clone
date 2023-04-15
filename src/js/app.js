import Scene from './Scene';

new Scene(
  document.getElementById('webgl'),
  document.querySelector('.container'),
  document.getElementById('page__wrapper')
);

function isMobileOrTablet() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

if (isMobileOrTablet()) {
  // document.querySelector('.container')
} else {
  // do something for desktop users
}
