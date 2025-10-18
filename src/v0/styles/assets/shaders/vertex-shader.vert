#version 300 es

#define PI 3.1415926

in vec4 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;
uniform float uSphereToCartesian;

out vec2 vTextureCoord;
out vec3 vWorldPosition;
out vec3 vObjectPosition;
out vec3 vNormal;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

    // UV coordinate mapping disabled - pass through raw coords
    vTextureCoord = aTextureCoord;

    vWorldPosition = (uModelViewMatrix * aVertexPosition).xyz;
    vObjectPosition = normalize(aVertexPosition.xyz);
    vNormal = (uNormalMatrix * vec4(aVertexNormal, 0.0)).xyz;
}