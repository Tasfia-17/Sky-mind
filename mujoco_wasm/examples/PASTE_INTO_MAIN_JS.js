// ============================================
// PASTE THIS AT THE TOP OF YOUR main.js
// (After the imports, before the CONTROL_KEYS line)
// ============================================

// AI Configuration - Multiple Keys
const GEMINI_API_KEYS = [
  "AIzaSyAGmz_T4-VWRlvjuBCTyPFghtvvR8QpMwQ",
  "AIzaSyABOmaJtHKvs_N77jshVEVifeBQ1VuE4-4",
  "AIzaSyD6ZYbBiwxpUfzx_jDYWWv0TDQot31Gr7k"
];
let currentKeyIndex = 0;
let aiEnabled = true;
let aiTarget = { x: 0, y: 0, z: 2 };
let frameCount = 0;

async function getAIDecision(pos, battery, vel) {
  if (!aiEnabled) return { target: aiTarget, reasoning: "AI disabled" };
  
  const key = GEMINI_API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Warehouse drone control.
Position: (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)})
Battery: ${battery.toFixed(0)}%
Velocity: (${vel.x.toFixed(1)}, ${vel.y.toFixed(1)}, ${vel.z.toFixed(1)})

Mission: Patrol area, return if battery < 20%.
Respond JSON only: {"action":"patrol","target":{"x":2,"y":1,"z":2.5},"reasoning":"why"}` }]
        }]
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    
    const text = data.candidates[0].content.parts[0].text;
    const decision = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
    
    console.log(`🤖 AI (Key ${currentKeyIndex}/${GEMINI_API_KEYS.length}):`, decision.reasoning);
    aiTarget = decision.target;
    return decision;
  } catch (e) {
    console.warn('AI error:', e.message);
    return { target: aiTarget, reasoning: 'fallback' };
  }
}

// ============================================
// PASTE THIS INSIDE YOUR SIMULATION LOOP
// (Find the function that runs every frame)
// ============================================

/*
frameCount++;

// Call AI every 2 seconds (120 frames at 60fps)
if (frameCount % 120 === 0 && simulation && simulation.xpos) {
  const droneBodyId = 1; // Adjust this to your drone's body ID
  const pos = { 
    x: simulation.xpos[droneBodyId * 3 + 0] || 0,
    y: simulation.xpos[droneBodyId * 3 + 1] || 0,
    z: simulation.xpos[droneBodyId * 3 + 2] || 2
  };
  const battery = Math.max(0, 100 - (frameCount / 3600) * 100);
  const vel = { 
    x: simulation.qvel[droneBodyId * 6 + 0] || 0,
    y: simulation.qvel[droneBodyId * 6 + 1] || 0,
    z: simulation.qvel[droneBodyId * 6 + 2] || 0
  };
  
  getAIDecision(pos, battery, vel).then(decision => {
    aiTarget = decision.target;
    console.log('🎯 New target:', aiTarget);
  });
}
*/
