# Как открыть DUT SaaS для всех

## Почему GitHub Pages показывает 404

GitHub Pages — это хостинг статических файлов: HTML, CSS и JavaScript. DUT SaaS — это full-stack проект: `server.js`, API, регистрация, cookie-сессии, JSON-база и скрытая админка `/admin/`. Поэтому GitHub Pages не сможет запустить сайт как локально.

Правильная схема:

```text
GitHub = хранит код
Render / Railway / Fly.io = запускает Node.js backend и делает сайт доступным всем
```

## Важно про структуру репозитория

В GitHub нужно загрузить содержимое архива в корень репозитория. В корне должны лежать:

```text
package.json
server.js
render.yaml
public/
data/
```

Неправильно, если в репозитории лежит только одна папка `dut_saas_v29_public_deploy`, а уже внутри неё все файлы. Тогда GitHub Pages/Render смотрят не туда.

## Быстрый деплой на Render

1. Создай репозиторий на GitHub.
2. Загрузи в него все файлы из этого архива именно в корень репозитория.
3. Открой Render.
4. Нажми `New +` → `Web Service`.
5. Подключи GitHub-репозиторий.
6. Укажи настройки:

```text
Runtime / Language: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /healthz
```

7. Environment Variables:

```text
NODE_ENV=production
COOKIE_SECRET=любая_длинная_случайная_строка
ADMIN_EMAIL=yurapon11972020@gmail.com
ADMIN_PASSWORD=1488675242
```

8. Нажми `Deploy Web Service`.
9. После сборки Render выдаст публичный адрес вида:

```text
https://dut-saas.onrender.com
```

Обычный сайт:

```text
https://dut-saas.onrender.com/
```

Скрытая админка:

```text
https://dut-saas.onrender.com/admin/
```

## Данные для входа в админку

```text
Email: yurapon11972020@gmail.com
Password: 1488675242
```

## Почему не надо сдавать ссылку GitHub Pages

Ссылка GitHub Pages подходит только для статической страницы. В этом проекте преподавателю лучше давать две ссылки:

```text
GitHub: ссылка на репозиторий с кодом
Рабочий сайт: ссылка Render / Railway / Fly.io
```

Так будет видно и код, и реально работающий backend.

## Важное ограничение бесплатного Render

На бесплатном Web Service локальные файлы могут сбрасываться после перезапуска или redeploy. Для учебной демонстрации этого обычно достаточно. Для настоящего коммерческого проекта нужно подключить базу данных или persistent disk.

Сервер уже поддерживает переменную `DATA_DIR`, поэтому при подключении диска можно указать, например:

```text
DATA_DIR=/var/data
```

Тогда `db.json` будет создаваться внутри этого каталога.
