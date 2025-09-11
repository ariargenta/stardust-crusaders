#ifdef GL_ES
    precision mediump float;
#endif

#define PI 3.1415926535897932384626433

uniform vec2 u_resolution;
uniform float u_time;

float sdfCircle(vec2 p, float radius) {
    return length(p) - radius;
}

float sdfRing(vec2 p, float radius, float thickness) {
    float d = length(p) - radius;

    return abs(d) - thickness;
}

vec3 calculateFlares(vec2 uv, float time) {
    vec3 color = vec3(0.0);

    for (int i = 0; i < 5; ++i) {
        float offset = float(i) * 0.3;
        float velocity = 0.5;
        float radius = mod(time * velocity + offset, 2.0);
        float ring = sdfRing(uv, radius, 0.02);
        float intensity = 1.0 - smoothstep(0.0, 0.02, abs(ring));

        intensity *= exp(-radius * 2.0);
        color += vec3(1.0, 0.8, 0.3) * intensity;
    }

    return color;
}

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

vec3 calculateCorona(vec3 p, float time) {
    float angle = atan(p.y, p.x);
    float radius = length(p.xy);
    float distorsion = noise(vec2(angle * 3.0, time * 0.3));
    float coronaRadius = 0.5 + distorsion * 0.2;
    float corona = smoothstep(coronaRadius, coronaRadius + 0.3, radius);

    corona *= 1.0 - smoothstep(coronaRadius, coronaRadius + 0.5, radius);

    corona *= 0.8 + 0.2 * sin(time * 2.0 + angle * 4.0);

    return vec3(1.0, 0.9, 0.7) * corona;
}


float meatball(vec2 p, vec2 centre, float radius) {
    float d = length(p - centre);

    return radius / (d * d + 0.01);
}

vec3 calculateSurface(vec2 uv, float time) {
    float field = 0.0;

    for (int i = 0; i < 8; ++i) {
        float t = float(i) * 0.785;

        vec2 centre = vec2(
            cos(t + time + 0.5) * 0.3 + sin(time * 1.3 + t) * 0.1,
            sin(t + time * 0.7) * 0.3 + cos(time * 1.1 + t) * 0.1
        );

        field += meatball(uv, centre, 0.05);
    }

    float shape = smoothstep(0.8, 1.2, field);
    float mask = 1.0 - smoothstep(0.48, 0.5, length(uv));

    return vec3(1.0, 0.6, 0.2) * shape * mask;
}

vec2 particlePosition(int id, float time) {
    float seed = float(id) * 17.23;

    vec2 velocity = vec2(sin(seed * 1.17) * 0.5, cos(seed * 2.31) * 0.5);

    vec2 initPos = vec2(sin(seed * PI) * 0.3, cos(seed * 4.27) * 0.3);

    vec2 pos = initPos + velocity * time;

    if(length(pos) > 0.45) {
        pos = normalize(pos) * 0.45 - (pos - normalize(pos) * 0.45);
    }

    return pos;
}

vec3 kurzgesagtColorMap(float t, vec3 colorBase) {
    t = floor(t * 4.0) / 4.0;

    if(t < 0.25) {
        return colorBase * 0.6;
    }
    else if(t < 0.5) {
        return colorBase * 0.8;
    }
    else if (t < 0.75) {
        return colorBase;
    }
    else {
        return colorBase * 1.2;
    }
}

void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);

    float disc = 1.0 - smoothstep(0.48, 0.5, length(uv));
    vec3 color = vec3(1.0, 0.8, 0.4) * disc;

    color += calculateFlares(uv, u_time) * 0.6;
    color += calculateCorona(vec3(uv, 0.0), u_time) * 0.4;
    color = max(color, calculateSurface(uv, u_time));

    color = kurzgesagtColorMap(length(color), vec3(1.0, 0.7, 0.3));

    float brightness = pow(disc, 3.0);
    color += vec3(1.0) * brightness * 0.5;

    gl_FragColor = vec4(color, 1.0);
}