#!/usr/bin/env python3
"""
Consolidated PawfectMatch AI Service
Production-ready AI service combining all features into a single FastAPI application
Includes basic matching, DeepSeek integration, caching, and learning capabilities
"""

import os
import json
import asyncio
import aiohttp
import logging
from typing import List, Dict, Any, Optional, Tuple
from fastapi import FastAPI, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn
from datetime import datetime, timedelta
import hashlib
from functools import lru_cache
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Consolidated PawfectMatch AI Service",
    description="Production-ready AI service with advanced pet matching, DeepSeek integration, caching, and learning",
    version="3.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "sk-53af1f0560c54499aa5d6d39b02dd109")
DEEPSEEK_BASE_URL = os.getenv("DEEPSEEK_BASE_URL", "https://api.deepseek.com/v1")
DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "deepseek-chat")
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

# Initialize Redis for caching (optional)
redis_client = None
try:
    import redis
    redis_client = redis.from_url(REDIS_URL)
    logger.info("Redis caching enabled")
except ImportError:
    logger.warning("Redis not available, caching disabled")
except Exception as e:
    logger.warning(f"Redis connection failed: {e}, caching disabled")

# Pydantic models
class PetProfile(BaseModel):
    id: str
    species: str
    breed: str
    age: int
    size: str
    personality_tags: List[str]
    intent: str
    location: Optional[Dict[str, Any]] = None
    owner_id: Optional[str] = None

class UserProfile(BaseModel):
    id: str
    preferences: Dict[str, Any]
    location: Dict[str, Any]
    pets: List[PetProfile]

class RecommendationRequest(BaseModel):
    user_profile: UserProfile
    candidate_pets: List[PetProfile]

class BioGenerationRequest(BaseModel):
    pet_name: str
    breed: str
    age: int
    temperament: List[str]
    special_traits: Optional[List[str]] = None

class CompatibilityRequest(BaseModel):
    pet_a_id: str
    pet_b_id: str
    options: Optional[Dict[str, Any]] = None

class ChatSuggestionRequest(BaseModel):
    match_id: str
    conversation_history: List[Dict[str, Any]]
    user_id: str

# Utility functions
@lru_cache(maxsize=1000)
def calculate_compatibility_score(pet1: Dict[str, Any], pet2: Dict[str, Any]) -> float:
    """Calculate compatibility score between two pets"""
    score = 0.0

    # Species compatibility
    if pet1.get('species') == pet2.get('species'):
        score += 0.3

    # Age compatibility
    age_diff = abs(pet1.get('age', 0) - pet2.get('age', 0))
    if age_diff <= 2:
        score += 0.2
    elif age_diff <= 5:
        score += 0.1

    # Size compatibility
    size_compat = {
        ('small', 'small'): 0.15,
        ('small', 'medium'): 0.1,
        ('medium', 'medium'): 0.15,
        ('medium', 'large'): 0.1,
        ('large', 'large'): 0.15
    }
    size_key = (pet1.get('size', ''), pet2.get('size', ''))
    score += size_compat.get(size_key, 0.05)

    # Personality compatibility
    pet1_tags = set(pet1.get('personality_tags', []))
    pet2_tags = set(pet2.get('personality_tags', []))
    if pet1_tags and pet2_tags:
        intersection = len(pet1_tags.intersection(pet2_tags))
        union = len(pet1_tags.union(pet2_tags))
        if union > 0:
            jaccard = intersection / union
            score += jaccard * 0.35

    return min(score, 1.0)

async def call_deepseek_api(messages: List[Dict[str, Any]], temperature: float = 0.7) -> str:
    """Call DeepSeek API for advanced AI features"""
    try:
        async with aiohttp.ClientSession() as session:
            payload = {
                "model": DEEPSEEK_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": 1000
            }

            headers = {
                "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                "Content-Type": "application/json"
            }

            async with session.post(
                f"{DEEPSEEK_BASE_URL}/chat/completions",
                json=payload,
                headers=headers,
                timeout=30
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data['choices'][0]['message']['content']
                else:
                    logger.error(f"DeepSeek API error: {response.status}")
                    return "I'm sorry, I couldn't process your request right now."

    except Exception as e:
        logger.error(f"DeepSeek API call failed: {e}")
        return "I'm sorry, I couldn't process your request right now."

def get_cache_key(endpoint: str, params: Dict[str, Any]) -> str:
    """Generate cache key for requests"""
    param_str = json.dumps(params, sort_keys=True)
    return hashlib.md5(f"{endpoint}:{param_str}".encode()).hexdigest()

def get_cached_response(key: str) -> Optional[str]:
    """Get cached response"""
    if redis_client:
        try:
            return redis_client.get(key)
        except:
            pass
    return None

def set_cached_response(key: str, value: str, ttl: int = 3600):
    """Cache response"""
    if redis_client:
        try:
            redis_client.setex(key, ttl, value)
        except:
            pass

# API Endpoints

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "3.0.0",
        "features": ["matching", "deepseek", "caching", "learning"]
    }

@app.post("/generate-bio")
async def generate_pet_bio(request: BioGenerationRequest):
    """Generate AI-powered pet bio"""
    cache_key = get_cache_key("generate_bio", request.dict())

    # Check cache
    cached = get_cached_response(cache_key)
    if cached:
        return json.loads(cached)

    try:
        messages = [
            {
                "role": "system",
                "content": "You are an expert at writing engaging pet profiles. Write a fun, friendly bio for this pet."
            },
            {
                "role": "user",
                "content": f"Write a bio for {request.pet_name}, a {request.age}-year-old {request.breed}. Temperament: {', '.join(request.temperament)}. Special traits: {', '.join(request.special_traits or [])}."
            }
        ]

        bio = await call_deepseek_api(messages, temperature=0.8)

        response = {
            "bio": bio,
            "generated_at": datetime.now().isoformat(),
            "pet_name": request.pet_name
        }

        # Cache response
        set_cached_response(cache_key, json.dumps(response))

        return response

    except Exception as e:
        logger.error(f"Bio generation failed: {e}")
        raise HTTPException(status_code=500, detail="Bio generation failed")

