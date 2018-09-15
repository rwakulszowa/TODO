import node from "rollup-plugin-node-resolve";

export default {
  entry: "index.js",
  format: "umd",
  moduleName: "splendid",
  plugins: [node()],
  dest: "build/splendid.js"
};

