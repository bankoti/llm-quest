assert bidirectional_reach(5,0)=={0,1,2,3,4}
assert causal_reach(5,0)=={0}
assert causal_reach(5,3)=={0,1,2,3}
assert 4 not in causal_reach(5,3)
assert bidirectional_reach(5,2)!=causal_reach(5,2)
assert cross_attention_reach(4,8,0)=={0,1,2,3}
assert cross_attention_reach(4,8,7)=={0,1,2,3}
print("✓ bidirectional reach correct")
print("✓ causal reach: future blocked")
print("✓ cross-attention reach correct")
print("\n+150 XP — Information Flow complete.")
