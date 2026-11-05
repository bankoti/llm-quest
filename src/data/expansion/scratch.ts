import type { LearningTrack } from './types'

export const SCRATCH_TRACK: LearningTrack = {
  id: 10, slug: 'trained-llm', title: 'From Components to a Trained LLM', shortTitle: 'Train Your LLM',
  prerequisite: 1, color: 'emerald', accent: '#10b981',
  description: 'Connect the components to reproducible pretraining, task adaptation, and evaluation. CPU experiments use original tiny data, not pretrained answers.',
  outcomes: ['Train and resume a small decoder', 'Adapt it with classification, SFT, and LoRA', 'Defend held-out evaluation and tokenizer identity'],
  units: [
    {
      key: '01_tokenizer', title: 'A Tokenizer You Can Rebuild',
      summary: 'Train byte merges, encode with learned ranks, and decode without losing text.',
      prerequisites: ['subword-tokenization'], outcomes: ['Implement a byte-BPE lifecycle', 'Separate learned merges from special tokens', 'Detect a tokenizer/checkpoint mismatch'],
      concepts: ['UTF-8', 'byte BPE', 'merge rank', 'vocabulary', 'artifact identity'],
      sections: [
        { title: 'Bytes are the reversible starting point', lines: [
          'A Unicode character is not necessarily one byte. Encode each training document with UTF-8, producing integers from 0 to 255. The initial vocabulary maps each integer to its one-byte value. All text is representable before learning any merge; no unknown token is required. Decoding concatenates bytes, then decodes UTF-8. A generated incomplete byte sequence may not be valid text, so our decoder raises rather than silently replacing it.',
          'BPE compresses frequent adjacent pairs. Count pairs separately inside each document, select the highest count, and replace non-overlapping occurrences left to right. Our deterministic tie rule chooses the lexicographically smallest pair. The new ID is 256 plus the merge index. Stop when there are no pairs or the requested merge count is reached. Never invent adjacency between two different documents.',
        ] },
        { title: 'Training frequency is not the inference rule', lines: [
          'Encoding new text replays the learned pair merges in their learned order. It does not count new frequencies and retrain. A pair formed by an earlier merge can participate in a later merge. The vocabulary and ordered merges are part of the model contract: logits at index 257 mean whatever this exact tokenizer assigned to 257.',
          'This educational tokenizer has no regex pre-tokenization or special tokens. Production tokenizers often constrain merge boundaries and reserve control tokens. Untrusted text containing a special-token spelling must remain ordinary text unless explicitly admitted as a control token. A round-trip test alone cannot establish checkpoint compatibility; two tokenizers can both round-trip while assigning different IDs.',
        ] },
      ],
      worked: { title: 'Two merges on a tiny corpus', prompt: 'Train on ["abab", "ab"], requesting two merges.', stages: [
        { label: 'Count within documents', body: '(97,98) occurs three times; (98,97) once. The end of the first document is not joined to the start of the second.' },
        { label: 'First merge', body: 'Assign 256 to b"ab". The token lists become [256,256] and [256].' },
        { label: 'Second merge', body: 'Assign 257 to pair (256,256), meaning b"abab". Encoding "ababab" yields [257,256]. Concatenate their bytes to recover the original text.' },
      ], takeaway: 'Persist vocabulary and merge order with the checkpoint, not just vocabulary size.' },
      numeric: { prompt: 'The initial byte vocabulary has 256 entries. Twelve merges are successfully learned.', questions: [{ label: 'Final vocabulary size', answer: 268, reveal: 'Each successful merge introduces exactly one ID: 256 + 12.' }] },
      questions: [
        { prompt: 'New text has different pair frequencies. Which ranks should encoding use?', options: ['New frequencies', 'Alphabetical token IDs', 'The saved training merge order', 'Random ranks'], answer: 2, explain: 'Changing the ranks changes the tokenizer underneath the trained embeddings.', nudge: 'What did each embedding row learn to represent?' },
        { prompt: 'Two tokenizers have 512 entries and round-trip all examples. Are their model weights interchangeable?', options: ['Yes', 'Only if token IDs and preprocessing also match', 'Only for ASCII', 'Only if their files have the same size'], answer: 1, explain: 'Vocabulary size checks shapes, not meanings. Verify serialized tokenizer identity and reserved-token rules.', nudge: 'Consider swapping the IDs for two common words.' },
      ],
      hints: ['Keep one list of byte IDs per document; count adjacent pairs inside each list.', 'Replace a matched pair and advance by two, otherwise copy one ID and advance by one.', 'Build new vocabulary bytes by concatenating the two parent entries. Encoding applies merges in order.'],
      source: 'https://github.com/karpathy/minbpe', sourceTitle: 'Karpathy: minbpe', experiment: 'scratch_tokenizer.py',
      interpretation: ['Compare token counts for training-like text and unfamiliar Unicode text. Compression is not model quality.', 'Learn the same number of merges on a different corpus and inspect which IDs change. Store the exact artifact before any model training.'],
      transfer: ['Add reserved control-token IDs without allowing merges across control boundaries.', 'Write a compatibility check that rejects a same-size vocabulary with swapped IDs.'],
    },
    {
      key: '02_training', title: 'A Training Update That Counts Correctly',
      summary: 'Normalize by prediction tokens, accumulate gradients, clip once, and schedule updates.',
      prerequisites: ['optimizer-loop'], outcomes: ['Compute masked stable cross entropy', 'Aggregate unequal microbatches correctly', 'Apply clipping and warm-up at optimizer-step boundaries'],
      concepts: ['cross entropy', 'token weighting', 'gradient accumulation', 'gradient clipping', 'warm-up', 'cosine decay'],
      sections: [
        { title: 'The unit of loss is a predicted token', lines: [
          'Logits have shape [B,T,V]; integer targets and a Boolean loss mask have shape [B,T]. At each selected position, negative log likelihood is logsumexp(logits) minus the target logit. Convert numeric logits to floating point before subtraction, retaining integer targets and Boolean masks, then subtract the row maximum before exponentiating. Sum selected losses and divide by the number of selected targets. Padding is not an easy prediction to include in the average. An all-masked batch is an input error, not evidence of perfect loss.',
          'To evaluate a dataset, accumulate loss sums and valid-token counts across batches, then divide once. Averaging batch means gives short batches the same weight as long batches. Perplexity is exp(mean NLL) in natural-log units. It is comparable only under a compatible tokenizer, content boundary, and evaluation protocol.',
        ] },
        { title: 'Accumulation must reproduce a large batch', lines: [
          'Suppose two microbatches contain 2 and 6 valid targets. If their mean losses are 3 and 1, the combined mean is (2*3+6*1)/8=1.5, not 2. Scale each microbatch loss sum by the accumulation-window total token count before backward. Then clip the accumulated global gradient norm and take one optimizer step. Clipping each microbatch separately changes the update.',
          'For gradient vector g and threshold c, preserve its direction and bound its global norm, rather than clipping coordinates independently. Measure the norm after dividing by max(abs(g)) so squaring finite large coordinates does not overflow; zero gradients stay zero. Learning-rate schedules advance on optimizer updates, not on every microbatch. Our schedule uses zero-based update index s: warm-up lr=peak*((s+1)/warmup). Form the bounded ratio before multiplying by peak to avoid an overflowing intermediate. After warm-up, cosine-decay from peak to floor across the remaining updates. The final scheduled update reaches the floor when at least two decay points exist.',
        ] },
      ],
      worked: { title: 'Clip the accumulated vector', prompt: 'The accumulated gradient is [3,4], and the norm limit is 2.', stages: [
        { label: 'Measure', body: 'The L2 norm is sqrt(9+16)=5.' },
        { label: 'Scale', body: 'Use scale 2/5=0.4, giving [1.2,1.6]. Its direction is unchanged and its norm is 2.' },
        { label: 'Update', body: 'With SGD learning rate 0.1, subtract [0.12,0.16] from the parameters. Adam adds moment state; clipping still precedes its step.' },
      ], takeaway: 'A correct loss denominator is part of the gradient, not just the logging display.' },
      numeric: { prompt: 'Batch A: loss sum 12 over 4 tokens. Batch B: loss sum 6 over 6 tokens.', questions: [{ label: 'Combined mean NLL', answer: 1.8, tolerance: 0.00001, reveal: '(12+6)/(4+6)=1.8. The unweighted average of the two batch means would be 2.' }] },
      questions: [
        { prompt: 'Which operation follows all microbatch backward passes?', options: ['Clip once, step once, clear gradients', 'Clear before every backward', 'Step once per token', 'Average the learning rates'], answer: 0, explain: 'Accumulation retains gradients until the logical batch is complete.', nudge: 'Which sequence matches a single large-batch update?' },
        { prompt: 'A batch contains no scored targets. What should this lab do?', options: ['Report zero loss', 'Count padding instead', 'Reuse the previous loss', 'Raise a clear error'], answer: 3, explain: 'There is no mean over an empty set. Silently treating it as success hides a data bug.', nudge: 'What is the denominator?' },
      ],
      hints: ['Convert logits to float before stable logsumexp, gather integer target IDs, then select Boolean valid positions.', 'Return both the loss sum and count so callers can combine batches without averaging means.', 'Scale gradients by their maximum magnitude before measuring the global norm; form the warm-up ratio before multiplying by peak.'],
      source: 'https://github.com/rasbt/LLMs-from-scratch/tree/main/appendix-D', sourceTitle: 'LLMs from Scratch: training refinements', experiment: 'scratch_training.py',
      interpretation: ['Compare gradients from one full batch with unequal token-weighted microbatches; report maximum absolute error.', 'The experiment trains a tiny causal decoder and reports held-out NLL before and after updates. A short toy run establishes execution, not general language competence.'],
      transfer: ['Break accumulation by dividing each microbatch mean equally. Explain when that bug is hidden.', 'Compare clipping thresholds at fixed seed and update count; log unclipped norms too.'], widget: 'training',
    },
    {
      key: '03_checkpoint', title: 'Resume the Run, Not Just the Weights',
      summary: 'Recover optimizer and random state, and import external tensors without silent transposes.',
      prerequisites: ['scratch-02_training'], outcomes: ['Resume deterministic CPU updates', 'Validate tokenizer and model metadata', 'Map a foreign weight fixture explicitly'],
      concepts: ['checkpoint', 'optimizer moments', 'RNG state', 'weight orientation', 'artifact provenance'],
      sections: [
        { title: 'Inference state is not training state', lines: [
          'Weights alone are sufficient for a deterministic forward pass given the architecture, preprocessing, and mode. Continuing training also depends on optimizer moments, step number, schedule, random-number generators, and data position. A shuffled sampler and dropout consume randomness. Mixed-precision runs can additionally require a gradient-scaler state. The experiment restores a CPU Torch generator and Adam state; distributed determinism is a separate challenge.',
          'A useful checkpoint records model config, tokenizer fingerprint, model tensors, optimizer state, completed updates, RNG state, and data cursor. Validate identity before applying arrays. Never load untrusted pickle-based files with unrestricted deserialization. Our browser lab uses ordinary arrays and dictionaries; it is about compatibility checks, not a secure serialization format.',
        ] },
        { title: 'External weights need a declared mapping', lines: [
          'A linear map may be stored as [out,in] in one library and [in,out] in another. Similar parameter names are not proof of equal meaning. Explicitly map source names to destination names, specify transpose operations, validate shapes and finite values, and reject missing or unexpected tensors. Square matrices can hide orientation mistakes, so tests must use rectangular fixtures and numerical forward equivalence.',
          'Our import_weights function accepts a source dictionary, a destination specification of shapes, and a mapping destination -> (source_name, transpose). It returns independent arrays. Every source key and every destination key must appear exactly once. This deliberately small contract excludes split/fused QKV, tensor parallel shards, and quantized formats. Real GPT-2 downloads remain optional: the mechanism is learnable without network access or model-license assumptions.',
        ] },
      ],
      worked: { title: 'A rectangular projection', prompt: 'A source stores W=[[1,2],[3,4],[5,6]] with shape [3,2]. The destination expects [2,3].', stages: [
        { label: 'Declare orientation', body: 'The map explicitly requests transpose. Destination W becomes [[1,3,5],[2,4,6]].' },
        { label: 'Check computation', body: 'For x=[10,20], x @ destination_W equals [50,110,170], the same as source_W @ x.' },
        { label: 'Test continuation', body: 'Save after step k, run step k+1, restore into fresh objects, repeat the same sampled batch, and compare parameters and loss. A fresh Adam optimizer should fail this equivalence.' },
      ], takeaway: 'A load that succeeds syntactically can still mean a different model or a different training run.' },
      numeric: { prompt: 'A dense projection expects [input=4, output=7].', questions: [{ label: 'Number of weight values (no bias)', answer: 28, reveal: '4*7=28. A matching count alone does not prove matching orientation.' }] },
      questions: [
        { prompt: 'Which missing state can change the next Adam update even on the same batch?', options: ['Plot color', 'Optimizer moments', 'Notebook title', 'Test-set name'], answer: 1, explain: 'Adam uses historical first and second moments, not just the current gradient.', nudge: 'What does the optimizer remember?' },
        { prompt: 'A [64,64] imported matrix passes a shape check. What additional check matters?', options: ['Only file size', 'Only dtype name', 'A numerical forward comparison using the declared orientation', 'Whether the filename contains GPT'], answer: 2, explain: 'Transposition preserves a square shape but generally changes the function.', nudge: 'Shape compatibility is necessary, not sufficient.' },
      ],
      hints: ['Validate the full key sets before returning any result.', 'Apply only the declared transpose, then compare the exact destination shape.', 'Copy imported arrays so changing the source after import cannot change the model.'],
      source: 'https://pytorch.org/tutorials/recipes/recipes/saving_and_loading_a_general_checkpoint.html', sourceTitle: 'PyTorch: general checkpoints', experiment: 'scratch_training.py',
      interpretation: ['The training experiment performs one uninterrupted and one restored continuation and asserts matching CPU losses and tensors.', 'Change only the saved optimizer state and observe the discrepancy. Exact reproducibility across devices and library releases is not promised.'],
      transfer: ['Add a data-order fingerprint and reject a resume against a different corpus.', 'Extend the mapping to a fused QKV fixture with explicit split offsets and independent forward checks.'],
    },
    {
      key: '04_classification', title: 'Turn a Decoder into a Classifier',
      summary: 'Pool the last real token, train a task head, and evaluate beyond accuracy.',
      prerequisites: ['scratch-03_checkpoint'], outcomes: ['Pool by attention-mask position', 'Train a classification head on frozen features', 'Interpret confusion matrices and macro F1'],
      concepts: ['classification head', 'pooling', 'padding', 'confusion matrix', 'macro F1', 'class imbalance'],
      sections: [
        { title: 'The last token is a representation, not a label', lines: [
          'A decoder produces hidden states H of shape [B,T,D]. For sequence classification, select the state at the largest index whose attention mask is true. This accommodates both left and right padding. The count of true entries minus one only works for right padding with no gaps. Reject empty sequences. A linear head maps the selected D-vector to C class logits, trained with class cross entropy.',
          'First freeze the backbone and train only the head. This separates whether the representation contains useful information from the cost and instability of updating every weight. Then optionally unfreeze a top block or use adapters. The actual CPU experiment compares a majority-class baseline with a trained head on a held-out split of a tiny synthetic sequence task. It does not claim a useful spam classifier from toy pretraining.',
        ] },
        { title: 'Accuracy can reward ignoring a class', lines: [
          'For a binary task, count TP, FP, FN, and TN on held-out examples. Positive-class F1 is 2TP/(2TP+FP+FN). Compute the analogous value for the negative class and average to obtain macro F1. Define a zero denominator to produce 0 in this exercise. Report per-class support; a macro number without support can be misleading on tiny samples.',
          'Split by the real unit of independence before fitting: related messages, customers, or duplicated documents should not leak across partitions. Select thresholds using validation data only. The final test split remains untouched until the choice is fixed. The browser lab implements pooling and binary metrics; the notebook supplies the differentiable training loop and measured learning curves.',
        ] },
      ],
      worked: { title: 'An accurate model that misses all positives', prompt: 'There are 90 negative and 10 positive test examples. Predict negative for everyone.', stages: [
        { label: 'Accuracy', body: '90/100=0.9, apparently strong until compared with the majority baseline.' },
        { label: 'Positive class', body: 'TP=0, FP=0, FN=10, so positive F1=0.' },
        { label: 'Negative class', body: 'Negative-class F1=180/(180+10)=18/19. Macro F1 is 9/19, about 0.474.' },
      ], takeaway: 'A useful task evaluation exposes the failure that its users care about.' },
      numeric: { prompt: 'A row mask is [0,0,1,1,1]. Positions are zero-based.', questions: [{ label: 'Index to pool', answer: 4, reveal: 'The last true position is 4, not mask.sum()-1=2.' }] },
      questions: [
        { prompt: 'Which split should choose the classification threshold?', options: ['Final test split', 'Any split after seeing the result', 'Validation split', 'The training labels sorted by score'], answer: 2, explain: 'Threshold selection is model selection. Test performance must not guide it.', nudge: 'Keep one set for an honest final estimate.' },
        { prompt: 'A frozen-backbone head improves over the majority baseline. What follows?', options: ['These features support this task on this split', 'All tasks are solved', 'The backbone weights changed', 'No fine-tuning can improve it'], answer: 0, explain: 'A probe is a limited empirical statement, not a universal representation guarantee.', nudge: 'Match the conclusion to the intervention.' },
      ],
      hints: ['Find the maximum true-mask index independently for each batch row.', 'Use row indices paired with those positions to gather [B,D] states.', 'Compute classwise F1 from confusion counts, handling zero denominators explicitly.'],
      source: 'https://github.com/rasbt/LLMs-from-scratch/tree/main/ch06', sourceTitle: 'LLMs from Scratch: classification adaptation', experiment: 'scratch_adaptation.py',
      interpretation: ['Report baseline accuracy, trained-head accuracy, and macro F1 on held-out labels, with a fixed seed and sample counts.', 'Freezing features still permits the head gradient. Check that backbone tensors remain bitwise unchanged.'],
      transfer: ['Evaluate left-padded and right-padded copies of the same examples.', 'Create an imbalanced split and explain accuracy and macro F1 together.'],
    },
    {
      key: '05_instruction', title: 'Instruction Data and the Three Masks',
      summary: 'Build shifted targets that score responses and EOS without learning from padding.',
      prerequisites: ['scratch-04_classification'], outcomes: ['Collate variable-length prompt-response examples', 'Distinguish causal, padding, and loss masks', 'Run response-only supervised updates'],
      concepts: ['SFT', 'teacher forcing', 'EOS', 'loss mask', 'causal mask', 'truncation'],
      sections: [
        { title: 'Prompt tokens are context even when they are not targets', lines: [
          'For each example concatenate prompt IDs, response IDs, and one EOS ID. Construct input=sequence[:-1] and target=sequence[1:]. At input position i, the target is original token i+1. Score it when i+1 is at least the prompt length, so the final prompt state learns to predict the first response token. Include EOS in the response loss; otherwise the model receives no direct lesson about stopping.',
          'Our collate_sft accepts nonempty prompt lists, response lists (possibly empty), eos, pad, and max_length. Each example must fit completely; raise rather than silently truncating away its response. Pad inputs and targets to the largest shifted length in the batch, return input attention masks and response loss masks, and leave padding unscored. An empty response still has an EOS target.',
        ] },
        { title: 'Three masks answer three different questions', lines: [
          'The causal mask prevents attention to future positions. The attention/padding mask prevents attending to absent input tokens. The loss mask selects which target errors contribute gradients. Zeroing prompt loss does not remove prompt tokens from attention: the answer should depend on the instruction. Packed multi-example training additionally needs document-boundary attention isolation; this lab uses one example per row instead.',
          'Teacher forcing exposes the gold prefix during training, whereas generation consumes the model\'s own predictions. Evaluate both held-out response NLL and free-running exact-match or task checks. Keep near-duplicate prompts and answers from crossing splits. A decrease in training loss alone neither proves instruction following nor excludes memorization.',
        ] },
      ],
      worked: { title: 'Shift before deciding what to score', prompt: 'Prompt=[10,11], response=[20,21], EOS=2.', stages: [
        { label: 'Concatenate', body: 'Sequence=[10,11,20,21,2].' },
        { label: 'Shift', body: 'Inputs=[10,11,20,21], targets=[11,20,21,2].' },
        { label: 'Mask loss', body: 'Loss mask=[0,1,1,1]. Position 1 predicts the first response token 20. All four input positions are real.' },
      ], takeaway: 'An off-by-one mask can remove the first response target or train on the prompt by accident.' },
      numeric: { prompt: 'A prompt has 5 tokens and its response has 3 tokens, followed by EOS.', questions: [{ label: 'Number of scored targets', answer: 4, reveal: 'Three response tokens plus EOS. Prompt length affects context, not this count.' }] },
      questions: [
        { prompt: 'Should prompt tokens have zero attention because their loss mask is zero?', options: ['Yes, all masks are equivalent', 'Yes, unless EOS is present', 'Only at inference', 'No, the response must attend to the prompt'], answer: 3, explain: 'A target-loss decision is different from an input-visibility decision.', nudge: 'How would the model know which question to answer?' },
        { prompt: 'What does this lab do when truncation would drop all response targets?', options: ['Award zero loss', 'Reject the oversized example explicitly', 'Train on pad tokens', 'Copy the test response'], answer: 1, explain: 'Silent truncation can turn an instruction dataset into unscored or prompt-only training.', nudge: 'A visible data error is better than a misleading metric.' },
      ],
      hints: ['Build the full sequence including EOS, then take the two shifted views.', 'Target index i corresponds to full-sequence index i+1; compare that with prompt length.', 'Allocate batch arrays once, then fill input, target, attention mask, and loss mask independently.'],
      source: 'https://github.com/rasbt/LLMs-from-scratch/tree/main/ch07', sourceTitle: 'LLMs from Scratch: instruction adaptation', experiment: 'scratch_adaptation.py',
      interpretation: ['The experiment learns a tiny instruction-conditioned mapping with held-out prompt variants; log response-only loss and exact-match separately.', 'Switch to a prompt-only loss mask as a negative control. Low loss on repeated prompt boilerplate is not successful answer training.'],
      transfer: ['Specify a safe truncation policy that preserves at least one response target and the role boundary.', 'Add separate role tokens without permitting user text to create a new trusted role.'], widget: 'masks',
    },
    {
      key: '06_lora', title: 'Train and Merge Low-Rank Adapters',
      summary: 'Make the trainable parameter budget explicit and prove merge equivalence.',
      prerequisites: ['scratch-05_instruction', 'lora'], outcomes: ['Implement a low-rank residual projection', 'Verify frozen base weights', 'Train adapters and merge them for evaluation'],
      concepts: ['LoRA', 'rank', 'frozen base', 'initialization', 'merge equivalence'],
      sections: [
        { title: 'A smaller update space', lines: [
          'Use the input-row convention: x is [...,d_in], W is [d_in,d_out], A is [d_in,r], and B is [r,d_out]. The adapted layer is xW + (alpha/r)(xA)B. W stays frozen. A and B contain r*(d_in+d_out) trainable scalars instead of d_in*d_out. This constrains the update rank, not necessarily the effective rank of the full layer W+delta_W.',
          'Initialize A randomly and B to zeros. The initial adapted output then matches the base output. On the first step, B can receive a gradient, while A receives zero through B; later both can learn. Initializing both factors to zero traps both gradients at zero. Freezing W means disabling its optimizer updates and gradients, not wrapping the entire forward pass in a no-gradient context.',
        ] },
        { title: 'Merging is algebra, quality is an experiment', lines: [
          'At evaluation with dropout disabled, define merged_W=W+(alpha/r)AB. Then x@merged_W equals the two-branch result up to floating-point error. Test several ranks, rectangular dimensions, and nonzero learned B. Testing only the initial zero adapter cannot detect an implementation that ignores adapters.',
          'The notebook fits a low-rank linear task using real autograd updates, measures held-out error, checks frozen W, and verifies merged predictions. It is deliberately a mechanism experiment, not a claim that rank 2 is sufficient for a useful chat model. Compare rank at a fixed training budget and disclose which layers are adapted. Quantization adds another error source; QLoRA is not reproduced by merely casting W to a smaller dtype.',
        ] },
      ],
      worked: { title: 'Count what the optimizer owns', prompt: 'd_in=512, d_out=512, rank=8.', stages: [
        { label: 'Full layer', body: '512*512=262,144 weight values.' },
        { label: 'Adapter', body: '512*8 + 8*512=8,192 trainable values, 1/32 of the dense layer.' },
        { label: 'Remember the base', body: 'Frozen base weights still occupy inference/training memory. Adapter parameter reduction is not the same as total memory reduction.' },
      ], takeaway: 'Distinguish trainable state, stored weights, activation memory, and measured task quality.' },
      numeric: { prompt: 'd_in=12, d_out=20, rank=3, excluding bias.', questions: [{ label: 'Trainable adapter values', answer: 96, reveal: '3*(12+20)=96.' }] },
      questions: [
        { prompt: 'Why not initialize both A and B to zero?', options: ['It changes the vocabulary', 'It doubles the rank', 'Both factor gradients are zero', 'It unfreezes W'], answer: 2, explain: 'Each factor gradient is multiplied by the other zero factor.', nudge: 'Differentiate AB with respect to A and B.' },
        { prompt: 'Which test exposes an adapter branch that is ignored?', options: ['Use nonzero B and compare against a merged matrix', 'Check only parameter count', 'Test only initialization', 'Print the rank'], answer: 0, explain: 'At initialization a zero adapter should do nothing, so that case alone is weak.', nudge: 'Make the intended effect observable.' },
      ],
      hints: ['Keep the matrix convention explicit: both branches end in dimension d_out.', 'Compute delta_W=(alpha/r)*(A@B) without modifying the original W.', 'Exercise nonzero factors and compare the direct and merged outputs.'],
      source: 'https://arxiv.org/abs/2106.09685', sourceTitle: 'LoRA', experiment: 'scratch_adaptation.py',
      interpretation: ['The experiment reports actual adapter-loss reduction and merge error, and asserts the base did not change.', 'Sweep ranks with the same seed and examples. A larger rank adds capacity, but may not improve held-out performance at the same update count.'],
      transfer: ['Derive gradients for A and B by hand on a 2-by-2 example.', 'Add adapter dropout and explain why merge equivalence should be tested in evaluation mode.'],
    },
    {
      key: '07_evaluation', title: 'Decode and Evaluate Without Moving the Goalposts',
      summary: 'Specify stable temperature, nucleus boundaries, EOS behavior, and honest metrics.',
      prerequisites: ['scratch-06_lora'], outcomes: ['Implement stable top-k and nucleus filtering', 'Aggregate perplexity correctly', 'Separate model quality, decoding policy, and test leakage'],
      concepts: ['temperature', 'top-k', 'top-p', 'EOS', 'perplexity', 'test contamination'],
      sections: [
        { title: 'Sampling is a policy over logits', lines: [
          'For positive temperature tau, softmax uses logits divided by tau. Compute finite centered logit differences before dividing so large common offsets do not erase small gaps. Only when a centered difference overflows and tau>=1, recover that entry by dividing the logits before subtracting. Smaller temperatures can saturate lower scores to zero probability. A smaller temperature sharpens the distribution; it does not add knowledge. Our decoding_probs applies top-k first (if k is provided), renormalizes, then nucleus filtering. Sort by descending probability, breaking ties by smaller token ID. Keep the smallest prefix whose cumulative mass reaches p, including the crossing token, then renormalize. Require 0<p<=1 and positive temperature.',
          'This order is part of the API. Applying top-p before top-k can yield a different distribution. Greedy decoding is a separate argmax mode, not a division by temperature zero. The generation loop samples using a seeded generator, appends each chosen token, and stops at EOS or a maximum new-token budget. Context cropping must match the architecture\'s positional assumptions.',
        ] },
        { title: 'A scoreboard needs a fixed protocol', lines: [
          'Model likelihood uses teacher-forced logits before sampling filters. Do not report top-k-renormalized likelihood as the model\'s perplexity: it changes the distribution and can assign zero probability to legitimate targets. Aggregate NLL sums over valid targets. Compare per-token perplexity only when tokenization and scoring boundaries match; cross-tokenizer comparisons need a common content measure such as bytes with a clearly specified representation.',
          'Task metrics use generated answers. Fix prompts, decoding parameters, seeds, stopping rules, normalization, and verifier before evaluating. Select changes on validation, not the final test set. Report failures as well as successes, and confidence intervals when sample sizes justify them. The tiny capstone demonstrates this discipline, not a public benchmark score or a production quality claim.',
        ] },
      ],
      worked: { title: 'The nucleus includes the crossing token', prompt: 'Sorted probabilities are [0.5,0.3,0.15,0.05], and p=0.7.', stages: [
        { label: 'Accumulate', body: 'After token 0 the mass is 0.5, below 0.7. After token 1 it is 0.8, enough.' },
        { label: 'Retain', body: 'Keep tokens 0 and 1, not just token 0.' },
        { label: 'Renormalize', body: 'The retained distribution is [0.625,0.375,0,0].' },
      ], takeaway: 'Boundary and tie rules matter for reproducibility, especially on small examples.' },
      numeric: { prompt: 'A dataset has total natural-log NLL 20 over 10 scored tokens.', questions: [{ label: 'Mean NLL (not perplexity)', answer: 2, reveal: '20/10=2. Perplexity is exp(2), about 7.389.' }] },
      questions: [
        { prompt: 'Which logits should define model perplexity?', options: ['The unfiltered model logits', 'Only top-k logits', 'Only generated winners', 'The best seed selected on test'], answer: 0, explain: 'Sampling filters define a generation policy, not the original likelihood model.', nudge: 'Do not change the distribution while claiming to measure it.' },
        { prompt: 'A model improves only after tuning decoding on the final test set. What changed?', options: ['Nothing concerning', 'The tokenizer necessarily changed', 'The final test set became part of model selection', 'The confidence interval became exact'], answer: 2, explain: 'The reported score is no longer an untouched estimate; use a new holdout or disclose the selection.', nudge: 'Which data influenced the choice?' },
      ],
      hints: ['Center finite logit differences before temperature division; retry only overflowing differences with scale-first subtraction when tau>=1.', 'Use a stable descending order; find the first cumulative entry greater than or equal to p, and keep it.', 'Scatter the retained normalized probabilities back to the original vocabulary positions.'],
      source: 'https://arxiv.org/abs/1904.09751', sourceTitle: 'The Curious Case of Neural Text Degeneration', experiment: 'scratch_training.py',
      interpretation: ['Record generated samples at fixed seeds alongside held-out NLL; neither alone is a complete quality assessment.', 'Use extreme logits and tied probabilities as numerical tests, not just realistic-looking sentences.'],
      transfer: ['Compare top-k then top-p with the reversed order and find a counterexample.', 'Add a maximum-token stopping reason distinct from EOS termination to the generation report.'],
    },
    {
      key: '08_decoder', title: 'Capstone: A Complete Causal Decoder',
      summary: 'Connect embeddings, causal blocks, final normalization, logits, training, and generation.',
      prerequisites: ['scratch-07_evaluation', 'transformer-block'], outcomes: ['Implement a full decoder forward pass', 'Prove causal prefix invariance', 'Train, save, restore, adapt, and evaluate a tiny model'],
      concepts: ['decoder', 'pre-norm', 'weight tying', 'causality', 'pretraining', 'reproducibility'],
      sections: [
        { title: 'The tensor path from IDs to logits', lines: [
          'Input IDs are [B,T]. Token lookup E[ids] and learned position lookup P[:T] are [B,T,D]. Convert numeric embedding and position arrays to float before adding them; keep IDs integer. Pass through pre-norm Transformer blocks, apply final layer normalization, and project to vocabulary logits [B,T,V]. This lab ties the output matrix to E: logits=hidden@E.T. Tied weights share parameters; they are not two independently trained copies.',
          'Each block computes x <- x + attention(norm(x)), then x <- x + FFN(norm(x)). Attention projects Q,K,V, splits D into H heads of size D/H, masks future keys before softmax, mixes values, concatenates heads, and applies the output projection. The supplied _norm centers differences from a reference coordinate before scaling deviations, preserving small gaps under large common offsets; it falls back to scaling original rows only when centering overflows. Layer normalization is per token across features, with population variance and epsilon 1e-5. The MLP uses the same documented GELU approximation as Course 1: a negative infinite preactivation has activation limit zero. Unsupported nonrepresentable attention intermediates, active activations, residuals, or output logits raise FloatingPointError. Learned scale and shift are omitted from this small browser contract.',
        ] },
        { title: 'Train the same mechanism, then defend its limits', lines: [
          'The notebook contains a small PyTorch implementation with autograd, an original synthetic sequence generator, disjoint train/validation/test sequences, fixed seeds, token-level CE, an optimizer loop, checkpoint continuation, and seeded autoregressive generation. It runs on CPU with no downloaded weights or data. Small vocabulary and width keep the exercise accessible; the resulting model is not a useful general-purpose assistant.',
          'Causality is a behavioral invariant: modifying input token j must not change logits at positions earlier than j. Test multiple heads, multiple blocks, and context lengths. A shape-only test cannot establish this. To finish, record config, tokenizer/data identity, seed, parameter count, updates, train and held-out NLL, generated samples, and an explicit limitation. Do not select the best-looking seed and hide the rest.',
        ] },
      ],
      worked: { title: 'Trace a tied-output decoder', prompt: 'B=2, T=5, vocabulary=32, width=8, heads=2.', stages: [
        { label: 'Embed', body: 'IDs [2,5] become hidden states [2,5,8]. Each head has width 4.' },
        { label: 'Attend', body: 'QK scores have shape [2,2,5,5]. The upper triangle is masked independently in each batch and head.' },
        { label: 'Predict', body: 'Final hidden [2,5,8] times E.T [8,32] gives logits [2,5,32]. Each position predicts the next token, not its own ID.' },
      ], takeaway: 'A runnable model is a chain of explicit contracts, not a collection of independently passing components.' },
      numeric: { prompt: 'Vocabulary=40, width=12. Input and output weights are tied, excluding positions and blocks.', questions: [{ label: 'Distinct token/output weight parameters', answer: 480, reveal: '40*12=480, not twice that count.' }] },
      questions: [
        { prompt: 'Changing the final input token changes the first-position logits. What failed?', options: ['Only the learning rate', 'Causality or another cross-position computation', 'The vocabulary size', 'Nothing; training will fix it'], answer: 1, explain: 'An earlier prediction must not depend on a future token even before training.', nudge: 'This is an architecture invariant, not a learned preference.' },
        { prompt: 'Which final defense is strongest?', options: ['A cherry-picked fluent sample', 'Only training loss', 'A promise to evaluate later', 'Reproducible held-out metrics, samples, failure cases, and artifact identities'], answer: 3, explain: 'The report must support both reproducibility and bounded conclusions.', nudge: 'Could another learner reproduce the claim and see its limits?' },
      ],
      hints: ['Reuse the supplied reference-centered _norm and convert embeddings to float before addition; implement the full batched tensor path.', 'Keep softmax along the key dimension and scale by the square root of head width; the sigmoid GELU limit at negative infinity is zero.', 'Finish with per-token normalization and the transpose of the SAME embedding matrix; reject unsupported nonfinite active results with FloatingPointError.'],
      source: 'https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05', sourceTitle: 'LLMs from Scratch: pretraining', experiment: 'scratch_training.py',
      interpretation: ['Run the CPU experiment end to end, including checkpoint equivalence and held-out loss. Report the actual values, not the worked-example numbers.', 'This is a mechanism-scale training run. Large-scale data filtering, distributed efficiency, alignment safety, and production readiness remain separate courses.'],
      transfer: ['Replace learned positions with the RoPE mechanism from Course 2 and update the invariance tests.', 'Compare tied and untied output weights at a matched parameter or compute budget; state which quantity is held fixed.'],
    },
  ],
}
