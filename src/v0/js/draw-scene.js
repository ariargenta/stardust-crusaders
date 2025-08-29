/**
 * @brief - Renders a complete 3D scene with textures, lighting, and transformations
 * @param {WebGLRenderingContext} gl - WebGL rendering context
 * @param {Object} programInfo - Shader program information and attribute/uniform locations
 * @param {Object} buffers - Vertex buffer objects containing geometry data
 * @param {WebGLTexture} texture - Texture object to apply to the geometry
 * @param {number} cartesianRotation - Rotation angle in radians for scene transformation
 * @param {Object} geometryData - Geometry data containing indices and vertex information
 * @param {Array} geometryData.indices - Triangle indices for element drawing
 * @returns {void}
 */
function drawScene(
    gl, programInfo, geometryBuffers, textures, geometryData, cartesianRotation
) {
    const redChannel = 0.0;
    const greenChannel = 0.0;
    const blueChannel = 0.0;
    const alphaTransparency = 1.0;
    const defaultDepth = 1.0;

    gl.clearColor(redChannel, greenChannel, blueChannel, alphaTransparency);
    gl.clearDepth(defaultDepth);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = (45 * Math.PI) / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 3840.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = mat4.create();

    mat4.translate(
        modelViewMatrix
        , modelViewMatrix
        , [0.0, 0.0, -2500.0],
    );

    mat4.rotate(
        modelViewMatrix
        , modelViewMatrix
        , cartesianRotation
        , [1, 1, 0],
    );

    const normalMatrix = mat4.create();

    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    setPositionAttribute(gl, geometryBuffers.mainBuffer, programInfo);
    setPositionAttribute(gl, geometryBuffers.secondaryBuffer, programInfo);
    setTextureAttribute(gl, textures.mainTexture, programInfo);
    setTextureAttribute(gl, textures.secondaryTexture, programInfo);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryBuffers.mainBuffer.indices);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryBuffers.secondaryBuffer.indices);

    setNormalAttribute(gl, geometryBuffers.mainBuffer, programInfo);
    setNormalAttribute(gl, geometryBuffers.secondaryBuffer, programInfo);

    gl.useProgram(programInfo.program);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix,
    );

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix,
        false,
        modelViewMatrix,
    );

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix,
    );

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures.mainTexture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    {
        const indexCount = geometryData.mainData.indices.length;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;

        gl.drawElements(gl.TRIANGLES, indexCount, type, offset);
    }
}

/**
 * @brief - Sets up the position attribute for vertex shader input
 * @param {WebGLRenderingContext} gl - WebGL rendering context
 * @param {Object} buffers - Vertex buffer objects container
 * @param {WebGLBuffer} buffers.position - Buffer containing vertex position coordinates (XYZ)
 * @param {Object} programInfo - Shader program attribute locations
 * @param {number} programInfo.attribLocations.vertexPosition - Position attribute location
 * @returns {void}
 */
function setPositionAttribute(gl, geometryBuffers, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.position);

    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
}

/**
 * @brief - Sets up the texture coordinate attribute for vertex shader input
 * @param {WebGLRenderingContext} gl - WebGL rendering context
 * @param {Object} buffers - Vertex buffer objects container
 * @param {WebGLBuffer} buffers.textureCoord - Buffer containing UV texture coordinates
 * @param {Object} programInfo - Shader program attribute locations
 * @param {number} programInfo.attribLocations.textureCoord - Texture coordinate attribute location
 * @returns {void}
 */
function setTextureAttribute(gl, geometryBuffers, programInfo) {
    const num = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.textureCoord);

    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        num,
        type,
        normalize,
        stride,
        offset,
    );

    gl.enableVertexAttribArray(programInfo.attribLocations.textureCoord);
}

/**
 * @brief - Sets up the normal attribute for vertex shader input
 * @param {WebGLRenderingContext} gl - WebGL rendering context
 * @param {Object} buffers - Vertex buffer objects container
 * @param {WebGLBuffer} buffers.normal - Buffer containing vertex normal vectors
 * @param {Object} programInfo - Shader program attribute locations
 * @param {number} programInfo.attribLocations.vertexNormal - Normal attribute location
 * @returns {void}
 */
function setNormalAttribute(gl, geometryBuffers, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, geometryBuffers.normal);
    
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
}

export {drawScene};