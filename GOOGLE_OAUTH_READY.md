# ✅ Google OAuth настроен!

## Что было сделано:

1. **Исправлена конфигурация NextAuth** - убраны хардкод значения, добавлены проверки переменных окружения
2. **Включен SessionProvider** - создан AuthProvider компонент и подключен к layout.tsx
3. **Созданы страницы аутентификации** - `/auth/signin` и `/auth/signup`
4. **Добавлена тестовая страница** - `/test-auth` для проверки работы аутентификации
5. **Создана подробная инструкция** - `GOOGLE_OAUTH_SETUP.md`

## Для завершения настройки:

1. **Создайте файл `.env`** в корне проекта со следующим содержимым:
```env
# Google OAuth
GOOGLE_CLIENT_ID=ваш_client_id_здесь
GOOGLE_CLIENT_SECRET=ваш_client_secret_здесь

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=сгенерируйте_случайную_строку_здесь

# Database
DATABASE_URL="file:./dev.db"

# Google Gemini API Key (для анализа изображений)
GOOGLE_API_KEY=ваш_gemini_api_key_здесь
```

2. **Получите Google OAuth credentials**:
   - Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
   - Создайте проект и включите Google+ API
   - Настройте OAuth consent screen
   - Создайте OAuth 2.0 Client ID
   - Добавьте redirect URI: `http://localhost:3000/api/auth/callback/google`

3. **Сгенерируйте NEXTAUTH_SECRET**:
```bash
# Для Windows:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Или используйте готовый:
1X3yHls0mYMfMS+w836KnzqnyuAQoHZve5Bj3o1wnsM=
```

## Тестирование:

1. Запустите приложение: `npm run dev`
2. Откройте http://localhost:3000
3. Нажмите "Тест Auth" для проверки аутентификации
4. Или используйте кнопку "Войти через Google" на главной странице

## Доступные страницы:

- `/` - главная страница
- `/auth/signin` - страница входа
- `/auth/signup` - страница регистрации  
- `/test-auth` - тестовая страница аутентификации

Все готово для работы с Google OAuth! 🎉
