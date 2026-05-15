# Админка DUT SaaS

Админка доступна только по ручному адресу:

```text
/admin/
```

Ссылки на неё нет в публичной навигации сайта.

## Доступ

```text
Email: yurapon11972020@gmail.com
Password: 1488675242
```

## Основные функции

- поиск пользователя;
- выдача тарифов Free / Pro / Max;
- деактивация аккаунта;
- активация аккаунта;
- удаление пользователя;
- сброс доски пользователя;
- просмотр обращений;
- закрытие обращений;
- экспорт JSON;
- журнал действий администратора.

## API

```text
POST   /api/admin/login
POST   /api/admin/logout
GET    /api/admin/me
GET    /api/admin/stats
GET    /api/admin/users
GET    /api/admin/users/:id
PATCH  /api/admin/users/:id
DELETE /api/admin/users/:id
POST   /api/admin/users/:id/reset-board
GET    /api/admin/contacts
PATCH  /api/admin/contacts/:id
DELETE /api/admin/contacts/:id
GET    /api/admin/export
```
