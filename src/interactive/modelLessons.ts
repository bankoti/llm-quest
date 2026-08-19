import type { InteractiveLesson } from './types'
import { AttentionPlay, QkvPlay, CausalMaskPlay, PositionPlay, MultiHeadPlay, BackpropPlay, LrPlay, GenerationPlay, TemperaturePlay, EarlyStopPlay, BeamPlay } from './widgets'
const MODULE = 'model'
const MODULE_TITLE = 'How a language model works and learns'
export const MODEL_LESSONS: InteractiveLesson[] = [
  {
    slug:'attention-intuition', title:'Attention as Information Routing', emoji:'🔦', blurb:'Start with the problem attention solves before introducing Q, K, or V.', minutes:7,
    moduleId:MODULE, moduleTitle:MODULE_TITLE, prerequisites:['next-token-prediction'], outcomes:['Explain why tokens need information from other positions','Interpret attention weights as a weighted mixture'], concepts:['contextual representation','attention weight','weighted sum'],
    steps:[
      {kind:'concept',title:'A token’s meaning depends on its neighbors',lines:[
        'The embedding for a token is the same lookup every time, but its meaning in a sentence is not. “Bank” in “river bank” and “bank loan” must gather different clues from surrounding positions.',
        'Attention lets each position build a new representation by mixing information from other positions. It assigns a weight to each available token, then computes a weighted sum of their information vectors.',
        'Weights are non-negative and sum to 1. A weight near 1 means “use this position heavily”; a weight near 0 means “mostly ignore it.” The result is a context-dependent blend.',
      ],cta:'Route some information'},
      {kind:'widget',widget:AttentionPlay},
      {kind:'worked',title:'Resolve “it” with a weighted mixture',prompt:'In “The animal did not cross because it was tired,” the position “it” needs earlier context.',stages:[
        {label:'List candidates',body:'Earlier tokens include “animal,” “cross,” and “because.”'},
        {label:'Assign relevance',body:'The model can put a high weight on “animal” and low weights on unrelated tokens.'},
        {label:'Mix information',body:'The new representation for “it” includes information from “animal,” helping later layers resolve the reference.'},
      ],takeaway:'Attention is routing: score candidate sources, normalize the scores, then blend their information.'},
      {kind:'mcq',prompt:'What does one attention output at a position represent?',options:['A weighted mixture of information from available positions','The token with the largest ID','A token selected from the vocabulary','The average of model weights'],answer:0,explain:'Attention weights control how much each source position contributes.',nudge:'The output happens inside the model, before vocabulary prediction.'},
      {kind:'predict',prompt:'A pronoun strongly attends to a nearby noun.',questions:[{label:'effect of increasing that noun’s weight',options:['More of the noun’s information enters the pronoun representation','The noun is emitted next','The vocabulary shrinks'],answer:0,reveal:'Attention weights scale how much each source contributes.'}]},
    ],
  },
  {
    slug:'qkv-attention', title:'Queries, Keys, and Values', emoji:'🔑', blurb:'Give each attention vector one job, then assemble the equation.', minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['attention-intuition','dot-product-similarity','linear-layers'],outcomes:['State the roles of query, key, and value','Trace score, softmax, and weighted sum'],concepts:['query','key','value','attention score'],
    steps:[
      {kind:'concept',title:'Match with Q and K; retrieve V',lines:[
        'Every position is projected through three learned linear layers. Its query describes what it seeks. Its key describes what it can match. Its value carries the information it contributes if selected.',
        'Transposing a matrix swaps its rows and columns: if K has shape (T, D), its transpose K.T has shape (D, T). This makes inner dimensions meet: (T,D)@(D,T) gives a (T,T) score matrix, one score per query-key pair.',
        'For query position i and candidate j, score = Qᵢ · Kⱼ. Softmax converts all scores for query i into attention weights. The output at i is the weighted sum of value vectors Vⱼ.',
        'Q and K decide where to look; V decides what comes back. Keeping matching separate from content lets the model learn flexible routing.',
        'To prevent large dot products from pushing softmax toward near-zero gradients, scores are divided by the square root of d_k before softmax. For d_k=64 the divisor is 8. The full formula is: softmax(Q @ K.T / sqrt(d_k)) @ V.',
      ],cta:'Separate the roles'},
      {kind:'widget',widget:QkvPlay},
      {kind:'worked',title:'One query, two candidates',prompt:'A query has dot products 3 with key A and 1 with key B.',stages:[
        {label:'Score matches',body:'Raw relevance scores are [3, 1]. A is the stronger match.'},
        {label:'Normalize',body:'Softmax turns them into weights that sum to 1, roughly [0.88, 0.12].'},
        {label:'Retrieve values',body:'Output = 0.88×V_A + 0.12×V_B. Values, not keys, are mixed.'},
      ],takeaway:'Attention is soft lookup: query-key matching produces weights used to mix values.'},
      {kind:'mcq',prompt:'Which vectors form the attention output?',options:['Value vectors, weighted by query-key scores','Key vectors only','Query vectors only','Token IDs'],answer:0,explain:'Queries and keys produce weights; those weights scale values.',nudge:'Match with Q/K; retrieve V.'},
      {kind:'predict',prompt:'Q, K, and V each have shape (T, D).',questions:[
        {label:'Q @ K.T shape',options:['(T, T)','(T, D)','(D, D)'],answer:0,reveal:'Every query scores every key.'},
        {label:'softmax(scores) @ V shape',options:['(T, D)','(T, T)','(D,)'],answer:0,reveal:'Each position receives one D-number mixture.'},
      ]},
    ],
  },
  {
    slug:'causal-attention',title:'Why Attention Needs a Causal Mask',emoji:'🚧',blurb:'Understand the training-time leak before seeing the mask that blocks it.',minutes:7,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['qkv-attention'],outcomes:['Explain teacher forcing','Identify future-token leakage','Explain a causal mask'],concepts:['parallel training','teacher forcing','future-token leakage','causal mask'],
    steps:[
      {kind:'concept',title:'Training can see the answer unless we hide it',lines:[
        'During generation, future tokens do not exist. During training, the complete known sequence is available, and all positions are processed in parallel for efficiency.',
        'Position 3 is asked to predict token 4 while token 4 is physically present elsewhere in the tensor. Without a restriction, attention could read the answer. This is future-token leakage.',
        'A causal mask blocks scores pointing to future positions before softmax. Each position may attend to itself and the past. Feeding known earlier tokens during training is called teacher forcing.',
      ],cta:'Commit before the demo'},
      {kind:'mcq',prompt:'Why is a causal mask necessary during training?',options:['The full target sequence is present, so positions could copy future answers','It reduces vocabulary size','It assigns token IDs chronologically','It removes padding'],answer:0,explain:'Parallel training exposes the whole sequence. The mask restores the generation-time boundary.',nudge:'Is the answer token already present somewhere in the training tensor?'},
      {kind:'widget',widget:CausalMaskPlay},
      {kind:'worked',title:'Read one mask row',prompt:'At position 2 in a four-token sequence, which positions are allowed?',stages:[
        {label:'Include the past',body:'Positions 0 and 1 are known.'},{label:'Include the present',body:'Position 2 may attend to itself.'},{label:'Block the future',body:'Position 3 receives −∞ before softmax.'},
      ],takeaway:'The row is [allowed, allowed, allowed, blocked]; the future receives zero weight.'},
      {kind:'predict',prompt:'For a length-5 sequence, query is at position 1 (zero-indexed). Unlike the worked example which used position 2 (three allowed), position 1 can attend to positions 0 and 1 only.',questions:[{label:'how many positions may it attend to?',options:['2','1','4','5'],answer:0,reveal:'Positions 0 and 1: the past plus itself — two positions total.'}]},
    ],
  },
  {
    slug:'position-information',title:'How the Model Knows Order',emoji:'📍',blurb:'Prove that content alone loses order, then add position information.',minutes:6,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['attention-intuition'],outcomes:['Explain why content alone cannot encode order','Describe positional information'],concepts:['permutation','position encoding','word order','RoPE'],
    steps:[
      {kind:'concept',title:'A weighted sum does not know where a value sat',lines:[
        'Attention combines token representations with weighted sums. If representations contain only token identity, shuffling the same tokens preserves the same collection of content.',
        'But “dog bites man” and “man bites dog” have opposite meanings. The model needs a signal telling it where each token appeared.',
        'Position information is woven into token representations before attention. Modern models often use rotary position embeddings (RoPE), but the essential job is to make the same token at different positions distinguishable.',
      ],cta:'Commit before the demo'},
      {kind:'mcq',prompt:'Without position information, what is the problem with “dog bites man” vs “man bites dog”?',options:['The model sees the same token content without a reliable order signal','The tokenizer gives dog and man the same ID','Softmax sorts tokens','The causal mask reverses them'],answer:0,explain:'Token identity says what is present; position says where it occurs.',nudge:'The words are the same; only order changes.'},
      {kind:'widget',widget:PositionPlay},
      {kind:'predict',prompt:'Use the same word at positions 1 and 7.',questions:[{label:'after adding position information',options:['The representations differ because positions differ','They remain identical','Both token IDs change'],answer:0,reveal:'Identity stays the same while position-dependent representation differs.'}]},
    ],
  },
  {
    slug:'multihead-attention',title:'Why Attention Uses Multiple Heads',emoji:'🧠',blurb:'Let several small attention routes preserve different relationships at once.',minutes:7,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['qkv-attention','position-information'],outcomes:['Explain parallel attention heads','Relate hidden size and head dimension'],concepts:['attention head','head dimension','concatenation','output projection'],
    steps:[
      {kind:'concept',title:'One mixture can blur several jobs',lines:[
        'One attention head creates one routing pattern. A sentence may simultaneously need pronoun resolution, syntax, punctuation, and long-range topic information.',
        'Multi-head attention splits hidden features into H smaller head spaces. Each has its own Q, K, and V projections and can learn a different pattern. Outputs are concatenated and projected back to hidden size.',
        'If hidden size C is 512 and there are 8 heads, head dimension D = C/H = 64. Heads divide feature capacity; they do not multiply output width.',
      ],cta:'Compare head patterns'},
      {kind:'widget',widget:MultiHeadPlay},
      {kind:'worked',title:'Split and rejoin hidden features',prompt:'A model has hidden size 512 and 8 heads.',stages:[
        {label:'Split capacity',body:'512 ÷ 8 = 64 features per head.'},{label:'Run in parallel',body:'Each head produces shape (T, 64), potentially with a distinct pattern.'},{label:'Concatenate',body:'Joining 8 outputs restores width 512.'},
      ],takeaway:'Heads preserve several independent mixtures, then return to original width.'},
      {kind:'numeric',prompt:'Compute per-head width.',questions:[{label:'768 hidden ÷ 12 heads',answer:64,tolerance:0,unit:'features/head',reveal:'768/12 = 64. Twelve outputs concatenate to 768.'}]},
      {kind:'mcq',prompt:'Why can multiple heads help?',options:['They preserve distinct routing patterns before mixing','They make probabilities exceed 1','They remove positions','They train on separate datasets'],answer:0,explain:'Independent heads represent different relationships instead of averaging too early.',nudge:'Separate views first, combination later.'},
    ],
  },
  {
    slug:'transformer-block',title:'Inside One Transformer Block',emoji:'🏗️',blurb:'Assemble attention, a per-position network, residual paths, and normalization.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['multihead-attention'],outcomes:['Trace one transformer block','Separate attention, FFN, residual, and normalization'],concepts:['feed-forward network','activation','residual connection','normalization','residual stream'],
    steps:[
      {kind:'concept',title:'Routing, then processing',lines:[
        'Attention moves information between positions. A feed-forward network (FFN) then processes each position independently using learned linear layers and a nonlinear activation, commonly GELU or ReLU. Both suppress small or negative values; without any nonlinearity, stacked linear layers collapse to a single linear map, so depth would add nothing. Attention communicates; the FFN transforms.',
        'A residual connection adds the input back: x + f(x). This preserves an unchanged path and lets later blocks refine rather than replace the representation.',
        'Layer Normalization (LayerNorm) rescales each token representation to zero mean and unit variance. Modern transformers apply it before each sub-layer, called pre-normalization, which stabilizes training compared to the original post-normalization design. The running representation is the residual stream.',
      ],cta:'Trace the block'},
      {kind:'worked',title:'Follow one representation',prompt:'A token representation x enters a pre-normalization block.',stages:[
        {label:'Normalize and attend',body:'Attention gathers relevant information from other positions.'},{label:'First residual',body:'Add attention output back to x.'},{label:'Normalize and transform',body:'The FFN changes features independently per position.'},{label:'Second residual',body:'Add FFN output back. Shape stays (B,T,C).'},
      ],takeaway:'Attention mixes positions; the FFN mixes features; residuals preserve a stable highway.'},
      {kind:'mcq',prompt:'How do attention and the FFN differ?',options:['Attention exchanges information across positions; the FFN transforms each position independently','The FFN chooses IDs; attention computes loss','Both only normalize','Attention changes batch size'],answer:0,explain:'Their roles are communication across positions and processing within each position.',nudge:'Ask where information can move.'},
      {kind:'mcq',prompt:'Why add x + f(x)?',options:['It preserves a direct path for information and learning signals','It doubles sequence length','It makes all features equal','It removes weights'],answer:0,explain:'The identity path can bypass a transformation when needed.',nudge:'What remains if f(x) is poor?'},
      {kind:'predict',prompt:'Input is (B,T,C); the block preserves hidden width.',questions:[{label:'output shape',options:['(B,T,C)','(B,C,T)','(T,T)','(B,T)'],answer:0,reveal:'Residual additions require matching input and output shapes.'}]},
    ],
  },
  {
    slug:'inference-loop',title:'End-to-End Inference',emoji:'🔁',blurb:'Trace one generated token through the complete model.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['transformer-block'],outcomes:['Trace text through the model','Separate fixed weights from context'],concepts:['inference','model weights','context window','generation loop'],
    steps:[
      {kind:'concept',title:'The full path has two loops',lines:[
        'Inside one forward pass, token IDs become embeddings, pass through transformer blocks, and produce logits. Outside the model, the generation loop chooses a token, appends it, and invokes the next pass.',
        'Model weights stay fixed during inference. Prompt and generated tokens form the context, which changes each cycle. The model does not permanently learn from the conversation.',
        'A context window is the maximum token positions processed at once. Software must reject, truncate, summarize, or use another memory mechanism when it overflows.',
      ],cta:'Trace a token'},
      {kind:'worked',title:'One complete next-token cycle',prompt:'The prompt “Water freezes at” is ready.',stages:[
        {label:'Encode',body:'Tokenizer maps text to IDs.'},{label:'Represent',body:'Embeddings and positions create vectors.'},{label:'Transform',body:'Blocks build contextual hidden states.'},{label:'Score and choose',body:'The final state produces logits, probabilities, and a choice.'},{label:'Repeat',body:'Append the token and run again.'},
      ],takeaway:'The network predicts one distribution per cycle; the outer loop builds the sequence.'},
      {kind:'widget',widget:GenerationPlay},
      {kind:'mcq',prompt:'What changes from one generated token to the next?',options:['Context grows; model weights stay fixed','The model retrains','Vocabulary changes','Tokenizer learns merges'],answer:0,explain:'Inference reuses fixed parameters. Only context and temporary activations change.',nudge:'Training changes weights; inference uses them.'},
      {kind:'predict',prompt:'Run greedy decoding twice with identical computation.',questions:[{label:'result',options:['The same sequence','A random sequence','Different IDs but same text'],answer:0,reveal:'Greedy chooses the same argmax at each step.'}]},
    ],
  },
  {
    slug:'training-objective',title:'How Training Examples Are Built',emoji:'🎯',blurb:'Turn known text into next-token questions and measurable loss.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['inference-loop'],outcomes:['Create shifted input-target pairs','Explain loss','Count targets'],concepts:['training example','input-target shift','loss','cross-entropy intuition','batch'],
    steps:[
      {kind:'concept',title:'Known text supplies its own answer key',lines:[
        'Training starts with token sequences from data. At each position, earlier tokens are input and the actual next token is the target. A ten-token sequence provides nine targets.',
        'The model assigns probability to every possible next token. Loss measures how poor those probabilities were. Cross-entropy is low when the true target has high probability and high when it has low probability.',
        'A batch groups many sequences so predictions can be computed together. Position losses are usually averaged into one batch loss before updates.',
      ],cta:'Build the answer key'},
      {kind:'worked',title:'Shift one sequence',prompt:'Tokens are [BOS, cats, sleep, EOS].',stages:[
        {label:'Build input',body:'Input = [BOS, cats, sleep].'},{label:'Build targets',body:'Targets = [cats, sleep, EOS].'},{label:'Align',body:'BOS predicts cats; cats predicts sleep; sleep predicts EOS.'},
      ],takeaway:'Shift by one. Four known tokens provide three supervised questions.'},
      {kind:'numeric',prompt:'Count next-token targets.',questions:[{label:'targets from 10 tokens',answer:9,tolerance:0,reveal:'The first 9 positions predict the following token.'}]},
      {kind:'mcq',prompt:'When is cross-entropy loss lowest?',options:['When the model gives high probability to the actual target','When every token is equally likely','When the largest logit is negative','When input equals target'],answer:0,explain:'Cross-entropy rewards probability on the known correct token.',nudge:'Loss measures surprise at the answer key.'},
    ],
  },
  {
    slug:'gradients',title:'Gradients: Which Way Should We Change?',emoji:'🧗',blurb:'Build gradient intuition as a local slope before backpropagation.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['training-objective'],outcomes:['Describe local sensitivity','Choose update direction','Use gradient magnitude'],concepts:['parameter','gradient','slope','gradient descent'],
    steps:[
      {kind:'concept',title:'A gradient is a local “what if?”',lines:[
        'Model weights are adjustable numbers, also called parameters. After computing loss, we need to know how a small change to each weight would change that loss.',
        'A gradient is that local sensitivity. A positive gradient means increasing the weight raises loss, so gradient descent moves downward. A negative gradient means increasing the weight reduces loss, so the update moves upward.',
        'Gradient magnitude indicates sensitivity. It is a local guide, not a guarantee about far-away values.',
      ],cta:'Follow the slope'},
      {kind:'worked',title:'Move opposite the gradient',prompt:'Weight w=2.0 has gradient +0.5. Learning rate is 0.1.',stages:[
        {label:'Read sign',body:'Positive gradient: increasing w raises loss.'},{label:'Compute step',body:'0.1×0.5 = 0.05.'},{label:'Move downhill',body:'w_new = 2.0−0.05 = 1.95.'},
      ],takeaway:'weight ← weight − learning_rate × gradient.'},
      {kind:'mcq',prompt:'A weight has gradient −2. Which way does gradient descent move it?',options:['Upward, because subtracting a negative increases it','Downward because every update subtracts','It does not move','Sign is irrelevant'],answer:0,explain:'w − lr×(−2) is larger than w.',nudge:'Subtracting a negative does what?'},
      {kind:'numeric',prompt:'Apply one update.',questions:[{label:'w=3, gradient=4, lr=0.25 → new w',answer:2,tolerance:0,reveal:'3−0.25×4=2.'}]},
    ],
  },
  {
    slug:'backpropagation',title:'Backpropagation and Residual Paths',emoji:'↩️',blurb:'Trace blame backward without assuming calculus notation.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['gradients','transformer-block'],outcomes:['Explain chained sensitivities','Explain vanishing gradients','Explain residual paths'],concepts:['backpropagation','chain rule intuition','vanishing gradient','residual gradient path'],
    steps:[
      {kind:'concept',title:'Every operation passes sensitivity backward',lines:[
        'The forward pass records how values were computed. Backpropagation starts from loss and moves backward, using each operation’s local sensitivity to determine how earlier values contributed.',
        'Sensitivities multiply through a chain. If ten stages each pass one quarter of the signal, the earliest receives 0.25¹⁰, less than one millionth. This is a vanishing gradient.',
        'A residual addition x + f(x) provides a direct identity path with multiplier 1. Some gradient travels without repeated shrinking.',
      ],cta:'Watch the signal'},
      {kind:'widget',widget:BackpropPlay},
      {kind:'worked',title:'Compare a chain with a shortcut',prompt:'Three transformations each pass back half the signal.',stages:[
        {label:'Plain chain',body:'1×0.5×0.5×0.5 = 0.125.'},{label:'Residual path',body:'The shortcut contributes a path with multiplier 1.'},{label:'Interpret',body:'Earlier layers receive a stronger signal.'},
      ],takeaway:'Residuals preserve information forward and learning signal backward.'},
      {kind:'mcq',prompt:'What causes a vanishing gradient?',options:['Repeated multiplication by values below 1 shrinks the signal','Too few IDs','Probabilities sum to 1','Several examples in a batch'],answer:0,explain:'Small sensitivities compound multiplicatively.',nudge:'Think multiplication, not addition.'},
      {kind:'numeric',prompt:'Three stages each pass back 0.5.',questions:[{label:'signal from initial 1',answer:0.125,tolerance:0.001,reveal:'1×0.5³=0.125.'}]},
    ],
  },
  {
    slug:'optimizer-loop',title:'The Optimizer Loop',emoji:'⚙️',blurb:'Connect forward, loss, backward, and update into one cycle.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['backpropagation'],outcomes:['Order training phases','Explain learning rate','Explain gradient reset'],concepts:['optimizer','learning rate','zero_grad','gradient accumulation'],
    steps:[
      {kind:'concept',title:'Four phases repeat',lines:[
        'One training step has four phases: forward pass produces predictions; loss compares them with targets; backward computes gradients; optimizer step updates weights.',
        'Learning rate scales every update. Too small means barely visible movement. Too large can overshoot and make loss oscillate or diverge. In practice, training schedules warm up the learning rate from near-zero over the first few hundred steps, then decay it following a cosine curve or stepped schedule, rather than holding it fixed throughout.',
        'Many frameworks add new gradients into existing buffers. Resetting prevents accidental accumulation across batches.',
      ],cta:'Tune the step'},
      {kind:'worked',title:'One complete step',prompt:'A batch is ready.',stages:[
        {label:'Reset',body:'Clear old gradient buffers.'},{label:'Forward and loss',body:'Run the batch and measure error.'},{label:'Backward',body:'Compute gradients.'},{label:'Step',body:'Update weights.'},
      ],takeaway:'Reset → forward → loss → backward → step.'},
      {kind:'mcq',prompt:'Loss stays almost flat from the beginning. What should you check first?',options:['Whether learning rate is zero or too small','Whether batch size is odd','Whether IDs are alphabetical','Whether probabilities are negative'],answer:0,explain:'Tiny updates produce a flat curve. Too-large rates more often spike.',nudge:'Flat suggests movement is too small.'},
      {kind:'widget',widget:LrPlay},
      {kind:'mcq',prompt:'Why clear gradients before the next ordinary batch?',options:['Old and new batch gradients would otherwise accumulate','It deletes prior loss','It runs softmax','It frees weights'],answer:0,explain:'Backward calls add to existing buffers unless reset.',nudge:'The buffer is additive.'},
    ],
  },
  {
    slug:'validation-generalization',title:'Validation and Generalization',emoji:'📉',blurb:'Know whether the model learned a pattern or memorized examples.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['optimizer-loop'],outcomes:['Distinguish data splits','Diagnose overfitting','Choose early stopping'],concepts:['training set','validation set','test set','generalization','overfitting'],
    steps:[
      {kind:'concept',title:'Seen examples cannot judge transfer',lines:[
        'Training loss measures examples used to update the model. A flexible model can memorize them, so low training loss alone does not prove useful learning.',
        'A validation set is withheld from updates and guides choices such as training duration. If validation loss rises while training loss falls, the model is overfitting.',
        'A test set stays untouched until final evaluation. Choosing models based on test results leaks information and makes the reported result optimistic.',
        'Dropout is a common regularization technique: during training, a random fraction of activations is zeroed, preventing the model from relying on any single feature path. It is disabled at inference time.',
      ],cta:'Diagnose before the demo'},
      {kind:'mcq',prompt:'Training loss falls while validation loss rises. What is happening?',options:['The model is overfitting training examples','The model is necessarily underfit','The tokenizer changed','The test set is improving'],answer:0,explain:'Performance on seen data improves while transfer to unseen data worsens.',nudge:'Compare seen and unseen examples.'},
      {kind:'widget',widget:EarlyStopPlay},
      {kind:'worked',title:'Use each split for one job',prompt:'Choose when to stop and then report quality.',stages:[
        {label:'Train',body:'Use training data for gradients.'},{label:'Select',body:'Use validation data for stopping and settings.'},{label:'Report',body:'Use untouched test data after choices are fixed.'},
      ],takeaway:'Train learns, validation guides, test reports.'},
      {kind:'predict',prompt:'Choose clean test-set use.',questions:[{label:'correct strategy',options:['Evaluate once after all choices are fixed','Stop on test loss every epoch','Add test data to training'],answer:0,reveal:'A test set is credible only if it did not influence development.'}]},
    ],
  },
  {
    slug:'decoding-basics',title:'Greedy Decoding and Sampling',emoji:'🎲',blurb:'Choose between consistency and variation after prediction.',minutes:7,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['inference-loop'],outcomes:['Distinguish greedy and sampling','Choose by task','Locate randomness'],concepts:['greedy decoding','sampling','random seed','determinism'],
    steps:[
      {kind:'concept',title:'Prediction and choice are separate',lines:[
        'The model produces a probability distribution. Greedy decoding chooses the highest-probability token every time and is deterministic under identical computation.',
        'Sampling randomly draws according to probabilities. Likely tokens appear more often, but alternatives sometimes appear, producing useful diversity.',
        'Temperature changes the distribution before sampling. A seed may repeat sampling in a fixed environment, but greedy removes the random draw.',
      ],cta:'Compare generations'},
      {kind:'widget',widget:GenerationPlay},{kind:'widget',widget:TemperaturePlay},
      {kind:'mcq',prompt:'A grading tool must return the same completion for the same input. Which strategy?',options:['Greedy decoding','High-temperature sampling','Uniform choice','Sampling every token'],answer:0,explain:'Greedy always selects the argmax and adds no random draw.',nudge:'Which removes randomness?'},
      {kind:'predict',prompt:'Sample five completions at temperature 1.',questions:[{label:'expected result',options:['They may differ because choices are sampled','They must be identical','Only IDs differ'],answer:0,reveal:'Random sampling can introduce variation at every position.'}]},
    ],
  },
  {
    slug:'decoding-controls',title:'Top-k, Top-p, and Beam Search',emoji:'🌲',blurb:'Add guardrails and search after greedy and sampling are clear.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['decoding-basics'],outcomes:['Explain top-k and top-p','Explain beam search','Choose controls by task'],concepts:['top-k','top-p nucleus','cumulative probability','beam search'],
    steps:[
      {kind:'concept',title:'Filter choices or search sequences',lines:[
        'Top-k keeps the k highest-probability tokens, then samples. Candidate count stays fixed even when the model is certain or uncertain.',
        'Top-p keeps the smallest set whose cumulative probability reaches p. It shrinks for concentrated distributions and grows for flat ones.',
        'Beam search keeps several whole partial sequences and expands promising ones. It is deterministic but often favors generic wording in open-ended generation.',
      ],cta:'Walk a search tree'},
      {kind:'widget',widget:BeamPlay},
      {kind:'worked',title:'Build a nucleus',prompt:'Sorted probabilities are [0.50, 0.25, 0.12, 0.08, 0.05], p=0.90.',stages:[
        {label:'Accumulate',body:'0.50 → 0.75 → 0.87 → 0.95.'},{label:'Stop',body:'Three total only 0.87, so include the fourth.'},{label:'Sample',body:'Sample among four; exclude the fifth.'},
      ],takeaway:'Top-p adapts candidate count to probability concentration.'},
      {kind:'mcq',prompt:'Why can beam search sound generic?',options:['It favors high-probability sequences, often common phrases','It samples uniformly','It deletes low IDs','It raises temperature'],answer:0,explain:'Specific or surprising text often scores lower than safe common wording.',nudge:'What wording is common in training data?'},
      {kind:'predict',prompt:'Raise temperature with top-p=0.9.',questions:[{label:'nucleus size',options:['Usually grows as probability spreads','Always shrinks to one','Cannot change'],answer:0,reveal:'A flatter distribution needs more tokens to reach 90%.'}]},
    ],
  },
  {
    slug:'model-capstone',title:'Model Mechanics Checkpoint',emoji:'🏁',blurb:'Retrieve and connect the complete path before applications.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['validation-generalization','decoding-controls'],outcomes:['Trace inference','Trace training','Diagnose boundary confusions'],concepts:['integration','inference trace','training trace'],
    steps:[
      {kind:'concept',title:'Two traces, one model',lines:['Inference uses fixed weights to turn context into next-token distributions. Training adds targets, loss, backpropagation, and optimizer updates to change those weights.','Three practitioner concepts extend what you have built. Few-shot prompting places example input-output pairs in the prompt to demonstrate desired behavior without updating weights. Chat models structure their context as system, user, and assistant turns; the system prompt sets standing instructions before the user speaks. Hallucination names the failure mode where a model produces confident-sounding text not grounded in training data or context; it is a structural property of next-token prediction, not an edge case.','This checkpoint introduces no new mechanism. It mixes earlier concepts because retrieving and connecting them makes knowledge usable.'],cta:'Start the checkpoint'},
      {kind:'mcq',prompt:'Which path describes one inference cycle?',options:['text → IDs → embeddings → blocks → logits → probabilities → token choice','text → loss → gradient → ID','embedding → tokenizer → optimizer → text','probability → update → vocabulary'],answer:0,explain:'That is the forward and decoding path. Loss and gradients belong to training.',nudge:'Start with text and end with a token choice.'},
      {kind:'mcq',prompt:'Which event changes model weights?',options:['An optimizer step during training','Appending a generated token','Softmax during inference','Tokenization'],answer:0,explain:'Only a training update changes parameters.',nudge:'Which applies gradients?'},
      {kind:'predict',prompt:'Retrieve the roles.',questions:[
        {label:'Q and K',options:['produce match scores','carry retrieved content','choose IDs'],answer:0,reveal:'Query-key dot products determine attention weights.'},
        {label:'V',options:['carries content mixed by weights','blocks future positions','computes loss'],answer:0,reveal:'Values are retrieved after matching.'},
        {label:'validation set',options:['guides choices without updating weights','provides final reporting only','is used for every gradient'],answer:0,reveal:'Validation supports selection; test stays untouched for reporting.'},
      ]},
      {kind:'numeric',prompt:'A sequence has 6 known tokens.',questions:[{label:'next-token targets',answer:5,tolerance:0,reveal:'Every token except the first is a target for the preceding context.'}]},
    ],
  },
]
