import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '@shared/schema';
import path from 'path';

// Caminho para o arquivo do banco de dados
const dbPath = path.resolve(process.cwd(), 'database.sqlite');
console.log(`Usando banco de dados SQLite em: ${dbPath}`);

// Inicializa o banco de dados SQLite
export const sqlite = new Database(dbPath);

// Cria a conexão com o Drizzle ORM
export const db = drizzle(sqlite, { schema });

// Função para adicionar dados de exemplo
export const seedSampleData = () => {
  try {
    console.log('Verificando se existem dados de exemplo...');
    
    // Verificar se já existem marcas
    const result = sqlite.prepare('SELECT COUNT(*) as count FROM brands').get();
    const brandsCount = result ? (result as any).count : 0;
    
    if (brandsCount === 0) {
      console.log('Adicionando dados de exemplo...');
      
      // Inserir marcas
      sqlite.exec(`
        INSERT INTO brands (name) VALUES 
          ('Nike'), 
          ('Adidas'), 
          ('Apple'), 
          ('Samsung'), 
          ('Sony');
      `);
      
      // Inserir categorias
      sqlite.exec(`
        INSERT INTO categories (name, description) VALUES 
          ('Eletrônicos', 'Produtos eletrônicos como smartphones, tablets e laptops'),
          ('Roupas', 'Vestimentas masculinas e femininas'),
          ('Calçados', 'Sapatos, tênis, sandálias e botas'),
          ('Acessórios', 'Relógios, bolsas, cintos e joias');
      `);
      
      // Inserir produtos
      sqlite.exec(`
        INSERT INTO products (name, sku, price, stock, brand_id, category_id, description) VALUES 
          ('iPhone 13 Pro', 'APPH-13PRO-256', 5999.00, 25, 3, 1, 'iPhone 13 Pro com 256GB de armazenamento'),
          ('Samsung Galaxy S22', 'SAMG-S22-128', 4499.00, 18, 4, 1, 'Samsung Galaxy S22 com 128GB de armazenamento'),
          ('Tênis Nike Air Max', 'NK-AIRMAX-42', 799.00, 30, 1, 3, 'Tênis Nike Air Max masculino, tamanho 42'),
          ('Camisa Adidas Originals', 'AD-ORIG-M', 299.00, 45, 2, 2, 'Camisa Adidas Originals, tamanho M');
      `);
      
      // Inserir clientes
      sqlite.exec(`
        INSERT INTO customers (name, email, phone, document, address, city, state, zip_code) VALUES 
          ('João Silva', 'joao@example.com', '(11) 99999-8888', '123.456.789-00', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567'),
          ('Maria Oliveira', 'maria@example.com', '(11) 97777-6666', '987.654.321-00', 'Av. Paulista, 1000', 'São Paulo', 'SP', '01310-100'),
          ('Carlos Santos', 'carlos@example.com', '(21) 98888-7777', '111.222.333-44', 'Rua do Comércio, 45', 'Rio de Janeiro', 'RJ', '20010-020');
      `);
      
      console.log('Dados de exemplo adicionados com sucesso!');
    } else {
      console.log('Dados de exemplo já existem. Pulando...');
    }
  } catch (error) {
    console.error('Erro ao adicionar dados de exemplo:', error);
  }
};

// Função para realizar configuração inicial do banco de dados
export const initializeDatabase = () => {
  try {
    console.log('Inicializando banco de dados SQLite...');
    
    // Verificar se as tabelas existem
    const tables = sqlite.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'drizzle_%'
    `).all();
    
    if (tables.length === 0) {
      console.log('Criando tabelas iniciais...');
      
      // Executar SQL para criar tabelas - isso é uma alternativa direta
      // em vez de usar migrações, para simplificar o processo
      sqlite.exec(`
        -- Usuários
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          email TEXT UNIQUE,
          full_name TEXT,
          role TEXT NOT NULL DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Papéis e permissões
        CREATE TABLE IF NOT EXISTS roles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS permissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS user_roles (
          user_id INTEGER,
          role_id INTEGER,
          PRIMARY KEY (user_id, role_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS role_permissions (
          role_id INTEGER,
          permission_id INTEGER,
          PRIMARY KEY (role_id, permission_id),
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
        );
        
        -- Clientes
        CREATE TABLE IF NOT EXISTS customers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          phone TEXT,
          document TEXT,
          address TEXT,
          city TEXT,
          state TEXT,
          zip_code TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Marcas
        CREATE TABLE IF NOT EXISTS brands (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Categorias
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Produtos
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          sku TEXT UNIQUE NOT NULL,
          price REAL NOT NULL,
          stock INTEGER NOT NULL DEFAULT 0,
          brand_id INTEGER,
          category_id INTEGER,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
          FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        );
        
        -- Pedidos
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          customer_id INTEGER,
          order_number TEXT UNIQUE NOT NULL,
          status TEXT NOT NULL DEFAULT 'pending',
          total_amount REAL NOT NULL,
          discount REAL DEFAULT 0,
          shipping_cost REAL DEFAULT 0,
          payment_method TEXT,
          notes TEXT,
          ordered_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
        );
        
        -- Itens do Pedido
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          total REAL NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
        );
        
        -- Pagamentos
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          payment_date DATETIME,
          payment_method TEXT NOT NULL,
          amount REAL NOT NULL,
          transaction_code TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        );
        
        -- Envios
        CREATE TABLE IF NOT EXISTS shipping (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          carrier TEXT NOT NULL,
          tracking_code TEXT,
          shipped_at DATETIME,
          delivered_at DATETIME,
          shipping_status TEXT NOT NULL DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        );
        
        -- Inserir usuário admin padrão (senha: admin123)
        INSERT OR IGNORE INTO users (username, password, email, full_name, role)
        VALUES ('admin', '$2a$10$D8IXj5LMXH7jt5.9aKzwCuQ.bhRm52qLFTgMYpvJXiHgbHUG8tA.C', 'admin@example.com', 'Administrador', 'admin');
        
        -- Inserir papéis padrão
        INSERT OR IGNORE INTO roles (name, description) VALUES 
          ('admin', 'Acesso completo ao sistema'),
          ('manager', 'Acesso gerencial ao sistema'),
          ('sales', 'Acesso às funcionalidades de vendas'),
          ('viewer', 'Acesso somente leitura');
        
        -- Inserir permissões padrão
        INSERT OR IGNORE INTO permissions (name) VALUES 
          ('view_users'), ('create_users'), ('edit_users'), ('delete_users'),
          ('view_roles'), ('create_roles'), ('edit_roles'), ('delete_roles'),
          ('view_permissions'), ('create_permissions'), ('edit_permissions'), ('delete_permissions'),
          ('view_customers'), ('create_customers'), ('edit_customers'), ('delete_customers'),
          ('view_brands'), ('create_brands'), ('edit_brands'), ('delete_brands'),
          ('view_categories'), ('create_categories'), ('edit_categories'), ('delete_categories'),
          ('view_products'), ('create_products'), ('edit_products'), ('delete_products'),
          ('view_orders'), ('create_orders'), ('edit_orders'), ('delete_orders'),
          ('view_payments'), ('create_payments'), ('edit_payments'), ('delete_payments'),
          ('view_shipping'), ('create_shipping'), ('edit_shipping'), ('delete_shipping'),
          ('view_dashboard');
          
        -- Atribuir todas as permissões ao papel admin
        INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin';
      `);
      
      console.log('Banco de dados inicializado com sucesso!');
    } else {
      console.log('Banco de dados já inicializado:', tables.map(t => t.name).join(', '));
    }
  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
    throw error;
  }
};