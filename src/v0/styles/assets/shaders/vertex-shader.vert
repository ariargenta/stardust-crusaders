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
out vec3 vNormal;

void main(void) {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

    float sphericalU = aTextureCoord.x;
    float sphericalV = aTextureCoord.y;

    if (uSphereToCartesian < 0.5) {
        vTextureCoord = vec2(sphericalU, sphericalV);
    }
    else {
        float theta = sphericalU * 2.0 * PI;
        float phi = sphericalV * PI;
        float k = 2.0 / (1.0 + cos(phi));
        float cartesianU = 0.5 + (k * sin(phi) * cos(theta)) / 4.0;
        float cartesianV = 0.5 + (k * sin(phi) * sin(theta)) / 4.0;

        vTextureCoord = vec2(
            clamp(cartesianU, 0.0, 1.0)
            , clamp(cartesianV, 0.0, 1.0)
        );
    }

    vWorldPosition = (uModelViewMatrix * aVertexPosition).xyz;
    vNormal = (uNormalMatrix * vec4(aVertexNormal, 0.0)).xyz;
}