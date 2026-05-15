# DUT SaaS

DUT SaaS — учебный коммерческий full-stack проект: SaaS-доска задач с регистрацией, тарифами Free / Pro / Max, настройками UI, Liquid Glass стилем, языками, палитрами задач и скрытой админкой.

## Локальный запуск

```bash
npm start
```

Открыть:

```text
http://localhost:3000
```

Админка:

```text
http://localhost:3000/admin/
```

## Админ-доступ

```text
Email: yurapon11972020@gmail.com
Password: 1488675242
```

## Публичный деплой

GitHub Pages не подходит для полной версии, потому что проект использует Node.js backend. Для публикации используй Render / Railway / Fly.io.

Подробная инструкция лежит в файле:

```text
README_PUBLIC_DEPLOY.md
```

## Структура

```text
public/                  frontend
public/admin/            скрытая админ-панель
data/db.json             локальная JSON-база, создаётся автоматически
server.js                backend/API/static server
render.yaml              Render Blueprint
Procfile                 запуск на Node-хостингах
.github/workflows/ci.yml проверка синтаксиса
```

## Проверка

```bash
node --check server.js
node --check public/app.js
node --check public/admin/admin.js
npm start
```

После запуска проверь:

```text
/
/admin/
/healthz
```
