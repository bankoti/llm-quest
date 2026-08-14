# 03 - Supervised Fine-tuning and Preference Alignment

## From pretraining to assistant

A pretrained model predicts the next token across its training distribution.
Post-training transforms it through two stages:

1. **Supervised fine-tuning (SFT):** train on curated (prompt, response)
   pairs using cross-entropy loss on response tokens only.
2. **Preference alignment:** adjust the model to prefer responses humans rate
   higher.

## Supervised fine-tuning

SFT data is expensive to produce and small relative to pretraining. Quality
matters far more than quantity: a few hundred carefully written demonstrations
in a new domain often outperform thousands of automatically generated ones.

Loss is computed only on response tokens:

```text
inputs:   [system] [user prompt] [assistant response]
loss:      ignored   ignored       computed here
```

The chat template defines how roles encode as token sequences. Changing the
template after SFT without re-training on the new format breaks the model.

## Direct preference optimization

DPO removes the reward model and RL loop of RLHF. Given a preference pair
(prompt, chosen, rejected), the loss is:

```text
loss = -log sigmoid(
    beta * log(pi(chosen) / pi_ref(chosen))
  - beta * log(pi(rejected) / pi_ref(rejected))
)
```

`pi_ref` is the frozen SFT model. `beta` controls how far the new policy can
deviate from it. A high beta keeps the policy close to SFT; a low beta lets
it move freely toward the preference signal.

## Exit check

Write the DPO loss as a Python expression using log-probabilities for chosen
and rejected responses. Explain what happens as beta approaches zero and as
beta approaches infinity. Identify which term prevents collapse to a
degenerate solution.
