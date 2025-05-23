# Sistema de Gestão Empresarial

Um sistema completo de gestão empresarial com módulos para clientes, produtos, pedidos, pagamentos e envios. Inclui autenticação de usuários e controle de permissões baseado em funções.

## Requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL (versão 12 ou superior)
- npm ou yarn

## Instalação

Siga estes passos para configurar o projeto em seu ambiente local:

### 1. Clone o repositório

```bash
git clone [URL_DO_SEU_REPOSITORIO]
cd [NOME_DO_DIRETORIO]
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure o banco de dados

Crie um banco de dados PostgreSQL e configure as variáveis de ambiente:

- Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco
```

Substitua `usuario`, `senha` e `nome_do_banco` pelos valores adequados ao seu ambiente.

### 4. Execute as migrações do banco de dados

```bash
npm run db:push
# ou
yarn db:push
```

### 5. Inicie o servidor de desenvolvimento

```bash
npm run dev
# ou
yarn dev
```

O sistema estará disponível em `http://localhost:5000`

## Credenciais de acesso iniciais

Ao iniciar o sistema pela primeira vez, você pode usar estas credenciais para fazer login:

- **Usuário**: admin
- **Senha**: admin123

Alternativamente, você pode registrar um novo usuário através da página de registro.

## Estrutura do Projeto

### Frontend (React + TypeScript)

- `client/src/` - Código-fonte do frontend
  - `components/` - Componentes reutilizáveis
  - `hooks/` - React hooks personalizados
  - `lib/` - Funções utilitárias
  - `pages/` - Páginas da aplicação
  - `providers/` - Contextos e provedores de estado
  - `App.tsx` - Componente principal
  - `main.tsx` - Ponto de entrada da aplicação

### Backend (Node.js + Express)

- `server/` - Código-fonte do backend
  - `middlewares/` - Middlewares do Express
  - `db.ts` - Configuração do banco de dados
  - `index.ts` - Inicialização do servidor
  - `routes.ts` - Definição das rotas da API
  - `storage.ts` - Interface para acesso ao banco de dados

### Compartilhado

- `shared/` - Código compartilhado entre frontend e backend
  - `schema.ts` - Definição do schema do banco de dados
  - `constants.ts` - Constantes compartilhadas

## Funcionalidades

- **Autenticação**: Login, registro e gerenciamento de usuários
- **Dashboard**: Visão geral dos principais indicadores
- **Clientes**: Cadastro e gerenciamento de clientes
- **Produtos**: Cadastro e gerenciamento de produtos
- **Categorias**: Organização de produtos por categorias
- **Marcas**: Cadastro e gerenciamento de marcas
- **Pedidos**: Gestão de pedidos e status
- **Pagamentos**: Registro e acompanhamento de pagamentos
- **Envios**: Gestão de envio e entrega de produtos

## Desenvolvimento

### Comandos úteis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run db:push`: Atualiza o banco de dados com o schema atual
- `npm run build`: Compila o projeto para produção
- `npm run start`: Inicia o servidor em modo de produção

## Tecnologias

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui, React Query
- **Backend**: Node.js, Express, Drizzle ORM
- **Banco de dados**: PostgreSQL
- **Autenticação**: JWT (JSON Web Tokens)

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para mais detalhes.