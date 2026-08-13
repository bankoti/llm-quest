passages=[Passage("p1","Protein powder."),Passage("p2","Pea protein."),Passage("p3","Storage.")]
claims=[Claim("25g per serving.",["p1"]),Claim("Pea is vegan.",["p2"]),Claim("Cures disease.",["p99"])]
r=validate_citations(claims,passages)
assert len(r["valid_claims"])==2
assert len(r["invalid_claims"])==1
assert "p3" in r["uncited_passages"]
assert "p1" not in r["uncited_passages"]
print(f"✓ valid={r['valid_claims']} invalid={r['invalid_claims']} uncited={r['uncited_passages']}")
print("\n+500 XP — Grounded Generation. Boss fight won. 🏆")
