'use strict';

const canvas = document.getElementById('gl-canvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
    throw new Error('WebGL2 not supported');
}

const vs = `#version 300 es
    uniform int numVerts;
    uniform vec2 resolution;
    uniform float u_radius;

    #define PI radians(180.0)

    void main() {
        int numSlices = 24;
        int sliceId = gl_VertexID/3;
        int triVertexId = gl_VertexID%3;
        int edge = triVertexId + sliceId;
        float angleU = float(edge)/float(numSlices);
        float angle = angleU*PI*2.0;
        float radius = (triVertexId == 0) ? 0.0 : u_radius;
        vec2 pos = vec2(cos(angle), sin(angle))*radius;
        float aspect = resolution.y/resolution.x;
        vec2 scale = vec2(aspect, 1.0);
        gl_Position = vec4(pos*scale, 0.0, 1.0);
    }
`;

const fs = `#version 300 es
    precision highp float;
    out vec4 outColor;

    void main() {
        outColor = vec4(0.0, 0.0, 1.0, 1.0);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error('Shader compile failed:\n' + info);
    }

    return shader;
}

function createProgram(gl, vsrc, fsrc) {
    const vsh = createShader(gl, gl.VERTEX_SHADER, vsrc);
    const fsh = createShader(gl, gl.FRAGMENT_SHADER, fsrc);
    const program = gl.createProgram();

    gl.attachShader(program, vsh);
    gl.attachShader(program, fsh);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program);

        gl.deleteProgram(program);

        throw new Error('Program link failed:\n' + info);
    }

    return program;
}

function resizeCanvasToDisplaySize(gl) {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    const displayWidth = Math.floor(gl.canvas.clientWidth * dpr);
    const displayHeight = Math.floor(gl.canvas.clientHeight * dpr);

    if (gl.canvas.width !== displayWidth || gl.canvas.height !== displayHeight) {
        gl.canvas.width = displayWidth;
        gl.canvas.height = displayHeight;

        return true;
    }

    return false;
}

const program = createProgram(gl, vs, fs);
const numVertsLoc = gl.getUniformLocation(program, 'numVerts');
const resolutionLoc = gl.getUniformLocation(program, 'resolution');
const numVerts = 24*3;
const radiusLoc = gl.getUniformLocation(program, "u_radius");

gl.clearColor(0.0, 0.0, 0.0, 1.0);

function render(time) {
    time = (time || 0)*0.001;

    resizeCanvasToDisplaySize(gl);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform1i(numVertsLoc, numVerts);
    gl.uniform2f(resolutionLoc, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(radiusLoc, 0.25);
    gl.drawArrays(gl.TRIANGLES, 0, numVerts);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);