risks=[Risk("prompt-injected-catalog",4,5,5,.25),Risk("cache-staleness",5,3,4,.70),Risk("trace-data-leak",2,5,5,.10)]
assert prioritize(risks)[0]=="prompt-injected-catalog"
from dataclasses import replace
assert residual_score(replace(risks[0],control_strength=1.0))==0.0
chain=["untrusted-text","enters-context","treated-as-authority","bypasses-validation","unsafe-link-published"]
controls=[("provenance-filter","untrusted-text"),("output-allowlist","bypasses-validation")]
assert scenario_mitigated(chain,controls)
assert uncovered_steps(chain,controls)==["enters-context","treated-as-authority","unsafe-link-published"], \
    "Two controls cover two steps. The other three steps are where defense-in-depth is still thin — list them in chain order."
assert not scenario_mitigated(chain,[])
assert uncovered_steps(chain,[])==chain
try:
    uncovered_steps(chain,[("wishful-control","not-a-step")])
    raise AssertionError("should raise")
except ValueError: pass
print(f"✓ priority: {prioritize(risks)}")
print("✓ controls mapped to the causal chain; uncovered steps exposed")
print("\n+500 XP — Risk Register. Boss fight won. 🏆")
