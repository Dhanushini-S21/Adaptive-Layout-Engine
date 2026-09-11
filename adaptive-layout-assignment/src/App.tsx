import { useMemo, useState } from "react";
import { adSpec } from "./spec";
import { surfaces } from "./surfaces";
import { resolveLayout } from "./resolver";
import { AdCanvas } from "./render-dom";

export default function App() {
  const [surfaceId, setSurfaceId] = useState("mobile-portrait");
  const surface = surfaces.find(s => s.id === surfaceId) ?? surfaces[0];
  const layout = useMemo(() => resolveLayout(adSpec, surface), [surface]);

  const previewScale = Math.min(1, 720 / surface.width, 520 / surface.height);
  const previewWidth = surface.width * previewScale;
  const previewHeight = surface.height * previewScale;

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <div className="eyebrow">SYSTEMS THINKING / LAYOUT</div>
          <h1>Adaptive Layout Engine</h1>
          <p>One content specification. Four surfaces. One constraint-based resolver.</p>
        </div>
        <div className="status"><span className="dot" />Resolver active</div>
      </header>

      <section className="controls">
        <div className="control-main">
          <label>
            <span>DEMO SURFACE</span>
            <select value={surfaceId} onChange={e => setSurfaceId(e.target.value)}>
              {surfaces.filter(s => s.id !== "compact-demo").map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <div className="surface-meta">
            <span>{surface.width} × {surface.height}px</span>
            <span>{layout.elements.length} placed</span>
            {layout.droppedElementIds.length > 0 && <span className="degraded">{layout.droppedElementIds.length} degraded</span>}
          </div>
        </div>
        <div className="priority-legend">
          <span><b>P1</b> protected</span>
          <span><b>P2</b> important</span>
          <span><b>P3</b> optional</span>
        </div>
      </section>

      <section className="workspace">
        <div className="preview-panel">
          <div className="panel-title">
            <span>LIVE RESOLVED OUTPUT</span>
            <span>{surface.name}</span>
          </div>
          <div className="preview-frame">
            <div className="preview-scale" style={{ width: previewWidth, height: previewHeight }}>
              <div style={{ transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
                <AdCanvas layout={layout} />
              </div>
            </div>
          </div>
        </div>

        <aside className="info-panel">
          <div className="result-heading">
            <div>
              <span className="eyebrow">RESOLVER OUTPUT</span>
              <h2>Resolution result</h2>
            </div>
            <span className="surface-chip">{surface.width}:{surface.height}</span>
          </div>

          <div className="flow">
            <div><b>01</b><span>Ad Spec</span></div>
            <div><b>02</b><span>Constraint Resolver</span></div>
            <div><b>03</b><span>Resolved Layout</span></div>
          </div>

          <h3>Placed elements</h3>
          <ul className="element-list">
            {layout.elements.map(e => (
              <li key={e.id}>
                <div><strong>{e.id}</strong><em>P{e.priority}</em></div>
                <span>{Math.round(e.rect.width)} × {Math.round(e.rect.height)} · {Math.round(e.rect.x)}, {Math.round(e.rect.y)}</span>
              </li>
            ))}
          </ul>

          {layout.droppedElementIds.length > 0 && (
            <div className="notice"><b>Priority degradation</b><span>{layout.droppedElementIds.join(", ")} removed first because space was insufficient.</span></div>
          )}
          {layout.warnings.length > 0 && (
            <div className="notice warning"><b>Constraint notes</b>{layout.warnings.map((w, i) => <span key={i}>{w}</span>)}</div>
          )}
        </aside>
      </section>

      <section className="explanation">
        <article><span className="eyebrow">INTERVIEW POINT</span><h2>Same spec, different composition</h2><p>The resolver uses aspect ratio and available geometry to move between vertical, horizontal and centered compositions. Surface names are never used as layout keys.</p></article>
        <article><span className="eyebrow">DEGRADATION</span><h2>Priority protects the message</h2><p>Primary content and the CTA are protected first. Optional branding and secondary content can shrink or disappear when constraints become impossible to satisfy.</p></article>
        <article><span className="eyebrow">EXTENSIBLE</span><h2>New surfaces need data, not branches</h2><p>A new surface is represented by another typed profile. The same resolver API consumes its dimensions and constraints.</p></article>
      </section>
    </main>
  );
}
