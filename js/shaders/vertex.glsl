uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec2 uResolution;
uniform float uProgress;
uniform vec4 uCorners;
uniform float uTime;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;

void main(){
  float PI = 3.1415926;

  vec3 newPos = position;

  float sine = sin(PI * uProgress);

  float wave = sine * 0.1 * sin(length(uv) * 5. );

  vec4 startPosition =  modelMatrix * vec4(newPos, 1.);
  vec4 endPosition = vec4(position, 1.);
  endPosition.x *= uResolution.x;
  endPosition.y *= uResolution.y;

  float cornersProgress = mix(    
    mix(uCorners.x, uCorners.w, uv.x),
    mix(uCorners.z, uCorners.y, uv.x),
    uv.y
  );

  vec4 mixPosition = mix(startPosition, endPosition, cornersProgress + wave);

  vUv = uv;

  gl_Position = projectionMatrix * viewMatrix * mixPosition;
}