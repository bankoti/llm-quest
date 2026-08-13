required={"model-timeout","stale-index"}
full=[FailureEvidence("model-timeout",True,True,True,True,True),FailureEvidence("stale-index",True,True,True,True,True)]
assert campaign_complete(required,full)
assert not campaign_complete(required,[full[0]])
incomplete=[full[0],FailureEvidence("stale-index",True,False,True,True,True)]
assert not campaign_complete(required,incomplete)
assert campaign_complete(required,full+[FailureEvidence("cache-loss",True,True,True,True,True)])
print("✓ complete/incomplete/missing scenarios handled")
print("\n+200 XP — Failure Matrix complete.")
