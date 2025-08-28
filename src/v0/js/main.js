import {initBuffers} from "./buffer-mgmt.js";
import {drawScene} from "./draw-scene.js";

let cartesianRotation = 0.0;
let deltaTime = 0;
const radius = 640;
const steps = 64;

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

function loadTexture(gl, url) {
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([255, 255, 255, 255]);

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

    image.src = url;

    return texture;
}

function isPowerOf2(value) {
    return(value & (value - 1)) === 0;
}

async function main() {
    const canvas = document.querySelector("#gl-canvas");

    const gl = canvas.getContext("webgl2", {
        antialias: true
        , alpha: true
        , premultipliedAlpha: true,
    });

    const vertexShaderURI = "./styles/assets/shaders/vertex-shader.vert";
    const fragmentShaderURI = "./styles/assets/shaders/fragment-shader.frag";

    const [vertexShaderSource, fragmentShaderSource] = await Promise.all([
        fetch(vertexShaderURI)
            .then(
                rawString => rawString.text()
            )
        , fetch(fragmentShaderURI)
            .then(
                rawString => rawString.text()
            ),
    ]);

    const scale = 2;

    canvas.width = scale * canvas.clientWidth;
    canvas.height = scale * canvas.clientHeight;

    gl.viewport(0, 0, canvas.width, canvas.height);

    if(gl === null) {
        alert("Unable to initialize WebGL. Your browser may not support it.");

        return;
    }

    const redChannel = 0.0;
    const greenChannel = 0.0;
    const blueChannel = 0.0;
    const alphaTransparency = 1.0;

    gl.clearColor(redChannel, greenChannel, blueChannel, alphaTransparency);
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

    const mainTextureURI = "./styles/assets/textures/R136a1.jpg";
    const buffers = initBuffers(gl);
    const texture = loadTexture(gl, mainTextureURI);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    let then = 0;

    function render(now) {
        now *= 0.001;   // Convert to seconds
        deltaTime = now - then;
        then = now;

        drawScene(gl, programInfo, buffers, texture, cartesianRotation);

        cartesianRotation += deltaTime;

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
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
 * @brief - Generate per-vertex colour data for a procedurally generated sphere
 * @details - Maps geometric information into RGBA colours using latitude/longitude banding on a sphere
 * @param {Array<number>|Float32Array} vertexPositions - Flat array [x0,y0,z0, x1,y1,z1, ...]
 * @param {Object} [options]
 * @param {number} [options.latitudeBandCount = 64] - Number of latitude bands (φ direction)
 * @param {number} [options.longitudeBandCount = 64] - Number of longitude bands (θ direction)
 * @param {boolean} [options.useChecker = false] - If true, toogles a checkerboard accent
 * @param {number} [options.alpha = 1.0] - Alpha channel (0-1)
 * @returns {Float32Array} - Flat RGBA array per vertex
 * @throws {TypeError} - If vertexPositions is not divisible by 3
 * @example - const colours = generateSphereFaceColours(sphereVerts, {useChecker: true});
 */
function generateSphereFaceColours(vertexPositions, options = {}) {
    const faceColours = [];
    const {latitudeBandCount = 64, longitudeBandCount = 64, useChecker = false, alpha = 1.0} = options;
    const vertexCount = Math.floor(vertexPositions.length / 3);

    for(let vertexIndex = 0; vertexIndex < vertexCount; ++vertexIndex) {
        const abscissa = vertexPositions[3 * vertexIndex + 0];
        const ordinate = vertexPositions[3 * vertexIndex + 1];
        const applicate = vertexPositions[3 * vertexIndex + 2];
        const vectorLength = Math.hypot(abscissa, ordinate, applicate) || 1.0;
        const normalU = abscissa / vectorLength;
        const normalV = ordinate / vectorLength;
        const normalW = applicate / vectorLength;
        const clampedZ = Math.min(1, Math.max(-1, normalW)) // Clamping prevents NaN by rounding errors.
        const phi = Math.acos(clampedZ);
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

/**
 * @brief - Generates UV texture coordinates for sphere vertices
 * @param {Array<number>|Float32Array} vertexPositions - Flat array [x0,y0,z0, x1,y1,z1, ...]
 * @param {Object} [options]
 * @param {number} [options.seamUOffset=0.0] - Rotates texture around Y-axis to position seam (0-1)
 * @param {number} [options.pinPolesUTo=0.5] - Fixed U coordinate for poles to avoid texture stretching (0-1)
 * @param {boolean} [options.flipV=false] - Inverts V coordinate for texture orientation
 * @returns {Float32Array} UV coordinates
 */
function generateSphereTextureCoordinates(vertexPositions, options = {}) {
    const {seamUOffset = 0.0, pinPolesUTo = 0.5, flipV = false} = options;
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
        const clampedZ = Math.max(-1.0, Math.min(1.0, normalW));    // Clamping prevents NaN by rounding errors.
        const phi = Math.acos(clampedZ);
        let theta = Math.atan2(normalV, normalU);
        const POLE_THRESHOLD = 1e-6;

        if(theta < 0) {
            theta += 2 * Math.PI;
        }

        let textureU = (theta / (2 * Math.PI) + seamUOffset) % 1.0;

        if(textureU < 0) {
            textureU += 1.0;
        }

        let textureV = phi / Math.PI;
        // Detection of singularities at the poles
        const atPole = textureV < POLE_THRESHOLD || textureV > (1.0 - POLE_THRESHOLD);

        if(atPole) {
            textureU = pinPolesUTo;
        }

        if(flipV) {
            textureV = 1.0 - textureV;
        }

        textureCoordinates.push(textureU, textureV);
    }

    return textureCoordinates;
}

main();