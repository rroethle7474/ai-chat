import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { streamText } from 'hono/streaming';
import { streamText as generateStream, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import { unified } from 'unified';
import { PrismaClient } from '@prisma/client';

// Load environment variables from .env file
import { config } from 'dotenv';
config();

import ChatPage from './pages/chat';

const prisma = new PrismaClient();

// Get the API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('OPENAI_API_KEY is not defined in environment variables');
  throw new Error('OPENAI_API_KEY is required');
}

// Initialize OpenAI client with the API key explicitly
const openAiModel = createOpenAI({
  apiKey,
})('gpt-4o-mini');
const app = new Hono();

app.use('/static/*', serveStatic({ root: './' }));

app.get('/chat/:chatid?', async (c) => {
  const { chatid } = c.req.param();

  if (!chatid) {
    const createdChat = await prisma.chat.create({
      data: {},
    });

    const chatId = createdChat.id;

    return c.redirect(`/chat/${chatId}`);
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatid },
    include: { messages: true },
  });

  if (!chat) {
    c.status(404);
    return c.html(<h1>Chat not found</h1>);
  }

  const chats = await prisma.chat.findMany({
    select: { id: true, title: true },
  });

  for (const message of chat.messages) {
    const htmlFile = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeHighlight)
      .use(rehypeStringify)
      .process(message.content);

    message.content = htmlFile.toString();
  }

  // retrieve the chat history for the provided chatid from the database
  return c.html(
    <ChatPage chatId={chat.id} messages={chat.messages} chats={chats} />
  );
});

app.post('/chat-title', async (c) => {
  const { chatId, userPrompt } = await c.req.json();

  const { text } = await generateText({
    system: `Do NOT wrap the title in any quotes or special characters. 
    Do NOT format the text as markdown, JSON or anything else. Give me some raw text`,
    model: openAiModel,
    prompt: `Generate a very short title based on the following prompt or question sent by the user: """${userPrompt}""".`,
  });

  await prisma.chat.update({
    where: { id: chatId },
    data: {
      title: text,
    },
  });

  return c.json({ title: text });
});

app.post('/chat', async (c) => {
  const { history, chatId } = await c.req.json();
  const userMessage = history[history.length - 1];

  // save the user message to the database
  await prisma.chatMessage.create({
    data: {
      chatId,
      role: 'user',
      content: userMessage.content,
    },
  });

  const { textStream } = generateStream({
    model: openAiModel,
    messages: history,
  });
  let completeMessage = '';

  return streamText(c, async (stream) => {
    for await (const chunk of textStream) {
      completeMessage += chunk;
      const htmlFile = await unified()
        .use(remarkParse)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(completeMessage);

      stream.write(htmlFile.toString());
    }
    await prisma.chatMessage.create({
      data: {
        chatId,
        role: 'assistant',
        content: completeMessage,
      },
    });
  });
});

app.delete('/clear-chat/:chatid', async (c) => {
  const { chatid } = c.req.param();
  await prisma.chatMessage.deleteMany({
    where: { chatId: chatid },
  });

  return c.json({ success: true });
});

app.delete('/reset-database', async (c) => {
  // Delete all chat messages first (due to foreign key constraints)
  await prisma.chatMessage.deleteMany({});
  
  // Then delete all chats
  await prisma.chat.deleteMany({});
  
  return c.json({ success: true });
});

app.get('/', (c) => c.redirect('/chat'));

export default app;