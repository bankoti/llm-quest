# auto-grader
raw = 10_000_000_000_000
kept = retained_tokens(raw, 0.15)
assert kept == int(raw * 0.15), f"retention wrong: {kept}"

eb = embedding_matrix_bytes(128256, 4096, 2)
assert eb == 128256 * 4096 * 2, f"embedding bytes wrong: {eb}"

mix = {"web": 0.5, "code": 0.25, "math": 0.1, "other": 0.15}
counts = domain_token_counts(1_000_000, mix)
assert abs(sum(counts.values()) - 1_000_000) < 1, "counts must sum to total"
assert counts["web"] == 500_000, f"web: {counts['web']}"
assert counts["code"] == 250_000

try:
    domain_token_counts(1_000_000, {"web": 0.5, "code": 0.4})
    raise AssertionError("should raise ValueError for bad mix")
except ValueError:
    pass

print(f"Retained from 10T raw: {kept/1e12:.1f}T tokens")
print(f"Llama 3 8B embedding matrix: {eb/1e9:.2f}GB at bfloat16")
print("\n+150 XP — Data Pipeline complete.")
