// Interactive-track lessons: one file, one exported array.
// Each lesson is a linear Step[] played by InteractiveLessonPage.
// No Pyodide, no progress writes; purely tap-and-reveal.
import type { InteractiveLesson } from './types'
import {
  AxisPlay, SlicePlay, BpePlay, AttentionPlay,
  LrPlay, TemperaturePlay, PrecisionPlay, RewardHackPlay,
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
    minutes: 4,
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
      {
        kind: 'predict',
        prompt: 'Vocab size = 50,257. An embedding matrix maps each token ID to a 768-dimensional vector. Predict the shape.',
        questions: [
          { label: 'embedding.weight', options: ['(50257, 768)', '(768, 50257)', '(50257,)'], answer: 0,
            reveal: 'Row i is the embedding for token ID i. You look up by indexing rows, so vocab is the first axis: (vocab_size, embedding_dim).' },
        ],
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
        prompt: 'B=2, H=4, T=8, D=16. Trace the shapes through one attention head.',
        code: 'Q: (B, H, T, D)\nK: (B, H, T, D)\nscores = Q @ K.transpose(-2, -1)   # ??\nweights = softmax(scores / sqrt(D)) # ??\nV: (B, H, T, D)\nout = weights @ V                   # ??',
        questions: [
          { label: 'scores shape', options: ['(2, 4, 8, 8)', '(2, 4, 8, 16)', '(2, 8, 8, 4)'], answer: 0,
            reveal: '(B, H, T, D) @ (B, H, D, T) → (B, H, T, T) = (2, 4, 8, 8). One score per query-key pair.' },
          { label: 'out shape', options: ['(2, 4, 8, 16)', '(2, 4, 8, 8)', '(2, 8, 4, 16)'], answer: 0,
            reveal: '(B, H, T, T) @ (B, H, T, D) → (B, H, T, D) = (2, 4, 8, 16). Each position gets a blend of value vectors.' },
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
        prompt: 'Sequence length T = 2048, 32 layers, 32 K/V heads, head dim D = 128, fp16 (2 bytes). KV-cache size in GB?',
        questions: [
          { label: '2 × layers × heads × T × D × bytes', options: ['0.5 GB', '2 GB', '8 GB'], answer: 0,
            reveal: '2 × 32 × 32 × 2048 × 128 × 2 = 536,870,912 bytes ≈ 0.5 GB. Short contexts are cheap; at T=32k this becomes 8 GB — the practical limit for consumer hardware.' },
        ],
      },
    ],
  },

  // ── L7: Alignment ─────────────────────────────────────────────────────────
  {
    slug: 'alignment',
    title: 'RLHF & Alignment',
    emoji: '🎯',
    blurb: 'Reward modeling, PPO, and why reward hacking makes alignment hard.',
    minutes: 4,
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
]
