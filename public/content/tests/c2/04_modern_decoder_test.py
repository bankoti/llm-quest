import numpy as np
np.random.seed(7); B,T,C=2,6,16; s=0.05; nh,nkv=4,2
x=np.random.randn(B,T,C)
Wq=np.random.randn(C,C)*s; Wk=np.random.randn(C,C)*s
Wv=np.random.randn(C,C)*s; Wo=np.random.randn(C,C)*s
Wg=np.random.randn(C,4*C)*s; Wu=np.random.randn(C,4*C)*s; Wd=np.random.randn(4*C,C)*s
out=modern_decoder_block(x,Wq,Wk,Wv,Wo,Wg,Wu,Wd,nh,nkv)
assert out.shape==(B,T,C),f"shape: {out.shape}"
assert not np.allclose(out, x), "block must transform x — check residual and attention/ffn paths"
# causality: perturbing a future token must not change earlier outputs
x_fut = x.copy(); x_fut[:, -1] += 10
out_fut = modern_decoder_block(x_fut,Wq,Wk,Wv,Wo,Wg,Wu,Wd,nh,nkv)
assert np.allclose(out[:,:-1], out_fut[:,:-1], atol=1e-4), "causality violated — future token leaked into earlier outputs"
z=np.ones((2,4)); Mg=np.eye(4)*0.5; Mu=np.eye(4)*0.5; Md=np.eye(4)
ff=swiglu(z,Mg,Mu,Md)
assert ff.shape==(2,4)
assert np.all(ff>0),"swiglu with positive input should be positive"
print("✓ swiglu correct")
print("✓ modern_decoder_block shape correct")
print("✓ causality: future token cannot affect earlier outputs")
print("\n+400 XP — Modern Decoder Block. Boss fight won. 🏆")
