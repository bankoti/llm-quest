"""Teacher labeling and a tiny student used to teach distillation mechanics."""

from dataclasses import dataclass
from typing import Iterable, List, Sequence, Tuple

import torch
import torch.nn as nn

from .domain import Product, QueryCase
from .retrieval import HashingSemanticRetriever, tokenize


def pair_features(query: str, product: Product) -> torch.Tensor:
    query_tokens = set(tokenize(query))
    product_tokens = set(tokenize(product.searchable_text))
    overlap = len(query_tokens & product_tokens) / max(1, len(query_tokens))
    embedder = HashingSemanticRetriever([product], dimensions=64)
    query_vector = embedder.embed(query)
    product_vector = embedder.vectors[0]
    similarity = sum(left * right for left, right in zip(query_vector, product_vector))
    return torch.tensor([overlap, similarity, 1.0], dtype=torch.float32)


def teacher_score(case: QueryCase, product: Product) -> float:
    if product.product_id in case.relevant_ids:
        return 0.95
    required = set(case.required_attributes)
    if required and not required.issubset(product.attributes):
        return 0.02
    return 0.15


@dataclass(frozen=True)
class LabeledPair:
    features: torch.Tensor
    target: float
    query: str
    product_id: str


def generate_teacher_labels(
    cases: Sequence[QueryCase], products: Sequence[Product]
) -> List[LabeledPair]:
    return [
        LabeledPair(
            pair_features(case.query, product),
            teacher_score(case, product),
            case.query,
            product.product_id,
        )
        for case in cases
        for product in products
    ]


class RelevanceStudent(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.network = nn.Sequential(nn.Linear(3, 8), nn.ReLU(), nn.Linear(8, 1))

    def forward(self, features: torch.Tensor) -> torch.Tensor:
        return self.network(features).squeeze(-1)


def train_student(
    labels: Iterable[LabeledPair],
    steps: int = 250,
    learning_rate: float = 0.03,
) -> Tuple[RelevanceStudent, List[float]]:
    rows = list(labels)
    features = torch.stack([row.features for row in rows])
    targets = torch.tensor([row.target for row in rows])
    torch.manual_seed(19)
    model = RelevanceStudent()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    history = []
    for _ in range(steps):
        predictions = model(features)
        loss = nn.functional.mse_loss(predictions, targets)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
        history.append(float(loss.detach()))
    return model, history
