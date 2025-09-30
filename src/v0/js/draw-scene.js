/**
 * @brief - Renders a complete 3D scene with multiple objects, textures, lighting, and transformations
 * @param {WebGLRenderingContext} gl - WebGL rendering context
 * @param {Object} programInfo - Shader program information and attribute/uniform locations
 * @param {Object} textures - Texture objects for multiple objects
 * @param {Object} geometryData - Geometry data containing indices and vertex information for multiple objects
 * @param {number} cartesianRotation - Rotation angle in radians for scene transformation animation
 * @returns {void}
 * @details - This function implements a sequential rendering approach where each object's buffers, textures, and transformation matrices are bound individually before drawing. The function follows the bind-draw-bind-draw pattern to avoid buffer binding conflicts between objects.
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

    const mainModelViewMatrix = mat4.create();

    mat4.translate(mainModelViewMatrix, mainModelViewMatrix, [0.0, 0.0, -2500.0]);
    mat4.rotate(mainModelViewMatrix, mainModelViewMatrix, cartesianRotation, [1, 1, 0]);

    const mainNormalMatrix = mat4.create();

    mat4.invert(mainNormalMatrix, mainModelViewMatrix);
    mat4.transpose(mainNormalMatrix, mainNormalMatrix);

    const secondaryModelViewMatrix = mat4.create();

    mat4.translate(
        secondaryModelViewMatrix
        , secondaryModelViewMatrix
        , [-1500.0, 500.0, -2500.0]
    );

    mat4.rotate(
        secondaryModelViewMatrix
        , secondaryModelViewMatrix
        , cartesianRotation * 0.75
        , [1, 1, 0]
    );

    mat4.scale(secondaryModelViewMatrix, secondaryModelViewMatrix, [0.5, 0.5, 0.5]);

    const secondaryNormalMatrix = mat4.create();

    mat4.invert(secondaryNormalMatrix, secondaryModelViewMatrix);
    mat4.transpose(secondaryNormalMatrix, secondaryNormalMatrix);

    setPositionAttribute(gl, geometryBuffers, programInfo);
    setTextureAttribute(gl, geometryBuffers, programInfo);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryBuffers.mainBuffer.indices);

    setNormalAttribute(gl, geometryBuffers, programInfo);

    gl.useProgram(programInfo.program);

    gl.uniform2f(
        programInfo.uniformLocations.resolution,
        gl.canvas.width,
        gl.canvas.height
    );

    gl.uniform1f(
        programInfo.uniformLocations.time,
        cartesianRotation
    );

    gl.uniform1f(
        programInfo.uniformLocations.sphereToCartesian,
        1.0
    );

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.projectionMatrix,
        false,
        projectionMatrix,
    );

    bindBuffersForObject(gl, geometryBuffers.mainBuffer, programInfo);
    bindTextureForObject(gl, textures.mainTexture, programInfo);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix
        , false
        , mainModelViewMatrix,
    );

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix
        , false
        , mainNormalMatrix,
    );

    {
        const indexCount = geometryData.mainData.indices.length;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;

        gl.drawElements(gl.TRIANGLES, indexCount, type, offset);
    }

    bindBuffersForObject(gl, geometryBuffers.secondaryBuffer, programInfo);
    bindTextureForObject(gl, textures.secondaryTexture, programInfo);

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.modelViewMatrix
        , false
        , secondaryModelViewMatrix,
    );

    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix
        , false
        , secondaryNormalMatrix,
    );

    {
        const indexCount = geometryData.secondaryData.indices.length;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;
        gl.drawElements(gl.TRIANGLES, indexCount, type, offset);
    }
}

/**
 * @brief - Sets up the position attribute for vertex shader input
 * @param {WebGLRenderingContext} gl - WebGL rendering context
 * @param {Object} buffers - Vertex buffer objects container
 * @param {Object} programInfo - Shader program attribute locations
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
 * @param {Object} programInfo - Shader program attribute locations
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
 * @param {Object} programInfo - Shader program attribute locations
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

/**
 * @brief - Binds all vertex buffer objects for a specific geometry object
 * @param {WebGLRenderingContext} gl - WebGL rendering context
 * @param {Object} buffers - Vertex buffer objects container for a single geometry object
 * @param {Object} programInfo - Shader program attribute locations
 * @returns {void}
 * @details - The function sets up position, normal, and texture coordinate attributes, then binds the element array buffer for indexed drawing.It must be called before each drawElements() call to ensure correct buffer bindings.
 * @example
 * // Bind buffers for main sphere before drawing
 * // bindBuffersForObject(gl, geometryBuffers.mainBuffer, programInfo);
 * // gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
 */
function bindBuffersForObject(gl, buffers, programInfo) {
    setPositionAttribute(gl, buffers, programInfo);
    setNormalAttribute(gl, buffers, programInfo);
    setTextureAttribute(gl, buffers, programInfo);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
}

/**
 * @brief - Binds a texture object to WebGL texture unit and sets shader uniform sampler
 * @param {WebGLRenderingContext} gl - WebGL rendering context
 * @param {WebGLTexture} texture - Texture object to bind for rendering
 * @param {Object} programInfo - Shader program uniform locations
 * @returns {void}
 * @details - This function activates texture unit 0, binds the specified texture to GL_TEXTURE_2D target, and sets the fragment shader's texture sampler uniform to use texture unit 0. It must be called before each drawElements() call to ensure the correct texture is applied.
 * @example
 * // Bind main sphere texture before drawing
 * // bindTextureForObject(gl, textures.mainTexture, programInfo);
 * // gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
 */
function bindTextureForObject(gl, texture, programInfo) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
}

export {drawScene};