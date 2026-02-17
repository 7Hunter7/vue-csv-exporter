/**
 * vue-csv-exporter
 * Без зависимостей, нативный генератор CSV для браузера
 * Соответствует RFC 4180
 * @module vue-csv-exporter
 */

/**
 * Конфигурация по умолчанию
 * @typedef {Object} CSVConfig
 * @property {string} delimiter - Разделитель полей (по умолчанию ';')
 * @property {string} quote - Символ кавычек (по умолчанию '"')
 * @property {string} lineBreak - Разделитель строк (по умолчанию '\r\n')
 * @property {boolean} includeBOM - Добавлять BOM для кириллицы (по умолчанию true)
 * @property {boolean} quoteAll - Всегда заключать поля в кавычки (по умолчанию false)
 * @property {boolean} escapeDoubleQuotes - Экранировать кавычки удвоением (по умолчанию true)
 */

/**
 * Результат валидации
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Валидны ли данные
 * @property {string} error - Сообщение об ошибке
 */

class CSVGenerator {
  /**
   * Конфигурация по умолчанию
   * @type {CSVConfig}
   */
  static defaultConfig = {
    delimiter: ";",
    quote: '"',
    lineBreak: "\r\n",
    includeBOM: true,
    quoteAll: false,
    escapeDoubleQuotes: true,
  };

  /**
   * Генерация CSV из массива объектов
   * @param {Array<Object>} data - Массив данных для экспорта
   * @param {CSVConfig} config - Конфигурация генерации
   * @returns {string} CSV строка
   * @throws {Error} Если данные некорректны
   *
   * @example
   * const csv = CSVGenerator.generate([
   *   { name: 'Иван', age: 30 },
   *   { name: 'Мария', age: 25 }
   * ]);
   */
  static generate(data, config = {}) {
    const validation = this.validateData(data);
    if (!validation.isValid) {
      throw new Error(`CSV generation failed: ${validation.error}`);
    }

    const cfg = { ...this.defaultConfig, ...config };

    // Получаем заголовки из первого объекта
    const headers = Object.keys(data[0]);

    // Генерируем строки CSV
    const rows = [
      this.formatRow(headers, cfg),
      ...data.map((item) => this.formatRow(Object.values(item), cfg)),
    ];

    let csv = rows.join(cfg.lineBreak);

    // Добавляем BOM для правильного отображения кириллицы в Excel
    if (cfg.includeBOM) {
      csv = "\uFEFF" + csv;
    }

    return csv;
  }

  /**
   * Форматирование одной строки CSV
   * @private
   * @param {Array} fields - Поля строки
   * @param {CSVConfig} cfg - Конфигурация
   * @returns {string} Отформатированная строка
   */
  static formatRow(fields, cfg) {
    return fields
      .map((field) => this.formatField(field, cfg))
      .join(cfg.delimiter);
  }

  /**
   * Форматирование отдельного поля
   * @private
   * @param {*} field - Значение поля
   * @param {CSVConfig} cfg - Конфигурация
   * @returns {string} Отформатированное поле
   */
  static formatField(field, cfg) {
    let stringField =
      field === null || field === undefined ? "" : String(field);

    const needsQuoting =
      cfg.quoteAll ||
      stringField.includes(cfg.delimiter) ||
      stringField.includes(cfg.quote) ||
      stringField.includes("\n") ||
      stringField.includes("\r");

    if (needsQuoting) {
      if (cfg.escapeDoubleQuotes) {
        stringField = stringField.replace(
          new RegExp(cfg.quote, "g"),
          cfg.quote + cfg.quote,
        );
      }
      return cfg.quote + stringField + cfg.quote;
    }

    return stringField;
  }

  /**
   * Очистка поля от потенциально опасных символов
   * @param {*} field - Поле для очистки
   * @returns {string} Очищенное поле
   *
   * @example
   * const safe = CSVGenerator.sanitizeField("Hello;World");
   */
  static sanitizeField(field) {
    if (field === null || field === undefined) return "";

    return String(field)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Валидация данных перед экспортом
   * @param {Array} data - Данные для проверки
   * @returns {ValidationResult} Результат валидации
   *
   * @example
   * const result = CSVGenerator.validateData(myData);
   * if (result.isValid) {
   *   // экспорт
   * }
   */
  static validateData(data) {
    if (!Array.isArray(data)) {
      return {
        isValid: false,
        error: "Data must be an array",
      };
    }

    if (data.length === 0) {
      return {
        isValid: false,
        error: "No data to export",
      };
    }

    const hasInvalidItem = data.some(
      (item) => item === null || typeof item !== "object",
    );

    if (hasInvalidItem) {
      return {
        isValid: false,
        error: "Data contains invalid items",
      };
    }

    return { isValid: true };
  }

  /**
   * Скачивание CSV файла
   * @param {string} csv - CSV контент
   * @param {string} filename - Имя файла
   * @throws {Error} Если нет данных или ошибка скачивания
   *
   * @example
   * CSVGenerator.download(csv, 'export.csv');
   */
  static download(csv, filename) {
    if (!csv) {
      throw new Error("No data to download");
    }

    try {
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.setAttribute("target", "_blank");

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      throw new Error(`Failed to download CSV: ${error.message}`);
    }
  }
}

export default CSVGenerator;
