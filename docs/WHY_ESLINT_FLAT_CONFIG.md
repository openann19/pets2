## Why Use ESLint Flat Config?
The new flat config eliminates legacy concepts like "extends" chains and config merging, replacing them with a single JavaScript file (eslint.config.js) that gives you full control over:

```
"extends"
```


```
eslint.config.js
```

- What rules apply to which files
- How parsers and plugins are configured
- Fine-grained control of language options and environments
The following will demonstrate how to use rulesets for Typescript independently of JavaScript and apply plugins and sharable configs.

## Full Example: eslint.config.js
```
eslint.config.js
```


```
import eslint from '@eslint/js'; import tseslint from 'typescript-eslint'; import globals from 'globals'; import prettierRecommended from 'eslint-plugin-prettier/recommended'; export default tseslint.config( { ignores: ['dist/', 'node_modules/', '**/*.d.ts', 'coverage/'], }, prettierRecommended, eslint.configs.recommended, { languageOptions: { globals: { ...globals.browser, }, }, }, { files: ['**/*.ts', '**/*.spec.ts'], extends: [tseslint.configs.recommended], plugins: { '@typescript-eslint': tseslint.plugin }, languageOptions: { parser: tseslint.parser, parserOptions: {}, }, rules: { '@typescript-eslint/no-explicit-any': 'off', }, }, { files: ['**/*.js', '**/*.mjs'], extends: [tseslint.configs.disableTypeChecked], languageOptions: { globals: { SomeGlobalVariable: true, }, }, rules: {}, }, );
```


```
import eslint from '@eslint/js'; import tseslint from 'typescript-eslint'; import globals from 'globals'; import prettierRecommended from 'eslint-plugin-prettier/recommended'; export default tseslint.config( { ignores: ['dist/', 'node_modules/', '**/*.d.ts', 'coverage/'], }, prettierRecommended, eslint.configs.recommended, { languageOptions: { globals: { ...globals.browser, }, }, }, { files: ['**/*.ts', '**/*.spec.ts'], extends: [tseslint.configs.recommended], plugins: { '@typescript-eslint': tseslint.plugin }, languageOptions: { parser: tseslint.parser, parserOptions: {}, }, rules: { '@typescript-eslint/no-explicit-any': 'off', }, }, { files: ['**/*.js', '**/*.mjs'], extends: [tseslint.configs.disableTypeChecked], languageOptions: { globals: { SomeGlobalVariable: true, }, }, rules: {}, }, );
```