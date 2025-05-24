# Guia de Implantação com MySQL no CloudPanel

Este guia ajudará você a configurar seu sistema de gerenciamento no CloudPanel usando MySQL como banco de dados. O documento contém instruções para:

1. Configurar e testar o banco de dados MySQL
2. Ajustar o código para usar MySQL em vez de PostgreSQL
3. Testar formulários e garantir que os dados sejam gravados corretamente
4. Implantar a aplicação no CloudPanel

## 1. Pré-requisitos

- Uma conta no CloudPanel com suporte a Node.js
- Banco de dados MySQL criado no CloudPanel
- Credenciais de acesso ao banco de dados MySQL

## 2. Configuração do Ambiente

### Instalar as dependências necessárias para MySQL

Para usar MySQL em vez de PostgreSQL, você precisará instalar os seguintes pacotes:

```bash
npm install mysql2 drizzle-orm@latest drizzle-orm-mysql
npm install -D drizzle-kit@latest
```

### Atualizar a configuração do banco de dados

1. Crie um arquivo `server/mysql-db.ts` com o seguinte conteúdo:

```typescript
import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema-mysql";

// Configuração do MySQL 
const connection = await createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  multipleStatements: true,
});

export const db = drizzle(connection, { schema });
```

2. Atualize o arquivo `drizzle.config.ts` para usar MySQL:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './shared/schema-mysql.ts',
  out: './drizzle',
  driver: 'mysql2',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'admin_dashboard',
    port: Number(process.env.DB_PORT) || 3306,
  },
});
```

## 3. Migração do Schema para MySQL

### Converter o schema PostgreSQL para MySQL

Crie um novo arquivo chamado `shared/schema-mysql.ts` baseado no seu schema atual, mas adaptado para MySQL:

```typescript
import { mysqlTable, text, serial, int, decimal, boolean, timestamp, primaryKey, mysqlEnum } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
import { ORDER_STATUS, PAYMENT_METHODS, SHIPPING_STATUS, USER_ROLES } from "./constants";

// Enums (MySQL usa enum diferente do PostgreSQL)
export const orderStatusEnum = mysqlEnum('order_status', Object.values(ORDER_STATUS));
export const paymentMethodEnum = mysqlEnum('payment_method', Object.values(PAYMENT_METHODS));
export const shippingStatusEnum = mysqlEnum('shipping_status', Object.values(SHIPPING_STATUS));
export const userRoleEnum = mysqlEnum('user_role', Object.values(USER_ROLES));

// Users
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Continue convertendo todas as tabelas restantes...
// (o restante do código segue o mesmo padrão, trocando pgTable por mysqlTable)
```

## 4. Teste de Formulários

Para testar se seus formulários estão gravando os dados corretamente:

### Testar formulário de produtos

1. Acesse a página de produtos e clique em "Adicionar Produto"
2. Preencha os campos obrigatórios:
   - Nome: "Produto de Teste"
   - SKU: "TEST-001"
   - Preço: 99.99
   - Estoque: 10
3. Clique em "Salvar"
4. Verifique se o produto aparece na lista de produtos

### Testar formulário de clientes

1. Acesse a página de clientes e clique em "Adicionar Cliente"
2. Preencha os campos obrigatórios:
   - Nome: "Cliente de Teste"
   - Email: "cliente@teste.com"
3. Clique em "Salvar"
4. Verifique se o cliente aparece na lista de clientes

### Verificação direta no banco de dados

Para confirmar que os dados foram gravados no banco de dados:

```sql
SELECT * FROM products WHERE sku = 'TEST-001';
SELECT * FROM customers WHERE email = 'cliente@teste.com';
```

## 5. Configuração das Variáveis de Ambiente no CloudPanel

Configure as seguintes variáveis de ambiente no seu painel do CloudPanel:

```
NODE_ENV=production
DB_HOST=localhost  # ou endereço do servidor MySQL
DB_PORT=3306
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=nome_do_banco_de_dados
PORT=3000  # ou a porta que você deseja que o app use
```

## 6. Deploy no CloudPanel

### Preparar os arquivos para deploy

1. Construa a aplicação:

```bash
npm run build
```

2. Arquivos essenciais para deploy:
   - A pasta `dist/` com os arquivos compilados
   - `package.json` e `package-lock.json`
   - A pasta `node_modules/` (ou você pode instalar dependências no servidor)
   - `.env` com as variáveis de ambiente (se não estiverem configuradas no CloudPanel)

### Upload e configuração

1. Faça upload dos arquivos para o CloudPanel via FTP ou Git
2. Configure o Node.js como Runtime no CloudPanel
3. Defina o comando de inicialização:

```
node dist/server/index.js
```

4. Inicie o serviço no CloudPanel

## 7. Solução de Problemas

### Verificar logs de erro

```bash
tail -f /var/log/nodejs/sua_aplicacao.log
```

### Problemas de conexão com o banco de dados

1. Verifique se as credenciais do banco de dados estão corretas
2. Confirme se o banco de dados está acessível do servidor da aplicação
3. Teste a conexão manualmente:

```bash
mysql -u seu_usuario -p -h localhost nome_do_banco
```

### Problemas com formulários

Se algum formulário não estiver salvando dados corretamente:

1. Verifique as chamadas de API no console do navegador
2. Confirme se os dados estão chegando corretamente no backend
3. Procure erros no log do servidor

## 8. Manutenção e Backup

### Backup do banco de dados

```bash
mysqldump -u seu_usuario -p nome_do_banco > backup_$(date +%Y%m%d).sql
```

### Restaurar um backup

```bash
mysql -u seu_usuario -p nome_do_banco < caminho_para_backup.sql
```

---

Para qualquer dúvida adicional ou problemas específicos, consulte a documentação do CloudPanel ou entre em contato com o suporte.