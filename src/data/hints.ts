// Hint ladder — three escalating hints per level.
// Tier 1 (free): concept nudge. Unlocks after 2 failed runs.
// Tier 2 (-10% XP): points at the likely mistake.
// Tier 3 (-10% XP): near-answer — the key line or formula in words.
// XP cost keeps the testing effect intact: help is available, not free.

export const HINTS: Record<string, [string, string, string]> = {
  // Course 1
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
    'Route to the cheapest adequate option. The decision thresholds are spelled out in the docstring — encode them exactly.',
    'Check coverage first: high repeat coverage (>= 0.5) means a head cache serves most traffic. Then check the latency budget for live model feasibility.',
    'coverage >= 0.5 -> head-cache; else latency_budget_ms >= 150 -> live-model; otherwise teacher-student. Order of checks matters.',
  ],
  'c4-l2': [
    'A baseline report is honest bookkeeping: compute each metric from the logged requests exactly as defined in the docstring.',
    'Aggregate per the spec: means for latency, rates for success/failure. Watch division by zero on empty slices.',
    'Percentiles: sort values, index = ceil(p/100 * n) - 1 (or the docstring formula). Do not use np.percentile if the spec defines its own method.',
  ],
  'c4-l3': [
    'Serial latencies add: the component budgets must sum to no more than the end-to-end SLO.',
    'Allocate proportionally (or per the docstring weights), then verify: sum(budgets) <= total. Leave the specified headroom if the spec asks for it.',
    'Error budget = (1 - slo) x total requests (or minutes). Burn rate = actual failures / budget. Both formulas are one-liners once you read the units.',
  ],
  'c4-l4': [
    'The scorecard is a weighted sum: for each pattern, score = sum over criteria of weight x rating.',
    'Normalize exactly as the docstring says (weights sum to 1, or divide at the end). Highest total wins; ties break per the spec.',
    'Build a dict of pattern -> total, then max by value. Most failures here are using raw ratings when the spec wants weighted ones.',
  ],
  'c4-l5': [
    'Break-even: added cost per query vs added value per query. Value = quality lift x value per unit of quality.',
    'Cost per query = (input_tokens + output_tokens) x price_per_token. Compare against baseline cost, not zero.',
    'Break-even volume (if asked) = fixed_costs / (value_per_query - marginal_cost_per_query). Negative margin means never — return the sentinel the spec defines.',
  ],
  'c4-d1': [
    'Everyone gets an A — so the metric must be structurally unable to fail. Feed it a known-terrible prediction set mentally and trace the code.',
    'Check the denominator. Precision = TP / (TP + FP). If the code divides by (TP + FN) or by all positives, it is computing something else.',
    'Fix the denominator to predicted positives (TP + FP), and handle the zero-predictions case explicitly as the docstring specifies.',
  ],
  'c4-l6': [
    'Each risk entry needs likelihood, impact, score = likelihood x impact, a mitigation, and an owner. The boss is completeness, not creativity.',
    'Rank risks by score descending. The docstring lists which failure modes MUST appear — include the LLM-specific ones (injection, drift, cost).',
    'Follow the exact dict keys and score scale in the spec. Most failures are missing required fields or sorting ascending.',
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
    'The student trains to match the TEACHER outputs (soft scores), not the ground-truth labels.',
    'The loss compares student predictions to teacher scores — MSE or the docstring loss. Training loop: predict, compute loss, gradient step.',
    'Keep the student small as specified, train on teacher soft targets, and evaluate on held-out data. Check the convergence criterion in the spec.',
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

  'c7-d1': [
    'Under an outage this retry code multiplies traffic. Look for what is missing between attempts.',
    'Three missing pieces to check: exponential backoff (delay grows per attempt), jitter (randomized delay), and a hard retry cap.',
    'delay = base x 2^attempt x random_jitter, stop after max_retries. Compute total worst-case amplification — the test checks it stays bounded.',
  ],
  'c7-l6': [
    'A canary gate compares the canary against a CONTEMPORANEOUS baseline, not against history, and rolls back automatically on a significant spike.',
    'Compute error rates for both slices over the same window. Trigger only when the canary exceeds baseline by the specified margin/significance.',
    'Implement the exact decision rule in the docstring (margin or statistical test). Return the rollback decision and the evidence — the test checks both.',
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
  'c9-d1': [
    'Run TrainingBudget(2e23).recommend() and compute model_gb = params * 2 / 1e9. Does it fit in 40GB?',
    'fixed_recommend must cap params at gpu_memory_gb * 1e9 / bytes_per_param. Then set tokens = compute_flops / (6 * params).',
    'Return a dict with "params" and "tokens". Verify: params*2/1e9 <= 40 AND 6*params*tokens <= 2e23.',
  ],
  'c9-l6': [
    'Start with memory: params <= 40e9/2 = 20B. Then tokens = 2e23 / (6*params). Check kv_cache last.',
    'KV cache = 2*kv_heads*head_dim*2*layers*256*8192 bytes. Try 8 kv_heads, 128 head_dim, 32 layers -> compute that GB.',
    'DPO alignment: set beta=0.1, log_pi_chosen_minus_ref > 0 (e.g. 0.5), log_pi_rejected_minus_ref < 0 (e.g. -0.5). All four constraints must pass simultaneously.',
  ],
}
