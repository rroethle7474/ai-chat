import { render, useState } from 'hono/jsx/dom';

declare global {
  interface Window {
    chatId: string;
    chats: { id: string; title: string }[];
    messages: { role: 'assistant' | 'user'; content: string }[];
  }
}

type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

const chatId = window.chatId;
const initialChats = window.chats;
const initialMessages = window.messages;

function Chat() {
  const [chats, setChats] =
    useState<{ id: string; title: string }[]>(initialChats);
  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>(initialMessages);

  async function handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);
    const prompt = data.get('prompt') as string;

    const userMessage: ChatMessage = { role: 'user', content: prompt };

    setChatMessages((prevMessages) => prevMessages.concat(userMessage));

    form.reset();

    if (chatMessages.length === 0) {
      fetch('/chat-title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId,
          userPrompt: prompt,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          document.title = data.title;
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.id === chatId ? { ...chat, title: data.title } : chat
            )
          );
        });
    }
    
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: chatId,
        history: chatMessages.concat(userMessage),
      }),
    });

    const stream = response.body;

    if (!stream) {
      throw new Error('Response body is not a stream');
    }

    const reader = stream.getReader();

    setChatMessages((prevMessages) =>
      prevMessages.concat({ role: 'assistant', content: '' })
    );

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        return;
      }

      const text = new TextDecoder().decode(value);

      setChatMessages((prevMessages) => {
        const messages = prevMessages.slice();
        messages[messages.length - 1] = {
          role: 'assistant',
          content: text,
        };
        return messages;
      });
    }
  }

  async function clearChatHistory() {
    const response = await fetch(`/clear-chat/${chatId}`, { method: 'DELETE' });
    if (response.ok) {
      setChatMessages([]);
    }
  }

  async function resetDatabase() {
    if (confirm("Are you sure you want to reset the entire database? This will delete ALL chats and cannot be undone.")) {
      const response = await fetch('/reset-database', { method: 'DELETE' });
      if (response.ok) {
        // Redirect to home to create a new chat
        window.location.href = '/';
      }
    }
  }

  return (
    <>
      <nav class="fixed left-0 h-screen bg-stone-800 w-48 px-6 py-16">
        <ul class="flex flex-col items-start justify-start h-full w-full gap-4">
          {chats.map((chat) => (
            <li>
              <a
                href={`/chat/${chat.id}`}
                class="text-stone-300 hover:text-stone-50"
              >
                {chat.title}
              </a>
            </li>
          ))}
          <li class="mt-auto">
            <button
              onClick={resetDatabase}
              class="text-red-400 hover:text-red-300 text-sm"
            >
              Reset Database
            </button>
          </li>
        </ul>
      </nav>
      <div class="flex flex-col w-[50rem] min-h-screen py-8">
        <div class="flex-1 flex flex-col justify-end pb-8 gap-4">
          <div class="flex justify-end mb-4">
            <button 
              onClick={clearChatHistory}
              class="bg-red-500 px-4 py-1 rounded-sm text-white hover:bg-red-600"
            >
              Clear Chat History
            </button>
          </div>
          {chatMessages.length === 0 && <p>How may I help you?</p>}
          {chatMessages.map((msg) => (
            <article
              class={`prose prose-invert prose-headings:font-bold ${
                msg.role === 'assistant' ? '' : 'text-stone-400'
              }`}
              dangerouslySetInnerHTML={{ __html: msg.content }}
            ></article>
          ))}
        </div>
        <form
          onSubmit={handleSubmit}
          class="bg-stone-900 px-12 py-6 rounded -mx-12"
        >
          <p class="mb-4 flex flex-col gap-2">
            <label for="prompt" class="font-bold text-sm text-stone-300">
              Your Prompt
            </label>
            <textarea
              id="prompt"
              rows={3}
              name="prompt"
              class="border border-white rounded-sm p-2"
            />
          </p>
          <p class="text-right">
            <button class="bg-indigo-400 px-6 py-2 rounded-sm text-black hover:bg-indigo-500">
              Submit
            </button>
          </p>
        </form>
      </div>
    </>
  );
}

const root = document.getElementById('chat');

if (!root) {
  throw new Error('Root element not found');
}

render(<Chat />, root);