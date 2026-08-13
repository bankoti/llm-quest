L=8
local=[one_layer_reach(L,q,window=3) for q in range(L)]
assert local[-1]=={5,6,7},f"local[-1]={local[-1]}"
assert local[0]=={0}
two=compose_reach(local,local)
assert two[-1]=={3,4,5,6,7},f"two layers: {two[-1]}"
global_=[one_layer_reach(L,q,window=None) for q in range(L)]
lg=compose_reach(local,global_)
assert lg[-1]==set(range(L)),"local+global should reach all"
print("✓ single local layer reach correct")
print("✓ two local layers correct")
print("✓ local+global reaches full context")
print("\n+150 XP — Attention Topology complete.")
