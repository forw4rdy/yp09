'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');

/* ---------- переменные окружения (.env) ---------- */

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

const api = require('./routes/api');
require('./models/initDatabase');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

app.use(express.json());
app.use(express.static(PUBLIC_DIR, { index: 'index.html', etag: true }));

/* ---------- API ---------- */

app.use('/api', api);

/* ---------- страницы ---------- */

const PAGES = [
  ['/', 'index.html'],
  ['/catalog', 'catalog.html'],
  ['/about', 'about.html'],
  ['/contacts', 'contacts.html']
];

for (const [route, file] of PAGES) {
  app.get(route, (req, res) => res.sendFile(path.join(PUBLIC_DIR, file)));
}

/* ---------- 404 и ошибки ---------- */

app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500).json({ ok: false, error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`«Надежный мотор» запущен: http://localhost:${PORT}`);
});
