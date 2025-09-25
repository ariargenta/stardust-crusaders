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

vec3 stellarFlare(vec2 uvCoords, vec2 centre) {
    vec3 flare = vec3(0.0);
    float distance = distance(uvCoords, centre);
    float speed1 = 0.15;
    float speed2 = 0.18;
    float trigger = 0.125;
    float cycleTime = mod(u_time, 6.0);
    float radius1 = 0.25 * (1.0 - exp(-cycleTime * speed1 * 4.0));
    float delayedTime = max(0.0, cycleTime - (trigger / speed1));
    float radius2 = 0.25 * (1.0 - exp(-delayedTime * speed2 * 4.0));
    float circle1 = step(distance, radius1);
    float circle2 = step(distance, radius2);
    float ring = circle1 - circle2;
    float fadeStart = 0.15;
    float fadeEnd = 0.25;
    float fade = 1.0 - smoothstep(fadeStart, fadeEnd, radius1);
    float ringThickness = radius1 - radius2;
    float ringPos = (distance - radius2) / ringThickness;
    vec3 hotContour = vec3(1.0, 1.0, 0.0);
    vec3 warmContour = vec3(0.0, 1.0, 0.0);
    vec3 coolContour = vec3(0.0, 1.0, 1.0);
    vec3 ringContour = vec3(0.0);

    if (ringPos >= 0.0 && ringPos <= 1.0) {
        if (ringPos < 0.33) {
            ringContour = hotContour;
        }
        else if (ringPos < 0.66) {
            ringContour = warmContour;
        }
        else {
            ringContour = coolContour;
        }
    }

    flare = mix(flare, ringContour, ring * fade);

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

    vec2 centre = vec2(0.5, 0.5);
    vec3 existingFlare = stellarFlare(uvCoords, centre);

    colour += existingFlare;

    const int MAX_FLARES = 4;

    for (int flareIndex = 0; flareIndex < MAX_FLARES; ++flareIndex) {
        int seedX = flareIndex * 73 + 17;
        int seedY = flareIndex * 37 + 89;

        float flareX = fract(float(seedX) * 0.1031);
        float flareY = fract(float(seedY) * 0.1543);

        if (flareIndex == 0 && uvCoords.x < 0.1 && uvCoords.y > 0.9) {
            colour = vec3(flareX, 0.0, 0.0);
        }

        if (flareIndex == 1 && uvCoords.x < 0.1 && uvCoords.y > 0.8 && uvCoords.y < 0.9) {
            colour = vec3(0.0, flareY, 0.0);
        }

        int seedTime = flareIndex * 127 + 42;
        int hashTime = seedTime * int(MERSENNE8);

        hashTime = hashTime ^ (hashTime >> 16);
        hashTime = hashTime * int(MERSENNE8);
        hashTime = hashTime ^ (hashTime >> 16);

        float startTime = float(hashTime & BITWISE_MASK) / MERSENNE8 * TAU;
        float localTime = mod(u_time - startTime, TAU);
        float debugDist = distance(uvCoords, vec2(flareX, flareY));

        if (debugDist < 0.02) {
            colour += vec3(1.0, 0.0, 1.0);
        }

        if (localTime < 0.0 || localTime > 6.0) {
            continue;
        }

        vec2 flareCenter = vec2(flareX, flareY);
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
            } else if (ringPosition < 0.66) {
                flareColor = warmContour;
            } else {
                flareColor = coolContour;
            }

            float fadeStart = 0.15;
            float fadeEnd = 0.25;
            float fade = 1.0 - smoothstep(fadeStart, fadeEnd, radius1);

            flareColor = flareColor * fade;
            colour += flareColor;
        }
        else {
            continue;
        }
    }

    fragColour = vec4(colour, 1.0);
}