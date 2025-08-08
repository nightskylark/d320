# Новая архитектура проекта d320

## Структура папок

```
src/
├── components/           # Site-wide компоненты
│   ├── ui/              # Переиспользуемые UI компоненты
│   │   ├── ThemeToggle.tsx
│   │   ├── ThemeIcons.tsx
│   │   ├── TagBox.tsx
│   │   ├── FileDropZone.tsx      # Базовый компонент для загрузки файлов
│   │   ├── ImageDropZone.tsx     # Специализированный для изображений
│   │   ├── MarkdownEditor.tsx
│   │   └── AvatarDropZone.tsx    # Специализированный для аватаров
│   ├── layout/          # Layout компоненты (хедер, футер, навигация)
│   │   ├── Header.tsx
│   │   ├── Footer.tsx  
│   │   ├── Auth.tsx
│   │   └── ProfileDialog.tsx
│   └── index.ts         # Barrel exports
│
├── pages/               # Страницы приложения
│   └── eotvEnemies/    # Страница каталога врагов EOTV
│       ├── components/ # Компоненты специфичные для этой страницы
│       │   ├── EnemyCard.tsx
│       │   ├── EnemyList.tsx
│       │   ├── EnemyDetail.tsx
│       │   ├── EnemyFilters.tsx
│       │   ├── AddEnemy.tsx
│       │   ├── EditEnemy.tsx
│       │   ├── EnemyFields.tsx
│       │   ├── DraftSwitch.tsx
│       │   ├── EnemyCard.test.tsx
│       │   └── EnemyList.test.tsx
│       ├── utils/      # Утилиты специфичные для страницы
│       │   ├── printEnemies.ts
│       │   └── syncEnemiesFromJson.ts
│       └── EotvEnemiesPage.tsx
│
├── shared/              # Общий переиспользуемый код
│   ├── components/     # Общие компоненты
│   │   ├── LoginPrompt.tsx
│   │   └── AboutDialog.tsx
│   ├── hooks/          # Общие хуки
│   │   └── useTheme.ts
│   ├── utils/          # Общие утилиты
│   │   ├── fetchUserProfiles.ts
│   │   ├── fetchUserProfiles.test.ts
│   │   ├── uploadFile.ts
│   │   ├── uploadAvatar.ts
│   │   ├── uploadImage.ts
│   │   └── markdown.ts
│   └── index.ts        # Barrel exports
│
├── contexts/           # React контексты
├── types.ts           # TypeScript типы
├── firebase.ts        # Firebase конфигурация
└── App.tsx           # Главный компонент приложения
```

## Принципы организации

### 1. Site-wide компоненты (`/components`)
- **UI компоненты** (`/ui`): Базовые переиспользуемые UI элементы (кнопки, инпуты, переключатели тем)
- **Layout компоненты** (`/layout`): Компоненты макета сайта (хедер, футер, навигация, авторизация)

### 2. Page-specific компоненты (`/pages`)
- Каждая страница имеет свою папку
- Компоненты, специфичные только для конкретной страницы
- Легко масштабируется при добавлении новых страниц

### 3. Shared код (`/shared`)
- Компоненты, хуки и утилиты, которые могут использоваться на разных страницах
- Не привязаны к конкретному функционалу

## Преимущества новой структуры

1. **Масштабируемость**: Легко добавлять новые страницы и функционал
2. **Переиспользование**: Четкое разделение между общим и специфичным кодом
3. **Поддержка**: Проще найти и изменить нужный компонент
4. **Тестирование**: Каждая категория компонентов может тестироваться отдельно
5. **Разработка в команде**: Разные разработчики могут работать над разными частями
