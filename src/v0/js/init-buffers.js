function initBuffers(gl, geometryData) {
    const positionBuffer = initPositionBuffer(gl, geometryData);
    const textureCoordBuffer = initTextureBuffer(gl, geometryData);
    const indexBuffer = initIndexBuffer(gl, geometryData);
    const normalBuffer = initNormalBuffer(gl, geometryData);

    return {
        position: positionBuffer
        , normal: normalBuffer
        , textureCoord: textureCoordBuffer
        , indices: indexBuffer,
    };
}

function initPositionBuffer(gl, geometryData) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const vertexPositions = geometryData.positions;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);

    return positionBuffer;
}

function initIndexBuffer(gl, geometryData) {
    const indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indexArray = geometryData.indices;

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);

    return indexBuffer;
}

function initTextureBuffer(gl, geometryData) {
    const textureCoordBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    const textureCoordinates = geometryData.texture;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW,);

    return textureCoordBuffer;
}

function initNormalBuffer(gl, geometryData) {
    const normalBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    const vertexNormals = geometryData.normals;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

    return normalBuffer;
}

export {initBuffers};