# 01 - RMSNorm

Half the machinery in a modern decoder exists to keep activations in a healthy
numeric range. This component does it with a single statistic, and you can
verify its behavior on a two-number vector.

## LayerNorm first

![LayerNorm vs RMSNorm](content/images/c2/rmsnorm_vs_layernorm.svg)


For one token vector `x` of width `C`, LayerNorm subtracts its mean and divides by
its standard deviation before applying learned scale and bias:

```text
LayerNorm(x) = gamma * (x - mean(x)) / sqrt(var(x) + epsilon) + beta
```

## RMSNorm

RMSNorm removes recentering and usually removes the learned bias:

```text
rms(x) = sqrt(mean(x^2) + epsilon)
RMSNorm(x) = gamma * x / rms(x)
```

Both normalize each token independently across channels. Neither mixes tokens or
batch items.

Work one vector by hand. For `x = [3, 4]` with gamma = 1 and epsilon = 0:

```text
mean(x^2)  = (9 + 16) / 2 = 12.5
rms(x)     = sqrt(12.5)   = 3.536
RMSNorm(x) = [3/3.536, 4/3.536] = [0.849, 1.131]
```

Now scale the input by 10: `x = [30, 40]` gives rms = 35.36 and exactly the
same output. That is the scale invariance the exercise asks you to test. Note
the output mean is 0.99, nowhere near zero; RMSNorm never promised that.

## An implementation detail that matters

Production implementations temporarily run the RMS calculation in float32 even
when model activations use lower precision. This is a numerical stability
choice.

The essential invariant is not zero mean. It is unit root-mean-square before the
learned scale:

```python
output.pow(2).mean(dim=-1).sqrt()  # approximately one when gamma is one
```

## Why architecture reports mention norm placement

The normalization function and its placement are separate choices:

- pre-norm: normalize before each sublayer;
- post-norm: normalize the sublayer output before adding it to the residual;
- sandwich or mixed schemes: add normalization at more than one point.

Two models can both say "RMSNorm" while using different residual equations. OLMo 2
is useful to study because its report explicitly discusses changes in norm
placement and QK normalization rather than treating normalization as one flag.

## Exercise

Complete the challenge below. Test scale invariance by comparing
`norm(x)` and `norm(10*x)`. They should be close when epsilon is negligible.

## Exit check

Explain what statistical operation RMSNorm removes from LayerNorm, which axis is
normalized for `(B,T,C)`, and why float32 accumulation can matter in mixed
precision.
