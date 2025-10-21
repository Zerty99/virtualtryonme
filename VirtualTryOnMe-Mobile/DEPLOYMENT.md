# Инструкции по развертыванию VirtualTryOnMe Android App

## 🚀 Быстрый старт

### 1. Подготовка окружения

```bash
# Установка Node.js (если не установлен)
# Скачайте с https://nodejs.org/

# Установка Expo CLI
npm install -g @expo/cli

# Установка EAS CLI для сборки
npm install -g @expo/eas-cli
```

### 2. Настройка проекта

```bash
cd VirtualTryOnMe-Mobile

# Установка зависимостей
npm install

# Проверка конфигурации
npx expo doctor
```

### 3. Конфигурация API

Отредактируйте `app.json`:

```json
{
  "extra": {
    "apiBase": "https://your-production-api.com"
  }
}
```

### 4. Тестирование

```bash
# Запуск в режиме разработки
npx expo start

# Тестирование на устройстве
# Сканируйте QR код в Expo Go приложении
```

## 📱 Сборка APK

### Локальная сборка (рекомендуется для тестирования)

```bash
# Сборка APK для тестирования
npm run android:apk

# APK будет создан в папке builds/
```

### Облачная сборка через EAS

```bash
# Логин в Expo аккаунт
eas login

# Настройка проекта (первый раз)
eas build:configure

# Сборка для Android
eas build --platform android --profile preview
```

### Производственная сборка

```bash
# Сборка production версии
eas build --platform android --profile production
```

## 🔧 Настройка EAS Build

### Файл eas.json

```json
{
  "cli": {
    "version": ">= 11.0.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_BASE": "https://your-api.com"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "env": {
        "EXPO_PUBLIC_API_BASE": "https://your-production-api.com"
      }
    }
  }
}
```

## 📋 Чеклист перед релизом

### ✅ Функциональность
- [ ] Все основные функции работают
- [ ] API endpoint настроен корректно
- [ ] Обработка ошибок работает
- [ ] Валидация входных данных
- [ ] История образов сохраняется

### ✅ UI/UX
- [ ] Интерфейс адаптивен для разных экранов
- [ ] Анимации работают плавно
- [ ] Темная тема корректно отображается
- [ ] Кнопки и элементы интерактивны

### ✅ Производительность
- [ ] Приложение запускается быстро
- [ ] Изображения загружаются корректно
- [ ] Нет утечек памяти
- [ ] Плавная прокрутка

### ✅ Безопасность
- [ ] API ключи не захардкожены
- [ ] Разрешения запрашиваются корректно
- [ ] Данные пользователя защищены

## 🚨 Устранение проблем

### Проблемы сборки

1. **Ошибка "Build failed"**
   ```bash
   # Очистка кэша
   npx expo start --clear
   
   # Переустановка зависимостей
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Проблемы с Android SDK**
   ```bash
   # Установка Android SDK через Android Studio
   # Или через командную строку:
   sdkmanager "platform-tools" "platforms;android-33"
   ```

3. **Ошибки TypeScript**
   ```bash
   # Проверка типов
   npx tsc --noEmit
   
   # Исправление ошибок
   npx expo install --fix
   ```

### Проблемы API

1. **Ошибка подключения**
   - Проверьте URL API в `app.json`
   - Убедитесь, что сервер доступен
   - Проверьте CORS настройки

2. **Таймауты**
   - Увеличьте timeout в коде (сейчас 2 минуты)
   - Проверьте размер отправляемых изображений

## 📊 Мониторинг

### Логирование

Приложение выводит подробные логи:
- Статус подключения к API
- Прогресс обработки изображений
- Ошибки и исключения

### Аналитика

Для добавления аналитики:

```bash
# Установка Expo Analytics
npx expo install expo-analytics-segment
```

## 🔄 Обновления

### Обновление зависимостей

```bash
# Проверка устаревших пакетов
npm outdated

# Обновление Expo SDK
npx expo install --fix

# Обновление всех зависимостей
npm update
```

### Обновление приложения

1. Обновите версию в `app.json`
2. Соберите новую версию
3. Распространите через Google Play или напрямую

## 📱 Распространение

### Google Play Store

1. Создайте App Bundle (AAB):
   ```bash
   eas build --platform android --profile production
   ```

2. Загрузите в Google Play Console
3. Заполните метаданные приложения
4. Пройдите проверку Google

### Прямое распространение

1. Соберите APK:
   ```bash
   eas build --platform android --profile preview
   ```

2. Распространите APK файл напрямую

## 🎯 Оптимизация

### Размер приложения

- Используйте `expo-optimize` для сжатия
- Оптимизируйте изображения
- Удалите неиспользуемые зависимости

### Производительность

- Используйте `React.memo` для компонентов
- Оптимизируйте анимации
- Кэшируйте изображения

---

**Последнее обновление:** $(date)  
**Версия документа:** 1.0.0
