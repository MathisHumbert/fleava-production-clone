const lerp = (a, b, n) => (1 - n) * a + n * b;

const checkMobileOrTablet = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

const wrapLines = (arr, wrapType, wrapClass) => {
  arr.forEach((el) => {
    const wrapEl = document.createElement(wrapType);
    wrapEl.classList = wrapClass;
    el.parentNode.appendChild(wrapEl);
    wrapEl.appendChild(el);
  });
};

export { lerp, checkMobileOrTablet, wrapLines };
