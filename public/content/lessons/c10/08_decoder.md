# Capstone: A Complete Causal Decoder

Connect embeddings, causal blocks, final normalization, logits, training, and generation.

## Before You Start

Course 10. Entry course: 1. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** scratch-07_evaluation, transformer-block.

## What You Will Be Able to Do

- Implement a full decoder forward pass
- Prove causal prefix invariance
- Train, save, restore, adapt, and evaluate a tiny model

## The tensor path from IDs to logits

Input IDs are [B,T]. Token lookup E[ids] and learned position lookup P[:T] are [B,T,D]. Add them, pass through pre-norm Transformer blocks, apply final layer normalization, and project to vocabulary logits [B,T,V]. This lab ties the output matrix to E: logits=hidden@E.T. Tied weights share parameters; they are not two independently trained copies.

Each block computes x <- x + attention(norm(x)), then x <- x + FFN(norm(x)). Attention projects Q,K,V, splits D into H heads of size D/H, masks future keys before softmax, mixes values, concatenates heads, and applies the output projection. The MLP uses the same documented GELU approximation as Course 1. Layer normalization is per token across features, with population variance and epsilon 1e-5. Learned scale and shift are omitted from this small browser contract.

## Train the same mechanism, then defend its limits

The notebook contains a small PyTorch implementation with autograd, an original synthetic sequence generator, disjoint train/validation/test sequences, fixed seeds, token-level CE, an optimizer loop, checkpoint continuation, and seeded autoregressive generation. It runs on CPU with no downloaded weights or data. Small vocabulary and width keep the exercise accessible; the resulting model is not a useful general-purpose assistant.

Causality is a behavioral invariant: modifying input token j must not change logits at positions earlier than j. Test multiple heads, multiple blocks, and context lengths. A shape-only test cannot establish this. To finish, record config, tokenizer/data identity, seed, parameter count, updates, train and held-out NLL, generated samples, and an explicit limitation. Do not select the best-looking seed and hide the rest.

## Worked Example: Trace a tied-output decoder

B=2, T=5, vocabulary=32, width=8, heads=2.

1. **Embed:** IDs [2,5] become hidden states [2,5,8]. Each head has width 4.
2. **Attend:** QK scores have shape [2,2,5,5]. The upper triangle is masked independently in each batch and head.
3. **Predict:** Final hidden [2,5,8] times E.T [8,32] gives logits [2,5,32]. Each position predicts the next token, not its own ID.

A runnable model is a chain of explicit contracts, not a collection of independently passing components.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Complete small GPT forward pass. NumPy; no autograd in the browser."""
import numpy as np

def _norm(x):
    return (x - x.mean(axis=-1, keepdims=True)) / np.sqrt(x.var(axis=-1, keepdims=True) + 1e-05)

def decoder_logits(ids, embedding, positions, blocks, heads):
    """Return [B,T,V] logits for a tied-output, pre-norm causal decoder.

ids integer [B,T], embedding [V,D], positions [max_T,D], T<=max_T.
D divisible by positive heads. blocks is a list of dictionaries:
q,k,v,o: [D,D]; up: [D,F]; down: [F,D]. No biases or learned norm affine.
Each block: residual attention(norm(x)); then residual MLP(norm(x)).
MLP uses GELU approximation h/(1+exp(-1.702*h)). Final norm, then @E.T.
Assume valid finite shapes/IDs. Do not modify any inputs or parameters."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

Vocabulary=40, width=12. Input and output weights are tied, excluding positions and blocks.

- Distinct token/output weight parameters

<details><summary>Worked answers</summary>

- 480: 40*12=480, not twice that count.

</details>

## Experiment

Run `experiments/scratch_training.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Run the CPU experiment end to end, including checkpoint equivalence and held-out loss. Report the actual values, not the worked-example numbers.
- This is a mechanism-scale training run. Large-scale data filtering, distributed efficiency, alignment safety, and production readiness remain separate courses.

## Transfer Problems

1. Replace learned positions with the RoPE mechanism from Course 2 and update the invariance tests.
2. Compare tied and untied output weights at a matched parameter or compute budget; state which quantity is held fixed.

For each transfer, submit the changed code, one predicted outcome, actual measurements, one negative control, and a limitation. These open experiments need a defensible result, not a predetermined winning curve.

## AI-Assisted Coding Route

1. Predict the worked example and one edge case without assistance.
2. Ask an assistant for one small function or a test critique, not the completed notebook. Supply the exact shapes and contract.
3. Explain every returned operation and inspect the diff. Reject changes to the grader or the intended objective.
4. Run the public tests, then deliberately break a mechanism named in this lesson. Confirm that a behavioral test fails.
5. Compare with the worked solution only after an attempt. Close it and reimplement the difficult part from memory.
6. Record what you could explain unaided, what the assistant supplied, and which measured result supports your conclusion.

## Completion Evidence

A passing grader establishes this small function contract, not research reproduction or production readiness. Submit a reproducible experiment report with seed, split, shapes, budget, baseline, held-out result, failure case, and limitation. Keep failed seeds. Answers to historical/discussion questions should distinguish fact, inference, and an open empirical claim.

## Primary Source

[LLMs from Scratch: pretraining](https://github.com/rasbt/LLMs-from-scratch/tree/main/ch05). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

