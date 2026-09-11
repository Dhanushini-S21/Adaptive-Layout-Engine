import type {
  AdElement,
  AdSpec,
  ResolvedElement,
  ResolvedLayout,
  SurfaceProfile,
  Rect
} from "./types/layout";
import { inside, overlaps, clamp } from "./layout-utils";

const GAP = 14;

type Candidate = { element: AdElement; rect: Rect; fontSize: number };

function getBounds(surface: SurfaceProfile): Rect {
  const safe = surface.safeArea ?? { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    x: safe.left,
    y: safe.top,
    width: Math.max(1, surface.width - safe.left - safe.right),
    height: Math.max(1, surface.height - safe.top - safe.bottom)
  };
}

function fontFor(surface: SurfaceProfile, role: AdElement["role"]): number {
  const base = surface.minTextSize ?? (surface.height < 300 ? 18 : surface.height < 500 ? 22 : 28);
  if (role === "primary") return Math.max(base, surface.viewingDistance === "far" ? 34 : 26);
  if (role === "secondary") return Math.max(16, base - 2);
  return Math.max(12, base - 6);
}

function candidate(element: AdElement, rect: Rect, surface: SurfaceProfile): Candidate {
  return { element, rect, fontSize: fontFor(surface, element.role) };
}

function find(elements: AdElement[], role: AdElement["role"]): AdElement | undefined {
  return elements.find(e => e.role === role);
}

function add(candidates: Candidate[], element: AdElement | undefined, rect: Rect, surface: SurfaceProfile) {
  if (!element) return;
  candidates.push(candidate(element, rect, surface));
}

function fitAndValidate(
  candidates: Candidate[],
  bounds: Rect,
  surface: SurfaceProfile,
  warnings: string[]
): ResolvedElement[] {
  const ordered = [...candidates].sort((a, b) => a.element.priority - b.element.priority);
  const placed: ResolvedElement[] = [];

  for (const c of ordered) {
    const minTap = c.element.type === "button" ? (surface.minTapTarget ?? 44) : 0;
    const minWidth = Math.max(c.element.minWidth ?? 1, minTap);
    const minHeight = Math.max(c.element.minHeight ?? 1, minTap);

    let width = Math.max(c.rect.width, minWidth);
    let height = Math.max(c.rect.height, minHeight);

    // Shrink optional elements before rejecting them.
    if (width > bounds.width || height > bounds.height) {
      if (c.element.canShrink) {
        const scale = Math.min(bounds.width / width, bounds.height / height, 1);
        width = Math.max(minWidth, Math.floor(width * scale));
        height = Math.max(minHeight, Math.floor(height * scale));
      }
    }

    if (width > bounds.width || height > bounds.height) {
      warnings.push(`${c.element.id} could not satisfy the available surface size.`);
      continue;
    }

    let rect: Rect = {
      x: c.rect.x,
      y: c.rect.y,
      width,
      height
    };

    rect.x = clamp(rect.x, bounds.x, bounds.x + bounds.width - rect.width);
    rect.y = clamp(rect.y, bounds.y, bounds.y + bounds.height - rect.height);

    // Small deterministic nudge search prevents overlap without using surface-specific coordinates.
    const offsets = [
      [0, 0], [GAP, 0], [-GAP, 0], [0, GAP], [0, -GAP],
      [GAP * 2, 0], [-GAP * 2, 0], [0, GAP * 2], [0, -GAP * 2]
    ];

    let found = false;
    for (const [dx, dy] of offsets) {
      const test: Rect = {
        ...rect,
        x: clamp(rect.x + dx, bounds.x, bounds.x + bounds.width - rect.width),
        y: clamp(rect.y + dy, bounds.y, bounds.y + bounds.height - rect.height)
      };
      if (inside(test, bounds) && !placed.some(p => overlaps(test, p.rect))) {
        rect = test;
        found = true;
        break;
      }
    }

    if (!found) {
      if (c.element.canDrop) {
        warnings.push(`${c.element.id} was dropped because no non-overlapping position was available.`);
        continue;
      }
      warnings.push(`${c.element.id} could not be placed without overlap.`);
      continue;
    }

    placed.push({ ...c.element, rect, fontSize: c.fontSize, visible: true });
  }

  return placed;
}

/**
 * Constraint resolver: composition is derived from aspect ratio, dimensions,
 * safe-area, minimum interaction/text constraints and element priorities.
 * No surface name is used to select a pre-authored coordinate map.
 */
