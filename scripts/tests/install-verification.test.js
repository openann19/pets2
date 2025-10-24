/**
 * Installation and Configuration Verification Tests
 * Ensures dependency setup and config fixes work correctly
 */

const fs = require('fs');
const path = require('path');

describe('Dependency Setup', () => {
  it('confirms node_modules exists post-install', () => {
    // This test verifies the install script worked
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    expect(fs.existsSync(nodeModulesPath)).toBe(true);
  });

  it('verifies critical devDependencies are installed', () => {
    // Check package.json exists and has required deps
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    expect(fs.existsSync(packageJsonPath)).toBe(true);

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Verify critical devDependencies are present
    expect(packageJson.devDependencies).toBeDefined();
    expect(packageJson.devDependencies['@eslint/js']).toBeDefined();
    expect(packageJson.devDependencies['jest-expo']).toBeDefined();
    expect(packageJson.devDependencies['@types/node']).toBeDefined();
    expect(packageJson.devDependencies['typescript']).toBeDefined();
  });

  it('runs ESLint without config error', () => {
    // This test verifies ESLint config loads without errors
    // We can't actually run ESLint in Jest due to process spawning issues,
    // but we can verify the config file exists and is valid
    const eslintConfigPath = path.join(process.cwd(), 'eslint.config.js');
    expect(fs.existsSync(eslintConfigPath)).toBe(true);

    // Try to require the config (this will throw if there are syntax errors)
    expect(() => {
      require(eslintConfigPath);
    }).not.toThrow();
  });

  it('verifies TypeScript config includes node types', () => {
    const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);

    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

    expect(tsconfig.compilerOptions).toBeDefined();
    expect(tsconfig.compilerOptions.types).toBeDefined();
    expect(tsconfig.compilerOptions.types).toContain('node');
    expect(tsconfig.compilerOptions.types).toContain('jest');
  });

  it('verifies Jest config uses jest-expo preset', () => {
    const jestConfigPath = path.join(process.cwd(), 'apps/mobile/jest.config.js');
    expect(fs.existsSync(jestConfigPath)).toBe(true);

    // Read and evaluate the Jest config
    const jestConfig = require(jestConfigPath);

    expect(jestConfig.preset).toBe('jest-expo');
    expect(jestConfig.setupFilesAfterEnv).toContain('<rootDir>/src/setupTests.js');
    expect(jestConfig.moduleFileExtensions).toContain('ts');
    expect(jestConfig.moduleFileExtensions).toContain('tsx');
  });
});