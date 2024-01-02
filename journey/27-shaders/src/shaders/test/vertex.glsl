uniform vec2 uFrequency;
uniform float uTime;

attribute float aRandom;

varying float vRandom;
varying vec2 vUv;
varying float vElevation;

void main()
{
    vRandom = aRandom;
    vUv = uv;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    // float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
    // elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;
    // vElevation = elevation;

    modelPosition.z += sin(modelPosition.x * uFrequency.x - uTime * vRandom) * 0.1;
    modelPosition.z += sin(modelPosition.y * uFrequency.y - uTime * vRandom) * 0.1;
    // modelPosition.z += elevation;
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;
}
