import type { InteractiveLesson } from './types'
import { EmbeddingPlay, RagPlay, AgentPlay } from './widgets'
const MODULE='applications'
const MODULE_TITLE='Applying models with data and tools'
export const APPLICATION_LESSONS: InteractiveLesson[] = [
  {
    slug:'semantic-embeddings',title:'Sentence Embeddings and Similarity',emoji:'🗺️',blurb:'Reuse dot products to compare the meaning of whole pieces of text.',minutes:7,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['dot-product-similarity','model-capstone'],outcomes:['Distinguish token and sentence embeddings','Rank normalized embeddings by similarity','Name limits of embedding similarity'],concepts:['sentence embedding','pooling','cosine similarity','nearest neighbor','semantic retrieval'],
    steps:[
      {kind:'concept',title:'One vector can summarize a piece of text',lines:[
        'Token embeddings represent individual token positions. An embedding model can also produce one fixed-width vector for a sentence, passage, image, or other item so that related items point in similar directions.',
        'A sentence embedding is often produced by a model trained specifically for similarity and may pool information across positions. It is not simply one raw token embedding.',
        'After normalizing vectors, a dot product gives cosine similarity. This creates a useful ranking signal, but similarity is not factual correctness, logical entailment, or authorization to use a document.',
      ],cta:'Explore a semantic map'},
      {kind:'widget',widget:EmbeddingPlay},
      {kind:'worked',title:'Rank a query against documents',prompt:'A query vector has similarities [0.82, 0.12, 0.67] to three document vectors.',stages:[
        {label:'Compare scores',body:'0.82 is largest, then 0.67, then 0.12.'},{label:'Rank',body:'Document 1 is nearest, document 3 second.'},{label:'Keep the limitation',body:'Nearest means embedding-similar, not automatically correct or safe.'},
      ],takeaway:'Embedding retrieval supplies candidates; later stages still validate relevance and evidence.'},
      {kind:'predict',prompt:'Query has shape (768,), documents have shape (10,000,768).',questions:[{label:'documents @ query shape',options:['(10000,)','(768,)','(10000,768)'],answer:0,reveal:'One dot-product similarity is produced per document.'}]},
      {kind:'mcq',prompt:'What can high cosine similarity safely tell you?',options:['The vectors are directionally similar under this embedding model','The document is factually correct','The document entails every query claim','The model is calibrated'],answer:0,explain:'Similarity is a learned retrieval signal, not a guarantee of truth or entailment.',nudge:'Do not turn a ranking score into a stronger claim than it supports.'},
    ],
  },
  {
    slug:'retrieval-basics',title:'Retrieval-Augmented Generation',emoji:'📚',blurb:'Keep changing, citable knowledge outside model weights and place evidence in context.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['semantic-embeddings','inference-loop'],outcomes:['Trace a basic RAG pipeline','Explain when retrieval beats fine-tuning','Compute a context budget'],concepts:['RAG','vector index','top-k retrieval','grounding','citation','context budget'],
    steps:[
      {kind:'concept',title:'Retrieve evidence before generating',lines:[
        'Model weights contain patterns learned during training, but those patterns are hard to update and cannot point to a source. Retrieval-augmented generation (RAG) keeps documents in an external index.',
        'At runtime, embed the question, retrieve relevant chunks, place them in the prompt, and ask the model to answer from that evidence. Updating the index is faster than retraining, and retrieved passages can support citations.',
        'Retrieval reduces unsupported guessing but does not remove it. The retriever can miss evidence, retrieve stale or malicious text, and the generator can still ignore or misread context.',
      ],cta:'Tune the retriever'},
      {kind:'widget',widget:RagPlay},
      {kind:'worked',title:'Trace one grounded answer',prompt:'A user asks about a policy changed yesterday.',stages:[
        {label:'Retrieve',body:'Search the current policy index for relevant passages.'},{label:'Construct context',body:'Include the question, instructions, and selected passages.'},{label:'Generate with evidence',body:'Ask the model to answer only from passages and attach source references.'},{label:'Verify',body:'Check whether answer claims are supported by the retrieved text.'},
      ],takeaway:'RAG is a pipeline, not a new kind of model weight.'},
      {kind:'mcq',prompt:'Which need most strongly favors RAG over fine-tuning?',options:['Facts change weekly and answers require citations','Response tone should be more concise','A fixed JSON schema must be followed','The model needs a smaller vocabulary'],answer:0,explain:'External documents are updateable and retain provenance. Fine-tuning is better suited to stable behavior patterns.',nudge:'Which need depends on freshness and sources?'},
      {kind:'numeric',prompt:'Budget the context window.',questions:[{label:'8192 total − 1200 reserved, chunks of 600 → maximum whole chunks',answer:11,tolerance:0,reveal:'(8192−1200)/600=11.65, so only 11 complete chunks fit.'}]},
    ],
  },
  {
    slug:'retrieval-quality',title:'Lexical, Semantic, and Hybrid Retrieval',emoji:'🔎',blurb:'Diagnose retrieval failures before adding more context.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['retrieval-basics'],outcomes:['Distinguish lexical and semantic retrieval','Explain hybrid fusion and reranking','Explain why larger k is not always better'],concepts:['lexical retrieval','BM25','dense retrieval','rank fusion','reranker','lost in the middle'],
    steps:[
      {kind:'concept',title:'Exact words and meaning fail differently',lines:[
        'Lexical retrieval — the most common algorithm is BM25, which scores matches by combining term frequency (how often the word appears in the document) with inverse document frequency (how rare the word is across all documents) — is excellent for identifiers, product codes, names, and exact phrases, but does not understand paraphrases.',
        'Dense semantic retrieval compares embeddings. It can connect paraphrases but may confuse concepts that share broad meaning or miss an exact rare identifier.',
        'Hybrid retrieval combines candidate lists. Rank fusion merges them; a reranker then reads query-document pairs more deeply. Retrieving more chunks can hurt when irrelevant text consumes context or important evidence lands in poorly attended middle positions.',
      ],cta:'Diagnose the miss'},
      {kind:'worked',title:'Apollo is ambiguous',prompt:'Query: “When did Apollo 11 land?” One candidate is a theater page; another is the Moon mission page.',stages:[
        {label:'Lexical clue',body:'Both contain “Apollo,” but exact terms “11” and “land” help lexical matching.'},{label:'Semantic clue',body:'The mission page matches spaceflight meaning; the theater page matches a different sense of Apollo.'},{label:'Fuse and rerank',body:'Take candidates from both methods and let a reranker compare the full query with each passage.'},
      ],takeaway:'Hybrid retrieval works because the methods make different mistakes.'},
      {kind:'mcq',prompt:'A query contains an exact error code “ZX-417”. Which signal is especially valuable?',options:['Lexical exact-match retrieval','Only sentence length','High decoding temperature','A larger generation model'],answer:0,explain:'Rare identifiers are where term-based retrieval is strongest.',nudge:'Which method preserves exact symbols rather than only meaning?'},
      {kind:'mcq',prompt:'Why can increasing retrieval k reduce answer quality?',options:['Irrelevant chunks consume context and distract generation','The index permanently deletes top documents','Softmax stops summing to 1','The tokenizer changes IDs'],answer:0,explain:'More context is not free; precision, ordering, and context position matter.',nudge:'Ask what occupies the finite context window.'},
      {kind:'predict',prompt:'Choose the pipeline order.',questions:[{label:'hybrid production retrieval',options:['lexical+dense candidates → fuse → rerank → generate','generate → retrieve → train','rerank → tokenize documents → delete index'],answer:0,reveal:'Cheap retrieval creates candidates; deeper reranking narrows them before generation.'}]},
    ],
  },

  {
    slug:'tool-use',title:'Tool Calls and the Agent Loop',emoji:'🤖',blurb:'Turn a model response into a controlled loop over external functions.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['inference-loop','retrieval-basics'],outcomes:['Trace a structured tool call','Explain observation grounding','Design a stopping condition'],concepts:['tool schema','tool call','observation','agent loop','turn budget','ReAct'],
    steps:[
      {kind:'concept',title:'The model requests; the program executes',lines:[
        'A language model cannot directly browse, run code, or query a database. A tool-enabled system gives it function descriptions and asks it to emit a structured request, typically a function name plus JSON arguments.',
        'The surrounding program validates the request, executes the real function, and returns the result as an observation. The model can then reason from that observation and either call another tool or answer.',
        'An agent is this loop plus control policy. Good control includes allowed tools, argument validation, a turn or cost budget, and a clear condition for when enough evidence has been gathered.',
        'The ReAct pattern interleaves explicit reasoning steps (such as \'I need the current weather in Paris\') with tool calls, making the model\'s intermediate logic visible and easier to debug.',
      ],cta:'Make tool decisions'},
      {kind:'widget',widget:AgentPlay},
      {kind:'worked',title:'One safe weather lookup',prompt:'User asks: “Should I carry an umbrella in Paris today?”',stages:[
        {label:'Request',body:'Model emits get_weather({"city":"Paris"}).'},{label:'Validate and execute',body:'The program checks schema and permission, then calls the weather service.'},{label:'Observe',body:'Tool result is inserted into context as data, not trusted instructions.'},{label:'Answer or continue',body:'If the result is sufficient, stop; otherwise request another allowed tool.'},
      ],takeaway:'The model proposes actions. Deterministic application code owns validation, execution, and limits.'},
      {kind:'mcq',prompt:'An agent searches 12 times after it already has enough evidence. What is missing?',options:['A stopping condition or budget','A larger embedding table','A causal mask','More experts'],answer:0,explain:'Without sufficiency criteria and limits, the loop can continue even when extra calls add little value.',nudge:'What decision should happen after each observation?'},
      {kind:'mcq',prompt:'How should tool output be treated when it contains text?',options:['As untrusted data that may need validation, not new system instructions','As automatically authoritative instructions','As model weights','As a replacement tokenizer'],answer:0,explain:'Web pages and tool results can contain errors or hostile instructions. Application policy remains in control.',nudge:'Who is authorized to change the agent’s rules?'},
    ],
  },
  {
    slug:'agent-reliability',title:'Reliable Agents: Budgets, Memory, and Failure',emoji:'🧯',blurb:'Design for loops that terminate, stay within context, and fail safely.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['tool-use','validation-generalization'],outcomes:['Budget agent turns and context','Distinguish working memory from durable state','Choose safe failure behavior'],concepts:['turn budget','token budget','working context','external state','retry limit','fallback'],
    steps:[
      {kind:'concept',title:'A loop needs an operating envelope',lines:[
        'Every agent turn adds model input, output, and tool observations to context. Without limits, latency, cost, and context size grow. A turn budget bounds iterations; a token or deadline budget bounds total work.',
        'Context is temporary working memory. Durable facts, task state, and idempotency keys — markers ensuring that running the same operation twice has the same effect as running it once, which is critical for payment and state-change operations — belong in an external store with explicit read/write rules. Summaries can compress context but may lose details.',
        'Failures must be designed: retry only transient errors, cap retries, preserve partial state, and fall back to a safe response or human handoff when confidence or evidence is insufficient.',
      ],cta:'Budget the loop'},
      {kind:'worked',title:'Count worst-case context growth',prompt:'Start with 500 tokens. Each of 10 turns adds 100 reasoning, 20 tool-call, and 200 observation tokens.',stages:[
        {label:'Per turn',body:'100+20+200=320 tokens.'},{label:'Ten turns',body:'10×320=3200 tokens.'},{label:'Add starting context',body:'500+3200=3700 tokens before any extra formatting or repeated history.'},
      ],takeaway:'Budget from the worst case, then design compaction or stopping before the limit.'},
      {kind:'numeric',prompt:'Compute the stated worst case.',questions:[{label:'starting 500 + 10×320',answer:3700,tolerance:0,unit:'tokens',reveal:'The arithmetic budget is 3700 tokens.'}]},
      {kind:'mcq',prompt:'Where should a durable “payment already sent” marker live?',options:['In an external transactional state store','Only in the model’s context','Inside a random seed','In temperature settings'],answer:0,explain:'Context can be truncated or replayed. Durable side-effect state needs application-owned persistence.',nudge:'Which location survives a restart and supports idempotency?'},
      {kind:'predict',prompt:'A tool returns a permanent validation error.',questions:[{label:'best behavior',options:['Stop retrying and surface a controlled failure','Retry forever','Raise temperature','Delete prior context'],answer:0,reveal:'Retries help transient failures, not invalid requests. Infinite retries amplify cost and risk.'}]},
    ],
  },
  {
    slug:'application-capstone',title:'Grounded Assistant Checkpoint',emoji:'🏆',blurb:'Combine retrieval, tools, adaptation, and reliability in one system decision.',minutes:9,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['retrieval-quality','agent-reliability','calibration'],outcomes:['Choose retrieval versus fine-tuning','Design a grounded tool loop','Identify confidence and provenance risks'],concepts:['system integration','grounding','adaptation choice','safe fallback'],
    steps:[
      {kind:'concept',title:'Choose the mechanism that matches the failure',lines:[
        'A production assistant combines several layers. Fine-tuning shapes stable behavior. Retrieval supplies fresh, citable evidence. Tools perform actions or exact computation. Calibration and validation decide when to trust, retry, or escalate.',
        'The strongest design is not the one with the most components. It is the smallest pipeline whose components each address a named failure mode.',
      ],cta:'Design the system'},
      {kind:'mcq',prompt:'A policy changes daily and every answer needs a source. Primary mechanism?',options:['Retrieval from a maintained policy index','Full fine-tuning every morning','Higher temperature','More attention heads'],answer:0,explain:'Freshness and provenance call for external evidence.',nudge:'Which mechanism updates without changing model weights?'},
      {kind:'mcq',prompt:'The assistant must create a refund only after explicit authorization. Who should enforce that rule?',options:['Application code around the tool, with validated permissions','The model’s confident wording','Embedding similarity','The tokenizer'],answer:0,explain:'Authorization and side-effect policy belong in deterministic trusted code.',nudge:'Which layer owns real-world permissions?'},
      {kind:'predict',prompt:'A retrieved passage conflicts with another source and confidence is low.',questions:[{label:'best response',options:['Acknowledge uncertainty, avoid the action, and escalate or ask for clarification','Invent a tie-breaker','Choose the longer passage','Increase temperature'],answer:0,reveal:'Safe fallbacks preserve uncertainty and prevent unsupported action.'}]},
      {kind:'numeric',prompt:'Context budget: 16,000 total, 2,000 reserved, chunks of 700.',questions:[{label:'maximum whole chunks',answer:20,tolerance:0,reveal:'(16000−2000)/700=20 exactly.'}]},
    ],
  },
]
