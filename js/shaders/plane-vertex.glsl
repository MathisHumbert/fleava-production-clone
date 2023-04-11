uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform vec2 uResolution;
uniform float uProgress;
uniform vec4 uCorners;
uniform vec2 uQuadSize;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;
varying vec2 vSize;

void main(){
  float PI = 3.1415926;

  float sine = sin(PI * uProgress);

  float wave = sine * 0.1 * sin(length(uv) * 5. );

  vec4 startPosition =  modelMatrix * vec4(position, 1.);
  vec4 endPosition = vec4(position, 1.);
  endPosition.x *= uResolution.x;
  endPosition.y *= uResolution.y;

  float cornersProgress = mix(    
    mix(uCorners.x, uCorners.w, uv.x),
    mix(uCorners.z, uCorners.y, uv.x),
    uv.y
  );

  vec4 mixPosition = mix(startPosition, endPosition, cornersProgress + wave);

  gl_Position = projectionMatrix * viewMatrix * mixPosition;

  vSize = mix(uQuadSize, uResolution, cornersProgress);
  vUv = uv;
}

