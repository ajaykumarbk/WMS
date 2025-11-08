// const mysql = require('mysql2');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// module.exports = pool.promise();


const mysql = require('mysql2');
require('dotenv').config();

// ✅ Enable SSL if MySQL requires it
const sslConfig = process.env.DB_SSL === "true"
  ? { rejectUnauthorized: false }
  : false;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,     // FIXED name: DB_PASSWORD not DB_PASS
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: sslConfig,                        // ✅ SSL support for Oracle MySQL
});

// ✅ Better error logging for debugging
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ DB Connection Failed:", err.message);
  } else {
    console.log("✅ Connected to MySQL DB");
    connection.release();
  }
});

module.exports = pool.promise();
