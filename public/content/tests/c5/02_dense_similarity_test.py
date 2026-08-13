import numpy as np
a=np.array([1.,0.,0.]); b=np.array([1.,0.,0.]); c=np.array([0.,1.,0.]); d=np.array([-1.,0.,0.])
assert abs(cosine_similarity(a,b)-1.)<1e-6
assert abs(cosine_similarity(a,c))<1e-6
assert abs(cosine_similarity(a,d)+1.)<1e-6
np.random.seed(5)
query=np.array([1.,.5,0.]); docs=np.random.randn(10,3); docs[3]=query*2
result=top_k_documents(query,docs,k=3)
assert result[0]==3,f"most similar should be first: {result}"
normed=normalise(np.array([[3.,4.],[1.,0.]]))
assert np.allclose(np.linalg.norm(normed,axis=1),[1.,1.])
print("✓ cosine similarity correct")
print("✓ top_k ordering correct")
print("\n+150 XP — Dense Similarity complete.")
