# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stardust Crusaders is a educational visualization tool that explores cel shading as a pedagogical aid for understanding the Hertzsprung-Russell diagram. The project demonstrates how stars of different temperatures and luminosities appear with stylized non-photorealistic rendering, aimed at making astrophysical concepts more intuitive without sacrificing scientific accuracy.

## Architecture

### Project Structure
- `src/v0/` - Current working prototype with WebGL implementation
- `docs/` - Architecture decisions (ADRs) and design specifications
- Main entry point: `src/v0/index.html` with `src/v0/js/main.js`

### Core Components
- **WebGL Rendering Pipeline**: Uses WebGL 2.0 with modular shader system
  - Vertex shader: `src/v0/styles/assets/shaders/vertex-shader.vert`
  - Fragment shaders: Multiple variants in `src/v0/styles/assets/shaders/`
- **Geometry System**: `geometry-data.js` generates procedural geometry
- **Buffer Management**: `init-buffers.js` handles WebGL buffer initialization
- **Render Loop**: `draw-scene.js` manages per-frame rendering

### Key Design Decisions
- **Cel Shading**: ADR-0001 establishes cel shading as the core rendering strategy
- **Fixed Visual Anchors**: Stars maintain constant pixel size while background grid conveys scale changes
- **Temperature-based Color Mapping**: Quantized color bands for different spectral classes
- **Corporate Memphis Aesthetic**: Stylized graphics following modern educational media patterns

## Development Commands

### Running the Application
```bash
# Navigate to prototype directory
cd src/v0

# Start Python HTTP server (required for ES6 modules and CORS)
python -m http.server 8000

# Access at http://localhost:8000
```

**Why HTTP server is required:**
- ES6 module imports (`import` statements) only work over HTTP/HTTPS protocol
- Shader files are loaded asynchronously via `fetch()` API which requires proper CORS handling
- WebGL texture loading needs HTTP headers for proper image loading
- Browser security prevents local file access via `file://` protocol

### File Structure
- **JavaScript Modules**: ES6 modules with explicit imports/exports
- **Shader Assets**: GLSL shaders loaded asynchronously via fetch()
- **Texture Assets**: Star textures (R136a1.jpg, Stephenson218.png)

## Technical Implementation Notes

### WebGL Setup
- Uses WebGL 2.0 context with antialiasing and alpha blending
- High-DPI displays supported via devicePixelRatio scaling
- Shader programs loaded and compiled at runtime from separate files

### Rendering Strategy
- **Dual Star System**: Main star (user-controlled) and comparison star (catalog reference)
- **Procedural Background**: Grid system expands/contracts to convey scale
- **Texture Mapping**: Fallback pixel system for texture loading
- **Animation Loop**: requestAnimationFrame-based render cycle with delta timing

### Physics and Data
- Temperature range: 2,500K - 40,000K
- Luminosity range: 0.0001 - 1,000,000 L☉
- Color temperature mapping to spectral classes (O-M)
- Nearest star catalog matching for educational comparison

## Development Workflow

### Making Changes
1. Edit source files directly (no build step required)
2. Refresh browser to see changes
3. Use browser DevTools for WebGL debugging
4. Check browser console for shader compilation errors

### Adding New Features
- Follow existing modular structure (separate concerns into modules)
- Maintain WebGL resource cleanup patterns
- Document shader uniforms and attributes
- Consider performance impact of additional geometry/textures

### Shader Development
- GLSL ES 3.0 specification
- Fragment shaders support various effects (black-hole, star-activity, kurzgesagt-star)
- Vertex shader handles standard MVP matrix transformations
- Use `#version 300 es` pragma for WebGL 2.0 compatibility