"""Original byte-BPE experiment; reference functions are embedded in the notebook."""
from pathlib import Path
import runpy

if 'train_bpe' not in globals():
    globals().update(runpy.run_path(str(Path(__file__).resolve().parents[1] / 'public/content/solutions/c10/01_tokenizer.py')))

corpus = ['a model learns a pattern', 'a pattern repeats', 'the model repeats a pattern']
for count in [0, 8, 24]:
    merges, vocab = train_bpe(corpus, count)
    for text in ['a model repeats a pattern', 'caf\u00e9 beyond the corpus']:
        ids = encode_bpe(text, merges)
        assert decode_bpe(ids, vocab) == text
        print({'merges': len(merges), 'bytes': len(text.encode('utf-8')), 'tokens': len(ids), 'text': text})
other, _ = train_bpe(['zzzzzyyyyyxxxx'], 8)
assert other != train_bpe(corpus, 8)[0]
print('Compression and round-trip correctness do not establish language-model quality.')
