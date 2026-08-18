opts=[
    Option("live-model",      .93, 240., False, True),
    Option("head-cache",      .82,  20., False, True),
    Option("teacher-student", .87,  45., True,  True),
    Option("lexical",         .68,  10., False, True),
]
assert gate_failures(opts[0], deadline_ms=200.)==["latency"]
assert gate_failures(opts[2], deadline_ms=200.)==["privacy"]
assert gate_failures(opts[1], deadline_ms=200.)==[]
assert gate_failures(Option("x",.99,300.,True,False), deadline_ms=200.)==["privacy","latency","rollback"]
assert choose_option(opts, deadline_ms=200.)=="head-cache", \
    "The two best-scoring options each violate a hard gate. Gates eliminate; quality only ranks survivors."
assert choose_option(opts, deadline_ms=300.)=="live-model", \
    "With a looser deadline the live model passes its gate — now its quality is allowed to win."
assert choose_option([opts[2]], deadline_ms=200.)=="no-viable-option"
print("✓ hard gates eliminate; quality ranks the survivors")
print("\n+150 XP — Route Decision complete.")
