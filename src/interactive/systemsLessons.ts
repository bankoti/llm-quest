import type { InteractiveLesson } from './types'
import { ScalingPlay, GenerationPlay, PrecisionPlay, MoePlay, SpecDecodePlay } from './widgets'
const MODULE='systems'
const MODULE_TITLE='Scaling and serving'
export const SYSTEMS_LESSONS: InteractiveLesson[] = [
  {
    slug:'scaling-laws',title:'Scaling Parameters, Data, and Compute',emoji:'🔭',blurb:'Learn the budget trade-off before optimizing inference.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['model-capstone'],outcomes:['Define parameters, tokens, and FLOPs','Explain compute-optimal balance','Explain deployment-driven overtraining'],concepts:['parameter count','training tokens','FLOPs','compute budget','Chinchilla ratio'],
    steps:[
      {kind:'concept',title:'A fixed budget can buy width or experience',lines:[
        'Model quality depends on parameter count N, training tokens D, and training compute. FLOPs means floating-point operations: a count of arithmetic work. A rough transformer training estimate is C ≈ 6ND FLOPs (forward and backward passes combined; the actual factor depends on architecture and implementation).',
        'For fixed C, a larger model receives fewer training tokens; a smaller model can train longer. Scaling-law studies estimate a balance that minimizes loss for that training budget. A useful Chinchilla-era rule of thumb is D ≈ 20N tokens, though exact optima depend on data and architecture.',
        'Deployment may favor training a smaller model past the training-optimal point. Extra one-time training can reduce the parameter count paid on every inference request.',
      ],cta:'Allocate the budget'},
      {kind:'widget',widget:ScalingPlay},
      {kind:'worked',title:'Apply the rule of thumb',prompt:'Estimate compute-optimal tokens for a 30B-parameter model using D≈20N.',stages:[
        {label:'Keep units aligned',body:'N=30 billion parameters; D will be measured in billions of tokens.'},{label:'Multiply',body:'20×30B = 600B tokens.'},{label:'Compare actual training',body:'If it received 300B tokens, it was undertrained relative to this rule of thumb.'},
      ],takeaway:'Scaling laws compare allocations under a budget; they are planning estimates, not physical laws.'},
      {kind:'numeric',prompt:'Use D≈20N.',questions:[{label:'tokens for N=70B',answer:1400,tolerance:0,unit:'B tokens',reveal:'20×70B=1400B=1.4T tokens.'}]},
      {kind:'mcq',prompt:'Why might a deployment train a smaller model beyond the training-optimal token count?',options:['The extra training is paid once, while smaller inference is paid on every request','Overtraining increases parameter count','It removes the tokenizer','It guarantees no hallucinations'],answer:0,explain:'Serving cost compounds across requests; training cost is a one-time investment.',nudge:'Compare one training run with millions of inference calls.'},
    ],
  },
  {
    slug:'kv-cache',title:'The KV Cache: Reuse, Not Free Attention',emoji:'🗃️',blurb:'See exactly what is cached, what still grows, and why long contexts cost memory.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['inference-loop','qkv-attention'],outcomes:['Explain cached K/V projections','Distinguish projection reuse from attention cost','Compute cache memory'],concepts:['KV cache','projection reuse','linear memory growth','per-token attention cost'],
    steps:[
      {kind:'concept',title:'Keep old keys and values; compute one new pair',lines:[
        'Without a cache, every generation step recomputes key and value projections for all earlier tokens. A KV cache stores those previous K and V tensors at every layer, so only the new token’s projections are appended.',
        'Caching does not make attention constant-time. The new query still compares against T cached keys and mixes T values, so attention work for one new token grows O(T). The cache removes repeated projection work and changes full-prefix recomputation toward linear work per step.',
        'Cache memory also grows O(T): 2 × layers × KV heads × context length × head dimension × bytes per value. “O(T)” means proportional to context length T.',
      ],cta:'Watch reuse and growth'},
      {kind:'widget',widget:GenerationPlay},
      {kind:'mcq',prompt:'What does the KV cache avoid?',options:['Recomputing prior tokens\' key and value projections','Comparing the new query with prior keys','Storing any context information','Running transformer layers for the new token'],answer:0,explain:'Previous projections are reused. The new query still attends across cached history.',nudge:'Cache means reuse, not zero work.'},
      {kind:'worked',title:'Count the cache entries',prompt:'A 12-layer model appends one new token.',stages:[
        {label:'Per layer',body:'Store one new key vector and one new value vector: 2 tensors.'},{label:'Across layers',body:'2×12 = 24 new per-token K/V tensors.'},{label:'Across context',body:'Every generated token adds another set, so memory grows linearly with token count.'},
      ],takeaway:'One new token appends K and V at every layer; old cache entries remain.'},
      {kind:'numeric',prompt:'Compute cache size in SI GB.',questions:[{label:'2×32 layers×32 KV heads×2048 tokens×128 dim×2 bytes',answer:1.07,tolerance:0.15,unit:'GB',reveal:'The product is about 1.074 billion bytes, or 1.07 SI GB.'}]},
    ],
  },
  {
    slug:'precision-quantization',title:'Precision and Quantization',emoji:'📦',blurb:'Turn bits per weight into memory, then understand the quality trade.',minutes:7,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['scaling-laws'],outcomes:['Convert bits to bytes per weight','Estimate model memory','Explain quantization trade-offs'],concepts:['floating point','bit width','quantization','weight memory','calibration data'],
    steps:[
      {kind:'concept',title:'Store each learned number with fewer bits',lines:[
        'A parameter is a numeric weight stored as a floating-point number: a value encoded as a sign, exponent, and fraction in a fixed number of bits. fp32 uses 32 bits for wide precision range; fp16 and bf16 use 16 bits, trading some precision for half the memory. fp32 stores about 32 bits = 4 bytes per weight; fp16 or bf16 stores 16 bits = 2 bytes. A 7B-parameter model therefore needs about 28 GB at fp32 or 14 GB at 16-bit precision just for weights.',
        'Quantization maps weights to a smaller set of representable values, commonly 8 or 4 bits. This cuts memory and bandwidth, but rounding introduces error. Good methods choose scales carefully and often use representative calibration data.',
        'Memory savings do not guarantee equal speed on every device: runtime kernels and hardware support determine whether compressed weights execute efficiently.',
      ],cta:'Compare footprints'},
      {kind:'widget',widget:PrecisionPlay},
      {kind:'numeric',prompt:'Estimate weight memory.',questions:[{label:'13B parameters at 4 bits each',answer:6.5,tolerance:0.1,unit:'GB',reveal:'4 bits = 0.5 bytes. 13B×0.5≈6.5 GB before runtime overhead.'}]},
      {kind:'mcq',prompt:'What is the central quantization trade-off?',options:['Lower memory and bandwidth in exchange for approximation error','More parameters in exchange for shorter context','Fewer tokens in exchange for larger vocabulary','Exact arithmetic in exchange for slower tokenization'],answer:0,explain:'Reduced precision compresses numeric representation and may slightly change model outputs.',nudge:'What changes when many real values map to fewer representable levels?'},
      {kind:'predict',prompt:'Two runtimes load the same 4-bit model.',questions:[{label:'speed comparison',options:['It depends on hardware and kernel support','They must be exactly 8× faster','The model cannot run on GPUs'],answer:0,reveal:'Compression reduces storage; execution speed depends on whether the platform efficiently supports that format.'},{label:'memory comparison',options:['Both use approximately the same weight memory','One must use more memory than the other','4-bit weights expand to 16-bit in memory'],answer:0,reveal:'The same 4-bit weights occupy the same storage regardless of runtime; memory is determined by precision, not kernel.'}]},
    ],
  },

  {
    slug:'grouped-query-attention',title:'Grouped-Query Attention',emoji:'🧩',blurb:'Reduce cache memory by sharing K/V heads while keeping many query heads.',minutes:7,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['multihead-attention','kv-cache'],outcomes:['Distinguish Q heads from KV heads','Explain GQA cache savings','Compute the memory ratio'],concepts:['multi-query attention','grouped-query attention','KV head sharing','cache bandwidth'],
    steps:[
      {kind:'concept',title:'Queries can stay diverse while keys and values are shared',lines:[
        'Standard multi-head attention gives every query head its own key and value head. Multi-query attention shares one K/V head across all query heads. Grouped-query attention (GQA) chooses a middle ground: several query heads share each K/V head.',
        'Attention still produces many query-head outputs, but fewer K and V tensors must be stored and moved during generation. If 32 query heads use 8 K/V heads, the cache’s head factor is one quarter as large.',
        'The trade-off is representational flexibility versus serving efficiency. Modern models often find that many query heads with fewer K/V heads preserve quality well.',
      ],cta:'Compute the saving'},
      {kind:'worked',title:'Group 32 query heads',prompt:'A model has 32 Q heads and 8 K/V heads.',stages:[
        {label:'Form groups',body:'32÷8 = 4 query heads share each key/value head.'},{label:'Compare cache count',body:'Cache stores 8 K/V heads per layer instead of 32.'},{label:'Read ratio',body:'8/32 = 1/4, so the K/V-head portion is four times smaller.'},
      ],takeaway:'GQA changes how many K/V heads are cached, not how many query-head outputs exist.'},
      {kind:'numeric',prompt:'Compute the sharing ratio.',questions:[{label:'24 query heads ÷ 6 KV heads',answer:4,tolerance:0,unit:'Q heads per KV head',reveal:'Each K/V head is shared by four query heads.'}]},
      {kind:'mcq',prompt:'What is GQA’s main serving benefit?',options:['A smaller KV cache and less memory bandwidth','No need for causal masking','A smaller vocabulary','Constant-time attention'],answer:0,explain:'Fewer K/V heads reduce cached tensors and data movement. Attention still scans prior positions.',nudge:'Which tensors persist across generation steps?'},
    ],
  },
  {
    slug:'mixture-of-experts',title:'Mixture of Experts',emoji:'🚦',blurb:'Separate stored capacity from the parameters active for one token.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['transformer-block'],outcomes:['Explain learned routing','Distinguish total and active parameters','Explain load balancing'],concepts:['dense model','expert FFN','router','top-k routing','load-balancing loss'],
    steps:[
      {kind:'concept',title:'Not every parameter runs for every token',lines:[
        'A dense transformer runs the same feed-forward network for every token. A mixture-of-experts (MoE) layer stores several alternative FFNs called experts.',
        'A learned router is a small linear layer that scores experts from each token representation. It selects the top-k experts, often two, and combines their outputs. Attention and other shared layers still run normally.',
        'Total parameters determine storage. Active parameters approximate compute per token. A load-balancing objective prevents a rich-get-richer loop where a few experts receive almost all tokens and others never learn.',
      ],cta:'Route tokens'},
      {kind:'widget',widget:MoePlay},
      {kind:'mcq',prompt:'Eight experts, top-2 routing: what fraction of expert parameters runs for one token?',options:['1/4','1/8','1/2','All'],answer:0,explain:'2 of 8 expert paths run, so 2/8=1/4. Shared model layers still run too.',nudge:'Count selected experts over stored experts.'},
      {kind:'worked',title:'Stored versus active',prompt:'Only FFNs are expertized; attention and embeddings are shared.',stages:[
        {label:'Stored capacity',body:'All expert FFN weights must live in memory.'},{label:'Active path',body:'Each token runs only its selected experts plus shared layers.'},{label:'Interpret headlines',body:'Total and active parameter counts answer different cost questions.'},
      ],takeaway:'MoE buys more stored capacity without proportional per-token compute, but memory and routing complexity remain.'},
      {kind:'mcq',prompt:'What happens without load balancing?',options:['The router can collapse onto a few favorite experts','Every expert becomes identical by definition','No token selects an expert','Attention stops using softmax'],answer:0,explain:'Popular experts receive more data and improve faster, reinforcing their popularity.',nudge:'Think rich-get-richer.'},
    ],
  },
  {
    slug:'speculative-decoding',title:'Speculative Decoding and Test-Time Compute',emoji:'🚀',blurb:'Separate a speed technique from spending more inference compute for quality.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['decoding-controls','kv-cache'],outcomes:['Explain draft-and-verify decoding','Explain why target distribution is preserved','Explain majority voting limits'],concepts:['draft model','verification','rejection sampling intuition','test-time compute','majority vote'],
    steps:[
      {kind:'concept',title:'Use extra inference in two different ways',lines:[
        'Speculative decoding targets speed. A small draft model proposes several tokens; the target model checks them in a parallel pass. A correction rule accepts or replaces proposals so the final samples follow the target model’s distribution.',
        'Test-time compute targets quality. A system may sample several independent solutions, run tools, critique drafts, or search a reasoning tree. More compute helps only when the extra attempts contain useful, partly independent information.',
        'These levers should not be conflated: speculative decoding aims for the same distribution faster; voting or search spends more work to improve the answer.',
      ],cta:'Run draft and verify'},
      {kind:'widget',widget:SpecDecodePlay},
      {kind:'mcq',prompt:'What happens to ideal speculative decoding output quality?',options:['It matches the target model’s distribution; the gain is speed','Draft tokens bypass verification','It becomes an ensemble and always improves','It depends only on draft size'],answer:0,explain:'The acceptance and correction rule reproduces target sampling rather than trusting the draft blindly.',nudge:'The target model verifies every proposed position.'},
      {kind:'worked',title:'Expected accepted prefix',prompt:'The draft proposes 4 tokens. For this example, assume each token is accepted with probability 0.8 (a fixed constant, used here as a simplification; real acceptance probabilities vary by position).',stages:[
        {label:'First accepted',body:'Probability 0.8.'},{label:'First two',body:'Probability 0.8²=0.64.'},{label:'Continue',body:'Expected accepted count is 0.8+0.64+0.512+0.4096≈2.36.'},{label:'Add correction token',body:'The target also supplies a token, giving about 3.36 emitted tokens per target pass.'},
      ],takeaway:'Acceptance rate controls speedup; a poorly matched draft provides little benefit.'},
      {kind:'mcq',prompt:'When can majority voting hurt?',options:['When individual attempts are below 50% reliable or share the same systematic error','Whenever the number of samples is odd','Only when decoding is greedy','Never'],answer:0,explain:'Voting amplifies the dominant signal, whether that signal is correct or systematically wrong.',nudge:'More copies of the same bias do not create truth.'},
    ],
  },

  {
    slug:'systems-capstone',title:'Scaling and Serving Checkpoint',emoji:'🏆',blurb:'Connect scaling laws, caching, precision, routing, and decoding tricks.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['speculative-decoding','grouped-query-attention','mixture-of-experts'],outcomes:['Choose precision for a deployment constraint','Diagnose a KV-cache bottleneck','Distinguish stored and active parameters'],concepts:['system integration','deployment trade-offs','bottleneck diagnosis'],
    steps:[
      {kind:'concept',title:'Every serving choice is a named trade-off',lines:['Scaling laws guide how to spend a training budget. Precision and quantization trade accuracy for memory. GQA trades head diversity for cache size. MoE trades routing complexity for capacity without proportional compute. Speculative decoding trades draft-model overhead for fewer sequential target passes.','This checkpoint introduces no new mechanism. It asks you to retrieve and connect earlier ideas under new scenarios.'],cta:'Start the checkpoint'},
      {kind:'mcq',prompt:'A 70B model must serve on a single 80 GB GPU. What is the first bottleneck?',options:['Weight memory exceeds capacity at full precision','The vocabulary is too large','Attention is constant-time','The KV cache is always empty'],answer:0,explain:'70B at fp16 = 140 GB, exceeding 80 GB. Quantization to 4-bit brings it to about 35 GB.',nudge:'Multiply parameters by bytes per weight.'},
      {kind:'mcq',prompt:'Long conversations slow down. KV cache grows linearly. Which architectural choice directly reduces cache size?',options:['Grouped-query attention with fewer KV heads','More transformer blocks','A larger vocabulary','Higher temperature'],answer:0,explain:'GQA reduces the per-layer KV-head count, directly shrinking cache memory.',nudge:'Which design shares KV heads?'},
      {kind:'predict',prompt:'A deployment uses an MoE model with 8 experts, top-2 routing.',questions:[
        {label:'fraction of expert parameters active per token',options:['1/4','All','1/8'],answer:0,reveal:'2 of 8 experts are routed, so 2/8 = 1/4 of expert parameters are active.'},
        {label:'memory required for weights',options:['Proportional to total (all 8 experts stored)','Proportional to active only','Zero because experts are virtual'],answer:0,reveal:'All expert weights must reside in memory even though only a subset runs per token.'},
      ]},
      {kind:'numeric',prompt:'Quick deployment math.',questions:[
        {label:'13B params at 4 bits: weight memory in GB',answer:6.5,tolerance:0.2,reveal:'4 bits = 0.5 bytes. 13B x 0.5 = 6.5 GB.'},
        {label:'D\u224820N tokens for 7B params, in billions',answer:140,tolerance:0,reveal:'20 x 7 = 140B tokens.'},
      ]},
    ],
  },
]
