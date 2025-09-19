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

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;

    st.x *= u_resolution.x / u_resolution.y;

    vec3 colour = vec3(.0);

    st *= 16.0;

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

    colour += step(DELTA, m_dist);

    gl_FragColor = vec4(colour,1.0);
}