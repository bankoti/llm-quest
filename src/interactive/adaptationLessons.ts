import type { InteractiveLesson } from './types'
import { LoraPlay, DistillPlay, RlhfPipelinePlay, RewardHackPlay, CalibrationPlay } from './widgets'
const MODULE='adaptation'
const MODULE_TITLE='Post-training and behavior'
export const ADAPTATION_LESSONS: InteractiveLesson[] = [
  {
    slug:'finetuning-basics',title:'Fine-Tuning and Forgetting',emoji:'🛠️',blurb:'Adapt a pretrained model to examples without confusing knowledge with behavior.',minutes:7,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['validation-generalization'],outcomes:['Explain supervised fine-tuning','Distinguish behavior adaptation from factual retrieval','Explain catastrophic forgetting'],concepts:['pretraining','supervised fine-tuning','instruction-response pair','catastrophic forgetting'],
    steps:[
      {kind:'concept',title:'Continue training on a narrower objective',lines:[
        'Pretraining teaches broad next-token patterns from large text collections. Supervised fine-tuning (SFT) continues training on labeled input-output pairs, such as an instruction and an ideal response.',
        'SFT is good for behavior: answer format, tone, task procedure, and domain style. It is a poor way to keep changing facts current because knowledge becomes distributed through weights and is difficult to cite or replace.',
        'Updating every weight on a narrow dataset can damage older abilities. This is catastrophic forgetting. Mixing general examples, using a smaller update, or freezing the base model can reduce it.',
      ],cta:'Choose the right adaptation'},
      {kind:'worked',title:'Fact update or behavior update?',prompt:'A support assistant must use a new response template and also know prices that change weekly.',stages:[
        {label:'Separate requirements',body:'Template compliance is behavior; weekly prices are changing facts.'},{label:'Choose SFT for behavior',body:'Fine-tune on examples of the required response structure.'},{label:'Keep facts outside weights',body:'Retrieve current price data at runtime so it remains updateable and citable.'},
      ],takeaway:'Fine-tune how the model behaves; retrieve facts that need freshness and provenance.'},
      {kind:'mcq',prompt:'Which need is the best fit for supervised fine-tuning?',options:['Teaching a stable output format from examples','Updating a price list every hour','Providing exact citations for new policies','Giving the model a larger context window'],answer:0,explain:'SFT changes learned behavior. Rapidly changing, citable facts belong in retrieval or tools.',nudge:'Ask whether the requirement is a reusable behavior or changing information.'},
      {kind:'mcq',prompt:'After narrow medical fine-tuning, a model loses coding ability. What happened?',options:['Catastrophic forgetting','Top-p collapse','Tokenization drift','Causal leakage'],answer:0,explain:'Updates that improve the new task overwrote parameters useful for older skills.',nudge:'The key symptom is losing an old capability while learning a new one.'},
    ],
  },
  {
    slug:'lora',title:'LoRA: Small Trainable Adapters',emoji:'🔧',blurb:'Understand low-rank adaptation after matrix multiplication and fine-tuning are secure.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['finetuning-basics','matmul','optimizer-loop'],outcomes:['Explain frozen-base adaptation','Explain rank as a limited number of update directions','Compare merged and unmerged serving'],concepts:['LoRA','adapter','matrix rank intuition','frozen base','merge'],
    steps:[
      {kind:'concept',title:'Learn a small update instead of replacing W',lines:[
        'Full fine-tuning stores gradients and optimizer state for every weight. Optimizer state is extra per-weight memory, such as running averages used to choose better updates, so training memory can be several times weight memory.',
        'LoRA freezes the base weight matrix W and learns a small update B@A. A maps the large feature space down to r directions; B maps those directions back up. The rank r controls how many independent update directions the adapter can express.',
        'At deployment, B@A can be added into W for zero extra matrix multiplications, or kept separate so many small adapters share one base model.',
      ],cta:'Choose an adapter rank'},
      {kind:'worked',title:'Why rank saves parameters',prompt:'W is 4096×4096. Compare a full update with rank r=8.',stages:[
        {label:'Full update',body:'A full delta needs 4096×4096 ≈ 16.8 million trainable numbers.'},{label:'Factor the update',body:'A has 8×4096 and B has 4096×8: about 65 thousand numbers total.'},{label:'Interpret rank',body:'The adapter can combine 8 learned update directions instead of independently changing every matrix direction.'},
      ],takeaway:'Low rank is a capacity limit on the update, not eight copies of the model.'},
      {kind:'widget',widget:LoraPlay},
      {kind:'mcq',prompt:'Why can a small LoRA adapter work well?',options:['Many task-specific weight changes lie in a small set of useful directions','The frozen base secretly updates','Rank 8 stores eight full models','Softmax compresses all gradients'],answer:0,explain:'LoRA directly represents a low-dimensional update while preserving the pretrained base.',nudge:'The claim concerns the structure of the update, not hidden base changes.'},
      {kind:'predict',prompt:'Choose a serving strategy.',questions:[
        {label:'one permanent model variant, lowest latency',options:['Merge adapter into W','Keep every adapter active','Retrain tokenizer'],answer:0,reveal:'After merging, the architecture and matrix count match the base model.'},
        {label:'twenty customer variants sharing one base',options:['Keep thin adapters separate','Store twenty full merged bases','Use one random adapter'],answer:0,reveal:'Separate adapters trade a small runtime cost for large memory savings and fast switching.'},
      ]},
    ],
  },
  {
    slug:'distillation',title:'Distillation: A Teacher for a Smaller Model',emoji:'🧪',blurb:'Transfer a teacher’s graded beliefs, not only its final answer.',minutes:7,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['softmax-probabilities','training-objective'],outcomes:['Distinguish hard and soft targets','Explain dark knowledge','Explain teacher-student training'],concepts:['teacher model','student model','hard label','soft target','distillation','dark knowledge'],
    steps:[
      {kind:'concept',title:'The wrong answers also carry information',lines:[
        'A hard target says only which answer is correct: Paris=1, every other city=0. A teacher distribution may say Paris=0.85, Lyon=0.08, Rome=0.04. Those smaller probabilities reveal relationships the hard label hides.',
        'Distillation trains a smaller student to match a larger teacher’s output distribution. The student learns both the answer and how the teacher ranks alternatives.',
        'This transferred structure is often called dark knowledge. It can improve a small model without copying the teacher’s architecture or weights.',
      ],cta:'Compare targets'},
      {kind:'widget',widget:DistillPlay},
      {kind:'worked',title:'One target, two lessons',prompt:'The correct class is “cat”; teacher probabilities are cat 0.7, dog 0.25, airplane 0.05.',stages:[
        {label:'Hard target',body:'[1,0,0] says dog and airplane are equally wrong.'},{label:'Soft target',body:'[0.7,0.25,0.05] says dog is a much more plausible confusion than airplane.'},{label:'Student signal',body:'Matching the teacher transfers that similarity structure.'},
      ],takeaway:'Soft targets teach relative plausibility, not just correctness.'},
      {kind:'mcq',prompt:'Why are soft teacher targets useful?',options:['They give learning signal about relationships among alternatives','They remove the need for training data','They make the student larger','They guarantee identical behavior'],answer:0,explain:'Non-zero probabilities on alternatives convey how the teacher organizes the output space.',nudge:'What information is lost when every wrong answer becomes zero?'},
      {kind:'predict',prompt:'The teacher is confidently wrong on a biased example.',questions:[{label:'risk to the student',options:['The student can inherit the teacher’s error or bias','The student automatically corrects it','Soft targets become one-hot'],answer:0,reveal:'Distillation transfers teacher behavior, including mistakes, unless data or objectives correct them.'},{label:'best safeguard',options:['Evaluate the student on independent data and targeted slices','Assume a smaller model removes bias','Drop all soft targets'],answer:0,reveal:'Independent evaluation reveals which teacher errors transferred.'}]},
    ],
  },

  {
    slug:'rlhf-reward-models',title:'Reward Models and RLHF',emoji:'🎯',blurb:'Build from preference pairs to a reward signal, then optimize a policy with PPO.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['finetuning-basics','softmax-probabilities'],outcomes:['Explain preference pairs','Explain reward model training','Explain PPO-style policy optimization'],concepts:['preference pair','reward model','policy','PPO','KL divergence','RLHF'],
    steps:[
      {kind:'concept',title:'Correct-looking text is not yet preferred behavior',lines:[
        'SFT teaches from demonstrations. Preference learning adds comparisons: for one prompt, a rater chooses response A over response B. A reward model learns to map a prompt-response pair to one scalar preference score.',
        'Why comparisons instead of more demonstrations? Judging which of two responses is better is easier and cheaper than writing an ideal one, and it captures a signal SFT cannot: among several plausible outputs, which one people actually prefer.',
        'In reinforcement learning, an agent learns from scalar reward signals rather than explicit correct labels. The model\'s current learned token-choice behavior is called a policy. There is no ground-truth answer key, only feedback on whether outcomes were good.',
        'PPO-style RL updates the policy to increase reward. A KL penalty measures how different the updated token distribution is from the SFT reference model and acts as a tether against extreme drift.',
      ],cta:'Order the pipeline'},
      {kind:'widget',widget:RlhfPipelinePlay},
      {kind:'worked',title:'One preference pair through RLHF',prompt:'For a prompt, response A is chosen over response B.',stages:[
        {label:'Create supervision',body:'The pair records A ≻ B; it does not yet provide a numeric score.'},{label:'Train the reward model',body:'Learn to score A higher than B from many such pairs.'},{label:'Optimize the policy',body:'Run PPO to increase reward while the KL penalty keeps the model close to the SFT baseline.'},
      ],takeaway:'RLHF uses preference data to train a reward model, then optimizes the language model against it.'},
      {kind:'widget',widget:RewardHackPlay},
      {kind:'mcq',prompt:'What is the KL term doing in PPO-style RLHF?',options:['Penalizing large drift from the reference language model','Deleting low-reward examples','Converting scores to token IDs','Updating the reward model during inference'],answer:0,explain:'KL divergence measures distribution difference. The penalty preserves useful language behavior while optimizing reward.',nudge:'Think of it as a tether to the starting model.'},
      {kind:'mcq',prompt:'Why train a separate reward model rather than optimizing preferences directly?',options:['A reward model can evaluate any new response, enabling online optimization','Reward models use fewer parameters','Direct optimization requires no data','The KL penalty requires it'],answer:0,explain:'A trained reward model generalizes to score novel responses, providing the signal for policy optimization.',nudge:'What does the policy need at each training step?'},
    ],
  },
  {
    slug:'direct-preference-optimization',title:'DPO: Preferences Without a Reward Model',emoji:'⚖️',blurb:'Skip the separate reward model and RL loop with a direct pairwise objective.',minutes:7,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['rlhf-reward-models'],outcomes:['Explain DPO objective','Contrast DPO with RLHF','Explain reference model role'],concepts:['DPO','direct preference optimization','reference model','likelihood ratio'],
    steps:[
      {kind:'concept',title:'Preferences can directly shape probabilities',lines:[
        'RLHF requires two components: a reward model trained from preferences, and an RL loop to optimize the language model policy. DPO removes both.',
        'DPO reframes preference learning as a supervised objective: directly increase the relative likelihood of chosen responses over rejected ones, anchored against a reference model. No separate reward model is trained and no online RL loop runs.',
        'The reference model acts as a tether. DPO maximizes the log-ratio of chosen probability to rejected probability relative to that same ratio under the reference model, applying a KL-like constraint implicitly.',
        'The strength of this tether is controlled by a temperature parameter β: higher β keeps the updated model closer to the reference model, while lower β allows more deviation toward preferred responses.',
        'A newer relative, GRPO (group relative policy optimization), returns to the RL loop but drops the separate value network: it samples a group of responses per prompt and scores each against the group average reward. It drives reasoning-focused training such as DeepSeek-R1.',
      ],cta:'Compare the two paths'},
      {kind:'worked',title:'One preference pair through DPO',prompt:'For a prompt, response A is chosen over response B.',stages:[
        {label:'No reward model needed',body:'DPO uses the preference pair directly as a supervised signal.'},{label:'Maximize the ratio',body:'Increase log P(A) relative to log P(B), compared to the reference model\'s ratio.'},{label:'Implicit constraint',body:'The reference model anchors the update, preventing extreme drift without an explicit KL coefficient.'},
      ],takeaway:'DPO turns preference comparisons into a direct objective — simpler pipeline, same preference data.'},
      {kind:'mcq',prompt:'Which statement describes DPO?',options:['It directly prefers chosen responses over rejected ones without training a separate reward model or running an online RL loop','It requires a trained reward model at inference time','It trains only the tokenizer','It samples uniformly from the reward model'],answer:0,explain:'DPO turns preference comparisons into a direct supervised-style objective relative to a reference model.',nudge:'Which path removes the separate reward-model-and-PPO loop?'},
      {kind:'mcq',prompt:'When might RLHF be preferred over DPO?',options:['When online reward signals are available, enabling continued policy improvement','Whenever the dataset is small','When the model uses BPE tokenization','DPO is always preferred'],answer:0,explain:'A separately trained reward model can evaluate new responses and support online learning. DPO is an offline supervised objective.',nudge:'What can a live reward model do that a fixed DPO objective cannot?'},
    ],
  },
  {
    slug:'calibration',title:'Confidence and Calibration',emoji:'🎚️',blurb:'Separate correctness, probability, and confident-sounding language.',minutes:6,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['softmax-probabilities'],outcomes:['Define calibration','Interpret a reliability gap','Explain why stated confidence can mislead'],concepts:['calibration','confidence bin','reliability','stated confidence','expected calibration error'],
    steps:[
      {kind:'concept',title:'80% confidence should mean 80% correct',lines:[
        'A system is calibrated when predictions made with 80% confidence are correct about 80% of the time across many cases. Calibration is a group-level reliability property, not proof that one answer is right.',
        'Models can be accurate but overconfident, or less accurate but honestly uncertain. Expected calibration error (ECE) summarizes gaps between confidence bins and accuracy: it is the weighted average absolute gap across bins, where each bin is weighted by the fraction of predictions it contains. A perfectly calibrated system has ECE of zero.',
        'Spoken phrases such as “I am certain” are generated text, not a guaranteed readout of internal probability. After the RLHF and DPO lessons, you can trace why preference training may reward confident tone even when factual accuracy does not improve.',
      ],cta:'Inspect reliability'},
      {kind:'widget',widget:CalibrationPlay},
      {kind:'worked',title:'Read one confidence bin',prompt:'Among 100 answers labeled 80% confident, 60 are correct.',stages:[
        {label:'Expected if calibrated',body:'About 80 of 100 should be correct.'},{label:'Observed',body:'Only 60 are correct.'},{label:'Gap',body:'The bin is overconfident by 20 percentage points.'},
      ],takeaway:'Calibration compares claimed probability with long-run correctness.'},
      {kind:'numeric',prompt:'Compute the absolute calibration gap.',questions:[{label:'80% confidence, 60% accuracy',answer:20,tolerance:0,unit:'percentage points',reveal:'|80−60| = 20 percentage points.'}]},
      {kind:'mcq',prompt:'A model says “I am completely certain.” What can you safely conclude?',options:['Nothing about correctness without measured calibration evidence','The answer must be correct','Its top token probability is exactly 1','RLHF was not used'],answer:0,explain:'Confident wording is behavior. Reliability must be measured across outcomes.',nudge:'Separate generated tone from empirical accuracy.'},
    ],
  },

  {
    slug:'adaptation-capstone',title:'Adaptation Checkpoint',emoji:'🏅',blurb:'Retrieve and connect fine-tuning, preference learning, and calibration.',minutes:8,
    moduleId:MODULE,moduleTitle:MODULE_TITLE,prerequisites:['direct-preference-optimization','calibration','lora'],outcomes:['Choose between SFT, LoRA, RLHF, and DPO for a requirement','Diagnose calibration and forgetting risks','Trace a preference learning pipeline'],concepts:['adaptation choice','pipeline integration','risk diagnosis'],
    steps:[
      {kind:'concept',title:'Match the mechanism to the need',lines:['Fine-tuning shapes behavior; LoRA does so with fewer trainable parameters; RLHF and DPO shape preferences from comparisons; calibration measures whether stated confidence tracks accuracy.','This checkpoint introduces no new mechanism. It mixes earlier concepts because retrieving and connecting them under pressure makes knowledge usable.'],cta:'Start the checkpoint'},
      {kind:'mcq',prompt:'A model must adopt a concise JSON output format. Which approach fits best?',options:['Supervised fine-tuning on format examples','RLHF with vague preference pairs','Quantization','Increasing temperature'],answer:0,explain:'A stable output format is a behavior pattern best taught from demonstrations.',nudge:'Is this a behavior or a preference?'},
      {kind:'mcq',prompt:'You need multiple style variants sharing one base model in production. Best mechanism?',options:['Separate LoRA adapters per variant','Full fine-tuning for each variant','Raise temperature per variant','One distilled student per variant'],answer:0,explain:'LoRA adapters are small, can share a frozen base, and switch quickly.',nudge:'What keeps memory low while serving many variants?'},
      {kind:'predict',prompt:'A model trained with RLHF says "I am absolutely certain" about a wrong answer.',questions:[
        {label:'most likely explanation',options:['Preference training rewarded confident tone independent of accuracy','The model verified the fact at inference time','Softmax guarantees correctness'],answer:0,reveal:'RLHF can decouple stated confidence from actual reliability.'},
        {label:'best mitigation',options:['Measure calibration and add uncertainty signals','Remove all fine-tuning','Disable softmax'],answer:0,reveal:'Calibration measurement detects the gap; techniques like verbalized uncertainty or retrieval can reduce it.'},
      ]},
      {kind:'numeric',prompt:'LoRA arithmetic.',questions:[
        {label:'W is 2048x2048. Rank-16 adapter: total A+B parameters',answer:65536,tolerance:0,reveal:'A is 16x2048=32768, B is 2048x16=32768. Total 65,536.'},
        {label:'ratio of adapter params to full W params (percent, 1 decimal)',answer:1.6,tolerance:0.1,reveal:'65536 / (2048x2048) = 65536/4194304 = 0.0156 = 1.6%.'},
      ]},
    ],
  },
]
