original = ['abab', 'ab']
merges, vocabulary = train_bpe(original, 2)
assert merges == [(97, 98), (256, 256)], 'Learn frequency-ranked pairs inside documents'
assert original == ['abab', 'ab'], 'Do not mutate training documents'
assert vocabulary[257] == b'abab' and len(vocabulary) == 258
assert encode_bpe('ababab', merges) == [257, 256], 'Replay learned ranks'
assert train_bpe(['a', 'b'], 4)[0] == [], 'Never merge across documents'
assert train_bpe(['ba', 'ab'], 1)[0] == [(97, 98)], 'Tie rule must be deterministic'
assert train_bpe(['aaaaa'], 1)[0] == [(97, 97)]
assert encode_bpe('aaaaa', [(97, 97)]) == [256, 256, 97], 'Non-overlapping replacements'
for sample in ['', 'new words', 'caf\u00e9', '\U0001f30d', 'abab', 'a\x00b']:
    assert decode_bpe(encode_bpe(sample, merges), vocabulary) == sample
for n in [-1, 1.5, True]:
    try:
        train_bpe(['abc'], n)
    except ValueError:
        pass
    else:
        raise AssertionError('Reject invalid merge counts')
try:
    decode_bpe([255], vocabulary)
except UnicodeDecodeError:
    pass
else:
    raise AssertionError('Do not silently replace malformed generated UTF-8')
print('Tokenizer lifecycle checks passed.')
