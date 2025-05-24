import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializeDatabase, seedSampleData } from "./db/sqlite";
import { getDbConnection } from "./db";
import dotenv from 'dotenv';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Tentar conectar ao MySQL ou PostgreSQL primeiro
  let dbConnection = null;
  
  try {
    if (process.env.DB_HOST || process.env.DATABASE_URL) {
      console.log("Tentando conectar ao banco de dados MySQL ou PostgreSQL...");
      dbConnection = await getDbConnection();
      
      if (dbConnection) {
        console.log(`Banco de dados ${dbConnection.type} conectado com sucesso!`);
        // O banco de dados já está inicializado e pronto para uso
        // Você poderia executar migrações aqui se necessário
      }
    }
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados externo:", error);
    console.log("Usando SQLite como fallback...");
    dbConnection = null;
  }
  
  // Se não conseguir conectar ao banco externo, usar SQLite
  if (!dbConnection) {
    try {
      initializeDatabase();
      console.log("Banco de dados SQLite inicializado com sucesso!");
      
      // Adicionar dados de exemplo
      seedSampleData();
    } catch (error) {
      console.error("Erro ao inicializar banco de dados SQLite:", error);
    }
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
