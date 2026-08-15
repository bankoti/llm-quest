"""Deterministic, synthetic commerce fixtures with difficult negatives."""

from typing import List

from .domain import Product, QueryCase


def demo_catalog() -> List[Product]:
    return [
        Product(
            "health-protein-powder",
            "Vanilla Protein Powder",
            "whey powder for shakes",
            "retail",
            "protein supplements",
            ("high-protein",),
        ),
        Product(
            "health-protein-bars",
            "Chocolate Protein Bars",
            "box of snack bars",
            "retail",
            "protein supplements",
            ("high-protein",),
        ),
        Product(
            "grocery-chicken",
            "Chicken Breast",
            "fresh boneless chicken",
            "grocery",
            "meat",
            ("high-protein",),
        ),
        Product(
            "restaurant-tofu",
            "Spicy Tofu Bowl",
            "tofu rice and vegetables",
            "restaurant",
            "prepared meals",
            ("vegan", "spicy", "high-protein"),
        ),
        Product(
            "restaurant-vegan-chicken",
            "Vegan Chicken Sandwich",
            "plant-based patty on a bun",
            "restaurant",
            "sandwiches",
            ("vegan",),
        ),
        Product(
            "restaurant-chicken",
            "Chicken Sandwich",
            "fried chicken on a bun",
            "restaurant",
            "sandwiches",
        ),
        Product(
            "grocery-milk-1",
            "One Percent Milk",
            "one gallon low-fat dairy milk",
            "grocery",
            "milk",
            ("1-percent",),
        ),
        Product(
            "grocery-oat-milk",
            "Oat Milk",
            "dairy-free oat beverage",
            "grocery",
            "milk",
            ("vegan", "dairy-free"),
        ),
        Product(
            "restaurant-noodles",
            "Spicy Noodles",
            "hot chili noodles",
            "restaurant",
            "noodles",
            ("spicy",),
        ),
        Product(
            "grocery-gluten-free-snacks",
            "Gluten-Free Party Snacks",
            "birthday variety pack",
            "grocery",
            "snacks",
            ("gluten-free",),
        ),
        Product(
            "retail-lightning-cable",
            "Lightning Charging Cable",
            "works with older iPhone models",
            "retail",
            "phone accessories",
            ("lightning",),
        ),
        Product(
            "retail-usbc-cable",
            "USB-C Charging Cable",
            "charging cable for newer phones",
            "retail",
            "phone accessories",
            ("usb-c",),
        ),
    ]


def demo_queries() -> List[QueryCase]:
    return [
        QueryCase(
            "protein",
            ("health-protein-powder", "health-protein-bars"),
            "head",
            "protein supplements",
        ),
        QueryCase(
            "vegan chicken sandwich",
            ("restaurant-vegan-chicken",),
            "torso",
            "sandwiches",
            ("vegan",),
        ),
        QueryCase(
            "one percent milk", ("grocery-milk-1",), "head", "milk", ("1-percent",)
        ),
        QueryCase(
            "spicy noodles", ("restaurant-noodles",), "head", "noodles", ("spicy",)
        ),
        QueryCase(
            "gluten-free birthday snacks",
            ("grocery-gluten-free-snacks",),
            "tail",
            "snacks",
            ("gluten-free",),
        ),
        QueryCase(
            "charger for older iphone",
            ("retail-lightning-cable",),
            "tail",
            "phone accessories",
            ("lightning",),
        ),
    ]
