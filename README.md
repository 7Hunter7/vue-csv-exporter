# vue-csv-exporter

[![npm version](https://img.shields.io/npm/v/vue-csv-exporter.svg)](https://www.npmjs.com/package/vue-csv-exporter)
[![license](https://img.shields.io/npm/l/vue-csv-exporter.svg)](https://github.com/7Hunter7/vue-csv-exporter/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/vue-csv-exporter.svg)](https://www.npmjs.com/package/vue-csv-exporter)
[![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)
[![vue3](https://img.shields.io/badge/vue-3.x-brightgreen.svg)](https://v3.vuejs.org/)

Простой и мощный экспорт данных в CSV для Vue.js приложений. 
**Без зависимостей**, с поддержкой кириллицы и TypeScript.

## ✨ Особенности

- 🚀 **Zero dependencies** - никаких лишних библиотек
- 📦 **Tree shaking** - используйте только то, что нужно
- 🌍 **Кириллица** - корректное отображение в Excel
- 🎯 **RFC 4180** - соответствие стандарту CSV
- 🔧 **Гибкая настройка** - разделители, кавычки, BOM
- 📱 **Браузер** - работает в любой современном браузере
- 🎨 **Vue 2 и 3** - поддержка обеих версий
- 📄 **TypeScript** - готовые типы

## Структура файлов
```bash
vue-csv-exporter/
├── src/
│   ├── index.js          # главный файл
│   ├── CSVGenerator.js   # ядро
│   └── exportMixin.js    # миксин
├── README.md
├── LICENSE
└── package.json
```

## 📦 Установка

```bash
npm install vue-csv-exporter
# или
yarn add vue-csv-exporter
```

## 🚀 Быстрый старт
1. Как плагин (рекомендуется)
```bash
// main.js
import Vue from 'vue';
import VueCSVExporter from 'vue-csv-exporter';

Vue.use(VueCSVExporter, {
  defaultFilename: 'export.csv',
  defaultConfig: {
    delimiter: ';',
    includeBOM: true
  }
});

// В компоненте
export default {
  methods: {
    async exportData() {
      try {
        const count = await this.$csvExport({
          data: this.items,
          filename: 'users.csv',
          onStart: () => console.log('Экспорт начат'),
          onProgress: (progress) => console.log(`Прогресс: ${progress}%`),
          onSuccess: (count) => this.$notify.success(`Экспортировано ${count} записей`),
          onError: (error) => this.$notify.error(error.message)
        });
      } catch (error) {
        console.error('Ошибка экспорта:', error);
      }
    }
  }
};
```
### Как миксин
```bash
import { exportMixin } from 'vue-csv-exporter';

export default {
  mixins: [exportMixin],
  data() {
    return {
      users: [
        { name: 'Иван', email: 'ivan@example.com' },
        { name: 'Мария', email: 'maria@example.com' }
      ]
    };
  },
  methods: {
    async exportUsers() {
      await this.exportToCSV({
        data: this.users,
        filename: 'users.csv',
        config: { delimiter: ',' }
      });
    }
  }
};
```

### Как отдельный класс
```bash
import { CSVGenerator } from 'vue-csv-exporter';

// Генерация CSV
const data = [
  { name: 'Иван', age: 30 },
  { name: 'Мария', age: 25 }
];

const csv = CSVGenerator.generate(data, {
  delimiter: ';',
  includeBOM: true
});

// Скачивание
CSVGenerator.download(csv, 'export.csv');

// Валидация
const validation = CSVGenerator.validateData(data);
if (validation.isValid) {
  console.log('Данные корректны');
}
```

## 📊 API Reference

### Плагин Vue

#### Опции плагина

| Параметр | Тип | По умолчанию | Обязательный | Описание |
|----------|-----|--------------|---------------|----------|
| `defaultFilename` | `string` | `'export.csv'` | Нет | Имя файла по умолчанию для экспорта |
| `defaultConfig` | `Object` | `{}` | Нет | Конфигурация CSV по умолчанию (см. таблицу Конфигурация) |
| `install` | `Function` | - | Нет | Функция установки плагина (вызывается автоматически) |

#### Методы плагина (`this.$csvExport()`)

| Параметр | Тип | По умолчанию | Обязательный | Описание |
|----------|-----|--------------|---------------|----------|
| `data` | `Array<Object>` | - | **Да** | Массив данных для экспорта |
| `filename` | `string` | `'export.csv'` | Нет | Имя выходного CSV файла |
| `config` | `Object` | `{}` | Нет | Конфигурация CSV (переопределяет defaultConfig) |
| `onStart` | `Function` | `() => {}` | Нет | Колбэк перед началом экспорта |
| `onProgress` | `Function` | `() => {}` | Нет | Колбэк прогресса (0-100) |
| `onSuccess` | `Function` | `() => {}` | Нет | Колбэк при успешном экспорте |
| `onError` | `Function` | `() => {}` | Нет | Колбэк при ошибке |

**Возвращает:** `Promise<number>` - количество экспортированных записей

**Пример:**
```javascript
const count = await this.$csvExport({
  data: this.users,
  filename: 'users.csv',
  config: { delimiter: ',' },
  onStart: () => this.loading = true,
  onProgress: (p) => this.progress = p,
  onSuccess: (count) => this.showSuccess(count),
  onError: (error) => this.showError(error)
});
```

---

### Миксин `exportMixin`

#### Данные миксина

| Поле | Тип | По умолчанию | Доступ | Описание |
|------|-----|--------------|---------|----------|
| `isExporting` | `boolean` | `false` | Только чтение | Флаг процесса экспорта |
| `exportProgress` | `number` | `0` | Только чтение | Прогресс экспорта (0-100) |

#### Методы миксина

| Метод | Параметры | Возвращает | Описание |
|-------|-----------|------------|----------|
| `exportToCSV(options)` | `Object` (см. таблицу методов плагина) | `Promise<number>` | Основной метод экспорта |
| `prepareExportData(data)` | `data: Array` | `Array` | Подготовка данных (можно переопределить) |
| `transformData(data)` | `data: Array` | `Array` | Трансформация данных (можно переопределить) |
| `generateDefaultFilename()` | - | `string` | Генерация имени файла по умолчанию |

**Пример:**
```javascript
import { exportMixin } from 'vue-csv-exporter';

export default {
  mixins: [exportMixin],
  data() {
    return {
      items: []
    };
  },
  methods: {
    async handleExport() {
      if (this.isExporting) return;
      
      await this.exportToCSV({
        data: this.items,
        filename: 'export.csv'
      });
    },
    // Переопределение метода подготовки данных
    prepareExportData(data) {
      return data.filter(item => item.active);
    }
  }
};
```

---

### Класс `CSVGenerator`

#### Статические методы

| Метод | Параметры | Возвращает | Описание |
|-------|-----------|------------|----------|
| `generate(data, config)` | `data: Array<Object>`<br>`config: Object` | `string` | Генерация CSV строки из данных |
| `download(csv, filename)` | `csv: string`<br>`filename: string` | `void` | Скачивание CSV файла |
| `validateData(data)` | `data: Array` | `{ isValid: boolean, error: string }` | Валидация данных перед экспортом |
| `sanitizeField(field)` | `field: any` | `string` | Очистка поля от опасных символов |
| `formatRow(fields, config)` | `fields: Array`<br>`config: Object` | `string` | Форматирование строки (приватный) |
| `formatField(field, config)` | `field: any`<br>`config: Object` | `string` | Форматирование поля (приватный) |

**Пример:**
```javascript
import { CSVGenerator } from 'vue-csv-exporter';

// Валидация
const validation = CSVGenerator.validateData(myData);
if (!validation.isValid) {
  console.error(validation.error);
  return;
}

// Генерация
const csv = CSVGenerator.generate(myData, {
  delimiter: ';',
  includeBOM: true
});

// Скачивание
CSVGenerator.download(csv, 'report.csv');

// Очистка поля
const safeString = CSVGenerator.sanitizeField("Hello;World");
```

---

### Конфигурация CSV

#### Параметры конфигурации

| Параметр | Тип | По умолчанию | Допустимые значения | Описание |
|----------|-----|--------------|---------------------|----------|
| `delimiter` | `string` | `';'` | `','`, `';'`, `'\t'`, любой символ | Разделитель полей в CSV |
| `quote` | `string` | `'"'` | `'"'`, `"'"` | Символ для экранирования полей |
| `lineBreak` | `string` | `'\r\n'` | `'\r\n'`, `'\n'`, `'\r'` | Разделитель строк |
| `includeBOM` | `boolean` | `true` | `true`, `false` | Добавлять BOM для кириллицы |
| `quoteAll` | `boolean` | `false` | `true`, `false` | Всегда заключать поля в кавычки |
| `escapeDoubleQuotes` | `boolean` | `true` | `true`, `false` | Экранировать кавычки удвоением |

#### Примеры конфигурации

| Сценарий | Конфигурация | Результат |
|----------|--------------|-----------|
| **Excel (Россия)** | `{ delimiter: ';', includeBOM: true }` | Корректное отображение кириллицы в Excel |
| **Excel (Запад)** | `{ delimiter: ',', includeBOM: false }` | Стандартный CSV для западных версий Excel |
| **Максимальная совместимость** | `{ quoteAll: true, delimiter: ',' }` | Все поля в кавычках, никаких проблем с спецсимволами |
| **Google Sheets** | `{ delimiter: ',', lineBreak: '\n' }` | Оптимально для импорта в Google Sheets |
| **Базы данных** | `{ delimiter: '\t', quoteAll: false }` | TSV формат для импорта в БД |

```javascript
// Примеры использования разных конфигураций
const configs = {
  // Для Excel (русский)
  russianExcel: {
    delimiter: ';',
    includeBOM: true,
    quoteAll: false
  },
  
  // Для Google Sheets
  googleSheets: {
    delimiter: ',',
    lineBreak: '\n',
    includeBOM: false
  },
  
  // Максимальная защита
  safe: {
    delimiter: ',',
    quoteAll: true,
    escapeDoubleQuotes: true
  },
  
  // TSV формат
  tsv: {
    delimiter: '\t',
    quoteAll: false
  }
};
```

---

### События и колбэки

| Колбэк | Параметры | Момент вызова | Использование |
|--------|-----------|---------------|---------------|
| `onStart` | - | Перед началом экспорта | Показать лоадер, заблокировать UI |
| `onProgress` | `progress: number` (0-100) | Во время экспорта | Обновить индикатор прогресса |
| `onSuccess` | `count: number` | После успешного экспорта | Показать уведомление об успехе |
| `onError` | `error: Error` | При ошибке | Показать сообщение об ошибке |

```javascript
// Пример с использованием всех колбэков
this.$csvExport({
  data: this.largeDataset,
  filename: 'big_export.csv',
  
  onStart: () => {
    this.isExporting = true;
    this.showProgressBar = true;
  },
  
  onProgress: (progress) => {
    this.exportProgress = progress;
  },
  
  onSuccess: (count) => {
    this.$notify.success(`Успешно экспортировано ${count} записей`);
    this.isExporting = false;
    this.showProgressBar = false;
  },
  
  onError: (error) => {
    this.$notify.error(`Ошибка экспорта: ${error.message}`);
    this.isExporting = false;
    this.showProgressBar = false;
  }
});
```

---

### Типы данных

| Тип | Описание | Пример |
|-----|----------|--------|
| `CSVConfig` | Объект конфигурации | `{ delimiter: ';', includeBOM: true }` |
| `ValidationResult` | Результат валидации | `{ isValid: true, error: '' }` |
| `ExportOptions` | Опции экспорта | `{ data: [], filename: 'file.csv' }` |
| `ProgressCallback` | Колбэк прогресса | `(progress) => console.log(progress)` |
| `SuccessCallback` | Колбэк успеха | `(count) => console.log(count)` |
| `ErrorCallback` | Колбэк ошибки | `(error) => console.error(error)` |

```typescript
// TypeScript интерфейсы (для справки)
interface CSVConfig {
  delimiter?: string;
  quote?: string;
  lineBreak?: string;
  includeBOM?: boolean;
  quoteAll?: boolean;
  escapeDoubleQuotes?: boolean;
}

interface ExportOptions {
  data: Record<string, any>[];
  filename?: string;
  config?: CSVConfig;
  onStart?: () => void;
  onProgress?: (progress: number) => void;
  onSuccess?: (count: number) => void;
  onError?: (error: Error) => void;
}

interface ValidationResult {
  isValid: boolean;
  error: string;
}
```
## 📄 Лицензия

MIT © [Ivan Kalugin](https://github.com/7Hunter7)