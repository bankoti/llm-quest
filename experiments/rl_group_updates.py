"""Actual vanilla/GRPO categorical updates with equal rollout and update budgets.

One-step completions isolate the objective. This is not an LLM benchmark.
"""
import json
import torch


def group_experiment():
    torch.set_num_threads(1)
    reports = []
    true_rewards = torch.tensor([0., .2, .5, 1.])
    for seed in [3, 9, 17]:
        for method in ['vanilla', 'grpo', 'grpo_bad_reward']:
            torch.manual_seed(seed)
            logits = torch.nn.Parameter(torch.zeros(4))
            optimizer = torch.optim.Adam([logits], lr=.05)
            reference = torch.full((4,), .25).log()
            curve = []
            observed_rewards = true_rewards if method != 'grpo_bad_reward' else torch.tensor([1., .2, .5, .1])
            rounds, group_size, epochs = (100, 16, 1) if method == 'vanilla' else (50, 32, 2)
            for step in range(rounds):
                old = logits.detach().log_softmax(-1)
                actions = torch.multinomial(old.exp(), group_size, replacement=True)
                rewards = observed_rewards[actions]
                advantages = (rewards-rewards.mean())/(rewards.std(unbiased=False)+1e-8)
                for _ in range(epochs):
                    current = logits.log_softmax(-1)
                    chosen = current[actions]
                    ratio = (chosen-old[actions]).exp()
                    delta = reference[actions]-chosen
                    kl = delta.exp()-delta-1
                    if method == 'vanilla':
                        # Exact expected reward under the old policy is an
                        # action-independent baseline in this enumerable toy.
                        baseline = (old.exp()*observed_rewards).sum()
                        loss = -(chosen*(rewards-baseline)).mean()
                    else:
                        loss = -(torch.minimum(ratio*advantages,ratio.clamp(.8,1.2)*advantages)-.02*kl).mean()
                    optimizer.zero_grad(set_to_none=True); loss.backward(); optimizer.step()
                with torch.no_grad():
                    p = logits.softmax(-1)
                    curve.append(dict(step=step+1, proxy_reward=float(p@observed_rewards), true_reward=float(p@true_rewards), exact_kl=float((p*(p.log()-reference)).sum()), clip_fraction=float(((ratio<.8)|(ratio>1.2)).float().mean())))
            assert not torch.equal(logits.detach(),torch.zeros(4))
            reports.append(dict(seed=seed,method=method,rollouts=1600,optimizer_steps=100,curve=curve,
                zero_variance_advantages=((torch.ones(4)-1)/(torch.zeros(())+1e-8)).tolist(),
                group_size=group_size,epochs_per_rollout=epochs,
                limitation='Matched total samples and optimizer steps, not FLOPs or group size. Vanilla uses fresh on-policy samples for every update; GRPO reuses each rollout for two epochs.'))
    return reports


if __name__ == '__main__':
    print(json.dumps(group_experiment(), indent=2))
