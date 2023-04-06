import Lenis from '@studio-freight/lenis';

const lenis = new Lenis({
  orientation: 'horizontal',
});

lenis.on('scroll', (e) => {
  console.log(e);
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

import Scene from './Scene';

new Scene(document.getElementById('webgl'));
