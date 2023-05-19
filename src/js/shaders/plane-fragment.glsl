precision mediump float;

uniform sampler2D uTexture;
uniform float uHover;
uniform float uVelo;
uniform float uOpacity;
uniform vec2 uTextureSize;

varying vec2 vUv;
varying vec2 vSize;

vec3 adjustSaturation(vec3 color, float value) {
  const vec3 luminosityFactor = vec3(0.2126, 0.7152, 0.0722);
  vec3 grayscale = vec3(dot(color, luminosityFactor));

  return mix(grayscale, color, 1.0 + value);
}

vec2 getUV(vec2 uv, vec2 textureSize, vec2 quadSize){
  vec2 tempUv = uv;

  tempUv -= vec2(0.5);

  float quadAspect = quadSize.x / quadSize.y;
  float textureAspect = textureSize.x / textureSize.y;

  if(quadAspect < textureAspect){
    tempUv *= vec2(quadAspect / textureAspect, 1.);
  }else{
    tempUv *= vec2(1., textureAspect / quadAspect);
  }

  tempUv += vec2(0.5);

  return tempUv;
}

void main(){
  vec2 correctUv = getUV(vUv, uTextureSize, vSize);

  vec4 texture = texture2D(uTexture, correctUv);
  vec3 color = texture.rgb;

  vec3 saturatedColor = adjustSaturation(color, -1. + min(uHover + uVelo, 1.));

  gl_FragColor = vec4(saturatedColor, texture.a) * uOpacity;
}