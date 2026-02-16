#!/bin/bash

echo "🌐 SkyMind WebOps - Web Agents Hackathon Setup"
echo "=============================================="

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install express cors node-fetch
cd ..

# Create .env file
echo "🔑 Setting up API keys..."
cat > backend/.env << EOF
TINYFISH_API_KEY=sk-tinyfish-GNc7SJkKci7lviX152z59peTF8zC3-WO
SAMBANOVA_API_KEY=e5dff711-1df4-4d1f-adec-62c52de77ab3
GEMINI_KEY_1=AIzaSyAGmz_T4-VWRlvjuBCTyPFghtvvR8QpMwQ
GEMINI_KEY_2=AIzaSyABOmaJtHKvs_N77jshVEVifeBQ1VuE4-4
GEMINI_KEY_3=AIzaSyD6ZYbBiwxpUfzx_jDYWWv0TDQot31Gr7k
EOF

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the web agent:"
echo "   Terminal 1: cd backend && node web-agent-server.js"
echo "   Terminal 2: cd mujoco_wasm && python -m http.server 8000"
echo ""
echo "   Then open: http://localhost:8000"
echo "   Press F12 to see AI decisions + TinyFish automation"