export function resolveLayout(spec: AdSpec, surface: SurfaceProfile): ResolvedLayout {
  const bounds = getBounds(surface);
  const ratio = bounds.width / bounds.height;
  const elements = [...spec.elements];
  const warnings: string[] = [];
  const candidates: Candidate[] = [];

  const hero = find(elements, "hero");
  const headline = find(elements, "primary");
  const action = find(elements, "action");
  const secondary = find(elements, "secondary");
  const branding = find(elements, "branding");

  if (ratio >= 2.2) {
    // Wide surfaces become a horizontal information strip.
    const heroW = Math.min(Math.max(hero?.minWidth ?? 110, bounds.height * 0.82), bounds.width * 0.2);
    const rightW = Math.max(120, bounds.width * 0.18);
    const contentX = bounds.x + heroW + GAP;
    const contentW = Math.max(100, bounds.width - heroW - rightW - GAP * 3);

    add(candidates, hero, { x: bounds.x, y: bounds.y, width: heroW, height: bounds.height }, surface);
    add(candidates, headline, {
      x: contentX, y: bounds.y + bounds.height * 0.12,
      width: contentW, height: bounds.height * 0.40
    }, surface);
    add(candidates, secondary, {
      x: contentX, y: bounds.y + bounds.height * 0.57,
      width: Math.min(150, contentW * 0.35), height: bounds.height * 0.25
    }, surface);
    add(candidates, action, {
      x: bounds.x + bounds.width - rightW,
      y: bounds.y + (bounds.height - Math.max(52, surface.minTapTarget ?? 52)) / 2,
      width: rightW, height: Math.max(52, surface.minTapTarget ?? 52)
    }, surface);
    add(candidates, branding, {
      x: bounds.x + bounds.width - rightW,
      y: bounds.y + 8,
      width: rightW, height: Math.min(30, bounds.height * 0.24)
    }, surface);
  } else if (ratio <= 0.88) {
    // Tall surfaces stack content vertically and protect the action area.
    const headerH = Math.min(70, bounds.height * 0.14);
    const footerH = Math.max(92, bounds.height * 0.20);
    const heroSize = Math.min(bounds.width * 0.78, bounds.height - headerH - footerH - 80);
    const centerX = bounds.x + bounds.width / 2;

    add(candidates, branding, {
      x: bounds.x + bounds.width * 0.55,
      y: bounds.y,
      width: bounds.width * 0.40,
      height: 32
    }, surface);
    add(candidates, headline, {
      x: bounds.x + 4,
      y: bounds.y + 34,
      width: bounds.width - 8,
      height: headerH
    }, surface);
    add(candidates, hero, {
      x: centerX - heroSize / 2,
      y: bounds.y + headerH + GAP,
      width: heroSize,
      height: heroSize
    }, surface);
    add(candidates, secondary, {
      x: bounds.x + 8,
      y: bounds.y + bounds.height - footerH,
      width: bounds.width * 0.36,
      height: 38
    }, surface);
    add(candidates, action, {
      x: bounds.x + bounds.width * 0.43,
      y: bounds.y + bounds.height - footerH + 2,
      width: bounds.width * 0.52,
      height: Math.max(surface.minTapTarget ?? 44, 54)
    }, surface);
  } else {
    // Square/medium surfaces use a centered hero with a structured lower content band.
    const topBand = Math.min(58, bounds.height * 0.10);
    const lowerBand = Math.min(180, bounds.height * 0.25);
    const heroSize = Math.min(bounds.width * 0.56, bounds.height - topBand - lowerBand - GAP * 2);
    const centerX = bounds.x + bounds.width / 2;

    add(candidates, branding, {
      x: bounds.x + 18, y: bounds.y + 10, width: Math.min(150, bounds.width * 0.30), height: 34
    }, surface);
    add(candidates, hero, {
      x: centerX - heroSize / 2, y: bounds.y + topBand,
      width: heroSize, height: heroSize
    }, surface);
    add(candidates, headline, {
      x: bounds.x + bounds.width * 0.12,
      y: bounds.y + bounds.height - lowerBand,
      width: bounds.width * 0.76,
      height: 56
    }, surface);
    add(candidates, secondary, {
      x: bounds.x + bounds.width * 0.12,
      y: bounds.y + bounds.height - 82,
      width: 130, height: 42
    }, surface);
    add(candidates, action, {
      x: bounds.x + bounds.width * 0.55,
      y: bounds.y + bounds.height - 88,
      width: bounds.width * 0.33,
      height: Math.max(surface.minTapTarget ?? 52, 54)
    }, surface);
  }

  const placed = fitAndValidate(candidates, bounds, surface, warnings);
  const present = new Set(placed.map(e => e.id));
  const droppedElementIds: string[] = [];

  for (const element of elements) {
    if (!present.has(element.id)) {
      if (element.canDrop) droppedElementIds.push(element.id);
      else warnings.push(`Required element "${element.id}" was not placed.`);
    }
  }

  return { surface, elements: placed, droppedElementIds, warnings };
}
