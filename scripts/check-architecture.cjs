const fs = require('node:fs');
const path = require('node:path');
const { builtinModules } = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const builtins = new Set(builtinModules.flatMap(name => [name, 'node:' + name]));
const violations = [];
let inspected = 0;
for (const layer of ['domain', 'application']) {
  for (const name of fs.readdirSync(path.join(root, 'src', layer), { recursive: true })) {
    if (!name.endsWith('.ts') || name.endsWith('.spec.ts')) continue;
    const file = path.join('src', layer, name).replaceAll('\\', '/');
    const source = ts.createSourceFile(file, fs.readFileSync(path.join(root, file), 'utf8'), ts.ScriptTarget.Latest, true);
    inspected++;
    function check(specifier, node) {
      let destination;
      if (specifier.startsWith('.')) destination = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
      else if (specifier.startsWith('src/')) destination = specifier;
      const allowed = destination ? destination.startsWith('src/' + layer + '/') || layer === 'application' && destination.startsWith('src/domain/') : builtins.has(specifier);
      if (!allowed) violations.push(`${file}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}: ${specifier}`);
    }
    function visit(node) {
      if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) check(node.moduleSpecifier.text, node);
      if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference) && node.moduleReference.expression && ts.isStringLiteral(node.moduleReference.expression)) check(node.moduleReference.expression.text, node);
      if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || node.expression.getText(source) === 'require') && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) check(node.arguments[0].text, node);
      if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal)) check(node.argument.literal.text, node);
      if (ts.canHaveDecorators(node) && ts.getDecorators(node)?.length) violations.push(`${file}: decorador en una capa interna`);
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
}
if (violations.length) { console.error(violations.join('\n')); process.exitCode = 1; }
else console.log(`Arquitectura verificada: ${inspected} archivos internos, sin dependencias hacia capas externas.`);
