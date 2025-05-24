import { createConnection } from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema-mysql";

// Função para criar conexão com MySQL 
export async function createMysqlConnection() {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'admin_dashboard';
    const port = Number(process.env.DB_PORT) || 3306;
    
    console.log(`Conectando ao MySQL: ${host}:${port}/${database}`);
    
    // Criar conexão com MySQL
    const connection = await createConnection({
      host,
      user,
      password,
      database,
      port,
      multipleStatements: true,
      // Converter zero dates para null
      dateStrings: true,
    });
    
    console.log("Conexão MySQL estabelecida com sucesso!");
    
    // Criar instância Drizzle
    const db = drizzle(connection, { schema });
    
    return { connection, db };
  } catch (error) {
    console.error("Erro ao conectar ao MySQL:", error);
    throw error;
  }
}

// Função para inicializar banco de dados MySQL (caso não exista)
export async function initializeMysqlDatabase(connection: any) {
  try {
    // Verificar se o banco de dados já existe
    const [rows] = await connection.execute(
      "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
      [process.env.DB_NAME || 'admin_dashboard']
    );
    
    // Se o banco de dados não existir, crie-o
    if (!rows || (Array.isArray(rows) && rows.length === 0)) {
      console.log(`Criando banco de dados ${process.env.DB_NAME || 'admin_dashboard'}...`);
      await connection.execute(
        `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'admin_dashboard'}`
      );
      console.log("Banco de dados criado com sucesso!");
    }
    
    // Usar o banco de dados
    await connection.execute(
      `USE ${process.env.DB_NAME || 'admin_dashboard'}`
    );
    
    // Verificar tabelas necessárias
    const tables = [
      'users', 'roles', 'permissions', 'user_roles', 'role_permissions',
      'customers', 'brands', 'categories', 'products', 'orders',
      'order_items', 'payments', 'shipping'
    ];
    
    for (const table of tables) {
      const [tableRows] = await connection.execute(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
        [process.env.DB_NAME || 'admin_dashboard', table]
      );
      
      if (!tableRows || (Array.isArray(tableRows) && tableRows.length === 0)) {
        console.log(`Tabela ${table} não encontrada.`);
      } else {
        console.log(`Tabela ${table} já existe.`);
      }
    }
    
    return true;
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados MySQL:", error);
    throw error;
  }
}

// Função para inserir dados iniciais (se necessário)
export async function seedMysqlDatabase(db: any) {
  try {
    // Verificar se já existem dados na tabela users
    const [rows] = await db.connection.execute("SELECT COUNT(*) as count FROM users");
    const count = rows[0].count;
    
    if (count > 0) {
      console.log("Dados iniciais já existem. Pulando...");
      return;
    }
    
    console.log("Inserindo dados iniciais...");
    
    // Inserir usuário admin
    await db.connection.execute(`
      INSERT INTO users (username, email, password, first_name, last_name, active)
      VALUES ('admin', 'admin@exemplo.com', 
        '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 
        'Admin', 'User', 1)
    `);
    
    // Inserir funções (roles)
    await db.connection.execute(`
      INSERT INTO roles (name, description)
      VALUES ('admin', 'Administrador com acesso total')
    `);
    
    // Inserir permissões básicas
    const permissions = [
      ["VIEW_DASHBOARD", "Visualizar dashboard"],
      ["VIEW_USERS", "Visualizar usuários"],
      ["CREATE_USERS", "Criar usuários"],
      ["EDIT_USERS", "Editar usuários"],
      ["DELETE_USERS", "Excluir usuários"],
      ["VIEW_ROLES", "Visualizar funções"],
      ["CREATE_ROLES", "Criar funções"],
      ["EDIT_ROLES", "Editar funções"],
      ["DELETE_ROLES", "Excluir funções"],
      ["VIEW_PERMISSIONS", "Visualizar permissões"],
      ["VIEW_CUSTOMERS", "Visualizar clientes"],
      ["CREATE_CUSTOMERS", "Criar clientes"],
      ["EDIT_CUSTOMERS", "Editar clientes"],
      ["DELETE_CUSTOMERS", "Excluir clientes"],
      ["VIEW_PRODUCTS", "Visualizar produtos"],
      ["CREATE_PRODUCTS", "Criar produtos"],
      ["EDIT_PRODUCTS", "Editar produtos"],
      ["DELETE_PRODUCTS", "Excluir produtos"],
      ["VIEW_BRANDS", "Visualizar marcas"],
      ["CREATE_BRANDS", "Criar marcas"],
      ["EDIT_BRANDS", "Editar marcas"],
      ["DELETE_BRANDS", "Excluir marcas"],
      ["VIEW_CATEGORIES", "Visualizar categorias"],
      ["CREATE_CATEGORIES", "Criar categorias"],
      ["EDIT_CATEGORIES", "Editar categorias"],
      ["DELETE_CATEGORIES", "Excluir categorias"],
      ["VIEW_ORDERS", "Visualizar pedidos"],
      ["CREATE_ORDERS", "Criar pedidos"],
      ["EDIT_ORDERS", "Editar pedidos"],
      ["DELETE_ORDERS", "Excluir pedidos"],
      ["VIEW_PAYMENTS", "Visualizar pagamentos"],
      ["CREATE_PAYMENTS", "Criar pagamentos"],
      ["EDIT_PAYMENTS", "Editar pagamentos"],
      ["DELETE_PAYMENTS", "Excluir pagamentos"],
      ["VIEW_SHIPPING", "Visualizar envios"],
      ["CREATE_SHIPPING", "Criar envios"],
      ["EDIT_SHIPPING", "Editar envios"],
      ["DELETE_SHIPPING", "Excluir envios"]
    ];
    
    for (const [name, description] of permissions) {
      await db.connection.execute(
        "INSERT INTO permissions (name, description) VALUES (?, ?)",
        [name, description]
      );
    }
    
    // Relacionar admin com todas as permissões
    // Primeiro, obter ID da função admin
    const [roleRows] = await db.connection.execute("SELECT id FROM roles WHERE name = 'admin'");
    const adminRoleId = roleRows[0].id;
    
    // Depois, obter IDs de todas as permissões
    const [permRows] = await db.connection.execute("SELECT id FROM permissions");
    
    // Relacionar admin com todas as permissões
    for (const row of permRows) {
      await db.connection.execute(
        "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        [adminRoleId, row.id]
      );
    }
    
    // Relacionar usuário admin com função admin
    const [userRows] = await db.connection.execute("SELECT id FROM users WHERE username = 'admin'");
    const adminUserId = userRows[0].id;
    
    await db.connection.execute(
      "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
      [adminUserId, adminRoleId]
    );
    
    console.log("Dados iniciais inseridos com sucesso!");
  } catch (error) {
    console.error("Erro ao inserir dados iniciais:", error);
    throw error;
  }
}