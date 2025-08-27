let cubeRotation = 0.0;
let deltaTime = 0;
let copyVideo = false;
const radius = 640;
const steps = 64;

const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;
    uniform mat4 uNormalMatrix;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    void main(void) {
        gl_Position = uProjectionMatrix*uModelViewMatrix*aVertexPosition;
        vTextureCoord = aTextureCoord;
        highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
        highp vec3 directionalLightColor = vec3(1, 1, 1);
        highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));
        highp vec4 transformedNormal = uNormalMatrix*vec4(aVertexNormal, 1.0);

        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
        vLighting = ambientLight + (directionalLightColor*directional);
        }
    `;

const fragmentShaderSource = `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;

    uniform sampler2D uSampler;

    void main(void) {
        highp vec4 textelColor = texture2D(uSampler, vTextureCoord);
        gl_FragColor = vec4(textelColor.rgb*vLighting, textelColor.a);
    }
`;

main();

function main() {
    const canvas = document.querySelector("#gl-canvas");
    const gl = canvas.getContext("webgl");

    if(gl === null) {
        alert("Unable to initialize WebGL. Your browser may not support it.");

        return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const shaderProgram = initShaderProgram(gl, vertexShaderSource, fragmentShaderSource);

    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
            vertexNormal: gl.getAttribLocation(shaderProgram, "aVertexNormal"),
            textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
            normalMatrix: gl.getUniformLocation(shaderProgram, "uNormalMatrix"),
            uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
        },
    };

    const buffers = initBuffers(gl);
    const texture = loadTexture(gl, "cubetexture.png");

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    let then = 0;

    function render(now) {
        now *= 0.001;
        deltaTime = now - then;
        then = now;

        if(copyVideo) {
            updateTexture(gl, texture, video);
        }

        drawScene(gl, programInfo, buffers, texture, cubeRotation);

        cubeRotation += deltaTime;

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

function initShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram,
            )}`,
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
        alert(
            `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
        );

        gl.deleteShader(shader);

        return null;
    }

    return shader;
}

function loadTexture(gl) {
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]);

    gl.texImage2D(
        gl.TEXTURE_2D,
        level,
        internalFormat,
        width,
        height,
        border,
        srcFormat,
        srcType,
        pixel,
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const image = new Image();

    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

        if(isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        }
        else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };

    image.src = URL;

    return texture;
}

function isPowerOf2(value) {
    return(value & (value - 1)) === 0;
}

function initBuffers(gl) {
    const positionBuffer = initPositionBuffer(gl);
    const textureCoordBuffer = initTextureBuffer(gl);
    const indexBuffer = initIndexBuffer(gl);
    const normalBuffer = initNormalBuffer(gl);

    return {
        position: positionBuffer,
        normal: normalBuffer,
        textureCoord: textureCoordBuffer,
        indices: indexBuffer,
    };
}

function initPositionBuffer(gl) {
    const positionBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const vertexPositions = generateSphereVertexArray()

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);

    return positionBuffer;
}

function initColorBuffer(gl) {
    const vertexPositions = generateSphereVertexArray();
    const faceColours = generateSphereFaceColours(vertexPositions);
    let colors = [];

    for(const c of faceColours) {
        colors = colors.concat(c, c, c, c);
    }

    const colorBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    return colorBuffer;
}

function initIndexBuffer(gl) {
    const indexBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    const indexArray = generateSphereIndexArray();

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);

    return indexBuffer;
}

function initTextureBuffer(gl) {
    const textureCoordBuffer = gl.createBuffer();
    const vertexPositions = generateSphereVertexArray();

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

    const textureCoordinates = generateSphereTextureCoordinates(vertexPositions);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW,);

    return textureCoordBuffer;
}

function initNormalBuffer(gl) {
    const normalBuffer = gl.createBuffer();
    const vertexPositions = generateSphereVertexArray();

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    const vertexNormals = generateSphereVertexNormals(vertexPositions);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

    return normalBuffer;
}

function drawScene(gl, programInfo, buffers, texture, cubeRotation) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const fieldOfView = (45*Math.PI)/180;
    const aspect = gl.canvas.clientWidth/gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    const modelViewMatrix = mat4.create();

    mat4.translate(
        modelViewMatrix,
        modelViewMatrix,
        [-0.0, 0.0, -6.0],
    );

    mat4.rotate(
        modelViewMatrix,
        modelViewMatrix,
        cubeRotation,
        [0, 0, 1],
    );

    mat4.rotate(
        modelViewMatrix,
        modelViewMatrix,
        cubeRotation*0.7,
        [0, 1, 0],
    );

    mat4.rotate(
        modelViewMatrix,
        modelViewMatrix,
        cubeRotation*0.3,
        [1, 0, 0],
    );

    const normalMatrix = mat4.create();

    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    setPositionAttribute(gl, buffers, programInfo);
    setTextureAttribute(gl, buffers, programInfo);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

    setNormalAttribute(gl, buffers, programInfo);

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
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

    {
        const vertexCount = (generateSphereIndexArray()).length;
        const type = gl.UNSIGNED_SHORT;
        const offset = 0;

        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
    }
}

function setPositionAttribute(gl, buffers, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

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

function setColorAttribute(gl, buffers, programInfo) {
    const numComponents = 4;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
    
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexColor,
        numComponents,
        type,
        normalize,
        stride,
        offset,
    );

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
}

function setTextureAttribute(gl, buffers, programInfo) {
    const num = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);

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

function setNormalAttribute(gl, buffers, programInfo) {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    
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

function generateSphereVertexArray() {
    const vertexPositions = [];

    vertexPositions.push(0, 0, radius);

    for(let i = 1; i <= steps - 1; ++i) {
        const phi = Math.PI * i / steps;

        for(let j = 0; j <= steps; ++j) {
            const theta = 2 * Math.PI * j / steps;
            const abscissa = radius * Math.sin(phi) * Math.cos(theta);
            const ordinate = radius * Math.sin(phi) * Math.sin(theta);
            const applicate = radius * Math.cos(phi);

            vertexPositions.push(abscissa, ordinate, applicate);
        }
    }

    vertexPositions.push(0, 0, -radius);

    return vertexPositions;
}

function generateSphereIndexArray() {
    const indexArray = [];
    const northPoleIndex = 0;
    const southPoleIndex = 1 + (steps - 1) * steps;

    function ringVertexIndex(latitudeIndex, longitudeIndex) {
        const wrappedLongitude = ((longitudeIndex % steps) + steps) % steps;
        
        return 1 + (latitudeIndex - 1) * steps + wrappedLongitude;
    }

    for(let longitudeIndex = 0; longitudeIndex < steps; ++longitudeIndex) {
        const firstRingCurrentVertex = ringVertexIndex(1, longitudeIndex);
        const firstRingNextVertex = ringVertexIndex(1, longitudeIndex + 1);

        indexArray.push(northPoleIndex, firstRingCurrentVertex, firstRingNextVertex);
    }

    for(let latitudeIndex = 1; latitudeIndex <= steps - 2; ++latitudeIndex) {
        for(let longitudeIndex = 0; longitudeIndex < steps; ++longitudeIndex) {
            const currentRingCurrentColumnVertex = ringVertexIndex(
                latitudeIndex
                , longitudeIndex,
            );

            const nextRingCurrentColumnVertex = ringVertexIndex(
                latitudeIndex + 1
                , longitudeIndex,
            );

            const nextRingNextColumnVertex = ringVertexIndex(
                latitudeIndex + 1
                , longitudeIndex + 1,
            );

            const currentRingNextColumnVertex = ringVertexIndex(
                latitudeIndex
                , longitudeIndex + 1,
            );

            indexArray.push(
                currentRingCurrentColumnVertex
                , nextRingCurrentColumnVertex
                , nextRingNextColumnVertex
                , currentRingCurrentColumnVertex
                , nextRingNextColumnVertex
                , currentRingNextColumnVertex,
            );
        }
    }

    for(let longitudeIndex = 0; longitudeIndex < steps; ++longitudeIndex) {
        const lastRingCurrentVertex = ringVertexIndex(steps - 1, longitudeIndex);
        const lastRingNextVertex = ringVertexIndex(steps - 1, longitudeIndex + 1);

        indexArray.push(lastRingCurrentVertex, southPoleIndex, lastRingNextVertex);
    }

    return indexArray;
}

function generateSphereVertexNormals(vertexPositions) {
    const vertexNormals = [];
    const vertexCount = vertexPositions.length / 3;

    for(let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
        const abscissa = vertexPositions[3 * vertexIndex + 0];
        const ordinate = vertexPositions[3 * vertexIndex + 1];
        const applicate = vertexPositions[3 * vertexIndex + 2];
        const vectorLength = Math.sqrt(abscissa * abscissa + ordinate * ordinate + applicate * applicate);
        let normalU, normalV, normalW;

        if(!(vectorLength > 0.0)) {
            normalU = 0.0;
            normalV = 0.0;
            normalW = 1.0;
        }
        else {
            normalU = abscissa / vectorLength;
            normalV = ordinate / vectorLength;
            normalW = applicate / vectorLength;
        }

        vertexNormals.push(normalU, normalV, normalW);
    }

    return vertexNormals;
}

/**
 * @brief Generate per-vertex RGBA colours using latitude/longitude banding on a sphere.
 * - Expects vertex positions of a sphere centered at the origin.
 * - Colours are assigned per-vertex.
 * @param {Array<number>|Float32Array} vertexPositions - Flat array [x0, y0, z0, x1, y1, z1, ... , x_n, y_n, z_n]
 * @param {Object} [options]
 * @param {number} [options.latitudeBandCount = 8] - Number of latitude bands (φ direction).
 * @param {number} [options.longitudeBandCount = 16] - Number of longitude bands (θ direction).
 * @param {boolean} [options.useChecker = false] - If true, toogles a checkerboard accent.
 * @param {number} [options.alpha = 1.0] - Alpha channel (0... 1).
 * @returns {Float32Array} faceColours - Flat RGBA array per vertex.
 */
function generateSphereFaceColours(vertexPositions, options = {}) {
    const faceColours = [];
    const {latitudeBandCount = 8, longitudeBandCount = 16, useChecker = true, alpha = 1.0} = options;
    const vertexCount = Math.floor(vertexPositions.length / 3);

    for(let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
        const abscissa = vertexPositions[3 * vertexIndex + 0];
        const ordinate = vertexPositions[3 * vertexIndex + 1];
        const applicate = vertexPositions[3 * vertexIndex + 2];
        const vectorLength = Math.hypot(abscissa, ordinate, applicate) || 1.0;
        const normalU = abscissa / vectorLength;
        const normalV = ordinate / vectorLength;
        const normalW = applicate / vectorLength;
        const phi = Math.acos(Math.min(1, Math.max(-1, normalW)));
        let theta = Math.atan2(normalV, normalU);

        if(theta < 0) {
            theta += 2 * Math.PI;
        }

        const latitude = theta / (2 * Math.PI);
        const longitude = phi / Math.PI;
        const longitudeBandIndex = Math.floor(latitude * longitudeBandCount);
        const latitudeBandIndex = Math.floor(longitude * latitudeBandCount);
        const redChannel = (longitudeBandIndex + 0.5) / longitudeBandCount;
        const greenChannel = (latitudeBandIndex + 0.5) / latitudeBandCount;
        const checkerParity = (longitudeBandIndex + latitudeBandIndex) % 2;
        const blueChannel = useChecker ? (checkerParity ? 0.2 : 0.85) : (1.0 - greenChannel)
        const alphaChannel = alpha;

        faceColours.push(redChannel, greenChannel, blueChannel, alphaChannel);
    }

    return faceColours;
}

function generateSphereTextureCoordinates(vertexPositions, options = {}) {
    const {seamUOffset = 0.0, pinPolesUTo = 0.0, flipV = false} = options;
    const textureCoordinates = [];
    const vertexCount = Math.floor(vertexPositions.length / 3);

    for(let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
        const abscissa = vertexPositions[3 * vertexIndex + 0];
        const ordinate = vertexPositions[3 * vertexIndex + 1];
        const applicate = vertexPositions[3 * vertexIndex + 2];
        const vectorLength = Math.hypot(abscissa, ordinate, applicate) || 1.0;
        const normalU = abscissa / vectorLength;
        const normalV = ordinate / vectorLength;
        const normalW = applicate / vectorLength;
        const clampedZ = Math.max(-1.0, Math.min(1.0, normalW));
        const phi = Math.acos(clampedZ);
        let theta = Math.atan2(normalV, normalU);

        if(theta < 0) {
            theta += 2 * Math.PI;
        }

        let textureU = (theta / (2 * Math.PI) + seamUOffset) % 1.0;

        if(textureU < 0) {
            textureU += 1.0;
        }

        let textureV = phi / Math.PI;
        const atNorthPole = Math.abs(textureV - 0.0) < 1e-6;
        const atSouthPole = Math.abs(textureV - 1.0) < 1e-6;

        if(atNorthPole || atSouthPole) {
            textureU = pinPolesUTo;
        }

        if(flipV) {
            textureV = 1.0 - textureV;
        }

        textureCoordinates.push(textureU, textureV);
    }

    return textureCoordinates;
}