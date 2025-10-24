#!/usr/bin/env python3
"""
Simplified AI Service for PawfectMatch Premium
No external dependencies required - uses only Python standard library
"""

import json
import random
import hashlib
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import time

class AIServiceHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/health':
            self.send_health_response()
        elif parsed_path.path == '/':
            self.send_info_response()
        else:
            self.send_error_response(404, "Not Found")
    
    def do_POST(self):
        """Handle POST requests"""
        parsed_path = urlparse(self.path)
        
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
        except:
            self.send_error_response(400, "Invalid JSON")
            return
        
        if parsed_path.path == '/generate-bio':
            self.handle_generate_bio(data)
        elif parsed_path.path == '/analyze-photo':
            self.handle_analyze_photo(data)
        elif parsed_path.path == '/calculate-compatibility':
            self.handle_calculate_compatibility(data)
        else:
            self.send_error_response(404, "Endpoint not found")
    
    def send_health_response(self):
        """Health check endpoint"""
        response = {
            "status": "healthy",
            "service": "PawfectMatch AI Service",
            "version": "1.0.0",
            "timestamp": time.time()
        }
        self.send_json_response(200, response)
    
    def send_info_response(self):
        """Service info endpoint"""
        response = {
            "service": "PawfectMatch AI Service",
            "version": "1.0.0",
            "description": "AI-powered pet matching and recommendation system",
            "endpoints": {
                "/health": "GET - Health check",
                "/generate-bio": "POST - Generate pet bio",
                "/analyze-photo": "POST - Analyze pet photo",
                "/calculate-compatibility": "POST - Calculate compatibility score"
            }
        }
        self.send_json_response(200, response)
    
    def handle_generate_bio(self, data):
        """Generate AI bio for pet"""
        pet_name = data.get('name', 'Pet')
        species = data.get('species', 'dog')
        breed = data.get('breed', 'Mixed')
        age = data.get('age', 2)
        personality = data.get('personality', [])
        
        # Generate bio based on pet characteristics
        bio_templates = {
            'dog': [
                f"Meet {pet_name}, a {age}-year-old {breed} with boundless energy and love to share!",
                f"{pet_name} is a friendly {breed} who loves adventures and making new friends.",
                f"This adorable {age}-year-old {breed} named {pet_name} is looking for a playmate!",
                f"{pet_name} is a loyal {breed} with a heart full of love and paws ready for fun!"
            ],
            'cat': [
                f"{pet_name} is an elegant {age}-year-old {breed} with a purr-fect personality!",
                f"Meet {pet_name}, a graceful {breed} who enjoys cozy moments and gentle pets.",
                f"This charming {age}-year-old {breed} named {pet_name} is seeking a special friend.",
                f"{pet_name} is a sophisticated {breed} with whiskers full of wisdom and love."
            ]
        }
        
        templates = bio_templates.get(species.lower(), bio_templates['dog'])
        base_bio = random.choice(templates)
        
        # Add personality traits
        if personality:
            traits = ', '.join(personality[:3])  # Limit to 3 traits
            base_bio += f" Known for being {traits}."
        
        # Add random fun fact
        fun_facts = [
            f"{pet_name} loves belly rubs and treats!",
            f"Favorite activity: playing fetch in the park.",
            f"Always ready for cuddles and movie nights.",
            f"Enjoys meeting new friends and exploring.",
            f"Has mastered the art of the puppy dog eyes!"
        ]
        
        bio = base_bio + " " + random.choice(fun_facts)
        
        response = {
            "bio": bio,
            "confidence": round(random.uniform(0.85, 0.98), 2),
            "generated_at": time.time()
        }
        
        self.send_json_response(200, response)
    
    def handle_analyze_photo(self, data):
        """Analyze pet photo (mock analysis)"""
        photo_url = data.get('photo_url', '')
        
        # Mock photo analysis results
        analysis_results = [
            {"breed": "Golden Retriever", "confidence": 0.92, "traits": ["Friendly", "Energetic", "Loyal"]},
            {"breed": "Labrador", "confidence": 0.88, "traits": ["Playful", "Gentle", "Smart"]},
            {"breed": "Persian Cat", "confidence": 0.95, "traits": ["Elegant", "Calm", "Affectionate"]},
            {"breed": "Maine Coon", "confidence": 0.87, "traits": ["Gentle Giant", "Friendly", "Intelligent"]},
            {"breed": "Border Collie", "confidence": 0.91, "traits": ["Intelligent", "Active", "Loyal"]}
        ]
        
        # Use photo URL hash to get consistent results
        url_hash = hashlib.md5(photo_url.encode()).hexdigest()
        result_index = int(url_hash[:2], 16) % len(analysis_results)
        result = analysis_results[result_index]
        
        response = {
            "detected_breed": result["breed"],
            "confidence": result["confidence"],
            "personality_traits": result["traits"],
            "photo_quality": "good",
            "analyzed_at": time.time()
        }
        
        self.send_json_response(200, response)
    
    def handle_calculate_compatibility(self, data):
        """Calculate compatibility between pets"""
        pet1 = data.get('pet1', {})
        pet2 = data.get('pet2', {})
        
        # Mock compatibility calculation
        base_score = random.uniform(0.6, 0.95)
        
        # Adjust score based on species
        if pet1.get('species') == pet2.get('species'):
            base_score += 0.1
        
        # Adjust based on age difference
        age1 = pet1.get('age', 2)
        age2 = pet2.get('age', 2)
        age_diff = abs(age1 - age2)
        if age_diff <= 2:
            base_score += 0.05
        
        # Ensure score is between 0 and 1
        compatibility_score = min(1.0, max(0.0, base_score))
        
        response = {
            "compatibility_score": round(compatibility_score, 2),
            "percentage": round(compatibility_score * 100),
            "factors": {
                "species_match": pet1.get('species') == pet2.get('species'),
                "age_compatibility": age_diff <= 3,
                "size_compatibility": True,  # Mock
                "energy_level_match": True   # Mock
            },
            "calculated_at": time.time()
        }
        
        self.send_json_response(200, response)
    
    def send_json_response(self, status_code, data):
        """Send JSON response"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        response_json = json.dumps(data, indent=2)
        self.wfile.write(response_json.encode('utf-8'))
    
    def send_error_response(self, status_code, message):
        """Send error response"""
        error_data = {
            "error": message,
            "status_code": status_code,
            "timestamp": time.time()
        }
        self.send_json_response(status_code, error_data)
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

def run_server(port=8000):
    """Run the AI service server"""
    server_address = ('', port)
    httpd = HTTPServer(server_address, AIServiceHandler)
    
    print(f"🤖 PawfectMatch AI Service starting on port {port}")
    print(f"🌐 Service URL: http://localhost:{port}")
    print(f"❤️ Health check: http://localhost:{port}/health")
    print("🚀 AI Service is ready!")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 AI Service shutting down...")
        httpd.shutdown()

if __name__ == '__main__':
    run_server()
