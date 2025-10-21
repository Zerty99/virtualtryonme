# Инструкция по настройке Google OAuth

## Шаги для настройки Google OAuth:

### 1. Создайте проект в Google Cloud Console
1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект или выберите существующий
3. Включите Google+ API

### 2. Настройте OAuth consent screen
1. Перейдите в "APIs & Services" > "OAuth consent screen"
2. Выберите "External" для тестирования
3. Заполните обязательные поля:
   - App name: VirtualTryOnMe
   - User support email: ваш email
   - Developer contact information: ваш email

### 3. Создайте OAuth 2.0 credentials
1. Перейдите в "APIs & Services" > "Credentials"
2. Нажмите "Create Credentials" > "OAuth 2.0 Client IDs"
3. Выберите "Web application"
4. Добавьте authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (для разработки)
   - `https://yourdomain.com/api/auth/callback/google` (для продакшена)

### 4. Создайте файл .env
Создайте файл `.env` в корне проекта со следующим содержимым:

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

### 5. Генерация NEXTAUTH_SECRET
Выполните команду для генерации секрета:

**Для Windows:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Для macOS/Linux:**
```bash
openssl rand -base64 32
```

**Или используйте готовый секрет:**
```
1X3yHls0mYMfMS+w836KnzqnyuAQoHZve5Bj3o1wnsM=
```

### 6. Запуск приложения
```bash
npm run dev
```

### 7. Тестирование
1. Откройте http://localhost:3000
2. Перейдите на страницу входа: http://localhost:3000/auth/signin
3. Нажмите "Войти через Google"
4. Авторизуйтесь через Google
5. Проверьте, что вы перенаправлены на главную страницу

## Возможные проблемы и решения:

### Ошибка "redirect_uri_mismatch"
- Убедитесь, что в Google Cloud Console добавлен правильный redirect URI
- Проверьте, что NEXTAUTH_URL соответствует вашему домену

### Ошибка "invalid_client"
- Проверьте правильность GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET
- Убедитесь, что OAuth consent screen настроен правильно

### Ошибка "access_denied"
- Проверьте настройки OAuth consent screen
- Убедитесь, что приложение опубликовано или добавлены тестовые пользователи
