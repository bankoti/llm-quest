r=incident_durations(start_minute=0,detected_minute=4,mitigated_minute=11,recovered_minute=20)
assert r=={"detect":4,"mitigate":7,"recover":9,"total":20}
r2=incident_durations(start_minute=0,detected_minute=.5,mitigated_minute=2.5,recovered_minute=5.)
assert r2["detect"]==.5 and r2["total"]==5.
try:
    incident_durations(start_minute=5,detected_minute=3,mitigated_minute=10,recovered_minute=20)
    raise AssertionError("should raise")
except ValueError: pass
try:
    incident_durations(start_minute=0,detected_minute=4,mitigated_minute=15,recovered_minute=12)
    raise AssertionError("should raise")
except ValueError: pass
print(f"✓ durations={r}")
print("✓ ordering violations raise ValueError")
print("\n+1000 XP — FINAL BOSS. ALL 73 LEVELS COMPLETE. 🏆")
