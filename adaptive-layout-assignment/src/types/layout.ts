export type ElementType = "text" | "image" | "button";
export type ElementRole = "primary" | "hero" | "action" | "branding" | "secondary";

export interface AdElement {
  id: string;
  type: ElementType;
  role: ElementRole;
  priority: number;
  content: string;
  minWidth?: number;
  minHeight?: number;
  preferredWidth?: number;
  preferredHeight?: number;
  canShrink?: boolean;
  canDrop?: boolean;
}

export interface AdSpec {
  name: string;
  elements: AdElement[];
}

export interface SafeArea {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SurfaceProfile {
  id: string;
  name: string;
  width: number;
  height: number;
  safeArea?: SafeArea;
  minTapTarget?: number;
  minTextSize?: number;
  viewingDistance?: "near" | "normal" | "far";
  touchOnly?: boolean;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResolvedElement extends AdElement {
  rect: Rect;
  fontSize: number;
  visible: boolean;
  truncated?: boolean;
}

export interface ResolvedLayout {
  surface: SurfaceProfile;
  elements: ResolvedElement[];
  droppedElementIds: string[];
  warnings: string[];
}
