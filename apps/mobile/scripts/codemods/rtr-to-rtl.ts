import type { API, FileInfo, JSCodeshift } from 'jscodeshift';

export default function (file: FileInfo, api: API) {
  const j: JSCodeshift = api.jscodeshift;
  const root = j(file.source);

  // replace import
  root.find(j.ImportDeclaration, { source: { value: 'react-test-renderer' } })
    .forEach(path => {
      const spec = path.node.specifiers?.map(s => s.type === 'ImportDefaultSpecifier' ? 'rtr' : (s as any).imported?.name) || [];
      // basic heuristic: swap to RTL
      j(path).replaceWith(j.importDeclaration(
        [j.importSpecifier(j.identifier('render')), j.importSpecifier(j.identifier('fireEvent')), j.importSpecifier(j.identifier('screen'))],
        j.literal('@testing-library/react-native')
      ));
    });

  // find `renderer.create(<X />)` → `render(<X />)` 
  root.find(j.CallExpression, { callee: { type: 'MemberExpression', object: { name: 'renderer' }, property: { name: 'create' } } })
    .forEach(p => j(p).replaceWith(j.callExpression(j.identifier('render'), p.node.arguments)));

  // `.toJSON()` snapshots → screen.toJSON if needed; prefer getByText/… assertions (manual follow-up)
  return root.toSource({ quote: 'single' });
}
