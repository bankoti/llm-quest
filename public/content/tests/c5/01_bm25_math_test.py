import math
rare=inverse_document_frequency(100,2)
common=inverse_document_frequency(100,80)
assert rare>common>0
s1=term_score(term_frequency=1,document_length=100,average_length=100,idf=rare)
s2=term_score(term_frequency=2,document_length=100,average_length=100,idf=rare)
assert s2<2*s1,"BM25 saturates"
short=term_score(term_frequency=1,document_length=50,average_length=100,idf=rare)
long_=term_score(term_frequency=1,document_length=200,average_length=100,idf=rare)
assert short>long_,"shorter docs score higher"
print(f"✓ IDF rare={rare:.3f} common={common:.3f}")
print("\n+150 XP — BM25 Math complete.")
