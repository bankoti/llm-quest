"""Response-only SFT collation. Lists are token IDs, not raw text."""
import numpy as np


def collate_sft(examples, eos, pad, max_length):
    """Return dict input_ids, targets, attention_mask, loss_mask as [B,T] arrays.

    examples is a nonempty list of (nonempty prompt IDs, response IDs).
    Append one EOS, shift input/target by one, and score response plus EOS.
    Pad to largest shifted length. Input IDs/targets use pad at padded positions.
    Boolean masks; integer IDs. max_length bounds the SHIFTED length.
    Reject oversized/empty-prompt/negative-ID examples with ValueError.
    Inputs must not be mutated. Empty responses still score EOS.
    """
    if not examples or not isinstance(max_length, int) or isinstance(max_length, bool) or max_length < 1:
        raise ValueError('nonempty batch and positive max_length required')
    if any(not isinstance(v, (int, np.integer)) or isinstance(v, (bool, np.bool_)) or v < 0 for v in (eos, pad)):
        raise ValueError('invalid special token ID')
    rows = []
    for prompt, response in examples:
        seq = list(prompt) + list(response) + [eos]
        if not len(prompt) or len(seq) - 1 > max_length or any(not isinstance(v, (int, np.integer)) or isinstance(v, (bool, np.bool_)) or v < 0 for v in seq):
            raise ValueError('invalid or oversized example')
        rows.append((seq, len(prompt)))
    shape = (len(rows), max(len(seq) - 1 for seq, _ in rows))
    x, y = np.full(shape, pad, int), np.full(shape, pad, int)
    attention, loss = np.zeros(shape, bool), np.zeros(shape, bool)
    for b, (seq, prompt_length) in enumerate(rows):
        length = len(seq) - 1
        x[b, :length], y[b, :length] = seq[:-1], seq[1:]
        attention[b, :length] = True
        loss[b, prompt_length - 1:length] = True
    return dict(input_ids=x, targets=y, attention_mask=attention, loss_mask=loss)
