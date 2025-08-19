# Vision and Scope

## Vision
To explore **cel shading (toon shading) as an educational support tool** in scientific visualization, by applying it to the Hertzsprung–Russell diagram. The project aims to demonstrate that **stylized graphics can make astrophysical concepts more intuitive** without sacrificing scientific accuracy.

## Problem Statement
Scientific visualizations often struggle with a trade-off:
- **Photorealism** (accurate but complex, cognitively heavy).
- **Abstract plots** (clear but disconnected from intuition).

Students and general audiences can find it difficult to connect textbook HR diagrams with the physical appearance and scale of stars. Current tools rarely investigate **non-photorealistic rendering (NPR)** as a middle ground for clarity and engagement.

## Scope
- Render stars with **cel shading** to highlight categorical differences in color and size.  
- Allow users to vary **temperature (K)** and **luminosity (L☉)**, and observe derived properties (radius, spectral class).  
- Automatically match parameters to the **nearest catalogued star** for comparison.  
- Provide **side-by-side comparison** at real-world scale, framed for clarity.  
- Target environment: desktop app, 1920×1080 layout, educational/demo use.

### Out of Scope
- Full astrophysical simulation or galaxy-scale rendering.  
- Networking, persistence, or multi-user features.  
- Advanced photorealistic rendering (PBR, HDR tone mapping, etc.).

## Research / Learning Goals
- Investigate **cel shading as a pedagogical aid**: does simplifying visuals improve conceptual grasp?  
- Apply **NPR techniques** (toon bands, outlines, Memphis-style graphics) to a scientific dataset.  
- Demonstrate **graphics programming skills**: render graph, resource management, layered architecture.  
- Showcase **algorithmic reasoning and problem-solving mindset** relevant for research roles.

## Success Criteria
- Adjusting T and L produces immediate, legible changes in star size and color.  
- Nearest real star is identified and compared without overwhelming the user.  
- Cel-shaded visuals emphasize structure (spectral class, scale) over surface realism.  
- Codebase demonstrates clean modular design, extensible for future experiments.  