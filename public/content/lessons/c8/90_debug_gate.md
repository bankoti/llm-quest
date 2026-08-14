# Debug — The Confident Gate

A regression shipped last week. The launch gate said PASS. The gate an AI
assistant wrote has one conceptual bug — and it is the most expensive class of
bug in experimentation.

## The domain

![Upper vs lower CI in gating](content/images/c8/debug_gate.svg)


A non-inferiority gate must answer: *are we confident the new system is no
worse than the old one, within margin?* Confidence lives at the pessimistic
end of the interval. The check is:

```text
pass  ⟺  (treatment_mean − 1.96 × stderr) ≥ control_mean − margin
          ^^^^^^^^^^^^^^^ lower bound
```

Use the *upper* bound and the gate answers a different question: "is it
*possible* the new system is fine?" Under high uncertainty the answer is
always yes — so the noisier your experiment, the easier it passes. That is
exactly backwards: uncertainty should make shipping harder, not easier.

## The transferable lesson

Every statistical gate has a direction of caution. When AI writes one, check
which tail it tests: a gate that gets *more permissive* as data gets *worse*
is broken by construction, no matter how clean the code looks.
