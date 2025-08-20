# ADR 0001: Adopt Cel shading as the rendering strategy
Date: `2025-08-19`
Status: Accepted

## Context
The **vision and scope** establishes that this project investigates the use of **cel shading** as an educational support tool for visualizing the Hertzsprung-Russell diagram.
Scientific visualization traditionally favors either:
- **Photorealism**, high fidelity but cognitively heavy or
- **Abstract plots**, clear but disconnected from intuition.

Our hypothesis is that cel shading - with simplieifed color bands and outlines - can **reduce visual noise**, highlight **categorical differences** (temperature, size, spectral class) and provide a more **accesible entry point** for learners.

## Decision
We will adopt **cel shading** as the core rendering strategy for representing stars.
- Stars will be shaded using quantized color bands derived from temperature.
- Outlines will be applied to improve shape readability at different scales.
- Visual style will follow the **corporate Memphis** inspired aesthetic.
- Scientific accuracy will be preserved in **size proportions and color mapping** while surface detail will be intentionally simplified.

## Consequences
**Positive:**
- Consistent with project vision of **stilized yet educational** visualization.
- Clearer contrast between stars of different spectral classes.
- Simplifies shader pipeline compared to PBR or photorealistic models.
- Distinctive aesthetic aligns with moder educational media.

**Negative:**
- May obscure fine-grained spectral or brightness variations.
- Could be perceived as "less scientific" if not accompanied by data labeling.
- Requires careful design of color ramps to avoid misleading interpretations.

**Mitigations:**
- Maintain explicit unit labels (T in K, R☉, L☉) in the UI.
- Keep rendering pipeline modular so PBR or alternate shading can be added later if needed.
- Document mapping choices and rationale clearly.

## Status
This ADR establishes the **rendering style (WHAT)**: cel shading as the strategy for representing stars.  
The **technical pipeline details (HOW)** — including render graph passes, shader design, and resource management — will be defined in later ADRs.