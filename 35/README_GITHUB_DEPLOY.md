# GitHub-ready версия DUT SaaS

Эта версия подготовлена для загрузки в GitHub-репозиторий и последующего деплоя Node.js-сервера.

## Важно

GitHub Pages подходит для статических сайтов. DUT SaaS использует Node.js backend, API, cookie-сессии и JSON-базу `data/db.json`, поэтому для рабочей версии с регистрацией, задачами и админкой нужен серверный хостинг.

Рекомендуемый простой вариант: загрузить проект в GitHub и подключить репозиторий к Render, Railway, Fly.io или другому Node.js-хостингу.

## Быстрый деплой через Render

1. Создай репозиторий на GitHub.
2. Загрузи туда файлы из этого архива.
3. На Render создай новый Web Service.
4. Подключи GitHub-репозиторий.
5. Build Command:

```bash
npm install
```

6. Start Command:

```bash
npm start
```

7. Environment Variables:

```text
COOKIE_SECRET=длинная_случайная_строка
ADMIN_EMAIL=yurapon11972020@gmail.com
ADMIN_PASSWORD=1488675242
NODE_ENV=production
```

8. После деплоя открыть:

```text
https://твой-домен/
https://твой-домен/admin/
```

## Локальная проверка перед загрузкой

```bash
npm start
```

```text
http://localhost:3000
http://localhost:3000/admin/
```

# Runtime database
# data/db.json is created automatically by server.js on first start.
