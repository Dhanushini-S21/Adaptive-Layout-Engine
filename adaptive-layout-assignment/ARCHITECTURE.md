# Architecture

```text
             Ad Specification
                    |
                    v
            Surface Profile
                    |
                    v
          +-------------------+
          | Constraint        |
          | Resolver          |
          +-------------------+
             |     |      |
             |     |      |
          sizing positioning
             \     |      /
              \    |     /
               v   v    v
             Resolved Layout
                    |
                    v
              DOM Renderer
```

## Responsibilities

### `spec.ts`
Describes content and intent once. It does not know the target surface.

### `surfaces.ts`
Describes physical and interaction constraints. It does not contain coordinates for ad elements.

### `resolver.ts`
Owns layout decisions. It reads dimensions, safe areas, minimum sizes, priorities and element capabilities, then emits coordinates and sizes.

### `render-dom.tsx`
Consumes the resolved output and renders it. It does not decide the composition.

### `App.tsx`
Connects the demo controls to the resolver and exposes the result visually.

## Adding a new surface

Add another `SurfaceProfile` to `surfaces.ts`. The resolver receives the same type and derives a layout from its dimensions/constraints. No new renderer or surface-specific coordinate map is required.

## Degradation

Lower-priority elements are candidates for removal when constraints cannot be satisfied. Required priority-1 content is protected ahead of optional branding/secondary content.

## Extension points

The next improvements could include:

- browser text measurement
- explicit safe-zone constraints
- a Canvas renderer
- animation between resolved states
- richer element types
- accessibility/contrast constraints
