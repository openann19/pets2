"""
Test fixtures and sample data for ai-service tests.

This module provides reusable test data and fixtures for all tests.
"""
import random
from typing import List, Dict, Any
from datetime import datetime, timedelta

# Seed for deterministic test data
random.seed(42)


def sample_pet(
    pet_id: str = "pet_123",
    species: str = "dog",
    breed: str = "Golden Retriever",
    age: int = 3,
    size: str = "large",
    **kwargs: Any
) -> Dict[str, Any]:
    """Generate sample pet data for testing."""
    return {
        "id": pet_id,
        "name": f"Pet_{pet_id}",
        "species": species,
        "breed": breed,
        "age": age,
        "size": size,
        "personality": ["friendly", "playful", "intelligent"],
        "photos": [
            {"url": f"https://example.com/photo1_{pet_id}.jpg", "order": 0},
            {"url": f"https://example.com/photo2_{pet_id}.jpg", "order": 1},
        ],
        "created_at": (datetime.utcnow() - timedelta(days=random.randint(1, 365))).isoformat(),
        **kwargs,
    }


def sample_user(
    user_id: str = "user_123",
    email: str = "test@example.com",
    **kwargs: Any
) -> Dict[str, Any]:
    """Generate sample user data for testing."""
    return {
        "id": user_id,
        "email": email,
        "name": f"User_{user_id}",
        "age": 28,
        "location": {
            "lat": 37.7749 + random.random() * 0.1,
            "lng": -122.4194 + random.random() * 0.1,
            "city": "San Francisco",
            "state": "CA",
        },
        "preferences": {
            "species": ["dog", "cat"],
            "age_range": {"min": 1, "max": 15},
            "size": ["medium", "large"],
        },
        "created_at": (datetime.utcnow() - timedelta(days=random.randint(1, 180))).isoformat(),
        **kwargs,
    }


def sample_match(
    match_id: str = "match_123",
    user_id: str = "user_123",
    pet_id: str = "pet_123",
    score: float = 0.85,
    **kwargs: Any
) -> Dict[str, Any]:
    """Generate sample match data for testing."""
    return {
        "match_id": match_id,
        "user_id": user_id,
        "pet_id": pet_id,
        "score": score,
        "compatibility": {
            "personality": round(score * 1.1, 2),
            "lifestyle": round(score * 0.9, 2),
            "preferences": round(score * 1.05, 2),
        },
        "created_at": datetime.utcnow().isoformat(),
        **kwargs,
    }


def multiple_pets(count: int = 10, **kwargs: Any) -> List[Dict[str, Any]]:
    """Generate multiple sample pets."""
    return [sample_pet(pet_id=f"pet_{i}", **kwargs) for i in range(count)]


def multiple_users(count: int = 10, **kwargs: Any) -> List[Dict[str, Any]]:
    """Generate multiple sample users."""
    return [sample_user(user_id=f"user_{i}", email=f"user_{i}@example.com", **kwargs) for i in range(count)]


def multiple_matches(count: int = 10, **kwargs: Any) -> List[Dict[str, Any]]:
    """Generate multiple sample matches."""
    base_score = 0.7
    return [
        sample_match(
            match_id=f"match_{i}",
            pet_id=f"pet_{i}",
            score=base_score + (i * 0.02),
            **kwargs
        )
        for i in range(count)
    ]