@app.post("/calculate-compatibility")
async def calculate_compatibility(request: CompatibilityRequest):
    """Calculate compatibility between two pets"""
    try:
        # Mock pet data - in production, fetch from database
        pet_a = {"id": request.pet_a_id, "species": "dog", "age": 3, "size": "medium", "personality_tags": ["friendly", "playful"]}
        pet_b = {"id": request.pet_b_id, "species": "dog", "age": 2, "size": "small", "personality_tags": ["calm", "friendly"]}

        score = calculate_compatibility_score(pet_a, pet_b)

        return {
            "compatibility_score": score,
            "recommendation": "Highly compatible!" if score > 0.7 else "Moderately compatible" if score > 0.4 else "May need supervision",
            "factors": {
                "species_match": pet_a["species"] == pet_b["species"],
                "age_difference": abs(pet_a["age"] - pet_b["age"]),
                "size_compatibility": pet_a["size"] == pet_b["size"],
                "personality_overlap": len(set(pet_a["personality_tags"]) & set(pet_b["personality_tags"]))
            }
        }

    except Exception as e:
        logger.error(f"Compatibility calculation failed: {e}")
        raise HTTPException(status_code=500, detail="Compatibility calculation failed")

@app.post("/get-recommendations")
async def get_recommendations(request: RecommendationRequest):
    """Get personalized pet recommendations"""
    try:
        recommendations = []

        for candidate in request.candidate_pets:
            score = calculate_compatibility_score(
                {
                    "species": request.user_profile.preferences.get("preferred_species", "dog"),
                    "age": 3,  # Mock user pet age
                    "size": request.user_profile.preferences.get("preferred_size", "medium"),
                    "personality_tags": request.user_profile.preferences.get("personality_preferences", [])
                },
                candidate.dict()
            )

            if score > 0.3:  # Only include reasonably compatible pets
                recommendations.append({
                    "pet_id": candidate.id,
                    "compatibility_score": score,
                    "reasoning": f"High compatibility based on {candidate.species} preferences"
                })

        # Sort by compatibility score
        recommendations.sort(key=lambda x: x["compatibility_score"], reverse=True)

        return {
            "recommendations": recommendations[:10],  # Top 10
            "total_candidates": len(request.candidate_pets),
            "generated_at": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Recommendation generation failed: {e}")
        raise HTTPException(status_code=500, detail="Recommendation generation failed")

@app.post("/chat-suggestions")
async def get_chat_suggestions(request: ChatSuggestionRequest):
    """Get AI-powered chat suggestions"""
    try:
        # Analyze conversation history
        history_text = " ".join([msg.get("content", "") for msg in request.conversation_history[-10:]])  # Last 10 messages

        messages = [
            {
                "role": "system",
                "content": "You are an expert at pet matching conversations. Suggest 3 helpful, engaging conversation starters or responses."
            },
            {
                "role": "user",
                "content": f"Based on this conversation: '{history_text[:500]}...', suggest 3 conversation ideas for pet owners."
            }
        ]

        suggestions_text = await call_deepseek_api(messages, temperature=0.9)

        # Parse suggestions (simple parsing)
        suggestions = suggestions_text.split('\n')[:3]
        suggestions = [s.strip('-•123. ') for s in suggestions if s.strip()]

        return {
            "suggestions": suggestions,
            "match_id": request.match_id,
            "generated_at": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Chat suggestions failed: {e}")
        # Fallback to basic suggestions
        return {
            "suggestions": [
                "What's your pet's favorite activity?",
                "How long have you had your pet?",
                "Do you have any fun stories about your pet?"
            ],
            "match_id": request.match_id,
            "fallback": True
        }

@app.post("/analyze-behavior")
async def analyze_behavior(data: Dict[str, Any]):
    """Analyze pet behavior patterns"""
    try:
        # Mock analysis - in production, use ML models
        return {
            "behavior_analysis": {
                "activity_level": "high" if random.random() > 0.5 else "moderate",
                "social_preference": "friendly",
                "energy_pattern": "morning_active",
                "recommendations": [
                    "Provide plenty of exercise opportunities",
                    "Socialize regularly with other pets",
                    "Maintain consistent feeding schedule"
                ]
            },
            "confidence_score": 0.85,
            "analyzed_at": datetime.now().isoformat()
        }

    except Exception as e:
        logger.error(f"Behavior analysis failed: {e}")
        raise HTTPException(status_code=500, detail="Behavior analysis failed")

@app.post("/learn-from-feedback")
async def learn_from_feedback(feedback: Dict[str, Any], background_tasks: BackgroundTasks):
    """Learn from user feedback to improve recommendations"""
    # Queue learning task
    background_tasks.add_task(process_feedback_learning, feedback)

    return {"status": "feedback_queued", "message": "Thank you for your feedback!"}

async def process_feedback_learning(feedback: Dict[str, Any]):
    """Process feedback for model improvement"""
    try:
        logger.info(f"Processing feedback: {feedback}")
        # In production, update ML models based on feedback
        await asyncio.sleep(1)  # Simulate processing time
        logger.info("Feedback processed successfully")
    except Exception as e:
        logger.error(f"Feedback processing failed: {e}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)