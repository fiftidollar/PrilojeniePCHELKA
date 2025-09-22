# TikTok OAuth App

Next.js приложение для аутентификации через TikTok API.

## Настройка для деплоя на Vercel

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения в Vercel

Добавьте следующие переменные в настройках проекта Vercel:

#### Production Environment Variables:
- `TIKTOK_CLIENT_KEY` - ваш Client Key из TikTok Developer Portal
- `TIKTOK_CLIENT_SECRET` - ваш Client Secret из TikTok Developer Portal  
- `TIKTOK_REDIRECT_URI` - URL вашего приложения на Vercel (например: `https://your-app.vercel.app/`)
- `NEXT_PUBLIC_TIKTOK_CLIENT_KEY` - тот же Client Key (для публичного доступа)
- `NEXT_PUBLIC_TIKTOK_REDIRECT_URI` - тот же Redirect URI (для публичного доступа)

### 3. Настройка TikTok Developer App

В TikTok Developer Portal:
1. Создайте новое приложение
2. Добавьте ваш Vercel URL в список разрешенных redirect URIs
3. Скопируйте Client Key и Client Secret

### 4. Деплой

Проект готов к автоматическому деплою на Vercel через GitHub integration.

## Структура проекта

- `app/page.js` - главная страница с кнопкой входа
- `app/api/tiktok/callback/route.js` - API endpoint для обработки OAuth callback
- `app/layout.js` - корневой layout с подключением стилей
- `next.config.js` - конфигурация Next.js
- `tailwind.config.js` - конфигурация Tailwind CSS

## Локальная разработка

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) для просмотра.
