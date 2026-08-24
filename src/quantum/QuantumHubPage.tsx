import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QUANTUM_LESSON_COUNT, QUANTUM_LESSON_PATH, QUANTUM_STAGES, quantumCompleted } from './curriculum'
import './quantum.css'

export function QuantumHubPage() {
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    setCompleted(quantumCompleted())
  }, [])

  return (
    <div className="qa-page">
      <nav className="qa-site-nav" aria-label="Quantum course navigation">
        <Link to="/" className="qa-back">← ZeroOne</Link>
        <Link to="/quantum" className="qa-brand"><span aria-hidden="true">◉</span> Quantum Atlas</Link>
        <span className="qa-progress">{completed ? 1 : 0}/{QUANTUM_LESSON_COUNT} lessons</span>
      </nav>

      <header className="qa-hero">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="qa-hero-copy">
          <p className="qa-eyebrow">Zero to hero, one experiment at a time</p>
          <h1>Build a quantum universe you can actually see.</h1>
          <p>Start with ordinary intuition, break it carefully through experiments, then rebuild your understanding around states, probability, atoms, entanglement, and computation.</p>
          <Link className="qa-primary qa-large" to={QUANTUM_LESSON_PATH}>{completed ? 'Replay first journey' : 'Start first journey'} <span aria-hidden="true">→</span></Link>
          <div className="qa-hero-meta"><span>9 minutes</span><span>6 discoveries</span><span>No math required</span></div>
        </motion.div>
        <div className="qa-atom-visual" aria-label="Animated atomic state model">
          <div className="qa-atom-core"><i /></div>
          <div className="qa-orbit qa-orbit-one"><i /></div>
          <div className="qa-orbit qa-orbit-two"><i /></div>
          <div className="qa-orbit qa-orbit-three"><i /></div>
          <span className="qa-concept qa-concept-wave">wave</span>
          <span className="qa-concept qa-concept-state">state</span>
          <span className="qa-concept qa-concept-prob">probability</span>
        </div>
      </header>

      <section className="qa-build-line" aria-label="Course stages">
        <p>The build line</p>
        <div>
          {QUANTUM_STAGES.map((stage, index) => (
            <a key={stage.number} href={`#quantum-stage-${stage.number}`}>
              <span style={{ color: stage.accent }}>{stage.number}</span>
              <strong>{stage.shortTitle}</strong>
              {index < QUANTUM_STAGES.length - 1 && <i aria-hidden="true">→</i>}
            </a>
          ))}
        </div>
      </section>

      <Link to={QUANTUM_LESSON_PATH} className="qa-next">
        <div className="qa-next-index"><span>{completed ? 'Completed' : 'Recommended next'}</span><strong>01</strong></div>
        <div><p className="qa-eyebrow">Foundations</p><h2>The quantum rules change</h2><p>Move from human scale to one-photon interference and build your first working quantum mental model.</p></div>
        <span className="qa-next-action">{completed ? 'Replay' : 'Begin'} →</span>
      </Link>

      <div className="qa-curriculum">
        {QUANTUM_STAGES.map((stage, stageIndex) => {
          const previousLessons = QUANTUM_STAGES.slice(0, stageIndex).reduce((sum, item) => sum + item.lessons.length, 0)
          return (
            <section id={`quantum-stage-${stage.number}`} className="qa-stage" style={{ '--qa-stage': stage.accent } as React.CSSProperties} key={stage.number}>
              <div className="qa-stage-heading">
                <div className="qa-stage-number"><span>Stage {stage.number}</span></div>
                <div><h2>{stage.title}</h2><p>{stage.description}</p></div>
                <span className="qa-stage-count">{stage.lessons.length} lessons</span>
              </div>
              <div className="qa-lesson-grid">
                {stage.lessons.map((lesson, lessonIndex) => {
                  const number = String(previousLessons + lessonIndex + 1).padStart(2, '0')
                  if (lesson.playable) {
                    return (
                      <Link className="qa-lesson-card qa-playable" key={lesson.title} to={QUANTUM_LESSON_PATH}>
                        <div className="qa-card-top"><span>{completed ? '✓' : number}</span><span className="qa-status">{completed ? 'Complete' : 'Available'}</span></div>
                        <h3>{lesson.title}</h3><p>{lesson.description}</p>
                        <div className="qa-card-meta"><span>{lesson.minutes} min</span><span>→</span></div>
                      </Link>
                    )
                  }
                  return (
                    <div className="qa-lesson-card qa-locked" key={lesson.title}>
                      <div className="qa-card-top"><span>{number}</span><span aria-label="Not yet available">◇</span></div>
                      <h3>{lesson.title}</h3><p>{lesson.description}</p>
                      <div className="qa-card-meta"><span>{lesson.minutes} min</span><span>Next release</span></div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <footer className="qa-footer"><span>◉ Quantum Atlas</span><p>Progress saves in this browser.</p></footer>
    </div>
  )
}
