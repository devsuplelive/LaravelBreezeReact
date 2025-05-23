# Guia Rápido para Configurar o Sistema Laravel 12 com Inertia.js e React

Este guia resume os passos necessários para configurar o sistema de gestão empresarial usando Laravel 12 com Inertia.js e React, conforme solicitado.

## Requisitos do Sistema

- PHP 8.2 ou superior
- Composer
- Node.js e npm
- MySQL/MariaDB/PostgreSQL

## Passos Iniciais

1. **Criar projeto novo**:
   ```bash
   composer create-project laravel/laravel:^12.0 sistema-gestao
   cd sistema-gestao
   ```

2. **Instalar Breeze com Inertia e React**:
   ```bash
   composer require laravel/breeze --dev
   php artisan breeze:install
   ```
   Selecione:
   - Stack: Inertia
   - Frontend: React with TypeScript
   - Dark Mode: yes

3. **Instalar o sistema de permissões**:
   ```bash
   composer require spatie/laravel-permission
   php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
   ```

4. **Configurar banco de dados** no arquivo `.env`

5. **Executar migrações iniciais**:
   ```bash
   php artisan migrate
   ```

## Módulos do Sistema

O sistema inclui os seguintes módulos:

1. **Customers** - Gestão de clientes
2. **Brands** - Marcas de produtos
3. **Categories** - Categorias de produtos
4. **Products** - Catálogo de produtos
5. **Orders** - Pedidos de clientes
6. **OrderItems** - Itens de pedidos
7. **Payments** - Registro de pagamentos
8. **Shipping** - Controle de entregas
9. **Users** - Usuários do sistema
10. **Roles** - Papéis de usuário
11. **Permissions** - Permissões do sistema

## Estrutura de Pastas

```
app/
├── Http/
│   ├── Controllers/      # Controladores CRUD
│   └── Requests/         # Form Requests para validação
├── Models/               # Modelos Eloquent
└── Policies/             # Políticas de autorização
database/
├── migrations/           # Migrações de banco de dados
└── seeders/              # Seeders para dados iniciais
resources/
└── js/
    └── Pages/            # Páginas React com Inertia
```

## Papéis de Usuário

- **Admin** - Acesso total ao sistema
- **Manager** - Acesso parcial (sem excluir)
- **Sales** - Acesso relacionado a vendas
- **Viewer** - Somente visualização

## Executando o Sistema

Após configurar todo o código mencionado no guia completo:

```bash
# Compilar assets
npm run dev

# Iniciar o servidor
php artisan serve
```

Acesse o sistema em: http://localhost:8000

## Credenciais Padrão

- **Email**: admin@example.com
- **Senha**: password

## Próximos Passos

Para implementar o sistema completo, siga o guia detalhado em `LARAVEL_CREATION_GUIDE.md` que contém todos os códigos necessários para:

1. Criar migrações para cada tabela
2. Definir modelos com relacionamentos
3. Implementar controladores com métodos CRUD
4. Configurar validação com Form Requests
5. Implementar autorização com Policies
6. Criar as páginas React com Inertia.js
7. Configurar sistema de permissões
8. Criar seeders para dados iniciais