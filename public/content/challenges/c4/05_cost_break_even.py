"""Level 26 — Cost Break-Even
The lesson's model, verbatim: pay a fixed cost F once (distill a student
model), then every request is cheaper than calling the live teacher.

    break_even_requests = F / (c_t - c_s)

Then the flip side: an AI feature that costs MORE per request but converts
better — when does extra profit pay back the setup cost?
"""

def break_even_requests(fixed_cost, teacher_cost, student_cost) -> float:
    """Requests until distillation pays for itself.
    fixed_cost: one-time cost of labeling + training the student.
    teacher_cost / student_cost: per-request serving cost of each."""
    raise NotImplementedError

def months_to_payback(setup_cost, daily_requests, ai_cost, baseline_cost,
                      revenue, baseline_rate, ai_rate) -> float:
    """Months (30-day) until cumulative extra profit covers setup_cost.
    Extra profit per request = revenue * (ai_rate - baseline_rate)
                               - (ai_cost - baseline_cost).
    rates are conversion fractions; revenue is per conversion."""
    raise NotImplementedError
