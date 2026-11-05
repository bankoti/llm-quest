# Train Dynamics, Then Plan Through Them

Fit an action-conditioned model, score candidate rollouts, and test model exploitation.

## Before You Start

Course 13. Entry course: 12. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** embodied-04_latents.

## What You Will Be Able to Do

- Roll out a learned dynamics model
- Choose plans by a declared goal cost
- Measure compounding errors and replan

## Prediction becomes a planning primitive

A state or latent dynamics model predicts z_next=f(z,a). Training examples must include actions aligned with the transition they caused. A video-only predictor can learn temporal regularities without identifying how interventions change the world. For planning, sample candidate action sequences, roll each through the model, score their predicted costs, and choose a sequence. The lab uses linear dynamics z_next=A@z+B@a with explicit column-vector convention.

Our cost sums squared goal distances at every predicted step plus action_penalty times squared action magnitudes. Other tasks use terminal-only costs, obstacles, discounting, or uncertainty penalties; they produce different plans. Return the full predicted rollout and each candidate cost, not only the winning index. Tie-breaking is first index so results are reproducible.

## The planner can discover the model's mistakes

Small one-step errors can compound over a long horizon. A planner may select actions outside the training distribution where the model is overoptimistic. Evaluate selected plans in the actual simulator, not only in the learned model. Compare in-distribution and out-of-distribution actions, and report both predicted and observed costs.

Model predictive control executes the first action or short prefix, observes the actual new state, and replans. It can reduce accumulated error but does not guarantee safety or correct dynamics. Hierarchical planning separates long-range subgoals from short-horizon control; subgoal feasibility and model uncertainty remain open checks. The experiment trains on a known linear environment and adds a controlled model-error case. PushT and real robot contact dynamics are deliberately not represented by this simple environment.

## Worked Example: A two-step plan

Scalar dynamics z_next=z+a, start=0, goal=2, action penalty=0.

1. **Plan A:** Actions [1,1] predict states [1,2], cost (1-2)^2+(2-2)^2=1.
2. **Plan B:** Actions [2,0] predict [2,2], cost 0.
3. **Constraints matter:** If each action is bounded by 1, Plan B is invalid despite its lower unconstrained cost.

State dynamics, cost definition, and action constraints jointly define the planning problem.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Explicit linear latent rollouts and goal costs."""
import numpy as np

def plan_candidates(initial, dynamics_a, dynamics_b, candidates, goal, action_penalty=0.0):
    """Return (first best index, costs [C], predicted states [C,H,D]).

z_next=A@z+B@action. initial/goal [D], A [D,D], B [D,U], candidates [C,H,U].
Valid finite shapes C,H>=1 and nonnegative penalty assumed. Cost sums goal
squared distance at EVERY predicted step plus penalty*sum(action^2).
No input mutation. This function does not impose action bounds."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

Predicted states are [1,2], goal=3, no action penalty.

- Sum of squared goal distances

<details><summary>Worked answers</summary>

- 5: (1-3)^2+(2-3)^2=4+1=5.

</details>

## Experiment

Run `experiments/embodied_world.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Report held-out one-step error, multi-step error, predicted plan cost, and simulator cost.
- Training a linear state model is a planning prerequisite, not a reproduction of pixel-based PushT results.

## Transfer Problems

1. Add action bounds and reject invalid candidates before scoring.
2. Compare open-loop and replanned control under a disturbance at fixed planning budget.

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

[LeWorldModel](https://arxiv.org/html/2603.19312v1). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

