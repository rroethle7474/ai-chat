# ai-chat

## Project Description

This is a full-stack chat application powered by OpenAI's GPT models. It allows users to:

- Create and manage multiple chat conversations
- Send messages to an AI assistant and receive responses in real-time
- View chat history with proper formatting and syntax highlighting for code
- Generate automatic titles for conversations based on content

The application uses a SQLite database (via Prisma) to store chat conversations and messages, making it possible to revisit previous chats. The UI is built with React and styled with Tailwind CSS, providing a clean and responsive interface.

To install dependencies:

```bash
bun install (Before first run)
```

To run:

```bash
bun -b dev
```

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


To initially setup prisma for sqlite after creating the schema.prisma file.

 bunx prisma init --datasource-provider sqlite
 bunx prisma migrate dev --name init

 if Scema changes are made, re-run a migration. Another option is delete the app.db and rerun the migrate comman or init. (review this.)

## How Bun, Hono, and React Work Together

This application uses a modern full-stack architecture that combines Bun, Hono, and React to create a seamless development experience where both frontend and backend run from a single codebase.

### Architecture Overview

1. **Bun**: Acts as the JavaScript/TypeScript runtime that powers the entire application. It's faster than Node.js and includes built-in bundling, transpilation, and package management.

2. **Hono**: A lightweight, fast web framework that handles HTTP routing and server-side rendering. In this app, Hono serves both:
   - API endpoints for the chat functionality
   - Server-side rendered (SSR) React components

3. **React**: Used for building the user interface components. React components are:
   - Server-rendered initially by Hono
   - Hydrated on the client side for interactive features

### Development Workflow

When you run `bun -b dev`, the following happens:

1. Vite starts a development server with the Hono plugin (`@hono/vite-dev-server`)
2. The entry point `app.tsx` initializes a Hono application that:
   - Defines API routes for chat functionality
   - Renders React components server-side
   - Serves static assets
3. When you visit a page:
   - Hono handles the request and renders the initial HTML using React components
   - Client-side JavaScript is loaded to hydrate the React components
   - The page becomes interactive with client-side React

### Build Process

When building for production (`bun run build`):

1. Vite builds the client-side assets (React components, CSS) into the `static` directory
2. The server-side code remains separate and is run directly by Bun
3. In production, Hono serves the pre-built static assets and handles API requests

This architecture provides several benefits:
- Single codebase for both frontend and backend
- Fast development experience with hot module replacement
- Server-side rendering for better performance and SEO
- Type safety across the entire stack with TypeScript
- Efficient production builds with optimized assets

## Environment Variables

 To get chat results please provide a valid OpenAI API Key in the .env file. This chat currently uses gpt-4o-mini and only works with OpenAI.
