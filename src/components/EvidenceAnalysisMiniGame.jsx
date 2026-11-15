import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Brain, Check, X, RotateCcw, ArrowRight } from 'lucide-react';

/**
 * Mini-juegos de análisis forense.
 * Cada ronda plantea un objetivo visible y el jugador debe acertarlo.
 * Al terminar, devuelve la puntuación obtenida en `onComplete(score)`.
 */
const GAMES = {
  patternMatch: {
    id: 'patternMatch',
    title: 'Análisis de patrón de evidencia',
    description: 'Relaciona la evidencia central con el patrón correcto.',
    difficulty: 'Intermedio',
    rounds: 5,
    reward: 15,
    penalty: 5,
    patterns: [
      { id: 'fingerprints', label: 'Huellas dactilares', color: '#00B4FF' },
      { id: 'dna', label: 'Muestra de ADN', color: '#35D9FF' },
      { id: 'fibers', label: 'Fibras textiles', color: '#FFD700' },
      { id: 'toolmarks', label: 'Marcas de herramienta', color: '#E61B2E' },
      { id: 'glass', label: 'Fragmentos de vidrio', color: '#94A3B8' }
    ]
  },
  timelineReconstruction: {
    id: 'timelineReconstruction',
    title: 'Reconstrucción cronológica',
    description: 'Ordena los hechos según la hora en que ocurrieron.',
    difficulty: 'Avanzado',
    rounds: 4,
    reward: 20,
    penalty: 10,
    events: [
      { id: 'arrival', label: 'Llegada del sospechoso', time: '20:14' },
      { id: 'contact', label: 'Primera interacción', time: '20:30' },
      { id: 'theft', label: 'Sustracción del dispositivo', time: '21:14' },
      { id: 'backup', label: 'Llegada de refuerzos', time: '21:45' },
      { id: 'exit', label: 'Salida del sospechoso', time: '22:00' }
    ]
  },
  contradictionDetection: {
    id: 'contradictionDetection',
    title: 'Detección de contradicciones',
    description: 'Detecta la declaración que no se sostiene.',
    difficulty: 'Principiante',
    rounds: 3,
    reward: 10,
    penalty: 3,
    statements: [
      { id: 'A', label: 'Declaración A', consistency: 95, text: 'Vio al sospechoso entrar por la puerta principal a las 20:14.' },
      { id: 'B', label: 'Declaración B', consistency: 67, text: 'Escuchó pasos en el pasillo, pero no recuerda la hora.' },
      { id: 'C', label: 'Declaración C', consistency: 45, text: 'Dice que estuvo fuera toda la noche, aunque su registro lo contradice.' },
      { id: 'D', label: 'Declaración D', consistency: 88, text: 'Confirma la presencia del sospechoso y describe su chaqueta.' }
    ]
  }
};

const GAME_ORDER = ['patternMatch', 'timelineReconstruction', 'contradictionDetection'];

