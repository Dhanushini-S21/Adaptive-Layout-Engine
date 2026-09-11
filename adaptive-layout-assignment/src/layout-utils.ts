import type { Rect } from "./types/layout";

export function overlaps(a: Rect, b: Rect, gap = 8): boolean {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

export function inside(rect: Rect, bounds: Rect): boolean {
  return (
    rect.x >= bounds.x &&
    rect.y >= bounds.y &&
    rect.x + rect.width <= bounds.x + bounds.width &&
    rect.y + rect.height <= bounds.y + bounds.height
  );
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function fitRect(
  preferredWidth: number,
  preferredHeight: number,
  maxWidth: number,
  maxHeight: number
): Rect {
  const scale = Math.min(maxWidth / preferredWidth, maxHeight / preferredHeight, 1);
  return {
    x: 0,
    y: 0,
    width: Math.max(1, Math.floor(preferredWidth * scale)),
    height: Math.max(1, Math.floor(preferredHeight * scale))
  };
}
