sample = "tokens become numbers; numbers become vectors."
stoi, itos = build_vocabulary(sample)
assert decode(encode(sample, stoi), itos) == sample, "round-trip failed"
assert merge_pair([1,2,1,2,2],(1,2),9) == [9,9,2], "merge failed"
assert merge_pair([1,2,3],(1,2),9) == [9,3], "partial merge"
print("✓ vocabulary built")
print("✓ encode/decode round-trip")
print("✓ BPE merge correct")
print("\n+120 XP — Tokenization complete.")
