/**
 * Vue миксин для экспорта данных в CSV
 * @module vue-csv-exporter/mixin
 */

import CSVGenerator from "./CSVGenerator";

/**
 * @mixin exportMixin
 * @property {boolean} isExporting - Флаг процесса экспорта
 * @property {number} exportProgress - Прогресс экспорта (0-100)
 */
export const exportMixin = {
  data() {
    return {
      isExporting: false,
      exportProgress: 0,
    };
  },

  methods: {
    /**
     * Экспорт данных в CSV файл
     * @param {Object} options - Опции экспорта
     * @param {Array} options.data - Данные для экспорта
     * @param {string} options.filename - Имя файла
     * @param {Object} options.config - Конфигурация CSV
     * @param {Function} options.onStart - Колбэк перед началом
     * @param {Function} options.onProgress - Колбэк прогресса
     * @param {Function} options.onSuccess - Колбэк успеха
     * @param {Function} options.onError - Колбэк ошибки
     * @returns {Promise<void>}
     *
     * @example
     * this.exportToCSV({
     *   data: this.items,
     *   filename: 'export.csv',
     *   onSuccess: (count) => console.log(`Exported ${count} items`)
     * });
     */
    async exportToCSV({
      data,
      filename = this.generateDefaultFilename(),
      config = {},
      onStart,
      onProgress,
      onSuccess,
      onError,
    } = {}) {
      if (this.isExporting) {
        this.$notify?.warning?.("Export already in progress", "Please wait");
        return;
      }

      const exportData = this.prepareExportData(data);
      const validation = CSVGenerator.validateData(exportData);

      if (!validation.isValid) {
        const error = new Error(validation.error);
        onError?.(error);
        throw error;
      }

      this.isExporting = true;
      this.exportProgress = 0;

      try {
        onStart?.();

        const transformedData = this.transformData(exportData);
        this.exportProgress = 50;
        onProgress?.(50);

        const csv = CSVGenerator.generate(transformedData, config);
        this.exportProgress = 90;
        onProgress?.(90);

        CSVGenerator.download(csv, filename);
        this.exportProgress = 100;
        onProgress?.(100);

        onSuccess?.(exportData.length);

        return exportData.length;
      } catch (error) {
        onError?.(error);
        throw error;
      } finally {
        setTimeout(() => {
          this.isExporting = false;
          this.exportProgress = 0;
        }, 1000);
      }
    },

    /**
     * Подготовка данных для экспорта
     * @protected
     * @param {Array} data - Исходные данные
     * @returns {Array} Подготовленные данные
     */
    prepareExportData(data) {
      return data?.map?.((item) => ({ ...item })) || [];
    },

    /**
     * Трансформация данных для CSV формата
     * @protected
     * @param {Array} data - Подготовленные данные
     * @returns {Array} Трансформированные данные
     */
    transformData(data) {
      return data.map((item) => {
        const transformed = {};
        Object.keys(item).forEach((key) => {
          transformed[key] = CSVGenerator.sanitizeField(item[key]);
        });
        return transformed;
      });
    },

    /**
     * Генерация имени файла по умолчанию
     * @protected
     * @returns {string} Имя файла
     */
    generateDefaultFilename() {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `export_${year}-${month}-${day}.csv`;
    },
  },
};

export default exportMixin;
