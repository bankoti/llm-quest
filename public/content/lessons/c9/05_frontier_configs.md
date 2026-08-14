# 05 - Frontier Model Configurations

## Reading a config as architecture evidence

Every open frontier model ships a config file. Reading it directly is better
than reading summaries: the file contains exact parameter counts, head
groupings, context lengths, and activation functions.

## Llama 3 8B

```text
hidden_size:              4096
num_hidden_layers:        32
num_attention_heads:      32
num_key_value_heads:      8      <- GQA: 4 queries per KV head
intermediate_size:        14336  <- SwiGLU: two matrices of this width
vocab_size:               128256
max_position_embeddings:  8192
rope_theta:               500000.0
```

The 14336 intermediate size looks large until you account for SwiGLU: it uses
two weight matrices of that width, comparable in parameter count to a 4x
width standard FFN.

## DeepSeek-V3: MLA and shared experts

Multi-head Latent Attention (MLA) projects keys and values down to a latent
vector of dimension 512, then projects back up at decode time. KV cache
shrinks from `2 * H * D * layers` per token to `latent_dim * layers` per
token -- a 5-8x reduction.

DeepSeek-V3 also uses one shared expert that is always active regardless of
router output, capturing frequent patterns that benefit from consistent
processing.

## Mixtral 8x7B

```text
num_local_experts:    8
num_experts_per_tok:  2
hidden_size:          4096
num_key_value_heads:  8
num_attention_heads:  32
```

Total parameters ~47B; active per forward ~13B. Routing selects top-2
experts and weights their outputs by their router softmax probabilities.

## Comparing KV cache

For 32 layers at bfloat16 (2 bytes per scalar):

```text
Llama 3 8B:   8 KV heads * 128 head_dim * 2 (K+V) * 2B * 32 layers = 131KB/token
Mixtral 8x7B: same GQA config -> same per-token cost
DeepSeek-V3:  512 latent_dim * 2B * 32 layers = 32KB/token (~4x cheaper)
```

At 10K concurrent 32K-token contexts, the difference between architectures
is hundreds of gigabytes.

## Exit check

From the Llama 3 8B config above, derive: total attention parameter count
per layer, FFN parameter count per layer (SwiGLU, two matrices), and KV
cache bytes for a 4096-token context at bfloat16.
