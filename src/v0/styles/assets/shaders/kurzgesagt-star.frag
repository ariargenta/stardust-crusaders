#version 300 es

#define DELTA 0.0860713
#define GAMMA 0.5772156
#define PHI 1.6180339
#define EULER 2.7182818
#define PI 3.1415926
#define TAU 6.2831853
#define FERMAT4 65537.0
#define MERSENNE8 2147483647.0
#define BITWISE_MASK 0x7FFFFFFF

precision mediump float;
uniform vec2 u_resolution;
uniform float u_time;
out vec4 fragColour;

float hash(int seed) {
    return fract(float(seed) * 0.1031);
}

vec2 getFlarePosition(int flareID) {
    int seedX = flareID * 73 + 17;
    int seedY = flareID * 37 + 89;
    float x = fract(float(seedX) * 0.1031);
    float y = fract(float(seedY) * 0.1543);
    return vec2(x, y);
}

float getFlareStartTime(int flareID) {
    int seedTime = flareID * 127 + 42;
    return hash(seedTime) * TAU;
}

vec3 renderFlare(vec2 uvCoords, vec2 flareCenter, float localTime) {
    vec3 flare = vec3(0.0);
    float distToFlare = distance(uvCoords, flareCenter);
    float speed1 = 0.15;
    float speed2 = 0.18;
    float trigger = 0.125;
    float radius1 = 0.25 * (1.0 - exp(-localTime * speed1 * 4.0));
    float delayedTime = max(0.0, localTime - (trigger / speed1));
    float radius2 = 0.25 * (1.0 - exp(-delayedTime * speed2 * 4.0));

    if (distToFlare <= radius1 && distToFlare > radius2) {
        float ringThickness = radius1 - radius2;
        float ringPosition = (distToFlare - radius2) / ringThickness;
        vec3 hotContour = vec3(1.0, 1.0, 0.0);
        vec3 warmContour = vec3(0.0, 1.0, 0.0);
        vec3 coolContour = vec3(0.0, 1.0, 1.0);
        vec3 flareColor = vec3(0.0);

        if (ringPosition < 0.33) {
            flareColor = hotContour;
        }
        else if (ringPosition < 0.66) {
            flareColor = warmContour;
        }
        else {
            flareColor = coolContour;
        }

        float fadeStart = 0.15;
        float fadeEnd = 0.25;
        float fade = 1.0 - smoothstep(fadeStart, fadeEnd, radius1);

        flare = flareColor * fade;
    }

    return flare;
}

void main() {
    vec2 uvCoords = gl_FragCoord.xy / u_resolution;
    vec3 colour = vec3(0.0, 0.0, 0.0);
    float gridSize = 0.1;
    vec2 grid = abs(fract(uvCoords / gridSize) - 0.5);
    float lineWidth = 0.02;

    if (grid.x < lineWidth || grid.y < lineWidth) {
        colour = vec3(0.1, 0.1, 0.1);
    }

    float noiseScale = 2.0;
    float timeOffset = u_time * 0.1;
    vec2 coord = uvCoords * noiseScale + vec2(timeOffset, 0.0);
    float skewFactor = 0.5 * (sqrt(3.0) - 1.0);
    float skewed = (coord.x + coord.y) * skewFactor;
    vec2 skewedCoord = coord + vec2(skewed, skewed);
    vec2 cellOrigin = floor(skewedCoord);
    vec2 cellFraction = fract(skewedCoord);
    vec2 vertex1, vertex2;

    if (cellFraction.x > cellFraction.y) {
        vertex1 = vec2(1.0, 0.0);
    }
    else {
        vertex1 = vec2(0.0, 1.0);
    }

    vertex2 = vec2(1.0, 1.0);

    vec3 debugTriangle;

    if (cellFraction.x > cellFraction.y) {
        debugTriangle = vec3(1.0, 0.0, 0.0);
    }
    else {
        debugTriangle = vec3(0.0, 0.0, 1.0);
    }

    colour += debugTriangle * 0.3;

    vec2 centre = vec2(0.5, 0.5);
    float centralTime = mod(u_time, 6.0);
    vec3 centralFlare = renderFlare(uvCoords, centre, centralTime);

    colour += centralFlare;

    const int MAX_FLARES = 4;

    for (int flareIndex = 0; flareIndex < MAX_FLARES; ++flareIndex) {
        vec2 flarePosition = getFlarePosition(flareIndex);
        float startTime = getFlareStartTime(flareIndex);
        float localTime = mod(u_time - startTime, TAU);
        float debugDist = distance(uvCoords, flarePosition);

        if (localTime < 0.0 || localTime > 6.0) {
            continue;
        }

        vec3 flareContribution = renderFlare(uvCoords, flarePosition, localTime);

        colour += flareContribution;
    }

    fragColour = vec4(colour, 1.0);
}