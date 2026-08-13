risks=[Risk("prompt-injected-catalog",4,5,5,.25),Risk("cache-staleness",5,3,4,.70),Risk("trace-data-leak",2,5,5,.10)]
assert prioritize(risks)[0]=="prompt-injected-catalog"
from dataclasses import replace
assert residual_score(replace(risks[0],control_strength=1.0))==0.0
print(f"✓ priority: {prioritize(risks)}")
print("\n+500 XP — Risk Register. Boss fight won. 🏆")
