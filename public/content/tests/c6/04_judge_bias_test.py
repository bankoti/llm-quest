ab=["A","B","A","B"]; ba=["B","A","A","B"]
assert abs(position_bias_score(ab,ba)-.5)<1e-9
assert position_bias_score(["A","A","B"],["A","A","B"])==0.
scores=[.5,.7,.6,.9,.8]; lengths=[100,200,150,400,300]
corr=verbosity_correlation(scores,lengths)
assert corr>.9,f"strong correlation expected: {corr:.3f}"
print(f"✓ position bias={position_bias_score(ab,ba):.0%}")
print(f"✓ verbosity correlation={corr:.3f}")
print("\n+200 XP — Judge Bias complete.")
