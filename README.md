Adaptive Layout Engine for Multi-Surface Ads

Overview

This project implements a constraint-based adaptive layout engine for advertisements.

The engine accepts one declarative advertisement specification and a surface profile containing real constraints. It resolves the advertisement into a valid layout for that surface and renders the result using the DOM.

The same advertisement is adapted to:

Mobile portrait

Mobile landscape

Broadcast lower-third

Square retail kiosk

The TypeScript resolver calculates the layout. Separate hardcoded layouts and CSS breakpoints are not used as the layout engine.

Setup Instructions

Prerequisites

Node.js 18+

npm

Git

Install

npm install

Run the demo

npm run dev

Open the local URL shown by Vite, normally:

http://localhost:5173

Production build

npm run build
npm run preview

How to Run the Demo and Switch Surfaces

Use the Surface selector in the demo and switch between:

Mobile Portrait

Mobile Landscape

Broadcast Lower Third

Square Retail Kiosk

The same adSpec is passed to the resolver each time.

Ad Spec + Surface Profile
          |
          v
Constraint Resolver
          |
          v
Resolved Layout
          |
          v
DOM Renderer

The layout changes because the available geometry and constraints change. The system therefore re-composes the advertisement instead of simply scaling one layout.

A compact stress-test surface is also included to demonstrate degradation when available space is limited.

Layout Algorithm

The core implementation is in src/resolver.ts.

The resolver uses a priority-ordered, greedy constraint-resolution approach.

Step 1 — Read the advertisement specification

The advertisement is defined once in src/spec.ts.

Example elements:

Headline       priority 1
Product image  priority 1
CTA            priority 2
Price          priority 2
Logo           priority 3

Lower numbers represent higher priority.

Step 2 — Read the surface profile

The resolver receives:

width

height

safe area

minimum tap target

minimum text size

viewing distance

touch-only constraints

The usable area is calculated after safe-area insets.

Step 3 — Determine composition from geometry

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

Step 4 — Calculate element sizes

Preferred and minimum dimensions are considered.

The resolver attempts to use preferred dimensions while ensuring:

elements remain inside the usable area

minimum sizes are respected where possible

buttons respect minimum tap-target constraints

text respects minimum text-size constraints

higher-priority elements are protected

Step 5 — Position elements

The resolver calculates:

x
y
width
height

for each resolved element.

The renderer consumes these values instead of deciding the layout.

Step 6 — Validate constraints

The resolver checks:

surface bounds

safe-area bounds

element sizes

element collisions

required content

interaction constraints

Elements that would overlap or leave the valid surface are rejected/degraded instead of being allowed to clip.

Priority and Degradation

Priority controls what happens when there is not enough space.

Example:

Priority 1
  Headline
  Product image

Priority 2
  CTA
  Price

Priority 3
  Logo

When space becomes insufficient:

Available space decreases
          |
          v
Lower-priority content is affected first
          |
          v
Branding/secondary content can be removed
          |
          v
Primary content remains protected

The goal is graceful degradation rather than overlap, clipping, or overflow.

The compact stress-test surface demonstrates this behavior.

TypeScript Design

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

Resolution Flow

Ad Spec
   +
Surface Profile
   |
   v
Constraint Resolver
   |
   v
Resolved Layout
   |
   v
Renderer

More specifically:

src/spec.ts
     |
     v
   AdSpec
     |
     +------------------+
     |                  |
     v                  v
Surface Profile     Constraints
     |                  |
     +--------+---------+
              |
              v
       src/resolver.ts
              |
              v
       ResolvedLayout
              |
              v
     src/render-dom.tsx
              |
              v
         Browser DOM

Architecture

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

spec.ts

Defines the advertisement once.

surfaces.ts

Defines surface dimensions and constraints.

resolver.ts

Contains the framework-independent layout-resolution algorithm.

layout-utils.ts

Contains geometry helpers such as collision and bounds checks.

render-dom.tsx

Renders the resolved layout.

App.tsx

Provides the demo interface and surface picker.

index.css

Controls visual presentation. CSS does not decide which layout is selected.

