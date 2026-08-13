assert abs(win_rate(['tie']*10)-0.5)<1e-9, "Ten ties scored as a 100% win for A. If the judge can't tell the models apart, the honest win rate is 0.5 — how should a tie be counted?"
assert abs(win_rate(['A','A','B','tie'])-0.625)<1e-9, "Mixed case: 2 wins + half a tie out of 4 = 0.625."
assert abs(win_rate(['B','B'])-0.0)<1e-9, "All-losses case broke."
print("✓ ties count half — the judge is honest again")
print("\n+150 XP — The Generous Judge debugged.")
