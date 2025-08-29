/**
 * @brief - Initializes all WebGL buffers for a complete 3D mesh
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {Object} geometryData - Object containing all geometry arrays
 * @param {Float32Array} geometryData.positions - Vertex positions [x,y,z, ...]
 * @param {Float32Array} geometryData.normals - Vertex normals [nx,ny,nz, ...]
 * @param {Float32Array} geometryData.texture - UV coordinates [u,v, ...]
 * @param {Array<number>} geometryData.indices - Triangle indices [i0,i1,i2, ...]
 * @returns {Object} - Collection of initialized WebGL buffers:
 * @returns {WebGLBuffer} position - Vertex positions buffer
 * @returns {WebGLBuffer} normal - Vertex normals buffer
 * @returns {WebGLBuffer} textureCoord - UV coordinates buffer
 * @returns {WebGLBuffer} indices - Triangle indices buffer
 */
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

/**
 * @brief - Creates and initializes a WebGL buffer for vertex positions
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {Object} geometryData - Object containing geometry arrays
 * @param {Float32Array} geometryData.positions - Vertex positions [x0,y0,z0, x1,y1,z1, ...]
 * @returns {WebGLBuffer} - Initialized buffer containing vertex positions
 * @details - Uploads vertex position data as 32-bit floats
 * @example
 * // const vertices = generateSphereVertexArray(radius, steps);
 * // const positionBuffer = initPositionBuffer(gl, {
 * //    positions: vertices
 * // });
 */
function initPositionBuffer(gl, geometryData) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const vertexPositions = geometryData.positions;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);

    return positionBuffer;
}

/**
 * @brief - Creates and initializes a WebGL buffer for triangle indices
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {Object} geometryData - Object containing geometry arrays
 * @param {Array<number>} geometryData.indices - Triangle indices [i0,i1,i2, i3,i4,i5, ...]
 * @returns {WebGLBuffer} - Initialized buffer containing index data
 * @details - Uploads index data as 16-bit unsigned integers
 * @example
 * // const indices = generateSphereIndexArray(steps);
 * // const indexBuffer = initIndexBuffer(gl, {
 * //    indices: indices
 * // });
 */
function initIndexBuffer(gl, geometryData) {
    const indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indexArray = geometryData.indices;

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);

    return indexBuffer;
}

/**
 * @brief - Creates and initializes a WebGL buffer for texture coordinates
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {Object} geometryData - Object containing geometry arrays
 * @param {Float32Array} geometryData.texture - UV coordinates [u0,v0, u1,v1, ...]
 * @returns {WebGLBuffer} - Initialized buffer containing texture coordinates
 * @details - Uploads UV coordinate data as 32-bit floats
 * @example
 * // const uvCoords = generateSphereTextureCoordinates(vertices);
 * // const textureBuffer = initTextureBuffer(gl, {
 * //    texture: uvCoords
 * // });
 */
function initTextureBuffer(gl, geometryData) {
    const textureCoordBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    const textureCoordinates = geometryData.texture;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW,);

    return textureCoordBuffer;
}

/**
 * @brief - Creates and initializes a WebGL buffer for vertex normals
 * @param {WebGLRenderingContext} gl - WebGL context
 * @param {Object} geometryData - Object containing geometry arrays
 * @param {Float32Array} geometryData.normals - Vertex normal vectors [nx,ny,nz, ...]
 * @returns {WebGLBuffer} - Initialized buffer containing normal data
 * @details - Uploads normal data as 32-bit floats
 * @example
 * // const normals = generateSphereVertexNormals(vertices);
 * // const normalBuffer = initNormalBuffer(gl, {
 * //    normals: normals
 * // });
 */
function initNormalBuffer(gl, geometryData) {
    const normalBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    const vertexNormals = geometryData.normals;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

    return normalBuffer;
}

export {initBuffers};