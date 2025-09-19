# Camisas chinesas - Backend

### 1. Instalar dependências

Escolha um gerenciador de pacotes:

```bash
npm install
```

### 2. Criar o arquivo .env

Se houver um arquivo de exemplo (.env.example), copie-o:

```bash
cp .env.example .env
```

Caso não exista, crie um `.env` na raiz do projeto com as variáveis necessárias:

```
# .env
PORT=3333
NETWORK_PATH=./assets
DATABASE_URL=file:dev.db
```

### 3. Configurações do Prisma

O arquivo de esquema do Prisma geralmente fica em `prisma/schema.prisma`. Verifique se `provider` e `url` (ou `env("DATABASE_URL")`) estão corretos.

- Gerar o client do Prisma:

```bash
npx prisma generate
```

- Criar e rodar migrações (modo de desenvolvimento):

```bash
npx prisma migrate dev --name init
```

Isso criará a migração e atualizará o banco de dados conforme o schema.

- Opcional: inspecionar a base de dados com Prisma Studio:

```bash
npx prisma studio
```

Se estiver usando um banco já existente e quiser apenas introspectar:

```bash
npx prisma db pull
npx prisma generate
```

### 4. Rodar a aplicação

Após configurar o `.env` e executar as migrações:

```bash
npm run dev
```
