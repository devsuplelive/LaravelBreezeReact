import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { createPool } from 'mysql2/promise';
import { drizzle as drizzleMysql } from 'drizzle-orm/mysql2';
import * as mysqlSchema from "@shared/schema-mysql";

// Configuração para PostgreSQL
export function setupPostgres() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL não configurado. Usando banco de dados SQLite.");
    return null;
  }

  try {
    console.log("Conectando ao PostgreSQL via Neon Serverless...");
    const neonConfig = { webSocketConstructor: ws };
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool, schema });
    console.log("Conectado ao PostgreSQL com sucesso!");
    return { pool, db };
  } catch (error) {
    console.error("Erro ao conectar ao PostgreSQL:", error);
    return null;
  }
}

// Configuração para MySQL
export async function setupMysql() {
  try {
    // Verificar se as variáveis de ambiente estão configuradas
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'admin_dashboard';
    const port = Number(process.env.DB_PORT) || 3306;
    
    console.log(`Conectando ao MySQL: ${host}:${port}/${database}`);
    
    // Criar pool de conexões com MySQL
    const pool = createPool({
      host,
      user,
      password,
      database,
      port,
      connectionLimit: 10,
      // Converter zero dates para null
      dateStrings: true,
    });
    
    console.log("Conexão MySQL estabelecida com sucesso!");
    
    // Criar instância Drizzle para MySQL
    const db = drizzleMysql(pool, { schema: mysqlSchema, mode: 'default' });
    
    return { pool, db };
  } catch (error) {
    console.error("Erro ao conectar ao MySQL:", error);
    return null;
  }
}

// Função para obter a conexão adequada (PostgreSQL ou MySQL)
export async function getDbConnection() {
  // Verificar qual banco de dados usar (MySQL tem precedência se configurado)
  if (process.env.DB_HOST && process.env.DB_USER) {
    const mysqlConnection = await setupMysql();
    if (mysqlConnection) {
      console.log("Usando banco de dados MySQL");
      return { type: 'mysql', ...mysqlConnection };
    }
  }
  
  // Tentar PostgreSQL como fallback
  const pgConnection = setupPostgres();
  if (pgConnection) {
    console.log("Usando banco de dados PostgreSQL");
    return { type: 'postgres', ...pgConnection };
  }
  
  // Se chegou aqui, não foi possível conectar a nenhum banco
  console.error("Não foi possível conectar a nenhum banco de dados");
  return null;
}