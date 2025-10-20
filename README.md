# VirtualTryOnMe

VirtualTryOnMe — платформа виртуальной примерки, которая соединяет технологии и моду. Загрузи фото, примеряй и покупай то, что действительно тебе идёт.

## 🚀 Возможности

- **Загрузка фото пользователя** - для генерации образов
- **Загрузка фото одежды** - из локальных файлов
- **ИИ-генерация** - создание новых образов с помощью ИИ
- **Выбор сцен** - офис, ресторан, улица, дома, пляж, спортзал, вечеринка, свадьба, студия, природа
- **Сохранение результатов** - скачивание сгенерированных образов

## 🛠 Технологии

- **Frontend:** Next.js 14, React, TypeScript
- **UI:** Tailwind CSS, Framer Motion, Lucide React
- **Обработка изображений:** Sharp.js
- **ИИ:** Google Gemini 2.5 Flash Image (основная генерация) / OpenAI DALL-E 3 (fallback) / Unsplash API (fallback)

## 📦 Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd ai-outfit-generator
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env.local` на основе `env.example`:
```bash
cp env.example .env.local
```

4. Добавьте API ключи в `.env.local`:
```env
# Обязательный ключ для анализа изображений:
GOOGLE_API_KEY=your_gemini_api_key_here

# Опциональные ключи для лучшей генерации изображений:
OPENAI_API_KEY=your_openai_api_key_here
REPLICATE_API_TOKEN=your_replicate_token_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

5. Запустите приложение:
```bash
npm run dev
```

## 🔧 Настройка ИИ API

### Google Gemini API (обязательно)
1. Перейдите в [Google AI Studio](https://makersuite.google.com/)
2. Создайте API ключ для Gemini 2.5 Flash Image
3. Добавьте в `.env.local`: `GOOGLE_API_KEY=your_key`

### OpenAI DALL-E API (рекомендуется)
1. Перейдите в [OpenAI Platform](https://platform.openai.com/)
2. Создайте API ключ
3. Добавьте в `.env.local`: `OPENAI_API_KEY=your_key`

### Unsplash API (опционально)
1. Зарегистрируйтесь на [Unsplash Developers](https://unsplash.com/developers)
2. Создайте приложение и получите Access Key
3. Добавьте в `.env.local`: `UNSPLASH_ACCESS_KEY=your_key`

### Replicate API (опционально)
1. Зарегистрируйтесь на [Replicate](https://replicate.com/)
2. Получите API токен
3. Добавьте в `.env.local`: `REPLICATE_API_TOKEN=your_token`

## 📱 Использование

1. **Загрузите фото пользователя** - перетащите или выберите файл
2. **Выберите одежду:**
   - Загрузите фото одежды, или
   - Вставьте ссылку на товар с Zara/H&M
3. **Выберите стиль** (опционально)
4. **Нажмите "Создать образ"**
5. **Скачайте результат**

## 🧠 Как работает ИИ

1. **Обработка изображений** - Sharp.js обрабатывает загруженные фото пользователя и одежды
2. **Генерация с Gemini 2.5 Flash Image** - ИИ создает реалистичное изображение, где загруженный человек носит предоставленную одежду
3. **Сохранение характеристик** - Система сохраняет лицо, телосложение, цвет кожи и другие особенности человека
4. **Fallback опции** - При недоступности Gemini используются альтернативные сервисы:
   - DALL-E 3 (если настроен OPENAI_API_KEY)
   - Unsplash API (если настроен UNSPLASH_ACCESS_KEY)
   - Placeholder с описанием

## 🌐 Поддерживаемые форматы

- **Изображения:** JPG, PNG, WEBP
- **Размер:** до 10MB на файл
- **Количество:** до 3 фото одежды одновременно

## 🚧 Разработка

### Структура проекта
```
app/
├── api/
│   └── generate-outfit/   # ИИ-генерация образов
├── components/            # React компоненты
├── globals.css           # Глобальные стили
├── layout.tsx            # Основной layout
└── page.tsx              # Главная страница
```

### API Endpoints

#### POST `/api/generate-outfit`
Генерирует образ с помощью ИИ.

**Вход:** FormData с файлами и параметрами

**Выход:**
```json
{
  "success": true,
  "imageUrl": "generated_image_url",
  "prompt": "used_prompt"
}
```

## 🔒 Безопасность

- Валидация загружаемых файлов
- Ограничение размера изображений
- Фильтрация URL для парсинга
- Обработка ошибок API

## 📄 Лицензия

## 🚀 Деплой

### Быстрый деплой на Vercel

1. **Установите Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Запустите скрипт деплоя:**
   ```bash
   # Linux/Mac
   ./deploy.sh
   
   # Windows PowerShell
   .\deploy.ps1
   ```

3. **Настройте переменные окружения в панели Vercel:**
   - `GOOGLE_API_KEY` - ваш Google Gemini API ключ
   - `OPENAI_API_KEY` - OpenAI API ключ (опционально)
   - `UNSPLASH_ACCESS_KEY` - Unsplash API ключ (опционально)

### Обычный хостинг

**Подготовка к деплою:**
```bash
# Linux/Mac
./prepare-hosting.sh

# Windows PowerShell
.\prepare-hosting.ps1
```

**Популярные провайдеры:**
- **Shared Hosting:** Hostinger ($2.99/мес), Namecheap ($2.88/мес)
- **VPS:** DigitalOcean ($6/мес), Linode ($5/мес), Vultr ($2.50/мес)

Подробные инструкции в [HOSTING.md](HOSTING.md).

### Другие платформы

Подробные инструкции по деплою на различные платформы смотрите в [DEPLOYMENT.md](DEPLOYMENT.md).

MIT License

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📞 Поддержка

Если у вас есть вопросы или проблемы, создайте Issue в репозитории.
