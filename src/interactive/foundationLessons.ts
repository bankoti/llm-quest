import type { InteractiveLesson } from './types'
import { dailyPick } from './types'
import {
  AxisPlay, SlicePlay, BpePlay, TokenFailPlay, PositionPlay,
  MatmulPlay, DotProductPlay, LinearScorePlay, SoftmaxPlay, QkvPlay,
} from './widgets'

const MODULE = 'foundations'
const MODULE_TITLE = 'Foundations: numbers, text, and prediction'

export const FOUNDATION_LESSONS: InteractiveLesson[] = [
  {
    slug: 'numbers-to-tensors',
    title: 'From Numbers to Tensors',
    emoji: '🧱',
    blurb: 'Build scalar, vector, matrix, and tensor intuition from ordinary tables.',
    minutes: 6,
    moduleId: MODULE,
    moduleTitle: MODULE_TITLE,
    prerequisites: [],
    outcomes: ['Distinguish scalars, vectors, matrices, and higher-rank tensors', 'Read a tensor shape from the outside in'],
    concepts: ['scalar', 'vector', 'matrix', 'tensor', 'rank', 'shape'],
    steps: [
      {
        kind: 'concept', title: 'One idea, more axes',
        lines: [
          'A model stores numbers in rectangular containers. One number is a scalar. A row of numbers is a vector. A table of rows and columns is a matrix. Add more directions and the general name is tensor.',
          'A shape records the length of each axis, from the outside inward. [[1, 2], [3, 4], [5, 6]] has 3 rows and 2 values per row, so its shape is (3, 2). Rank means how many axes there are: a matrix has rank 2.',
          'The word tensor sounds advanced, but it is only the general container. Values carry information; shape tells operations how those values are organized.',
        ], cta: 'Read a shape',
      },
      {
        kind: 'worked', title: 'Read outside, then inside',
        prompt: 'Find the shape of a batch containing 2 sequences. Each sequence has 3 token positions. Each position is described by 4 numbers.',
        stages: [
          { label: 'Count the batches', body: 'There are 2 outer groups, so the first axis is 2.' },
          { label: 'Count positions', body: 'Each group contains 3 positions, so the second axis is 3.' },
          { label: 'Count features', body: 'Each position has 4 numbers, so the final axis is 4.' },
        ],
        takeaway: 'Shape (2, 3, 4) means 2 sequences × 3 positions × 4 features. It contains 24 values in total.',
      },
      {
        kind: 'mcq', prompt: 'What is the shape of this matrix?', code: 'x = [[1, 2],\n     [3, 4],\n     [5, 6]]',
        options: ['(3, 2)', '(2, 3)', '(6,)', '(3, 3)'], answer: 0,
        explain: 'There are 3 outer rows, each with 2 values. Shape is read outside-in: (3, 2).',
        nudge: 'Count outer lists first, then values inside each list.',
        whys: [undefined, 'That reverses rows and columns. The outer list has 3 entries.', 'Six is the total number of values, not the organization.', 'The second axis has length 2, not 3.'],
      },
      {
        kind: 'predict', prompt: 'Use B for batch, T for token positions, and C for features. Predict the shape.',
        questions: [
          { label: '8 sequences × 16 positions × 64 features', options: ['(16, 8, 64)', '(8, 16, 64)', '(8, 64, 16)'], answer: 1, reveal: 'Batch first, positions second, features last: (B, T, C) = (8, 16, 64).' },
          { label: 'one sequence × 12 positions × 32 features', options: ['(12, 32)', '(1, 32, 12)', '(1, 12, 32)'], answer: 2, reveal: 'A batch of one still keeps its batch axis: (1, 12, 32).' },
        ],
      },
    ],
  },
  {
    slug: 'axes-and-slices',
    title: 'Axes, Slices, and Reshaping',
    emoji: '📐',
    blurb: 'Learn what an axis means before model code starts naming B, T, and C.',
    minutes: 7,
    moduleId: MODULE,
    moduleTitle: MODULE_TITLE,
    prerequisites: ['numbers-to-tensors'],
    outcomes: ['Explain what axis 0 and axis 1 select', 'Predict reduction and slice shapes', 'Check whether a reshape preserves value count'],
    concepts: ['axis', 'index', 'slice', 'reduction', 'reshape', 'B T C convention'],
    steps: [
      {
        kind: 'concept', title: 'An axis is a direction you can move',
        lines: [
          'In a matrix, axis 0 moves between rows and axis 1 moves within each row across columns. In a (B, T, C) tensor, axis 0 selects sequences, axis 1 selects positions, and axis 2 selects features.',
          'A reduction such as sum(axis=1) combines everything along the named axis, so that axis disappears. A slice keeps selected values. A colon means “keep all of this axis.”',
          'Reshape changes organization, never value count. A tensor with 24 values may become (6, 4) or (2, 12), but not (4, 7), which needs 28 values.',
        ], cta: 'Collapse an axis',
      },
      { kind: 'widget', widget: AxisPlay },
      {
        kind: 'worked', title: 'Follow the disappearing axis',
        prompt: 'M has shape (5, 7). What happens under M.sum(axis=1)?',
        stages: [
          { label: 'Name axis 1', body: 'Axis 1 is the 7 columns inside each row.' },
          { label: 'Combine along it', body: 'Each row of 7 numbers becomes one row-sum.' },
          { label: 'Keep what remains', body: 'There are still 5 rows, so 5 results remain.' },
        ], takeaway: 'M.sum(axis=1) has shape (5,). The axis you reduce is the one that disappears.',
      },
      {
        kind: 'mcq', prompt: 'M has shape (5, 7). What is the shape of M.sum(axis=0)?',
        options: ['(7,)', '(5,)', '(5, 7)', '(1, 5)'], answer: 0,
        explain: 'Axis 0 is the 5-row direction. Combining those rows leaves one sum per column: 7 values.',
        nudge: 'Remove the named axis and keep the other axis length.',
      },
      { kind: 'widget', widget: SlicePlay },
      {
        kind: 'mcq', prompt: 'x has shape (2, 3, 4), so it contains 24 values. Which reshape is impossible?',
        options: ['(4, 7)', '(6, 4)', '(24,)', '(2, 12)'], answer: 0,
        explain: '4×7 = 28, so that shape needs four values that do not exist. Every legal reshape multiplies to 24.',
        nudge: 'Multiply the dimensions of each candidate.',
      },
    ],
  },
  {
    slug: 'matmul',
    title: 'Matrix Multiplication',
    emoji: '✖️',
    blurb: 'See why inner dimensions meet and how every output cell is computed.',
    minutes: 7,
    moduleId: MODULE,
    moduleTitle: MODULE_TITLE,
    prerequisites: ['axes-and-slices'],
    outcomes: ['Compute a dot product', 'Predict a matrix multiplication shape', 'Explain why inner dimensions must match'],
    concepts: ['dot product', 'matrix multiplication', 'inner dimension', 'row-column rule'],
    steps: [
      {
        kind: 'concept', title: 'Match a row with a column',
        lines: [
          'The dot product takes two equal-length vectors, multiplies matching positions, and adds the results. [1, 2, 3] · [4, 5, 6] = 1×4 + 2×5 + 3×6 = 32.',
          'Matrix multiplication repeats that operation. Every row of the left matrix meets every column of the right matrix. Therefore (m, n) @ (n, p) produces (m, p). The shared n is consumed inside each dot product.',
          'If the inner dimensions do not match, the vectors being dotted have different lengths, so the operation is undefined.',
        ], cta: 'Build the output',
      },
      { kind: 'widget', widget: MatmulPlay },
      {
        kind: 'worked', title: 'Predict shape before arithmetic',
        prompt: 'A has shape (4, 3). B has shape (3, 2). Find the result shape.',
        stages: [
          { label: 'Check the meeting dimensions', body: 'A ends in 3 and B begins with 3. They match, so multiplication is legal.' },
          { label: 'Consume the shared 3', body: 'The 3 tells us each output cell uses a dot product of length 3.' },
          { label: 'Keep the outside dimensions', body: 'Keep A’s 4 rows and B’s 2 columns.', code: 'A @ B    # (4, 3) @ (3, 2) -> (4, 2)' },
        ], takeaway: '(4, 3) @ (3, 2) → (4, 2). Inner dimensions meet; outer dimensions survive.',
      },
      {
        kind: 'mcq', prompt: 'Which multiplication is legal?',
        options: ['(5, 3) @ (3, 7)', '(5, 3) @ (5, 7)', '(3, 5) @ (7, 3)', '(5, 3) @ (7,)'], answer: 0,
        explain: 'Only 3 meets 3. The result shape is (5, 7).',
        nudge: 'Compare the left matrix’s final dimension with the right matrix’s first dimension.',
      },
      {
        kind: 'numeric', prompt: 'Compute one output cell by hand: row [2, 0, 1] of A meets column [3, 4, 5] of B.',
        code: 'cell = 2*3 + 0*4 + 1*5',
        questions: [
          { label: 'the value of that cell', answer: 11, tolerance: 0, reveal: '6 + 0 + 5 = 11. Every cell of every matmul in a transformer is exactly this: one dot product.' },
        ],
      },
      {
        kind: 'predict', prompt: 'Apply the inner-meets, outer-survives rule.', questions: [
          { label: '(2, 4) @ (4, 6)', options: ['(2, 6)', '(4, 4)', '(2, 4)', 'error'], answer: 0, reveal: 'The 4s meet and disappear; 2 and 6 survive.' },
          { label: '(2, 4) @ (3, 6)', options: ['error', '(2, 6)', '(4, 3)'], answer: 0, reveal: '4 does not match 3, so the row and column lengths differ.' },
        ],
      },
    ],
  },
  {
    slug: 'dot-product-similarity',
    title: 'Dot Products as Similarity',
    emoji: '🧭',
    blurb: 'Turn multiplication into an intuition for matching directions and meaning.',
    minutes: 6,
    moduleId: MODULE,
    moduleTitle: MODULE_TITLE,
    prerequisites: ['matmul'],
    outcomes: ['Interpret positive, zero, and negative dot products', 'Explain why normalized dot products measure directional similarity'],
    concepts: ['direction', 'magnitude', 'similarity', 'normalization', 'cosine similarity'],
    steps: [
      {
        kind: 'concept', title: 'Agreement has a score',
        lines: [
          'A vector can be treated as a direction. The dot product is large and positive when two vectors point together, near zero when they are sideways to each other, and negative when they point in opposite directions.',
          'Vector length also affects the raw dot product. To compare direction alone, normalize both vectors to length 1. Their dot product then equals cosine similarity: 1 is the same direction, 0 is unrelated direction, and -1 is opposite.',
          'This single idea appears twice later: attention uses a query-key dot product to score relevance, and retrieval uses an embedding dot product to score semantic similarity.',
        ], cta: 'Compare directions',
      },
      { kind: 'widget', widget: DotProductPlay },
      {
        kind: 'worked', title: 'Similarity without a diagram',
        prompt: 'q = [1, 0]. Compare candidate a = [0.8, 0.2] with candidate b = [0, 1].',
        stages: [
          { label: 'Score a', body: 'q · a = 1×0.8 + 0×0.2 = 0.8.' },
          { label: 'Score b', body: 'q · b = 1×0 + 0×1 = 0.' },
          { label: 'Rank the candidates', body: 'a points mostly with q, while b is perpendicular. a is the stronger match.' },
        ], takeaway: 'Dot products turn “which direction matches?” into a number that can be ranked.',
      },
      {
        kind: 'mcq', prompt: 'Two unit-length vectors have dot product 0.02. What is the safest interpretation?',
        options: ['Their directions are almost unrelated', 'They are near-identical', 'They are exact opposites', 'One vector must contain a zero'], answer: 0,
        explain: 'For unit vectors, dot product equals cosine similarity. A value near zero means nearly perpendicular directions.',
        nudge: 'For normalized vectors: 1 means same direction, 0 means sideways, -1 means opposite.',
      },
      {
        kind: 'predict', prompt: 'Predict the stronger match to q = [1, 1].', questions: [
          { label: 'candidate with larger dot product', options: ['b = [1, -1]', 'they tie', 'a = [0.8, 0.8]'], answer: 2, reveal: 'q·a = 1.6; q·b = 0. The matching signs in a reinforce each other.' },
          { label: 'q = [1, -1]; stronger match', options: ['they tie', 'a = [0.5, 0.5]', 'b = [1, -1]'], answer: 2, reveal: 'q·a = 0 while q·b = 2. Alignment, not vector length alone, drives the match.' },
        ],
      },
    ],
  },
  {
    slug: 'tokens-and-ids',
    title: 'Text Becomes Token IDs',
    emoji: '🔡',
    blurb: 'Separate text, tokens, and integer IDs before the model ever sees them.',
    minutes: 6,
    moduleId: MODULE,
    moduleTitle: MODULE_TITLE,
    prerequisites: ['numbers-to-tensors'],
    outcomes: ['Distinguish text, token pieces, and token IDs', 'Explain why token IDs carry no numerical meaning'],
    concepts: ['token', 'tokenizer', 'vocabulary', 'token ID', 'encoding', 'decoding'],
    steps: [
      {
        kind: 'concept', title: 'The string stops at the tokenizer',
        lines: [
          'A language model does not receive characters or words. A tokenizer first divides text into pieces called tokens. Each possible token appears in a vocabulary, which assigns it an integer ID.',
          'The ID is only an address. If “cat” has ID 9246, the number 9246 does not mean “catness,” and a larger ID is not a larger meaning. It simply selects one vocabulary entry.',
          'Tokenizers also reserve a few vocabulary entries for control signals called special tokens. BOS (beginning-of-sequence) marks the start of a sequence; EOS (end-of-sequence) marks the end; PAD fills shorter sequences in a batch to match the longest one.',
          'Encoding converts text to token IDs. Decoding reverses IDs back to text pieces. The neural model begins after encoding and ends before decoding.',
        ], cta: 'Trace the boundary',
      },
      {
        kind: 'worked', title: 'Three representations of one prompt',
        prompt: 'Trace “a blue cat” toward the model.',
        stages: [
          { label: 'Text', body: 'The user supplies a string: “a blue cat”.' },
          { label: 'Token pieces', body: 'A tokenizer might split it as [“a”, “ blue”, “ cat”]. Spaces are often part of tokens.' },
          { label: 'Token IDs', body: 'The vocabulary maps those pieces to arbitrary integers such as [64, 6437, 9246]. These integers enter the embedding lookup.' },
        ], takeaway: 'Text, token pieces, and token IDs are three different representations. The model itself starts with IDs.',
      },
      {
        kind: 'mcq', prompt: 'What does an LLM receive directly from its tokenizer?',
        options: ['A sequence of integer token IDs', 'Raw Unicode characters', 'A list of English words', 'A probability distribution'], answer: 0,
        explain: 'The tokenizer encodes text into integer IDs. The embedding layer is the first neural operation after that.',
        nudge: 'Encoding is the tokenizer’s output step.',
      },
      {
        kind: 'mcq', prompt: 'Token A has ID 8000 and token B has ID 20. What can you conclude from the numbers alone?',
        options: ['Nothing about their meaning or similarity', 'A has more meaning than B', 'A is more common than B', 'A contains more characters'], answer: 0,
        explain: 'IDs are arbitrary vocabulary addresses. Frequency, length, and meaning are not encoded in their numeric order.',
        nudge: 'Think of IDs like row numbers in a lookup table.',
      },
    ],
  },
  {
    slug: 'subword-tokenization',
    title: 'Why Words Split into Pieces',
    emoji: '✂️',
    blurb: 'Build subword vocabulary intuition and understand token-count trade-offs.',
    minutes: 7,
    moduleId: MODULE,
    moduleTitle: MODULE_TITLE,
    prerequisites: ['tokens-and-ids'],
    outcomes: ['Explain BPE merging', 'Predict how vocabulary size changes sequence length', 'Explain character-level blind spots'],
    concepts: ['subword', 'byte-pair encoding', 'merge', 'vocabulary size', 'sequence length', 'tokenization blind spot'],
    steps: [
      {
        kind: 'concept', title: 'Whole words are too many; characters are too long',
        lines: [
          'A word-only vocabulary cannot cover every name, typo, code fragment, or language. A character-only vocabulary can represent anything, but common text becomes long sequences. Subword tokenization chooses a middle ground.',
          'Byte-pair encoding (BPE) starts with small pieces and repeatedly merges the most frequent adjacent pair. Common patterns become one token; rare strings remain several pieces.',
          'More merges create a larger vocabulary and usually shorter sequences. That saves context and inference work, but a larger embedding table uses more parameters.',
        ], cta: 'Predict the trade-off',
      },
      {
        kind: 'mcq', prompt: 'Before the demo: what does a larger BPE vocabulary usually do?',
        options: ['Creates richer pieces and shorter sequences', 'Creates simpler pieces and longer sequences', 'Changes IDs but not sequence length', 'Forces every word to become one token'], answer: 0,
        explain: 'More frequent patterns have been merged into larger pieces, so common text needs fewer tokens. Rare strings may still split.',
        nudge: 'Each merged token covers more characters.',
      },
      { kind: 'widget', widget: BpePlay },
      {
        kind: 'worked', title: 'Common stem, common suffix',
        prompt: 'How might “tokenize” split if “token” and “ize” are frequent but the complete word is not?',
        stages: [
          { label: 'Keep frequent pieces', body: '“token” already appears often enough to have its own vocabulary entry.' },
          { label: 'Keep a reusable suffix', body: '“ize” appears in many words and may also have its own entry.' },
          { label: 'Compose the rare word', body: 'The tokenizer can encode the unseen whole as [“token”, “ize”] without adding a new word entry.' },
        ], takeaway: 'Subwords let a finite vocabulary compose rare words from reusable pieces.',
      },
      { kind: 'widget', widget: TokenFailPlay },
      {
        kind: 'mcq', prompt: 'Why can an LLM struggle to count the letters in “strawberry”?',
        options: ['Several letters may be hidden inside opaque token pieces', 'Attention cannot count anything', 'The vocabulary is too small to represent the word', 'Token IDs are floating-point numbers'], answer: 0,
        explain: 'The model sees token vectors, not a guaranteed one-token-per-letter representation. Spelling the word with separators exposes the characters as separate pieces.',
        nudge: 'Ask what information survived tokenization.',
      },
    ],
  },
  {
    slug: 'embedding-lookup',
    title: 'Token IDs Become Vectors',
    emoji: '📚',
    blurb: 'See an embedding table as a learned lookup, not mysterious “meaning math.”',
    minutes: 7,
    moduleId: MODULE,
    moduleTitle: MODULE_TITLE,
    prerequisites: ['axes-and-slices', 'tokens-and-ids'],
    outcomes: ['Explain an embedding lookup', 'Predict embedding table and output shapes', 'Separate ID identity from learned representation'],
    concepts: ['embedding table', 'lookup', 'vocabulary axis', 'embedding dimension', 'learned representation'],
    steps: [
      {
        kind: 'concept', title: 'An ID selects one learned row',
        lines: [
          'Token IDs are arbitrary addresses, so the model replaces each ID with a learned vector. The embedding table has one row per vocabulary item and one column per embedding feature.',
          'If vocabulary size is V and embedding dimension is C, the table shape is (V, C). Looking up one ID returns shape (C,). Looking up T token IDs returns (T, C). A batch of B sequences returns (B, T, C).',
          'The rows start nearly random. Training changes them so tokens useful in similar contexts develop useful geometric relationships.',
        ], cta: 'Walk through a lookup',
      },
      {
        kind: 'worked', title: 'From three IDs to three vectors',
        prompt: 'IDs [4, 1, 9] enter an embedding table of shape (10, 6).',
        stages: [
          { label: 'Select rows', body: 'Take row 4, row 1, and row 9. The ID values are indexes, not quantities.' },
          { label: 'Preserve sequence length', body: 'Three IDs produce three selected rows.' },
          { label: 'Read row width', body: 'Every row has 6 learned numbers, so the output shape is (3, 6).' },
        ], takeaway: 'Embedding lookup replaces each ID with one fixed-width vector. It preserves token positions and adds a feature axis.',
      },
      {
        kind: 'predict', prompt: 'Vocab size = 50,000; embedding dimension = 768.', questions: [
          { label: 'embedding.weight shape', options: ['(50000, 768)', '(768, 50000)', '(50000,)'], answer: 0, reveal: 'One row per vocabulary item, 768 learned features per row.' },
          { label: 'output for a batch of 8 sequences × 32 tokens', options: ['(8, 32, 768)', '(50000, 768)', '(8, 768)'], answer: 0, reveal: 'Every one of the 8×32 IDs becomes a 768-number vector.' },
        ],
      },
      {
        kind: 'mcq', prompt: 'During training, what changes in an embedding lookup?',
        options: ['The selected rows’ learned numbers', 'The token IDs themselves', 'The vocabulary order after every batch', 'The number of rows for each prompt'], answer: 0,
        explain: 'Gradient updates change embedding row values. IDs remain stable addresses into the table.',
        nudge: 'Which part contains learnable weights?',
      },
    ],
  },
  {
    slug: 'linear-layers',
    title: 'Linear Layers Produce Scores',
    emoji: '📏',
    blurb: 'Connect matrix multiplication to learned projections and vocabulary logits.',
    minutes: 7,
    moduleId: MODULE,
    moduleTitle: MODULE_TITLE,
    prerequisites: ['matmul', 'embedding-lookup'],
    outcomes: ['Explain a weight matrix as learned rows', 'Predict linear-layer weight and output shapes', 'Define a logit as a raw score'],
    concepts: ['weight', 'bias', 'linear layer', 'projection', 'hidden state', 'logit'],
    steps: [
      {
        kind: 'concept', title: 'Learned rows ask learned questions',
        lines: [
          'A linear layer multiplies an input vector by learned weights and optionally adds a learned bias. Each output has its own weight row. The dot product between the input and that row becomes one output number.',
          'The vector representation of a token inside the model after the embedding lookup and after each transformer block is called a hidden state. Its width is the hidden size C. Linear layers produce and consume hidden states.',
          'A layer with in_features=C and out_features=V stores weight shape (V, C). One C-number input becomes V output scores. In a language model’s final layer, those V scores correspond to vocabulary items.',
          'A raw output score is called a logit. Logits may be any real number and do not yet sum to one. They express relative preference before conversion to probabilities.',
        ], cta: 'Compute vocabulary scores',
      },
      { kind: 'widget', widget: LinearScorePlay },
      {
        kind: 'worked', title: 'Read the shape of an output head',
        prompt: 'A hidden state has 4 features. We want one logit for each of 10 vocabulary items.',
        stages: [
          { label: 'Set the input width', body: 'Each weight row must meet the 4-number hidden state, so every row has width 4.' },
          { label: 'Set the number of outputs', body: 'We need 10 logits, so we need 10 rows.' },
          { label: 'Write the weight shape', body: 'PyTorch stores Linear weight as (out_features, in_features): (10, 4).' },
        ], takeaway: 'One vocabulary row dotted with the hidden state yields one vocabulary logit.',
      },
      {
        kind: 'predict', prompt: 'Hidden size = 1024; vocabulary size = 50,000.', questions: [
          { label: 'lm_head.weight shape', options: ['(50000, 1024)', '(1024, 50000)', '(50000,)'], answer: 0, reveal: 'There are 50,000 output rows, each meeting a 1024-number hidden state.' },
          { label: 'logit vector shape for one position', options: ['(50000,)', '(1024,)', '(1,)'], answer: 0, reveal: 'The layer produces one raw score per vocabulary item.' },
        ],
      },
      {
        kind: 'mcq', prompt: 'Which statement about logits is correct?',
        options: ['They are raw relative scores and need not sum to 1', 'They are already probabilities', 'They must all be positive', 'They are token IDs sorted by likelihood'], answer: 0,
        explain: 'A logit is an unconstrained score. Softmax turns the complete logit vector into a probability distribution.',
        nudge: 'The word “raw” matters: conversion has not happened yet.',
      },
    ],
  },
  {
    slug: 'softmax-probabilities',
    title: 'From Logits to Probabilities',
    emoji: '📊',
    blurb: 'Build softmax from positive shares, then see what temperature really changes.',
    minutes: 7,
    moduleId: MODULE,
    moduleTitle: MODULE_TITLE,
    prerequisites: ['linear-layers'],
    outcomes: ['Explain what softmax guarantees', 'Distinguish logits from probabilities', 'Predict how temperature changes concentration'],
    concepts: ['exponentiation', 'softmax', 'probability distribution', 'temperature', 'argmax'],
    steps: [
      {
        kind: 'concept', title: 'Convert scores into shares',
        lines: [
          'To choose a next token, we need non-negative probabilities that sum to 1. Softmax exponentiates every logit, then divides each result by the total. Exponentiation preserves order and makes every value positive.',
          'The largest logit gets the largest probability, but other tokens can keep some mass. Greedy decoding chooses the argmax. Sampling uses the full distribution.',
          'Temperature rescales logits before softmax. T below 1 spreads scores farther apart and sharpens the distribution. T above 1 pulls scores together and flattens it. Temperature changes uncertainty, not learned weights.',
        ], cta: 'Move the temperature',
      },
      { kind: 'widget', widget: SoftmaxPlay },
      {
        kind: 'worked', title: 'The guarantees matter more than arithmetic',
        prompt: 'Logits [2, 1, -1] enter softmax.',
        stages: [
          { label: 'Exponentiate', body: 'Every transformed value is positive. The original order 2 > 1 > -1 is preserved.', code: 'exp([2, 1, -1]) = [7.39, 2.72, 0.37]' },
          { label: 'Normalize', body: 'Divide each transformed value by their sum.', code: 'total = 10.48\np = [0.705, 0.260, 0.035]' },
          { label: 'Read the distribution', body: 'The results are between 0 and 1 and sum to exactly 1. The first token remains most likely.', code: 'sum(p) = 1.0' },
        ], takeaway: 'Softmax changes the scale and constraints, not the ranking of logits.',
      },
      {
        kind: 'mcq', prompt: 'What must be true after softmax?',
        options: ['Every output is positive and all outputs sum to 1', 'The highest output equals 1', 'All outputs are equally likely', 'Negative logits are removed'], answer: 0,
        explain: 'Softmax creates a probability distribution. The maximum need not be 1 and negative logits still contribute positive probability after exponentiation.',
        nudge: 'Two requirements of a valid probability distribution: every value must be non-negative, and all values must sum to exactly 1.',
      },
      {
        kind: 'predict', prompt: 'The logits stay fixed. Increase temperature from 1 to 2.', questions: [
          { label: 'distribution shape', options: ['Sharper: the top token dominates more', 'Flatter: probability spreads across more tokens', 'Unchanged'], answer: 1, reveal: 'Dividing by a larger T pulls logits closer before softmax, so probabilities become more similar.' },
          { label: 'argmax token after increasing temperature', options: ['Usually unchanged because logit order is preserved', 'Always becomes the second token', 'Becomes random before sampling'], answer: 0, reveal: 'Temperature changes concentration but preserves logit ordering for positive T.' },
        ],
      },
    ],
  },
  {
    slug: 'next-token-prediction',
    title: 'The Next-Token Task',
    emoji: '🔮',
    blurb: 'Assemble tokenizer, embeddings, scores, and softmax into one prediction.',
    minutes: 7,
    moduleId: MODULE,
    moduleTitle: MODULE_TITLE,
    prerequisites: ['softmax-probabilities', 'subword-tokenization'],
    outcomes: ['Trace a prompt to a next-token distribution', 'Explain autoregressive generation', 'Distinguish model prediction from decoding choice'],
    concepts: ['next-token prediction', 'forward pass', 'autoregressive generation', 'decoding', 'context'],
    steps: [
      {
        kind: 'concept', title: 'One distribution at a time',
        lines: [
          'A language model receives token IDs for the context and produces logits for what token should come next. Softmax turns those logits into a distribution. A decoding rule chooses one token from that distribution.',
          'The chosen token is appended to the context, and the model runs again to predict the following token. Repeating this loop is autoregressive generation: every new token depends on the tokens already present.',
          'The model computes a distribution; the decoder makes a choice. Greedy decoding, sampling, top-k, and top-p can produce different text from the same model weights.',
        ], cta: 'Trace one cycle',
      },
      {
        kind: 'worked', title: 'Prompt to one generated token',
        prompt: 'Generate one token after “The sky is”.',
        stages: [
          { label: 'Encode context', body: 'The tokenizer turns the string into token IDs.' },
          { label: 'Represent and transform', body: 'Embeddings and model layers turn the IDs into a final hidden state for the last position.' },
          { label: 'Score vocabulary', body: 'The output linear layer produces one logit per token; softmax makes probabilities.' },
          { label: 'Choose and append', body: 'The decoder might choose “ blue”. That token is appended before the next cycle.' },
        ], takeaway: 'Generation is a repeated prediction-and-append loop, not a whole paragraph appearing in one pass.',
      },
      {
        kind: 'mcq', prompt: 'Which component chooses a token after the model produces probabilities?',
        options: ['The decoding strategy', 'The tokenizer', 'The embedding table', 'The loss function'], answer: 0,
        explain: 'The model supplies a distribution. Greedy or sampling-based decoding selects the actual next token.',
        nudge: 'Separate “produce probabilities” from “choose from probabilities.”',
      },
      {
        kind: 'predict', prompt: 'A generated token has just been selected.', questions: [
          { label: 'what happens next?', options: ['Decode the entire answer immediately', 'Append it to context and run another forward pass', 'Retrain the model on the token', 'Reset the context'], answer: 1, reveal: 'Autoregressive generation extends the context one selected token at a time.' },
          { label: 'what changes between those forward passes?', options: ['The model weights', 'The vocabulary', 'The context grows by the chosen token'], answer: 2, reveal: 'Inference keeps weights fixed; only the token context grows.' },
        ],
      },
    ],
  },
]
