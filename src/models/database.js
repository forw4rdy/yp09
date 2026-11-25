'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

// Файл базы лежит в корне проекта: /database.db
const DB_PATH = process.env.DB_PATH
  ? path.resolve(__dirname, '..', '..', process.env.DB_PATH)
  : path.join(__dirname, '..', '..', 'database.db');

const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS services (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT UNIQUE NOT NULL,
    title       TEXT NOT NULL,
    category    TEXT NOT NULL,
    price       INTEGER NOT NULL,
    price_note  TEXT DEFAULT '',
    duration    TEXT DEFAULT '',
    summary     TEXT NOT NULL,
    description TEXT NOT NULL,
    includes    TEXT NOT NULL DEFAULT '[]',
    image       TEXT DEFAULT '',
    warranty    TEXT DEFAULT '',
    sort        INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    author     TEXT NOT NULL,
    car        TEXT DEFAULT '',
    text       TEXT NOT NULL,
    rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    phone      TEXT NOT NULL,
    service_id INTEGER,
    comment    TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    status     TEXT NOT NULL DEFAULT 'new',
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    phone      TEXT DEFAULT '',
    email      TEXT DEFAULT '',
    message    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

module.exports = db;
