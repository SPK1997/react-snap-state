import path from "path";

const common = {
  mode: "production",
  entry: path.resolve("./index.ts"),
  resolve: { extensions: [".tsx", ".ts", ".jsx", ".js"] },
  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", { modules: false }], // keep ES modules for webpack
              ["@babel/preset-react", { runtime: "automatic" }],
              "@babel/preset-typescript"
            ]
          }
        }
      }
    ]
  }
};

/**
 * ESM build — for modern bundlers / consumers
 * - target includes ES2020 so webpack knows ESM syntax is allowed
 * - output.environment.module: true tells webpack output may contain import/export
 */
const esmConfig = {
  ...common,
  target: ["web", "es2020"],
  output: {
    path: path.resolve("dist"),
    filename: "main.bundle.mjs",
    library: { type: "module" },
    environment: { module: true }
  },
  experiments: { outputModule: true },
  externalsType: "module",
  externals: [
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react/jsx-dev-runtime"
  ]
};

/**
 * CJS build — for Node/older bundlers
 */
const cjsConfig = {
  ...common,
  target: ["web", "es5"],
  output: {
    path: path.resolve("dist"),
    filename: "main.bundle.cjs",
    library: { type: "commonjs2" }
  },
  externalsType: "commonjs2",
  externals: {
    react: "react",
    "react-dom": "react-dom",
    "react/jsx-runtime": "react/jsx-runtime",
    "react/jsx-dev-runtime": "react/jsx-dev-runtime"
  }
};

export default [esmConfig, cjsConfig];
