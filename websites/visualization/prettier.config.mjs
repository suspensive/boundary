import rootConfig from "../../prettier.config.mjs";

/** @type {import("prettier").Config} */
export default {
  ...rootConfig,
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.js",
};
