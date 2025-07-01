import love from 'eslint-config-love'
import prettier from 'eslint-plugin-prettier'

const files = ["src/**/*.ts"]

export default [
  [
    {
      ...love,
      files
    },
  {
    plugins: {
      prettier,
    },

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "complexity": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/init-declarations": "off",
      "curly": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-type-assertion": "off",
      "@typescript-eslint/no-magic-numbers": "off",
      "@typescript-eslint/no-unnecessary-template-expression": "off",
      "@typescript-eslint/prefer-destructuring": "off",
      "@typescript-eslint/no-import-type-side-effects": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "eslint-comments/require-description": "off",
      "logical-assignment-operators": "off",
      "promise/avoid-new": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "guard-for-in": "off",
      "@typescript-eslint/class-methods-use-this": "off",
      "@typescript-eslint/prefer-string-starts-ends-with": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-empty-function": "off",
      "eslint-comments/disable-enable-pair": "off",
      "@typescript-eslint/only-throw-error": "off",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "off",
      "max-nested-callbacks": "off",
      "@typescript-eslint/switch-exhaustiveness-check": "off",
      "arrow-body-style": "off",
      "max-depth": "off",
      "@typescript-eslint/no-loop-func": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "max-lines": "off",
      "@typescript-eslint/no-duplicate-type-constituents": "off",
      "no-constant-binary-expression": "off",
      "@typescript-eslint/no-unnecessary-type-parameters": "off",
      "@typescript-eslint/no-array-delete": "off",
      "@typescript-eslint/prefer-regexp-exec": "off",
      "@typescript-eslint/no-deprecated": "off",
      "@typescript-eslint/non-nullable-type-assertion-style": "off",
      "@typescript-eslint/prefer-promise-reject-errors": 'off',
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/prefer-for-of": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/max-params": "off",
      "prettier/prettier": [
        "warn",
        {
          trailingComma: 'es5',
          tabWidth: 2,
          semi: false,
          singleQuote: true,
          endOfLine: 'auto',
        }
      ],
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/space-before-function-paren": "off",
      "@typescript-eslint/no-dynamic-delete": "off",
      "@typescript-eslint/no-base-to-string": "off",

      "@typescript-eslint/strict-boolean-expressions": ["warn", {
        allowNullableObject: true,
      }],

      eqeqeq: ["warn", "smart"],
      "custom-rules/prevent-deep-links": "error",
      "custom-rules/prevent-shared-without-alias": "error",
      "no-console": ["warn"],
    },
    files
  }
]
];
