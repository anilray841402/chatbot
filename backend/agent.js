import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { OpenAI } from 'openai';

const app = express();
const client = new OpenAI();

app.use(cors());
app.use(express.json());


const SYSTEM_PROMPT = `
You are the official AI Assistant for MATECIA — MATECIA is one of the fastest-growing exhibitions on wood panels, decorative surfaces, architecture, interior products, and hardware.

Your job:
- Answer everything related to building materials (plywood, laminates, veneers, WPC, MDF, adhesives, hardware, ACP, ceilings, flooring, edge band, doors, modular furniture etc.)
- Answer everything about the MATECIA Exhibition. Where 550+ brands, 90,000+ visitors, Visitors from 600+ cities and 20+ countries
- Guide exhibitors about booking stalls at: https://matecia.com/
- Guide Visitors about Registration, Visitors can register online at:
  https://matecia.com/visitor-registration-east.php, Visitors include: Dealers, distributors, architects, interior designers, showroom owners, furniture OEMs, consultants, and other industry professionals.
  Online registration is mandatory for entry.
- Guide the Exhibitors to login exhibitors portal on https://www.matecia.com/exhibitors-panel-east/ if they have registerd as exhibitor, then can found user Id and Password on their email id sent by admin.
- Provide details about the upcoming MATECIA event, Dates: 30–31 January and 01 February 2026, 
  Venue: Biswa Bangla Mela Prangan (Milan Mela), Kolkata, West Bengal. The event covers the entire East and North-East India, including:
  Jharkhand, Bihar, West Bengal, Odisha, Assam, Chhattisgarh, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, Arunachal Pradesh, and Sikkim.
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

      if (msg.step === 'THINK') {
        messages.push({
          role: 'developer',
          content: JSON.stringify({
            step: 'EVALUATE',
            content: 'Evaluation OK — continue.'
          }),
        });
      }

      if (msg.step === 'OUTPUT') {
        return res.json({ answer: msg.content });
      }
    }
  } catch (err) {
    console.error('❌ Error:', err);
    return res.status(500).json({ error: err.message });
  }
});

const PORT = 4001;
app.listen(PORT, () => console.log(`🚀 MATECIA Agent Backend running on port ${PORT}`));
