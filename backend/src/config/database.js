import dotenv from 'dotenv';
dotenv.config();

let poolPromise = null;

/**
 * Initializes and returns the SQL Server connection pool.
 * Seamlessly handles Windows Integrated Authentication (ODBC Driver 18 / Shared Memory)
 * and SQL Server standard authentication.
 */
export async function getDbPool() {
  if (poolPromise) return poolPromise;

  const server = process.env.DB_SERVER || 'localhost';
  const database = process.env.DB_DATABASE || 'TravelDocDB';
  const user = process.env.DB_USER || '';
  const password = process.env.DB_PASSWORD || '';
  const port = parseInt(process.env.DB_PORT, 10) || 1433;

  try {
    if (user && password) {
      // Standard SQL Server authentication using Tedious
      const sql = await import('mssql');
      const config = {
        server,
        database,
        port,
        user,
        password,
        options: {
          encrypt: process.env.DB_ENCRYPT === 'true',
          trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
          enableArithAbort: true,
        },
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000,
        },
      };
      poolPromise = new sql.default.ConnectionPool(config).connect();
    } else {
      // Windows Integrated Authentication on Windows via msnodesqlv8
      const sql = await import('mssql/msnodesqlv8.js');
      const connStr = `Driver={ODBC Driver 18 for SQL Server};Server=${server};Database=${database};Trusted_Connection=yes;TrustServerCertificate=yes;`;
      poolPromise = new sql.default.ConnectionPool({
        connectionString: connStr,
        pool: {
          max: 10,
          min: 0,
          idleTimeoutMillis: 30000,
        },
      }).connect();
    }

    const pool = await poolPromise;
    console.log(`[Database] Connected to Microsoft SQL Server (${database}) successfully.`);
    return pool;
  } catch (err) {
    poolPromise = null;
    console.error('[Database] Connection failed:', err.message);
    throw err;
  }
}

/**
 * Helper to execute a parameterized SQL query
 */
export async function query(sqlText, params = {}) {
  const pool = await getDbPool();
  const request = pool.request();

  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }

  return request.query(sqlText);
}
