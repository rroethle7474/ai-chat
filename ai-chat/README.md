# ai-chat
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


 
