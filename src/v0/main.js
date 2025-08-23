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

function main() {
    const canvas = document.querySelector("#gl-canvas");
    const gl = canvas.getContext("webgl");

    if(gl === null) {
        alert("Unable to initialize WebGL, your browser may not support it.");

        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertexShader = `
        
    `;

    const fragmentShader = `
        
    `;

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition")
        },
    };

    const vao = initBuffers(gl);
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