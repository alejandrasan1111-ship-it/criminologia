import React, { useState, useEffect } from 'react';
import { 
  Brain, ShieldCheck, Search, Check, Clock3, 
  Target, Zap, Eye, Cpu, Microscope 
} from 'lucide-react';

const miniGameData = {
  patternMatch: {
    title: 'Análisis de Patrón de Evidencia',
    description: 'Identifica el patrón común entre las piezas de evidencia',
    difficulty: 'Intermedio',
    rounds: 5,
    successReward: 15,
    failPenalty: 5,
    patterns: [
      { id: 'fingerprints', label: 'Huellas dactilares', color: '#00B4FF' },
      { id: 'DNA', label: 'Muestra de ADN', color: '#35D9FF' },
      { id: 'fibers', label: 'Fibras textiles', color: '#FFD700' },
      { id: 'tool marks', label: 'Marcas de herramienta', color: '#E61B2E' },
      { id: 'glass fragments', label: 'Fragmentos de vidrio', color: '#94A3B8' }
    ]
  },
  timelineReconstruction: {
    title: 'Reconstrucción Cronológica',
    description: 'Coloca los eventos en el orden cronológico correcto',
    difficulty: 'Avanzado',
    rounds: 4,
    successReward: 20,
    failPenalty: 10,
    events: [
      { id: 'arrival', label: 'Llegada del sospechoso', time: '20:14' },
      { id: 'event1', label: 'Primera interacción', time: '20:30' },
      { id: 'event2', label: 'Sustracción del dispositivo', time: '21:14' },
      { id: 'event3', label: 'Llegada de refuerzos', time: '21:45' },
      { id: 'departure', label: 'Salida del sospechoso', time: '22:00' }
    ]
  },
  contradictionDetection: {
    title: 'Detección de contradicciones',
    description: 'Identifica la declaración inconsistente',
    difficulty: 'Principiante',
    rounds: 3,
    successReward: 10,
    failPenalty: 3,
    statements: [
      { id: 'A', label: 'Declaración A', consistency: 95 },
      { id: 'B', label: 'Declaración B', consistency: 67 },
      { id: 'C', label: 'Declaración C', consistency: 45 },
      { id: 'D', label: 'Declaración D', consistency: 88 }
    ]
  }
};

