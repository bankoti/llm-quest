import type { InteractiveLesson } from './types'
const MODULE='frontier'
const MODULE_TITLE='Frontier extensions'

export const EXTENSION_LESSONS: InteractiveLesson[] = [
  {
    slug:'reading-model-cards',title:'Reading Model Claims',emoji:'📇',blurb:'Separate storage, compute, context, evaluation, and license claims.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['mixture-of-experts','precision-quantization'],outcomes:['Distinguish total and active parameters','Interrogate context and benchmark claims','Check licensing before deployment'],concepts:['model card','total parameters','active parameters','benchmark conditions','context length','license'],track:'extension',
    steps:[
      {kind:'concept',title:'A headline number rarely answers the deployment question',lines:[
        'For a dense model, nearly all parameters are active for each token. For a mixture-of-experts model, total parameters describe stored capacity while active parameters better approximate the routed compute path. Memory still follows total stored weights.',
        'A claimed context length says what the system accepts, not how well it retrieves facts across that entire window or what the latency and cache cost will be. A benchmark score is meaningful only with task version, prompting, tools, sampling, and evaluation method.',
        '“Weights available” is not a license. Commercial rights, geographic limits, attribution, acceptable-use terms, and redistribution conditions come from the actual license text.',
      ],cta:'Audit a model card'},
      {kind:'worked',title:'Decode a hypothetical MoE card',prompt:'Card: “120B total, 18B active, 128k context, open weights.”',stages:[
        {label:'Memory question',body:'Loading memory follows 120B stored weights and chosen precision, plus runtime buffers.'},{label:'Compute question',body:'Per-token routed compute is closer to an 18B active path, though routing and hardware efficiency matter.'},{label:'Context question',body:'128k is a supported limit, not proof of uniform recall or affordable latency.'},{label:'Permission question',body:'Read the license; “open weights” alone does not settle commercial use.'},
      ],takeaway:'Translate every headline into the specific cost, quality, or permission question it actually answers.'},
      {kind:'mcq',prompt:'A 100B-total MoE activates 12B parameters per token. Which statement is safest?',options:['Storage tracks about 100B weights; routed compute is closer to the 12B active path','It needs memory for only 12B weights','It always runs exactly like a 12B dense model','All 100B parameters run for every token'],answer:0,explain:'Inactive experts still need storage. Active count informs compute but does not erase routing and systems overhead.',nudge:'Separate what must be stored from what one token traverses.'},
      {kind:'mcq',prompt:'What settles whether downloadable weights may be used in a paid product?',options:['The governing license text','The benchmark score','The quantization format','The model name'],answer:0,explain:'Access to files and legal permission to use them are different questions.',nudge:'Which artifact defines rights and restrictions?'},
      {kind:'predict',prompt:'A card claims a 1M-token context.',questions:[{label:'what must still be tested',options:['Recall quality, latency, memory cost, and behavior across positions','Whether token IDs are integers','Whether softmax sums to one'],answer:0,reveal:'Maximum accepted length is only one dimension of long-context usefulness.'},{label:'if recall degrades in the middle of context',options:['The model accepts the length but does not use it uniformly','The context window is too short','Tokenization failed'],answer:0,reveal:'Lost-in-the-middle effects mean acceptance length alone does not guarantee uniform retrieval quality.'}]},
    ],
  },
  {
    slug:'long-context-architectures',title:'Long Context: Exact Recall or Fixed State',emoji:'🌀',blurb:'Compare full attention, compressed state, and hybrid designs.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['kv-cache','qkv-attention'],outcomes:['Explain why full attention cost grows with context','Explain fixed-state compression','Explain the hybrid trade-off'],concepts:['full attention','fixed-size recurrent state','linear attention','exact recall','hybrid architecture'],track:'extension',
    steps:[
      {kind:'concept',title:'Perfect access has a growing bill',lines:[
        'Full causal attention keeps keys and values for every prior token. The new query can compare against any exact earlier position, but cache memory and per-token attention work grow with context length.',
        'Linear-attention and state-space approaches (architectures like Mamba that maintain a fixed-size compressed history rather than per-token keys and values) compress history into a fixed-size running state. Per-token state update cost need not grow with context, but compression can lose rare exact details because many past events share limited state.',
        'Hybrid models mix frequent fixed-state layers with occasional full-attention layers. The design aims to keep cheap long-range processing while restoring some exact lookup ability. The right mix depends on the workload, not a universal ratio.',
      ],cta:'Compare the contracts'},
      {kind:'worked',title:'Find one clause in a long contract',prompt:'The system must quote an exact sentence from 400 pages.',stages:[
        {label:'Full attention',body:'Every prior position remains separately addressable, supporting exact lookup at growing cost.'},{label:'Fixed state',body:'History is compressed; broad themes may survive while one rare sentence can fade.'},{label:'Hybrid',body:'Most layers process compact state while selected full-attention layers preserve exact position access.'},
      ],takeaway:'Long-context architecture is a trade between exact addressability and bounded state.'},
      {kind:'mcq',prompt:'Why can a fixed-size state struggle with needle-in-a-haystack recall?',options:['Many past details are compressed into limited state','It has no learned weights','It cannot process tokens sequentially','It always uses more memory than a KV cache'],answer:0,explain:'Compression is lossy when the state cannot preserve every rare detail independently.',nudge:'What information is sacrificed when a growing history must fit a fixed container?'},
      {kind:'predict',prompt:'A 48-layer hybrid dedicates one quarter of its layers to full attention and the rest to fixed state.',questions:[
        {label:'growing KV-cache layers',options:['12','36','48'],answer:0,reveal:'One quarter of 48 = 12 full-attention layers store per-position keys and values; the remaining 36 use bounded state.'},
        {label:'when context doubles, fixed-state update cost',options:['Stays approximately constant per token','Must double','Must quadruple'],answer:0,reveal:'The fixed-size state update does not scan every earlier position.'},
      ]},
    ],
  },
  {
    slug:'parallel-decoding',title:'Parallel and Diffusion-Style Decoding',emoji:'🌫️',blurb:'Understand masked-token denoising as an alternative to strict left-to-right generation.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['decoding-basics','causal-attention'],outcomes:['Contrast autoregressive and block-parallel decoding','Define masked-token denoising','Compute sequential-pass trade-offs'],concepts:['autoregressive latency','unknown-token mask','denoising','blockwise generation','parallel decoding'],track:'extension',
    steps:[
      {kind:'concept',title:'Unknown placeholders are refined in parallel',lines:[
        'Autoregressive decoding chooses one token, appends it, and repeats. An output of N tokens therefore has at least N dependent token-choice steps, even when matrix work inside each step is parallel.',
        'Diffusion-style text decoding can begin a block with unknown placeholder tokens. Recent systems using this approach include masked diffusion language models (MDLMs) such as LLaDA. Here “masked” means the token content is hidden or not yet chosen; it is different from a causal attention mask. Denoising means repeatedly replacing uncertain placeholders with more confident token guesses.',
        'Positions inside a block can update in parallel, reducing sequential rounds. Each round processes many positions, and quality, cache behavior, and total arithmetic may differ, so fewer rounds do not imply equal-factor wall-clock speedup.',
      ],cta:'Count the rounds'},
      {kind:'worked',title:'Generate 256 tokens in blocks',prompt:'Use 64-token blocks and 8 refinement rounds per block.',stages:[
        {label:'Count blocks',body:'256÷64 = 4 blocks.'},{label:'Count sequential rounds',body:'4 blocks×8 rounds = 32 dependent rounds.'},{label:'Compare autoregression',body:'Strict left-to-right generation needs 256 token-choice rounds.'},{label:'Keep the caveat',body:'A refinement round processes a whole block, so 8× fewer rounds is not automatically 8× faster.'},
      ],takeaway:'Parallel decoding trades fewer sequential decisions for heavier multi-position refinement rounds.'},
      {kind:'numeric',prompt:'Count sequential rounds.',questions:[{label:'512 tokens, blocks of 64, 6 rounds/block',answer:48,tolerance:0,reveal:'512/64=8 blocks; 8×6=48 sequential refinement rounds.'}]},
      {kind:'mcq',prompt:'What is the main potential benefit of block-parallel decoding?',options:['Lower sequential latency by updating several positions per round','Guaranteed higher factual accuracy','No need for model weights','Zero context memory'],answer:0,explain:'The architectural goal is fewer dependent token-choice rounds. Other costs and quality still require measurement.',nudge:'Which constraint does parallel position updating directly change?'},
      {kind:'predict',prompt:'Compare “masked” meanings.',questions:[{label:'diffusion-style unknown token vs causal mask',options:['Unknown token means content not chosen; causal mask blocks access to future positions','They are identical operations','Both delete model weights'],answer:0,reveal:'The same word “mask” names two different mechanisms; context determines which one is meant.'},{label:'which mask changes information access?',options:['The causal attention mask','The unknown placeholder alone','Neither'],answer:0,reveal:'A causal mask blocks future positions; an unknown placeholder marks content still to be predicted.'}]},
    ],
  },
]
