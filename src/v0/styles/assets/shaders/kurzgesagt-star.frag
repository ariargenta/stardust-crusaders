#version 300 es
#define DELTA 0.0860713
#define GAMMA 0.5772156
#define PHI 1.6180339
#define EULER 2.7182818
#define PI 3.1415926
#define TAU 6.2831853
#define FERMAT4 65537.0
#define MERSENNE8 2147483647.0

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
    float cycleTime = mod(u_time, 7.0);
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
        } else if (ringPos < 0.66) {
            ringContour = warmContour;
        } else {
            ringContour = coolContour;
        }
    }

    flare = mix(flare, ringContour, ring * fade);

    return flare;
}

void main() {
    vec2 uvCoords = gl_FragCoord.xy / u_resolution;
    vec2 centre = vec2(0.5, 0.5);
    vec3 colour = stellarFlare(uvCoords, centre);

    fragColour = vec4(colour, 1.0);
}