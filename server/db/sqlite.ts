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
        
        -- Inserir usuário admin padrão (senha: admin123)
        INSERT OR IGNORE INTO users (username, password, email, full_name, role)
        VALUES ('admin', '$2a$10$D8IXj5LMXH7jt5.9aKzwCuQ.bhRm52qLFTgMYpvJXiHgbHUG8tA.C', 'admin@example.com', 'Administrador', 'admin');
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