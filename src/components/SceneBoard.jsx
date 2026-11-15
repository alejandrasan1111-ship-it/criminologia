import React, { useState } from 'react';
import { Crosshair, Info, RotateCcw, MousePointer2 } from 'lucide-react';

// Posiciones de los marcadores sobre la imagen del caso (porcentajes).
const PIN_SPOTS = [
  { left: '17%', top: '26%' },
  { left: '63%', top: '19%' },
  { left: '33%', top: '62%' },
  { left: '74%', top: '65%' },
  { left: '49%', top: '41%' }
];

/**
 * Tablero de inspección de la escena.
 * Usa la imagen real del caso (cada escenario tiene la suya) y coloca
 * un marcador por indicio. Sustituye a la antigua habitación 3D genérica.
 */
export default function SceneBoard({ scene, image, caseTitle, discovered, onDiscover }) {
  const [selected, setSelected] = useState(null);

  const inspect = (spot) => {
    setSelected(spot);
    if (onDiscover) onDiscover(spot);
  };

  const total = scene.hotspots.length;
  const progress = Math.round((discovered.length / Math.max(total, 1)) * 100);

  return (
    <section className="scene-investigation">
      <div className="scene-visual-brief">
        <img src={image} alt={`Referencia visual del caso: ${caseTitle || scene.title}`} />
        <div className="scene-visual-copy">
          <span className="eyebrow">CONTEXTO DEL CASO</span>
          <h3>{caseTitle || scene.title}</h3>
          <p>{scene.description}</p>
          <div className="scene-progress-line"><span style={{ width: `${progress}%` }} /></div>
          <small>{discovered.length} DE {total} INDICIOS EXPLORADOS</small>
        </div>
      </div>

      <div className="scene-clue-gallery">
        {scene.hotspots.map((spot, i) => (
          <button
            key={spot.id}
            className={`scene-clue-card ${selected?.id === spot.id ? 'active' : ''} ${discovered.includes(spot.id) ? 'found' : ''}`}
            onClick={() => inspect(spot)}
          >
            <span className="scene-clue-number">{discovered.includes(spot.id) ? '✓' : String(i + 1).padStart(2, '0')}</span>
            <span className="scene-clue-mark" style={{ background: spot.color }} />
            <strong>{spot.label}</strong>
            <small>{discovered.includes(spot.id) ? 'HALLAZGO REGISTRADO' : 'PULSA PARA INSPECCIONAR'}</small>
          </button>
        ))}
      </div>

      <div className="scene-layout">
        <div className="scene-board-photo">
          <img src={image} alt={scene.title} />
          {scene.hotspots.map((spot, i) => {
            const pos = PIN_SPOTS[i % PIN_SPOTS.length];
            const isFound = discovered.includes(spot.id);
            return (
              <button
                key={spot.id}
                type="button"
                className={`scene-pin ${selected?.id === spot.id ? 'active' : ''} ${isFound ? 'found' : ''}`}
                style={{ left: pos.left, top: pos.top, '--pin-color': spot.color }}
                onClick={() => inspect(spot)}
                aria-label={`Inspeccionar ${spot.label}`}
              >
                <span className="scene-pin-dot">{isFound ? '✓' : i + 1}</span>
                <span className="scene-pin-label">{spot.label}</span>
              </button>
            );
          })}
          <div className="scene-overlay top">
            <span><Crosshair size={14} /> ESCENA DEL CASO</span>
            <span><MousePointer2 size={13} /> TOCA UN MARCADOR</span>
          </div>
          <div className="scene-overlay bottom">
            <span>{scene.title}</span>
            <span>{discovered.length}/{total} INSPECCIONADOS</span>
          </div>
        </div>

        <div className="scene-sidebar">
          <div className="scene-side-title">
            <div><span className="eyebrow">GUÍA DE INSPECCIÓN</span><h3>{scene.title}</h3></div>
            <button className="icon-button" onClick={() => setSelected(null)} title="Quitar selección"><RotateCcw size={16} /></button>
          </div>
          <p className="muted small">{scene.description}</p>
          <div className="hotspot-list">
            {scene.hotspots.map((spot, i) => (
              <button
                key={spot.id}
                className={`hotspot-row ${selected?.id === spot.id ? 'active' : ''} ${discovered.includes(spot.id) ? 'found' : ''}`}
                onClick={() => inspect(spot)}
              >
                <span className="hotspot-index">{discovered.includes(spot.id) ? '✓' : String(i + 1).padStart(2, '0')}</span>
                <span className="hotspot-name">
                  {spot.label}
                  <small>{discovered.includes(spot.id) ? 'Inspeccionado' : 'Pendiente de inspección'}</small>
                </span>
                <span className="hotspot-dot" style={{ background: spot.color }} />
              </button>
            ))}
          </div>
          {selected ? (
            <div className="evidence-note">
              <span className="eyebrow">NOTA DE INSPECCIÓN</span>
              <h4>{selected.label}</h4>
              <p>{selected.detail}</p>
            </div>
          ) : (
            <div className="scene-hint">
              <Info size={16} />
              <span>Selecciona un marcador sobre la imagen o un elemento de la lista para leer la nota de inspección.</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
