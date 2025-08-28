varying highp vec2 vTextureCoord;
varying highp vec3 vLighting;

uniform sampler2D uSampler;

void main(void) {
    highp vec4 textelColor = texture2D(uSampler, vTextureCoord);
    gl_FragColor = vec4(textelColor.rgb * vLighting, textelColor.a);
}