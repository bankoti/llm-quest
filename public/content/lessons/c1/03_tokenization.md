# 03 - Tokenization: text becomes model input

## The contract

![Tokenizer contract](content/images/c1/tokenizer_contract.svg)


A tokenizer has two essential operations:

```text
encode(text) -> list of integer token IDs
decode(token IDs) -> text
```

For ordinary text, `decode(encode(text))` should reproduce the input. Token IDs
are categories, not measurements: token 20 is not "twice" token 10.

## Level 1: characters

A character tokenizer sorts all unique corpus
characters, assigns an integer to each, and reverses that mapping for decoding.

Advantages:

- tiny and transparent implementation;
- no unknown combinations inside the observed character set;
- useful for debugging small models.

Costs:

- sequences are long;
- a model must relearn common multi-character patterns;
- a corpus-only vocabulary cannot encode unseen characters.

## Level 2: bytes

UTF-8 represents text as bytes between 0 and 255. A byte tokenizer can encode any
valid text without an unknown token, but common words require many positions.

## Level 3: byte-pair encoding

![BPE merge steps](content/images/c1/bpe_merges.svg)


BPE begins with byte tokens and repeatedly merges the most frequent adjacent pair:

```text
lowest lowest
l o w e s t ...
lo w e s t ...       merge (l, o)
low e s t ...        merge (lo, w)
low es t ...         merge (e, s)
lowest ...           later merges can build larger chunks
```

Training stores an ordered merge list. Encoding applies learned merges by rank.
Larger vocabularies shorten sequences but enlarge the model's embedding and output
matrices. Tokenizer vocabulary is therefore an architectural tradeoff.

Trace one training step by hand: write out `attention changes attention` as
bytes, count adjacent pairs, and decide which merge wins. Several pairs tie;
real tokenizers break ties with a deterministic rule, because encode and decode
must stay reproducible forever.

The implementation you will build intentionally omits production features such
as regex pre-tokenization, normalization policy, reserved special tokens, and
optimized training.

One operational detail survives to production: the ordered merge list is stored
with the model checkpoint, so generation applies the exact token mapping used
during training.

## Special tokens

Real systems reserve IDs for boundaries and control, for example:

- beginning/end of sequence;
- padding when batches contain different lengths;
- role boundaries such as system, user, and assistant;
- tool-call or document separators.

These are part of the model-data contract. Changing the tokenizer after training
changes the meaning of embedding rows and invalidates the checkpoint.

## Common mistakes

- measuring context in words instead of tokens;
- splitting train and validation after making overlapping windows, causing leakage;
- normalizing text at training time but not inference time;
- silently mapping unknown text to the wrong ID;
- using chat control tokens as ordinary text.

## Build it yourself

Complete the challenge below. First implement character encoding. Then
implement one BPE merge pass and check it against your hand-traced example.

## Exit check

Explain why byte-level BPE can represent unseen words and why increasing vocabulary
size can simultaneously reduce attention work and increase model parameters.
