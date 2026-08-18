required={"model-timeout","stale-index"}
full=[FailureEvidence("model-timeout",True,True,True,True,True),FailureEvidence("stale-index",True,True,True,True,True)]
assert proven(full[0])
assert not proven(FailureEvidence("x",True,True,False,True,True)), \
    "The fallback worked but bypassed a security invariant. That row is a finding, not evidence."
assert campaign_complete(required,full)
assert not campaign_complete(required,[full[0]])
assert unproven(required,[full[0]])==["stale-index"], "missing scenario -> unproven"
incomplete=[full[0],FailureEvidence("stale-index",True,False,True,True,True)]
assert not campaign_complete(required,incomplete)
assert unproven(required,incomplete)==["stale-index"], "a failed row does not prove its scenario"
assert campaign_complete(required,full+[FailureEvidence("cache-loss",True,True,True,True,True)])
assert unproven({"a","b"},[])==["a","b"]
print("\u2713 proven/unproven/complete: the campaign knows its remaining work")
print("\n+200 XP \u2014 Failure Matrix complete.")
