uniform sampler2D tDiffuse;
uniform float uVelo;

varying vec2 vUv;

void main(){
  vec2 newUv = vUv;  

  float veloSpeed = min(abs(uVelo) / 150., 1.);

  float distortion = ((1. + sin(vUv.x * 5.) ) * 0.5) * 0.25 * veloSpeed * 2.5;

  newUv.y -= (vUv.y - 0.5) * distortion;

  gl_FragColor = texture2D(tDiffuse, newUv);
}