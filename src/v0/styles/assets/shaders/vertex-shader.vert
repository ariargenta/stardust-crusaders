#version 300 es

in vec4 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;

out vec2 vTextureCoord;
out vec3 vWorldPosition;
out vec3 vNormal;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
    vWorldPosition = (uModelViewMatrix * aVertexPosition).xyz;
    vNormal = (uNormalMatrix * vec4(aVertexNormal, 0.0)).xyz;
}