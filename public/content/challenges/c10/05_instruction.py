# Generated starter; edit the functions in the course editor or notebook.
"""Response-only SFT collation. Lists are token IDs, not raw text."""
import numpy as np

def collate_sft(examples, eos, pad, max_length):
    """Return dict input_ids, targets, attention_mask, loss_mask as [B,T] arrays.

examples is a nonempty list of (nonempty prompt IDs, response IDs).
Append one EOS, shift input/target by one, and score response plus EOS.
Pad to largest shifted length. Input IDs/targets use pad at padded positions.
Boolean masks; integer IDs. max_length bounds the SHIFTED length.
Reject oversized/empty-prompt/negative-ID examples with ValueError.
Inputs must not be mutated. Empty responses still score EOS."""
    raise NotImplementedError('Implement this function, then run the checks.')
