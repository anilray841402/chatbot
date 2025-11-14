import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const app = express();
const client = new OpenAI();

app.use(cors());
app.use(express.json());


// =========================================
// BUSINESS-SPECIFIC SYSTEM PROMPT
// =========================================
const SYSTEM_PROMPT = `
You are the official AI Assistant for MATECIA — India's leading exhibition and media platform for building materials, interiors, furniture, plywood, laminates, hardware, adhesives, panels, and decorative materials.

Your job:
- Answer everything related to building materials (plywood, laminates, veneers, WPC, MDF, adhesives, hardware, ACP, ceilings, flooring, edge band, doors, modular furniture etc.)
- Answer everything about the MATECIA Exhibition.
- Guide exhibitors about booking stalls at: https://matecia.com/book-stall
- Provide details about the upcoming MATECIA event on **30–31 January in Kolkata**.
- Explain how brands can promote themselves via MATECIA platform, magazine, websites, and social media.
- Provide business guidance for manufacturers, distributors, architects, interior designers, dealers, and retailers.
- Give professional replies like a business consultant.

Your Response Rules:
- You MUST always reply ONLY in the following JSON format:
{ "step": "START | THINK | EVALUATE | OUTPUT", "content": "string" }

- You must strictly follow this sequence:
START → THINK → EVALUATE → THINK → EVALUATE → … → OUTPUT

- THINK steps are your internal reasoning (only short 1–2 lines).
- After every THINK, you must wait for a manual EVALUATE (which will be added automatically).
- OUTPUT must provide the final answer for the user in clean, simple language.
`;


// =========================================
//  API Endpoint for the Chatbot
// =========================================
app.post('/ask', async (req, res) => {
  const query = req.body.query;
  if (!query) return res.status(400).json({ error: 'Query required' });

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: query },
  ];

  try {
    while (true) {
      const response = await client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages,
      });

      const raw = response.choices[0].message.content.trim();
      const match = raw.match(/\{[\s\S]*\}/);

      if (!match) {
        return res.status(500).json({ error: 'Invalid model output format' });
      }

      const msg = JSON.parse(match[0]);
      messages.push({ role: 'assistant', content: JSON.stringify(msg) });

      // For THINK steps → auto inject EVALUATE
      if (msg.step === 'THINK') {
        messages.push({
          role: 'developer',
          content: JSON.stringify({
            step: 'EVALUATE',
            content: 'Evaluation OK — continue.'
          }),
        });
      }

      // Final step → OUTPUT
      if (msg.step === 'OUTPUT') {
        return res.json({ answer: msg.content });
      }
    }
  } catch (err) {
    console.error('❌ Error:', err);
    return res.status(500).json({ error: err.message });
  }
});


// =========================================
// Start Server
// =========================================
const PORT = 4001;
app.listen(PORT, () => console.log(`🚀 MATECIA Agent Backend running on port ${PORT}`));
