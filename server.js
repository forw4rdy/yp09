'use strict';

const path = require('path');
const express = require('express');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

app.use(express.json());
app.use(express.static(PUBLIC_DIR, { index: 'index.html', etag: true }));

function isBlank(v) {
  return typeof v !== 'string' || v.trim().length === 0;
}

function validPhone(v) {
  if (typeof v !== 'string') return false;
  const digits = v.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function sendError(res, status, message) {
  res.status(status).json({ ok: false, error: message });
}

function sendOk(res, data) {
  res.json(Object.assign({ ok: true }, data || {}));
}

app.get('/api/services', (req, res) => {
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
  let rows;
  if (category && category !== 'Все') {
    rows = db
      .prepare('SELECT id, slug, title, category, price, price_note, duration, summary, image, warranty FROM services WHERE category = ? ORDER BY sort')
      .all(category);
  } else {
    rows = db
      .prepare('SELECT id, slug, title, category, price, price_note, duration, summary, image, warranty FROM services ORDER BY sort')
      .all();
  }
  sendOk(res, { services: rows });
});

app.get('/api/services/categories', (req, res) => {
  const rows = db
    .prepare('SELECT category FROM services GROUP BY category ORDER BY MIN(sort)')
    .all();
  sendOk(res, { categories: rows.map(r => r.category) });
});

app.get('/api/services/:slug', (req, res) => {
  const row = db
    .prepare('SELECT * FROM services WHERE slug = ?')
    .get(req.params.slug);

  if (!row) return sendError(res, 404, 'Услуга не найдена');

  let includes = [];
  try {
    includes = JSON.parse(row.includes);
  } catch (e) {
    includes = [];
  }

  const related = db
    .prepare(
      `SELECT slug, title, price, duration FROM services
       WHERE category = ? AND slug != ? ORDER BY sort LIMIT 3`
    )
    .all(row.category, row.slug);

  sendOk(res, { service: Object.assign({}, row, { includes }), related });
});

app.get('/api/reviews', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 6, 50);
  const rows = db
    .prepare('SELECT id, author, car, text, rating, created_at FROM reviews ORDER BY id DESC LIMIT ?')
    .all(limit);
  sendOk(res, { reviews: rows });
});

app.post('/api/reviews', (req, res) => {
  const body = req.body || {};
  const author = isBlank(body.author) ? '' : String(body.author).trim();
  const text = isBlank(body.text) ? '' : String(body.text).trim();
  const car = isBlank(body.car) ? '' : String(body.car).trim().slice(0, 80);
  const rating = parseInt(body.rating, 10);

  if (author.length < 2 || author.length > 60) {
    return sendError(res, 400, 'Укажите имя (от 2 до 60 символов)');
  }
  if (text.length < 10 || text.length > 1000) {
    return sendError(res, 400, 'Текст отзыва — от 10 до 1000 символов');
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return sendError(res, 400, 'Выберите оценку от 1 до 5');
  }

  const info = db
    .prepare('INSERT INTO reviews (author, car, text, rating) VALUES (?, ?, ?, ?)')
    .run(author, car, text, rating);

  const row = db
    .prepare('SELECT id, author, car, text, rating, created_at FROM reviews WHERE id = ?')
    .get(info.lastInsertRowid);

  sendOk(res, { review: row });
});

app.post('/api/bookings', (req, res) => {
  const body = req.body || {};
  const name = isBlank(body.name) ? '' : String(body.name).trim();
  const phone = isBlank(body.phone) ? '' : String(body.phone).trim();
  const comment = isBlank(body.comment) ? '' : String(body.comment).trim().slice(0, 500);
  const serviceId = parseInt(body.service_id, 10);

  if (name.length < 2 || name.length > 60) {
    return sendError(res, 400, 'Укажите имя (от 2 до 60 символов)');
  }
  if (!validPhone(phone)) {
    return sendError(res, 400, 'Укажите корректный номер телефона');
  }

  const service = Number.isInteger(serviceId)
    ? db.prepare('SELECT id FROM services WHERE id = ?').get(serviceId)
    : null;

  db.prepare('INSERT INTO bookings (name, phone, service_id, comment) VALUES (?, ?, ?, ?)')
    .run(name, phone, service ? service.id : null, comment);

  sendOk(res, { message: 'Заявка принята — перезвоним в течение 15 минут' });
});

app.post('/api/messages', (req, res) => {
  const body = req.body || {};
  const name = isBlank(body.name) ? '' : String(body.name).trim();
  const phone = isBlank(body.phone) ? '' : String(body.phone).trim();
  const email = isBlank(body.email) ? '' : String(body.email).trim().slice(0, 120);
  const message = isBlank(body.message) ? '' : String(body.message).trim();
  const serviceId = parseInt(body.service_id, 10);

  if (name.length < 2 || name.length > 60) {
    return sendError(res, 400, 'Укажите имя (от 2 до 60 символов)');
  }
  if (message.length < 5 || message.length > 2000) {
    return sendError(res, 400, 'Сообщение — от 5 до 2000 символов');
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return sendError(res, 400, 'Проверьте адрес электронной почты');
  }
  if (phone && !validPhone(phone)) {
    return sendError(res, 400, 'Проверьте номер телефона');
  }

  const service = Number.isInteger(serviceId)
    ? db.prepare('SELECT id FROM services WHERE id = ?').get(serviceId)
    : null;

  if (body.service_id && !service) {
    return sendError(res, 400, 'Выберите услугу из списка');
  }

  db.prepare('INSERT INTO messages (name, phone, email, service_id, message) VALUES (?, ?, ?, ?, ?)')
    .run(name, phone, email, service ? service.id : null, message);

  sendOk(res, { message: 'Сообщение отправлено, ответим в рабочее время' });
});

const PAGES = [
  ['/', 'index.html'],
  ['/services', 'services.html'],
  ['/about', 'about.html'],
  ['/contacts', 'contacts.html']
];

for (const [route, file] of PAGES) {
  app.get(route, (req, res) => res.sendFile(path.join(PUBLIC_DIR, file)));
}

app.get('/services/:slug', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'service.html'));
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(PUBLIC_DIR, '404.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  sendError(res, 500, 'Внутренняя ошибка сервера');
});

app.listen(PORT, () => {
  console.log(`«Надежный мотор» запущен: http://localhost:${PORT}`);
});
