# Adaptive Layout Engine for Multi-Surface Ads

A polished TypeScript/React demo for the Adaptive Layout Engine assignment.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Demo

The demo uses one Nova Air advertisement specification and resolves it live across:

- Mobile Portrait
- Mobile Landscape
- Broadcast Lower Third
- Square Retail Kiosk

A fifth compact stress-test surface is retained in the code for constraint/degradation testing.

## Core architecture

```text
Ad Spec + Surface Profile
          ↓
Constraint Resolver
          ↓
Resolved Layout
          ↓
DOM Renderer
```

The resolver is framework-agnostic TypeScript. React is only used by the demo and DOM renderer.

## Resolution approach

The resolver calculates a safe usable rectangle, reads the surface aspect ratio and constraints, then derives a composition. It creates candidates for each element, orders them by priority, enforces minimum sizes/tap targets, clamps candidates into the safe area, and performs a deterministic non-overlap search. Optional low-priority elements can be dropped when there is no valid placement.

There are no surface-name layout branches such as `if (surface === "mobile")`. A new surface is represented by a typed `SurfaceProfile` and passed through the same resolver.

## Priority model

Priority 1 content is protected first. Priority 2 content remains important. Priority 3 branding is optional and can be removed if constraints make a valid layout impossible.

## Interview demo points

1. Select each of the four surfaces and show that the same ad is recomposed.
2. Explain that geometry, safe area and constraints are inputs to the resolver.
3. Point to the placed-element panel to explain calculated position and size.
4. Explain the priority/degradation path using the compact stress-test profile in the source.
5. Explain how a new surface can be added without adding a new resolver branch.

## Known limitations

- Text measurement is approximated rather than measured from the rendered DOM before placement.
- The resolver is intentionally a small greedy constraint algorithm rather than a general LP solver.
- Animation and Canvas rendering are not included.

## AI disclosure

If AI tools are used while preparing the submission, disclose the tool and its contribution here before submitting.