Adding a New Surface

A new surface can be represented by another SurfaceProfile.

For example:

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
    |
    v
resolveLayout(adSpec, newSurface)
    |
    v
Resolved Layout

Known Limitations

No animation or transition between surfaces.

Fixed element type set: text, image, and button.

Text measurement is approximated rather than measured from the browser before placement.

Text wrapping/truncation is not fully text-measurement-aware.

The resolver is a priority-ordered greedy algorithm rather than a full linear-programming solver.

The demo uses a DOM renderer; a Canvas renderer is not included.

Advanced broadcast safe zones and print-bleed constraints are not implemented.

Evaluation Criteria

Area

Weight

Constraint resolution algorithm

35%

Layout correctness across surfaces

25%

TypeScript & architecture

20%

Example application

10%

Code quality

10%

The implementation prioritizes the resolver and correctness rather than visual styling alone.

What This Implementation Avoids

The project does not use hardcoded surface-specific coordinate maps such as:

if (surface === "mobile") {
  return mobileLayout;
}

It also does not rely on CSS media queries to make the actual layout decisions.

The TypeScript resolver determines:

visibility

position

size

priority/degradation

constraint validation

CSS is used for final rendering and presentation.

Timeline and Submission

Time limit

3–5 days.

Submission

GitHub repository.

Optional

A deployed demo can be provided for faster review.

Bonus Opportunities

Possible future extensions:

Fifth unknown surface provided during the interview.

Smooth animated transition between resolved layouts.

Browser-based text measurement.

Canvas renderer sharing the same resolver.

Accessibility constraints such as contrast and tap-target validation.

Broadcast-safe-area and print-bleed constraints.

Live Interview Expectations

1. Demo the same spec across all required surfaces

Demonstrate:

Mobile Portrait
      |
      v
Mobile Landscape
      |
      v
Broadcast Lower Third
      |
      v
Square Retail Kiosk

Explain that the advertisement specification remains unchanged.

Only the surface profile changes.

2. Introduce a new surface

Create a new SurfaceProfile during the interview.

Example:

width: 800
height: 400
safeArea: 20px
minTextSize: 24px

Then pass it to the existing resolver.

The key explanation is:

A new surface does not require another hardcoded layout. The resolver receives its dimensions and constraints and derives the layout using the same algorithm.

3. Explain priority/degradation step by step

Explain:

Every element has a priority. Priority 1 content is protected first. When available space becomes insufficient, the resolver validates the preferred placement and degrades lower-priority content before compromising higher-priority content. Optional branding can disappear before primary content.

4. Explain why an element has its position

Walk through:

Surface dimensions
       |
       v
Safe area
       |
       v
Available space
       |
       v
Element priority
       |
       v
Preferred/minimum size
       |
       v
Collision and bounds validation
       |
       v
Final x/y/width/height

For example:

The CTA is placed in the available action region because it has a defined action priority and minimum tap-target requirement. The resolver checks that its rectangle stays inside the safe area and does not collide with higher-priority content.

5. Discuss how the system can be extended

For broadcast:

Surface
   |
   v
Broadcast safe area
   |
   v
Minimum readable text size
   |
   v
Resolver

For print:

Surface
   |
   v
Bleed area
   |
   v
Trim area
   |
   v
Safe content area
   |
   v
Resolver

The same separation of specification, constraints, resolver, and renderer can support these extensions.

Time Spent

Enter the actual time spent before submitting.

Example:

Approximately 4 days.

AI Disclosure

AI tools were used during development for assistance with project structure, implementation ideas, documentation, and debugging.

The final implementation should be reviewed and understood by the author before submission.

Final Project Summary

ONE AD SPECIFICATION
        +
SURFACE CONSTRAINTS
        |
        v
GENERIC CONSTRAINT RESOLVER
        |
        v
VALID RESOLVED LAYOUT
        |
        v
DOM RENDERER

The key distinction is that the project does not maintain four independent advertisement designs. It maintains one specification and one resolution algorithm that adapts the content to different surfaces while respecting constraints and priority.
