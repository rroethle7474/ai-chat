# ai-chat
https://github.com/mschwarzmueller/ai-chatbot-demo

To install dependencies:

```bash
bun install
```

To run:

```bash
bun -b dev
```

This project was created using `bun init` in bun v1.2.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.


To initially setup prisma for sqlite after creating the schema.prisma file.

 bunx prisma init --datasource-provider sqlite
 bunx prisma migrate dev --name init
