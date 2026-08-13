cands=[Candidate("a",.9,.85,True),Candidate("b",.8,.92,True),Candidate("c",.7,.40,True),Candidate("d",.6,.88,False)]
ranked=rerank(cands,min_rerank_score=.5,require_in_stock=True)
assert ranked[0]=="b" and "c" not in ranked and "d" not in ranked
assert ranked==["b","a"],f"order: {ranked}"
no_stock=rerank(cands,min_rerank_score=.5,require_in_stock=False)
assert "d" in no_stock
print(f"✓ ranked: {ranked}")
print("\n+150 XP — Reranking complete.")
