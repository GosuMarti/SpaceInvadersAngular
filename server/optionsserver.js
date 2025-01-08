const express = require('express');
const cors = require('cors'); // Import the CORS package
const mysql = require('mysql2');

const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());

const db = mysql.createConnection({
  host: 'wd.etsisi.upm.es',
  user: 'class',
  password: 'Class24_25',
  database: 'marsbd',
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to database.');
});

app.get('/preferences/:username', (req, res) => {
  const username = req.params.username;
  const query = `SELECT ufos, time FROM prefView WHERE user = ?`;

  db.query(query, [username], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || {});
  });
});

app.post('/preferences', (req, res) => {
  const { username, ufos, time } = req.body;
  const query = `UPDATE prefView SET ufos = ?, time = ? WHERE user = ?`;

  db.query(query, [ufos, time, username], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Preferences updated successfully.' });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
