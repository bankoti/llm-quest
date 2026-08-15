"""Command-line interface for inspecting, training, and sampling the model."""

import argparse
import json
import math
from dataclasses import asdict
from pathlib import Path
from typing import Optional, Sequence

import torch

from .config import ModelConfig
from .models import checkpoint_model
from .production import (
    QueryInterpreter,
    SearchService,
    demo_catalog,
    demo_queries,
    evaluate_rankings,
)
from .production.retrieval import HybridRetriever
from .tokenizer import BytePairTokenizer, CharacterTokenizer
from .training import TrainingConfig, select_device, train

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_CORPUS = PROJECT_ROOT / "data" / "tiny_corpus.txt"
DEFAULT_CHECKPOINT = PROJECT_ROOT / "runs" / "tiny-gpt.pt"


def add_train_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--corpus", type=Path, default=DEFAULT_CORPUS)
    parser.add_argument("--out", type=Path, default=DEFAULT_CHECKPOINT)
    parser.add_argument("--model", choices=("bigram", "gpt"), default="gpt")
    parser.add_argument(
        "--tokenizer", choices=("character", "bpe"), default="character"
    )
    parser.add_argument("--tokenizer-vocab-size", type=int, default=300)
    parser.add_argument("--steps", type=int, default=300)
    parser.add_argument("--batch-size", type=int, default=16)
    parser.add_argument("--block-size", type=int, default=64)
    parser.add_argument("--layers", type=int, default=2)
    parser.add_argument("--heads", type=int, default=4)
    parser.add_argument("--embedding-size", type=int, default=64)
    parser.add_argument("--learning-rate", type=float, default=3e-3)
    parser.add_argument("--eval-interval", type=int, default=50)
    parser.add_argument("--device", default="auto")


def command_inspect(corpus: Path) -> None:
    text = corpus.read_text(encoding="utf-8")
    tokenizer = CharacterTokenizer.train(text)
    tokens = tokenizer.encode(text)
    print(f"characters={len(text):,}")
    print(f"character_vocab={tokenizer.vocab_size}")
    print(f"first_80_tokens={tokens[:80]}")
    print(f"round_trip_ok={tokenizer.decode(tokens) == text}")


def command_tokenize(corpus: Path, text: str, vocab_size: int) -> None:
    training_text = corpus.read_text(encoding="utf-8")
    tokenizer = BytePairTokenizer.train(training_text, vocab_size=vocab_size)
    tokens = tokenizer.encode(text)
    print(f"learned_vocab={tokenizer.vocab_size}")
    print(f"utf8_bytes={len(text.encode('utf-8'))} bpe_tokens={len(tokens)}")
    print(f"tokens={tokens}")
    print(f"decoded={tokenizer.decode(tokens)!r}")


def command_train(args: argparse.Namespace) -> None:
    model_config = ModelConfig(
        vocab_size=1,
        block_size=args.block_size,
        n_layer=args.layers,
        n_head=args.heads,
        n_embd=args.embedding_size,
    )
    training_config = TrainingConfig(
        model_type=args.model,
        tokenizer_type=args.tokenizer,
        tokenizer_vocab_size=args.tokenizer_vocab_size,
        steps=args.steps,
        batch_size=args.batch_size,
        learning_rate=args.learning_rate,
        eval_interval=args.eval_interval,
    )
    train(args.corpus, args.out, model_config, training_config, args.device)


def command_generate(
    checkpoint_path: Path,
    prompt: str,
    max_new_tokens: int,
    temperature: float,
    top_k: Optional[int],
    device_name: str,
) -> None:
    device = select_device(device_name)
    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)
    tokenizer_state = checkpoint["tokenizer"]
    if tokenizer_state.get("type") == "character":
        tokenizer = CharacterTokenizer.from_dict(tokenizer_state)
    elif tokenizer_state.get("type") == "byte_pair":
        tokenizer = BytePairTokenizer.from_dict(tokenizer_state)
    else:
        raise ValueError("Checkpoint contains an unknown tokenizer type")
    model = checkpoint_model(checkpoint, device)
    model.eval()
    input_ids = torch.tensor(
        [tokenizer.encode(prompt)], dtype=torch.long, device=device
    )
    output = model.generate(input_ids, max_new_tokens, temperature, top_k)
    print(tokenizer.decode(output[0].tolist()))
    metrics = checkpoint.get("metrics", {})
    validation_loss = metrics.get("validation") if isinstance(metrics, dict) else None
    if isinstance(validation_loss, float):
        print(f"\n[checkpoint validation perplexity: {math.exp(validation_loss):.2f}]")


def command_search(query: str, limit: int) -> None:
    response = SearchService(demo_catalog()).search(query, limit)
    print(json.dumps(asdict(response), indent=2, sort_keys=True))


def command_evaluate_search(k: int) -> None:
    products = demo_catalog()
    cases = demo_queries()
    interpreter = QueryInterpreter()
    retriever = HybridRetriever(products)
    rankings = {
        case.query: [
            result.product_id
            for result in retriever.search(interpreter.interpret(case.query))
        ]
        for case in cases
    }
    report = evaluate_rankings(cases, rankings, k)
    print(json.dumps(asdict(report), indent=2, sort_keys=True))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="mini-llm", description="Build and inspect a tiny language model"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    inspect_parser = subparsers.add_parser("inspect", help="inspect the corpus")
    inspect_parser.add_argument("--corpus", type=Path, default=DEFAULT_CORPUS)

    tokenize_parser = subparsers.add_parser("tokenize", help="train and try BPE")
    tokenize_parser.add_argument("text")
    tokenize_parser.add_argument("--corpus", type=Path, default=DEFAULT_CORPUS)
    tokenize_parser.add_argument("--vocab-size", type=int, default=300)

    train_parser = subparsers.add_parser("train", help="train a bigram or GPT model")
    add_train_arguments(train_parser)

    generate_parser = subparsers.add_parser("generate", help="sample a checkpoint")
    generate_parser.add_argument("--checkpoint", type=Path, default=DEFAULT_CHECKPOINT)
    generate_parser.add_argument("--prompt", default="The ")
    generate_parser.add_argument("--tokens", type=int, default=200)
    generate_parser.add_argument("--temperature", type=float, default=0.8)
    generate_parser.add_argument("--top-k", type=int, default=20)
    generate_parser.add_argument("--device", default="auto")

    search_parser = subparsers.add_parser(
        "search", help="search the synthetic production catalog"
    )
    search_parser.add_argument("query")
    search_parser.add_argument("--limit", type=int, default=5)

    evaluate_search_parser = subparsers.add_parser(
        "evaluate-search", help="evaluate the production search reference"
    )
    evaluate_search_parser.add_argument("--k", type=int, default=5)
    return parser


def main(argv: Optional[Sequence[str]] = None) -> None:
    args = build_parser().parse_args(argv)
    if args.command == "inspect":
        command_inspect(args.corpus)
    elif args.command == "tokenize":
        command_tokenize(args.corpus, args.text, args.vocab_size)
    elif args.command == "train":
        command_train(args)
    elif args.command == "generate":
        command_generate(
            args.checkpoint,
            args.prompt,
            args.tokens,
            args.temperature,
            args.top_k,
            args.device,
        )
    elif args.command == "search":
        command_search(args.query, args.limit)
    elif args.command == "evaluate-search":
        command_evaluate_search(args.k)


if __name__ == "__main__":
    main()
