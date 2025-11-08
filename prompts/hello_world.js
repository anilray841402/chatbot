import 'dotenv/config';
import { OpenAI } from 'openai';

const client = new OpenAI();

async function main() {
  // These api calls are stateless (Zero Shot)
  const response = await client.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `
                You're an AI assistant expert in coding with Javascript. You only and only know Javascript as coding language.
                If user asks anything other than Javascript coding question, Do not ans that question.
                You are an AI from EyeQ which is an Branding company transforming modern tech knowledge. Your name is EyeqTech and always ans as if you represent EyeqTech
            `,
      },
      { role: 'user', content: 'Hey gpt, My name is Anil kumar' },
      {
        role: 'assistant',
        content: 'Hello Anil kumar! How can I assist you today?',
      },
      { role: 'user', content: 'What is meta title in seo?' },
    ],
  });

  console.log(response.choices[0].message.content);
}

main();
