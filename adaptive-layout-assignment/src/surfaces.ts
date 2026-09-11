import type { SurfaceProfile } from "./types/layout";

export const surfaces: SurfaceProfile[] = [
  {
    id: "mobile-portrait",
    name: "Mobile Portrait",
    width: 320,
    height: 480,
    safeArea: { top: 16, right: 16, bottom: 16, left: 16 },
    minTapTarget: 44,
    viewingDistance: "near",
    touchOnly: true
  },
  {
    id: "mobile-landscape",
    name: "Mobile Landscape",
    width: 480,
    height: 320,
    safeArea: { top: 12, right: 16, bottom: 12, left: 16 },
    minTapTarget: 44,
    viewingDistance: "near",
    touchOnly: true
  },
  {
    id: "broadcast-lower-third",
    name: "Broadcast Lower Third",
    width: 1920,
    height: 250,
    safeArea: { top: 20, right: 70, bottom: 20, left: 70 },
    minTextSize: 32,
    viewingDistance: "far"
  },
  {
    id: "square-kiosk",
    name: "Square Retail Kiosk",
    width: 1080,
    height: 1080,
    safeArea: { top: 36, right: 36, bottom: 36, left: 36 },
    minTapTarget: 60,
    viewingDistance: "normal",
    touchOnly: true
  },
  {
    id: "compact-demo",
    name: "Compact Stress Test",
    width: 240,
    height: 180,
    safeArea: { top: 10, right: 10, bottom: 10, left: 10 },
    minTapTarget: 44,
    viewingDistance: "near",
    touchOnly: true
  }
];
