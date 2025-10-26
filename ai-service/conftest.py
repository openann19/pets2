"""
Pytest configuration and fixtures for ai-service tests.

This module provides shared fixtures, mocks, and utilities for all tests.
"""
import pytest
import asyncio
import json
from typing import Generator, AsyncGenerator, Any, Dict, List
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from datetime import datetime, timedelta
import random
import faker

# Initialize Faker for test data generation
fake = faker.Faker()
faker.Faker.seed(42)  # Deterministic seed for reproducible tests


@pytest.fixture(scope="session")
def event_loop():
    """Create an event loop for async tests."""
    policy = asyncio.get_event_loop_policy()
    loop = policy.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(autouse=True)
def reset_random_seed():
    """Reset random seed for each test to ensure deterministic behavior."""
    random.seed(42)
    yield
    random.seed(42)


@pytest.fixture(scope="session")
def fake_data():
    """Generate fake test data using Faker."""
    return {
        "name": fake.name(),
        "email": fake.email(),
        "address": fake.address(),
        "date": fake.date(),
        "sentence": fake.sentence(),
        "text": fake.text(),
    }


@pytest.fixture
def mock_redis():
    """Mock Redis client for testing."""
    mock = AsyncMock()
    mock.get = AsyncMock(return_value=None)
    mock.set = AsyncMock(return_value=True)
    mock.delete = AsyncMock(return_value=True)
    mock.exists = AsyncMock(return_value=False)
    mock.expire = AsyncMock(return_value=True)
    mock.keys = AsyncMock(return_value=[])
    return mock


@pytest.fixture
def mock_http_client():
    """Mock HTTP client for external API calls."""
    mock = AsyncMock()
    mock.get = AsyncMock()
    mock.post = AsyncMock()
    mock.put = AsyncMock()
    mock.delete = AsyncMock()
    return mock


@pytest.fixture
def sample_pet_data() -> Dict[str, Any]:
    """Sample pet data for testing."""
    return {
        "id": "pet_123",
        "name": "Buddy",
        "species": "dog",
        "breed": "Golden Retriever",
        "age": 3,
        "size": "large",
        "personality": ["friendly", "playful", "intelligent"],
        "photos": [
            {"url": "https://example.com/photo1.jpg", "order": 0},
            {"url": "https://example.com/photo2.jpg", "order": 1},
        ],
    }


@pytest.fixture
def sample_user_data() -> Dict[str, Any]:
    """Sample user data for testing."""
    return {
        "id": "user_123",
        "email": "test@example.com",
        "name": "Test User",
        "age": 28,
        "location": {
            "lat": 37.7749,
            "lng": -122.4194,
            "city": "San Francisco",
            "state": "CA",
        },
        "preferences": {
            "species": ["dog", "cat"],
            "ages": ["adult", "senior"],
            "sizes": ["medium", "large"],
        },
    }


@pytest.fixture
def sample_match_data() -> Dict[str, Any]:
    """Sample match data for testing."""
    return {
        "match_id": "match_123",
        "user_id": "user_123",
        "pet_id": "pet_123",
        "score": 0.85,
        "compatibility": {
            "personality": 0.9,
            "lifestyle": 0.8,
            "preferences": 0.9,
        },
        "created_at": datetime.utcnow().isoformat(),
    }


@pytest.fixture
def sample_match_list() -> List[Dict[str, Any]]:
    """List of sample matches for testing."""
    return [
        {
            "match_id": f"match_{i}",
            "user_id": "user_123",
            "pet_id": f"pet_{i}",
            "score": 0.7 + (i * 0.05),
            "created_at": (datetime.utcnow() - timedelta(days=i)).isoformat(),
        }
        for i in range(10)
    ]


@pytest.fixture
def mock_matching_algorithm():
    """Mock matching algorithm for testing."""
    mock = Mock()
    mock.calculate_match_score = Mock(return_value=0.85)
    mock.find_matches = Mock(return_value=[
        {"pet_id": "pet_1", "score": 0.9},
        {"pet_id": "pet_2", "score": 0.8},
    ])
    return mock


@pytest.fixture
def mock_fastapi_app():
    """Mock FastAPI application for testing."""
    mock = MagicMock()
    mock.post = Mock()
    mock.get = Mock()
    mock.put = Mock()
    mock.delete = Mock()
    return mock


@pytest.fixture
def sample_request_payload() -> Dict[str, Any]:
    """Sample request payload for API testing."""
    return {
        "user_id": "user_123",
        "pet_ids": ["pet_1", "pet_2", "pet_3"],
        "preferences": {
            "species": ["dog"],
            "age_range": {"min": 1, "max": 10},
            "size": ["medium", "large"],
        },
    }


@pytest.fixture
def sample_response_data() -> Dict[str, Any]:
    """Sample response data for API testing."""
    return {
        "matches": [
            {"pet_id": "pet_1", "score": 0.9, "compatibility": "high"},
            {"pet_id": "pet_2", "score": 0.7, "compatibility": "medium"},
        ],
        "total": 2,
        "processing_time_ms": 42,
    }


# Pytest hooks
def pytest_configure(config):
    """Configure pytest with custom settings."""
    config.addinivalue_line(
        "markers", "unit: Unit tests for individual functions and classes"
    )
    config.addinivalue_line(
        "markers", "integration: Integration tests for API endpoints and workflows"
    )
    config.addinivalue_line(
        "markers", "slow: Tests that take a long time to run"
    )


@pytest.fixture(autouse=True)
def reset_mocks():
    """Reset all mocks after each test."""
    yield
    # This fixture runs after each test automatically


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers."""
    for item in items:
        # Add markers based on path
        if "unit" in item.nodeid:
            item.add_marker(pytest.mark.unit)
        if "integration" in item.nodeid:
            item.add_marker(pytest.mark.integration)
        if "slow" in item.nodeid:
            item.add_marker(pytest.mark.slow)

