assert tokens_in_budget(200,20,30,5.)==30,f"got {tokens_in_budget(200,20,30,5.)}"
assert tokens_in_budget(100,95,30,5.)==0
assert tokens_in_budget(200,50,50,5.)==20
assert should_start(200,20,30,25,5.) is True
assert should_start(200,20,30,35,5.) is False
assert should_start(100,95,30,1,5.) is False
print("✓ token/deadline budget correct")
print("\n+200 XP — Token & Deadline Budget complete.")
