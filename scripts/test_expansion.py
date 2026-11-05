"""Behavioral negative controls and executable self-contained notebook tests."""
import contextlib
import io
import json
from pathlib import Path
import runpy
import sys
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
CONTENT=ROOT/'public/content'


def reject_mutation(name, mutate):
    scope={'__name__':'__test__'}
    exec(compile((CONTENT/'solutions'/f'{name}.py').read_text(),name,'exec'),scope)
    mutate(scope)
    try:
        with contextlib.redirect_stdout(io.StringIO()):
            exec(compile((CONTENT/'tests'/f'{name}_test.py').read_text(),name+'_test','exec'),scope)
    except (AssertionError,ValueError,TypeError,IndexError):
        print(f'PASS negative control: {name}')
    else:
        raise AssertionError(f'Incorrect implementation accepted: {name}')


def negative_controls():
    # Run the strengthened public bigram grader against a correct implementation
    # and the formerly sufficient uniform-loss shortcut.
    def ce(z,y):
        shifted=z-z.max(-1,keepdims=True)
        return float((np.log(np.exp(shifted).sum(-1))-shifted[np.arange(len(y)),y]).mean())
    def bigram(x,e,y=None):
        logits=e[x]
        return logits,None if y is None else ce(logits.reshape(-1,len(e)),y.ravel())
    grader=(CONTENT/'tests/c1/04_bigram_test.py').read_text()
    with contextlib.redirect_stdout(io.StringIO()):
        exec(grader,dict(np=np,cross_entropy=ce,bigram_forward=bigram))
    try:
        exec(grader,dict(np=np,cross_entropy=lambda z,y:np.log(z.shape[-1]),bigram_forward=lambda x,e,y=None:(e[x],None if y is None else np.log(len(e)))))
    except AssertionError:
        print('PASS negative control: c1/04_bigram')
    else:
        raise AssertionError('Uniform-loss bigram shortcut accepted')
    reject_mutation('c1/07_transformer',lambda s:s.update(transformer_block=lambda x,*args:x.copy()))
    reject_mutation('c1/06_attention',lambda s:s.update(causal_attention=lambda q,k,v:(v.copy(),np.broadcast_to(np.eye(q.shape[1]),(len(q),q.shape[1],q.shape[1])).copy())))
    reject_mutation('c10/01_tokenizer',lambda s:s.update(encode_bpe=lambda text,merges:list(text.encode())))
    reject_mutation('c10/04_classification',lambda s:s.update(last_valid=lambda h,m:h[np.arange(len(h)),m.sum(-1)-1]))
    def wrong_mask(s):
        original=s['collate_sft']
        def wrong(*args,**kwargs):
            result=original(*args,**kwargs);result['loss_mask']=result['attention_mask'].copy();return result
        s['collate_sft']=wrong
    reject_mutation('c10/05_instruction',wrong_mask)
    reject_mutation('c10/06_lora',lambda s:s.update(lora_forward=lambda x,w,a,b,alpha:x@w))
    reject_mutation('c10/08_decoder',lambda s:s.update(decoder_logits=lambda ids,e,p,blocks,heads:np.zeros((*ids.shape,len(e)))))
    reject_mutation('c11/05_interpolation',lambda s:s.update(ridge_fit=lambda x,y,penalty=0:np.zeros((x.shape[1],y.shape[1]))))
    reject_mutation('c12/02_trajectory',lambda s:s.update(trajectory_score=lambda x,a,w,b:(0.,np.zeros_like(w),0.)))
    def wrong_ratio(s):
        original=s['clipped_grpo']
        s['clipped_grpo']=lambda z,old,ref,*args,**kwargs:original(z,ref,ref,*args,**kwargs)
    reject_mutation('c12/04_grpo',wrong_ratio)
    reject_mutation('c12/05_rewards',lambda s:s.update(addition_reward=lambda text,a,b:float(str(a+b) in str(text))))
    reject_mutation('c13/03_actions',lambda s:s.update(block_mask=lambda lengths:np.tril(np.ones((sum(lengths),sum(lengths)),bool))))
    reject_mutation('c13/04_latents',lambda s:s.update(latent_mse=lambda p,t,m:float(((p-t)**2).mean())))


def numeric_regressions():
    for name in ('c10/02_training', 'c12/04_grpo'):
        scope={'__name__':'__test__'}
        exec(compile((CONTENT/'solutions'/f'{name}.py').read_text(),name,'exec'),scope)
        exec(compile((CONTENT/'tests'/f'{name}_test.py').read_text(),name+'_test','exec'),scope)
    for script in ('test_dynamics_numerics.py', 'test_scratch_updates.py'):
        runpy.run_path(str(ROOT/'scripts'/script),run_name='__main__')


def notebooks(names=None):
    manifest=json.loads((CONTENT/'expansion-manifest.json').read_text())
    for entry in manifest:
        name=entry['name']
        if names is not None and name not in names:
            continue
        notebook=json.loads((ROOT/'colab'/f'{name}.ipynb').read_text())
        scope={'__name__':'__main__'}
        captured=io.StringIO()
        with contextlib.redirect_stdout(captured):
            for cell in notebook['cells']:
                if cell['cell_type']=='code' and set(cell['metadata'].get('tags',[])) & {'setup','reference','reference-grade','experiment'}:
                    exec(compile(''.join(cell['source']),f'{name}:{cell["id"]}','exec'),scope)
        assert captured.getvalue().strip(),f'{name}: experiment emitted no evidence'
        print(f'PASS self-contained notebook: {name} ({len(captured.getvalue())} output characters)')


if __name__=='__main__':
    if '--numerics' in sys.argv:
        numeric_regressions()
        manifest=json.loads((CONTENT/'expansion-manifest.json').read_text())
        affected={entry['name'] for entry in manifest if entry['experiment'] in
                  ('scratch_training.py','scratch_adaptation.py','dynamics_modular.py')}
        notebooks(affected | {'c12/04_grpo'})
    else:
        negative_controls()
        numeric_regressions()
        notebooks()
