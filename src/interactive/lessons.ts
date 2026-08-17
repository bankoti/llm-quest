// Interactive-track lessons: one file, one exported array.
// Each lesson is a linear Step[] played by InteractiveLessonPage.
// No Pyodide, no progress writes; purely tap-and-reveal.
import type { InteractiveLesson } from './types'
import { dailyPick } from './types'
import {
  AxisPlay, SlicePlay, BpePlay, AttentionPlay,
  LrPlay, TemperaturePlay, PrecisionPlay, RewardHackPlay,
  GenerationPlay, EmbeddingPlay, MoePlay, RagPlay, LoraPlay, SpecDecodePlay,
  PositionPlay, CausalMaskPlay, BackpropPlay, TokenFailPlay, CalibrationPlay,
  ScalingPlay, MultiHeadPlay, BeamPlay, EarlyStopPlay, RlhfPipelinePlay,
  EmbeddingArithPlay, DistillPlay, AgentPlay,
} from './widgets'

export const INTERACTIVE_LESSONS: InteractiveLesson[] = [

  // ── L1: Tensors & Shapes ──────────────────────────────────────────────────
  {
    slug: 'shapes',
    title: 'Tensors & Shapes',
    emoji: '📐',
    blurb: 'Every LLM bug shows up first as a wrong shape. Master the rules here.',
    minutes: 5,
    steps: [
      {
        kind: 'concept',
        title: 'Think in shapes',
        lines: [
          'A tensor is a rectangular block of numbers. Its shape is a tuple that tells you how many steps each axis can take, outermost first.',
          'A scalar has shape (). A vector of 5 numbers has shape (5,). A matrix of 3 rows and 4 columns has shape (3, 4). A batch of 8 sequences, each 16 tokens long, described by 64 numbers per token, has shape (8, 16, 64).',
          'The whole transformer is shape tracking from input to output. Learn the rules once and every architecture diagram becomes readable.',
        ],
        cta: 'Show me the rules',
      },
      {
        kind: 'mcq',
        prompt: 'A shape lists how many steps each index takes, outermost first. What is the shape of this tensor?',
        code: 't = [[1, 2],\n     [3, 4],\n     [5, 6]]',
        options: ['(3, 2)', '(2, 3)', '(6,)', '(3, 3)'],
        answer: 0,
        explain: 'Three rows, then two columns each. Outermost axis first is the whole convention: think "rows, then columns" for 2D, "batches, then tokens, then channels" for 3D.',
        nudge: 'Count the outer brackets first: how many rows are there?',
      },
      { kind: 'widget', widget: AxisPlay },
      {
        kind: 'mcq',
        prompt: 'No grid this time. M has shape (5, 7). What is the shape of M.sum(axis=1)?',
        options: ['(5,)', '(7,)', '(5, 7)', '(1, 7)'],
        answer: 0,
        explain: 'The axis you name disappears. Axis 1 is the 7 columns, so 5 row-sums remain, shape (5,). Axis 0 would collapse rows and leave 7 column-sums.',
        nudge: 'Which axis did you name? That one vanishes.',
      },
      {
        kind: 'concept',
        title: 'Batches: (B, T, C)',
        lines: [
          'Real model tensors carry three axes: B sequences per batch, T token positions, C channels (how many numbers describe each position).',
          'Slicing selects pieces without touching values. A colon means "all of this axis." A negative index counts from the end. Every slice has a predictable shape.',
        ],
        cta: 'Explore slices',
      },
      { kind: 'widget', widget: SlicePlay },
      {
        kind: 'mcq',
        prompt: 'x has shape (2, 3, 4): 24 values. Which reshape is impossible?',
        options: ['x.reshape(4, 7)', 'x.reshape(6, 4)', 'x.reshape(24,)', 'x.reshape(2, 12)'],
        answer: 0,
        explain: '4 × 7 = 28 slots for 24 values. Every legal reshape multiplies to exactly 24. Reshape never invents or destroys numbers, only rearranges them.',
        nudge: 'Multiply each pair out. Which one does not equal 24?',
      },
      {
        kind: 'predict',
        prompt: 'Commit before you reveal. Predict both result shapes.',
        code: 'a = [[1., 2.], [3., 4.]]   # shape (2, 2)\nb = [10., 20.]             # shape (2,)',
        questions: [
          { label: 'a + b', options: ['(2, 2)', '(2,)', 'error'], answer: 0,
            reveal: 'b stretches across both rows: [[11, 22], [13, 24]]. Broadcasting fills the missing axis.' },
          { label: 'a @ b', options: ['(2, 2)', '(2,)', 'error'], answer: 1,
            reveal: 'b acts as a column. Row one: 1×10 + 2×20 = 50. Row two: 3×10 + 4×20 = 110. Result: [50., 110.], shape (2,).' },
        ],
      },
    ],
  },

  // ── L2: Tokenization ──────────────────────────────────────────────────────
  {
    slug: 'tokenization',
    title: 'Tokenization',
    emoji: '✂️',
    blurb: 'Why "cat" might be one token but "unbelievable" might be three.',
    minutes: 5,
    steps: [
      {
        kind: 'concept',
        title: 'Text does not enter a model',
        lines: [
          'Every LLM works on integers, not characters. A tokenizer splits a string into subword pieces, then looks each piece up in a vocabulary to produce an integer ID.',
          'GPT-4 uses ~100k token IDs. A word in the training vocabulary is typically one token. A rare word or a typo gets split into byte-level pieces. This is why token count matters for cost and context.',
        ],
        cta: 'Show me BPE',
      },
      { kind: 'widget', widget: BpePlay },
      {
        kind: 'mcq',
        prompt: 'BPE starts with individual characters and merges the most frequent adjacent pair each round. What does a larger vocabulary mean?',
        options: [
          'Longer sequences in context but richer pieces per token',
          'Shorter sequences and richer pieces per token',
          'Shorter sequences and simpler (character-level) pieces',
          'No effect: vocab size does not change sequence length',
        ],
        answer: 1,
        explain: 'More merges = more multi-character tokens in the vocabulary, so a sentence needs fewer tokens to represent. Fewer tokens = shorter context, faster inference, lower cost per prompt.',
        nudge: 'More merges means each token covers more characters. What happens to sequence length?',
      },
      {
        kind: 'mcq',
        prompt: '"tokenize" appears rarely in training. Which split is most likely with a 50k BPE vocabulary?',
        options: ['"token" + "ize"', '"t" + "o" + "k" + "e" + "n" + "i" + "z" + "e"', '"tokenize" as one token', '"token" + "i" + "z" + "e"'],
        answer: 0,
        explain: '"token" is common so it survives as one token. "ize" is a frequent suffix. Character-level split only happens for truly novel byte sequences. One token only if the exact word appeared often in training.',
        nudge: 'Common subwords survive; rare ones get split. Which part of the word is more common?',
      },
      { kind: 'widget', widget: TokenFailPlay },
      {
        kind: 'mcq',
        prompt: 'An LLM miscounts the r\'s in "strawberry". The root cause is:',
        options: [
          'The model receives token IDs — individual letters inside a token are invisible to it',
          'Attention heads cannot perform counting operations',
          'RLHF fine-tuning removed low-level character skills',
          'The vocabulary is too small to contain the word',
        ],
        answer: 0,
        explain: 'Counting letters requires seeing letters. The tokenizer fuses "strawberry" into one or two opaque IDs before the model runs, so the model answers from association, not inspection. Spelling it out ("s-t-r-a-w-b-e-r-r-y") fixes it: each letter becomes its own token.',
        nudge: 'What does the model actually receive as input — characters or something else?',
      },
      {
        kind: 'predict',
        ...dailyPick([
          { prompt: 'Vocab size = 50,257 (GPT-2). Embedding dim = 768. Predict the weight shape.',
            questions: [{ label: 'embedding.weight', options: ['(50257, 768)', '(768, 50257)', '(50257,)'], answer: 0,
              reveal: 'Row i is the embedding for token ID i. Vocab is the first axis: (50257, 768).' }] },
          { prompt: 'Vocab size = 32,000 (Llama-2). Embedding dim = 4096. Predict the weight shape.',
            questions: [{ label: 'embedding.weight', options: ['(32000, 4096)', '(4096, 32000)', '(32000,)'], answer: 0,
              reveal: 'Same rule: row per token, vocab first: (32000, 4096). Llama-2 uses a larger embedding dim for its larger hidden size.' }] },
          { prompt: 'Vocab size = 128,256 (Llama-3). Embedding dim = 2048. Predict the weight shape.',
            questions: [{ label: 'embedding.weight', options: ['(128256, 2048)', '(2048, 128256)', '(128256,)'], answer: 0,
              reveal: 'Larger vocab, moderate dim: (128256, 2048). GPT-4-class models use 100k+ vocab sizes to improve tokenisation of code and multilingual text.' }] },
        ] as const),
      },
    ],
  },

  // ── L3: Attention ─────────────────────────────────────────────────────────
  {
    slug: 'attention',
    title: 'Self-Attention',
    emoji: '👁️',
    blurb: 'The mechanism that lets every token talk to every other token.',
    minutes: 6,
    steps: [
      {
        kind: 'concept',
        title: 'The key question',
        lines: [
          'A feed-forward network processes each position independently. Self-attention allows every position to gather information from all others in a single step.',
          'Each position produces three vectors: a Query (what am I looking for?), a Key (what do I contain?), and a Value (what do I pass on?). The output is a weighted sum of values, where weights come from query-key dot products.',
        ],
        cta: 'Show me the weights',
      },
      { kind: 'widget', widget: AttentionPlay },
      { kind: 'widget', widget: MultiHeadPlay },
      {
        kind: 'mcq',
        prompt: 'Q has shape (B, H, T, D). K has the same shape. What is the shape of Q @ K.transpose(-2, -1)?',
        options: ['(B, H, T, T)', '(B, H, D, D)', '(B, H, T, D)', '(T, T)'],
        answer: 0,
        explain: 'transpose(-2, -1) swaps the last two axes of K: (B, H, T, D) → (B, H, D, T). Then (B, H, T, D) @ (B, H, D, T) → (B, H, T, T). Each entry [b, h, i, j] is the dot product of query i with key j: how much token i attends to token j.',
        nudge: 'The matmul rule is (..., m, n) @ (..., n, p) → (..., m, p). What are m and p here?',
      },
      {
        kind: 'mcq',
        prompt: 'Why divide attention scores by √d before softmax?',
        options: [
          'Large d makes dot products large, pushing softmax into near-zero gradients',
          'To normalize so weights sum to d instead of 1',
          'To match the scale of the value vectors',
          'GPUs compute √d faster than raw division',
        ],
        answer: 0,
        explain: 'With d-dimensional vectors, the dot product variance grows with d. Large values send softmax toward a one-hot distribution, collapsing gradients to near zero and stalling learning. Dividing by √d keeps variance ≈ 1.',
        nudge: 'Think about what softmax does when its inputs get very large.',
      },
      {
        kind: 'predict',
        ...dailyPick([
          { prompt: 'B=2, H=4, T=8, D=16. Trace the shapes through one attention head.',
            code: 'Q: (B, H, T, D)\nK: (B, H, T, D)\nscores = Q @ K.transpose(-2,-1)  # ??\nout  = softmax(scores/√D) @ V    # ??',
            questions: [
              { label: 'scores shape', options: ['(2, 4, 8, 8)', '(2, 4, 8, 16)', '(2, 8, 8, 4)'], answer: 0,
                reveal: 'Q(B,H,T,D) @ K.T(B,H,D,T) → (B,H,T,T) = (2,4,8,8). One score per query-key pair.' },
              { label: 'out shape', options: ['(2, 4, 8, 16)', '(2, 4, 8, 8)', '(2, 8, 4, 16)'], answer: 0,
                reveal: '(B,H,T,T) @ V(B,H,T,D) → (B,H,T,D) = (2,4,8,16). Each position is a blend of value vectors.' },
            ] },
          { prompt: 'B=1, H=8, T=16, D=64. Trace the shapes through one attention head.',
            code: 'Q: (B, H, T, D)\nK: (B, H, T, D)\nscores = Q @ K.transpose(-2,-1)  # ??\nout  = softmax(scores/√D) @ V    # ??',
            questions: [
              { label: 'scores shape', options: ['(1, 8, 16, 16)', '(1, 8, 16, 64)', '(1, 16, 8, 8)'], answer: 0,
                reveal: '(1,8,16,64) @ (1,8,64,16) → (1,8,16,16). T×T attention map.' },
              { label: 'out shape', options: ['(1, 8, 16, 64)', '(1, 8, 16, 16)', '(1, 16, 8, 64)'], answer: 0,
                reveal: '(1,8,16,16) @ (1,8,16,64) → (1,8,16,64). Same shape as Q, K, V.' },
            ] },
          { prompt: 'B=4, H=2, T=6, D=32. Trace the shapes through one attention head.',
            code: 'Q: (B, H, T, D)\nK: (B, H, T, D)\nscores = Q @ K.transpose(-2,-1)  # ??\nout  = softmax(scores/√D) @ V    # ??',
            questions: [
              { label: 'scores shape', options: ['(4, 2, 6, 6)', '(4, 2, 6, 32)', '(4, 6, 6, 2)'], answer: 0,
                reveal: '(4,2,6,32) @ (4,2,32,6) → (4,2,6,6). T×T regardless of D.' },
              { label: 'out shape', options: ['(4, 2, 6, 32)', '(4, 2, 6, 6)', '(4, 6, 2, 32)'], answer: 0,
                reveal: '(4,2,6,6) @ (4,2,6,32) → (4,2,6,32). Matches Q/K/V shape.' },
            ] },
        ] as const),
      },
    ],
  },

  // ── Inside the Transformer ────────────────────────────────────────────────
  {
    slug: 'internals',
    title: 'Inside the Transformer',
    emoji: '🔬',
    blurb: 'Word order, the causal mask, and how gradients actually reach layer 1.',
    minutes: 5,
    steps: [
      {
        kind: 'concept',
        title: 'Three quiet tricks',
        lines: [
          'Attention is a weighted sum, and sums do not care about order: shuffle the words and the math gives the same answer. Something has to tell the model where each token sits.',
          'Two more tricks hide inside every GPT: a mask that stops training from cheating, and a design that lets the loss signal survive the trip back to layer 1. None of them are glamorous. Remove any one and the model does not train.',
        ],
        cta: 'Break word order',
      },
      { kind: 'widget', widget: PositionPlay },
      {
        kind: 'mcq',
        prompt: 'A transformer with no positional encoding reads "dog bites man" and "man bites dog". What does it compute?',
        options: [
          'The same bag-of-words representation for both — the sentences are indistinguishable',
          'Different outputs, because Q, K, V projections differ per position',
          'It refuses to run: sequence order is required by the attention shape',
          'The same output only at temperature 0',
        ],
        answer: 0,
        explain: 'Attention scores depend on token content, not location. Every token attends to the same set of tokens either way, so the weighted sums match. Positional encodings break the tie by making "dog at position 0" a different input than "dog at position 2".',
        nudge: 'You saw it in the widget: what happened to the two vectors with positions OFF?',
      },
      { kind: 'widget', widget: CausalMaskPlay },
      {
        kind: 'mcq',
        prompt: 'At inference the future genuinely does not exist yet. So why does training need a causal mask at all?',
        options: [
          'Training feeds the whole sequence at once, so every position predicts in parallel and the future is physically present in the tensor',
          'Training data arrives shuffled, so order must be enforced by the mask',
          'The mask exists to save memory on long sequences',
          'It is a regularizer that prevents overfitting to common phrases',
        ],
        answer: 0,
        explain: 'Training is parallel: one forward pass scores all T positions simultaneously (teacher forcing). Position 3 predicts token 4 while token 4 sits right there in the same tensor. The -∞ mask is what makes each prediction honest.',
        nudge: 'Think about what the training tensor contains when all positions are processed at once.',
      },
      { kind: 'widget', widget: BackpropPlay },
      {
        kind: 'predict',
        prompt: 'A 10-layer network uses sigmoid activations at their steepest point (derivative 0.25). Predict what happens to the gradient by layer 1 — and the fix every transformer uses.',
        questions: [
          { label: 'Gradient scale at layer 1', options: ['~1e-6 (0.25¹⁰)', '~0.025 (0.25 × 10)', '~0.25 (only the last layer matters)'], answer: 0,
            reveal: 'Multiplication compounds: 0.25^10 ≈ 9.5e-7. Layer 1 receives a millionth of the signal and effectively stops learning. Depth without a fix is a dead end.' },
          { label: 'The standard fix', options: ['Residual connections: an unmodified path for the gradient past every layer', 'A much larger learning rate for early layers', 'Training the layers one at a time'], answer: 0,
            reveal: 'x + f(x) means the gradient always has an identity path around the block: no multiplication, no vanishing. Residual streams are why 100-layer transformers train at all. (ReLU-family activations help for the same reason: derivative 1, not 0.25.)' },
        ],
      },
    ],
  },

  // ── L4: Training ──────────────────────────────────────────────────────────
  {
    slug: 'training',
    title: 'Training Loop',
    emoji: '🔁',
    blurb: 'Forward pass, loss, backward, step — and why the learning rate rules them all.',
    minutes: 5,
    steps: [
      {
        kind: 'concept',
        title: 'Four lines that train every LLM',
        lines: [
          'Training repeats four steps: (1) forward pass — run the model on a batch; (2) loss — measure how wrong the predictions are; (3) backward — compute how each weight contributed to that wrongness; (4) step — nudge every weight in the direction that reduces loss.',
          'Language models train on next-token prediction: given the first N tokens of a sequence, predict token N+1. Cross-entropy loss measures the gap between the predicted probability distribution and the actual next token.',
        ],
        cta: 'Show me the knob',
      },
      { kind: 'widget', widget: LrPlay },
      {
        kind: 'mcq',
        prompt: 'Loss is stuck at the same value for 1000 steps, barely moving. What is the most likely cause?',
        options: [
          'Learning rate too small or zero',
          'Learning rate too large',
          'Batch size is a power of two (should be odd)',
          'The optimizer has converged to the global minimum',
        ],
        answer: 0,
        explain: 'Tiny or zero learning rate means the weight updates are negligibly small; loss flatlines. Too-large LR typically causes loss to spike or bounce. A truly converged minimum is possible but rare so early in training.',
        nudge: 'Too large causes spikes. Too small causes... what?',
      },
      {
        kind: 'mcq',
        prompt: 'After loss.backward(), you call optimizer.zero_grad() before the next forward pass. Why?',
        options: [
          'PyTorch accumulates gradients by default; zero_grad() resets them before the next batch',
          'zero_grad() clears the loss value so it is not double-counted',
          'It frees GPU memory used by activations',
          'It is only needed for RNNs, not transformers',
        ],
        answer: 0,
        explain: 'PyTorch adds gradients into .grad tensors rather than overwriting them. Without zero_grad(), each backward pass adds to previous gradients, and your effective gradient is a sum over multiple batches — usually not what you want.',
        nudge: 'The word "accumulates" is the key. Gradients do not reset on their own.',
      },
      {
        kind: 'predict',
        prompt: 'A 10-token sequence. The model sees tokens 1–9 and predicts the next token at each position. How many loss terms?',
        code: '# input:  tokens[0:9]   — positions 0 through 8\n# target: tokens[1:10]  — the next token at each position',
        questions: [
          { label: 'Number of (prediction, target) pairs', options: ['9', '10', '1', '8'], answer: 0,
            reveal: 'At each of the 9 input positions the model emits a distribution over the vocabulary. Each distribution is compared to the known next token. One loss term per position, averaged: 9 total.' },
        ],
      },
    ],
  },

  // ── L5: Sampling ──────────────────────────────────────────────────────────
  {
    slug: 'sampling',
    title: 'Decoding & Sampling',
    emoji: '🎲',
    blurb: 'How a trained model turns probabilities into words — and why temperature matters.',
    minutes: 4,
    steps: [
      {
        kind: 'concept',
        title: 'Logits to tokens',
        lines: [
          'After the forward pass, the model outputs one number per vocabulary item: the logit. Softmax converts logits to probabilities. Then a decoding strategy picks the next token.',
          'Greedy decoding always picks the highest probability token. It is fast and consistent but often generic. Sampling draws from the distribution, which introduces variety — controlled by temperature.',
        ],
        cta: 'Play with temperature',
      },
      { kind: 'widget', widget: GenerationPlay },
      { kind: 'widget', widget: TemperaturePlay },
      {
        kind: 'mcq',
        prompt: 'Top-p (nucleus) sampling picks from the smallest set of tokens whose cumulative probability ≥ p. With p = 0.9 and T = 1.0, what does raising T to 2.0 do to the nucleus?',
        options: [
          'Flattens probabilities, so more tokens are needed to reach 90% — nucleus grows',
          'Sharpens probabilities, so fewer tokens reach 90% — nucleus shrinks',
          'Temperature only affects top-k, not top-p',
          'The nucleus size stays the same; only the sampled token changes',
        ],
        answer: 0,
        explain: 'Higher T flattens the distribution: probability is spread more evenly across tokens, so you need more of them to accumulate 90%. The nucleus grows, giving the model more diversity to draw from.',
        nudge: 'Think about what you saw in the widget when T was high. Was mass concentrated or spread?',
      },
      {
        kind: 'mcq',
        prompt: 'You need perfectly reproducible text output (same input → same output every run). Which decoding setting guarantees this?',
        options: [
          'T = 0 (greedy: always the argmax)',
          'T = 1.0 with a fixed random seed',
          'Top-p = 1.0',
          'Beam search width = 1',
        ],
        answer: 0,
        explain: 'T = 0 is pure greedy: argmax of logits, no randomness at all. A fixed seed with T > 0 gives reproducibility only if the sampling environment is bit-for-bit identical, which is fragile across library versions and hardware.',
        nudge: 'Seed-based reproducibility is fragile. What strategy removes randomness entirely?',
      },
      {
        kind: 'predict',
        prompt: 'Vocabulary = 50,000 tokens. The final linear layer maps from hidden size 1024 to logit scores. Predict the weight shape.',
        questions: [
          { label: 'lm_head.weight', options: ['(50000, 1024)', '(1024, 50000)', '(50000,)'], answer: 0,
            reveal: 'The linear layer computes x @ W.T + b. W has shape (out_features, in_features) = (50000, 1024). One row per vocabulary item; the dot with the hidden state is the logit for that token.' },
        ],
      },
    ],
  },

  // ── L6: Efficiency ────────────────────────────────────────────────────────
  {
    slug: 'efficiency',
    title: 'Scale & Efficiency',
    emoji: '⚡',
    blurb: 'KV-cache, quantization, and why fitting on one GPU is an engineering problem.',
    minutes: 4,
    steps: [
      {
        kind: 'concept',
        title: 'Memory is the constraint',
        lines: [
          'A 7B model at fp32 needs 28 GB just for weights — before activations or the KV-cache. Fitting inference on commodity hardware requires reducing precision, and that trade-off is now well understood.',
          'The KV-cache stores computed key and value tensors across tokens. Without it, each new token requires a full recomputation over the entire context. With it, generation is O(1) per new token instead of O(T²).',
        ],
        cta: 'Show me precision',
      },
      { kind: 'widget', widget: PrecisionPlay },
      {
        kind: 'mcq',
        prompt: 'During autoregressive generation with KV-cache enabled, how many new key-value pairs are computed per new token?',
        options: [
          'One pair per layer (for the new token only)',
          'T pairs per layer (full recomputation)',
          'H pairs per layer (one per attention head)',
          'Zero: the whole KV-cache is recomputed every step',
        ],
        answer: 0,
        explain: 'The cache holds all previously computed K and V tensors. When a new token arrives, the model computes new K and V only for that token, appends them, and attends over the full cached sequence. Cost is O(1) per new token, not O(T).',
        nudge: 'The point of a cache is to not recompute what you already have.',
      },
      {
        kind: 'mcq',
        prompt: 'Grouped-query attention (GQA) uses fewer K/V heads than Q heads. What is the primary benefit?',
        options: [
          'Smaller KV-cache: fewer heads to store and transfer',
          'Lower attention score quality, so the model focuses on nearby tokens only',
          'Removes the need for positional encodings',
          'Reduces the number of parameters in the embedding layer',
        ],
        answer: 0,
        explain: 'KV-cache size = 2 × layers × heads × T × D. Halving the K/V heads halves cache memory and memory-bandwidth cost, which is the main bottleneck in large-context inference. Model quality degrades surprisingly little.',
        nudge: 'GQA reduces K and V. Where do K and V live at inference time?',
      },
      {
        kind: 'predict',
        ...dailyPick([
          { prompt: 'T = 2048, 32 layers, 32 K/V heads, head dim D = 128, fp16 (2 bytes). KV-cache in GB?',
            questions: [{ label: '2 × layers × heads × T × D × bytes', options: ['0.5 GB', '2 GB', '8 GB'], answer: 0,
              reveal: '2×32×32×2048×128×2 ≈ 537 MB ≈ 0.5 GB. At T=32k this becomes 8 GB — the consumer GPU limit.' }] },
          { prompt: 'T = 8192, 32 layers, 8 K/V heads (GQA), head dim D = 128, fp16 (2 bytes). KV-cache in GB?',
            questions: [{ label: '2 × layers × heads × T × D × bytes', options: ['0.5 GB', '2 GB', '4 GB'], answer: 0,
              reveal: '2×32×8×8192×128×2 ≈ 537 MB ≈ 0.5 GB. GQA (8 heads vs 32) cuts cache 4× — same size as the baseline despite 4× longer context.' }] },
          { prompt: 'T = 4096, 40 layers, 40 K/V heads, head dim D = 128, fp16 (2 bytes). KV-cache in GB?',
            questions: [{ label: '2 × layers × heads × T × D × bytes', options: ['2.5 GB', '0.5 GB', '10 GB'], answer: 0,
              reveal: '2×40×40×4096×128×2 ≈ 2.68 GB ≈ 2.5 GB. This is a 13B-class model at medium context — fits a 4090 alongside ~26 GB of weights.' }] },
        ] as const),
      },
    ],
  },

  // ── L7: Alignment ─────────────────────────────────────────────────────────
  {
    slug: 'alignment',
    title: 'RLHF & Alignment',
    emoji: '🎯',
    blurb: 'Reward modeling, PPO, and why reward hacking makes alignment hard.',
    minutes: 5,
    steps: [
      {
        kind: 'concept',
        title: 'Pre-training is not alignment',
        lines: [
          'A pre-trained model predicts the next token well. It does not know whether it should be helpful, honest, or harmless. It will complete "How do I..." with whatever text statistically follows in training data.',
          'RLHF adds a second phase: humans compare pairs of model responses and rate which is better. These ratings train a reward model (RM) that scores responses. Reinforcement learning then fine-tunes the base model to maximize RM score, subject to a KL penalty that keeps it close to the original.',
        ],
        cta: 'See reward hacking',
      },
      { kind: 'widget', widget: RewardHackPlay },
      {
        kind: 'mcq',
        prompt: 'The KL penalty in RLHF (PPO) keeps the fine-tuned model close to the SFT base. What goes wrong if you remove it?',
        options: [
          'The model collapses onto a few high-reward response patterns, losing diversity and coherence',
          'Training becomes faster but the reward model diverges',
          'The SFT model updates its weights along with the RL policy',
          'Nothing: KL is only used to stabilize gradients, not to constrain behavior',
        ],
        answer: 0,
        explain: 'Without the KL penalty the RL policy can drift far from the language model prior. It discovers narrow patterns that score high on the reward model — often via reward hacking — and loses the general-purpose language ability that makes it useful.',
        nudge: 'The KL term is a tether. What happens when you remove a tether?',
      },
      {
        kind: 'mcq',
        prompt: 'Constitutional AI (CAI) / RLAIF trains the reward model using AI-generated preference labels instead of human ones. The main motivation is:',
        options: [
          'Scaling feedback collection without requiring millions of human comparisons',
          'Removing the need for a reward model entirely',
          'Making the process more transparent by using only rule-based signals',
          'Preventing gradient updates from changing the base model',
        ],
        answer: 0,
        explain: 'Human labeling is the bottleneck: expensive, slow, and inconsistent at scale. RLAIF uses a capable LLM to generate and critique responses, producing preference data at much higher volume. The base insight: a strong enough LLM can approximate human judgment for many tasks.',
        nudge: 'What is the resource that human labeling consumes that RLAIF replaces?',
      },
      { kind: 'widget', widget: CalibrationPlay },
      {
        kind: 'mcq',
        prompt: 'GPT-4\'s base model was well calibrated: 80% confidence meant right about 80% of the time. After RLHF, calibration got worse. Why?',
        options: [
          'Human raters prefer confident-sounding answers, so RLHF tunes tone toward confidence regardless of accuracy',
          'RLHF deletes probability information from the weights',
          'The reward model injects random noise into the logits',
          'Calibration and helpfulness are mathematically incompatible',
        ],
        answer: 0,
        explain: 'Hedged answers ("I am not sure, but...") score lower with raters, so the policy learns to sound sure. The knowledge is still in the weights; the stated confidence is a learned style optimized for approval, not truth. This is why "the model sounds certain" is not evidence.',
        nudge: 'Which answer would you rate higher: a confident one or a hedged one? RLHF learned from people like you.',
      },
      {
        kind: 'predict',
        prompt: 'The reward model scores a response with a scalar. It is initialized from the SFT model with one layer changed. Which layer?',
        questions: [
          { label: 'Layer replaced to output a scalar', options: ['lm_head → linear(hidden, 1)', 'The embedding layer', 'The first attention layer', 'The positional encoding'], answer: 0,
            reveal: 'The language-model head maps hidden → vocab_size. The reward head replaces it with hidden → 1: one score per sequence. Everything else — weights, attention, FFN — transfers from the SFT model and fine-tunes on preference pairs.' },
        ],
      },
    ],
  },

  // ── L9: Embeddings ────────────────────────────────────────────────────────
  {
    slug: 'embeddings',
    title: 'Embeddings & Meaning',
    emoji: '🗺️',
    blurb: 'How words become points in space, and why distance means similarity.',
    minutes: 5,
    steps: [
      {
        kind: 'concept',
        title: 'Meaning as geometry',
        lines: [
          'Token IDs are arbitrary integers: "cat" = 5246 says nothing about cats. The embedding layer replaces each ID with a learned vector of hundreds of numbers, and those vectors are where meaning lives.',
          'Training pushes words that appear in similar contexts toward each other. After enough data, direction and distance encode real relationships: similarity, category, even analogy.',
        ],
        cta: 'Explore the space',
      },
      { kind: 'widget', widget: EmbeddingPlay },
      { kind: 'widget', widget: EmbeddingArithPlay },
      {
        kind: 'mcq',
        prompt: 'Two embedding vectors are normalized to length 1. Their dot product is 0.02. The words are most likely:',
        options: [
          'Unrelated (nearly orthogonal directions)',
          'Synonyms (nearly identical meaning)',
          'Antonyms (opposite meanings)',
          'The same word tokenized differently',
        ],
        answer: 0,
        explain: 'For unit vectors the dot product IS the cosine similarity: 1 means same direction (synonyms), -1 opposite, 0 orthogonal, i.e., no learned relationship. 0.02 is as unrelated as it gets.',
        nudge: 'Dot product of unit vectors = cosine of the angle between them. What angle gives 0?',
      },
      {
        kind: 'mcq',
        prompt: 'The famous result king - man + woman ≈ queen demonstrates what property of embedding spaces?',
        options: [
          'Relationships are encoded as consistent directions (linear structure)',
          'Embeddings memorize word co-occurrence counts exactly',
          'The vocabulary is sorted alphabetically in the space',
          'Gender is stored in a single dedicated dimension',
        ],
        answer: 0,
        explain: 'The offset from man to woman is roughly the same direction as king to queen: the "gender direction". Analogies work because training pressure organizes relationships into consistent linear directions, not because any single dimension holds them.',
        nudge: 'The arithmetic works with vector offsets. What does a consistent offset represent?',
      },
      {
        kind: 'predict',
        prompt: 'Retrieval systems embed whole sentences the same way. Predict the pipeline result.',
        code: 'query   = embed("How do I reset my password?")   # (768,)\ndocs    = embed_all(10_000 support articles)      # (10000, 768)\nscores  = docs @ query                            # ??',
        questions: [
          { label: 'scores shape and meaning', options: ['(10000,) — one similarity per document', '(768,) — one score per dimension', '(10000, 768) — unchanged'], answer: 0,
            reveal: '(10000, 768) @ (768,) → (10000,): each entry is the dot product of one document with the query. Argmax gives the best match. This one matmul is the heart of dense retrieval, and of Course 5.' },
        ],
      },
    ],
  },

  // ── L10: Mixture of Experts ───────────────────────────────────────────────
  {
    slug: 'moe',
    title: 'Mixture of Experts',
    emoji: '🚦',
    blurb: 'Why a 47B model can run at 13B cost: routers, experts, and sparse compute.',
    minutes: 4,
    steps: [
      {
        kind: 'concept',
        title: 'Not every parameter, every token',
        lines: [
          'In a dense transformer, every token flows through every parameter. But the feed-forward network, roughly two thirds of all parameters, does not need to be monolithic.',
          'MoE replaces one big FFN with several smaller "experts" plus a tiny router. The router scores the experts per token and sends each token through only the top 2. Total parameters grow; compute per token barely moves.',
        ],
        cta: 'Route some tokens',
      },
      { kind: 'widget', widget: MoePlay },
      {
        kind: 'mcq',
        prompt: 'A layer has 8 experts, router picks top-2 per token. What fraction of expert parameters is active for one token?',
        options: ['1/4', '1/8', '1/2', 'All of them — the router only reweights'],
        answer: 0,
        explain: '2 of 8 experts run: 2/8 = 1/4 of the expert parameters. The other 6 experts stay untouched for this token. That gap between stored and active parameters is the entire MoE economy.',
        nudge: '2 experts out of 8 run. What fraction is that?',
      },
      {
        kind: 'mcq',
        prompt: 'Without a load-balancing loss, MoE training tends to collapse. What actually happens?',
        options: [
          'The router sends nearly all tokens to a few favorite experts; the rest never learn',
          'Experts become identical copies of each other',
          'The router weights overflow to infinity',
          'Tokens get routed to zero experts and produce empty outputs',
        ],
        answer: 0,
        explain: 'A slightly better expert gets more tokens, so it improves faster, so it gets even more tokens: a rich-get-richer loop. The auxiliary loss penalizes uneven routing so all experts stay in training. Classic Goodhart-adjacent failure, met before in RLHF.',
        nudge: 'Think rich-get-richer: what does early success do to routing?',
      },
      {
        kind: 'predict',
        prompt: 'Mixtral 8x7B: 8 experts per layer, top-2 routing. Marketing math says 8 x 7B = 56B, but the real numbers differ. Predict both.',
        questions: [
          { label: 'Total stored parameters', options: ['~47B — attention layers are shared, not multiplied', '56B exactly', '~13B'], answer: 0,
            reveal: 'Only the FFN is replicated 8x. Attention, embeddings, and norms exist once per layer. Shared parts + 8 expert sets ≈ 47B stored.' },
          { label: 'Active parameters per token', options: ['~13B', '~47B', '~7B'], answer: 0,
            reveal: 'Shared layers + 2 of 8 experts ≈ 13B active. You pay 47B of memory to get 13B of compute per token, with quality closer to a dense 47B model.' },
        ],
      },
    ],
  },

  // ── L11: Retrieval & RAG ──────────────────────────────────────────────────
  {
    slug: 'rag',
    title: 'Retrieval & RAG',
    emoji: '📚',
    blurb: 'Ground the model in documents it never trained on — and dodge the wrong Apollo.',
    minutes: 4,
    steps: [
      {
        kind: 'concept',
        title: 'Two kinds of knowledge',
        lines: [
          'Parametric knowledge lives in the weights: whatever the model absorbed during training, frozen at the cutoff date, impossible to cite, expensive to update.',
          'Retrieval-augmented generation adds non-parametric knowledge: embed the query, find the most similar documents in a vector index, paste them into the context, and instruct the model to answer from them. Fresh facts without retraining, and every claim has a source.',
        ],
        cta: 'Tune the retriever',
      },
      { kind: 'widget', widget: RagPlay },
      {
        kind: 'mcq',
        prompt: 'Your product docs change weekly. Users need accurate, citable answers. Why is RAG the right call over fine-tuning?',
        options: [
          'Updating the index is instant and answers can cite sources; fine-tuning is slow, expensive, and still hallucinates',
          'Fine-tuning cannot ingest documents, only conversations',
          'RAG makes the base model larger and therefore smarter',
          'Fine-tuned models legally cannot cite documents',
        ],
        answer: 0,
        explain: 'Fine-tuning bakes knowledge into weights: days of work per update, no provenance, and the model still guesses when unsure. A vector index updates in seconds and retrieved passages double as citations. Fine-tune for style and format; retrieve for facts.',
        nudge: 'Which approach lets you update knowledge without touching the model?',
      },
      {
        kind: 'mcq',
        prompt: 'The Apollo Theater ranked high for "When did Apollo 11 land?" in the widget. What retrieval fix targets exactly this failure?',
        options: [
          'Hybrid retrieval: combine semantic similarity with lexical BM25, then rerank the union',
          'Increase k so the right document is guaranteed to appear somewhere',
          'Lowercase all documents before embedding',
          'Use a bigger generation model so it can ignore bad context',
        ],
        answer: 0,
        explain: 'The theater matched on the word "Apollo" (lexical overlap) despite wrong meaning. Dense embeddings catch meaning but miss exact terms; BM25 catches terms but misses meaning. Fusing both and reranking the union beats either alone, which is exactly what Course 5 has you build.',
        nudge: 'The failure is lexical overlap without semantic match. What combines both signals?',
      },
      {
        kind: 'predict',
        prompt: 'Context budget arithmetic. Window = 8192 tokens; system prompt + question + answer reserve 1200; each retrieved chunk is 600 tokens.',
        questions: [
          { label: 'Maximum k that fits', options: ['11', '13', '8'], answer: 0,
            reveal: '(8192 - 1200) / 600 = 11.65, floor to 11. And more is not better: mid-context passages get less attention (lost-in-the-middle), so production systems usually retrieve wide and rerank down to 3-5.' },
        ],
      },
    ],
  },

  // ── L12: Fine-Tuning & LoRA ───────────────────────────────────────────────
  {
    slug: 'finetuning',
    title: 'Fine-Tuning & LoRA',
    emoji: '🔧',
    blurb: 'Adapt a 7B model on one GPU by training 0.1% of it.',
    minutes: 6,
    steps: [
      {
        kind: 'concept',
        title: 'The adaptation ladder',
        lines: [
          'Full fine-tuning updates every weight: best quality ceiling, but a 7B model needs ~84 GB of GPU memory once you add gradients and optimizer state to the weights themselves.',
          'LoRA (Low-Rank Adaptation) freezes the base model and adds a thin bypass to chosen layers: the update to W is factored as B x A, where A is (r x d) and B is (d x r) with rank r as small as 4. Train only A and B; at inference, merge them into W for zero added latency.',
        ],
        cta: 'Pick a rank',
      },
      { kind: 'widget', widget: LoraPlay },
      {
        kind: 'mcq',
        prompt: 'Why does rank 8 usually match full fine-tuning quality, despite training 100x fewer parameters?',
        options: [
          'Fine-tuning weight updates are intrinsically low-rank; a thin B x A captures most of the real change',
          'The base model quietly updates too, adding capacity back',
          'Rank 8 adapters store 8 full copies of each weight matrix',
          'Modern optimizers compress gradients to rank 8 anyway',
        ],
        answer: 0,
        explain: 'Measured empirically: the delta between a fine-tuned and base model concentrates in a few directions. Adaptation mostly reuses and re-mixes features the model already has, and that kind of change is low-rank by nature. LoRA just parameterizes it directly.',
        nudge: 'The insight is about the update itself. How complex is the change fine-tuning actually makes?',
      },
      {
        kind: 'mcq',
        prompt: 'After fine-tuning on medical Q&A, your model writes prescriptions beautifully but has forgotten how to code. The standard name and standard mitigation:',
        options: [
          'Catastrophic forgetting; mix general data into training, or use LoRA so the base stays frozen',
          'Mode collapse; raise the temperature during training',
          'Overfitting; train for more epochs on the medical data',
          'Reward hacking; add a KL penalty against the reward model',
        ],
        answer: 0,
        explain: 'Gradient updates that help the new task overwrite weights the old tasks needed. Replaying general data keeps those weights exercised. LoRA sidesteps it structurally: the base never changes, and you can even unplug the adapter to get the original model back.',
        nudge: 'The model forgot old skills while learning new ones. What is that called?',
      },
      { kind: 'widget', widget: DistillPlay },
      {
        kind: 'mcq',
        prompt: 'You want a 1B student to match a 70B teacher. Why are soft labels strictly better than hard labels for this?',
        options: [
          'Soft labels encode what the teacher almost said, giving non-zero gradient on wrong tokens and transferring relational knowledge',
          'Soft labels are one-hot just like hard labels but re-normalised over the top-10 tokens',
          'The student needs fewer epochs with soft labels because the teacher already picked the answer',
          'Hard labels cause the reward model to overfit to a specific output format',
        ],
        answer: 0,
        explain: 'A hard one-hot says "Paris = 1, everything = 0." A soft distribution says "Paris = 0.85, Lyon = 0.08" — the 0.08 for Lyon produces a non-zero gradient that teaches geographic proximity. Hinton called this dark knowledge: information the teacher encoded that never shows up as a correct answer.',
        nudge: 'Which tokens get a non-zero gradient under each target type?',
      },
      {
        kind: 'predict',
        prompt: 'You merge the trained LoRA into the base weights (W = W + B x A) and deploy. Predict both.',
        questions: [
          { label: 'Added inference latency after merging', options: ['Zero — the merged W is one matrix, same shape as before', 'One extra matmul per adapted layer', '~15% slower per token'], answer: 0,
            reveal: 'B x A has the same shape as W, so addition folds the adapter away entirely. The deployed model is byte-for-byte the same architecture as the base.' },
          { label: 'Serving 20 customer variants of one base model, best strategy', options: ['Keep adapters unmerged: one base in memory + 20 thin adapters', 'Merge all 20 into 20 full model copies', 'Retrain one model on all 20 datasets'], answer: 0,
            reveal: 'Unmerged adapters cost one extra matmul but let 20 variants share one 14 GB base — 20 merged copies would need 280 GB. This is how LoRA serving farms (and the multi-tenant idea behind them) work.' },
        ],
      },
    ],
  },

  // ── L13: Speculative Decoding & Test-Time Compute ─────────────────────────
  {
    slug: 'frontier',
    title: 'Faster & Smarter Inference',
    emoji: '🚀',
    blurb: 'Two frontier levers: speculative decoding for speed, test-time compute for quality.',
    minutes: 5,
    steps: [
      {
        kind: 'concept',
        title: 'The last two levers',
        lines: [
          'Training is over; the weights are frozen. Two levers remain. Lever one: generate the same answer faster — speculative decoding uses a small draft model to guess several tokens, and the big model verifies them in a single parallel pass.',
          'Lever two: spend more compute for a better answer — sample many solutions and vote, or let the model think longer before answering. Quality becomes a dial you turn at inference time.',
        ],
        cta: 'Run the draft model',
      },
      { kind: 'widget', widget: SpecDecodePlay },
      {
        kind: 'mcq',
        prompt: 'Speculative decoding uses a small draft model to propose tokens. What happens to output quality?',
        options: [
          'Nothing: the accept/reject rule makes outputs exactly match the big model\u2019s own distribution',
          'Slightly worse: some draft tokens slip through unverified',
          'Slightly better: two models act as an ensemble',
          'Depends on the draft model\u2019s training data',
        ],
        answer: 0,
        explain: 'The verification step accepts a draft token with probability min(1, p_target/p_draft) and resamples on rejection. That rejection-sampling rule provably reproduces the target distribution exactly. It is pure speed: typically 2-3x, with zero quality change.',
        nudge: 'The big model verifies every token. Can a wrong-distribution token survive that?',
      },
      {
        kind: 'mcq',
        prompt: 'A model solves a math problem correctly 60% of the time. You sample 5 answers and take the majority. Roughly what happens and why?',
        options: [
          'Accuracy rises well above 60%: independent errors scatter, correct answers agree',
          'Accuracy stays 60%: sampling more cannot add information',
          'Accuracy drops: wrong answers form coalitions',
          'Accuracy hits 100% with enough samples, for any starting point',
        ],
        answer: 0,
        explain: 'Wrong answers spread across many different mistakes while correct answers coincide, so the majority is right far more than any single sample (~68% for 3-of-5 at p=0.6, higher with more samples). The ceiling is real though: below 50% per-sample, voting amplifies the noise instead.',
        nudge: 'Correct answers agree with each other. Do wrong answers?',
      },
      {
        kind: 'predict',
        prompt: 'Draft proposes 4 tokens per round; the target accepts each with probability 0.8 (independent, stop at first reject). Predict the expected speedup shape.',
        questions: [
          { label: 'Expected accepted tokens per target pass (plus the free fix token)', options: ['~3.6 — near the full 5 but discounted by rejections', 'Exactly 5 every round', '~1.2 — barely better than sequential'], answer: 0,
            reveal: 'E = 0.8 + 0.64 + 0.512 + 0.41 ≈ 2.36 accepted, +1 token the target supplies on rejection or completion ≈ 3.4-3.6 tokens per big-model pass, versus 1 for sequential decoding. Acceptance rate is the whole game: a well-matched draft model is what makes it pay.' },
        ],
      },
    ],
  },

  // ── L15: Scaling Laws ────────────────────────────────────────────────────
  {
    slug: 'scaling',
    title: 'Scaling Laws',
    emoji: '🔭',
    blurb: 'Why bigger is not always better — compute-optimal training and the Chinchilla insight.',
    minutes: 5,
    steps: [
      {
        kind: 'concept',
        title: 'The compute-optimal frontier',
        lines: [
          'Three things determine model quality: parameters (N), training tokens (D), and compute (C ≈ 6ND FLOPs). For a fixed budget C you can trade N for D — more parameters with less data, or a smaller model trained longer.',
          'The Chinchilla paper (DeepMind, 2022) showed that most large models were over-parameterised and undertrained. GPT-3 (175B params, 300B tokens) needed roughly 3.5 trillion tokens to be compute-optimal. Llama models deliberately train small models very long to maximise quality at inference time.',
        ],
        cta: 'Explore the tradeoff',
      },
      { kind: 'widget', widget: ScalingPlay },
      {
        kind: 'mcq',
        prompt: 'Chinchilla says optimal tokens D* ≈ 20N*. You have compute for a 70B parameter model at the Chinchilla ratio. How many training tokens?',
        options: ['~1.4T tokens', '~300B tokens', '~70B tokens', '~10T tokens'],
        answer: 0,
        explain: '20 × 70B = 1.4T. Most "70B" models released before Chinchilla trained on 1–2T tokens anyway, but the ratio clarifies the principle: doubling parameters should be matched by doubling tokens, not just adding compute.',
        nudge: '20 × 70 billion = ?',
      },
      {
        kind: 'mcq',
        prompt: 'Inference-focused deployments (like Llama) deliberately over-train small models beyond the Chinchilla compute-optimal point. Why?',
        options: [
          'A smaller model trained longer is cheaper to serve at scale even if training cost was higher',
          'Over-training prevents weight drift during quantisation',
          'Small models have lower perplexity by definition',
          'Token count is cheaper than parameter count on most hardware',
        ],
        answer: 0,
        explain: 'Training is a one-time cost; inference runs millions of times. A 7B model trained on 2T tokens can match a 13B model trained compute-optimally — and it fits in half the VRAM, batches twice as large, and costs half as much per token. Chinchilla optimises for training; Llama optimises for deployment.',
        nudge: 'The model runs once during training. How many times does it run after deployment?',
      },
      {
        kind: 'predict',
        ...dailyPick([
          { prompt: 'A 30B model trained on 300B tokens. Is it compute-optimal per Chinchilla (D* = 20N*)?',
            questions: [{ label: 'Training status', options: ['Undertrained — needs 600B tokens', 'Compute-optimal', 'Overtrained'], answer: 0,
              reveal: '20×30B = 600B optimal. 300B is only half — spare capacity never filled.' }] },
          { prompt: 'A 7B model trained on 1T tokens. Is it compute-optimal per Chinchilla (D* = 20N*)?',
            questions: [{ label: 'Training status', options: ['Overtrained — optimal is 140B tokens', 'Compute-optimal', 'Undertrained'], answer: 0,
              reveal: '20×7B = 140B optimal tokens. 1T is 7× more — deliberately overtrained (Llama-style) for cheap inference.' }] },
          { prompt: 'A 13B model trained on 260B tokens. Is it compute-optimal per Chinchilla (D* = 20N*)?',
            questions: [{ label: 'Training status', options: ['Compute-optimal — 20×13B = 260B', 'Undertrained', 'Overtrained'], answer: 0,
              reveal: '20×13B = 260B. Exactly compute-optimal. A "free lunch" model: best quality for this training budget.' }] },
        ] as const),
      },
    ],
  },

  // ── L16: Attention Heads ──────────────────────────────────────────────────
  {
    slug: 'multihead',
    title: 'What Attention Heads Learn',
    emoji: '🧠',
    blurb: 'Each head specialises — coreference, syntax, position, global context.',
    minutes: 4,
    steps: [
      {
        kind: 'concept',
        title: 'One mechanism, many roles',
        lines: [
          'Multi-head attention runs several attention computations in parallel, each with its own Q, K, V weight matrices. The outputs are concatenated and projected back to the residual stream.',
          'Different heads spontaneously specialise. Interpretability research finds heads that track syntactic roles, resolve pronouns, copy from earlier positions, or aggregate global context. No two heads learn the same job.',
        ],
        cta: 'Inspect the heads',
      },
      { kind: 'widget', widget: MultiHeadPlay },
      {
        kind: 'mcq',
        prompt: 'Why does having multiple heads help over one big attention head with the same total compute?',
        options: [
          'Each head attends to a different aspect independently; a single head must average across all of them',
          'Multiple heads apply more softmax operations, making gradients stronger',
          'Heads prevent vanishing gradients by splitting the residual stream',
          'The concatenation operation introduces non-linearity that a single head lacks',
        ],
        answer: 0,
        explain: 'A single attention head computes one weighted combination of values. Multiple heads compute several, each sensitive to a different pattern. The concatenated output lets the FFN mix signals from all specialisations. One head trying to do everything produces a blurred average.',
        nudge: 'You saw it: each head had a sharp, distinct pattern. What would blending them produce?',
      },
      {
        kind: 'predict',
        ...dailyPick([
          { prompt: 'Model: hidden_dim=512, 8 heads, head_dim=64. Predict the weight shapes.',
            questions: [
              { label: 'W_Q shape', options: ['(512, 512)', '(512, 64)', '(64, 512)'], answer: 0,
                reveal: 'W_Q projects hidden_dim→hidden_dim. Full shape (512,512), then chunked into 8×64 slices per head.' },
              { label: 'W_O shape', options: ['(512, 512)', '(8, 64)', '(512, 64)'], answer: 0,
                reveal: 'Concat 8 heads × 64 = 512; W_O projects 512→512. Shape: (512,512).' },
            ] },
          { prompt: 'Model: hidden_dim=768, 12 heads, head_dim=64. Predict the weight shapes.',
            questions: [
              { label: 'W_Q shape', options: ['(768, 768)', '(768, 64)', '(64, 768)'], answer: 0,
                reveal: 'W_Q: (hidden_dim, hidden_dim) = (768,768). GPT-2 base uses exactly these dimensions.' },
              { label: 'W_O shape', options: ['(768, 768)', '(12, 64)', '(768, 64)'], answer: 0,
                reveal: 'Concat 12×64=768; W_O: (768,768).' },
            ] },
          { prompt: 'Model: hidden_dim=1024, 16 heads, head_dim=64. Predict the weight shapes.',
            questions: [
              { label: 'W_Q shape', options: ['(1024, 1024)', '(1024, 64)', '(64, 1024)'], answer: 0,
                reveal: 'W_Q: (1024,1024). head_dim = 1024/16 = 64, full W_Q still maps hidden→hidden.' },
              { label: 'W_O shape', options: ['(1024, 1024)', '(16, 64)', '(1024, 64)'], answer: 0,
                reveal: 'Concat 16×64=1024; W_O: (1024,1024).' },
            ] },
        ] as const),
      },
    ],
  },

  // ── L17: Decoding Strategies ──────────────────────────────────────────────
  {
    slug: 'decoding',
    title: 'Decoding Strategies',
    emoji: '🌲',
    blurb: 'Beam search, sampling, top-p, top-k — and when each one wins.',
    minutes: 4,
    steps: [
      {
        kind: 'concept',
        title: 'After the logits: the choice',
        lines: [
          'The model outputs logits. You decide how to turn them into a token. This decision has a large effect on output character — and the right choice depends on the task.',
          'Greedy decoding picks the argmax every time: fast, reproducible, but tends toward bland high-probability phrases. Beam search expands multiple hypotheses in parallel. Sampling draws from the distribution, optionally filtered by top-k or top-p to prevent incoherent low-probability tokens.',
        ],
        cta: 'Walk through beam search',
      },
      { kind: 'widget', widget: BeamPlay },
      {
        kind: 'mcq',
        prompt: 'You are building a coding assistant that must return identical completions given the same prefix. Which decoding strategy?',
        options: [
          'Greedy (T=0): deterministic, always the argmax',
          'Top-p sampling with p=0.9',
          'Beam search width 5',
          'Temperature 0.7 with top-k=50',
        ],
        answer: 0,
        explain: 'Determinism is the requirement. Greedy (T=0) produces the same output for the same input every time. Beam search is also deterministic but slower. Sampling adds variance — bad for a predictable tool.',
        nudge: 'The requirement is "identical given the same prefix". Which strategy has no randomness?',
      },
      {
        kind: 'mcq',
        prompt: 'Why does beam search tend to produce repetitive or generic text in open-ended generation?',
        options: [
          'It finds the sequence with the highest cumulative probability, which is usually common, generic text',
          'Beam search uses a lower temperature than greedy by default',
          'The beam width limits vocabulary breadth to k tokens per step',
          'It only samples from the top-k tokens, cutting off creative choices',
        ],
        answer: 0,
        explain: 'High-probability text is statistically common text. Beam search is very good at finding it. Creative, specific, or unusual text scores lower — exactly what you want for stories or brainstorming, exactly what beam search avoids.',
        nudge: 'You saw it: beam found "on the", not "by fire". What kind of language maximises average log-probability?',
      },
      {
        kind: 'predict',
        prompt: 'Top-p (nucleus) sampling with p=0.9. Predict what happens to the nucleus size as temperature T increases.',
        questions: [
          { label: 'Nucleus size as T increases', options: ['Grows toward the full vocabulary', 'Shrinks to a single token', 'Stays the same size'], answer: 0,
            reveal: 'Higher T flattens the distribution. To accumulate 90% probability you need more tokens, so the nucleus grows. At T→∞ it becomes uniform sampling across the full vocabulary.' },
        ],
      },
    ],
  },

  // ── L18: Generalisation ───────────────────────────────────────────────────
  {
    slug: 'generalisation',
    title: 'Overfitting & Generalisation',
    emoji: '📉',
    blurb: 'Why training loss is not the metric you care about — and how to stop at the right moment.',
    minutes: 4,
    steps: [
      {
        kind: 'concept',
        title: 'Two losses, one truth',
        lines: [
          'Training loss measures how well the model fits the data it has seen. It always improves with more training — given enough capacity, a model can memorise every training example.',
          'Validation loss measures performance on data the model has never seen. When validation loss starts rising while training loss keeps falling, the model has stopped learning general patterns and started memorising specifics. This is overfitting.',
        ],
        cta: 'Find the optimal stopping point',
      },
      { kind: 'widget', widget: EarlyStopPlay },
      {
        kind: 'mcq',
        prompt: 'Train loss: 0.3, val loss: 1.8, gap widening each epoch. The model has:',
        options: [
          'Severely overfit — memorised training data, poor generalisation',
          'Underfit — needs more capacity or training',
          'Reached optimal performance; the gap is expected for large models',
          'Converged normally; a 1.5 gap is within variance',
        ],
        answer: 0,
        explain: 'A large and widening train/val gap is the definition of overfitting. The model has learned to reproduce training examples rather than underlying patterns. Fixes: early stopping, dropout, weight decay, more data, or a smaller model.',
        nudge: 'Train loss fell further but val loss rose. What is the model doing to training examples?',
      },
      {
        kind: 'predict',
        prompt: 'You have 100k examples and want to tune early stopping. Design the split.',
        questions: [
          { label: 'Correct strategy', options: ['Train/val/test: use val for stopping, keep test unseen until final eval', 'Train/test only: stop when test loss plateaus', 'Use held-out training batches as val'], answer: 0,
            reveal: 'Three-way split: train on train, stop using val, report test once. Using test for early stopping contaminates it — the final number will look better than true out-of-sample performance. Test must remain unseen throughout development.' },
        ],
      },
    ],
  },

  // ── L19: Agents & Tool Use ────────────────────────────────────────────────
  {
    slug: 'agents',
    title: 'Agents & Tool Use',
    emoji: '🤖',
    blurb: 'How an LLM becomes an agent: loops, tool calls, and when to stop.',
    minutes: 4,
    steps: [
      {
        kind: 'concept',
        title: 'From model to agent',
        lines: [
          'A language model is stateless: one input, one output. An agent wraps the model in a loop: the model reasons about what to do, calls a tool, observes the result, and repeats until it has enough to answer.',
          'Tools are deterministic black boxes — a calculator, a search engine, a code interpreter, a database query. The agent decides when to delegate to a tool versus when to answer from its own knowledge.',
        ],
        cta: 'Try two tool-call decisions',
      },
      { kind: 'widget', widget: AgentPlay },
      {
        kind: 'mcq',
        prompt: 'An agent calls a web search tool 12 times on a single query, each time refining the search. The final answer is good but took 45 seconds. The design problem is:',
        options: [
          'No stopping condition — the agent did not know when it had enough information to answer',
          'The search tool was too slow; a faster tool would have fixed it',
          'The system prompt did not limit the number of searches',
          'Agents always require many tool calls; this is expected behaviour',
        ],
        answer: 0,
        explain: 'Without a clear criterion for "I have enough information," agents spin. Good agent design includes: a maximum turn budget, an explicit "I can answer now" decision step, and prompting that rewards sufficiency. Faster tools would not help — the agent would call them 12 times faster.',
        nudge: 'The tool was called 12 times. What decision was missing from the loop?',
      },
      {
        kind: 'mcq',
        prompt: 'ReAct interleaves thought steps with tool calls in the context window. The key advantage over pure chain-of-thought is:',
        options: [
          'Intermediate tool results are incorporated into subsequent reasoning, grounding each step in real observations',
          'Reasoning tokens are cheaper than tool calls',
          'ReAct prevents hallucination by replacing model reasoning with tool outputs entirely',
          'Tool calls do not consume context tokens in the ReAct format',
        ],
        answer: 0,
        explain: 'Chain-of-thought reasons from memory alone — hallucination compounds with each step. ReAct calls a tool, pastes the result into context, and reasons from that observation. Each step is anchored by real data rather than model extrapolation.',
        nudge: 'What does each tool result add to the context that pure reasoning cannot provide?',
      },
      {
        kind: 'predict',
        prompt: 'An agent loop: up to 10 turns. Each turn: thought (~100 tokens) + tool call (~20 tokens) + observation (~200 tokens). Starting context = 500 tokens.',
        questions: [
          { label: 'Worst-case context at turn 10', options: ['~3700 tokens', '~10000 tokens', '~500 tokens'], answer: 0,
            reveal: '500 + 10 × (100 + 20 + 200) = 500 + 3200 = 3700 tokens. Manageable today — but at 50 turns with long observations you hit context limits fast, requiring summarisation or external memory.' },
        ],
      },
    ],
  },

  // ── L8: Capstone ──────────────────────────────────────────────────────────
  {
    slug: 'capstone',
    title: 'System Gauntlet',
    emoji: '🏆',
    blurb: 'End-to-end: trace a prompt through every layer of the stack.',
    minutes: 5,
    steps: [
      {
        kind: 'concept',
        title: 'Full-stack trace',
        lines: [
          'A prompt enters as a string. It exits as tokens → embeddings → transformer layers → logits → sampled token → decoded string. Each level you have studied connects to the next.',
          'This capstone asks you to predict five facts that cross layer boundaries. No new concepts: everything is from lessons 1–7.',
        ],
        cta: 'Start the gauntlet',
      },
      {
        kind: 'mcq',
        prompt: 'You send "Paris" to GPT-style tokenizer. The model receives — what?',
        options: [
          'A list of integer token IDs',
          'A list of character Unicode code points',
          'A (1, 5) float tensor of character embeddings',
          'A single integer (word index)',
        ],
        answer: 0,
        explain: '"Paris" is likely one token: one integer ID (e.g., 28459). The model\'s embedding table converts that integer to a float vector. The string itself never enters the model.',
        nudge: 'Tokenizers output IDs, not characters or embeddings. What type is an ID?',
      },
      {
        kind: 'mcq',
        prompt: 'Context window = 8192 tokens. You have used 8000. Adding 300 more tokens will:',
        options: [
          'Require the oldest tokens to be evicted or cause an error',
          'Automatically extend the context with no quality loss',
          'Increase KV-cache size linearly: no hard limit exists in practice',
          'Have no effect: transformers process variable length for free',
        ],
        answer: 0,
        explain: 'The context window is a hard architectural constraint. Positional encodings and the KV-cache are sized at training time. Exceeding it either causes an error or forces truncation of the oldest tokens — the model has no memory of what was evicted.',
        nudge: 'The window is fixed at training. What happens when you try to overflow a fixed-size buffer?',
      },
      {
        kind: 'mcq',
        prompt: 'At T=1.0 you sample 5 independent completions to the same prompt. Are they identical?',
        options: [
          'No: T > 0 introduces randomness; each draw is different',
          'Yes: the forward pass is deterministic so outputs are identical',
          'Only the first token differs; subsequent tokens are greedy',
          'Yes, unless you set a different random seed each time',
        ],
        answer: 0,
        explain: 'T > 0 means sampling from a probability distribution. Each call draws independently, producing different token sequences. The forward pass is deterministic given inputs; the non-determinism comes entirely from the sampling step.',
        nudge: 'The forward pass is deterministic. Where does the randomness live?',
      },
      {
        kind: 'mcq',
        prompt: 'Loss is NaN from step 1. Gradients are finite. What is most likely?',
        options: [
          'A NaN or Inf in the input data or an embeddings overflow',
          'Learning rate is too small',
          'Batch size is too large for GPU memory',
          'The optimizer has not been initialized',
        ],
        answer: 0,
        explain: 'If gradients are finite but loss is NaN immediately, the most likely culprit is NaN in the input or an overflow in the forward pass — e.g., log(0) in cross-entropy from a probability that underflowed to 0.0, or an attention score overflow before the √d scaling.',
        nudge: 'NaN from step 1 is a forward-pass issue, not a gradient issue. Where does NaN enter?',
      },
      {
        kind: 'predict',
        prompt: 'Trace through a full inference call. Predict both answers.',
        code: '# GPT-2 small: 12 layers, 12 heads, hidden=768, vocab=50257\n# Prompt: "The model predicts" → 4 tokens\n# Generating 1 new token',
        questions: [
          { label: 'KV-cache entries added for this 1 new token', options: ['12 (one per layer)', '24 (K and V per layer)', '144 (12 layers × 12 heads)'], answer: 1,
            reveal: 'Each layer stores one K tensor and one V tensor for the new token: 2 × 12 = 24 new entries appended to the cache. The previous 4-token cache is untouched.' },
          { label: 'Logit vector length for the final hidden state', options: ['50257', '768', '12'], answer: 0,
            reveal: 'The lm_head maps hidden_size=768 → vocab_size=50257. The argmax (or sample) of that 50257-length vector is the next token ID.' },
        ],
      },
    ],
  },

  // ── L20: Reading the Frontier ─────────────────────────────────────────────
  {
    slug: 'modelcards',
    title: 'Reading the Frontier',
    emoji: '📇',
    blurb: 'Decode any 2026 model announcement: total vs active, context, license.',
    minutes: 5,
    steps: [
      {
        kind: 'concept',
        title: 'Two numbers, not one',
        lines: [
          'August 2026, one two-week stretch: Kimi K3 at 2.8T parameters, Qwen3.8-Max at 2.4T, Nemotron 3.5 Lightning at 30B, Qwen3.8-27B at 27.8B. The headline number tells you almost nothing until you find its partner: active parameters per token.',
          'Total parameters are a memory bill — every weight has to live somewhere. Active parameters are the compute bill — what actually runs per token, which sets speed and energy. Dense models: the two numbers are equal. MoE models: the gap between them is the entire story. Kimi K3 stores 2.8T but runs ~50B per token.',
        ],
        cta: 'Decode a headline',
      },
      {
        kind: 'mcq',
        prompt: 'Kimi K3 launches as "2.8T parameters, 896 experts, ~50B active." A colleague says it must be ~56x slower per token than a 50B dense model. What is wrong with that?',
        options: [
          'Nothing is 56x: per-token compute tracks active parameters (~50B), so it decodes like a 50B model that happens to need 2.8T of storage',
          'They are right — total parameters set decoding speed',
          'MoE models do not have a meaningful speed comparison to dense models',
          'The 896 experts run in parallel, so it is actually faster than 50B dense',
        ],
        answer: 0,
        explain: 'The router picks a few experts per token; the other ~850 sit idle for that token. Compute per token tracks the ~50B active path, so decode speed resembles a 50B dense model. What total parameters cost you is memory: 2.8T of weights must be held somewhere, which is why these models live on big inference clusters, not laptops.',
        nudge: 'MoE lesson flashback: stored parameters vs the path one token actually takes.',
      },
      {
        kind: 'predict',
        prompt: 'Same quantization, one consumer GPU. Nemotron 3.5 Lightning: 30B-parameter MoE, ~3B active. Qwen3.8-27B: 27.8B dense. Predict both.',
        questions: [
          { label: 'Which needs more memory to load?', options: ['Lightning, slightly — 30B stored beats 27.8B stored', 'Qwen3.8-27B — dense models always need more memory', 'Identical: active parameters set memory'], answer: 0,
            reveal: 'Memory follows stored weights: 30B vs 27.8B, so Lightning is marginally bigger on disk and in VRAM. Active parameters are irrelevant to the loading bill.' },
          { label: 'Which decodes faster per token?', options: ['Lightning, by a lot — ~3B active vs 27.8B active', 'Qwen3.8-27B — dense layers are better optimized', 'Same, since total sizes are close'], answer: 0,
            reveal: 'Per-token compute follows active parameters: ~3B vs 27.8B is roughly a 9x gap in work per token. That is why NVIDIA pitches Lightning for always-on agents: near-30B storage, small-model latency. The 27B dense buys you something different — stronger quality per stored byte and no routing complexity.' },
        ],
      },
      {
        kind: 'concept',
        title: 'The license line nobody reads',
        lines: [
          '"Open" is doing a lot of work in 2026 announcements. Qwen3.8-27B and Meta\u2019s Muse Glimmer ship under Apache 2.0: use them, modify them, ship products on them. MiniMax H3 published its weights too — but the license excludes US and EU commercial use entirely.',
          'Open weights means you can download the numbers. Open source, in the traditional sense, would also mean training data, code, and a license that lets you build. Almost no frontier model clears that bar. Before a model goes anywhere near production, the license line is the first thing to read, not the last.',
        ],
      },
      {
        kind: 'mcq',
        prompt: 'Your team wants to ship a paid product on a model whose announcement says "weights available on Hugging Face." What settles whether you can?',
        options: [
          'The license text — downloadable weights can still carry restrictions on commercial use, regions, or fields',
          'Whether the weights are quantized',
          'Whether it beats proprietary models on benchmarks',
          'Whether the model card lists training data',
        ],
        answer: 0,
        explain: 'Downloadable and usable are different claims. MiniMax H3 is on Hugging Face with US/EU commercial use excluded; other models restrict fields of use or require revenue-share above thresholds. The license text is the ground truth — benchmarks and quantization decide whether you want to, the license decides whether you may.',
        nudge: 'Being able to download a file and being allowed to sell with it are separate questions.',
      },
    ],
  },

  // ── L21: Attention Goes Hybrid ────────────────────────────────────────────
  {
    slug: 'hybrid',
    title: 'Attention Goes Hybrid',
    emoji: '🌀',
    blurb: 'Linear attention, fixed-size state, and why 2026 models mix 3:1.',
    minutes: 5,
    steps: [
      {
        kind: 'concept',
        title: 'The bill for exact recall',
        lines: [
          'Softmax attention has perfect memory with a growing invoice. Every new token compares against every stored key — so the KV-cache grows with context length, and per-token compute grows with it. At the 1M-token windows now standard on frontier models, the cache stops being a footnote and becomes the main memory cost.',
          'Linear attention flips the deal: fold the entire history into a fixed-size state, updated once per token. Per-token cost stays constant whether the context is 1K or 1M. The catch is that the state is a lossy summary — ask it to retrieve one exact sentence from 400 pages and it struggles where softmax attention would nail it.',
        ],
        cta: 'So why not go all-in?',
      },
      {
        kind: 'mcq',
        prompt: 'Pure linear-attention models exist and are fast. Why has no frontier lab shipped one as its flagship?',
        options: [
          'Exact recall degrades — needle-in-a-haystack retrieval over long contexts is where fixed-size state loses to a real KV lookup',
          'Linear attention cannot be trained with backpropagation',
          'They are incompatible with MoE layers',
          'The fixed state makes them slower at short contexts',
        ],
        answer: 0,
        explain: 'A fixed-size state must compress everything, so rarely-referenced details fade. Softmax attention keeps every key and can look any of them up exactly. Long-context users notice precisely this failure — quote this clause, find that variable — which is why the answer in 2026 is a mix, not a replacement.',
        nudge: 'What does a lossy summary lose first?',
      },
      {
        kind: 'concept',
        title: 'The 2026 recipe: 3 to 1',
        lines: [
          'Qwen3.8-27B, the model every local-agent setup adopted this month, interleaves Gated DeltaNet linear-attention layers with full softmax layers at a 3:1 ratio. Three cheap layers carry the bulk of the modeling; every fourth layer is real attention holding exact-recall ability for the whole stack.',
          'The same shape shows up across the frontier: DeepSeek V4 and MiniMax M3 reach their 1M-token windows with sparse attention — full attention that only looks at a selected subset of positions. Different mechanism, same bet: pay the softmax bill on a fraction of the work, keep the recall.',
        ],
      },
      {
        kind: 'predict',
        prompt: 'A 48-layer hybrid uses 3 linear : 1 full attention. Context is at 1M tokens and still growing. Predict both.',
        questions: [
          { label: 'KV-cache size vs an all-softmax 48-layer model', options: ['~1/4 — only the 12 full layers store a growing cache', 'Identical — every layer caches something', '~3/4 — the linear layers still cache keys'], answer: 0,
            reveal: 'Only the 12 softmax layers keep per-token K and V. The 36 linear layers hold a fixed-size state each, which does not grow with context. At 1M tokens that is roughly a 4x cut in the dominant memory cost.' },
          { label: 'When context doubles from 1M to 2M, per-token cost of the linear layers', options: ['Unchanged — fixed state means constant work per token', 'Doubles, like softmax attention', 'Quadruples'], answer: 0,
            reveal: 'That is the whole point of the linear side: one state update per token regardless of history length. The softmax layers\u2019 cost still grows — but there are only 12 of them, and with sparse patterns even that gets trimmed. Long context stopped being priced by the token partly because of this trade.' },
        ],
      },
    ],
  },

  // ── L22: Diffusion LLMs ───────────────────────────────────────────────────
  {
    slug: 'diffusion',
    title: 'Diffusion LLMs',
    emoji: '🌫️',
    blurb: 'Generating text in parallel instead of left-to-right — and what it costs.',
    minutes: 4,
    steps: [
      {
        kind: 'concept',
        title: 'Left-to-right is a latency floor',
        lines: [
          'Everything in this track so far generates autoregressively: one forward pass, one token, repeat. 256 tokens means 256 sequential passes, and no amount of hardware removes the "sequential" — each token needs the one before it. That is the latency floor speculative decoding chips away at.',
          'Diffusion language models remove the floor a different way. Start a block of positions fully masked, then denoise all of them in parallel over a handful of steps — each step firms up the tokens the model is confident about. In practice they run blockwise semi-autoregressive: blocks are generated in order, but inside each active block, every position updates at once.',
        ],
        cta: 'Count the passes',
      },
      {
        kind: 'mcq',
        prompt: 'What do diffusion LLMs primarily buy over autoregressive models?',
        options: [
          'Latency — parallel decoding inside each block means far fewer sequential passes for the same output length',
          'Quality — denoising finds better tokens than sampling',
          'Memory — no KV-cache is needed',
          'Training cost — diffusion objectives converge faster',
        ],
        answer: 0,
        explain: 'The trade is sequential passes for parallel ones. Quality at matched size still favors autoregressive models, and dLLMs keep caches for committed blocks. Latency is the pitch — which is exactly why the frontier entries (NVIDIA\u2019s Nemotron diffusion line, DeepMind\u2019s DiffusionGemma) target interactive and edge use.',
        nudge: 'Parallel decoding changes how many passes you wait for, not how good each token is.',
      },
      {
        kind: 'predict',
        prompt: 'Generate 256 tokens. Autoregressive: one pass per token. Diffusion: 64-token blocks, 8 denoising steps per block. Predict both.',
        questions: [
          { label: 'Sequential passes for the diffusion model', options: ['32 — four blocks times eight steps', '256 — same as autoregressive', '8 — one round of steps covers everything'], answer: 0,
            reveal: '256/64 = 4 blocks, each denoised in 8 parallel steps: 32 sequential passes vs 256. An 8x cut in the count — though each denoising pass processes a whole block, so per-pass cost is higher and the wall-clock win is smaller than 8x.' },
          { label: 'The catch that keeps dLLMs from taking over', options: ['Quality at matched size still trails autoregressive, and each denoise step re-attends to all previous blocks', 'They cannot generate code', 'Block size is capped at 64 by the math', 'They only work below 1B parameters'], answer: 0,
            reveal: 'Two open problems: matched-size quality still favors left-to-right, and every denoising step attends over all committed blocks — an attention bill that current research (including retrofitting linear attention into dLLMs, August 2026) is actively trying to cut. Familiar fix, new architecture.' },
        ],
      },
      {
        kind: 'concept',
        title: 'Where this sits, August 2026',
        lines: [
          'Diffusion LLMs graduated from papers to shipped weights this year: NVIDIA released a Nemotron diffusion line at 3B/8B/14B, and DeepMind published DiffusionGemma. Nobody\u2019s flagship is a dLLM — but nobody\u2019s flagship used MoE once, either.',
          'The deeper lesson is the pattern, not the architecture: autoregression, like softmax attention, is a design choice with a price tag, and the field keeps finding places where a different trade wins. When the next announcement drops, you now read it the same way — what does it buy, what does it cost, and which number is doing the marketing.',
        ],
      },
    ],
  },
]

