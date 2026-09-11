import type { ResolvedLayout, ResolvedElement } from "./types/layout";

function ProductArtwork() {
  return (
    <div className="product-art">
      <div className="product-shadow" />
      <div className="headband" />
      <div className="earcup left"><span /></div>
      <div className="earcup right"><span /></div>
    </div>
  );
}

function renderElement(element: ResolvedElement) {
  const style: React.CSSProperties = {
    left: element.rect.x,
    top: element.rect.y,
    width: element.rect.width,
    height: element.rect.height,
    fontSize: element.fontSize
  };

  if (element.role === "hero") {
    return <div key={element.id} className="ad-element hero-image" style={style}><ProductArtwork /></div>;
  }
  if (element.role === "branding") {
    return <div key={element.id} className="ad-element logo" style={style}><span className="logo-mark">N</span>{element.content}</div>;
  }
  if (element.type === "button") {
    return <button key={element.id} className="ad-element cta" style={style}>{element.content}<span>↗</span></button>;
  }
  return <div key={element.id} className={`ad-element text ${element.role}`} style={style}>{element.content}</div>;
}

export function AdCanvas({ layout }: { layout: ResolvedLayout }) {
  const ratio = layout.surface.width / layout.surface.height;
  const mode = ratio >= 2.2 ? "wide" : ratio <= 0.88 ? "portrait" : "square";

  return (
    <div className={`ad-canvas ${mode}`} style={{ width: layout.surface.width, height: layout.surface.height }}>
      <div className="ad-grid" />
      <div className="ad-kicker">NOVA AIR / SMART AUDIO</div>
      {layout.elements.map(renderElement)}
      <div className="ad-footer-mark">ENGINEERED FOR EVERY SURFACE</div>
    </div>
  );
}
