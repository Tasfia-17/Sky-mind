# 🚀 URGENT: Connect AI to Your Simulation (30 Minutes)

## Step 1: Get Gemini API Key (2 minutes)

1. Go to: **https://aistudio.google.com/apikey**
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key (starts with `AIza...`)

## Step 2: Add AI to Your Simulation (10 minutes)

### Option A: Quick Test (No Backend Needed)

1. Open `mujoco_wasm/examples/main.js`

2. Add this at the top (after imports):

```javascript
// AI Configuration
const GEMINI_API_KEY = "AIza...YOUR_KEY_HERE";  // Paste your key
let aiTarget = { x: 0, y: 0, z: 2 };
let frameCount = 0;

// AI Decision Function
async function getAIDecision(pos, battery) {
  try {
    const prompt = `You control a warehouse drone.
Position: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})
Battery: ${battery}%

Respond JSON only:
{"action": "patrol", "target": {"x": 2, "y": 1, "z": 2.5}, "reasoning": "why"}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await res.json();
    const text = data.candidates[0].content.parts[0].text;
    const decision = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    
    console.log('🤖 AI:', decision.reasoning);
    return decision;
  } catch (e) {
    console.warn('AI failed:', e.message);
    return { target: { x: 0, y: 0, z: 2 }, reasoning: 'fallback' };
  }
}
```

3. Find your simulation loop (search for `function simulate` or `requestAnimationFrame`)

4. Add this inside the loop:

```javascript
frameCount++;

// Call AI every 2 seconds (120 frames at 60fps)
if (frameCount % 120 === 0) {
  const dronePos = { 
    x: simulation.xpos[0],  // Adjust index for your drone
    y: simulation.xpos[1], 
    z: simulation.xpos[2] 
  };
  const battery = 100 - (frameCount / 3600) * 100;
  
  getAIDecision(dronePos, battery).then(decision => {
    aiTarget = decision.target;
    // Apply to your drone controller here
  });
}
```

## Step 3: Test It (5 minutes)

1. Start local server:
```bash
cd mujoco_wasm
python -m http.server 8000
```

2. Open http://localhost:8000

3. Open browser console (F12)

4. You should see: `🤖 AI: [reasoning text]` every 2 seconds

## Step 4: Deploy Backend to Vultr (15 minutes)

### Quick Vultr Setup:

1. Go to https://www.vultr.com/ → Sign up

2. Deploy → Cloud Compute:
   - Location: New York
   - Image: Ubuntu 22.04
   - Plan: $6/month (2GB RAM)
   - Deploy

3. Copy IP address and root password

4. SSH into server:
```bash
ssh root@YOUR_VULTR_IP
```

5. Run these commands:
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Create backend
mkdir -p /var/www/skymind
cd /var/www/skymind

# Create server.js
cat > server.js << 'EOF'
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_KEY = "YOUR_GEMINI_KEY_HERE";

app.post('/mission', async (req, res) => {
  const { position, battery } = req.body;
  
  try {
    const prompt = `Drone at (${position.x}, ${position.y}, ${position.z}), battery ${battery}%. 
Respond JSON: {"action":"patrol","target":{"x":2,"y":1,"z":2},"reasoning":"why"}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const decision = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    
    res.json(decision);
  } catch (error) {
    res.json({ action: 'hover', target: { x: 0, y: 0, z: 2 }, reasoning: 'error' });
  }
});

app.listen(3000, () => console.log('Backend running on :3000'));
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "type": "module",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  }
}
EOF

# Install and start
npm install
node server.js
```

6. Test backend:
```bash
curl http://YOUR_VULTR_IP:3000/mission \
  -H "Content-Type: application/json" \
  -d '{"position":{"x":1,"y":2,"z":3},"battery":85}'
```

## Step 5: Update Your Code (2 minutes)

In `main.js`, change the AI function to use your backend:

```javascript
async function getAIDecision(pos, battery) {
  try {
    const res = await fetch('http://YOUR_VULTR_IP:3000/mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: pos, battery })
    });
    return await res.json();
  } catch (e) {
    return { target: { x: 0, y: 0, z: 2 }, reasoning: 'backend offline' };
  }
}
```

## Step 6: Record Demo Video (10 minutes)

1. Open your simulation
2. Open browser console to show AI decisions
3. Record screen showing:
   - Drone moving autonomously
   - Console showing AI reasoning
   - Dashboard (if you have it)

4. Upload to YouTube/Twitter

## Step 7: Submit (5 minutes)

1. Post video on X/Twitter with:
   ```
   Just built RoboScout - autonomous drone fleet powered by @GoogleDeepMind Gemini 3 Flash! 
   
   🤖 AI makes real-time decisions
   ☁️ Deployed on @Vultr
   🎮 MuJoCo physics simulation
   
   Built for @lablabai @Surgexyz_ #AIRobotics
   
   [VIDEO LINK]
   [GITHUB LINK]
   ```

2. Copy tweet URL

3. Submit to lablab.ai with tweet URL

## ⚠️ Critical Checklist

- [ ] Gemini API key working
- [ ] AI making decisions every 2 seconds
- [ ] Console showing AI reasoning
- [ ] Backend deployed on Vultr
- [ ] Demo video recorded
- [ ] X post with @lablabai @Surgexyz_ tags
- [ ] Submission includes tweet URL

## 🆘 Troubleshooting

**"API key invalid"**
- Make sure you copied the full key from https://aistudio.google.com/apikey
- Key should start with `AIza`

**"CORS error"**
- Add `app.use(cors());` to your backend
- Or test with direct Gemini API first (Option A)

**"No AI decisions showing"**
- Check browser console for errors
- Make sure `frameCount % 120 === 0` is being hit
- Add `console.log('Calling AI...')` before fetch

**"Backend not responding"**
- Check if Node.js is running: `ps aux | grep node`
- Check firewall: `ufw allow 3000`
- Test locally first with Option A

## 🎯 What Judges Want to See

1. **AI actually controlling the drone** (not just logging)
2. **Explainable decisions** (show reasoning in console/dashboard)
3. **Real-time adaptation** (battery low → return to base)
4. **Production deployment** (Vultr backend, not just localhost)
5. **Clear demo** (video showing autonomous behavior)

Good luck! You have the foundation - just need to connect the pieces! 🚀
