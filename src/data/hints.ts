// Hint ladder — three escalating hints per level.
// Tier 1 (free): concept nudge. Unlocks after 2 failed runs.
// Tier 2 (-10% XP): points at the likely mistake.
// Tier 3 (-10% XP): near-answer — the key line or formula in words.
// XP cost keeps the testing effect intact: help is available, not free.

export const HINTS: Record<string, [string, string, string]> = {
  // Course 1
  'c0-l1': [
    'All four are one-liners over the math module. ceil_div: math.ceil(a / b) or (a + b - 1) // b. close_enough: math.isclose(a, b).',
    'solve_exponent: take logs of both sides. base**n <= threshold becomes n >= log(threshold)/log(base) because dividing by a negative log flips the inequality. Then math.ceil.',
    'n_choose_k is exactly math.comb(n, k). No factorials, no loops.',
  ],
  'c0-l2': [
    'top_k: sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]. Sort positions, not values.',
    'argmax: loop with enumerate and a strict > so the FIRST maximum wins ties. count_labels: d[label] = d.get(label, 0) + 1.',
    'pair_deltas: [a - b for b, a in zip(before, after)]. zip pairs the lists element by element.',
  ],
  'c0-l3': [
    'clamp is max(lo, min(x, hi)). safe_ratio: check den == 0 first and return default; only then divide.',
    'missing_keys: [k for k in required if k not in config]. Iterating required (not config) preserves the required order.',
    'range_error: return "" when lo <= value <= hi; otherwise exactly f"{name}={value} outside [{lo}, {hi}]". Copy the format from the docstring.',
  ],
  'c0-l4': [
    'The axis you name disappears: col_means is M.mean(axis=0). row_normalize divides by M.sum(axis=1, keepdims=True).',
    'pairwise_scores is one matmul: A @ B.T. Shapes: (n,d) @ (d,m) -> (n,m).',
    'mask_scores: np.where(mask, S, -np.inf). Keep where True, replace where False.',
  ],
  'c0-l5': [
    'gpus_needed is ceil_div from level 1: (model_bytes + gpu_bytes - 1) // gpu_bytes.',
    'cheapest_config: min(sorted(costs), key=lambda k: costs[k]). Sorting names first makes ties resolve alphabetically because min is stable. accuracy_by_model: sum(answers)/len(answers) with an if-else guard for empty.',
    'route_queries: np.argmax(Q @ K.T, axis=1).tolist(). axis=1 picks the best expert per row (per query); .tolist() converts to plain ints.',
  ],

  'c1-l1': [
    'Every task here is about shapes. Before writing code, write down the input shapes and the required output shape.',
    'Matmul contracts the inner dimension: (a,b) @ (b,c) -> (a,c). Broadcasting aligns trailing dimensions and stretches size-1 dims.',
    'Use A @ B for matrix product, .T to transpose, and reshape/keepdims to line shapes up. If numpy raises a shape error, print .shape of both operands.',
  ],
  'c1-l2': [
    'A tokenizer is two dictionaries: string-to-id and id-to-string. BPE just grows the vocabulary by recording merge rules.',
    'For BPE: count adjacent pairs in the current token list, find the most frequent pair, replace every occurrence with the merged symbol, repeat.',
    'Encode by applying merges in the order they were learned. Decode by joining tokens and reversing the id mapping. Keep merges as a list, not a set — order matters.',
  ],
  'c1-l3': [
    'One training example = a context window and the same window shifted one position right.',
    'For each start index i: x = tokens[i : i+T], y = tokens[i+1 : i+T+1]. The target for position t is always tokens[i+t+1].',
    'Valid start indices run from 0 to len(tokens) - T - 1 inclusive: the +1 shift of y must not run off the end of the array.',
  ],
  'c1-l4': [
    'A bigram model is a V x V table: row = current token, column = probability of the next token.',
    'Build counts by iterating consecutive pairs, then normalize each ROW to sum to 1 — rows are conditional distributions.',
    'counts[cur, nxt] += 1 for each adjacent pair; probs = counts / counts.sum(axis=1, keepdims=True). Loss = mean of -log(prob of the true next token).',
  ],
  'c1-l5': [
    'The numeric gradient is the definition of a derivative: nudge one parameter, see how the loss moves.',
    'grad_i = (loss(w + eps*e_i) - loss(w - eps*e_i)) / (2*eps). Perturb ONE coordinate at a time, restore it before the next.',
    'The descent step is w = w - lr * grad, and gradients must be zeroed (or recomputed fresh) each step — they do not carry over.',
  ],
  'c1-l6': [
    'Attention is three steps: scores = Q @ K.T (scaled), mask the future, softmax, then weights @ V.',
    'Scale scores by 1/sqrt(d_k) BEFORE softmax, and apply the causal mask BEFORE softmax by setting future positions to a huge negative number.',
    'mask = np.triu(np.ones((T,T)), k=1); scores[mask == 1] = -1e9 (per batch/head). Then softmax rows sum to 1 with zero weight on the future.',
  ],
  'c1-d1': [
    'The tests say future tokens are visible. There are only two places that can happen: how the mask is built, or when it is applied.',
    'Check the triangle: masking j < i hides the PAST (wrong); you must hide j > i. Also check the mask is applied before softmax, not after.',
    'The fix is one line: use the strictly upper triangle (k=1) as the forbidden region and set those logits to -inf before the softmax call.',
  ],
  'c1-l7': [
    'The block is: x = x + attention(norm(x)); x = x + mlp(norm(x)). The full model wraps embeddings, N blocks, a final norm, and the LM head.',
    'Most failures here are residual wiring: the ADD must use the unnormalized input x, not the normalized branch input.',
    'Follow the docstring order exactly: token embedding + position handling, then blocks, then final norm, then project to vocab logits. Check output shape (B, T, V).',
  ],

  // Course 2
  'c2-l1': [
    'RMSNorm has no mean subtraction and no bias. RoPE rotates (even, odd) feature pairs of q and k by a position-dependent angle.',
    'RMSNorm: x / sqrt(mean(x^2) + eps) * gain. If your output looks centered, you accidentally wrote LayerNorm.',
    'RoPE: for pair (x1, x2) at position p with frequency f: (x1*cos(p*f) - x2*sin(p*f), x1*sin(p*f) + x2*cos(p*f)). Apply to q and k, never v.',
  ],
  'c2-l2': [
    'GQA means several query heads share one KV head. The trick is expanding KV heads to match query heads without copying data logic.',
    'Map query head h to KV head h // (n_heads // n_kv_heads). Repeat each KV head that many times (np.repeat on the head axis).',
    'After repeating K and V to n_heads, the attention math is identical to standard multi-head. The cache savings come only from what you STORE, not what you compute.',
  ],
  'c2-l3': [
    'MoE is routing: score each token against each expert, keep the top-k, weight expert outputs by the (renormalized) router probabilities.',
    'Use argsort/argpartition to get top-k expert indices per token. Renormalize the selected router weights so they sum to 1 per token.',
    'Output = sum over selected experts of weight * expert(x). Tokens not routed to an expert contribute nothing to it — loop experts, gather their assigned tokens.',
  ],
  'c2-l4': [
    'Same skeleton as the C1 block, new parts: RMSNorm instead of LayerNorm, RoPE on q/k, GQA repeat, SwiGLU MLP.',
    'SwiGLU: hidden = silu(x @ W_gate) * (x @ W_up), out = hidden @ W_down. silu(z) = z * sigmoid(z).',
    'Wire order: x = x + gqa_attention(rmsnorm(x), rope); x = x + swiglu(rmsnorm(x)). Check every sub-shape against the docstring before assembling.',
  ],
  'c2-l5': [
    'This level is arithmetic, not code golf: count bytes moved between HBM and SRAM for naive vs tiled attention.',
    'Naive attention materializes the (N, N) score matrix in HBM — that read/write dominates. Tiled attention only streams Q, K, V blocks.',
    'Bytes for the score matrix = N * N * bytes_per_element (once written, once read). Compare against N * d terms to see why tiling wins at large N.',
  ],
  'c2-l6': [
    'KV cache bytes = 2 (K and V) x layers x kv_heads x head_dim x seq_len x bytes_per_element.',
    'For budget questions, invert the formula: solve for seq_len given a byte budget. Watch kv_heads vs total heads — GQA changes the answer.',
    'Eviction: keep the newest W tokens (sliding window) — evicted count = max(0, seq_len - W). Speculative budgets just multiply tokens by the extra draft length.',
  ],
  'c2-d1': [
    'The output scale looks right, so the bug is subtle: compare against the RMSNorm definition term by term.',
    'RMSNorm must NOT subtract the mean. If you see x - x.mean() anywhere, that line is the bug — it silently turns RMSNorm into (biasless) LayerNorm.',
    'Delete the centering step: divide x by sqrt(mean(x*x) + eps), multiply by the gain. The mean of the OUTPUT should generally be nonzero.',
  ],

  'c2-l7': [
    'MLA caches only c_KV (the compressed latent), not the expanded K and V. The cache size formula is: n_layers * batch * seq_len * d_c * bytes.',
    'compress_kv is a single matmul: x @ W_DKV. expand_kv is two matmuls: c_kv @ W_UK and c_kv @ W_UV.',
    'cache_reduction_factor = (2 * n_kv_heads * head_dim) / d_c. The 2 is because standard caches both K and V. Element size cancels out.',
  ],

  // Course 3
  'c3-l1': [
    'Classify by attention direction: encoder = bidirectional, decoder = causal, cross-attention = decoder queries reading encoder keys/values.',
    'Trace shapes through each architecture: where do Q, K, V come from in each case? That answers every routing question.',
    'Encoder-only suits understanding tasks (classify, embed), decoder-only suits generation, encoder-decoder suits sequence-to-sequence with a distinct source.',
  ],
  'c3-l2': [
    'Cost of an attention pattern = number of (query, key) pairs actually scored.',
    'Full: N*N. Sliding window w: N*w. Global tokens g: add g*N pairs (both directions). Sum the pieces for hybrid patterns.',
    'Express each pattern as pairs-scored, then compare. The test wants exact pair counts, so be careful about window edges and double counting.',
  ],
  'c3-l3': [
    'Two formulas do all the work: linear params = in_features x out_features (+ out if bias), training FLOPs = 6 x params x tokens.',
    'Count params component by component: attention projections (q, k, v, o), MLP matrices, embeddings. Sum them — no shortcuts.',
    'For memory: bytes = params x bytes_per_param. For GQA models, k and v projections use kv_heads x head_dim output dims, not the full model dim.',
  ],
  'c3-l4': [
    'The SSM recurrence is h_t = A * h_t-1 + B * x_t, y_t = C * h_t — a loop carrying fixed-size state.',
    'Implement it as a literal loop over time steps. Per-token cost is constant in sequence length; compare to attention reading a growing cache.',
    'Follow the docstring for the state shape and initialization (usually zeros). The complexity comparison is arithmetic: O(1) vs O(t) per token.',
  ],
  'c3-l5': [
    'Every fact you need is a key in the config dict — the skill is knowing which combination reveals which architecture choice.',
    'GQA: num_key_value_heads < num_attention_heads. MLP expansion: intermediate_size / hidden_size. Head dim: hidden_size / num_attention_heads.',
    'KV cache per token = 2 x num_hidden_layers x num_key_value_heads x head_dim x bytes. Derive head_dim first; everything else follows.',
  ],
  'c3-d1': [
    'The estimate claims GQA saves nothing. Work out what the saving SHOULD be (heads / kv_heads), then find the term that erases it.',
    'Check which head count the cache formula uses. The cache stores only KV heads — using num_attention_heads overcounts by exactly the GQA factor.',
    'Replace num_attention_heads with num_key_value_heads in the cache size line. Expected saving factor: n_heads / n_kv_heads.',
  ],
  'c3-l6': [
    'This defense is arithmetic under constraints: compute memory and per-token cost for each candidate, then let the budget decide.',
    'Compute the KV cache (or state size) at the target context for each option. Long context kills full attention on cache size before FLOPs.',
    'Show the numbers: option fits the memory budget AND meets per-token cost -> defensible. The test checks your budget math, not your taste.',
  ],

  // Course 4
  'c4-l1': [
    'Hard gates eliminate before quality scoring. gate_failures checks privacy, latency, and rollback — violations by name, in that order. choose_option filters first, then picks the highest quality survivor.',
    'gate_failures: if data_leaves_region -> append "privacy"; if p95_ms > deadline_ms -> append "latency"; if not has_rollback -> append "rollback". Return the list.',
    'choose_option: survivors = [o for o in options if not gate_failures(o, deadline_ms=deadline_ms)]. Return max(survivors, key=lambda o: o.quality).name, or "no-viable-option" if survivors is empty.',
  ],
  'c4-l2': [
    'precision@k = |relevant ∩ top_k| / k. The denominator is always k, even when fewer than k items were retrieved — you pay for the full budget.',
    'baseline_report groups queries by slice_name. Compute mean P@k per slice. worst_slice is the slice name with the lowest mean. The point: aggregate can look healthy while one slice is at zero.',
    'precision_at_k: set(results[:k]) & set(relevant) gives the hits; divide by k. For slices: collect per-slice P@k scores in a dict, then min by value for worst_slice.',
  ],
  'c4-l3': [
    'critical_path_ms = fixed_ms + sum(sequential_ms) + max(parallel_ms) + reserve_ms. Sequential stages all run; parallel stages fan out so you only pay the slowest.',
    'remaining_ms = target_ms - critical_path_ms. A negative result means the design already breaks the SLO before any real-world variance.',
    'One-liner each. Guard max(parallel_ms) against an empty list if the spec allows it (use max(parallel_ms, default=0)). Both functions are just arithmetic over the keyword args.',
  ],
  'c4-l4': [
    'meets_slo checks two hard gates: latency_p95_ms <= latency_slo_ms AND cost_per_1k_req <= cost_slo. Both must pass for the pattern to qualify.',
    'rank_patterns filters out patterns that fail meets_slo, then sorts survivors by quality_score descending. Returns a list of names.',
    'meets_slo: return self.latency_p95_ms <= latency_slo_ms and self.cost_per_1k_req <= cost_slo. rank_patterns: filter with p.meets_slo(...), then sorted(..., key=lambda p: p.quality_score, reverse=True) to get names.',
  ],
  'c4-l5': [
    'break_even_requests = fixed_cost / (teacher_cost - student_cost). That denominator is the per-request saving from switching to the student.',
    'months_to_payback: extra profit per request = revenue*(ai_rate - baseline_rate) - (ai_cost - baseline_cost). Daily profit = daily_requests * extra_per_request. Months = setup_cost / (daily_profit * 30).',
    'break_even_requests: watch out for teacher_cost <= student_cost (no saving, never pays back — return float("inf") or per the docstring). months_to_payback: days = setup_cost / daily_profit; return days / 30.',
  ],
  'c4-d1': [
    'A retriever returning one doc out of a k=10 budget just scored 100%. Precision@k should charge you for the whole budget — trace where the denominator comes from.',
    'The bug: denominator is len(top) (how many were retrieved) instead of k (the budget). One result means len(top)=1, so 1/1=1.0 regardless of quality.',
    'Fix: return hits / k. Also guard the case where retrieved is empty: if k == 0 or not retrieved return 0.0 before computing hits.',
  ],
  'c4-l6': [
    'residual_score = likelihood * impact * exposure * (1 - control_strength). prioritize returns names sorted by residual_score descending (highest risk first).',
    'uncovered_steps walks the causal chain and returns steps not covered by any control. Each control is placed at exactly one step. Raise ValueError if a control names a step not in the chain.',
    'uncovered_steps: covered = {step for _, step in controls}; check each step in controls is valid first. scenario_mitigated: all(s in covered for s in chain).',
  ],

  // Course 5
  'c5-l1': [
    'BM25 = IDF x saturated term frequency. Build each piece separately and multiply at the end.',
    'IDF = log((N - df + 0.5) / (df + 0.5) + 1). TF term = tf x (k1 + 1) / (tf + k1 x (1 - b + b x dl/avgdl)).',
    'Score a document by summing the per-term contributions for query terms only. Check your df counts documents containing the term, not total occurrences.',
  ],
  'c5-l2': [
    'Two towers: embed docs offline, embed the query online, rank by similarity.',
    'Normalize vectors to unit length first — then cosine similarity is just the dot product, and a matrix multiply scores every doc at once.',
    'scores = doc_matrix @ query_vec (after normalizing both). Top-k = np.argsort(scores)[::-1][:k]. Mind the descending order.',
  ],
  'c5-l3': [
    'RRF works on ranks, not scores: a document at rank r in a list contributes 1 / (k + r).',
    'Build rank dicts per list (rank starts at 1 per the docstring), then sum contributions across lists for every doc that appears anywhere.',
    'fused[doc] = sum over lists of 1/(k + rank_in_list). Docs missing from a list contribute nothing for that list. Sort by fused score descending.',
  ],
  'c5-l4': [
    'Two phases: parse constraints out of the query, then FILTER the candidate set before any ranking happens.',
    'Hard constraints eliminate documents entirely — they are not score penalties. Apply every filter the parsed intent produced.',
    'Filter first (price, category, availability per the spec), rank the survivors by relevance. If nothing survives, return empty — do not relax constraints silently.',
  ],
  'c5-l5': [
    'Rerank = re-score the top candidates with the expensive scorer, then apply business rules as the final pass.',
    'Only rerank the top-k the retriever gave you. Business rules (pinning, dedupe, blocklists) are applied AFTER model scoring, per the docstring order.',
    'Sort by cross-encoder score descending, then apply each rule in the listed order. Rules that conflict resolve in favor of the rule applied last (or as specified).',
  ],
  'c5-d1': [
    'The worst documents come first — the ordering is exactly inverted. Something sorts in the wrong direction.',
    'Find the sort/argsort call. Ascending is the default; ranking wants descending. Also check any [::-1] that may have been dropped or doubled.',
    'Fix: sort by score descending (reverse=True or [::-1] after argsort). Then add a known-answer query test so this never regresses.',
  ],
  'c5-l6': [
    'Grounding is a mapping problem: each claim must find at least one retrieved passage that supports it.',
    'Follow the docstring matching rule exactly (keyword overlap or the given support function). A claim with no supporting passage is a violation.',
    'Return the structure the spec asks for: supported claims with their source ids, unsupported claims flagged. Empty retrieval means answer cannot be grounded — handle it explicitly.',
  ],

  // Course 6
  'c6-l1': [
    'DCG = sum of gain / log2(position + 1), with positions starting at 1. NDCG divides by the ideal ordering DCG.',
    'Use the exact gain formula from the docstring (linear rel or 2^rel - 1). Ideal DCG = DCG of relevances sorted descending.',
    'NDCG = DCG / IDCG, and IDCG of all-zero relevances needs a guard (return 0). Off-by-one in the log position is the most common failure.',
  ],
  'c6-l2': [
    'The student learns to match the teacher output distribution after temperature scaling. Implement kl_divergence(p, q) first, then build distillation_loss on top of it.',
    'kl_divergence(p, q) = sum(p * log(p / q)). distillation_loss: divide both logit arrays by T, apply softmax, then T^2 * kl_divergence(p_teacher, p_student). The T^2 compensates for softer gradients at high temperature.',
    'kl_divergence: add eps before log to avoid log(0). Return a scalar float. distillation_loss: call softmax(logits / temperature) for both, then temperature**2 * kl_divergence(p_t, p_s). Mean over the batch.',
  ],
  'c6-l3': [
    'ECE: bin predictions by confidence, then compare average confidence to accuracy inside each bin.',
    'ECE = sum over bins of (n_bin / N) x |accuracy_bin - confidence_bin|. Empty bins contribute zero.',
    'Bin edges per the docstring (usually equal width on [0,1]). Watch the boundary rule — which bin gets confidence exactly on an edge is specified.',
  ],
  'c6-l4': [
    'Position bias shows up when verdicts change if you swap the answers. Verbosity bias shows up as length predicting the winner.',
    'Run every pair in both orders. Flip rate = fraction of pairs where the winner changed with position. Compare win rate vs answer length for verbosity.',
    'Follow the docstring for what to return: per-bias metrics computed exactly as defined. The data is constructed so biased judges produce obvious numbers.',
  ],
  'c6-l5': [
    'Kappa = (observed agreement - chance agreement) / (1 - chance agreement).',
    'Chance agreement: for each label, multiply the two raters marginal proportions for that label, then sum across labels.',
    'Build the confusion counts first, derive marginals from row/column sums, then apply the formula. Guard the degenerate case where chance agreement = 1.',
  ],
  'c6-d1': [
    'Model A never loses — the scoring gives A something it did not earn. Trace what happens to ties and to answer order.',
    'Find the tie branch: ties counted as wins for A inflate its rate. Also check whether positions are ever swapped between trials.',
    'Fix: count ties separately (or split 0.5/0.5 per the spec) and randomize/alternate answer order. Recompute — A should drop to its true rate.',
  ],
  'c6-l6': [
    'Drift detection compares the CURRENT feature distribution to a REFERENCE window, bin by bin.',
    'PSI = sum over bins of (p_now - p_ref) x ln(p_now / p_ref). Add the docstring epsilon to avoid log(0) on empty bins.',
    'Use the reference window to define bin edges, apply the same edges to current data, then apply the formula. Threshold per the spec decides drifted or not.',
  ],

  // Course 7
  'c7-l1': [
    'A fallback chain tries options in quality order and must ALWAYS return something valid — the last rung cannot fail.',
    'Wrap each attempt; on failure move to the next rung. Never let an exception escape, and never return None when the spec defines a final default.',
    'Order: primary model -> cache -> heuristic -> static default (per the docstring). Return which rung served, if the spec asks — tests check the metadata too.',
  ],
  'c7-l2': [
    'Cache identity = every input that shapes the output, versioned. Same inputs, same key; any version bump, new key.',
    'Build the key from ALL the fields the docstring lists (model version, prompt version, params, input). Missing one field = rollback poison.',
    'Serialize deterministically (sorted keys) before hashing so identical configs always produce identical keys, then hash exactly as specified.',
  ],
  'c7-l3': [
    'Deadlines propagate: each stage receives what REMAINS of the budget, not the original total.',
    'remaining = deadline - elapsed. If remaining < the minimum a stage needs, skip or degrade that stage rather than start it.',
    'Cap output tokens so generation_time fits the remaining budget (tokens x time_per_token <= remaining). Return within budget even if the answer is shorter.',
  ],
  'c7-l4': [
    'A circuit breaker is a small state machine: closed -> open (threshold breached) -> half-open (cooldown elapsed) -> closed or open again.',
    'Track consecutive failures (or the docstring metric). Open: reject immediately. Half-open: allow limited probes; success closes, failure re-opens.',
    'The transitions and thresholds are all in the spec — implement them literally, including the cooldown timer and the probe count.',
  ],
  'c7-l5': [
    'Admission control answers one question at the door: can this request be served within its deadline given the current queue?',
    'Estimated wait = queue_length x service_time. Admit only if wait + service fits the deadline; otherwise reject immediately.',
    'Reject early and cheaply — do not enqueue and time out later. The tests measure both what you accept and how fast you refuse.',
  ],
  'c7-l7': [
    'model_bytes = ceil(params * bytes_per_param). bytes_per_param: BF16=2.0, INT8=1.0, INT4=0.5.',
    'kv_cache_bytes = ceil(2 * layers * kv_heads * head_dim * seq_len * batch_size * bytes_per_kv). The 2 is for K and V.',
    'max_batch_size: subtract model_bytes from budget, divide remainder by kv_cache_bytes(batch=1). Return floor, minimum 0.',
  ],

  'c7-l8': [
    'acceptance_prob = min(1.0, p_target / q_draft). simulate_verify walks the draft: accept token i while us[i] < min(1, ratios[i]); stop at the first rejection; return accepted + 1.',
    'expected_tokens = (1 - alpha**(gamma+1)) / (1 - alpha), with alpha >= 1 returning float(gamma + 1). speedup divides that by (c * gamma + 1).',
    'best_gamma: loop g from 1 to max_gamma, track the g with the highest speedup; a plain loop with > (strictly greater) keeps the smallest on ties.',
  ],

  'c7-d1': [
    'Under an outage this retry code multiplies traffic instead of shedding it. Look at how the delay scales with the attempt number.',
    'Two things to fix: the delay grows linearly (base_ms * a) when it should double each attempt, and late attempts need a hard cap. No jitter required.',
    'Fix: min(base_ms * 2**(a-1), cap_ms). The bug is the linear multiplier a — replace it with a power of 2. cap_ms is already a parameter.',
  ],
  'c7-l6': [
    'Three functions, one philosophy: harm rolls back on weak evidence, promotion needs strong evidence. Check guardrails BEFORE the quality delta — a breach can never be bought back by quality.',
    'decide() follows the docstring order exactly: breach -> rollback (regardless of samples); samples < min_samples -> hold; quality delta met -> promote; else hold.',
    'next_ramp(): rollback -> 0, hold -> current_pct unchanged, promote -> first RAMP_STAGES entry strictly greater than current_pct (100 has no next stage, so it stays 100).',
  ],

  // Course 8
  'c8-l1': [
    'An experiment needs: randomized assignment, a pre-registered success metric, guardrail metrics, and abort thresholds — all defined BEFORE launch.',
    'Randomize by hashing the user id (per the spec), not by time or geography. Guardrails get abort thresholds, not aspirations.',
    'Fill every field the docstring requires: metric, direction, minimum detectable effect, guardrails with thresholds, sample size. Missing fields fail the check.',
  ],
  'c8-l2': [
    'A launch gate is AND logic over pre-committed criteria: every criterion must pass, and missing evidence is not a pass.',
    'Evaluate each criterion against its threshold exactly as specified. Collect failures — the gate result should explain WHY it failed.',
    'Overall = all(criteria pass). Treat missing or stale metrics per the spec (almost certainly fail-closed). Return the detailed per-criterion verdicts.',
  ],
  'c8-l3': [
    'Non-inferiority: new is acceptable if it is no worse than old by more than margin delta — per slice, not just overall.',
    'Per slice: pass if (new_metric - old_metric) >= -delta for higher-is-better metrics. Watch the sign convention in the docstring.',
    'Overall verdict requires EVERY critical slice to pass. One regressed slice fails the release even when the aggregate improves.',
  ],
  'c8-l4': [
    'A manifest pins the exact identity of every input: model hash, dataset version, code sha, config values.',
    'Include every field the docstring lists. Verification = recompute/compare hashes; any mismatch names the drifted artifact.',
    'Diff two manifests field by field to report what changed between builds. Deterministic ordering makes the diff stable — sort keys.',
  ],
  'c8-l5': [
    'Every failure mode needs a control that is BOUNDED (worst case known) and VERIFIED (tested by injecting the failure).',
    'For each row: failure mode, control, worst case after control, verification evidence. The matrix is complete only when every listed mode is covered.',
    'The tests inject the failures and check your controls hold. Uncontrolled modes and untested controls both fail — cover the full docstring list.',
  ],
  'c8-d1': [
    'This gate approves releases when metrics are MISSING. Safety gates must fail closed: no data, no launch.',
    'Find where absent/None metrics are handled. Skipping the check (continue) or defaulting to pass is the bug.',
    'Missing, stale, or unparseable metrics -> fail the gate with a reason. Only complete, fresh, passing evidence approves a rollout.',
  ],
  'c8-l6': [
    'The final boss is timeline arithmetic: from an event log, compute detection, engagement, and recovery durations.',
    'MTTD = detect_time - start_time; MTTR = resolve_time - start_time (or per the docstring definitions). Parse timestamps carefully.',
    'Aggregate across incidents exactly as specified (mean of each duration). Watch unit conversions — the log may be seconds, the answer minutes.',
  ],

  'c9-l1': [
    'Chinchilla formula: N* = 0.2 * sqrt(C), D* = 10 * N*. Training FLOPs = 6 * N * D.',
    'inference_memory_gb: params * bytes_per_param / 1e9 (1 GB = 1e9 bytes). Check: 7B params * 2 bytes = 14GB.',
    'chinchilla_optimal returns a dict with keys "params" and "tokens". Make sure D* = exactly 10 * N* (integer).',
  ],
  'c9-l2': [
    'retained_tokens = int(raw * rate). embedding_matrix_bytes = vocab * hidden * bpp. domain_token_counts: each domain = total * fraction.',
    'The ValueError fires when abs(sum(mix.values()) - 1.0) > 1e-6. Compute sum first, check it, then multiply.',
    'All three functions are one-liners once you know the formula. The tricky part is the ValueError condition and the int() truncation.',
  ],
  'c9-l3': [
    'DPO loss = -log_sigmoid(beta*(log_pi_chosen - log_pi_ref_chosen) - beta*(log_pi_rejected - log_pi_ref_rejected)). Start with log_sigmoid.',
    'log_sigmoid(x) = -log(1 + exp(-x)) = x - log(1 + exp(x)) for large x. Use the negative form for numerical stability.',
    'At zero margin both terms cancel -> log_sigmoid(0) = log(0.5) -> loss = -log(0.5) = log(2). Check your implementation hits this exactly.',
  ],
  'c9-l4': [
    'grpo_advantages: compute mean and std of rewards. advantage = (r - mean) / std. If std==0 return all zeros.',
    'kl_penalty(log_pi, log_pi_ref): let diff = log_pi_ref - log_pi; return exp(diff) - diff - 1. This is always >= 0.',
    'grpo_loss = -mean(adv_i * log_prob_i) + kl_coeff * mean(kl_penalty_i). Average over all tokens in the response.',
  ],
  'c9-l5': [
    'gqa_groups = num_q_heads // num_kv_heads. For Llama 3 8B: 32 // 8 = 4.',
    'attn = hidden*(q_heads*head_dim) + hidden*(kv_heads*head_dim)*2 + (q_heads*head_dim)*hidden. Three projection matrices for Q, K, V plus O projection.',
    'ffn SwiGLU uses THREE matrices: gate (h*i), up (h*i), down (i*h). Not two. kv_cache = 2*kv_heads*head_dim*bpp*seq*layers.',
  ],
  'c9-l7': [
    'best_of_n = 1 - (1 - p)**n. majority_vote sums math.comb(n, k) * p**k * (1-p)**(n-k) for k from n//2 + 1 to n.',
    'samples_needed: if best_of_n(p, 1) >= target return 1; else n = math.ceil(math.log(1 - target) / math.log(1 - p)).',
    'cheaper_strategy: small cost = samples_needed(p_small, target) * 2 * params_small; large cost = 2 * params_large. Return small only if strictly cheaper.',
  ],

  'c9-d1': [
    'Run TrainingBudget(2e23).recommend() and compute model_gb = params * 2 / 1e9. Does it fit in 40GB?',
    'fixed_recommend must cap params at gpu_memory_gb * 1e9 / bytes_per_param. Then set tokens = compute_flops / (6 * params).',
    'Return a dict with "params" and "tokens". Verify: params*2/1e9 <= 40 AND 6*params*tokens <= 2e23.',
  ],
  'c9-l6': [
    'validate() follows the docstring exactly: four flags, four thresholds. Remember the coupling — if memory_ok is False, remaining memory is 0 and kv_cache_ok must be False as well.',
    'For the values, start with memory: params <= 40e9/2 = 20B. Then tokens <= 2e23/(6*params). KV cache = 2*kv_heads*head_dim*2*layers*64*2048 bytes — try 8 kv_heads, 128 head_dim, 32 layers and compute that GB against what the weights left free.',
    'DPO alignment: beta=0.1, log_pi_chosen_minus_ref > 0 (e.g. 0.5), log_pi_rejected_minus_ref < 0 (e.g. -0.5). All four constraints must hold at once, and your own validate() is run against your recipe as the final check.',
  ],
}
