# GREEN-API MAX Web Client

Упрощённый веб-клиент для отправки и получения сообщений на базе [GREEN-API](https://green-api.com).

- **Архитектура:** FSD-lite (`app`, `pages`, `widgets`, `features`, `entities`, `shared`)
- **Стейт:** Redux Toolkit
- **Входящие сообщения:** long polling (`ReceiveNotification` / `DeleteNotification`) с отменой через `AbortController`

## Локальный запуск

1. Клонировать репозиторий: `git clone <ссылка>`
2. Установить зависимости: `npm install`
3. Запустить dev-сервер: `npm run dev`
4. Открыть в браузере адрес из вывода Vite (по умолчанию `http://localhost:5173`)

На экране подключения укажите `idInstance` и `apiTokenInstance` инстанса. Данные сохраняются только в `localStorage` браузера.

## Сборка и проверка

```bash
npm run build
npm run preview
npm run lint
```

## Деплой

Проект настроен под SPA на Vercel (`vercel.json`: rewrite на `index.html`). После деплоя при смене бандла при необходимости сбросьте кэш CDN.
