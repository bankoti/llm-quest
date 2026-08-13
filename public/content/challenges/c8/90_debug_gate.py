"""Debug — The Confident Gate 🐛
An AI assistant wrote the launch gate. A regression shipped last week and the
gate said PASS. Statistics was consulted. ONE conceptual bug.
"""
def gate_passes(treatment_mean, control_mean, stderr, margin):
    """Non-inferiority launch gate at 95% confidence (z=1.96).
    Pass ONLY if we are confident treatment is no worse than control
    by more than margin."""
    return treatment_mean + 1.96 * stderr >= control_mean - margin
