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

vec2 random2( vec2 p ) {
    return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;
    vec3 color = vec3(.0);

    st *= 5.;

    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float m_dist = 1.;
    for (int j= -1; j <= 1; j++ ) {
        for (int i= -1; i <= 1; i++ ) {
            vec2 neighbor = vec2(float(i),float(j));
            vec2 offset = random2(i_st + neighbor);
            offset = 0.5 + 0.5*sin(u_time + 6.2831*offset);
            vec2 pos = neighbor + offset - f_st;
            float dist = length(pos);
            m_dist = min(m_dist, m_dist*dist);
        }
    }

    color += step(0.060, m_dist);

    gl_FragColor = vec4(color,1.0);
}