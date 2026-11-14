import React, { useState } from 'react';
import { Brain, RotateCcw, ArrowRight, ShieldAlert } from 'lucide-react';
import {
  mbtiQuestions, calculateMBTI, getMBTIProfile,
  personalityQuestions, scorePersonality
} from '../data/forensicTests.js';

/* ============================== MBTI ============================== */

export function MbtiTest() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  const currentQuestion = mbtiQuestions[currentIndex];
  const progress = result ? 100 : Math.round((currentIndex / mbtiQuestions.length) * 100);

  const handleAnswer = (type) => {
    if (result) return;
    const nextAnswers = [...answers, type];
    setAnswers(nextAnswers);

    if (currentIndex === mbtiQuestions.length - 1) {
      const profileType = calculateMBTI(nextAnswers);
      setResult({ type: profileType, ...getMBTIProfile(profileType) });
      return;
    }

    setCurrentIndex(index => index + 1);
  };

  const restartTest = () => {
    setCurrentIndex(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <section className="mbti-container">
      <header className="mbti-heading">
        <span className="eyebrow">MINDTRACE / EVALUACIÓN DE ESTILO</span>
        <h1><Brain aria-hidden="true" /> Test de Perfil Psicológico MBTI Forense</h1>
        <p>Explora tus preferencias de trabajo y análisis dentro de una simulación de investigación.</p>
      </header>

      <div className="mbti-card">
        {!result ? (
          <>
            <div className="mbti-progress-row">
              <span>PREGUNTA {currentIndex + 1} DE {mbtiQuestions.length}</span>
              <span>{progress}% COMPLETADO</span>
            </div>
            <div className="mbti-progress-track"><span style={{ width: `${progress}%` }} /></div>
            <span className="mbti-kicker">EXPEDIENTE DE AUTOCONOCIMIENTO</span>
            <h2>{currentQuestion.question}</h2>
            <div className="mbti-options">
              {currentQuestion.options.map((option, index) => (
                <button
                  className="mbti-option-btn"
                  type="button"
                  key={`${currentQuestion.id}-${option.type}`}
                  onClick={() => handleAnswer(option.type)}
                >
                  <span className="mbti-option-index">{String.fromCharCode(65 + index)}</span>
                  <span>{option.text}</span>
                  <ArrowRight className="mbti-option-arrow" size={18} aria-hidden="true" />
                </button>
              ))}
            </div>
            <p className="mbti-footnote">Selecciona la alternativa que mejor describa tu preferencia habitual. No hay respuestas correctas o incorrectas.</p>
          </>
        ) : (
          <div className="mbti-result" style={{ '--mbti-accent': result.color, borderColor: result.color }}>
            <span className="mbti-kicker">RESULTADO DE LA SIMULACIÓN</span>
            <div className="mbti-result-icon" style={{ color: result.color, borderColor: result.color }}>
              <Brain size={30} />
            </div>
            <span className="mbti-result-code" style={{ color: result.color }}>{result.type}</span>
            <h2>{result.title}</h2>
            <p>{result.desc}</p>
            <div className="mbti-result-note"><ShieldAlert size={17} /><span>Este resultado es orientativo y educativo. El MBTI no es una evaluación clínica, no diagnostica trastornos y no determina capacidad, peligrosidad ni culpabilidad.</span></div>
            <button className="mbti-restart-btn" type="button" onClick={restartTest}>
              <RotateCcw size={16} /> Repetir test
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ====================== RASGOS DE PERSONALIDAD ====================== */

const personalityScale = [
  { value: 1, label: 'Totalmente en desacuerdo' },
  { value: 2, label: 'En desacuerdo' },
  { value: 3, label: 'Ni de acuerdo ni en desacuerdo' },
  { value: 4, label: 'De acuerdo' },
  { value: 5, label: 'Totalmente de acuerdo' }
];

export function PersonalityTest() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [index, setIndex] = useState(0);
  const question = personalityQuestions[index];
  const finish = () => setResult(scorePersonality(personalityQuestions.map(q => answers[q.id])));
  const choose = value => setAnswers(prev => ({ ...prev, [question.id]: value }));
  const next = () => index === personalityQuestions.length - 1 ? finish() : setIndex(v => v + 1);
  const reset = () => { setAnswers({}); setResult(null); setIndex(0); };

  return <section className="mbti-container personality-container">
    <header className="mbti-heading">
      <span className="eyebrow">MINDTRACE / AUTOCONOCIMIENTO</span>
      <h1><Brain aria-hidden="true" /> Cuestionario de rasgos de personalidad</h1>
      <p>15 afirmaciones inspiradas en el modelo de los Cinco Grandes (Big Five). Responde según cómo sueles comportarte, no según cómo crees que deberías hacerlo.</p>
    </header>
    <div className="mbti-card">
      {!result ? <>
        <div className="mbti-progress-row"><span>PREGUNTA {index + 1} DE 15</span><span>{Math.round(Object.keys(answers).length / 15 * 100)}% COMPLETADO</span></div>
        <div className="mbti-progress-track"><span style={{ width: (Object.keys(answers).length / 15 * 100) + '%' }} /></div>
        <span className="mbti-kicker">RESPONDE CON HONESTIDAD · NO HAY RESPUESTAS CORRECTAS</span>
        <h2>{question.text}</h2>
        <div className="personality-scale">{personalityScale.map(item => <button key={item.value} type="button" className={answers[question.id] === item.value ? 'selected' : ''} onClick={() => choose(item.value)}><b>{item.value}</b><span>{item.label}</span></button>)}</div>
        <div className="personality-controls"><button type="button" className="button-secondary" disabled={index===0} onClick={()=>setIndex(v=>v-1)}>Anterior</button><button type="button" className="button-primary" disabled={!answers[question.id]} onClick={next}>{index===14?'Ver resultados':'Siguiente'} <ArrowRight size={16}/></button></div>
        <p className="mbti-footnote">Contesta pensando en tu comportamiento habitual durante los últimos meses. Puedes volver atrás y cambiar respuestas.</p>
      </> : <div className="personality-results">
        <span className="mbti-kicker">TU PERFIL ORIENTATIVO</span><h2>Resumen de rasgos</h2>
        {Object.entries(result).map(([key,trait])=><div className="personality-trait" key={key}><div><strong>{trait.name}</strong><b>{trait.score}/100</b></div><div className="personality-bar"><span style={{width:trait.score+'%'}}/></div><p>{trait.description}</p></div>)}
        <div className="mbti-result-note"><ShieldAlert size={17}/><span>Importante: este cuestionario es educativo y de autoconocimiento; no es una prueba psicológica estandarizada ni validada, no ofrece diagnóstico y no sustituye una evaluación realizada por un profesional de psicología.</span></div>
        <button className="mbti-restart-btn" type="button" onClick={reset}><RotateCcw size={16}/> Repetir cuestionario</button>
      </div>}
    </div>
  </section>;
}
