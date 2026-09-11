# Adaptive Layout Engine for Multi-Surface Ads

## Overview

This project implements a constraint-based adaptive layout engine for advertisements.

The engine accepts one declarative advertisement specification and a surface profile containing real constraints. It resolves the advertisement into a valid layout for that surface and renders the result using the DOM.

The same advertisement is adapted to Mobile Portrait, Mobile Landscape, Broadcast Lower Third, and Square Retail Kiosk.

The TypeScript resolver calculates the layout. Separate hardcoded layouts and CSS breakpoints are not used as the layout engine.

## Setup Instructions

Prerequisites:
- Node.js 18+
- npm
- Git

Install dependencies:

npm install

Run the demo:

npm run dev

Open the local URL shown by Vite, normally:

http://localhost:5173

Production build:

npm run build
npm run preview

## How to Run the Demo and Switch Surfaces

Use the Surface selector in the demo and switch between:

1. Mobile Portrait
2. Mobile Landscape
3. Broadcast Lower Third
4. Square Retail Kiosk

The same adSpec is passed to the resolver each time.

Ad Spec + Surface Profile → Constraint Resolver → Resolved Layout → DOM Renderer

The layout changes because the available geometry and constraints change. The system therefore re-composes the advertisement instead of simply scaling one layout.

A compact stress-test surface is also included to demonstrate degradation when available space is limited.

## Layout Algorithm

The core implementation is in:

src/resolver.ts

The resolver uses a priority-ordered, greedy constraint-resolution approach.

### Step 1 — Read the advertisement specification

The advertisement is defined once in:

src/spec.ts

Example elements:

Headline — priority 1
Product image — priority 1
CTA — priority 2
Price — priority 2
Logo — priority 3

Lower numbers represent higher priority.

### Step 2 — Read the surface profile

The resolver receives:

- Width
- Height
- Safe area
- Minimum tap target
- Minimum text size
- Viewing distance
- Touch-only constraints

The usable area is calculated after safe-area insets.

### Step 3 — Determine composition from geometry

The resolver examines the aspect ratio and available dimensions.

Tall surfaces naturally use a vertical composition.

Very wide surfaces naturally use a horizontal/lower-third composition.

Medium or square surfaces use a centered/two-zone composition.

These decisions are based on dimensions and constraints, not on a surface-name lookup.

There is no approach such as:

if (surface === "mobile") {
  return mobileLayout;
}

The same resolver is used for every surface.

### Step 4 — Calculate element sizes

Preferred and minimum dimensions are considered.

The resolver attempts to use preferred dimensions while ensuring:

- Elements remain inside the usable area.
- Minimum sizes are respected where possible.
- Buttons respect minimum tap-target constraints.
- Text respects minimum text-size constraints.
- Higher-priority elements are protected.

### Step 5 — Position elements

The resolver calculates x, y, width, and height for each resolved element.

The renderer consumes these values instead of deciding the layout.

### Step 6 — Validate constraints

The resolver checks:

- Surface bounds
- Safe-area bounds
- Element sizes
- Element collisions
- Required content
- Interaction constraints

Elements that would overlap or leave the valid surface are rejected or degraded instead of being allowed to clip.

## Priority and Degradation

Priority controls what happens when there is not enough space.

Example:

Priority 1:
- Headline
- Product image

Priority 2:
- CTA
- Price

Priority 3:
- Logo

When space becomes insufficient:

Available space decreases
→ Lower-priority content is affected first
→ Branding/secondary content can be removed
→ Primary content remains protected

The goal is graceful degradation rather than overlap, clipping, overflow, or removing important content before optional content.

The compact stress-test surface demonstrates this behavior.

## TypeScript Design

Shared types are defined in:

src/types/layout.ts

Important types include:

ElementType
ElementRole
AdElement
AdSpec
SafeArea
SurfaceProfile
Rect
ResolvedElement
ResolvedLayout

ElementType restricts supported element types to the defined values.

ElementRole restricts element roles to valid roles.

SurfaceProfile describes the valid surface constraints.

ResolvedLayout defines exactly what the renderer receives.

Example:

export interface ResolvedLayout {
  surface: SurfaceProfile;
  elements: ResolvedElement[];
  droppedElementIds: string[];
  warnings: string[];
}

This makes the specification, constraint resolution, and rendering contracts explicit and allows TypeScript to catch invalid values during development.

## Resolution Flow

Ad Spec
+
Surface Profile
↓
Constraint Resolver
↓
Resolved Layout
↓
Renderer

More specifically:

src/spec.ts
↓
AdSpec
↓
Surface Profile + Constraints
↓
src/resolver.ts
↓
ResolvedLayout
↓
src/render-dom.tsx
↓
Browser DOM

## Architecture

src/
├── types/
│   └── layout.ts
├── spec.ts
├── surfaces.ts
├── resolver.ts
├── layout-utils.ts
├── render-dom.tsx
├── App.tsx
├── main.tsx
└── index.css

### spec.ts

Defines the advertisement once.

### surfaces.ts

Defines surface dimensions and constraints.

### resolver.ts

Contains the framework-independent layout-resolution algorithm.

### layout-utils.ts

Contains geometry helpers such as collision and bounds checks.

### render-dom.tsx

Renders the resolved layout.

### App.tsx

Provides the demonstration interface and surface picker.

### index.css

Controls visual presentation.

CSS does not decide which layout is selected.

## Adding a New Surface

A new surface can be represented by another SurfaceProfile.

Example:

{
  id: "new-surface",
  name: "New Surface",
  width: 800,
  height: 400,
  safeArea: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  },
  minTextSize: 24
}

The existing resolver can process it without creating a new hardcoded layout:

New Surface
↓
resolveLayout(adSpec, newSurface)
↓
Resolved Layout

## Known Limitations

- No animation or transition between surfaces.
- Fixed element type set: text, image, and button.
- Text measurement is approximated rather than measured from the browser before placement.
- Text wrapping/truncation is not fully text-measurement-aware.
- The resolver is a priority-ordered greedy algorithm rather than a full linear-programming solver.
- The demo uses a DOM renderer; a Canvas renderer is not included.
- Advanced broadcast safe zones and print-bleed constraints are not implemented.

## Evaluation Criteria

Constraint resolution algorithm — 35%
Layout correctness across surfaces — 25%
TypeScript & architecture — 20%
Example application — 10%
Code quality — 10%

The implementation prioritizes the resolver and correctness rather than visual styling alone.

## What This Implementation Avoids

The project does not use hardcoded surface-specific coordinate maps such as:

if (surface === "mobile") {
  return mobileLayout;
}

It also does not rely on CSS media queries to make the actual layout decisions.

The TypeScript resolver determines:

- Visibility
- Position
- Size
- Priority/degradation
- Constraint validation

CSS is used for final rendering and presentation.

## Submission:

GitHub repository.

Optional:

A deployed demo can be provided for faster review.


## AI Disclosure

AI tools were used during development for assistance with project structure, implementation ideas, documentation, and debugging.

The final implementation should be reviewed and understood by the author.

## Final Project Summary

ONE AD SPECIFICATION
+
SURFACE CONSTRAINTS
↓
GENERIC CONSTRAINT RESOLVER
↓
VALID RESOLVED LAYOUT
↓
DOM RENDERER

The key distinction is that the project does not maintain four independent advertisement designs.

It maintains one specification and one resolution algorithm that adapts the content to different surfaces while respecting constraints and priority.
