# 04 - Reasoning and Reinforcement Learning

## The reasoning gap

SFT and DPO can improve reasoning as well as conversational behavior, but
neither guarantees that a model learns a reliable search procedure. Outcome
examples do not directly identify which intermediate decisions caused success.
Reward-based training offers a different signal; its effectiveness depends on
the task, the initial policy, exploration, and the quality of the reward.

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
reference model constrains distributional drift and can reduce excessive
optimization of an imperfect reward. It does not validate the reward and does
not guarantee that reward hacking is prevented.

The policy learns to produce responses that score above the group mean, a
relative improvement signal rather than an absolute one.

## What this coding level does, and does not, implement

This level teaches reward normalization, a sampled KL estimator, and an
advantage-weighted log-probability surrogate. The function `grpo_loss` retains
its existing name for compatibility, but it is not a complete GRPO algorithm.
Full GRPO also distinguishes the rollout (old) policy from the reference
policy, uses a clipped new/old probability ratio, masks variable-length
responses, collects fresh samples, and updates the trainable policy.
For outcome rewards, a response's group-relative advantage is shared by its
valid response tokens; it is not computed by normalizing unrelated token rewards.

The [DeepSeekMath paper, Section 4.1](https://arxiv.org/html/2402.03300v3#S4.SS1)
specifies these distinctions. A scalar loss exercise is a prerequisite to an
end-to-end training experiment, not a substitute for one.

## Format rewards

Beyond correctness, GRPO can reward format: did the model use a scratchpad
before answering? Format rewards are binary (0 or 1) and easy to compute
automatically. DeepSeek-R1 reports that format rewards plus correctness
rewards together produce robust chain-of-thought behavior without process
supervision.

> **Note:** this recipe has a name and a blast radius. Reinforcement
> learning with verifiable rewards (RLVR) uses programmatic checks such as
> test outcomes or answer matching. It complements preference-based alignment
> rather than making human preferences unnecessary for every task. An important
> failure mode is reward hacking, models finding
> answers that satisfy the verifier without solving the task. Course 12's
> RL track studies these limitations with actual policy updates and deliberately
> imperfect rewards.

## Exit check

Given five sampled responses with rewards [0.1, 0.8, 0.3, 0.6, 0.2],
compute the normalized advantage for each. Explain why GRPO does not need
a learned value baseline, what the KL penalty constrains, and a reward failure
that it cannot rule out.
