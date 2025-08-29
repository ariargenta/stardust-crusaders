import {initBuffers} from "./init-buffers.js";
import {drawScene} from "./draw-scene.js";
import {generateGeometryData} from "./geometry-data.js";

main();

/**
 * @brief - Initializes and starts the WebGL 3D rendering application with animation loop
 * @returns {Promise<void>} - Async function that completes when initialization is done
 */
async function main() {
    const canvas = document.querySelector("#gl-canvas");

    const gl = canvas.getContext("webgl2", {
        antialias: true
        , alpha: true
        , premultipliedAlpha: true,
    });

    const scale = 2;

    canvas.width = scale * canvas.clientWidth;
    canvas.height = scale * canvas.clientHeight;

    const originX = 0;
    const originY = 0;

    gl.viewport(originX, originY, canvas.width, canvas.height);

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
    const secondaryTextureURI = "./styles/assets/textures/Stephenson218.png";
    const mainGeometryData = generateGeometryData();
    const secondaryGeometryData = generateGeometryData();
    const mainGeometryBuffers = initBuffers(gl, mainGeometryData);
    const secondaryGeometryBuffers = initBuffers(gl, secondaryGeometryData);
    const mainTexture = loadTexture(gl, mainTextureURI);
    const secondaryTexture = loadTexture(gl, secondaryTextureURI);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    let cartesianRotation = 0.0;
    let deltaTime = 0;
    let then = 0;

    function render(now) {
        now *= 0.001;   // Convert to seconds
        deltaTime = now - then;
        then = now;

        const geometryData = {
            mainData: mainGeometryData
            , secondaryData: secondaryGeometryData
        };

        const geometryBuffers = {
            mainBuffer: mainGeometryBuffers
            , secondaryBuffer: secondaryGeometryBuffers
        };

        const textures = {
            mainTexture: mainTexture
            , secondaryTexture: secondaryTexture
        };

        drawScene(
            gl
            , programInfo
            , geometryBuffers
            , textures
            , geometryData
            , cartesianRotation,
        );

        cartesianRotation += deltaTime;

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

/**
 * @brief - Creates and links shader program from vertex and fragment shader sources
 * @param {WebGLRenderingContext} gl - WebGL rendering context
 * @param {string} vertexShaderSource - GLSL source code for vertex shader
 * @param {string} fragmentShaderSource - GLSL source code for fragment shader
 * @returns {WebGLProgram|null} - Linked shader program object, null if linking failed
 */
function initShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${
                gl.getProgramInfoLog(shaderProgram)
            }`,
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

/**
 * @brief - Loads and configures a texture from an image with fallback pixel
 * @param {WebGLRenderingContext} gl - WebGL rendering context
 * @param {string} imageURI - URI path to the image file
 * @returns {WebGLTexture} - Configured texture object ready for rendering
 * @example
 * // const texture = loadTexture(gl, "./assets/textures/image.jpg");
 */
function loadTexture(gl, imageURI) {
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);

    const redChannel = 255;
    const greenChannel = 255;
    const blueChannel = 255;
    const alphaTransparency = 255;
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;

    const pixel = new Uint8Array([
        redChannel
        , greenChannel
        , blueChannel
        , alphaTransparency,
    ]);

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

    image.src = imageURI;

    return texture;
}

/**
 * @brief - Checks if a given value is a power of 2 using bitwise operations
 * @param {number} value - The number to check
 * @returns {boolean}
 */
function isPowerOf2(value) {
    return(value & (value - 1)) === 0;
}