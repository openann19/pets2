import type { API, FileInfo, JSCodeshift, ImportDeclaration, Identifier } from 'jscodeshift';

const NEXT_HEADERS = 'next/headers';
const WRAPPER = '@/lib/next-async';
const TARGETS = new Set(['cookies', 'headers', 'draftMode']);

function id(name: string, j: JSCodeshift) {
  return j.identifier(name);
}

function ensureImport(j: JSCodeshift, root: ReturnType<JSCodeshift['root']>, source: string, names: string[]) {
  // Find existing import from `source`
  const existing = root.find(j.ImportDeclaration, { source: { value: source } });
  if (existing.size() > 0) {
    const node = existing.get().node as ImportDeclaration;
    const already = new Set(
      (node.specifiers || [])
        .filter(s => s.type === 'ImportSpecifier' && s.imported.type === 'Identifier')
        .map(s => (s.imported as Identifier).name)
    );
    const toAdd = names.filter(n => !already.has(n));
    if (toAdd.length) {
      node.specifiers = [
        ...(node.specifiers || []),
        ...toAdd.map(n => j.importSpecifier(id(n, j)))
      ];
    }
    return;
  }

  // Create new import
  const decl = j.importDeclaration(names.map(n => j.importSpecifier(id(n, j))), j.literal(source));
  const firstImport = root.find(j.ImportDeclaration).at(0);
  if (firstImport.size()) firstImport.insertBefore(decl);
  else root.get().node.program.body.unshift(decl);
}

export default function transform(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let changed = false;

  root.find(j.ImportDeclaration, { source: { value: NEXT_HEADERS } }).forEach(path => {
    const node = path.node as ImportDeclaration;
    if (!node.specifiers || node.specifiers.length === 0) return;

    // Partition specifiers into (targets) and (others)
    const targetSpecs: typeof node.specifiers = [];
    const otherSpecs: typeof node.specifiers = [];

    node.specifiers.forEach(spec => {
      if (spec.type !== 'ImportSpecifier') {
        // Keep default / namespace imports untouched (rare for next/headers)
        otherSpecs.push(spec);
        return;
      }
      const imported = spec.imported;
      const importedName = imported.type === 'Identifier' ? imported.name : null;
      if (importedName && TARGETS.has(importedName)) {
        // Respect local alias: import { cookies as myCookies }
        targetSpecs.push(spec.local && spec.local.name !== importedName
          ? j.importSpecifier(id(importedName, j), id(spec.local.name, j))
          : j.importSpecifier(id(importedName, j)));
      } else {
        otherSpecs.push(spec);
      }
    });

    if (targetSpecs.length === 0) return;

    changed = true;

    // 1) Ensure/merge wrapper import for target names (using *original local* identifiers)
    const namesForWrapper = targetSpecs.map(s => (s.local && s.local.name !== (s.imported as Identifier).name)
      ? (s.local as Identifier).name
      : (s.imported as Identifier).name);

    // If aliases were used, we need to import the *local* names, but the wrapper exports the same identifiers.
    // Import as named specifiers using local alias when necessary.
    const wrapperExisting = root.find(j.ImportDeclaration, { source: { value: WRAPPER } });
    if (wrapperExisting.size() > 0) {
      const wNode = wrapperExisting.get().node as ImportDeclaration;
      const already = new Set(
        (wNode.specifiers || [])
          .filter(s => s.type === 'ImportSpecifier' && s.local && s.local.type === 'Identifier')
          .map(s => s.local!.name)
      );
      const toAdd = targetSpecs.filter(s => {
        const local = (s.local || s.imported) as Identifier;
        return !already.has(local.name);
      });
      if (toAdd.length) {
        wNode.specifiers = [
          ...(wNode.specifiers || []),
          ...toAdd.map(s => j.importSpecifier(s.imported as Identifier, (s.local || s.imported) as Identifier))
        ];
      }
    } else {
      const specifiers = targetSpecs.map(s =>
        j.importSpecifier(s.imported as Identifier, (s.local || s.imported) as Identifier)
      );
      const decl = j.importDeclaration(specifiers, j.literal(WRAPPER));
      path.insertBefore(decl);
    }

    // 2) Rewrite current import:
    //    - If others remain, keep this import with 'otherSpecs'
    //    - If nothing remains, remove the import entirely
    if (otherSpecs.length > 0) {
      node.specifiers = otherSpecs;
    } else {
      j(path).remove();
    }
  });

  return changed ? root.toSource({ quote: 'single', reuseWhitespace: true }) : null;
}

