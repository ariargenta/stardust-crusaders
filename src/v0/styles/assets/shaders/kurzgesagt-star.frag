#ifdef GL_ES
    precision mediump float;
#endif

#define PI 3.1415926535897932384626433

uniform vec2 u_resolution;
uniform float u_time;

vec2 skew(vec2 scaledCoords) {
    vec2 skewedCoords = vec2(0.0);
    float sqrtThree = sqrt(3.0);
    float xScaleFactor = 2.0 / sqrtThree;
    float skewFactor = 1.0 / sqrtThree;

    skewedCoords.x = xScaleFactor * scaledCoords.x;

    float skewOffset = skewFactor * skewedCoords.x;

    skewedCoords.y = scaledCoords.y + skewOffset;

    return skewedCoords;
}

vec3 simplexGrid(vec2 scaledCoords) {
    vec3 gridVertices = vec3(0.0);
    vec2 skewedCoords = skew(scaledCoords);
    vec2 fractCoords = fract(skewedCoords);

    if (fractCoords.x > fractCoords.y) {
        float vertex1 = fractCoords.x;
        float vertex2 = fractCoords.y - fractCoords.x;

        gridVertices.xy = 1.0 - vec2(vertex1, vertex2);
        gridVertices.z = fractCoords.y;
    }
    else {
        float vertex1 = fractCoords.x - fractCoords.y;
        float vertex2 = fractCoords.y;

        gridVertices.yz = 1.0 - vec2(vertex1, vertex2);
        gridVertices.x = fractCoords.x;
    }

    vec3 normalisedVertices = fract(gridVertices);

    return normalisedVertices;
}

void main() {
    vec2 normalisedCoords = gl_FragCoord.xy / u_resolution.xy;
    vec3 outputColour = vec3(0.0);
    vec2 scaledCoords = normalisedCoords * 10.0;
    vec2 originalGridFract = fract(scaledCoords);

    outputColour.rg = originalGridFract;

    vec2 skewedCoords = skew(scaledCoords);
    vec2 skewedGridFract = fract(skewedCoords);

    outputColour.rg = skewedGridFract;

    vec3 simplexCoords = simplexGrid(scaledCoords);

    outputColour = simplexCoords;
    gl_FragColor = vec4(outputColour, 1.0);
}