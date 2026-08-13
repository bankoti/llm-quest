# 03 - Tokenization: text becomes model input

## The contract

A tokenizer has two essential operations:

```text
encode(text) -> list of integer token IDs
decode(token IDs) -> text
```

For ordinary text, `decode(encode(text))` should reproduce the input. Token IDs
are categories, not measurements: token 20 is not "twice" token 10.

## Level 1: characters

The character tokenizer in `src/mini_llm/tokenizer.py` sorts all unique corpus
characters, assigns an integer to each, and reverses that mapping for decoding.

Advantages:

- tiny and transparent implementation;
- no unknown combinations inside the observed character set;
- useful for debugging small models.

Costs:

- sequences are long;
- a model must relearn common multi-character patterns;
- a corpus-only vocabulary cannot encode unseen characters.

Run:

```bash
PYTHONPATH=src python -m mini_llm.cli inspect
```

## Level 2: bytes

UTF-8 represents text as bytes between 0 and 255. A byte tokenizer can encode any
valid text without an unknown token, but common words require many positions.

## Level 3: byte-pair encoding

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

Try the educational BPE implementation:

```bash
PYTHONPATH=src python -m mini_llm.cli tokenize "attention changes attention" --vocab-size 300
```

Read `BytePairTokenizer` in `src/mini_llm/tokenizer.py`. It intentionally omits
production features such as regex pre-tokenization, normalization policy, reserved
special tokens, and optimized training.

After inspecting the merges, use the same tokenizer for an end-to-end run:

```bash
PYTHONPATH=src python -m mini_llm.cli train \
  --tokenizer bpe --tokenizer-vocab-size 300 \
  --steps 300 --out runs/tiny-gpt-bpe.pt
```

The serialized merge list is stored in the checkpoint, so generation applies the
exact token mapping used during training.

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

Complete [workbook/02_tokenizer.py](../workbook/02_tokenizer.py). First implement
characters. Then implement one BPE merge pass and compare it with
`BytePairTokenizer._merge`.

## Exit check

Explain why byte-level BPE can represent unseen words and why increasing vocabulary
size can simultaneously reduce attention work and increase model parameters.
