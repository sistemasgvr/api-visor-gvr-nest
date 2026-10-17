const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
function canonical(node, source) {
  const printed = ts.createPrinter({ removeComments: true }).printNode(ts.EmitHint.Unspecified, node, source);
  const scanner = ts.createScanner(ts.ScriptTarget.Latest, true, ts.LanguageVariant.Standard, printed);
  const tokens = [];
  for (let kind = scanner.scan(); kind !== ts.SyntaxKind.EndOfFileToken; kind = scanner.scan()) {
    tokens.push([kind, kind === ts.SyntaxKind.StringLiteral || kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral ? scanner.getTokenValue() : scanner.getTokenText()]);
  }
  const closing = new Set([ts.SyntaxKind.CloseParenToken, ts.SyntaxKind.CloseBracketToken, ts.SyntaxKind.CloseBraceToken]);
  return JSON.stringify(tokens.filter((token, index) => token[0] !== ts.SyntaxKind.CommaToken || !closing.has(tokens[index + 1]?.[0])));
}
function describe(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  if (file.includes('/dtos/')) return source.statements.filter(node => !ts.isImportDeclaration(node)).map(node => canonical(node, source));
  const names = new Set(['Controller', 'Get', 'Post', 'Put', 'Patch', 'Delete', 'Head', 'Options', 'All', 'HttpCode', 'Header', 'UseGuards', 'UseInterceptors', 'Version', 'SetMetadata', 'Roles', 'UsePipes', 'RequireGranularPermission', 'RequireIssuePermission', 'RequireDocumentProject', 'RequireProjectPermission']);
  const decorators = node => (ts.canHaveDecorators(node) ? ts.getDecorators(node) ?? [] : []).filter(decorator => {
    const expression = decorator.expression;
    return ts.isCallExpression(expression) && names.has(expression.expression.getText(source));
  }).map(decorator => canonical(decorator, source));
  return source.statements.filter(ts.isClassDeclaration).map(node => ({
    name: node.name?.text, decorators: decorators(node),
    methods: node.members.filter(ts.isMethodDeclaration).map(method => ({
      name: method.name.getText(source), decorators: decorators(method),
      parameters: method.parameters.map(parameter => ({
        name: parameter.name.getText(source), optional: !!parameter.questionToken,
        type: parameter.type ? canonical(parameter.type, source) : null,
        default: parameter.initializer ? canonical(parameter.initializer, source) : null,
        decorators: (ts.getDecorators(parameter) ?? []).map(decorator => canonical(decorator, source)),
      })),
    })),
  }));
}
function verify() {
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'test/contracts/http-contract.json'), 'utf8'));
  for (const [file, digest] of Object.entries(expected)) {
    const shape = describe(file, fs.readFileSync(path.join(root, file), 'utf8'));
    const actual = createHash('sha256').update(JSON.stringify(shape)).digest('hex');
    assert.equal(actual, digest, `Contrato modificado: ${file}`);
  }
  const controllers = fs.readdirSync(path.join(root, 'src/presentation/controllers'), { recursive: true }).filter(file => file.endsWith('.ts'));
  assert.equal(controllers.length, Object.keys(expected).filter(file => file.includes('/controllers/')).length, 'Cambió el inventario de controladores');
  console.log(`Contratos HTTP verificados: ${controllers.length} controladores y ${Object.keys(expected).length - controllers.length} archivos de DTO.`);
}
module.exports = { describe };
if (require.main === module) verify();
