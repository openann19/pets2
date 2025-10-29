/**
 * Codemod to migrate from react-test-renderer to @testing-library/react-native
 */
import type { API, FileInfo } from 'jscodeshift';

export default function transform(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Replace import react-test-renderer with @testing-library/react-native
  root
    .find(j.ImportDeclaration)
    .filter((path) => path.node.source.value === 'react-test-renderer')
    .forEach((path) => {
      j(path).replaceWith(
        j.importDeclaration(
          [
            j.importSpecifier(j.identifier('render')),
            j.importSpecifier(j.identifier('fireEvent')),
            j.importSpecifier(j.identifier('screen')),
            j.importSpecifier(j.identifier('waitFor')),
          ],
          j.literal('@testing-library/react-native')
        )
      );
    });

  // Find renderer.create(<Component />) and replace with render(<Component />)
  root
    .find(j.CallExpression)
    .filter((path) => {
      const callee = path.node.callee;
      if (callee.type === 'MemberExpression') {
        const obj = callee.object as any;
        const prop = callee.property as any;
        return obj.name === 'renderer' && prop.name === 'create';
      }
      return false;
    })
    .forEach((path) => {
      j(path).replaceWith(
        j.callExpression(j.identifier('render'), path.node.arguments)
      );
    });

  // Replace .toJSON() with appropriate RTL assertion
  // Note: This is a basic transformation - may need manual follow-up
  root
    .find(j.MemberExpression)
    .filter((path) => path.node.property.name === 'toJSON')
    .forEach((path) => {
      // Leave as-is for now, manual follow-up recommended
    });

  return root.toSource({ quote: 'single', tabWidth: 2 });
}

