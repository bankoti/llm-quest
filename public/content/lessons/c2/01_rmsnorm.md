# 01 - RMSNorm & RoPE

Two component swaps separate your Course 1 block from a modern one. RMSNorm
keeps activations in a healthy numeric range using a single statistic; RoPE
encodes position by rotating queries and keys. Both are small enough to verify
on paper.

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

## RoPE: position as rotation

The block you assembled in Course 1 added learned position vectors to the
residual stream. Rotary position embeddings (RoPE) take a different route:
they encode position inside attention itself, by rotating each query and key
before the dot product.

Group the head dimension into adjacent pairs and treat each pair `(x0, x1)`
as a point in a plane. At position `p`, rotate pair `i` by angle `p * theta_i`:

```text
x0' = x0 * cos(p*theta_i) - x1 * sin(p*theta_i)
x1' = x1 * cos(p*theta_i) + x0 * sin(p*theta_i)
theta_i = base^(-2i/d)      base is typically 10000
```

Each pair spins at its own frequency: early pairs rotate fast and carry fine
positional detail, late pairs rotate slowly and carry coarse detail.

## Why rotation, of all things

Attention compares a query at position `m` with a key at position `n` through
a dot product. Rotate one by `m*theta` and the other by `n*theta`, and their
dot product changes in a way that depends only on `m - n`.

Verify it with one pair. Take q = k = `[1, 0]` and theta = 0.5, with q at
position 3 and k at position 1:

```text
q rotated by 1.5 rad: [cos 1.5, sin 1.5] = [0.071, 0.997]
k rotated by 0.5 rad: [cos 0.5, sin 0.5] = [0.878, 0.479]
score = 0.071*0.878 + 0.997*0.479 = 0.540 = cos(1.0)
```

`cos(1.0)` is exactly `cos((3-1) * 0.5)`. Slide both tokens to positions 13
and 11 and the score is unchanged. Relative offsets survive; absolute
positions cancel. That property lets a model reuse a pattern like "the
adjective sits two tokens back" anywhere in the sequence.

## The rotate_half trick

Applying a 2x2 rotation to every pair looks like it needs a loop. It does not:

```text
rotated = x * cos(angles) + rotate_half(x) * sin(angles)
rotate_half: (x0, x1, x2, x3) -> (-x1, x0, -x3, x2)
```

Check it against the pair formula: the first output element is
`x0*cos + (-x1)*sin` and the second is `x1*cos + x0*sin`, exactly the rotation
above. Two elementwise multiplies and one add replace the loop.

One convention warning before you read real code: some implementations,
including Llama's, lay pairs out as the first half and second half of the
vector rather than as adjacent elements. The math is identical; the element
order is not. This course uses adjacent pairs.

## Exercise

Complete the challenge below. Test scale invariance by comparing
`norm(x)` and `norm(10*x)`; they should be close when epsilon is negligible.
Then implement `rotate_half` and check it by hand: `[1, 2, 3, 4]` must become
`[-2, 1, -4, 3]`.

## Exit check

Explain what statistical operation RMSNorm removes from LayerNorm, which axis is
normalized for `(B,T,C)`, and why float32 accumulation can matter in mixed
precision. Then explain why rotating queries and keys makes attention scores
depend on relative rather than absolute position.