// ── warm-up map: main-track level id → interactive lesson slug ────────────────
// LevelPage shows a "⚡ Warm-up" chip when an entry exists here.
export const WARMUPS: Record<string, string> = {
  'c0-l4': 'shapes',
  'c1-l1': 'shapes',
  'c1-l2': 'tokenization',
  'c1-l3': 'training',
  'c1-l4': 'sampling',
  'c1-l5': 'internals',
  'c1-l6': 'multihead',
  'c1-d1': 'internals',
  'c1-l7': 'internals',
  'c2-l1': 'internals',
  'c2-l2': 'multihead',
  'c2-l3': 'moe',
  'c2-l6': 'efficiency',
  'c2-l7': 'multihead',
  'c3-l3': 'moe',
  'c5-l1': 'rag',
  'c5-l2': 'embeddings',
  'c5-l3': 'rag',
  'c5-l5': 'rag',
  'c5-l6': 'rag',
  'c6-l2': 'finetuning',
  'c7-l3': 'decoding',
  'c7-l4': 'agents',
  'c7-l7': 'efficiency',
  'c7-l8': 'frontier',
  'c9-l1': 'scaling',
  'c9-d1': 'scaling',
  'c9-l3': 'alignment',
  'c9-l4': 'alignment',
  'c9-l7': 'frontier',
}
