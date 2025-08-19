# ADR 0001: Layered Architecture
Date: 2025-08-18
Status: Proposed

## Context
We need a clear architecture for star visualizer that:
- Maps Hertzprung-Russel parameters to visual apperance.
- Compares against a real-star catalog.
- Renders toon-shaded stars in a 3D environment.
We aim to minimal coupling, shader hot-reload and testable domain logic.

## Decision
- Adopt a **layered architecture** with a single source of truth for app state.
- Use a **render graph** to orchestrate GPU passes and resources.
- Keep **domain logic** independent of rendering.
- Manage GPU resources via **resource manager** with handles and RAII.

## Architecture
```mermaid
    flowchart TB
        subgraph L4["Platform / Runtime"]
            W[Window & Input]
            T[Time & Scheduler]
            FS[Filesystem & Hot-Reload]
            LOG[Logging & Telemetry]
        end

        subgraph L3["Rendering Layer"]
            RG[RenderGraph]
            RM["ResourceMgr (buffers/images/pipelines)"]
            MAT["Material & Shaders"]
            MESH["MeshGen (icosphere, rings)"]
        end

        subgraph L2["App / Simulation"]
            AS["AppState (single source of truth)"]
            HR["HRDiagramMapping (T,L -> radius,color,class)"]
            CAT["StarCatalog (data)"]
            MATCH["StarMatcher (nearest by T,L)"]
        end

        subgraph L1["UI Layer"]
            PANELS["Panels & Controls"]
            CMD["Commands (mutate AppState)"]
        end

        %% Dependencies (bottom provides services upward)
        L4 --> L3
        L3 --> L2
        L2 --> L1

        %% Key interactions
        PANELS --> CMD --> AS
        AS --> HR --> AS
        AS --> MATCH --> AS
        AS -->|per-frame snapshot| RG
        RG --> RM
        RG --> MAT
```