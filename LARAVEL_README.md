# Sistema de Gestão Empresarial com Laravel 12, Inertia.js e React

Um sistema completo de gestão empresarial desenvolvido com Laravel 12, usando Inertia.js com React no frontend e integrando o Breeze Starter Kit para autenticação.

## Especificações do Sistema

### Tecnologias
- Laravel 12
- Inertia.js
- React
- Tailwind CSS
- Spatie Laravel Permission (gerenciamento de papéis e permissões)

### Módulos do Sistema
1. **Customers**
   - Campos: id, name, email, phone, document, address, city, state, zip_code, created_at, updated_at

2. **Brands**
   - Campos: id, name, created_at, updated_at

3. **Categories**
   - Campos: id, name, description, created_at, updated_at

4. **Products**
   - Campos: id, name, sku, price, stock, brand_id, category_id, description, created_at, updated_at

5. **Orders**
   - Campos: id, customer_id, order_number, status, total_amount, discount, shipping_cost, payment_method, notes, ordered_at, created_at, updated_at

6. **OrderItems**
   - Campos: id, order_id, product_id, quantity, price, total, created_at, updated_at

7. **Payments**
   - Campos: id, order_id, payment_date, payment_method, amount, transaction_code, created_at, updated_at

8. **Shipping**
   - Campos: id, order_id, carrier, tracking_code, shipped_at, delivered_at, shipping_status, created_at, updated_at

### Recursos Adicionais
- Sistema de permissões e papéis com Spatie Laravel Permission
- Papéis padrão: admin, manager, sales, viewer
- Permissões automáticas para cada módulo
- Interface de gerenciamento de usuários, papéis e permissões
- Dashboard com totais e estatísticas
- Listagens com paginação e busca

## Requisitos

- PHP 8.2 ou superior
- Composer
- Node.js 18 ou superior
- NPM ou Yarn
- MySQL ou MariaDB

## Instalação

Siga estes passos para configurar o projeto em seu ambiente local:

### 1. Clone o repositório

```bash
git clone [URL_DO_SEU_REPOSITORIO]
cd [NOME_DO_DIRETORIO]
```

### 2. Instale as dependências do Composer

```bash
composer install
```

### 3. Instale as dependências do NPM

```bash
npm install
# ou
yarn install
```

### 4. Configure o ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure a conexão com o banco de dados:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=seu_banco_de_dados
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

### 5. Gere a chave de aplicação

```bash
php artisan key:generate
```

### 6. Execute as migrações e seeders

```bash
php artisan migrate --seed
```

### 7. Compile os assets

```bash
npm run dev
# ou para produção
npm run build
```

### 8. Inicie o servidor

```bash
php artisan serve
```

O sistema estará disponível em `http://localhost:8000`

## Estrutura do Projeto

### Estrutura de Diretórios
- `app/Models/` - Modelos do Eloquent
- `app/Http/Controllers/` - Controllers da aplicação
- `app/Http/Requests/` - Form Requests para validação
- `app/Policies/` - Policies para autorização
- `database/migrations/` - Migrações do banco de dados
- `database/seeders/` - Seeders para dados iniciais
- `resources/js/` - Componentes React e páginas
- `resources/js/Pages/` - Páginas da aplicação
- `resources/js/Components/` - Componentes reutilizáveis
- `routes/web.php` - Definições de rotas

### Módulos Principais

Cada módulo inclui:
- Migration - Define a estrutura da tabela
- Model - Define o modelo Eloquent com relacionamentos
- Controller - Gerencia as operações CRUD
- Requests - Valida os dados de entrada
- Policy - Controla autorização
- Pages (Inertia/React) - Interface do usuário
- Testes (Feature e Unit)

## Permissões e Papéis

### Papéis (Roles)
- **Admin** - Acesso completo a todos os módulos
- **Manager** - Acesso a maioria dos módulos com algumas restrições
- **Sales** - Foco em clientes, pedidos e produtos
- **Viewer** - Apenas visualização (sem criar, editar ou excluir)

### Permissões Principais
Cada módulo tem as seguintes permissões:
- view_{module}
- create_{module}
- edit_{module}
- delete_{module}

## Uso do Sistema

### Credenciais Padrão
O sistema vem com um usuário administrador pré-configurado:
- **Email**: admin@example.com
- **Senha**: password

### Dashboard
A página inicial apresenta um dashboard com:
- Total de clientes
- Total de produtos
- Total de pedidos
- Pedidos recentes
- Gráficos de vendas

### Gestão de Usuários
Admin pode criar novos usuários e atribuir papéis:
- Acessar "Usuários" no menu
- Clicar em "Novo Usuário"
- Preencher os detalhes e selecionar o papel

## Personalização

### Tema e Aparência
O projeto usa Tailwind CSS que pode ser customizado em:
- `tailwind.config.js` - Configuração principal
- `resources/css/app.css` - Estilos globais

### Adicionando Novos Módulos
Para criar um novo módulo:

1. Crie a migration:
```bash
php artisan make:migration create_new_module_table
```

2. Crie o modelo:
```bash
php artisan make:model NewModule
```

3. Crie o controller com recursos:
```bash
php artisan make:controller NewModuleController --resource --model=NewModule
```

4. Adicione rotas em `routes/web.php`
5. Crie os componentes React em `resources/js/Pages/`
6. Adicione permissões no seeder

## Contribuição

### Fluxo de Desenvolvimento
1. Crie um branch para sua feature: `feature/nome-da-feature`
2. Faça commit das alterações: `git commit -m 'Adiciona nova feature'`
3. Envie para o branch: `git push origin feature/nome-da-feature`
4. Abra um Pull Request

### Padrões de Código
- PSR-12 para PHP
- ESLint para JavaScript/React
- Testes obrigatórios para novas funcionalidades

## Suporte e Documentação
- [Documentação do Laravel](https://laravel.com/docs)
- [Documentação do Inertia.js](https://inertiajs.com/)
- [Documentação do React](https://reactjs.org/docs/getting-started.html)
- [Documentação do Spatie Permission](https://spatie.be/docs/laravel-permission)

## Licença
Este projeto está licenciado sob a licença MIT.