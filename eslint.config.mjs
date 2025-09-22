// eslint.config.js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "no-unused-vars": "warn",              
      "@typescript-eslint/no-unused-vars": ["warn"], 
      "react-hooks/exhaustive-deps": "off", 
      "react/no-unescaped-entities": "off", 
    },
  },
];
