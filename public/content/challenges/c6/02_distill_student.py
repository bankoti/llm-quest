import numpy as np
def softmax(x):
    e=np.exp(x-x.max(axis=-1,keepdims=True)); return e/e.sum(axis=-1,keepdims=True)
def kl_divergence(p,q,eps=1e-9)->float:
    raise NotImplementedError
def distillation_loss(student_logits,teacher_logits,temperature=2.)->float:
    """Soft distillation loss: T² × KL(p_teacher ∥ p_student).

    Algorithm:
        1. Divide both logit arrays by temperature T.
        2. Apply softmax to each: p_teacher = softmax(z_t/T),
                                  p_student = softmax(z_s/T).
        3. Compute KL divergence using kl_divergence(p_teacher, p_student).
        4. Scale by T² and return the mean over the batch.

    The T² factor compensates for the softer gradient magnitude at
    high temperature (from the Hinton et al. 2015 distillation paper).
    This is the soft (teacher-only) loss — alpha=0 in the full formula.

    Args:
        student_logits:  (batch, vocab) array
        teacher_logits:  (batch, vocab) array, same shape
        temperature:     T >= 1; higher T produces softer distributions
    Returns scalar float (mean loss over batch).
    """
    raise NotImplementedError
