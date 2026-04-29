import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getDb(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: import.meta.env.DB_HOST || 'localhost',
      port: Number(import.meta.env.DB_PORT) || 3306,
      user: import.meta.env.DB_USER || 'root',
      password: import.meta.env.DB_PASSWORD || '',
      database: import.meta.env.DB_NAME || 'barbara_toffano',
      waitForConnections: true,
      connectionLimit: 10,
      timezone: '+00:00',
      charset: 'utf8mb4',
    });
  }
  return pool;
}
