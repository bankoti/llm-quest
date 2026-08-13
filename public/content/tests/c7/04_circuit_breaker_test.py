b=CircuitBreaker(failure_threshold=2)
assert b.state=="closed" and b.allow()
b.record(False); assert b.state=="closed"
b.record(False); assert b.state=="open"
assert b.allow() is False
b.cooldown_elapsed(); assert b.state=="half-open" and b.allow()
b.record(True); assert b.state=="closed" and b.failures==0
b.record(False); b.record(False); assert b.state=="open"
print("✓ closed->open->half-open->closed")
print("\n+200 XP — Circuit Breaker complete.")
