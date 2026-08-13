assert abs(precision_at_k(['a'],{'a'},10)-0.1)<1e-9, "A retriever that returns ONE doc out of a budget of 10 just scored 100%. Precision@k charges you for the whole budget — what should the denominator be?"
assert abs(precision_at_k(['a','b','x','y'],{'a','b'},4)-0.5)<1e-9, "Full-result case broke."
assert precision_at_k([],{'a'},5)==0.0, "Empty results must score 0, not crash."
print("✓ precision@k uses the k budget as denominator")
print("\n+150 XP — Flattering Precision debugged.")
