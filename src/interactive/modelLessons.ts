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
      {kind:'predict',prompt:'A pronoun strongly attends to a nearby noun.',questions:[{label:'effect of increasing that noun’s weight',options:['More of the noun’s information enters the pronoun representation','The noun is emitted next','The vocabulary shrinks'],answer:0,reveal:'Attention weights scale how much each source contributes.'},{label:'if its attention weight falls near zero',options:['Almost none of its value enters the mixture','It is deleted from the vocabulary','It must be generated next'],answer:0,reveal:'Near-zero attention weight makes that source contribute almost nothing.'}]},
    ],
  },
  {
    slug:'qkv-attention', title:'Queries, Keys, and Values', emoji:'🔑', blurb:'Give each attention vector one job, then assemble the equation.', minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['attention-intuition','dot-product-similarity','linear-layers'],outcomes:['State the roles of query, key, and value','Trace score, softmax, and weighted sum'],concepts:['query','key','value','attention score'],
    steps:[
      {kind:'concept',title:'Match with Q and K; retrieve V',lines:[
        'Every position is projected through three learned linear layers. Its query describes what it seeks. Its key describes what it can match. Its value carries the information it contributes if selected.',
        'K.T is the transpose of K: if K has shape (T, D), then K.T has shape (D, T), making inner dimensions meet for Q@K.T: (T,D)@(D,T) gives a (T,T) score matrix with one score per query-key pair.',
        'For query position i and candidate j, score = Qᵢ · Kⱼ. Softmax converts those scores into attention weights. The output is the weighted sum of value vectors.',
        'Q and K decide where to look; V decides what comes back.',
      ],cta:'Separate the roles'},
      {kind:'widget',widget:QkvPlay},
      {kind:'worked',title:'One query, two candidates',prompt:'A query has dot products 3 with key A and 1 with key B.',stages:[
        {label:'Score matches',body:'Raw relevance scores are [3, 1]. A is the stronger match.'},
        {label:'Normalize',body:'Softmax turns them into weights that sum to 1, roughly [0.88, 0.12].'},
        {label:'Retrieve values',body:'Output = 0.88×V_A + 0.12×V_B. Values, not keys, are mixed.'},
      ],takeaway:'Attention is soft lookup: query-key matching produces weights used to mix values.'},
      {kind:'mcq',prompt:'Which vectors form the attention output?',options:['Value vectors, weighted by query-key scores','Key vectors, weighted by query-value scores','Query vectors, averaged uniformly','Only the single value vector with the highest score'],answer:0,explain:'Queries and keys produce weights; those weights scale values.',nudge:'Match with Q/K; retrieve V.'},
      {kind:'concept',title:'Why scores are scaled before softmax',lines:[
        'Large dot products push softmax toward near-zero gradients, making learning unstable. Scores are divided by the square root of d_k before softmax: softmax(Q @ K.T / sqrt(d_k)) @ V.',
        'This scaling is called scaled dot-product attention. Every attention formula you encounter in papers and code uses it.',
      ],cta:'Compute the divisor'},
      {kind:'numeric',prompt:'Compute the scaling divisor.',questions:[{label:'d_k = 64 → divisor = sqrt(64)',answer:8,tolerance:0,unit:'',reveal:'sqrt(64) = 8. Each score is divided by 8 before softmax.'}]},
      {kind:'worked',title:'A full attention computation, by hand',prompt:'One query q=[1,0] meets keys k1=[2,0], k2=[0,2] and values v1=[10,0], v2=[0,10]. Here d_k=4, so scores are divided by 2.',stages:[
        {label:'Raw scores',body:'q dot k1 = 1x2 + 0x0 = 2. q dot k2 = 1x0 + 0x2 = 0.',code:'scores = q @ K.T          # [2, 0]'},
        {label:'Scale',body:'Divide by sqrt(4) = 2. Scaled scores are [1, 0].',code:'scaled = scores / sqrt(d_k)  # [1, 0]'},
        {label:'Softmax',body:'e^1 = 2.72 and e^0 = 1. Weights are [2.72/3.72, 1/3.72] = [0.73, 0.27].',code:'w = softmax(scaled)       # [0.73, 0.27]'},
        {label:'Mix values',body:'0.73x[10,0] + 0.27x[0,10] = [7.3, 2.7]. The query mostly retrieves v1.',code:'out = w @ V               # [7.3, 2.7]'},
      ],takeaway:'Score, scale, softmax, mix. Every attention head in every transformer runs exactly this arithmetic, just wider.'},
      {kind:'numeric',prompt:'Your turn. Same keys and values, new query q=[0,1]: k1=[2,0], k2=[0,2], v1=[10,0], v2=[0,10], divide scores by 2.',questions:[
        {label:'raw score q dot k1',answer:0,tolerance:0,reveal:'0x2 + 1x0 = 0.'},
        {label:'raw score q dot k2',answer:2,tolerance:0,reveal:'0x0 + 1x2 = 2.'},
        {label:'softmax weight on k2 after scaling (2 decimals)',answer:0.73,tolerance:0.02,reveal:'Scaled scores are [0, 1]; e^1/(e^0+e^1) = 0.73.'},
        {label:'first number of the output',answer:2.7,tolerance:0.2,reveal:'0.27x10 + 0.73x0 = 2.7. This query retrieves mostly v2 instead.'},
      ]},
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
      {kind:'predict',prompt:'For a length-5 sequence, query is at position 1 (zero-indexed). Unlike the worked example which used position 2 (three allowed), position 1 can attend to positions 0 and 1 only.',questions:[{label:'how many positions may it attend to?',options:['2 positions','1 position','4 positions','5 positions'],answer:0,reveal:'Positions 0 and 1: the past plus itself — two positions total.'},{label:'query at position 4 may attend to',options:['all 5 positions','only position 4','positions 0 through 3 only'],answer:0,reveal:'The final position can use every earlier position plus itself.'}]},
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
      {kind:'predict',prompt:'Use the same word at positions 1 and 7.',questions:[{label:'after adding position information',options:['The representations differ because positions differ','They remain identical','Both token IDs change'],answer:0,reveal:'Identity stays the same while position-dependent representation differs.'},{label:'without position information',options:['The model cannot distinguish them','Only one copy appears','Attention is disabled'],answer:0,reveal:'Without position encoding, identical tokens at different positions produce identical representations.'}]},
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
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['multihead-attention','causal-attention'],outcomes:['Trace one transformer block','Separate attention, FFN, residual, and normalization'],concepts:['feed-forward network','activation','residual connection','normalization','residual stream'],
    steps:[
      {kind:'concept',title:'Routing, then processing',lines:[
        'Attention moves information between positions. A feed-forward network (FFN) then processes each position independently using learned linear layers and a nonlinear activation, commonly GELU or ReLU. Both suppress small or negative values; without any nonlinearity, stacked linear layers collapse to a single linear map, so depth would add nothing. Attention communicates; the FFN transforms.',
        'A residual connection adds the input back: x + f(x). This preserves an unchanged path and lets later blocks refine rather than replace the representation.',
        'Layer Normalization (LayerNorm) rescales each token representation to zero mean and unit variance. Modern transformers apply it before each sub-layer, called pre-normalization, which stabilizes training compared to the original post-normalization design. The running representation is the residual stream.',
        'Modern FFNs often use a gated activation called SwiGLU instead of plain ReLU or GELU: one linear projection passes through a smooth nonlinearity and multiplies a second projection, so the network can scale each feature up or down continuously. LLaMA-family and most recent frontier models use it.',
      ],cta:'Trace the block'},
      {kind:'worked',title:'Follow one representation',prompt:'A token representation x enters a pre-normalization block.',stages:[
        {label:'Normalize and attend',body:'Attention gathers relevant information from other positions.'},{label:'First residual',body:'Add attention output back to x.'},{label:'Normalize and transform',body:'The FFN changes features independently per position.'},{label:'Second residual',body:'Add FFN output back. Shape stays (B,T,C).'},
      ],takeaway:'Attention mixes positions; the FFN mixes features; residuals preserve a stable highway.'},
      {kind:'worked',title:'LayerNorm, by hand',prompt:'Normalize the 4-number representation [2, 4, 6, 8].',stages:[
        {label:'Mean',body:'(2+4+6+8)/4 = 5.'},
        {label:'Variance',body:'Squared distances from 5 are [9, 1, 1, 9]; their average is 5.'},
        {label:'Normalize',body:'Each value becomes (x - 5)/sqrt(5). The first entry: (2-5)/2.24 = -1.34.'},
        {label:'Scale and shift',body:'Learned per-feature parameters then rescale the result, so the network can undo normalization wherever that helps.'},
      ],takeaway:'LayerNorm is just mean, variance, rescale — computed separately for every token.'},
      {kind:'numeric',prompt:'Normalize [1, 3, 5, 7] the same way.',questions:[
        {label:'mean',answer:4,tolerance:0,reveal:'(1+3+5+7)/4 = 4.'},
        {label:'variance',answer:5,tolerance:0,reveal:'Squared distances [9, 1, 1, 9] average to 5.'},
        {label:'normalized last entry (2 decimals)',answer:1.34,tolerance:0.02,reveal:'(7-4)/sqrt(5) = 3/2.24 = 1.34.'},
      ]},
      {kind:'mcq',prompt:'How do attention and the FFN differ?',options:['Attention exchanges information across positions; the FFN transforms each position independently','The FFN exchanges information across positions; attention transforms each position independently','They are the same operation under different names','Attention transforms features; the FFN moves information between batches'],answer:0,explain:'Their roles are communication across positions and processing within each position.',nudge:'Ask where information can move.'},
      {kind:'mcq',prompt:'Why add x + f(x)?',options:['It preserves a direct path for information and learning signals','It doubles sequence length','It makes all features equal','It removes weights'],answer:0,explain:'The identity path can bypass a transformation when needed.',nudge:'What remains if f(x) is poor?'},
      {kind:'predict',prompt:'Input is (B,T,C); the block preserves hidden width.',questions:[{label:'output shape',options:['(B,T,C)','(B,C,T)','(T,T)','(B,T)'],answer:0,reveal:'Residual additions require matching input and output shapes.'},{label:'if the FFN output shape mismatched x',options:['The residual addition x + f(x) would fail','Training would be faster','Vocabulary size would change'],answer:0,reveal:'Addition requires identical shapes; a dimension mismatch is a runtime error.'}]},
    ],
  },
  {
    slug:'parameter-counts',title:'Counting Parameters',emoji:'🔢',blurb:'Trace where the numbers in a model headline come from, by hand.',minutes:7,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['transformer-block'],outcomes:['Count embedding parameters','Count per-block parameters','Verify a published total'],concepts:['parameter count','embedding table','projection size','weight sharing'],
    steps:[
      {kind:'concept',title:'Two slabs per block plus one table',lines:[
        'A transformer model\'s parameter count comes from a small set of learned matrices. The token embedding table has V rows of width C. A position table, if present, adds context_length times C entries.',
        'Inside each block, attention uses four C-by-C projections (Q, K, V, output). The FFN typically expands to 4C and returns: two matrices of size C times 4C. LayerNorm adds a tiny fraction.',
        'Many models reuse the token embedding table as the output projection (weight tying), adding zero extra parameters for the final logit layer.',
      ],cta:'Count GPT-2 small'},
      {kind:'mcq',prompt:'A 12-block model with width 768 uses weight tying. Where do most parameters live?',options:['In the repeated per-block projections (attention + FFN)','In the final softmax','In the tokenizer','In the position table alone'],answer:0,explain:'12 blocks of attention and FFN projections total about 85M versus 39M for embeddings.',nudge:'Which component is repeated 12 times?'},
      {kind:'numeric',prompt:'Quick parameter retrieval.',questions:[
        {label:'4 attention projections, each 768x768, per block (millions)',answer:2.36,tolerance:0.05,reveal:'4 x 768 x 768 = 2.36M. Recall from the parameter-counts lesson.'},
      ]},
      {kind:'mcq',prompt:'GPT-2 reuses the embedding table as the output head. What does weight tying save?',options:['An entire V x C matrix of additional parameters','All block parameters','The position table','The FFN weights'],answer:0,explain:'Without tying, a separate (V, C) output matrix would add another 38.6M parameters.',nudge:'Which matrix would otherwise appear twice?'},
      {kind:'predict',prompt:'A new model doubles width to 1536 with the same 12 blocks and vocab.',questions:[
        {label:'per-block parameter change',options:['Roughly quadruples (C squared appears in projections)','Doubles','Stays the same'],answer:0,reveal:'Attention projections are C x C, so doubling C quadruples each projection.'},
        {label:'embedding table change',options:['Doubles (V stays, C doubles)','Quadruples','Unchanged'],answer:0,reveal:'The embedding table is V x C; doubling C doubles it linearly.'},
      ]},
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
      {kind:'predict',prompt:'Run greedy decoding twice with identical computation.',questions:[{label:'result',options:['The same sequence','A random sequence','Different IDs but same text'],answer:0,reveal:'Greedy chooses the same argmax at each step.'},{label:'if you switch to sampling with temperature 1',options:['Results may differ across runs','Results must still match','The model retrains between runs'],answer:0,reveal:'Sampling introduces randomness; different draws can yield different sequences.'}]},
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
      {kind:'worked',title:'Put numbers on the loss',prompt:'Cross-entropy at one position is -log p(target), using the natural log.',stages:[
        {label:'Confident and right',body:'p(target) = 0.9 gives loss -ln(0.9) = 0.11. Almost no surprise.'},
        {label:'Unsure',body:'p(target) = 0.25 gives loss -ln(0.25) = 1.39.'},
        {label:'Confident and wrong',body:'p(target) = 0.01 gives loss -ln(0.01) = 4.6. Misplaced confidence is punished hard.'},
        {label:'Sanity-check a fresh model',body:'Before training, the model should be near-uniform over the vocabulary: p = 1/V, so loss = ln(V). For V = 50,000 that is about 10.8. A very different starting loss usually means a bug.'},
      ],takeaway:'Loss is -log of the probability given to the right answer; ln(V) is the honest starting point.'},
      {kind:'numeric',prompt:'Compute both losses (natural log, 2 decimals).',questions:[
        {label:'p(target) = 0.5, loss',answer:0.69,tolerance:0.02,reveal:'-ln(0.5) = 0.69: exactly one coin flip of surprise.'},
        {label:'vocabulary of 8, untrained uniform model, expected loss',answer:2.08,tolerance:0.03,reveal:'ln(8) = 2.08. Watch training start here and fall.'},
      ]},
    ],
  },
  {
    slug:'training-data',title:'What the Model Is Made Of: Data',emoji:'🌐',blurb:'Follow raw web text into a training mixture, and see why the mixture is the model.',minutes:7,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['training-objective'],outcomes:['Describe the pipeline from crawl to training tokens','Explain filtering and deduplication','Reason about mixture proportions'],concepts:['web crawl','filtering','deduplication','data mixture','training corpus'],
    steps:[
      {kind:'concept',title:'From crawl to corpus',lines:[
        'Pretraining data starts as raw crawled web pages plus curated sources: books, code, encyclopedias, forums. Raw crawl is mostly unusable — boilerplate, spam, duplicated pages, broken encoding.',
        'A filtering pipeline keeps pages that look like readable prose, drops machine-generated junk, and removes personal data. Deduplication then deletes near-identical documents, because repeated text gets memorized verbatim instead of generalized.',
        'What survives is weighted into a mixture: so much web, so much code, so much books. The model can only learn patterns that survive this pipeline. A useful mental model: a language model is a lossy compression of its training mixture.',
      ],cta:'Weigh the mixture'},
      {kind:'worked',title:'Budget one training run',prompt:'You have a 100B-token budget split 70% web, 20% code, 10% books.',stages:[
        {label:'Split',body:'70B web tokens, 20B code, 10B books.'},
        {label:'Read the consequence',body:'The model sees twice as much code as books. Expect stronger code completion than literary style.'},
        {label:'Change the mixture',body:'The same architecture retrained at 40% code is a different model. Mixture is a first-class design choice, not a detail.'},
      ],takeaway:'Architecture is the engine; the mixture decides what the engine learns.'},
      {kind:'mcq',prompt:'Why deduplicate before training?',options:['Repeated documents push the model toward memorizing them verbatim','It makes tokenization reversible','It reduces vocabulary size','GPUs require unique inputs'],answer:0,explain:'Duplicates concentrate probability on specific strings, hurting generalization and enabling regurgitation of training text.',nudge:'What does seeing one page a thousand times teach?'},
      {kind:'mcq',prompt:'A large model answers questions about a niche topic poorly. Most likely cause?',options:['The topic was rare in, or filtered out of, the training mixture','A broken softmax','A learning rate that was an even number','A context window that is too wide'],answer:0,explain:'Capacity cannot recover patterns the data never carried.',nudge:'Can a model learn what it never saw?'},
      {kind:'numeric',prompt:'A mixture is 60% web, 30% code, 10% books over 200B tokens.',questions:[
        {label:'code tokens, in billions',answer:60,tolerance:0,reveal:'0.30 x 200B = 60B.'},
      ]},
    ],
  },
  {
    slug:'gradients',title:'Gradients: Which Way Should We Change?',emoji:'🧗',blurb:'Build gradient intuition as a local slope before backpropagation.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['training-objective','training-data'],outcomes:['Describe local sensitivity','Choose update direction','Use gradient magnitude'],concepts:['parameter','gradient','slope','gradient descent'],
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
      {kind:'predict',prompt:'Choose clean test-set use.',questions:[{label:'correct strategy',options:['Evaluate once after all choices are fixed','Stop on test loss every epoch','Add test data to training'],answer:0,reveal:'A test set is credible only if it did not influence development.'},{label:'using test loss to choose hyperparameters',options:['Leaks test information into development decisions','Is identical to validation use','Improves generalization'],answer:0,reveal:'Decisions guided by test data make the final test-set report optimistic.'}]},
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
        'Greedy has a known failure mode: once a phrase becomes likely, taking the argmax every step can lock into a repetition loop, generating the same words again and again. Sampling, or an explicit repetition penalty, breaks the loop.',
      ],cta:'Compare generations'},
      {kind:'widget',widget:GenerationPlay},{kind:'widget',widget:TemperaturePlay},
      {kind:'worked',title:'Sample a token, by hand',prompt:'A four-token vocabulary has probabilities: the 0.50, cat 0.30, sat 0.15, mat 0.05. A random draw is a number between 0 and 1.',stages:[
        {label:'Stack the intervals',body:'the owns 0.00-0.50, cat owns 0.50-0.80, sat owns 0.80-0.95, mat owns 0.95-1.00.'},
        {label:'Draw',body:'The draw is 0.62. It lands in 0.50-0.80, so the sampled token is cat.'},
        {label:'Draw again',body:'Next cycle the draw is 0.97: mat, despite its 5% probability. Rare tokens really do appear.'},
      ],takeaway:'Sampling is a roulette wheel whose slot sizes are the probabilities.'},
      {kind:'numeric',prompt:'Same wheel: the 0.00-0.50, cat 0.50-0.80, sat 0.80-0.95, mat 0.95-1.00. Answer with slot numbers: the=1, cat=2, sat=3, mat=4.',questions:[
        {label:'a draw of 0.85 lands in slot',answer:3,tolerance:0,reveal:'0.85 falls inside 0.80-0.95: sat.'},
        {label:'probability of NOT sampling the (2 decimals)',answer:0.5,tolerance:0.01,reveal:'1 - 0.50 = 0.50: half of all draws leave the most likely token behind.'},
      ]},
      {kind:'mcq',prompt:'A grading tool must return the same completion for the same input. Which strategy?',options:['Greedy decoding','High-temperature sampling','Uniform choice','Sampling every token'],answer:0,explain:'Greedy always selects the argmax and adds no random draw.',nudge:'Which removes randomness?'},
      {kind:'predict',prompt:'Sample five completions at temperature 1.',questions:[{label:'expected result',options:['They may differ because choices are sampled','They must be identical','Only IDs differ'],answer:0,reveal:'Random sampling can introduce variation at every position.'},{label:'at temperature 0 instead',options:['All five would be identical','They would still differ','Sampling becomes impossible'],answer:0,reveal:'Temperature 0 collapses to greedy argmax, removing all variation.'}]},
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
        {label:'Accumulate',body:'0.50 → 0.75 → 0.87 → 0.95.'},{label:'Stop',body:'Three tokens reach only 0.87, still short of p=0.90, so include the fourth: 0.95 crosses the threshold.'},{label:'Sample',body:'Sample among four; exclude the fifth.'},
      ],takeaway:'Top-p adapts candidate count to probability concentration.'},
      {kind:'mcq',prompt:'Why can beam search sound generic?',options:['It favors high-probability sequences, often common phrases','It samples uniformly','It deletes low IDs','It raises temperature'],answer:0,explain:'Specific or surprising text often scores lower than safe common wording.',nudge:'What wording is common in training data?'},
      {kind:'predict',prompt:'Raise temperature with top-p=0.9.',questions:[{label:'nucleus size',options:['Usually grows as probability spreads','Always shrinks to one','Cannot change'],answer:0,reveal:'A flatter distribution needs more tokens to reach 90%.'},{label:'at very low temperature with top-p=0.9',options:['Nucleus shrinks because probability concentrates','Nucleus always stays the same size','Top-p is ignored'],answer:0,reveal:'Concentrated probability means fewer tokens are needed to reach the cumulative threshold.'}]},
    ],
  },
  {
    slug:'llm-in-practice',title:'Prompting, Chat Format, and Failure Modes',emoji:'💬',blurb:'Three ideas every practitioner needs immediately: few-shot prompting, chat structure, and hallucination.',minutes:7,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['next-token-prediction','decoding-controls'],outcomes:['Use few-shot prompting to shape behavior','Describe system/user/assistant turn structure','Name hallucination as a structural failure mode'],concepts:['few-shot prompting','zero-shot','system prompt','chat format','hallucination'],
    steps:[
      {kind:'concept',title:'What happens before the model runs',lines:[
        'Few-shot prompting places example input-output pairs in the context before the real question. The model observes the pattern and continues it without any weight update. Zero-shot gives only the question; few-shot gives a short demonstration.',
        'Chat models structure their context as a sequence of turns: a system prompt sets standing instructions, then user and assistant turns alternate. The system prompt is part of the model\'s input, not a separate mechanism; it controls tone, role, and policy for the conversation.',
        'Hallucination is the name for output that sounds confident but is not grounded in training data or retrieved context. It is a structural property of next-token prediction: the model generates plausible-looking continuations even when no grounding exists. Retrieval and calibration reduce it; no technique eliminates it.',
      ],cta:'Apply each idea'},
      {kind:'worked',title:'Build a few-shot prompt',prompt:'The task: classify sentiment as positive or negative.',stages:[
        {label:'Write examples',body:'"Review: Great product! → positive\nReview: Waste of money. → negative"'},
        {label:'Add the real input',body:'"Review: Arrived on time and works perfectly. → "'},
        {label:'Let the model continue',body:'The model has seen the pattern and completes the turn without training.'},
      ],takeaway:'Few-shot prompting is structured context, not code or weight change.'},
      {kind:'mcq',prompt:'You need a model to answer in a formal tone for all users without modifying weights. Best mechanism?',options:['System prompt setting the required tone','Few-shot with informal examples','Higher temperature','Fine-tuning for every user'],answer:0,explain:'The system prompt is always present in the context and sets persistent instructions.',nudge:'Which mechanism persists across all turns without changing the model?'},
      {kind:'mcq',prompt:'A model confidently states a plausible-sounding but incorrect fact. What is the most accurate description?',options:['Hallucination: the model generated a plausible continuation unsupported by evidence','A tokenization error','A temperature misconfiguration','A gradient that did not converge'],answer:0,explain:'Hallucination is a prediction behavior, not a parameter bug. The model produces confident text even when grounding is absent.',nudge:'Is the output a pattern continuation or a verified fact?'},
      {kind:'predict',prompt:'You have a question and three labeled examples.',questions:[{label:'Using all three examples is called...',options:['Three-shot prompting','Zero-shot prompting','Fine-tuning','System prompting'],answer:0,reveal:'The number of examples before the real question names the prompting strategy.'},{label:'removing all examples and asking directly',options:['Zero-shot prompting','Impossible without fine-tuning','System prompt injection'],answer:0,reveal:'Zero-shot means no examples precede the real question; the model relies on pretrained patterns.'}]},
    ],
  },
  {
    slug:'model-capstone',title:'Model Mechanics Checkpoint',emoji:'🏁',blurb:'Retrieve and connect the complete path before applications.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['validation-generalization','decoding-controls','llm-in-practice','parameter-counts'],outcomes:['Trace inference','Trace training','Diagnose boundary confusions'],concepts:['integration','inference trace','training trace'],
    steps:[
      {kind:'concept',title:'Two traces, one model',lines:['Inference uses fixed weights to turn context into next-token distributions. Training adds targets, loss, backpropagation, and optimizer updates to change those weights.','This checkpoint introduces no new mechanism. It mixes earlier concepts because retrieving and connecting them makes knowledge usable.'],cta:'Start the checkpoint'},
      {kind:'mcq',prompt:'Which path describes one inference cycle?',options:['text → IDs → embeddings → blocks → logits → probabilities → token choice','text → loss → gradient → ID','embedding → tokenizer → optimizer → text','probability → update → vocabulary'],answer:0,explain:'That is the forward and decoding path. Loss and gradients belong to training.',nudge:'Start with text and end with a token choice.'},
      {kind:'mcq',prompt:'Which event changes model weights?',options:['An optimizer step during training','Appending a generated token','Softmax during inference','Tokenization'],answer:0,explain:'Only a training update changes parameters.',nudge:'Which applies gradients?'},
      {kind:'predict',prompt:'Retrieve the roles.',questions:[
        {label:'Q and K',options:['produce match scores','carry retrieved content','choose IDs'],answer:0,reveal:'Query-key dot products determine attention weights.'},
        {label:'V',options:['carries content mixed by weights','blocks future positions','computes loss'],answer:0,reveal:'Values are retrieved after matching.'},
        {label:'validation set',options:['guides choices without updating weights','provides final reporting only','is used for every gradient'],answer:0,reveal:'Validation supports selection; test stays untouched for reporting.'},
      ]},
      {kind:'numeric',prompt:'A sequence has 6 known tokens.',questions:[{label:'next-token targets',answer:5,tolerance:0,reveal:'Every token except the first is a target for the preceding context.'}]},
      {kind:'mcq',prompt:'A 12-block model with width 768 uses weight tying. Where do most parameters live?',options:['In the repeated per-block projections (attention + FFN)','In the final softmax','In the tokenizer','In the position table alone'],answer:0,explain:'12 blocks of attention and FFN projections total about 85M versus 39M for embeddings.',nudge:'Which component is repeated 12 times?'},
      {kind:'numeric',prompt:'Quick parameter retrieval.',questions:[
        {label:'4 attention projections, each 768x768, per block (millions)',answer:2.36,tolerance:0.05,reveal:'4 x 768 x 768 = 2.36M. Recall from the parameter-counts lesson.'},
      ]},
    ],
  },
]
