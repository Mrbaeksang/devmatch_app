import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // any 타입을 에러에서 경고로 변경
      "@typescript-eslint/no-unused-vars": "warn", // 미사용 변수를 에러에서 경고로 변경
      "react-hooks/exhaustive-deps": "warn", // 의존성 배열 경고를 에러에서 경고로 변경
    },
  },
];

export default eslintConfig;
