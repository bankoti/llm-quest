assert not gate_passes(0.80,0.80,0.05,0.02), "Equal means with HUGE uncertainty passed the gate. 'Confident it is no worse' means even the pessimistic end of the interval clears the bar — which end of the interval is that?"
assert gate_passes(0.80,0.80,0.005,0.02), "Tight-interval case (genuinely safe) must pass."
assert not gate_passes(0.75,0.80,0.005,0.02), "A clear regression passed the gate."
print("✓ gate checks the lower confidence bound — uncertain is not safe")
print("\n+150 XP — The Confident Gate debugged.")
