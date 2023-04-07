precision mediump float;

uniform sampler2D uTexture;
uniform float uHover;
uniform float uVelo;

varying vec2 vUv;

vec3 adjustSaturation(vec3 color, float value) {
  const vec3 luminosityFactor = vec3(0.2126, 0.7152, 0.0722);
  vec3 grayscale = vec3(dot(color, luminosityFactor));

  return mix(grayscale, color, 1.0 + value);
}

void main(){
  vec4 texture = texture2D(uTexture, vUv);
  vec3 color = texture.rgb;

  float veloColor = min(abs(uVelo) / 150., 1.);

  vec3 saturatedColor = adjustSaturation(color, -1. + min(uHover + veloColor, 1.));

  gl_FragColor = vec4(1., 1., 1., 1.);
  gl_FragColor = vec4(saturatedColor, texture.a);
}