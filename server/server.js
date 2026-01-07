
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = '2care-secure-token-v1';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Multer Storage Config
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `report-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Middleware: Verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.userId = decoded.id;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  
  db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, 
    [username, email, hashed], 
    function(err) {
      if (err) return res.status(400).json({ error: 'Email already exists' });
      const token = jwt.sign({ id: this.lastID }, SECRET, { expiresIn: '24h' });
      res.json({ user: { id: this.lastID, username, email }, token });
    }
  );
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '24h' });
    res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
  });
});

// --- REPORT ROUTES ---
app.post('/api/reports/upload', verifyToken, upload.single('report'), (req, res) => {
  const { category, date, vitals } = req.body;
  const filename = req.file ? req.file.filename : 'none';

  db.run(`INSERT INTO reports (user_id, filename, type, category, date, vitals_json) VALUES (?, ?, ?, ?, ?, ?)`,
    [req.userId, filename, req.file?.mimetype, category, date, vitals],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, filename });
    }
  );
});

app.get('/api/reports', verifyToken, (req, res) => {
  // Complex query to get user reports AND shared reports
  db.get(`SELECT email FROM users WHERE id = ?`, [req.userId], (err, user) => {
    const userEmail = user.email;
    db.all(`
      SELECT r.* FROM reports r
      WHERE r.user_id = ? 
      OR EXISTS (
        SELECT 1 FROM access_shares s 
        WHERE s.viewer_email = ? 
        AND (s.report_id_or_all = 'all' OR s.report_id_or_all = CAST(r.id AS TEXT))
      )
    `, [req.userId, userEmail], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const parsed = rows.map(r => ({ ...r, vitals: JSON.parse(r.vitals_json || '{}') }));
      res.json(parsed);
    });
  });
});

app.post('/api/share', verifyToken, (req, res) => {
  const { viewer_email, report_id_or_all } = req.body;
  db.run(`INSERT INTO access_shares (owner_id, viewer_email, report_id_or_all) VALUES (?, ?, ?)`,
    [req.userId, viewer_email, report_id_or_all],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
