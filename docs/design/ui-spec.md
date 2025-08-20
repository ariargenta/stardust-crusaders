# Stardust Crusadiers - UI specification

**Owner:** `ariargenta`
**Version:** `0.1.0`
**Status:** `Draft`
**Last updated:** `2025-08-19`

---

## 1. Purpose
- Users adjust **Temperature (K)** and **Luminosity (L☉)** and immediately **see** star **color** and **scale perception** change.
- Users **compare** against the **nearest catalogued star** at **true scale**, perceived via background expansion.
- UI exposes only the **minimum controls** required to support the above.
- Users can view the **position of the current star on the HR diagram** to understand its classification.

---

## 2. Screen layout
```mermaid
    flowchart LR
    %% Screen Layout — 16:9, 8-unit grid (Main 6/8, Panel 2/8)
    %% Stars keep fixed on-screen size; background grid conveys scale.

    %% Canvas
    subgraph Canvas["Screen 1920×1080 (8-unit grid)"]
    direction LR

        %% Left: Main Display Area (6/8 width)
        subgraph Main["Main Display Area — \"6/8 width\""]
    
        direction TB
            subgraph StarField["Star Field (fixed-size stars; procedural background grid expands/contracts)"]
        direction TB
            CompGroup["Top-left cluster"]
            CompStar["Comparison Star (fixed px radius)"]
            CompTag["Tag / Label (below comparison)"]
            SimStar["Simulated Star (center, fixed px radius)"]
        end
    end

    %% Right: Control Panel (2/8 width)
    subgraph Panel["Control Panel — \2/8 width\ (full height)"]
        direction TB
            Controls["Interactive Controls (top)— Evolutionary Stage (dropdown)— Temperature (K) [slider]— Luminosity (L☉) [slider]"]
            Telemetry["Telemetry / Derived (middle)— Mass (M☉), Radius (R☉), Spectral Class"]
            HRD["HR Diagram (bottom half of panel)— 2D plot: Temp → (log, decreasing), Lum ↑ (log) Markers: ● current (filled), ○ nearest (hollow)— Marker size constant; axes/grid convey scale"]
        end
    end

    %% Visual relationships
    CompGroup --- CompStar
    CompGroup --- CompTag
    StarField --- Panel
```

---

## 3. Component registry
| ID | Role | Type | Input/Output | Data binding | Notes |
|------|------|------|------|------|------|
| `ctrl.temp` | Temperature | slider | input: `K` | → `AppState.params.temperatureK` | Range 2.5k–40k |
| `ctrl.lum` | Luminosity | slider | input: `L☉` | → `AppState.params.luminosityLsol` | Range 1e-4–1e6 |
| `ctrl.mass` | Mass | slider | input: `M☉` | → `AppState.params.mass` | Derived stage |
| `ctrl.stage` | Evolutionary stage | dropdown | input | → `AppState.params.stage` | Main sequence, giant, dwarf |
| `view.star.main` | Main star | canvas | output | `AppState.derived` | Fixed pixel radius |
| `view.star.compare` | Compare star | canvas | output | `AppState.selection.nearest` | Fixed radius, proportional |
| `bg.hrgrid` | Background grid | procedural canvas | output | recomputes scale factor | Expands/contracts |
| `info.telemetry` | Panel | output | shows T, L, R, M, class | Updated dynamically |