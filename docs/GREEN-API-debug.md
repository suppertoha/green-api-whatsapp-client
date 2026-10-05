# Отладка 401 на DeleteNotification

## Что проверить в DevTools (Network)

1. Упавший **DELETE** → **Headers** → **Request URL**  
   Эталон: `https://api.green-api.com/waInstance{id}/DeleteNotification/{apiToken}/{receiptId}`  
   **receiptId — последний сегмент пути.**

2. **Response** на 401 — текст ошибки GREEN-API (неверный token, receiptId, idInstance).

3. Сравнить `id` и `token` в успешном **GET ReceiveNotification** и в **DELETE** — должны совпадать.

4. На Vercel: в **Sources** имя бандла `index-*.js` должно совпадать с последним `npm run build` (после деплоя с Clear build cache).

## Проверка через curl

```bash
export GREEN_ID=your_instance_id
export GREEN_TOKEN=your_api_token
export RECEIPT_ID=123
chmod +x scripts/verify-delete-notification.sh
./scripts/verify-delete-notification.sh
```

- **200** в curl, **401** в браузере → заголовки SPA, гонка long poll или две вкладки.
- **401** в curl → неверные credentials/receiptId или очередь инстанса.

## Консоль приложения

При ошибках API в консоли: `[GREEN-API DELETE DeleteNotification]` с замаскированным URL и телом ответа.
