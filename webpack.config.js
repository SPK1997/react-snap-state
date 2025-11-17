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
              "@babel/preset-typescript",
            ],
          },
        },
      },
    ],
  },
};

const externals = {
  "react": "react",
  "react-dom": "react-dom",
  "react/jsx-runtime": "react/jsx-runtime",
  "react/jsx-dev-runtime": "react/jsx-dev-runtime",
};

const esmConfig = {
  ...common,
  output: {
    path: path.resolve("dist"),
    filename: "main.bundle.mjs",
    library: { type: "module" }, // emit ESM
  },
  experiments: { outputModule: true }, // required for ESM output
  externals: externals
};

const cjsConfig = {
  ...common,
  output: {
    path: path.resolve("dist"),
    filename: "main.bundle.cjs.js",
    library: { type: "commonjs2" }, // emit CJS
  },
  externals: externals
};

export default [esmConfig, cjsConfig];
