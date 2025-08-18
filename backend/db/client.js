import pkg from "pg";
const { Pool } = pkg;

import "dotenv/config";

const options = { connectionString: process.env.DATABASE_URL };

// Need SSL for external database connection
if (process.env.NODE_ENV === "production") {
  options.ssl = { rejectUnauthorized: false };
}

const db = new Pool(options);

export default db;
