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
uniform sampler2D uSampler;

in vec2 vTextureCoord;
in vec3 vWorldPosition;
in vec3 vNormal;

out vec4 fragColour;

float hash(int seed) {
    return fract(float(seed) * 0.1031);
}

float hash2D(vec2 coord) {
    return mod(coord.x + coord.y * 57.0, 12.0);
}

vec2[12] getNoiseGradients() {
    return vec2[12](
        vec2(1,1)
        , vec2(-1,1)
        , vec2(1,-1)
        , vec2(-1,-1)
        , vec2(1,0)
        , vec2(-1,0)
        , vec2(0,1)
        , vec2(0,-1)
        , vec2(1,1)
        , vec2(-1,1)
        , vec2(1,-1)
        , vec2(-1,-1)
    );
}

float generateSimplexNoise(vec2 coord) {
    float skewFactor = 0.5 * (sqrt(3.0) - 1.0);
    float skewed = (coord.x + coord.y) * skewFactor;
    vec2 skewedCoord = coord + vec2(skewed);
    vec2 cellOrigin = floor(skewedCoord);
    vec2 cellFraction = fract(skewedCoord);
    vec2 vertex1 = (cellFraction.x > cellFraction.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec2 vertex2 = vec2(1.0, 1.0);
    float unskewFactor = (3.0 - sqrt(3.0)) / 6.0;
    vec2 vertex0 = vec2(0.0, 0.0);
    float unskew0 = (cellOrigin.x + vertex0.x + cellOrigin.y + vertex0.y) * unskewFactor;
    vec2 euclidean0 = cellOrigin + vertex0 - vec2(unskew0);
    vec2 distance0 = coord - euclidean0;
    float unskew1 = (cellOrigin.x + vertex1.x + cellOrigin.y + vertex1.y) * unskewFactor;
    vec2 euclidean1 = cellOrigin + vertex1 - vec2(unskew1);
    vec2 distance1 = coord - euclidean1;
    float unskew2 = (cellOrigin.x + vertex2.x + cellOrigin.y + vertex2.y) * unskewFactor;
    vec2 euclidean2 = cellOrigin + vertex2 - vec2(unskew2);
    vec2 distance2 = coord - euclidean2;
    vec2[12] gradients = getNoiseGradients();
    int hash0 = int(hash2D(cellOrigin + vertex0));
    int hash1 = int(hash2D(cellOrigin + vertex1));
    int hash2 = int(hash2D(cellOrigin + vertex2));
    vec2 grad0 = gradients[hash0];
    vec2 grad1 = gradients[hash1];
    vec2 grad2 = gradients[hash2];
    float falloff0 = max(0.0, 0.5 - dot(distance0, distance0));
    float contribution0 = falloff0 * falloff0 * falloff0 * falloff0 * dot(grad0, distance0);
    float falloff1 = max(0.0, 0.5 - dot(distance1, distance1));
    float contribution1 = falloff1 * falloff1 * falloff1 * falloff1 * dot(grad1, distance1);
    float falloff2 = max(0.0, 0.5 - dot(distance2, distance2));
    float contribution2 = falloff2 * falloff2 * falloff2 * falloff2 * dot(grad2, distance2);
    float totalNoise = 70.0 * (contribution0 + contribution1 + contribution2);

    return (totalNoise + 1.0) * 0.5;
}

vec3 visualizeNoise(float normalizedNoise) {
    float flareThreshold = 0.6;

    if (normalizedNoise <= 0.4) {
        return vec3(0.0, 0.0, normalizedNoise / 0.4);
    }
    else if (normalizedNoise <= flareThreshold) {
        float t = (normalizedNoise - 0.4) / (flareThreshold - 0.4);

        return vec3(t, 0.0, 1.0 - t);
    }
    else {
        float intensity = (normalizedNoise - flareThreshold) / (1.0 - flareThreshold);

        return vec3(1.0, intensity, 1.0);
    }
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

struct FlareParams {
    float speed1;
    float speed2;
    float trigger;
    float maxRadius1;
    float maxRadius2;
    float fadeStart;
    float fadeEnd;
};

vec3 getFlareColor(float ringPosition) {
    vec3 hotContour = vec3(1.0, 1.0, 0.0);
    vec3 warmContour = vec3(0.0, 1.0, 0.0);
    vec3 coolContour = vec3(0.0, 1.0, 1.0);

    if (ringPosition < 0.33) {
        return hotContour;
    }
    else if (ringPosition < 0.66) {
        return warmContour;
    }
    else {
        return coolContour;
    }
}

vec3 renderFlare(vec2 uvCoords, vec2 flareCenter, float localTime) {
    FlareParams params = FlareParams(
        0.075, 0.08, 0.075, 0.1, 0.25, 0.15, 0.25
    );

    float distToFlare = distance(uvCoords, flareCenter);
    float radius1 = params.maxRadius1 * (1.0 - exp(-localTime * params.speed1 * 4.0));
    float delayedTime = max(0.0, localTime - (params.trigger / params.speed1));
    float radius2 = params.maxRadius2 * (1.0 - exp(-delayedTime * params.speed2 * 4.0));

    if (distToFlare <= radius1 && distToFlare > radius2) {
        float ringThickness = radius1 - radius2;
        float ringPosition = (distToFlare - radius2) / ringThickness;
        vec3 flareColor = getFlareColor(ringPosition);
        float fade = 1.0 - smoothstep(params.fadeStart, params.fadeEnd, radius1);

        return flareColor * fade;
    }

    return vec3(0.0);
}

float calculateFlareInfluence(vec2 flarePosition, float noiseScale, float timeOffset) {
    vec2 flareCoord = flarePosition * noiseScale + vec2(timeOffset, 0.0);
    float flareSkewFactor = 0.5 * (sqrt(3.0) - 1.0);
    float flareSkewed = (flareCoord.x + flareCoord.y) * flareSkewFactor;
    vec2 flareSkewedCoord = flareCoord + vec2(flareSkewed);
    vec2 flareCell = floor(flareSkewedCoord);
    float flareHash = hash2D(flareCell) / 12.0;

    return smoothstep(0.3, 0.8, flareHash + sin(u_time * 0.5) * 0.3);
}

vec3 renderAllFlares(vec2 uvCoords, float noiseScale, float timeOffset) {
    vec3 totalFlares = vec3(0.0);

    const int MAX_FLARES = 64;

    for (int flareIndex = 0; flareIndex < MAX_FLARES; ++flareIndex) {
        vec2 flarePosition = getFlarePosition(flareIndex);
        float startTime = getFlareStartTime(flareIndex);
        float localTime = mod(u_time - startTime, TAU);

        if (localTime < 0.0 || localTime > 6.0) {
            continue;
        }

        float flareNoiseInfluence = calculateFlareInfluence(
            flarePosition, noiseScale, timeOffset
        );

        if (flareNoiseInfluence > 0.4) {
            vec3 flareContribution = renderFlare(
                uvCoords, flarePosition, localTime
            );

            totalFlares += flareContribution * flareNoiseInfluence;
        }
    }

    return totalFlares;
}

vec3 composeKurzgesagtEffect(vec2 uvCoords) {
    vec3 colour = vec3(0.0, 0.0, 0.0);
    float noiseScale = 2.0;
    float timeOffset = u_time * 0.1;
    vec2 coord = uvCoords * noiseScale + vec2(timeOffset, 0.0);
    float normalizedNoise = generateSimplexNoise(coord);
    vec3 noiseViz = visualizeNoise(normalizedNoise);
    colour += noiseViz * 0.3;
    vec2 centre = vec2(0.5, 0.5);
    float centralTime = mod(u_time, 6.0);
    vec3 centralFlare = renderFlare(uvCoords, centre, centralTime);

    colour += centralFlare;

    vec3 distributedFlares = renderAllFlares(
        uvCoords, noiseScale, timeOffset
    );

    colour += distributedFlares;

    return colour;
}

void main() {
    vec2 uvCoords = vTextureCoord;
    vec3 finalColor = composeKurzgesagtEffect(uvCoords);

    fragColour = vec4(finalColor, 1.0);
}