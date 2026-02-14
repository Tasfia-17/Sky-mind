// SkyMind AI Integration - Multi-API Key Version
// Add this to your main.js

// Multiple API Keys (rotates to avoid rate limits)
const GEMINI_API_KEYS = [
  "AIzaSyAGmz_T4-VWRlvjuBCTyPFghtvvR8QpMwQ",
  "AIzaSyABOmaJtHKvs_N77jshVEVifeBQ1VuE4-4",
  "AIzaSyD6ZYbBiwxpUfzx_jDYWWv0TDQot31Gr7k"
];

let currentKeyIndex = 0;
let aiEnabled = true;
let lastAITarget = { x: 0, y: 0, z: 2 };
let frameCount = 0;

// Get next API key (rotates through all keys)
function getNextAPIKey() {
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
}

// Get AI decision from Gemini
async function getAIDecision(dronePos, battery, velocity) {
  if (!aiEnabled) {
    return { target: { x: 0, y: 0, z: 2 }, reasoning: "AI disabled" };
  }

  const apiKey = getNextAPIKey();
  
  try {
    const prompt = `You are controlling an autonomous warehouse drone.

Current State:
- Position: (${dronePos.x.toFixed(2)}, ${dronePos.y.toFixed(2)}, ${dronePos.z.toFixed(2)})
- Battery: ${battery.toFixed(1)}%
- Velocity: (${velocity.x.toFixed(2)}, ${velocity.y.toFixed(2)}, ${velocity.z.toFixed(2)})

Mission: Patrol warehouse area, inspect shelves, return to base if battery < 20%.

Respond with JSON only:
{
  "action": "patrol|inspect|return_base|hover",
  "target": {"x": 0, "y": 0, "z": 2},
  "reasoning": "brief explanation"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    
    if (data.error) {
      console.warn('API Error:', data.error.message);
      return { target: lastAITarget, reasoning: 'API error, using last target' };
    }
    
    const text = data.candidates[0].content.parts[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const decision = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      action: 'hover',
      target: { x: 0, y: 0, z: 2 },
      reasoning: 'Default hover mode'
    };

    console.log(`🤖 AI Decision (Key ${currentKeyIndex}/${GEMINI_API_KEYS.length}):`, decision.action, '-', decision.reasoning);
    lastAITarget = decision.target;
    return decision;

  } catch (error) {
    console.warn('AI Error:', error.message);
    return {
      action: 'hover',
      target: lastAITarget,
      reasoning: 'Fallback mode'
    };
  }
}

// Add this to your simulation loop
// Call every 2 seconds (120 frames at 60fps)
/*
frameCount++;

if (frameCount % 120 === 0) {
  const dronePos = { 
    x: simulation.xpos[droneBodyId * 3 + 0],
    y: simulation.xpos[droneBodyId * 3 + 1], 
    z: simulation.xpos[droneBodyId * 3 + 2] 
  };
  const battery = Math.max(0, 100 - (frameCount / 3600) * 100);
  const velocity = { 
    x: simulation.qvel[droneBodyId * 6 + 0],
    y: simulation.qvel[droneBodyId * 6 + 1],
    z: simulation.qvel[droneBodyId * 6 + 2]
  };
  
  getAIDecision(dronePos, battery, velocity).then(decision => {
    lastAITarget = decision.target;
    // Apply target to your drone controller
    if (droneController) {
      droneController.setTarget(decision.target.x, decision.target.y, decision.target.z);
    }
  });
}
*/

// Export for global access
if (typeof window !== 'undefined') {
  window.getAIDecision = getAIDecision;
  window.aiEnabled = aiEnabled;
  window.lastAITarget = lastAITarget;
  window.GEMINI_API_KEYS = GEMINI_API_KEYS;
}
