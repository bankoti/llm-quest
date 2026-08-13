p={"fixed_ms":25.,"sequential_ms":[35.,20.],"parallel_ms":[45.,70.],"reserve_ms":30.}
assert critical_path_ms(**p)==180.,f"got {critical_path_ms(**p)}"
assert remaining_ms(200.,**p)==20.
print("✓ critical path correct")
print("\n+200 XP — SLO Budget complete.")
