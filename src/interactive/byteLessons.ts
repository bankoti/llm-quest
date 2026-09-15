import type { InteractiveLesson } from './types'
import { ByteBoundaryPlay, ByteConversionPlay, ByteEvidencePlay } from './byteWidgets'

const moduleId = 'byte-models', moduleTitle = 'Beyond BPE: Distilling Byte Models'
export const BYTE_LESSONS: InteractiveLesson[] = [
  {
    slug: 'byte-boundaries', title: 'Bytes, Tokens, and Boundaries', emoji: '', minutes: 12,
    blurb: 'Count content separately from the units a model predicts.', moduleId, moduleTitle,
    prerequisites: ['subword-tokenization', 'softmax-probabilities'],
    outcomes: ['Distinguish UTF-8 bytes from characters', 'Account for vocabulary and sequence length', 'Explain the extra boundary symbol'],
    concepts: ['UTF-8', 'BPE', 'vocabulary', 'EOT', 'sequence length'],
    steps: [
      { kind: 'concept', title: 'A smaller alphabet is not a shorter sequence', lines: [
        'BPE groups bytes into reusable pieces. A byte model instead predicts values from 0 to 255, plus any special symbols. One Unicode character can occupy multiple bytes; one token can contain several characters or an incomplete UTF-8 fragment.',
        'A smaller vocabulary shrinks embedding and output matrices. More sequence positions can increase attention work and require more autoregressive decoding steps. Parameter savings alone do not establish speed.',
        'For this module, EOT is a separate symbol marking a teacher-token boundary. It is not a byte of user text and is not EOS, the end of a document or response.',
      ] },
      { kind: 'widget', widget: ByteBoundaryPlay },
      { kind: 'worked', title: 'The denominator belongs to the content', prompt: 'A text has 12 UTF-8 bytes, represented as 3 teacher tokens.', stages: [
        { label: 'Token representation', body: 'Three prediction positions use a potentially large vocabulary.' },
        { label: 'Byte representation', body: 'Twelve prediction positions use 256 byte values plus special symbols.' },
        { label: 'Byte-plus-boundary representation', body: 'Three EOT markers make 15 prediction positions. The content still contains 12 bytes.' },
      ], takeaway: 'Record content bytes and model prediction units separately.' },
      { kind: 'numeric', prompt: '20 content bytes are segmented into 5 teacher tokens.', questions: [
        { label: 'Byte + EOT prediction positions', answer: 25, tolerance: 0, reveal: '20 bytes plus one marker for each of 5 tokens.' },
        { label: 'Content bytes for normalization', answer: 20, tolerance: 0, reveal: 'Markers encode boundaries but add no user text.' },
      ] },
      { kind: 'mcq', prompt: 'A model has fewer embedding parameters. What follows?', options: ['Its requests are always faster', 'Its output is always more accurate', 'The embedding is smaller; end-to-end cost still needs measurement', 'Its context contains fewer bytes'], answer: 2, explain: 'Sequence length, attention, batching, and generation steps also matter.', nudge: 'Which costs did the parameter count leave out?' },
      { kind: 'mcq', prompt: 'Does adding an EOT marker remove all dependence on teacher tokenization?', options: ['No; the marker retains teacher boundaries', 'Yes; EOT erases the segmentation', 'Yes; bytes are whole words', 'Only for English'], answer: 0, explain: 'Boundary-augmented byte training still uses teacher segmentation.', nudge: 'Where do the EOT positions come from?' },
    ],
  },
  {
    slug: 'byte-distillation', title: 'Distillation Across Tokenizations', emoji: '', minutes: 18,
    blurb: 'Preserve a terminal branch when converting token probabilities.', moduleId, moduleTitle,
    prerequisites: ['byte-boundaries', 'distillation'],
    outcomes: ['Marginalize next-byte probabilities', 'Explain where approximation loses mass', 'Reconstruct an exact token path', 'Apply forward KL with zero targets'],
    concepts: ['Marginalize-It', 'End-Of-Token', 'conditional probability', 'forward KL', 'soft targets'],
    steps: [
      { kind: 'concept', title: 'Teacher and student have different output spaces', lines: [
        'A token teacher predicts a distribution over whole byte strings. A byte student predicts the next byte. Their logits cannot be compared position-by-position until we define how teacher probabilities become student targets.',
        'The September 2026 preprint Breaking the Token Ceiling proposes approximate Marginalize-It and boundary-preserving End-Of-Token conversion. We will test these mechanisms with a tiny vocabulary, not assume their large-scale performance claims.',
        'At the first byte, group token probabilities by their first byte. Later, condition on the observed prefix inside the current teacher token. Tokens that already end at that prefix are the subtle case.',
      ] },
      { kind: 'worked', title: 'a is both a token and a prefix', prompt: 'The teacher assigns P(a)=0.2, P(ab)=0.5, P(ac)=0.3. We have observed a.', stages: [
        { label: 'Discarding the terminal branch', body: 'Keeping only longer tokens leaves mass 0.8. Renormalizing yields P(b)=0.625 and P(c)=0.375.' },
        { label: 'Representing the terminal branch', body: 'With EOT, P(EOT)=0.2, P(b)=0.5, and P(c)=0.3. No branch disappears.' },
        { label: 'Check the complete path', body: 'P(a then b then EOT)=1 * 0.5 * 1=0.5, matching P(ab). Count the terminating EOT when reconstructing probabilities.' },
        { label: 'Train, then measure the student', body: 'An exact target conversion is not an exact student. Optimization, limited capacity, data coverage, and generation errors still matter.' },
      ], takeaway: 'Normalized probabilities alone do not prove that the original distribution was preserved.' },
      { kind: 'widget', widget: ByteConversionPlay },
      { kind: 'concept', title: 'The loss compares distributions, not IDs', lines: [
        'For one byte position, forward KL is sum p_teacher(b) * [log p_teacher(b) - log p_student(b)]. Average over valid positions. Padding is excluded, while predicted EOT positions are included.',
        'A zero target contributes zero. Compute the student log-softmax directly so very unlikely classes do not become log(0). The exercise uses temperature 1; teacher entropy is constant with respect to the student.',
        'For AI-assisted coding, first hand-calculate a boundary case and write a failing test. Ask for one function at a time, then explain why the path-probability test passes. A convincing explanation without passing invariants is not enough.',
      ] },
      { kind: 'numeric', prompt: 'P(a)=0.2, P(ab)=0.5, P(ac)=0.3. Prefix is a.', questions: [
        { label: 'Approximate next-byte probability of b', answer: .625, tolerance: .00001, reveal: '.5 / (.5 + .3) = .625.' },
        { label: 'Exact next-symbol probability of EOT', answer: .2, tolerance: .00001, reveal: 'The complete token a retains its .2 probability.' },
      ] },
      { kind: 'mcq', prompt: 'What is the strongest conversion test?', options: ['The output has 257 entries', 'The output sums to one', 'The code runs without errors', 'Each full byte-plus-EOT path recovers its teacher-token probability'], answer: 3, explain: 'Shape and normalization can hold even after a terminal branch was incorrectly discarded.', nudge: 'Check the quantity the conversion promises to preserve.' },
      { kind: 'mcq', prompt: 'After conditioning on a rare prefix, why normalize the eligible logits before exponentiating?', options: ['To make every target uniform', 'To avoid underflow caused by much larger excluded logits', 'To remove EOT', 'To train the teacher again'], answer: 1, explain: 'Subtract the eligible maximum; an unrelated high-probability token should not numerically erase the conditional distribution.', nudge: 'Stable global softmax can still round a rare subset to zeros.' },
    ],
  },
  {
    slug: 'byte-model-evaluation', title: 'Does the Byte Student Actually Win?', emoji: '', minutes: 16,
    blurb: 'Separate observed quality, predictions, content throughput, and storage.', moduleId, moduleTitle,
    prerequisites: ['byte-distillation', 'scaling-laws'],
    outcomes: ['Normalize loss by content bytes', 'Distinguish observation and extrapolation', 'Compare payload storage fairly', 'Measure serving cost for equal output content'],
    concepts: ['bits per byte', 'extrapolation', 'logit storage', 'latency', 'throughput', 'controlled experiment'],
    steps: [
      { kind: 'concept', title: 'Name the evidence before claiming a win', lines: [
        'The paper combines trained checkpoints with fitted scaling curves. An asymptotic prediction is not a checkpoint that has already achieved that score. Treat the claimed ceiling as a hypothesis to test.',
        'Compare loss per raw UTF-8 content byte: summed negative log-likelihood in nats divided by content bytes times ln(2). Include predicted boundary losses but exclude boundary symbols from the content denominator; report this augmented representation explicitly.',
        'Bits-per-byte measures the target likelihood, not every downstream behavior. A deployment decision also needs task quality, safety slices, latency, and memory at a stated workload.',
      ] },
      { kind: 'widget', widget: ByteEvidencePlay },
      { kind: 'worked', title: 'A faster-looking unit can hide slower text', prompt: 'Two sequential requests each return 120 content bytes. The byte model emits 240 units/s; a token model emits 80 tokens/s averaging 4 content bytes/token.', stages: [
        { label: 'Convert to common content units', body: 'Ignoring special symbols in this example, the byte model returns 240 bytes/s and the token model 320 bytes/s.' },
        { label: 'Compare request latency', body: 'The byte request takes 500 ms, versus 375 ms for the token request. The numerically larger units/s value was misleading.' },
        { label: 'Audit the rest of the claim', body: 'Require equivalent tasks and output quality. Report hardware, batching, warmup, repeated latency samples, and memory. This arithmetic alone is not a real benchmark.' },
      ], takeaway: 'Use the same unit of useful work, then evaluate quality and cost together.' },
      { kind: 'numeric', prompt: 'A model assigns 24 bits of total negative log-likelihood to 12 content bytes.', questions: [
        { label: 'Bits per content byte', answer: 2, tolerance: 0, reveal: '24 / 12 = 2 BPB, regardless of how many prediction units were used.' },
        { label: 'Payload bytes for 10 positions with 5 top-k FP32 values and int32 indices', answer: 400, tolerance: 0, reveal: '10 * 5 * (4 + 4) = 400 bytes, excluding other metadata.' },
      ] },
      { kind: 'mcq', prompt: 'Two models have equal bits-per-byte. What may still differ?', options: ['Nothing measurable', 'Only their names', 'Greedy outputs and downstream task accuracy', 'The number of bytes in the same input text'], answer: 2, explain: 'The remaining probability mass can rank competing answers differently.', nudge: 'Likelihood of the correct item does not specify the entire distribution.' },
      { kind: 'mcq', prompt: 'Which conclusion is justified by a curve beyond the largest training run?', options: ['A conditional prediction requiring validation', 'A measured production speedup', 'A guaranteed upper bound on every task', 'Proof that bytes always beat BPE'], answer: 0, explain: 'Report the extrapolation range and sensitivity; do not relabel a forecast as an observed win.', nudge: 'Was a model trained and evaluated at that point?' },
    ],
  },
]
