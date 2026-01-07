
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./health_wallet.db');

db.serialize(() => {
  // Create Users Table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);

  // Create Reports Table
  db.run(`CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    filename TEXT NOT NULL,
    type TEXT,
    category TEXT,
    date TEXT,
    vitals_json TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // Create Access Shares Table
  db.run(`CREATE TABLE IF NOT EXISTS access_shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER,
    viewer_email TEXT NOT NULL,
    report_id_or_all TEXT NOT NULL,
    FOREIGN KEY(owner_id) REFERENCES users(id)
  )`);

  // Seed Admin User
  db.get("SELECT count(*) as count FROM users WHERE email = 'admin'", (err, row) => {
    if (row && row.count === 0) {
      const adminPass = bcrypt.hashSync('admin', 10);
      db.run("INSERT INTO users (username, email, password) VALUES ('admin', 'admin', ?)", [adminPass], (err) => {
        if (!err) console.log("Default admin account created: admin/admin");
      });
    }
  });
});

module.exports = db;
