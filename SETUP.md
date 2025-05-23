# Guia de Instalação Detalhado

Este guia fornece instruções passo a passo para configurar o ambiente de desenvolvimento e executar o sistema em sua máquina local.

## Requisitos de Sistema

- **Node.js**: versão 18.x ou superior
- **PostgreSQL**: versão 12.x ou superior
- **npm**: 8.x ou superior (ou yarn 1.22.x ou superior)

## Passo 1: Preparando o Banco de Dados

1. Instale o PostgreSQL se ainda não tiver instalado:
   - **Windows**: Baixe e instale do [site oficial](https://www.postgresql.org/download/windows/)
   - **macOS**: Use o Homebrew: `brew install postgresql` e inicie com `brew services start postgresql`
   - **Linux (Ubuntu/Debian)**: `sudo apt install postgresql postgresql-contrib`

2. Crie um banco de dados para o projeto:
   ```sql
   CREATE DATABASE erp_system;
   CREATE USER erp_user WITH ENCRYPTED PASSWORD 'sua_senha';
   GRANT ALL PRIVILEGES ON DATABASE erp_system TO erp_user;
   ```

## Passo 2: Configurando o Projeto

1. Clone o repositório:
   ```bash
   git clone [URL_DO_REPOSITORIO]
   cd [NOME_DO_DIRETORIO]
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
   ```
   DATABASE_URL=postgresql://erp_user:sua_senha@localhost:5432/erp_system
   JWT_SECRET=seu_segredo_jwt_aqui_use_uma_string_longa_e_aleatoria
   ```

4. Execute a migração para criar as tabelas no banco de dados:
   ```bash
   npm run db:push
   ```

## Passo 3: Iniciando o Sistema

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Acesse o sistema em seu navegador:
   ```
   http://localhost:5000
   ```

3. Crie um usuário administrador ou use as credenciais padrão:
   - **Username**: admin
   - **Senha**: admin123

## Solução de Problemas Comuns

### Erro "EADDRINUSE: address already in use 0.0.0.0:5000"
Isso significa que a porta 5000 já está em uso. Você pode:
- Parar o processo que está usando a porta 5000
- Modificar a porta no arquivo `server/index.ts`:
  ```typescript
  const PORT = process.env.PORT || 5001; // Mude para outro número
  ```

### Erro de Conexão com o Banco de Dados
- Verifique se o PostgreSQL está em execução
- Confirme se as credenciais no arquivo `.env` estão corretas
- Certifique-se de que o usuário tem permissão para acessar o banco de dados

### Erro "Relation does not exist"
- Execute novamente a migração do banco de dados:
  ```bash
  npm run db:push
  ```

## Desenvolvimento Local

### Hot Reload
O sistema já está configurado para atualizar automaticamente quando você faz alterações no código.

### TypeScript
Para verificar erros de tipo sem executar o projeto:
```bash
npm run typecheck
```

### Estilização
O projeto usa TailwindCSS. Você pode personalizar as cores e outros estilos no arquivo `tailwind.config.ts`.

## Estrutura de Diretórios Explicada

- `client/`: Contém todo o código frontend
  - `src/components/ui/`: Componentes de interface do usuário reutilizáveis
  - `src/pages/`: Páginas da aplicação
  - `src/lib/`: Utilitários e funções auxiliares
  
- `server/`: Contém todo o código backend
  - `middlewares/`: Middlewares do Express (autenticação, etc.)
  
- `shared/`: Código compartilhado entre frontend e backend
  - `schema.ts`: Definição do schema do banco de dados (Drizzle ORM)

## Credenciais

### Usuários de Teste
Para fins de desenvolvimento, você pode usar os seguintes usuários:

| Usuário    | Senha      | Função         |
|------------|------------|----------------|
| admin      | admin123   | Administrador  |
| testuser   | password123| Usuário padrão |

**Importante**: Não use estas credenciais em ambiente de produção!