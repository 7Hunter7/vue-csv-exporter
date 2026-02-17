/**
 * vue-csv-exporter
 * Простой и мощный экспорт данных в CSV для Vue.js приложений
 *
 * @module vue-csv-exporter
 */

import CSVGenerator from "./CSVGenerator";
import exportMixin from "./exportMixin";

/**
 * Версия библиотеки
 */
export const VERSION = "1.0.0";

/**
 * Плагин для Vue.js
 * @param {Vue} Vue - Конструктор Vue
 * @param {Object} options - Опции плагина
 *
 * @example
 * import Vue from 'vue';
 * import VueCSVExporter from 'vue-csv-exporter';
 *
 * Vue.use(VueCSVExporter, {
 *   defaultFilename: 'export.csv',
 *   defaultConfig: { delimiter: ';' }
 * });
 */
export function install(Vue, options = {}) {
  if (install.installed) return;
  install.installed = true;

  const globalMixin = {
    data() {
      return {
        $csvExporter: {
          isExporting: false,
          exportProgress: 0,
        },
      };
    },
    methods: {
      $exportToCSV(config) {
        return this.$csvExport(config);
      },
    },
  };

  Vue.mixin(globalMixin);

  Vue.prototype.$csvExport = async function ({
    data,
    filename = options.defaultFilename,
    config = options.defaultConfig,
    ...callbacks
  }) {
    const mixin = new Vue(exportMixin);
    return mixin.exportToCSV({ data, filename, config, ...callbacks });
  };
}

// Автоматическая установка в браузере
if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export { CSVGenerator, exportMixin };

export default {
  install,
  CSVGenerator,
  exportMixin,
  VERSION,
};
