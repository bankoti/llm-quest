items=[Item("a",15.,"food",["vegan","spicy"]),Item("b",25.,"food",["vegan"]),Item("c",10.,"health",["protein"]),Item("d",8.,"food",["vegan","gluten-free"])]
assert parse_price_constraint("cheap noodles under 20 dollars")==20.
assert parse_price_constraint("under $15")==15.
assert parse_price_constraint("best protein bars") is None
f=apply_constraints(items,max_price=20.)
assert all(i.price<=20. for i in f) and "b" not in [i.id for i in f]
vf=apply_constraints(items,category="food",required_tags=["vegan"])
ids=[i.id for i in vf]
assert "a" in ids and "d" in ids and "c" not in ids
menu=[Item("meat-sand",9.,"food",["chicken"]),Item("vegan-sand",11.,"food",["vegan"])]
scores={"meat-sand":.95,"vegan-sand":.70}
got=search(menu,scores,required_tags=["vegan"])
assert got==["vegan-sand"], \
    "The meat sandwich scores 0.95 on semantic similarity — and fails the vegan hard constraint. Similarity ranks; it must never make an ineligible item eligible."
both=search(menu,scores,category="food")
assert both==["meat-sand","vegan-sand"], "with no tag constraint, semantic order decides"
print("✓ price parsing and filtering correct")
print("✓ hard vegan constraint beats a higher semantic score")
print("\n+200 XP — Constrained Search complete.")
