import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { QuantumCanvas, QuantumScene, sampleInterference } from './QuantumCanvas'
import './quantum.css'

const steps: { label: string; scene: QuantumScene }[] = [
  { label: 'Scale', scene: 'scale' },
  { label: 'Duality', scene: 'duality' },
  { label: 'Photons', scene: 'photons' },
  { label: 'Two slits', scene: 'slits' },
  { label: 'Probability', scene: 'probability' },
  { label: 'Check', scene: 'check' },
  { label: 'Complete', scene: 'complete' },
]

const scaleNames = ['You', 'A hair', 'A cell', 'An atom', 'An electron']

export function QuantumLessonPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [scaleIndex, setScaleIndex] = useState(0)
  const [dualityMode, setDualityMode] = useState<'particle' | 'wave'>('particle')
  const [photonHits, setPhotonHits] = useState<number[]>([])
  const [observed, setObserved] = useState(false)
  const [measurement, setMeasurement] = useState<'left' | 'right' | null>(null)
  const [answer, setAnswer] = useState<number | null>(null)
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle')

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem('quantum-atlas-step') || '0')
      if (saved > 0 && saved < steps.length - 1) setStep(saved)
    } catch {
      // Device-local progress is optional.
    }
  }, [])

  useEffect(() => {
    try { window.localStorage.setItem('quantum-atlas-step', String(step)) } catch { /* optional */ }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const firePhotons = useCallback((count: number) => {
    setPhotonHits(current => [...current, ...Array.from({ length: count }, sampleInterference)].slice(-240))
  }, [])

  const measure = () => setMeasurement(Math.random() < 0.5 ? 'left' : 'right')

  const checkAnswer = () => {
    if (answer === 1) {
      setAnswerState('correct')
      try { window.localStorage.setItem('quantum-atlas-complete', 'true') } catch { /* optional */ }
    } else if (answer !== null) {
      setAnswerState('wrong')
    }
  }

  const next = () => setStep(current => Math.min(current + 1, steps.length - 1))
  const previous = () => setStep(current => Math.max(current - 1, 0))
  const canContinue = step !== 2 || photonHits.length > 0

  const content = useMemo(() => {
    if (step === 0) return (
      <>
        <p className="qa-eyebrow">Experiment 1 of 5</p>
        <h1>First, shrink your point of view</h1>
        <p className="qa-lesson-lede">Quantum physics becomes unavoidable at scales far smaller than anything your senses evolved to notice.</p>
        <p>Move through the scale. By the time you reach an atom, familiar ideas such as a precise path and a definite speed stop being enough.</p>
        <div className="qa-control-block">
          <div className="qa-control-label"><span>Scale</span><strong>{scaleNames[scaleIndex]}</strong></div>
          <input aria-label="Scale from a person to an electron" type="range" min="0" max="4" step="1" value={scaleIndex} onChange={event => setScaleIndex(Number(event.target.value))} />
          <div className="qa-range-labels"><span>Everyday</span><span>Quantum</span></div>
        </div>
      </>
    )

    if (step === 1) return (
      <>
        <p className="qa-eyebrow">Two useful pictures</p>
        <h1>A particle or a wave?</h1>
        <p className="qa-lesson-lede">A classical particle follows one path. A classical wave spreads across many paths. Quantum objects produce evidence of both.</p>
        <p>Switch the picture. Neither one alone describes an electron or photon completely. The quantum state predicts possibilities; a detector records one event.</p>
        <div className="qa-segmented" role="group" aria-label="Choose a classical picture">
          <button className={dualityMode === 'particle' ? 'active' : ''} onClick={() => setDualityMode('particle')}><span aria-hidden="true">●</span> Particle</button>
          <button className={dualityMode === 'wave' ? 'active' : ''} onClick={() => setDualityMode('wave')}><span aria-hidden="true">∿</span> Wave</button>
        </div>
        <aside className="qa-insight"><span aria-hidden="true">✦</span><span><strong>Key idea:</strong> “Wave-particle duality” means the classical categories are incomplete, not that a tiny object keeps changing costumes.</span></aside>
      </>
    )

    if (step === 2) return (
      <>
        <p className="qa-eyebrow">Build the evidence</p>
        <h1>One dot at a time</h1>
        <p className="qa-lesson-lede">Fire photons through two narrow openings. Each photon arrives as one localized dot, but many dots form a wave-like interference pattern.</p>
        <p>The single event is unpredictable. The distribution of many events is highly predictable. Quantum theory connects those two facts.</p>
        <div className="qa-action-row">
          <button className="qa-secondary" onClick={() => firePhotons(1)}>Fire one</button>
          <button className="qa-primary" onClick={() => firePhotons(25)}>Burst 25</button>
          <button className="qa-icon-button" title="Reset detections" aria-label="Reset detections" onClick={() => setPhotonHits([])}>↺</button>
        </div>
        {photonHits.length === 0 ? <p className="qa-hint">Fire at least one photon to continue.</p> : <p className="qa-hint qa-success">Detector has recorded {photonHits.length} event{photonHits.length === 1 ? '' : 's'}.</p>}
      </>
    )

    if (step === 3) return (
      <>
        <p className="qa-eyebrow">The double-slit surprise</p>
        <h1>Knowing the path changes the pattern</h1>
        <p className="qa-lesson-lede">With no path detector, alternatives combine and create bright and dark bands. Measure which slit was used, and the interference disappears.</p>
        <p>Measurement is a physical interaction that stores path information. The experiment can no longer combine the two alternatives in the same way.</p>
        <button className={`qa-observer ${observed ? 'active' : ''}`} onClick={() => setObserved(value => !value)} aria-pressed={observed}>
          <span className="qa-observer-icon" aria-hidden="true">{observed ? '◉' : '○'}</span>
          <span><strong>{observed ? 'Path detector on' : 'Path detector off'}</strong><small>{observed ? 'Two broad clusters' : 'Interference bands'}</small></span>
        </button>
      </>
    )

    if (step === 4) return (
      <>
        <p className="qa-eyebrow">Possibility becomes an event</p>
        <h1>The wavefunction is not the result</h1>
        <p className="qa-lesson-lede">Before measurement, the wavefunction assigns an amplitude to each possible result. Squaring its size gives a probability.</p>
        <p>A measurement returns one definite event. Repeat the same preparation many times and the histogram approaches the predicted probability curve.</p>
        <div className="qa-action-row">
          <button className="qa-primary" onClick={measure}>Measure electron</button>
          {measurement && <button className="qa-icon-button" title="Restore probability cloud" aria-label="Restore probability cloud" onClick={() => setMeasurement(null)}>↺</button>}
        </div>
        <p className={`qa-measurement ${measurement ? 'visible' : ''}`} aria-live="polite">{measurement ? `Detector clicked on the ${measurement}.` : 'No measurement yet.'}</p>
      </>
    )

    if (step === 5) {
      const options = [
        'Each photon secretly follows a visible wave path.',
        'Single detections are discrete, while their probability pattern can interfere like a wave.',
        'The detector creates extra photons whenever it observes the slits.',
      ]
      return (
        <>
          <p className="qa-eyebrow">Concept check</p>
          <h1>What did the dots teach us?</h1>
          <p className="qa-lesson-lede">Choose the statement that best matches the double-slit experiment.</p>
          <div className="qa-answer-list" role="radiogroup" aria-label="Concept check answers">
            {options.map((option, index) => (
              <button key={option} role="radio" aria-checked={answer === index} className={`${answer === index ? 'selected' : ''} ${answerState === 'correct' && index === 1 ? 'correct' : ''}`} onClick={() => { setAnswer(index); setAnswerState('idle') }}>
                <span className="qa-answer-marker">{String.fromCharCode(65 + index)}</span><span>{option}</span>{answerState === 'correct' && index === 1 && <span aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
          <button className="qa-primary" disabled={answer === null} onClick={checkAnswer}>Check answer →</button>
          <p className={`qa-feedback ${answerState}`} aria-live="polite">{answerState === 'wrong' ? 'Not quite. Focus on the difference between one detection and many detections.' : answerState === 'correct' ? 'Exactly. Quantum theory predicts the pattern, not the location of one photon.' : ''}</p>
        </>
      )
    }

    return (
      <>
        <p className="qa-eyebrow">Journey complete</p>
        <h1>Your first quantum model is alive</h1>
        <p className="qa-lesson-lede">You can now separate a quantum state, its probability predictions, and the single event produced by measurement.</p>
        <div className="qa-takeaways">
          <div><span>✓</span><p>Quantum objects are not well described by classical particle or wave pictures alone.</p></div>
          <div><span>✓</span><p>Alternatives can interfere when no measurement distinguishes their paths.</p></div>
          <div><span>✓</span><p>The theory predicts probability patterns; each measurement gives one result.</p></div>
        </div>
        <button className="qa-primary" onClick={() => navigate('/quantum')}>Return to course map →</button>
      </>
    )
  }, [answer, answerState, dualityMode, measurement, navigate, observed, photonHits.length, scaleIndex, step])

  return (
    <div className="qa-player">
      <header className="qa-player-header">
        <Link className="qa-icon-button qa-quiet" title="Close lesson" aria-label="Close lesson" to="/quantum">×</Link>
        <button className="qa-icon-button qa-quiet" title="Previous step" aria-label="Previous step" disabled={step === 0} onClick={previous}>←</button>
        <div className="qa-step-rail" aria-label={`Step ${step + 1} of ${steps.length}`}>
          {steps.map((item, index) => <span key={item.label} className={index < step ? 'done' : index === step ? 'current' : ''} title={item.label} />)}
        </div>
        <div className="qa-discovery-count"><span aria-hidden="true">✦</span><strong>{Math.min(step + 1, 6)}</strong></div>
      </header>

      <main className="qa-player-main">
        <section className="qa-visual-panel">
          <div className="qa-visual-caption"><span>Live model</span><strong>{steps[step].label}</strong></div>
          <QuantumCanvas scene={steps[step].scene} scaleIndex={scaleIndex} dualityMode={dualityMode} photonHits={photonHits} observed={observed} measurement={measurement} />
        </section>
        <section className="qa-lesson-copy">
          <div className="qa-copy-inner">{content}</div>
          {step < 5 && <div className="qa-lesson-nav"><span>{step + 1}/{steps.length - 1}</span><button className="qa-primary" disabled={!canContinue} onClick={next}>Continue →</button></div>}
          {step === 5 && answerState === 'correct' && <div className="qa-lesson-nav"><span>Checkpoint passed</span><button className="qa-primary" onClick={next}>See summary →</button></div>}
        </section>
      </main>
    </div>
  )
}
