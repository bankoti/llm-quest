naive=score_matrix_bytes(1,1,4096,2)
assert naive==32*1024*1024,f"4096^2*2=32MiB, got {naive}"
tiled=tile_bytes(64,64,128,2)
assert tiled<naive,"one tile < full matrix"
assert tiled==64*128*2+64*128*2+64*128*2+64*64*2,f"tile bytes: {tiled}"
assert score_matrix_bytes(1,1,8192,2)==4*naive,"doubling tokens->4x memory"
print("✓ naive score matrix correct")
print("✓ tile < full matrix")
print("\n+200 XP — IO-Aware Attention complete.")
