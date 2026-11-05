"""A finite one-agent search tree with exact terminal values and a misleading prior."""
import json
import numpy as np


def tree_search(budget):
    priors = [np.array([.9,.1]), np.array([.7,.3]), np.array([.6,.4])]
    visits = [np.zeros(2) for _ in range(3)]
    sums = [np.zeros(2) for _ in range(3)]
    terminal = np.array([[.1,.2],[.5,1.]])
    for _ in range(budget):
        path = []
        for node in [0]:
            q = sums[node]/np.maximum(visits[node],1)
            action = int(np.argmax(q+1.5*priors[node]*np.sqrt(1+visits[node].sum())/(1+visits[node])))
            path.append((node,action))
        branch = path[0][1]; node = 1+branch
        q = sums[node]/np.maximum(visits[node],1)
        action = int(np.argmax(q+1.5*priors[node]*np.sqrt(1+visits[node].sum())/(1+visits[node])))
        path.append((node,action)); reward = terminal[branch,action]
        for node,action in path:
            visits[node][action] += 1; sums[node][action] += reward
    choice = int(visits[0].argmax())
    return dict(budget=budget,root_visits=visits[0].tolist(),chosen_branch=choice,best_terminal_in_branch=float(terminal[choice].max()))


if __name__ == '__main__':
    print(json.dumps([tree_search(b) for b in [4,16,64,256]],indent=2))
    print('Exact dynamics and terminal rewards; this illustrates search allocation, not a Go engine.')
