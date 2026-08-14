# Debug: The Norm That Centers

An AI assistant "ported RMSNorm from the Llama paper". One conceptual bug.

## The domain

![LayerNorm masquerading as RMSNorm](content/images/c2/debug_rmsnorm.svg)


LayerNorm computes `(x - mean) / std`: it centers, then scales. RMSNorm was a
deliberate simplification; Zhang & Sennrich showed the *re-centering* is
mostly unnecessary; only the *re-scaling* matters. So RMSNorm divides by the
root-mean-square of the raw activations and never subtracts anything:

```text
RMSNorm(x) = weight * x / sqrt(mean(x²) + eps)
```

Every Llama-family model depends on exactly this definition. A checkpoint
trained with true RMSNorm and loaded into a "helpfully improved" version that
centers will produce subtly different activations everywhere at once.

## What to look for

Diff the code against the equation above, term by term. Generated code loves
to add steps that look like diligence. Extra steps are not free: they change
the function.
