import type { InteractiveLesson } from './types'
import { FlashPlay, ZeroPlay, SwitchPlay, PagingPlay } from './paperWidgets'

export const PAPER_SYSTEMS_LESSONS: InteractiveLesson[] = [
  {
    slug:'flash-attention',title:'FlashAttention: Exact Attention in Tiles',emoji:'',blurb:'Carry a running softmax across tiles and preserve the answer.',minutes:15,
    moduleId:'systems',moduleTitle:'Serve It: Speed, Memory, and Cost',prerequisites:['qkv-attention','causal-attention'],outcomes:['Explain GPU memory traffic','Update online softmax statistics','Distinguish exact attention from approximation'],concepts:['HBM','SRAM','tiling','online softmax','numerical stability'],
    steps:[
      {kind:'concept',title:'The large temporary matrix',lines:[
        'Ordinary attention forms scores QK^T, normalizes each row, and multiplies by V. For T tokens it can write T squared scores to GPU high-bandwidth memory (HBM), then read them back. The GPU has much smaller on-chip memory (SRAM) that can hold tiles, not the whole matrix.',
        'FlashAttention keeps tiles and running row statistics close to compute. It calculates the same attention with a different memory schedule. Dot-product work is still quadratic; less external-memory traffic can make it faster.',
        'Prerequisite check: softmax is exp(score - row_max) divided by the row sum. Subtracting a common maximum preserves probabilities and avoids overflow. The maximum may change when a new tile arrives.',
      ]},
      {kind:'worked',title:'A change of exponential scale',prompt:'The old maximum m is 2. A new tile raises it to 4.',stages:[
        {label:'Keep three statistics',body:'m is the maximum, l is sum(exp(score-m)), and a is sum(exp(score-m)*value). Output is a/l.'},
        {label:'Rescale old contributions',body:'exp(score-4) = exp(score-2)*exp(-2). Multiply BOTH old l and old a by exp(-2).'},
        {label:'Add the new tile',body:'Compute its weights relative to 4; add their sum to l and their weighted values to a.'},
        {label:'Finish',body:'Divide a by l after all allowed key tiles. A separately normalized output from each tile cannot be averaged equally.'},
      ],takeaway:'A tile boundary must not change which tokens receive probability mass.'},
      {kind:'widget',widget:FlashPlay},
      {kind:'numeric',prompt:'One head, T=4096, FP16 scores. Count only the dense score matrix.',questions:[{label:'4096 squared x 2 bytes / 2^20',answer:32,tolerance:0,unit:'MiB',reveal:'32 MiB for one intermediate, before batch, heads, probabilities, or backward state.'}]},
      {kind:'mcq',prompt:'The running maximum increases. What must be rescaled?',options:['Only the newest values','Both the old exponential sum and weighted value sum','Only Q','Nothing; softmax is local to each tile'],answer:1,explain:'Both statistics used the old maximum and need the same correction factor.',nudge:'The numerator and denominator must share a scale.'},
      {kind:'mcq',prompt:'What should the coding lab demonstrate before benchmarking?',options:['Lower loss on a new dataset','Exactly half the FLOPs','Agreement with causal attention across tile sizes and large logits','A specific speedup on every laptop'],answer:2,explain:'Correctness comes from numerical agreement and isolation from future tokens. The CPU reference teaches the recurrence; GPU speed requires an optimized kernel.',nudge:'Changing the memory schedule must preserve the computation.'},
    ],
  },
  {
    slug:'zero-sharding',title:'ZeRO: Who Owns the Training State?',emoji:'',blurb:'Partition optimizer state, gradients, and weights across logical devices.',minutes:15,
    moduleId:'systems',moduleTitle:'Serve It: Speed, Memory, and Cost',prerequisites:['scaling-laws','optimizer-loop'],outcomes:['Distinguish model state from activations','Calculate all three ZeRO stages','Trace gradient averaging and an owner update'],concepts:['data parallelism','optimizer state','reduce-scatter','all-gather','Adam','ZeRO'],
    steps:[
      {kind:'concept',title:'Training stores more than weights',lines:[
        'Data-parallel workers process different batches using the same model. A replicated baseline stores weights, gradients, and optimizer state on every device. Adam keeps two running moments per parameter; mixed-precision training can also keep a full-precision master weight.',
        'Our accounting assumes 2-byte weights, 2-byte gradients, and 12 bytes of master weight plus Adam moments. That is 16 bytes per parameter before activations and temporary buffers. Other precision recipes change these constants.',
        'ZeRO stage 1 partitions optimizer state; stage 2 also partitions gradients; stage 3 also partitions parameters. The full model still exists across the workers. Sharding removes replicas, not learned capacity.',
      ]},
      {kind:'widget',widget:ZeroPlay},
      {kind:'worked',title:'One update with two owners',prompt:'Four parameters. Rank 0 has gradient [2,4,6,8]; rank 1 has [4,6,8,10]. Batches are equally sized.',stages:[
        {label:'Average',body:'The global mean gradient is [3,5,7,9]. Summing without division would double the update.'},
        {label:'Reduce-scatter',body:'Owner 0 receives [3,5]; owner 1 receives [7,9]. Each owner updates only its shard of the Adam moments and parameters.'},
        {label:'Make weights available',body:'An all-gather can reconstruct parameters when needed. Stage 3 gathers layers for computation; temporary gathered weights still consume memory.'},
      ],takeaway:'The sharded update must match the replicated optimizer using the same averaged gradient.'},
      {kind:'numeric',prompt:'One billion parameters, four devices, stage 2, our 16-byte recipe.',questions:[{label:'2N + 14N/4',answer:5.5,tolerance:0,unit:'GB per device',reveal:'2 GB replicated weights + 3.5 GB sharded gradients and optimizer state = 5.5 GB.'}]},
      {kind:'mcq',prompt:'Does 16N/R predict stage-3 peak training memory?',options:['Yes, all allocations are divided by R','No; activations and transient gathers are additional','Yes, but only with Adam','No; no state is sharded'],answer:1,explain:'Persistent state is only one component of peak memory. Communication and recomputation are additional trade-offs.',nudge:'What must be present during a layer forward pass?'},
      {kind:'mcq',prompt:'What does the CPU coding simulation validate?',options:['Network overlap on eight GPUs','The paper benchmark speedup','Owner updates equal the unsharded Adam result','A reduction in model parameters'],answer:2,explain:'Logical ranks validate state ownership and update math. Distributed throughput needs an actual multi-device runtime.',nudge:'Separate mathematical equivalence from communication performance.'},
    ],
  },
  {
    slug:'switch-transformer',title:'Switch Transformers: Routing That Learns',emoji:'',blurb:'Execute selected experts, handle capacity, and retain the router gradient.',minutes:15,
    moduleId:'systems',moduleTitle:'Serve It: Speed, Memory, and Cost',prerequisites:['mixture-of-experts','gradients'],outcomes:['Apply top-1 gates','Model overflow','Compute the balancing objective','Distinguish dispatch from output mixing'],concepts:['top-1 routing','capacity factor','load balancing','router gradient','sparse execution'],
    steps:[
      {kind:'concept',title:'One selected expert, one probability gate',lines:[
        'Switch simplifies token-choice routing to one expert per token. Compute router probabilities across all experts, choose the largest, then multiply that expert output by its ORIGINAL probability.',
        'A subtle trap: renormalizing the one selected probability gives 1. Then that gate no longer changes with router logits, removing its task-loss gradient. Our earlier top-k output mixer is useful, but it is not a faithful top-1 Switch training rule.',
        'An expert has finite token capacity. This lab accepts tokens in input order and drops excess FFN contributions to zero. The surrounding Transformer residual still carries their input. Capacity and load balancing solve different problems.',
      ]},
      {kind:'widget',widget:SwitchPlay},
      {kind:'worked',title:'Balance assignments and probability mass',prompt:'For E experts, define f_i as the assigned-token fraction BEFORE dropping, and P_i as mean router probability.',stages:[
        {label:'Measure assignments',body:'Count argmax choices and divide by total tokens. These hard choices do not have ordinary derivatives.'},
        {label:'Keep soft probabilities',body:'Average probabilities across tokens. These remain differentiable.'},
        {label:'Add auxiliary objective',body:'L_aux = E * sum(f_i * P_i), multiplied by a small coefficient when added to task loss. At uniform f and P, the unscaled value is 1.'},
        {label:'Execute sparsely',body:'Group accepted token inputs by destination; call each used expert once. Computing every expert then discarding outputs saves no expert compute.'},
      ],takeaway:'The gate and balancing loss provide router learning signals; dispatch determines actual sparse execution.'},
      {kind:'numeric',prompt:'8 tokens, 4 experts, capacity factor 1. Assignments are [0,0,0,0,0,1,2,3].',questions:[{label:'Overflow tokens',answer:3,tolerance:0,reveal:'Capacity is ceil(8/4)=2. Expert 0 receives 5, so 3 overflow.'}]},
      {kind:'mcq',prompt:'Router probabilities are [0.7,0.2,0.1]. Expert 0 returns vector h. The Switch FFN contribution is:',options:['h','0.7h','h/0.7','The mean of all three experts'],answer:1,explain:'Keep the original gate. Normalizing the selected singleton would incorrectly turn it into 1.',nudge:'The selected gate remains connected to all router logits through softmax.'},
      {kind:'mcq',prompt:'What can increasing capacity fail to fix?',options:['Overflow','Buffer limits','An expert receiving no learning examples','The maximum accepted token count'],answer:2,explain:'More capacity does not alter assignments. Training must address imbalanced routing.',nudge:'A larger empty buffer is still empty.'},
    ],
  },
  {
    slug:'paged-attention',title:'PagedAttention: A Cache Without Contiguous Reservations',emoji:'',blurb:'Trace block tables, shared prefixes, and copy-on-write.',minutes:15,
    moduleId:'systems',moduleTitle:'Serve It: Speed, Memory, and Cost',prerequisites:['kv-cache'],outcomes:['Translate logical to physical blocks','Explain internal waste','Preserve shared prefixes on writes','Reclaim memory after requests finish'],concepts:['block table','fragmentation','reference count','copy-on-write','paged KV cache'],
    steps:[
      {kind:'concept',title:'Growing requests do not need adjacent storage',lines:[
        'Reserving each request a large contiguous cache can waste memory when output length is unknown. PagedAttention organizes the KV cache into fixed-size blocks. A per-sequence table maps logical token blocks to physical storage.',
        'Attention follows logical order through that table. Blocks 0, 2, and 1 can represent successive pieces of one sequence. Paging changes placement and reuse; it does not remove the keys and values required for the context.',
        'Branches can share prefix blocks. Track reference counts. Before appending into a shared partial block, allocate a private copy. Free a block only after its last owner releases it.',
      ]},
      {kind:'widget',widget:PagingPlay},
      {kind:'worked',title:'Translate token position 5',prompt:'Block size 2, block table [0,2,1], positions start at 0.',stages:[
        {label:'Logical block',body:'5 // 2 = 2.'},
        {label:'Physical block',body:'table[2] = 1.'},
        {label:'Offset',body:'5 % 2 = 1. Read slot 1 of physical block 1.'},
        {label:'Preserve attention',body:'Use the correct K/V for every logical position. The CPU lab compares paged decoding with a contiguous reference.'},
      ],takeaway:'Logical sequence order is independent of physical allocation order.'},
      {kind:'numeric',prompt:'A single unshared sequence has 9 cached tokens, block size 4.',questions:[{label:'Allocated blocks',answer:3,tolerance:0,reveal:'ceil(9/4)=3 blocks.'},{label:'Unused slots inside those blocks',answer:3,tolerance:0,reveal:'12 allocated slots - 9 used = 3. Unallocated blocks do not count as internal waste.'}]},
      {kind:'mcq',prompt:'Two sequences share a partially filled block. One appends, but no free block exists.',options:['Overwrite the shared block','Drop the other sequence silently','Reject or defer the append without modifying either sequence','Sort physical block IDs'],answer:2,explain:'Copy-on-write needs free capacity. A failed reservation must leave ownership and contents unchanged.',nudge:'An append must not change another request\'s history.'},
      {kind:'mcq',prompt:'What should happen when one of two owners finishes?',options:['Delete every prefix block','Reduce references; keep blocks still used by the other owner','Duplicate all remaining blocks','Clear all block tables'],answer:1,explain:'Reference counts let storage outlive any one request and be reclaimed after the last owner leaves.',nudge:'Who still needs this data?'},
    ],
  },
]
