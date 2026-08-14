# 04 - Reasoning and Reinforcement Learning

## The reasoning gap

SFT and DPO improve helpfulness on conversational tasks. They do not
reliably improve multi-step reasoning. A model trained on correct answers
learns the surface pattern of correct answers, not the search process
that produces them.

## Process vs. outcome supervision

**Outcome supervision:** reward only the final answer. Simple to label, but
the model receives no signal about which steps were useful.

**Process supervision:** label individual reasoning steps. Requires more
annotation but provides a denser signal. Lightman et al. (2023) showed
process-supervised reward models outperform outcome-only ones on math
benchmarks.

## GRPO: Group Relative Policy Optimization

DeepSeek-R1 popularized GRPO as a lighter alternative to PPO for reasoning.
For each prompt, sample G responses and compute a reward for each. Normalize
within the group:

```text
advantage_i = (reward_i - mean(group_rewards)) / std(group_rewards)
```

Apply a policy gradient update weighted by the advantage. No value network is
needed because the baseline is the group mean. A KL penalty against the
reference model prevents reward hacking.

The policy learns to produce responses that score above the group mean — a
relative improvement signal rather than an absolute one.

## Format rewards

Beyond correctness, GRPO can reward format: did the model use a scratchpad
before answering? Format rewards are binary (0 or 1) and easy to compute
automatically. DeepSeek-R1 reports that format rewards plus correctness
rewards together produce robust chain-of-thought behavior without process
supervision.

## Exit check

Given five sampled responses with rewards [0.1, 0.8, 0.3, 0.6, 0.2],
compute the normalized advantage for each. Explain why GRPO does not need
a learned value baseline and what failure mode the KL penalty prevents.
