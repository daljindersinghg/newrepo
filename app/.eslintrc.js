// .eslintrc.js
module.exports = {
    root: true,
    extends: [
      "next/core-web-vitals", 
      "plugin:@typescript-eslint/recommended"
    ],
    plugins: ["@typescript-eslint", "react-hooks"],
    rules: {
      // allow `any` where you really need it
      "@typescript-eslint/no-explicit-any": "off",
  
      // warn (instead of error) on unused vars, and ignore args named _
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
  
      // prefer ts-expect-error over ts-ignore
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "allow-with-description",
          "minimumDescriptionLength": 3
        }
      ],
  
      // React/JSX
      "react/no-unescaped-entities": "off",
      "react-hooks/exhaustive-deps": "warn",
  
      // Next.js image rule (only if you’re using <img> intentionally)
      "@next/next/no-img-element": "off"
    },
    settings: {
      react: { version: "detect" }
    },
    overrides: [
      {
        files: ["**/*.ts", "**/*.tsx"],
        parser: "@typescript-eslint/parser",
      },
    ],
  };
  