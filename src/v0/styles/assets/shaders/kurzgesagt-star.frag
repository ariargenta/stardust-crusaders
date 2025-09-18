#ifdef GL_ES
    precision mediump float;
#endif

#define GAMMA 0.5772156
#define PHI 1.6180339
#define EULER 2.7182818
#define PI 3.1415926
#define DELTA 4.6692016
#define TAU 6.2831853
#define FERMAT4 65537.0
#define MERSENNE8 2147483647.0

uniform vec2 u_resolution;
uniform float u_time;

vec2 random2(vec2 cellCoords) {
    return fract(sin(vec2(dot(cellCoords,vec2(127.1,311.7)),dot(cellCoords, vec2(269.5,183.3)))) * 43758.5453);
}

void main() {
    vec2 screenCoords = gl_FragCoord.xy / u_resolution.xy;

    screenCoords.x *= u_resolution.x / u_resolution.y;

    vec3 outputColour = vec3(0.0);
    vec2 scaledCoords = screenCoords * 16.0;
    vec2 currentCellIndex = floor(scaledCoords);
    vec2 positionInCell = fract(scaledCoords);
    float closestDistance = 1.0;

    for (int neighborY = -1; neighborY <= 1; ++neighborY) {
        for (int neighborX = -1; neighborX <= 1; ++neighborX) {
            vec2 neighbor = vec2(float(neighborY),float(neighborX));

            vec2 neighborOffset = random2(currentCellIndex + neighbor);

            neighborOffset = 0.5 + 0.5 * sin(u_time + 6.2831 * neighborOffset);

            vec2 pos = neighbor + neighborOffset - positionInCell;

            float dist = length(pos);

            closestDistance = min(closestDistance, closestDistance * dist);
        }
    }

    outputColour += step(0.05, closestDistance);

    gl_FragColor = vec4(outputColour,1.0);
}