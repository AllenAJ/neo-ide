// src/app/generator/api/route.ts
import { AssistantResponse } from 'ai';
import OpenAI from 'openai';
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});
 
export const runtime = 'edge';
 
export async function POST(req: Request) {
  const input: {
    threadId: string | null;
    message: string;
  } = await req.json();
 
  console.log('input', input);
  const threadId = input.threadId ?? (await openai.beta.threads.create({})).id;
  console.log('threadId', threadId);
  
  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: input.message,
  });
  console.log('createdMessage', createdMessage);
 
  return AssistantResponse(
    { threadId, messageId: createdMessage.id },
    async ({ forwardStream, sendDataMessage }) => {
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id:
          process.env.GENERATOR_ASSISTANT_ID ??
          (() => {
            throw new Error('GENERATOR_ASSISTANT_ID is not set');
          })(),
      });
      console.log('runStream', runStream);
 
      let runResult = await forwardStream(runStream);
    },
  );
}