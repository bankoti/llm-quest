import numpy as np
np.random.seed(7); B,T,C=2,6,16; s=0.05; nh,nkv=4,2
x=np.random.randn(B,T,C)
Wq=np.random.randn(C,C)*s; Wk=np.random.randn(C,C)*s
Wv=np.random.randn(C,C)*s; Wo=np.random.randn(C,C)*s
Wg=np.random.randn(C,4*C)*s; Wu=np.random.randn(C,4*C)*s; Wd=np.random.randn(4*C,C)*s
out=modern_decoder_block(x,Wq,Wk,Wv,Wo,Wg,Wu,Wd,nh,nkv)
assert out.shape==(B,T,C),f"shape: {out.shape}"
z=np.ones((2,4)); Mg=np.eye(4)*0.5; Mu=np.eye(4)*0.5; Md=np.eye(4)
ff=swiglu(z,Mg,Mu,Md)
assert ff.shape==(2,4)
assert np.all(ff>0),"swiglu with positive input should be positive"
print("✓ swiglu correct")
print("✓ modern_decoder_block shape correct")
print("\n+400 XP — Modern Decoder Block. Boss fight won. 🏆")
