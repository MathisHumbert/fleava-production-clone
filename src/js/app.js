import FontFaceObserver from 'fontfaceobserver';
import imagesLoaded from 'imagesloaded';
import * as THREE from 'three';

import Scene from './Scene';

const fontGraphik = new Promise((resolve) => {
  new FontFaceObserver('Graphik').load().then(() => {
    resolve();
  });
});

const preloadImages = new Promise((resolve) => {
  imagesLoaded(document.querySelectorAll('img'), { background: true }, resolve);
});

const textureLoader = new THREE.TextureLoader();

const loadedTextures = {};

const textureUrls = [
  '/img/noir.webp',
  '/img/turiya.webp',
  '/img/samsara.webp',
  '/img/ayana.webp',
  '/img/tentrem.webp',
  '/img/eyelike.webp',
  '/img/wonderful.webp',
];

const loadTextures = Promise.all(
  textureUrls.map(
    (url) =>
      new Promise((resolve) => {
        textureLoader.load(url, (texture) => {
          loadedTextures[url] = texture;
          resolve(texture);
        });
      })
  )
);

Promise.all([fontGraphik, preloadImages, loadTextures]).then(() => {
  console.log('loadded');
  new Scene(
    document.getElementById('webgl'),
    document.getElementById('page__wrapper'),
    loadedTextures
  );
});
