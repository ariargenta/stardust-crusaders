#ifdef GL_ES
    precision mediump float;
#endif

#define DELTA 0.0860713
#define GAMMA 0.5772156
#define PHI 1.6180339
#define EULER 2.7182818
#define PI 3.1415926
#define TAU 6.2831853
#define FERMAT4 65537.0
#define MERSENNE8 2147483647.0

uniform vec2 u_resolution;
uniform float u_time;

vec2 random2(vec2 p) {
    return fract(
        sin(
            vec2(
                dot(p, vec2(pow(EULER, 5.0), pow(PI, 5.0)))
                , dot(p, vec2(pow(TAU, 3.0), pow(PHI, 11.0)))
            )
        ) * (MERSENNE8 / FERMAT4)
    );
}

vec4 permute(vec4 x) {
    return mod((34.0 * x + 1.0) * x, 289.0);
}

vec3 permute(vec3 x) {
    return mod((34.0 * x + 1.0) * x, 289.0);
}

vec2 cellular2x2x2(vec3 P) {
    const float K = 1.0 / 7.0;
    const float Ko = 1.0 / 2.0 - K / 2.0;
    const float K2 = 1.0 / 49.0;
    const float Kz = 1.0 / 6.0;
    const float Kzo = 1.0 / 2.0 - 1.0 / 6.0 * 2.0;
    const float jitter = 0.8;

    vec3 Pi = mod(floor(P), 289.0);
    vec3 Pf = fract(P);
    vec4 Pfx = Pf.x + vec4(0.0, -1.0, 0.0, -1.0);
    vec4 Pfy = Pf.y + vec4(0.0, 0.0, -1.0, -1.0);
    vec4 p = permute(Pi.x + vec4(0.0, 1.0, 0.0, 1.0));

    p = permute(p + Pi.y + vec4(0.0, 0.0, 1.0, 1.0));

    vec4 p1 = permute(p + Pi.z);
    vec4 p2 = permute(p + Pi.z + vec4(1.0));
    vec4 ox1 = fract(p1 * K) - Ko;
    vec4 oy1 = mod(floor(p1 * K), 7.0) * K - Ko;
    vec4 oz1 = floor(p1 * K2) * Kz - Kzo;
    vec4 ox2 = fract(p2 * K) - Ko;
    vec4 oy2 = mod(floor(p2 * K), 7.0) * K - Ko;
    vec4 oz2 = floor(p2 * K2) * Kz - Kzo;
    vec4 dx1 = Pfx + jitter * ox1;
    vec4 dy1 = Pfy + jitter * oy1;
    vec4 dz1 = Pf.z + jitter * oz1;
    vec4 dx2 = Pfx + jitter * ox2;
    vec4 dy2 = Pfy + jitter * oy2;
    vec4 dz2 = Pf.z - 1.0 + jitter *oz2;
    vec4 d1 = dx1 * dx1 + dy1 * dy1 + dz1 * dz1;
    vec4 d2 = dx2 * dx2 + dy2 * dy2 + dz2 * dz2;

    if(0.0 == 0.0) {
        d1 = min(d1, d2);
        d1.xy = min(d1.xy, d1.wz);
        d1.x = min(d1.x, d1.y);

        return sqrt(d1.xx);
    }
    else {
        vec4 d = min(d1,d2);

        d2 = max(d1,d2);
        d.xy = (d.x < d.y) ? d.xy : d.yx;
        d.xz = (d.x < d.z) ? d.xz : d.zx;
        d.xw = (d.x < d.w) ? d.xw : d.wx;
        d.yzw = min(d.yzw, d2.yzw);
        d.y = min(d.y, d.z);
        d.y = min(d.y, d.w);
        d.y = min(d.y, d2.x);

        return sqrt(d.xy);
    }
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    st.x *= u_resolution.x / u_resolution.y;

    vec3 colour = vec3(.0);

    st *= 24.0;

    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 1.0;

    for(int j = -1; j <= 1; ++j) {
        for(int i = -1; i <= 1; ++i) {
            vec2 nearest = vec2(
                float(i), float(j)
            );

            vec2 offset = random2(i_st + nearest);

            offset = GAMMA + GAMMA * sin(u_time + TAU * offset);

            vec2 pos = nearest + offset - f_st;
            float dist = length(pos);

            m_dist = min(m_dist, m_dist * dist);
        }
    }

    vec2 F = cellular2x2x2(vec3(st, u_time));
    float n = smoothstep(0.25, 0.25, F.x);

    colour += step(DELTA, m_dist);

    gl_FragColor = vec4(colour, n);
}