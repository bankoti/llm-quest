got=retry_delays_ms(5)
assert got==[100,200,400,800,1600], f"Got {got}. That schedule grows LINEARLY — under a real outage the herd returns almost as fast as it arrived. 'Doubling each attempt' is which function of the attempt number?"
got7=retry_delays_ms(7)
assert got7[-1]==2000 and got7[-2]==2000, "Cap must clamp late attempts to cap_ms."
assert retry_delays_ms(1)==[100], "Single-attempt case broke."
print("✓ exponential backoff with cap — the herd disperses")
print("\n+150 XP — Retry Storm debugged.")
