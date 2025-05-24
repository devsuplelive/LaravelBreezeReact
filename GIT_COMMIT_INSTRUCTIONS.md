# Instruções para Enviar Alterações ao Git

Para salvar suas alterações no repositório Git, siga estes passos:

## 1. Verificar o status das alterações

```bash
git status
```

Este comando mostrará todos os arquivos novos e modificados.

## 2. Adicionar arquivos ao commit

Para adicionar todos os arquivos modificados:

```bash
git add .
```

Ou para adicionar arquivos específicos:

```bash
git add server/db.ts
git add shared/schema-mysql.ts
git add server/db/mysql.ts
git add .env.example
git add DEPLOY_MYSQL_GUIDE.md
git add TEST_FORMULARIOS_GUIA.md
```

## 3. Criar o commit

```bash
git commit -m "Migração para MySQL implementada"
```

Você pode personalizar a mensagem de commit conforme necessário.

## 4. Enviar para o repositório remoto

```bash
git push origin main
```

Se estiver usando uma branch diferente, substitua "main" pelo nome da sua branch.

## Arquivos principais da migração para MySQL

Aqui estão os principais arquivos que foram criados ou modificados durante a migração:

1. `shared/schema-mysql.ts` - Esquema do banco de dados para MySQL
2. `server/db.ts` - Configuração de conexão com MySQL/PostgreSQL/SQLite
3. `server/db/mysql.ts` - Funções para inicializar o banco de dados MySQL
4. `.env` e `.env.example` - Configurações de ambiente para conexão MySQL
5. `DEPLOY_MYSQL_GUIDE.md` - Guia para implantação com MySQL no CloudPanel
6. `TEST_FORMULARIOS_GUIA.md` - Guia para testar formulários com banco de dados
7. `server/index.ts` - Modificado para usar conexão MySQL quando disponível

## Notas adicionais

- O sistema agora tenta se conectar ao MySQL primeiro, e se não for possível, usa SQLite como fallback
- As variáveis de ambiente necessárias para MySQL estão configuradas no arquivo `.env.example`
- O guia de implantação `DEPLOY_MYSQL_GUIDE.md` contém instruções detalhadas para implantação no CloudPanel