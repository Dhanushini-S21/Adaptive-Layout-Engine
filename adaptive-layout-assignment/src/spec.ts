import type { AdSpec } from "./types/layout";

export function defineAd(spec: AdSpec): AdSpec {
  const ids = new Set<string>();
  for (const element of spec.elements) {
    if (ids.has(element.id)) {
      throw new Error(`Duplicate element id: ${element.id}`);
    }
    ids.add(element.id);
  }
  return spec;
}

export const adSpec = defineAd({
  name: "Nova Air — Smart Headphones",
  elements: [
    {
      id: "headline",
      type: "text",
      role: "primary",
      priority: 1,
      content: "Sound that follows you.",
      minWidth: 150,
      minHeight: 42,
      preferredWidth: 360,
      preferredHeight: 70,
      canShrink: true,
      canDrop: false
    },
    {
      id: "product-image",
      type: "image",
      role: "hero",
      priority: 1,
      content: "HEADPHONES",
      minWidth: 110,
      minHeight: 100,
      preferredWidth: 300,
      preferredHeight: 250,
      canShrink: true,
      canDrop: false
    },
    {
      id: "cta",
      type: "button",
      role: "action",
      priority: 2,
      content: "SHOP NOW",
      minWidth: 110,
      minHeight: 44,
      preferredWidth: 150,
      preferredHeight: 52,
      canShrink: true,
      canDrop: false
    },
    {
      id: "price",
      type: "text",
      role: "secondary",
      priority: 2,
      content: "₹4,999",
      minWidth: 70,
      minHeight: 28,
      preferredWidth: 120,
      preferredHeight: 38,
      canShrink: true,
      canDrop: true
    },
    {
      id: "logo",
      type: "image",
      role: "branding",
      priority: 3,
      content: "NOVA AIR",
      minWidth: 70,
      minHeight: 26,
      preferredWidth: 110,
      preferredHeight: 34,
      canShrink: true,
      canDrop: true
    }
  ]
});
