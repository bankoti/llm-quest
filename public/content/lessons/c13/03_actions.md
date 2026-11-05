# Vision-Language-Action Interfaces and Flow Matching

Trace observations into an action chunk, construct the attention mask, and learn continuous velocity targets.

## Before You Start

Course 13. Entry course: 12. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** embodied-02_ssl.

## What You Will Be Able to Do

- Compare planner and direct-policy architectures
- Build a blockwise causal mask
- Implement continuous-action flow targets

## A progression of different interfaces

SayCan combines language-based skill selection with affordance estimates. Inner Monologue adds feedback to high-level reasoning; Code as Policies expresses behavior through generated programs calling robot APIs. RT-1 learns a Transformer robot policy. PaLM-E incorporates embodied observations into a multimodal language model, and RT-2 co-fine-tunes vision-language models to emit discretized robot actions. These are different boundaries between planning, perception, and control, not merely successive larger chatbots.

pi0 combines a pretrained vision-language backbone with an action expert trained using flow matching. Inputs include images, language, and robot state; output is a continuous action chunk rather than a prose answer. Its three attention blocks are image/language, state, and noisy actions. Each block is bidirectional internally and can attend to earlier blocks, but not future blocks. Thus action tokens can see the prefix and each other; image/language tokens cannot see future action noise.

## Generate a continuous chunk

For clean action chunk a and noise e, define x_t=(1-t)e+t*a, t in [0,1]. The target velocity for this simple linear path is a-e. Train v_theta(x_t,t,context) by squared error to that target. Starting from noise, Euler integration uses x_(t+dt)=x_t+dt*v_theta. This is an original simplified flow convention; schedules, noise paths, and conditioning details vary across systems.

A chunk has shape [horizon,action_dimensions], such as joint deltas plus gripper commands after task-specific normalization. Predicting a chunk can reduce policy-call frequency, but executing it open loop delays feedback. Receding-horizon control executes only part, observes again, then replans. The experiment fits a synthetic conditional action distribution; no real robot, controller limits, collision model, or safety certification is included.

## Worked Example: One flow target

Noise e=[-1,2], desired action a=[3,0], t=.25.

1. **Interpolate:** x_t=.75*[-1,2]+.25*[3,0]=[0,1.5].
2. **Velocity:** a-e=[4,-2].
3. **Euler step:** With dt=.1 and an exact velocity, the next point is [.4,1.3].

Continuous-action generation learns a vector field; it is not next-word decoding with a different label.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Blockwise attention and linear-path flow matching."""
import numpy as np

def block_mask(lengths):
    """Boolean [T,T] mask for ordered blocks; row=query, column=key.

lengths are positive integers. All tokens within a block see each other;
a block sees earlier blocks, never later ones. Invalid lengths: ValueError."""
    raise NotImplementedError('Implement this function, then run the checks.')

def flow_target(noise, actions, time):
    """Return (x_t, velocity) for x_t=(1-t)*noise+t*actions, v=actions-noise.

Matching finite float arrays, scalar finite 0<=time<=1. Invalid time:
ValueError. Do not mutate arrays. Convention runs noise at t=0 to data at 1."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

An action chunk has horizon 12 and 7 action coordinates per step.

- Predicted scalar action values

<details><summary>Worked answers</summary>

- 84: 12*7=84; inference steps are an additional computation dimension.

</details>

## Experiment

Run `experiments/embodied_flow.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Check mask entries against the block rule and train an actual conditional velocity network.
- A synthetic action loss is not real-world control success. Report observation/action units and closed-loop assumptions.

## Transfer Problems

1. Compare full-chunk execution with one-step replanning under a disturbance.
2. Identify which interface changes when moving from RT-2 discrete tokens to a continuous action expert.

For each transfer, submit the changed code, one predicted outcome, actual measurements, one negative control, and a limitation. These open experiments need a defensible result, not a predetermined winning curve.

## AI-Assisted Coding Route

1. Predict the worked example and one edge case without assistance.
2. Ask an assistant for one small function or a test critique, not the completed notebook. Supply the exact shapes and contract.
3. Explain every returned operation and inspect the diff. Reject changes to the grader or the intended objective.
4. Run the public tests, then deliberately break a mechanism named in this lesson. Confirm that a behavioral test fails.
5. Compare with the worked solution only after an attempt. Close it and reimplement the difficult part from memory.
6. Record what you could explain unaided, what the assistant supplied, and which measured result supports your conclusion.

## Completion Evidence

A passing grader establishes this small function contract, not research reproduction or production readiness. Submit a reproducible experiment report with seed, split, shapes, budget, baseline, held-out result, failure case, and limitation. Keep failed seeds. Answers to historical/discussion questions should distinguish fact, inference, and an open empirical claim.

## Primary Source

[pi0: A Vision-Language-Action Flow Model](https://arxiv.org/html/2410.24164v1). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

- [Demonstrating Large Language Models on Robots](https://www.roboticsproceedings.org/rss19/p024.pdf)
- [RT-1](https://arxiv.org/abs/2212.06817)
- [PaLM-E](https://arxiv.org/abs/2303.03378)
- [RT-2](https://arxiv.org/abs/2307.15818)
