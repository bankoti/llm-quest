import numpy as np
def softmax(x):
    e=np.exp(x-x.max(axis=-1,keepdims=True)); return e/e.sum(axis=-1,keepdims=True)
def kl_divergence(p,q,eps=1e-9)->float:
    raise NotImplementedError
def distillation_loss(student_logits,teacher_logits,temperature=2.)->float:
    raise NotImplementedError
