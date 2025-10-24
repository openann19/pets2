#!/bin/bash

echo "🚀 Starting PawfectMatch Premium..."

# Kill any existing processes
pkill -f "node server.js"
pkill -f "next dev"
pkill -f "python.*simple_app"

sleep 2

# Start Backend Server
echo "📡 Starting Backend Server on port 5000..."
cd /home/ben/datapartition_backup/Downloads/pawfectmatch-premium/server
node server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

sleep 3

# Start Frontend
echo "🌐 Starting Frontend on port 3000..."
cd /home/ben/datapartition_backup/Downloads/pawfectmatch-premium/apps/web
npm run dev > ../../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

sleep 3

# Start AI Service
echo "🤖 Starting AI Service on port 8000..."
cd /home/ben/datapartition_backup/Downloads/pawfectmatch-premium/ai-service
python3 simple_app.py > ../ai-service.log 2>&1 &
AI_PID=$!
echo "AI Service PID: $AI_PID"

echo ""
echo "✅ All services starting!"
echo ""
echo "📱 Frontend:    http://localhost:3000"
echo "🔧 Backend:     http://localhost:5000"
echo "🤖 AI Service:  http://localhost:8000"
echo ""
echo "📝 Logs:"
echo "   Backend:     tail -f backend.log"
echo "   Frontend:    tail -f frontend.log"
echo "   AI Service:  tail -f ai-service.log"
echo ""
echo "⏱️  Wait 30-60 seconds then open http://localhost:3000"
echo ""
echo "To stop all services, run: pkill -f 'node|python.*simple_app'"
