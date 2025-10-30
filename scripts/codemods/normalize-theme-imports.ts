#!/usr/bin/env ts-node
import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({ tsConfigFilePath: 'tsconfig.json' });
const files = project.getSourceFiles('apps/mobile/src/**/*.{ts,tsx}');

let updated = 0;

for (const sf of files) {
  let changed = false;

  const providerValue = new Map<string, string | undefined>(); // key -> alias
  const providerTypes = new Map<string, string | undefined>();
  let providerDefault: string | undefined;

  const unifiedValue = new Map<string, string | undefined>();
  const unifiedTypes = new Map<string, string | undefined>();
  let unifiedDefault: string | undefined;

  const removeImports: ReturnType<typeof sf.getImportDeclarations> = [];

  for (const imp of sf.getImportDeclarations()) {
    const spec = imp.getModuleSpecifierValue();
    const isProvider = /(?:^|\/)theme\/Provider$/.test(spec);
    const isUnified = /(?:^|\/)theme\/unified-theme$/.test(spec);
    const isTypes = /(?:^|\/)theme\/types$/.test(spec);

    if (!isProvider && !isUnified && !isTypes) {
      continue;
    }

    const target = isProvider ? 'provider' : isUnified ? 'unified' : 'types';
    const defaultImport = imp.getDefaultImport()?.getText();
    if (defaultImport) {
      if (target === 'provider') {
        providerDefault = defaultImport;
      } else if (target === 'unified') {
        unifiedDefault = defaultImport;
      }
    }

    const namedImports = imp.getNamedImports();
    const pushNamed = (
      map: Map<string, string | undefined>,
      name: string,
      alias?: string,
    ) => {
      if (map.has(name)) {
        // If alias already stored, keep existing (prefer explicit alias)
        if (!map.get(name) && alias) {
          map.set(name, alias);
        }
      } else {
        map.set(name, alias);
      }
    };

    for (const specifier of namedImports) {
      const name = specifier.getName();
      const alias = specifier.getAliasNode()?.getText();
      const isTypeOnly = specifier.isTypeOnly() || imp.isTypeOnly();

      if (target === 'provider') {
        if (name === 'Theme' && !isTypeOnly) {
          changed = true;
          continue;
        }
        if (isTypeOnly) {
          pushNamed(providerTypes, name, alias);
        } else {
          pushNamed(providerValue, name, alias);
        }
      } else if (target === 'unified') {
        if (name === 'useTheme' && !isTypeOnly) {
          pushNamed(providerValue, name, alias);
          changed = true;
          continue;
        }
        if (name === 'Theme' && !isTypeOnly) {
          changed = true;
          continue;
        }
        if (isTypeOnly) {
          pushNamed(unifiedTypes, name, alias);
        } else {
          pushNamed(unifiedValue, name, alias);
        }
      } else {
        // types module
        if (name === 'AppTheme') {
          pushNamed(providerTypes, name, alias);
          changed = true;
          continue;
        }
        pushNamed(providerTypes, name, alias);
      }
    }

    removeImports.push(imp);
  }

  // Determine if AppTheme is used but not yet imported
  const fileText = sf.getFullText();
  if (fileText.includes('AppTheme')) {
    if (!providerTypes.has('AppTheme')) {
      providerTypes.set('AppTheme', undefined);
      changed = true;
    }
  }

  if (removeImports.length === 0 && !changed) {
    continue;
  }

  if (removeImports.length > 0) {
    changed = true;
    for (const imp of removeImports) {
      imp.remove();
    }
  }

  const addImport = (
    moduleSpecifier: string,
    valueMap: Map<string, string | undefined>,
    typeMap: Map<string, string | undefined>,
    defaultImport?: string,
  ) => {
    const valueEntries = Array.from(valueMap.entries())
      .filter(([name]) => name && name.trim().length > 0);
    const typeEntries = Array.from(typeMap.entries())
      .filter(([name]) => name && name.trim().length > 0);

    if (!defaultImport && valueEntries.length === 0 && typeEntries.length === 0) {
      return;
    }

    const namedValue = valueEntries.map(([name, alias]) => (
      alias ? { name, alias } : { name }
    ));
    const namedType = typeEntries.map(([name, alias]) => (
      alias ? { name, alias } : { name }
    ));

    if (defaultImport || namedValue.length > 0) {
      sf.addImportDeclaration({
        moduleSpecifier,
        defaultImport,
        namedImports: namedValue,
      });
    }

    if (namedType.length > 0) {
      sf.addImportDeclaration({
        moduleSpecifier,
        namedImports: namedType,
        isTypeOnly: true,
      });
    }
  };

  addImport('@/theme/Provider', providerValue, providerTypes, providerDefault);
  addImport('@/theme/unified-theme', unifiedValue, unifiedTypes, unifiedDefault);

  if (changed) {
    updated++;
  }
}

if (updated > 0) {
  project.saveSync();
}

console.log(`[codemod:normalize-theme-imports] Updated files: ${updated}`);
