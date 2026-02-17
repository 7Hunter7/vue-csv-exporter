import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import vue from "rollup-plugin-vue";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

const packageJson = require("./package.json");

export default [
  // ESM build
  {
    input: "src/index.js",
    output: {
      file: packageJson.module,
      format: "esm",
      sourcemap: true,
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      vue(),
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
        presets: ["@babel/preset-env"],
      }),
    ],
    external: ["vue"],
  },
  // CommonJS build
  {
    input: "src/index.js",
    output: {
      file: packageJson.main,
      format: "cjs",
      sourcemap: true,
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      vue(),
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
        presets: ["@babel/preset-env"],
      }),
    ],
    external: ["vue"],
  },
  // UMD build (for browsers)
  {
    input: "src/index.js",
    output: {
      file: packageJson.browser,
      format: "umd",
      name: "VueCSVExporter",
      sourcemap: true,
      globals: {
        vue: "Vue",
      },
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      vue(),
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
        presets: ["@babel/preset-env"],
      }),
    ],
  },
  // Minified UMD build
  {
    input: "src/index.js",
    output: {
      file: packageJson.unpkg,
      format: "umd",
      name: "VueCSVExporter",
      sourcemap: true,
      globals: {
        vue: "Vue",
      },
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      vue(),
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
        presets: ["@babel/preset-env"],
      }),
      terser(),
    ],
  },
];
