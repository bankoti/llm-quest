export interface QuantumLesson {
  title: string
  description: string
  minutes: number
  playable?: boolean
}

export interface QuantumStage {
  number: string
  title: string
  shortTitle: string
  description: string
  accent: string
  lessons: QuantumLesson[]
}

export const QUANTUM_STAGES: QuantumStage[] = [
  {
    number: '01',
    title: 'Leave the classical world',
    shortTitle: 'Foundations',
    description: 'Build the intuitions that make quantum behavior feel surprising, but not mysterious.',
    accent: '#22d3ee',
    lessons: [
      { title: 'The quantum rules change', description: 'Meet scale, probability, waves, and measurement through experiments.', minutes: 9, playable: true },
      { title: 'Classical particles and waves', description: 'See the two mental models quantum objects refuse to choose between.', minutes: 7 },
      { title: 'Energy comes in chunks', description: 'Discover why nature sometimes uses a staircase instead of a ramp.', minutes: 8 },
      { title: 'Light becomes photons', description: 'Follow one packet of light from emission to detection.', minutes: 7 },
      { title: 'The double-slit experiment', description: 'Build the most important experiment in quantum physics.', minutes: 10 },
      { title: 'Foundations checkpoint', description: 'Connect the first clues into one usable mental model.', minutes: 6 },
    ],
  },
  {
    number: '02',
    title: 'Learn the quantum language',
    shortTitle: 'Quantum language',
    description: 'Turn the strange observations into a compact way of predicting what can happen.',
    accent: '#a78bfa',
    lessons: [
      { title: 'The wavefunction', description: 'Treat it as a map of possibilities before meeting the equation.', minutes: 8 },
      { title: 'Superposition', description: 'Understand how alternatives combine and interfere.', minutes: 8 },
      { title: 'Measurement and collapse', description: 'Separate the smooth prediction from the single observed result.', minutes: 9 },
      { title: 'The uncertainty principle', description: 'See why a narrow position needs a broad range of momenta.', minutes: 9 },
      { title: 'States, bases, and amplitudes', description: 'Build the vocabulary used across all quantum systems.', minutes: 10 },
      { title: "Schrodinger's equation", description: 'Read the equation as a story of how possibilities evolve.', minutes: 10 },
    ],
  },
  {
    number: '03',
    title: 'Build atoms from quantum rules',
    shortTitle: 'Atoms and matter',
    description: 'Use the language to explain matter, chemistry, and the structure of the physical world.',
    accent: '#fb7185',
    lessons: [
      { title: 'Particle in a box', description: 'Watch boundaries turn continuous motion into discrete energies.', minutes: 9 },
      { title: 'Quantum tunneling', description: 'Cross a barrier that classical physics says is impossible.', minutes: 8 },
      { title: 'Atomic orbitals', description: 'Replace planetary paths with probability shapes.', minutes: 10 },
      { title: 'Spin', description: 'Meet an intrinsic quantum property with no classical twin.', minutes: 9 },
      { title: 'Identical particles', description: 'See why fermions and bosons build different worlds.', minutes: 10 },
      { title: 'Why the periodic table works', description: 'Assemble chemistry from shells, spin, and exclusion.', minutes: 10 },
    ],
  },
  {
    number: '04',
    title: 'Entangle the world',
    shortTitle: 'Entanglement',
    description: 'Explore correlations that cannot be reproduced by any local hidden instruction sheet.',
    accent: '#fbbf24',
    lessons: [
      { title: 'Two-particle states', description: 'Move from one quantum object to a shared state.', minutes: 8 },
      { title: 'Entanglement', description: 'Build a state whose parts cannot be described independently.', minutes: 9 },
      { title: "Bell's experiment", description: 'Test where classical explanations reach their limit.', minutes: 11 },
      { title: 'Decoherence', description: 'Understand how fragile quantum patterns fade into classical behavior.', minutes: 9 },
      { title: "Schrodinger's cat", description: 'Use the thought experiment carefully, without the usual shortcuts.', minutes: 7 },
    ],
  },
  {
    number: '05',
    title: 'Use quantum physics',
    shortTitle: 'Applications',
    description: 'Trace the same principles through technologies already woven into everyday life.',
    accent: '#34d399',
    lessons: [
      { title: 'Lasers', description: 'Turn energy levels and stimulated emission into coherent light.', minutes: 8 },
      { title: 'Semiconductors', description: 'See how band structure makes modern electronics possible.', minutes: 10 },
      { title: 'MRI and quantum sensors', description: 'Use spin as a precise probe of bodies and fields.', minutes: 9 },
      { title: 'Qubits', description: 'Encode information in controllable two-state quantum systems.', minutes: 9 },
      { title: 'Quantum gates and circuits', description: 'Transform amplitudes and build small algorithms.', minutes: 11 },
      { title: 'Quantum cryptography', description: 'Use measurement disturbance to reveal eavesdropping.', minutes: 8 },
    ],
  },
  {
    number: '06',
    title: 'Take the hero path',
    shortTitle: 'Mathematical track',
    description: 'Add the mathematical structure once the physical ideas have somewhere to land.',
    accent: '#f472b6',
    lessons: [
      { title: 'Complex numbers', description: 'Use phase and rotation as the geometry behind amplitudes.', minutes: 12 },
      { title: 'Linear algebra intuition', description: 'Read vectors and matrices as states and transformations.', minutes: 14 },
      { title: 'Operators and observables', description: 'Connect measurable quantities to transformations.', minutes: 12 },
      { title: 'Hilbert spaces', description: 'Generalize the geometry that holds quantum states.', minutes: 13 },
      { title: "Solve Schrodinger's equation", description: 'Work through the simplest systems with real mathematics.', minutes: 16 },
      { title: 'Path integrals and fields', description: 'Look beyond particles toward modern quantum theory.', minutes: 15 },
    ],
  },
]

export const QUANTUM_LESSON_COUNT = QUANTUM_STAGES.reduce((sum, stage) => sum + stage.lessons.length, 0)
export const QUANTUM_LESSON_PATH = '/quantum/the-quantum-rules-change'

export function quantumCompleted(): boolean {
  try {
    return window.localStorage.getItem('quantum-atlas-complete') === 'true'
  } catch {
    return false
  }
}
