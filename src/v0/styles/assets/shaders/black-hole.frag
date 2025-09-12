#ifdef GL_ES
    precision mediump float;
#endif

#define sat(a) clamp(a, 0.0, 1.0)
#define PI 3.1415926535897932384626433
#define MAX_STEPS 512
#define BLOOM_SAMPLES 20

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_mouse;
uniform float u_timeDelta;
uniform float u_frameRate;
uniform int u_frame;
uniform float u_channelTime[4];
uniform vec3 u_channelResolution[4];
uniform sampler2D u_channel0;
uniform sampler2D u_channel1;
uniform sampler2D u_channel2;
uniform sampler2D u_channel3;
uniform vec4 u_date;
uniform float u_sampleRate;


mat2 r2d(float a) {
    float c = cos(a);
    float s = sin(a);

    return mat2(c, -s, s, c);
}

vec2 _min(vec2 a, vec2 b) {
    if(a.x < b.x) {
        return a;
    }

    return b;
}

vec2 map(vec3 p) {
    vec2 acc = vec2(1000.0, -1.0);

    acc = _min(acc, vec2(length(p) - 1.0, 0.0));

    float plane = max(abs(p.y) - 0.01, length(p.xz) - 3.0);

    acc = _min(acc, vec2(plane, 1.0));

    return acc;
}

vec3 getCam(vec3 rd, vec2 uv) {
    float fov = 1.0;
    vec3 r = normalize(cross(rd, vec3(0.0, 1.0, 0.0)));
    vec3 u = normalize(cross(rd, r));

    return normalize(rd + fov * (r * uv.x + u * uv.y));
}

vec3 gradient(float f) {
    vec3 colors[8];

    colors[0] = vec3(1.0, 1.0, 1.0);
    colors[1] = vec3(1.0, 1.0, 1.0);
    colors[2] = vec3(1.000, 0.784, 0.322);
    colors[3] = vec3(1.000, 0.682, 0.322);
    colors[4] = vec3(0.973, 0.325, 0.051);
    colors[5] = vec3(0.882, 0.176, 0.529) * 0.7;
    colors[6] = vec3(0.349, 0.141, 0.600) * 0.5;
    colors[7] = vec3(0.349, 0.141, 0.600) * 0.25;
    f = sat(f);

    int idx = int(7.0 * f);
    vec3 result;

    if(idx == 0) {
        result = colors[0];
    }
    else if(idx == 1) {
        result = colors[1];
    }
    else if(idx == 2) {
        result = colors[2];
    }
    else if(idx == 3) {
        result = colors[3];
    }
    else if(idx == 4) {
        result = colors[4];
    }
    else if(idx == 5) {
        result = colors[5];
    }
    else if(idx == 6) {
        result = colors[6];
    }
    else {
        result = colors[7];
    }

    return result;
}

vec3 finalPos;
vec3 accCol;

vec3 trace(vec3 ro, vec3 rd) {
    accCol = vec3(0.0);
    finalPos = ro;

    vec3 p = ro;

    for(int i = 0; i < MAX_STEPS; ++i) {
        vec2 res = map(p);

        if(res.x < 0.01) {
            if(res.y == 0.0) {
                accCol *= 0.75;
            }

            return vec3(res.x, distance(p, ro), res.y);
        }

        rd = normalize(rd - normalize(p) * 0.01 * pow(1.0 - sat(length(p) - 1.5), 5.5));
        accCol += 0.007 * gradient(length(p) - 1.6) * (1.0 - sat(res.x / 0.5));
        p += rd * res.x * 0.15;
        finalPos = p;
    }

    return vec3(-1.0);
}

vec3 rdr(vec2 uv) {
    vec3 col = vec3(0.078, 0.043, 0.157) * 0.35;

    uv *= r2d(0.3);

    float dist = 9.0 + sin(u_time * 0.35);
    float t = u_time * 0.1;
    vec3 ro = vec3(dist * cos(t), -2.0 + sin(u_time * 0.5), dist * sin(t));
    vec3 ta = vec3(0.0, 0.0, 0.0);
    vec3 rd = normalize(ta - ro);

    rd = getCam(rd, uv);

    vec3 res = trace(ro, rd);
    bool isHorizon = false;

    if(res.y > 0.0) {
        vec3 p = ro + rd * res.x;
        float idx = floor(length(finalPos) * 7.0);

        if(res.z == 1.0) {
            col += gradient(length(finalPos) - 1.6) * mix(0.7, 1.0, (sat(length(finalPos) - 1.5)) * sat(400.0 * sin(0.25 * pow(idx, 0.75) * u_time + 5.0 * atan(finalPos.z, finalPos.x))));
        }
        else {
            col = vec3(0.0);
            isHorizon = true;
        }
    }

    col += accCol;

    vec3 finalDir = normalize(ro - finalPos);

    if(!isHorizon) {
        col += 1.5 * sat(length(uv * 1.5)) * pow(texture2D(u_channel0, 3.0 * vec2(atan(finalDir.z, finalDir.x), acos(finalDir.y))).r, 10.0);

        vec2 uvSky = 2.0 * vec2(atan(finalDir.z, finalDir.x), acos(finalDir.y));

        col += 1.2 * vec3(0.984, 0.639, 0.455) * pow(texture2D(u_channel0, uvSky).x, 2.0) * (1.0 - sat(5.0 * abs(dot(finalDir, vec3(0.0, 1.0, 0.0)))));
    }

    return col;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = (fragCoord - vec2(0.5) * u_resolution.xy) / u_resolution.xx;

    uv *= 1.5;

    vec3 col = rdr(uv);

    col = pow(col, vec3(1.2));

    fragColor = vec4(col, 1.0);
}

vec3 doBloom(vec2 uv, float blur, float threshold) {
    vec3 col;
    float fcnt = float(BLOOM_SAMPLES);

    for(int i = 0; i < BLOOM_SAMPLES; ++i) {
        float fi = float(i);
        float coef = fi / fcnt;
        float sz = 1.0 + pow(coef, 2.0) * blur;
        float samplePerTurn = 3.0;
        float an = (fi / (fcnt / samplePerTurn)) * PI;
        vec2 p = uv - vec2(sin(an), cos(an)) * an * blur * 0.1;
        vec3 sample = texture2D(u_channel0, p).xyz;

        if(length(sample) > threshold) {
            col += sample;
        }
    }

    return col / float(BLOOM_SAMPLES);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 cuv = (gl_FragCoord.xy - vec2(0.5) * u_resolution.xy) / u_resolution.xx;
    vec3 col = texture2D(u_channel0, uv).xyz;
    float bloomIntensity = 224.0 / 640.0;
    vec3 bloomSample = doBloom(uv, 5.0 / 360.0, 237.0 / 640.0);

    bloomSample = pow(bloomSample, vec3(0.8));
    col = col + (bloomSample * bloomIntensity);
    col = mix(col, col.zyx, pow(sat(length(cuv * 2.0)), 4.0));

    gl_FragColor = vec4(col, 1.0);
}