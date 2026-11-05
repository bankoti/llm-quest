# From Pixels to Residual Tokens

Implement local convolution and patch tokenization, then inspect feature norms.

## Before You Start

Course 13. Entry course: 12. Budget about 75 minutes for reading, code, and one CPU experiment; optional sweeps take longer.

**Concept prerequisites:** transformer-block, dynamics-01_paths.

## What You Will Be Able to Do

- Compute convolution and pooling shapes
- Construct ViT patches
- Explain register-token artifacts

## Two ways to share computation across an image

A convolution uses the same small kernel at every spatial location. For a single-channel image and a k-by-k kernel, valid stride-one output has height H-k+1 and width W-k+1. Deep-learning libraries usually implement cross-correlation, without flipping the kernel; our lab follows that convention. Apply a nonlinear activation such as ReLU, then optionally pool nearby responses. Weight sharing and locality are useful image inductive biases.

A vision Transformer splits the image into fixed-size patches, flattens each patch, linearly projects it to a token vector, and adds position information. Attention can connect distant patches within one layer, while a small convolution expands its receptive field over layers. Neither architecture universally wins: data, compute, resolution, and task matter. The lab patch order is row-major across patches and row-major within each patch.

## A residual token can become workspace

The register-token study found unusually high-norm patch tokens in some trained vision Transformers, often in low-information image regions. These tokens could serve internal computation rather than local image description. Additional learned register tokens provide non-spatial workspace and improved feature behavior in the reported settings. A large norm is a diagnostic clue, not proof of a universal defect.

Compute per-token L2 norms and map spatial tokens back to their patch grid; exclude class/register tokens from that map. A model trained with registers differs from appending random tokens only at inference. The experiment compares synthetic patch norms and runs a small image classifier; it does not reproduce a pretrained ViT register benchmark. AlexNet provides a complementary historical regularization case: dropout and data augmentation helped a large CNN, but dropout is not the only reason it succeeded.

## Worked Example: Count patches and receptive fields

A 6x6 single-channel image, 3x3 convolution, and 2x2 nonoverlapping patches.

1. **Convolution:** Valid stride-one output is 4x4; each output initially sees a 3x3 region.
2. **Patches:** There are 3*3=9 patches, each with 4 scalar values before projection.
3. **Registers:** Adding two register tokens makes 11 tokens, but still only 9 spatial patches.

Keep spatial positions and non-spatial workspace separate when interpreting visual features.

## Coding Contract

Implement the public functions below. Private helpers are supplied where the exercise focuses on composition. NumPy/pure Python runs in the browser; the separate experiment uses autograd or a simulator when needed.

```python
# Generated starter; edit the functions in the course editor or notebook.
"""Inspectable single-channel convolution and row-major patchification."""
import numpy as np

def conv_valid(image, kernel):
    """Valid stride-one cross-correlation, no kernel flip, bias, or activation.

Finite 2D image [H,W], finite kernel [Kh,Kw] fitting the image, valid shapes
assumed. Return floating-point [H-Kh+1,W-Kw+1], computing products in
floating point even for integer inputs. Do not mutate inputs."""
    raise NotImplementedError('Implement this function, then run the checks.')

def patchify(image, size):
    """Return nonoverlapping flattened patches [num_patches,size*size].

Single-channel 2D image. Row-major patch order and row-major within each.
Positive integer size must divide H and W; otherwise ValueError."""
    raise NotImplementedError('Implement this function, then run the checks.')
```

## Check Your Understanding

An 8x8 image is divided into 2x2 patches.

- Spatial patch tokens

<details><summary>Worked answers</summary>

- 16: (8/2)*(8/2)=16.

</details>

## Experiment

Run `experiments/embodied_vision.py` from the repository, or use the self-contained notebook linked below the editor. Start with the declared CPU defaults. The notebook includes any required local model source; no model weights, datasets, API keys, or paid GPU are needed.

- Display the actual synthetic image, convolution response, patch order, and token-norm grid.
- Toy classifier results and injected high-norm tokens are illustrations, not measured artifacts of a downloaded DINO model.

## Transfer Problems

1. Add max pooling and calculate the resulting receptive field.
2. Compare augmentation and dropout on a fixed image-task split, recording seeds and budgets.

For each transfer, submit the changed code, one predicted outcome, actual measurements, one negative control, and a limitation. These open experiments need a defensible result, not a predetermined winning curve.

## AI-Assisted Coding Route

1. Predict the worked example and one edge case without assistance.
2. Ask an assistant for one small function or a test critique, not the completed notebook. Supply the exact shapes and contract.
3. Explain every returned operation and inspect the diff. Reject changes to the grader or the intended objective.
4. Run the public tests, then deliberately break a mechanism named in this lesson. Confirm that a behavioral test fails.
5. Compare with the worked solution only after an attempt. Close it and reimplement the difficult part from memory.
6. Record what you could explain unaided, what the assistant supplied, and which measured result supports your conclusion.

## Completion Evidence

A passing grader establishes this small function contract, not research reproduction or production readiness. Submit a reproducible experiment report with seed, split, shapes, budget, baseline, held-out result, failure case, and limitation. Keep failed seeds. Answers to historical/discussion questions should distinguish fact, inference, and an open empirical claim.

## Primary Source

[Vision Transformers Need Registers](https://arxiv.org/abs/2309.16588). The numerical examples, code, and synthetic datasets here are original teaching material; the source is for the underlying mechanism and its research context.

- [An Image is Worth 16x16 Words](https://arxiv.org/abs/2010.11929)
- [ImageNet Classification with Deep Convolutional Neural Networks](https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks)
