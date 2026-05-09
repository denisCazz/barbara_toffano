import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

function env(name: string): string | undefined {
  // In Astro SSR (Node) le env runtime sono su process.env.
  // import.meta.env in Vite espone solo variabili prefissate (es. VITE_/PUBLIC_).
  // Usiamo entrambi per compatibilità.
  // @ts-expect-error - import.meta.env è un oggetto speciale Vite/Astro
  return process.env[name] ?? import.meta.env?.[name];
}

export function getDb(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: env('DB_HOST') || 'localhost',
      port: Number(env('DB_PORT')) || 3306,
      user: env('DB_USER') || 'root',
      password: env('DB_PASSWORD') || '',
      database: env('DB_NAME') || 'barbara_toffano',
      waitForConnections: true,
      connectionLimit: 10,
      timezone: '+00:00',
      charset: 'utf8mb4',
    });
  }
  return pool;
}
