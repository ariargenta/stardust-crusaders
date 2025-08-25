let segments = 64;

function drawFrame(gl, programInfo, vao, vertexCount) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(programInfo.program);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);
}

function initBuffers(gl) {
    const positionBuffer = initPositionBuffer(gl);
    const textureCoordBuffer = initTextureBuffer(gl);

    return {
        position: positionBuffer
        , textureCoord: textureCoordBuffer,
    };
}

function initPositionBuffer(gl) {
    const positions = [];

    positions.push(0, 0);

    for(let i = 0; i <= segments; ++i) {
        const theta = (i / segments) * Math.PI * 2;
        const abscissa = Math.cos(theta);
        const ordinate = Math.sin(theta);

        positions.push(abscissa, ordinate);
    }

    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    return positionBuffer;
}

function initTextureBuffer(gl) {
    const textureCoordinates = [];

    textureCoordinates.push(0.5, 0.5);

    for(let i = 0; i <= segments; ++i) {
        const theta = (i / segments) * Math.PI * 2;
        const abscissa = 0.5 + 0.5 * Math.cos(theta);
        const ordinate = 0.5 + 0.5 * Math.sin(theta);

        textureCoordinates.push(abscissa, ordinate);
    }

    const textureCoordBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);

    return textureCoordBuffer;
}

function initShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const shaderProgram = gl.createProgram();
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialise shader program: ${gl.getProgramInfoLog(shaderProgram)}`,
        );

        return null;
    }
    
    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(`An error ocurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);

        gl.deleteShader(shader);

        return null;
    }

    return shader;
}

function initTexture(gl) {
    const texture = gl.createTexture();
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);

    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage(
        gl.TEXTURE_2D
        , level
        , internalFormat
        , width
        , height
        , border
        , srcFormat
        , srcType
        , pixel,
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return texture;
}

function main() {
    const canvas = document.querySelector("#gl-canvas");
    const gl = canvas.getContext("webgl");

    if(gl === null) {
        alert("Unable to initialize WebGL, your browser may not support it.");

        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertexShaderSource = `
        
    `;

    const fragmentShaderSource = `
        
    `;

    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition")
        },
    };

    const vao = initBuffers(gl);
    const texture = initTexture(gl);
    let then = 0;

    function render(time) {
        now *= 0.001;
        deltaTime = now - then;
        then = now;

        drawFrame(gl, programInfo, vao, vertexCount);
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

main();