export default function EvidenceAnalysisMiniGame({ onComplete }) {
  const [gameType, setGameType] = useState(Object.keys(miniGameData)[0]);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const currentGame = miniGameData[gameType];
  const totalRounds = currentGame.rounds;

  // Initialize round data based on game type
  useEffect(() => {
    setCurrentRound(0);
    setScore(0);
    setGameOver(false);
    setShowResult(false);
  }, [gameType]);

  const handleAnswer = (correct) => {
    setShowResult(true);
    setSelectedAnswer(correct);
    
    setTimeout(() => {
      setShowResult(false);
      setSelectedAnswer(null);
      if (correct) {
        setCurrentRound(prev => prev + 1);
        setScore(prev => prev + currentGame.successReward);
        if (currentRound + 1 >= totalRounds) {
          setGameOver(true);
        }
      } else {
        setScore(prev => Math.max(0, prev - currentGame.failPenalty));
        setCurrentRound(prev => prev + 1); // Move to next round anyway
        if (currentRound + 1 >= totalRounds) {
          setGameOver(true);
        }
      }
    }, 1500);
  };

  const restartGame = () => {
    setCurrentRound(0);
    setScore(0);
    setGameOver(false);
  };

  if (gameOver) {
    const finalScore = score;
    return (
      <div className="mini-game-over">
        <div className="game-over-content">
          <div className="game-over-title">CASO RESUELTO</div>
          <div className="game-over-score">
            <span className="score-value">{finalScore}</span>
            <span className="score-unit">XP</span>
          </div>
          <div className="game-over-message">
            <h3>{currentGame.title}</h3>
            <p>Has completado todas las rondas del mini-juego.</p>
            <p>Puntuación final: {finalScore} XP</p>
          </div>
          <button className="button-primary" onClick={restartGame}>
            <RotateCcw size={16} /> Jugar de nuevo
          </button>
          <button className="button-secondary" onClick={() => { setGameOver(false); setGameType(Object.keys(miniGameData)[0]); }}>Otro mini-juego</button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const isCorrect = selectedAnswer === true;
    return (
      <div className="mini-game-result">
        <div className="result-overlay"/>
        <div className="result-card">
          <div className="result-icon">{isCorrect ? <Check size={48} /> : <Zap size={48} />}</div>
          <div className="result-title">{isCorrect ? 'Correcto' : 'Incorrecto'}</div>
          <div className="result-description">{currentGame.description}</div>
          {isCorrect && <div className="result-xp-gain">+{currentGame.successReward} XP</div>}
          {!isCorrect && <div className="result-xp-loss">-{currentGame.failPenalty} XP</div>}
          <button className="button-primary" onClick={() => handleAnswer(true)}>Continuar</button>
          <button className="button-secondary" onClick={() => handleAnswer(false)}>Siguiente pregunta</button>
        </div>
      </div>
    );
  }

  return (
    <section className="mini-game-section">
      <div className="game-header">
        <div className="game-icon">
          <Brain size={32} style={{ color: '#00B4FF' }} />
        </div>
        <div>
          <h2>{currentGame.title}</h2>
          <p>{currentGame.description}</p>
        </div>
        <div className="game-progress">
          <span>Ronda {currentRound + 1} de {totalRounds}</span>
          <span>XP: {score}</span>
        </div>
      </div>

      <div className="game-body">
        {/* Pattern Match Mini-Game */}
        {gameType === 'patternMatch' && (
          <div className="pattern-match-game">
            <div className="pattern-grid">
              {currentGame.patterns.map((pattern, index) => (
                <div
                  key={pattern.id}
                  className={`pattern-cell ${selectedAnswer === index ? 'selected' : ''}`}
                  onClick={() => handleAnswer(index === currentRound)}
                >
                  <span className="pattern-color" style={{ backgroundColor: pattern.color }} />
                  <span className="pattern-label">{pattern.label}</span>
                </div>
              ))}
            </div>
            <div className="pattern-instruction">
              <strong>Ronda {currentRound + 1}:</strong> Selecciona el patrón que coincide con la evidencia central
            </div>
          </div>
        )}

        {/* Timeline Reconstruction Mini-Game */}
        {gameType === 'timelineReconstruction' && (
          <div className="timeline-game">
            <div className="timeline-container">
              {currentGame.events.map((event, index) => (
                <div
                  key={event.id}
                  className={`timeline-event ${selectedAnswer === index ? 'selected' : ''}`}
                  onClick={() => handleAnswer(index === currentRound)}
                >
                  <span className="timeline-time">{event.time}</span>
                  <span className="timeline-label">{event.label}</span>
                </div>
              ))}
            </div>
            <div className="timeline-instruction">
              <strong>Ronda {currentRound + 1}:</strong> Ordena los eventos cronológicamente
            </div>
          </div>
        )}

        {/* Contradiction Detection Mini-Game */}
        {gameType === 'contradictionDetection' && (
          <div className="contradiction-game">
            <div className="statements-list">
              {currentGame.statements.map((stmt, index) => (
                <div
                  key={stmt.id}
                  className={`statement-item ${selectedAnswer === index ? 'selected' : ''} ${stmt.consistency < 70 ? 'inconsistent' : 'consistent'}`}
                  onClick={() => handleAnswer(index === currentRound)}
                >
                  <span className="statement-label">{stmt.label}</span>
                  <div className="consistency-bar">
                    <div className="consistency-fill" style={{ width: `${stmt.consistency}%` }} />
                  </div>
                  <span className="consistency-percent">{stmt.consistency}%</span>
                </div>
              ))}
            </div>
            <div className="contradiction-instruction">
              <strong>Ronda {currentRound + 1}:</strong> Identifica la declaración inconsistente (menor consistencia)
            </div>
          </div>
        )}
      </div>

      <div className="game-footer">
        {currentRound < totalRounds && !gameOver && !showResult ? (
          <button className="button-primary" onClick={() => { setGameType(Object.keys(miniGameData)[0]); }}>Empezar análisis</button>
        ) : gameOver ? (
          <button className="button-primary" onClick={restartGame}>
            <RotateCcw size={16} /> Reintentar
          </button>
        ) : (
          <button className="button-secondary" onClick={() => setGameOver(true)}}>
            <Check size={16} /> Finalizar y reclamar XP
          </button>
        )}
      </div>
    </section>
  );
}