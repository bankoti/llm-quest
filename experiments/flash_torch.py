"""PyTorch tiled forward/backward agreement and optional explicit CUDA backend.

CPU: uv run --with torch python experiments/flash_torch.py
On CUDA, report median runtime and peak allocated bytes, not a universal speedup.
"""
import statistics
import time
import torch
import torch.nn.functional as F

torch.set_num_threads(1)

def torch_tiled(q, k, v, block=3):
    rows = []
    t, d = q.shape
    for start in range(0, t, block):
        end = min(start + block, t)
        m = torch.full((end-start,), -torch.inf, dtype=q.dtype, device=q.device)
        l = torch.zeros_like(m)
        a = torch.zeros(end-start, v.shape[-1], dtype=q.dtype, device=q.device)
        for col in range(0, end, block):
            stop = min(col+block, t)
            s = q[start:end] @ k[col:stop].T / d**.5
            allowed = torch.arange(start,end,device=q.device)[:,None] >= torch.arange(col,stop,device=q.device)
            s = s.masked_fill(~allowed, -torch.inf)
            new_m = torch.maximum(m, s.max(-1).values)
            correction = (m-new_m).exp()
            p = (s-new_m[:,None]).exp()
            a = correction[:,None]*a + p @ v[col:stop]
            l = correction*l + p.sum(-1)
            m = new_m
        rows.append(a/l[:,None])
    return torch.cat(rows)

def verify():
    torch.manual_seed(19)
    q,k,v = [torch.randn(7,4,dtype=torch.float64,requires_grad=True) for _ in range(3)]
    actual = torch_tiled(q,k,v)
    expected = F.scaled_dot_product_attention(q,k,v,is_causal=True)
    torch.testing.assert_close(actual,expected,atol=1e-10,rtol=1e-10)
    actual_grad = torch.autograd.grad(actual.square().sum(),(q,k,v),retain_graph=True)
    expected_grad = torch.autograd.grad(expected.square().sum(),(q,k,v))
    for a,b in zip(actual_grad,expected_grad):
        torch.testing.assert_close(a,b,atol=1e-9,rtol=1e-9)
    print('CPU float64 tiled output and Q/K/V gradients match SDPA.')

def cuda_benchmark():
    if not torch.cuda.is_available():
        print('CUDA unavailable: GPU backend, timing and peak-memory measurements skipped.')
        return
    from torch.nn.attention import SDPBackend, sdpa_kernel
    q,k,v = [torch.randn(1,4,512,64,device='cuda',dtype=torch.float16) for _ in range(3)]
    def explicit():
        s = q @ k.transpose(-1,-2) / 8
        return s.masked_fill(~torch.ones(512,512,device='cuda',dtype=torch.bool).tril(),-torch.inf).softmax(-1) @ v
    def flash():
        with sdpa_kernel(SDPBackend.FLASH_ATTENTION):
            return F.scaled_dot_product_attention(q,k,v,is_causal=True)
    try:
        torch.testing.assert_close(flash(),explicit(),atol=.003,rtol=.003)
    except RuntimeError as error:
        print(f'Flash backend unavailable for this configuration: {error}')
        return
    print({'device':torch.cuda.get_device_name(), 'torch':torch.__version__, 'shape':list(q.shape),'dtype':str(q.dtype),'mode':'forward, no gradients'})
    for name, fn in [('explicit',explicit),('FLASH_ATTENTION backend',flash)]:
        for _ in range(5): fn()
        torch.cuda.synchronize()
        baseline = torch.cuda.memory_allocated()
        torch.cuda.reset_peak_memory_stats()
        samples=[]
        for _ in range(20):
            start=time.perf_counter(); fn(); torch.cuda.synchronize()
            samples.append((time.perf_counter()-start)*1000)
        print({'backend':name,'median_ms':statistics.median(samples),'p95_ms':sorted(samples)[18],
               'peak_extra_allocated_bytes':torch.cuda.max_memory_allocated()-baseline})

if __name__ == '__main__':
    verify()
    cuda_benchmark()
