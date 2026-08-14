# 06 - Gradients, backpropagation, and optimization

## What training changes

Let model parameters be `theta` and loss be `L(theta)`. A gradient contains one
partial derivative per parameter:

```text
gradient(theta) = dL / dtheta
```

The basic gradient-descent update is:

```text
theta <- theta - learning_rate * gradient(theta)
```

The minus sign moves toward lower loss. The learning rate controls step size.

## The chain rule

![Backpropagation graph](content/images/c1/backprop_graph.svg)


If `loss` depends on `prediction`, which depends on `weight`, then:

```text
d loss / d weight
  = (d loss / d prediction) * (d prediction / d weight)
```

Backpropagation applies this rule from the scalar loss backward through the graph,
reusing intermediate results. PyTorch records the graph during the forward pass
and traverses it when you call `loss.backward()`.

## A complete tiny update

```python
weight = torch.nn.Parameter(torch.tensor(0.0))
optimizer = torch.optim.SGD([weight], lr=0.1)

for _ in range(20):
    prediction = weight * 3
    loss = (prediction - 12) ** 2
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    optimizer.step()
```

The solution is `weight = 4`. `zero_grad` is required because PyTorch accumulates
gradients by default.

## AdamW in plain language

Adam keeps moving averages of:

- gradients, which estimate direction;
- squared gradients, which estimate scale.

It gives different parameters adaptive effective step sizes. AdamW separately
shrinks selected weights through weight decay. The course excludes one-dimensional
bias and normalization parameters from decay and applies it to matrix-like weights.

## Failure patterns

**Loss is NaN:** learning rate may be too high, data may contain invalid IDs, or
an operation may overflow or divide by zero.

**Loss never changes:** gradients may be disabled, optimizer parameters may be
wrong, or `optimizer.step()` may be missing.

**Training falls, validation rises:** likely overfitting, leakage aside.

**Gradients explode:** use a lower learning rate, inspect initialization and
normalization, and clip the global gradient norm as a guardrail.

## Finite-difference gradient check

For a scalar parameter, compare autograd to:

```text
(L(theta + epsilon) - L(theta - epsilon)) / (2 * epsilon)
```

This numerical estimate is slow but valuable when implementing a new operation.

## Build it yourself

Complete [workbook/05_gradients.py](../workbook/05_gradients.py). Print the loss,
weight, and gradient at each step. Then set the learning rate to `10` and explain
the resulting behavior before restoring it.

## Exit check

Explain why gradients must be cleared each iteration, why the loss must be a
scalar for ordinary `backward()`, and how the learning rate differs from a gradient.