export default function EvidenceAnalysisMiniGame({ onComplete, onClose }) {
  const [gameId, setGameId] = useState(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);
  const [finished, setFinished] = useState(false);
  const reported = useRef(false);

  const game = gameId ? GAMES[gameId] : null;

  const start = (id) => {
    reported.current = false;
    setGameId(id);
    setRound(0);
    setScore(0);
    setPicked(null);
    setFinished(false);
  };

  // Objetivo de cada ronda (cambia con el juego y la ronda)
  const ask = useMemo(() => {
    if (!game) return null;
    if (game.id === 'patternMatch') {
      return { target: game.patterns[(round * 2 + 1) % game.patterns.length] };
    }
    if (game.id === 'timelineReconstruction') {
      const ordered = [...game.events].sort((a, b) => a.time.localeCompare(b.time));
      return { target: ordered[round] };
    }
    const lowest = [...game.statements].sort((a, b) => a.consistency - b.consistency);
    return { target: round === 1 ? lowest[lowest.length - 1] : lowest[0] };
  }, [game, round]);

  const answer = (optionId) => {
    if (picked) return;
    const correct = optionId === ask.target.id;
    setPicked(correct ? 'correct' : 'wrong');
    setScore(prev => prev + (correct ? game.reward : -game.penalty));
  };

  // Pasa a la siguiente ronda o cierra el juego
  useEffect(() => {
    if (!picked) return;
    const timer = window.setTimeout(() => {
      setPicked(null);
      if (round + 1 >= game.rounds) setFinished(true);
      else setRound(r => r + 1);
    }, 950);
    return () => window.clearTimeout(timer);
  }, [picked, round, game]);

  useEffect(() => {
    if (!finished || reported.current) return;
    reported.current = true;
    if (onComplete) onComplete(Math.max(0, score), game.rounds * game.reward, game.id);
  }, [finished, score, game, onComplete]);

  /* --------------------------- selección de juego --------------------------- */
  if (!game) {
    return (
      <section className="mini-game-section">
        <header className="game-header">
          <div className="game-icon"><Brain size={30} /></div>
          <div>
            <h2>Entrenamiento forense</h2>
            <p>Elige un ejercicio. Cada acierto suma XP a tu perfil de investigador.</p>
          </div>
        </header>
        <div className="game-picker">
          {GAME_ORDER.map(id => {
            const g = GAMES[id];
            return (
              <button key={id} type="button" className="game-pick-card" onClick={() => start(id)}>
                <span className="game-pick-difficulty">{g.difficulty}</span>
                <strong>{g.title}</strong>
                <p>{g.description}</p>
                <span className="game-pick-meta">{g.rounds} rondas · +{g.reward} XP por acierto</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  /* --------------------------------- resultado -------------------------------- */
  if (finished) {
    const total = Math.max(0, score);
    return (
      <section className="mini-game-section">
        <div className="game-over-content">
          <div className="game-over-title">{total > 0 ? 'Análisis completado' : 'Análisis sin puntuación'}</div>
          <div className="game-over-score">
            <span className="score-value">{total}</span>
            <span className="score-unit">XP</span>
          </div>
          <p className="game-over-message">
            {game.title} · {game.rounds} rondas completadas.
            {onComplete ? ' La experiencia se ha añadido a tu perfil.' : ''}
          </p>
          <div className="game-over-actions">
            <button className="button-primary" onClick={() => start(game.id)}><RotateCcw size={16} /> Repetir</button>
            <button className="button-secondary" onClick={() => { reported.current = true; setGameId(null); }}>Elegir otro ejercicio</button>
            {onClose && <button className="button-secondary" onClick={onClose}>Cerrar</button>}
          </div>
        </div>
      </section>
    );
  }

  /* ---------------------------------- partida --------------------------------- */
  const feedbackClass = picked === 'correct' ? 'correct' : picked === 'wrong' ? 'wrong' : '';

  return (
    <section className="mini-game-section">
      <header className="game-header">
        <div className="game-icon"><Brain size={28} /></div>
        <div>
          <h2>{game.title}</h2>
          <p>{game.description}</p>
        </div>
        <div className="game-progress">
          <span>Ronda {round + 1}/{game.rounds}</span>
          <span>{Math.max(0, score)} XP</span>
        </div>
      </header>

      <div className={`game-body ${feedbackClass}`}>
        {game.id === 'patternMatch' && (
          <div className="pattern-match-game">
            <p className="game-instruction">
              Evidencia central: <strong style={{ color: ask.target.color }}>{ask.target.label}</strong>
              <br /><small>Selecciona la tarjeta que corresponde a esa evidencia.</small>
            </p>
            <div className="pattern-grid">
              {game.patterns.map(pattern => (
                <button
                  key={pattern.id}
                  type="button"
                  className={`pattern-cell ${picked && pattern.id === ask.target.id ? 'is-target' : ''}`}
                  onClick={() => answer(pattern.id)}
                  disabled={!!picked}
                >
                  <span className="pattern-color" style={{ backgroundColor: pattern.color }} />
                  <span className="pattern-label">{pattern.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {game.id === 'timelineReconstruction' && (
          <div className="timeline-game">
            <p className="game-instruction">
              ¿Qué hecho ocurrió en el puesto <strong>{round + 1}º</strong> de la secuencia?
            </p>
            <div className="timeline-container">
              {game.events.map(event => (
                <button
                  key={event.id}
                  type="button"
                  className={`timeline-event ${picked && event.id === ask.target.id ? 'is-target' : ''}`}
                  onClick={() => answer(event.id)}
                  disabled={!!picked}
                >
                  <span className="timeline-label">{event.label}</span>
                  {picked && <span className="timeline-time">{event.time}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {game.id === 'contradictionDetection' && (
          <div className="contradiction-game">
            <p className="game-instruction">
              {round === 1
                ? 'Selecciona la declaración con MAYOR consistencia.'
                : 'Selecciona la declaración con MENOR consistencia.'}
            </p>
            <div className="statements-list">
              {game.statements.map(stmt => (
                <button
                  key={stmt.id}
                  type="button"
                  className={`statement-item ${picked && stmt.id === ask.target.id ? 'is-target' : ''}`}
                  onClick={() => answer(stmt.id)}
                  disabled={!!picked}
                >
                  <span className="statement-label">{stmt.label}</span>
                  <span className="statement-text">{stmt.text}</span>
                  {picked && (
                    <>
                      <div className="consistency-bar">
                        <div
                          className="consistency-fill"
                          style={{ width: `${stmt.consistency}%` }}
                        />
                      </div>
                      <span className="consistency-percent">{stmt.consistency}%</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="game-footer">
        {picked === 'correct' && <span className="game-feedback ok"><Check size={16} /> Correcto · +{game.reward} XP</span>}
        {picked === 'wrong' && <span className="game-feedback ko"><X size={16} /> No era esa · -{game.penalty} XP</span>}
        {!picked && <span className="game-feedback"><ArrowRight size={16} /> Elige una opción para continuar</span>}
      </footer>
    </section>
  );
}
