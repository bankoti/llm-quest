assert choose_pattern(0.9,50,1000)=="head-cache"
assert choose_pattern(0.2,250,1000)=="live-model"
assert choose_pattern(0.2,50,1_000_000)=="teacher-student"
print("✓ route decision correct")
print("\n+150 XP — Route Decision complete.")
