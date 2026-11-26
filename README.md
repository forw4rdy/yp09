# Надежный мотор — сайт автосервиса

Сайт автосервиса «Надежный мотор»: 5 страниц, AJAX через Fetch API,
сервер на Node.js (Express), база данных SQLite.

## Стек

| Слой        | Технология                     |
| ----------- | ------------------------------ |
| Сервер      | Node.js 24, Express 5          |
| База данных | SQLite (`node:sqlite`, встроена в Node) |
| Фронтенд    | HTML, CSS, ванильный JS (AJAX — Fetch API) |
| Шрифты      | Manrope + IBM Plex Mono (локально, без CDN) |

## Страницы

- `/` — главная: герой, услуги, процесс, преимущества, отзывы, форма записи
- `/services` — каталог услуг с AJAX-фильтром по категориям
- `/services/:slug` — страница отдельной услуги (данные грузятся по slug)
- `/about` — о сервисе: история, принципы, команда, оборудование
- `/contacts` — контакты, схема проезда, форма обратной связи, FAQ
- любая неизвестная — страница 404

## AJAX (Fetch API)

Весь динамический контент и все формы работают через `fetch`:

| Запрос                       | Метод | Назначение                          |
| ---------------------------- | ----- | ----------------------------------- |
| `/api/services`              | GET   | список услуг, `?category=` — фильтр  |
| `/api/services/categories`   | GET   | список категорий                    |
| `/api/services/:slug`        | GET   | одна услуга + похожие               |
| `/api/reviews`               | GET   | отзывы (`?limit=`)                  |
| `/api/reviews`               | POST  | добавить отзыв                      |
| `/api/bookings`              | POST  | заявка на ремонт                    |
| `/api/messages`              | POST  | сообщение из формы контактов        |

## Запуск

```bash
npm install
npm start
# сайт: http://localhost:3000
```

При первом запуске создаётся `data/site.db` и наполняется демо-данными
(12 услуг, 6 отзывов).

Режим разработки с автоперезапуском:

```bash
npm run dev
```

## Структура

```
├── server.js          # Express: статика + REST API + маршруты страниц
├── db.js              # SQLite: схема, сид-данные
├── data/
│   └── site.db        # база (создаётся автоматически, не в git)
└── public/
    ├── index.html     # главная
    ├── services.html  # каталог услуг
    ├── service.html   # страница услуги (шаблон, данные через AJAX)
    ├── about.html     # о нас
    ├── contacts.html  # контакты
    ├── 404.html
    ├── css/style.css
    ├── js/
    │   ├── main.js     # шапка, меню, reveal, FAQ, apiRequest()
    │   ├── home.js     # главная: услуги, отзывы, форма записи
    │   ├── services.js # каталог: фильтр и рендер карточек
    │   ├── service.js  # страница услуги по slug
    │   └── contacts.js # форма контактов + валидация
    ├── fonts/          # локальные woff2
    └── img/            # фотографии (Wikimedia Commons, CC)
```

## Git

```bash
git init
git add .
git commit -m "Сайт автосервиса «Надежный мотор»: Express + SQLite + AJAX"
```

Публикация на GitHub:

```bash
git remote add origin https://github.com/<ваш-логин>/nadezhny-motor.git
git push -u origin main
```

## Источники фотографий

Снимки загружены с Wikimedia Commons и используются по лицензиям CC:

- Car repair shop — Martin Vorel, CC BY-SA 4.0
- Car mechanic / mechanic works in garage — Shixart1985, CC BY 2.0
- Changing engine oil, oil on engine, car on lift, diagnostics — Shixart1985, CC BY 2.0
- Modern car wheel balancing machine — CC BY 2.0
