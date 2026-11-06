/* Genera contratos documentales desde los tipos reales del backend. No conecta servicios.
 * Las solicitudes y modelos se completan en runtime desde sus mismos esquemas Zod. */
const fs = require('node:fs'),
  path = require('node:path'),
  ts = require('typescript'),
  crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const relative = (p) => path.relative(root, p).replaceAll('\\', '/');
function generate() {
  const cfg = ts.readConfigFile(
    path.join(root, 'tsconfig.build.json'),
    ts.sys.readFile,
  );
  const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, root);
  const program = ts.createProgram(parsed.fileNames, parsed.options);
  const checker = program.getTypeChecker();
  const schemas = {};
  const operations = {};
  const rowModels = new Map();
  const sources = program
    .getSourceFiles()
    .filter(
      (s) => !s.isDeclarationFile && relative(s.fileName).startsWith('src/'),
    );
  const names = new Map();
  const typeNames = new Map();
  const unknown = {
    description:
      'Contenido JSON de estructura variable definido por el proveedor o la consulta de esta operación.',
    'x-dynamic-json': true,
  };
  function decs(n) {
    return (ts.canHaveDecorators(n) ? ts.getDecorators(n) || [] : []).map(
      (d) => {
        const e = d.expression;
        return {
          name: ts.isCallExpression(e) ? e.expression.getText() : e.getText(),
          args: ts.isCallExpression(e) ? [...e.arguments] : [],
        };
      },
    );
  }
  function lit(n) {
    if (!n) return undefined;
    if (ts.isStringLiteralLike(n)) return n.text;
    if (ts.isNumericLiteral(n)) return Number(n.text);
    if (n.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (n.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (n.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isArrayLiteralExpression(n)) return n.elements.map(lit);
    if (ts.isObjectLiteralExpression(n))
      return Object.fromEntries(
        n.properties
          .filter(ts.isPropertyAssignment)
          .map((p) => [
            p.name.getText().replace(/^['"]|['"]$/g, ''),
            lit(p.initializer),
          ]),
      );
    if (
      ts.isPropertyAccessExpression(n) &&
      n.expression.getText() === 'HttpStatus'
    ) {
      const statuses = {
        OK: 200,
        CREATED: 201,
        ACCEPTED: 202,
        NO_CONTENT: 204,
        MOVED_PERMANENTLY: 301,
        FOUND: 302,
        TEMPORARY_REDIRECT: 307,
        PERMANENT_REDIRECT: 308,
      };
      return statuses[n.name.text];
    }
    return undefined;
  }
  const dtoNames = new Map();
  for (const sf of sources.filter((s) =>
    relative(s.fileName).includes('/dtos/'),
  ))
    for (const c of sf.statements.filter(ts.isClassDeclaration)) {
      const m = c.members.find(
        (m) => ts.isPropertyDeclaration(m) && m.name.getText() === 'schema',
      );
      if (m?.initializer && ts.isCallExpression(m.initializer))
        dtoNames.set(c, lit(m.initializer.arguments[0]));
    }
  function schema(t, depth = 0) {
    if (!t || depth > 16) return { ...unknown };
    const awaited = checker.getAwaitedType(t);
    if (awaited && awaited !== t) return schema(awaited, depth + 1);
    if (
      t.flags &
      (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.TypeParameter)
    )
      return { ...unknown };
    if (
      t.flags &
      (ts.TypeFlags.Undefined | ts.TypeFlags.Void | ts.TypeFlags.Never)
    )
      return { nullable: true, description: 'Sin contenido de datos.' };
    if (t.isUnion()) {
      const types = t.types.filter((v) => !(v.flags & ts.TypeFlags.Undefined));
      const nil = types.some((v) => v.flags & ts.TypeFlags.Null);
      const non = types.filter((v) => !(v.flags & ts.TypeFlags.Null));
      if (!non.length) return { nullable: true, enum: [null] };
      if (non.every((v) => v.flags & ts.TypeFlags.BooleanLiteral))
        return { type: 'boolean', ...(nil ? { nullable: true } : {}) };
      if (non.every((v) => v.isLiteral?.())) {
        const values = non.map((v) => v.value);
        return {
          type: typeof values[0] === 'number' ? 'number' : 'string',
          enum: values,
          ...(nil ? { nullable: true } : {}),
        };
      }
      const out =
        non.length === 1
          ? schema(non[0], depth + 1)
          : {
              anyOf: [
                ...new Map(
                  non.map((v) => {
                    const s = schema(v, depth + 1);
                    return [JSON.stringify(s), s];
                  }),
                ).values(),
              ],
            };
      return nil
        ? out.$ref
          ? { allOf: [out], nullable: true }
          : { ...out, nullable: true }
        : out;
    }
    if (t.flags & ts.TypeFlags.StringLike)
      return {
        type: 'string',
        ...(t.isStringLiteral?.() ? { enum: [t.value] } : {}),
      };
    if (t.flags & ts.TypeFlags.NumberLike)
      return {
        type: 'number',
        ...(t.isNumberLiteral?.() ? { enum: [t.value] } : {}),
      };
    if (t.flags & ts.TypeFlags.BooleanLike) return { type: 'boolean' };
    if (t.flags & ts.TypeFlags.Null) return { nullable: true, enum: [null] };
    if (checker.isArrayType(t) || checker.isTupleType(t))
      return {
        type: 'array',
        items: schema(checker.getTypeArguments(t)[0], depth + 1),
      };
    const sym = t.aliasSymbol || t.getSymbol();
    const typeName = sym?.name;
    if (typeName === 'Date') return { type: 'string', format: 'date-time' };
    if (
      [
        'Buffer',
        'Uint8Array',
        'Readable',
        'StreamableFile',
        'ArrayBuffer',
      ].includes(typeName)
    )
      return { type: 'string', format: 'binary' };
    const declaration = sym?.declarations?.find((d) => dtoNames.has(d));
    if (declaration) {
      const p = checker
        .getPropertiesOfType(t)
        .filter((p) => !(p.flags & ts.SymbolFlags.Method));
      if (!p.length)
        return {
          type: 'object',
          maxProperties: 0,
          description: 'No requiere campos.',
        };
      return { $ref: '#/components/schemas/' + dtoNames.get(declaration) };
    }
    const properties = checker
      .getPropertiesOfType(t)
      .filter(
        (p) =>
          !(p.flags & ts.SymbolFlags.Method) &&
          p.name !== 'schema' &&
          !p.name.startsWith('__@'),
      );
    const index = checker.getIndexTypeOfType(t, ts.IndexKind.String);
    if (!properties.length)
      return index
        ? { type: 'object', additionalProperties: schema(index, depth + 1) }
        : { ...unknown };
    if (
      properties.length > 150 ||
      ['Response', 'Request', 'AxiosResponse', 'Socket', 'Server'].includes(
        typeName,
      )
    )
      return { ...unknown };
    if (typeNames.has(t))
      return { $ref: '#/components/schemas/' + typeNames.get(t) };
    const named = sym && typeName !== '__type' && typeName !== '__object';
    let key;
    if (named) {
      const raw = checker
        .typeToString(t, undefined, ts.TypeFormatFlags.NoTruncation)
        .replace(/import\("[^"]+"\)\./g, '');
      key = raw.replace(/[^a-zA-Z0-9_.-]/g, '_').replace(/_+/g, '_');
      if (key.length > 100)
        key =
          key.slice(0, 85) +
          '_' +
          crypto.createHash('sha256').update(raw).digest('hex').slice(0, 10);
      if (names.has(key) && names.get(key) !== t)
        key +=
          '_' +
          crypto
            .createHash('sha256')
            .update(
              relative(
                sym.declarations?.[0]?.getSourceFile().fileName || root,
              ) + raw,
            )
            .digest('hex')
            .slice(0, 6);
      names.set(key, t);
      typeNames.set(t, key);
      schemas[key] = {};
    }
    const result = {
      type: 'object',
      properties: {},
      required: [],
      ...(index ? { additionalProperties: schema(index, depth + 1) } : {}),
    };
    for (const p of properties) {
      const d = p.valueDeclaration || p.declarations?.[0];
      if (!d) continue;
      const pt = checker.getTypeOfSymbolAtLocation(p, d);
      const field = schema(pt, depth + 1);
      const desc = ts.displayPartsToString(p.getDocumentationComment(checker));
      if (desc) field.description = desc;
      result.properties[p.name] = field;
      if (
        !(p.flags & ts.SymbolFlags.Optional) &&
        !(
          pt.isUnion() && pt.types.some((t) => t.flags & ts.TypeFlags.Undefined)
        )
      )
        result.required.push(p.name);
    }
    if (rowModels.has(typeName))
      for (const [field, shape] of Object.entries(rowModels.get(typeName)))
        result.properties[field] ??= shape;
    if (!result.required.length) delete result.required;
    if (key) {
      schemas[key] = result;
      return { $ref: '#/components/schemas/' + key };
    }
    return result;
  }

  const classMap = new Map();
  for (const sf of sources)
    for (const c of sf.statements.filter(ts.isClassDeclaration))
      if (c.name) classMap.set(c.name.text, c);
  // El backend se construye también sin el repositorio SQL (CI/Docker).
  const sqlMetadata = require('./sql-contracts.snapshot.json');
  const sqlShapes = new Map(Object.entries(sqlMetadata.functions));
  for (const [name, shape] of Object.entries(sqlMetadata.tables)) rowModels.set(name, shape);
  function resolveRef(s) {
    return s?.$ref ? schemas[s.$ref.split('/').pop()] || s : s;
  }
  function returnExpressions(method) {
    const nodes = [];
    function visit(n) {
      if (
        n !== method &&
        (ts.isArrowFunction(n) ||
          ts.isFunctionExpression(n) ||
          ts.isFunctionDeclaration(n))
      )
        return;
      if (ts.isReturnStatement(n) && n.expression) nodes.push(n.expression);
      ts.forEachChild(n, visit);
    }
    if (method.body) visit(method.body);
    return nodes;
  }
  function combine(values) {
    const unique = [
      ...new Map(
        values.filter(Boolean).map((s) => [JSON.stringify(s), s]),
      ).values(),
    ];
    return unique.length === 1
      ? unique[0]
      : unique.length
        ? { anyOf: unique }
        : { ...unknown };
  }
  function infer(expr, trail = new Set(), depth = 0) {
    if (!expr || depth > 18 || trail.has(expr)) return { ...unknown };
    const next = new Set(trail);
    next.add(expr);
    if (
      ts.isAwaitExpression(expr) ||
      ts.isAsExpression(expr) ||
      ts.isParenthesizedExpression(expr) ||
      ts.isNonNullExpression(expr)
    )
      return infer(expr.expression, next, depth + 1);
    if (expr.kind === ts.SyntaxKind.NullKeyword)
      return { nullable: true, enum: [null] };
    if (ts.isObjectLiteralExpression(expr)) {
      const result = { type: 'object', properties: {} };
      for (const p of expr.properties) {
        if (ts.isPropertyAssignment(p))
          result.properties[p.name.getText().replace(/^['"]|['"]$/g, '')] =
            infer(p.initializer, next, depth + 1);
        else if (ts.isShorthandPropertyAssignment(p))
          result.properties[p.name.text] = infer(p.name, next, depth + 1);
        else if (ts.isSpreadAssignment(p))
          Object.assign(
            result.properties,
            resolveRef(infer(p.expression, next, depth + 1)).properties || {},
          );
      }
      return result;
    }
    if (ts.isArrayLiteralExpression(expr))
      return {
        type: 'array',
        items: expr.elements.length
          ? combine(expr.elements.map((e) => infer(e, next, depth + 1)))
          : { ...unknown },
      };
    if (ts.isCallExpression(expr)) {
      const callee = expr.expression;
      const name = ts.isPropertyAccessExpression(callee)
        ? callee.name.text
        : callee.getText();
      if (
        ts.isPropertyAccessExpression(callee) &&
        callee.expression.getText() === 'ApiResponseDto'
      ) {
        const statusCodes = {
          success: 200,
          updated: 200,
          deleted: 200,
          paginated: 200,
          created: 201,
          noContent: 204,
          notFound: 404,
          badRequest: 400,
          unauthorized: 401,
          forbidden: 403,
          conflict: 409,
          error: 500,
          custom: 200,
        };
        const noData = [
          'noContent',
          'notFound',
          'badRequest',
          'unauthorized',
          'forbidden',
          'conflict',
          'error',
        ].includes(name);
        const pagination =
          name === 'paginated'
            ? infer(expr.arguments[1], next, depth + 1)
            : name === 'custom' && expr.arguments[3]
              ? infer(expr.arguments[3], next, depth + 1)
              : undefined;
        const code =
          name === 'error'
            ? (lit(expr.arguments[1]) ?? 500)
            : name === 'custom'
              ? lit(expr.arguments[2])
              : (statusCodes[name] ?? 200);
        const message = lit(
          expr.arguments[noData ? 0 : name === 'paginated' ? 2 : 1],
        );
        return {
          type: 'object',
          required: ['data', 'message', 'status'],
          properties: {
            data: noData
              ? { nullable: true, enum: [null] }
              : expr.arguments[0]
                ? infer(expr.arguments[0], next, depth + 1)
                : { nullable: true, enum: [null] },
            message: {
              type: 'string',
              ...(message ? { example: message } : {}),
            },
            status: {
              type: 'integer',
              ...(code !== undefined ? { enum: [code], example: code } : {}),
            },
            ...(pagination ? { pagination } : {}),
          },
        };
      }
      const typed = schema(checker.getTypeAtLocation(expr));
      if (
        [
          'callFunction',
          'callFunctionSingle',
          'callPlanRows',
          'callPlanSingle',
        ].includes(name)
      ) {
        const sql = sqlShapes.get(lit(expr.arguments[0]));
        if (sql)
          return name === 'callFunctionSingle' || name === 'callPlanSingle'
            ? sql
            : { type: 'array', items: sql };
      }
      if (
        ts.isPropertyAccessExpression(callee) &&
        ['map', 'filter', 'slice', 'sort', 'flatMap'].includes(name)
      ) {
        const original = infer(callee.expression, next, depth + 1);
        if (name !== 'map' && name !== 'flatMap') return original;
        const fn = expr.arguments[0];
        if (fn && (ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) {
          const returns = ts.isBlock(fn.body)
            ? returnExpressions(fn)
            : [fn.body];
          const item = combine(returns.map((n) => infer(n, next, depth + 1)));
          return { type: 'array', items: item };
        }
      }
      if (!JSON.stringify(typed).includes('x-dynamic-json')) return typed;
      let declaration = checker.getResolvedSignature(expr)?.declaration;
      if (
        declaration &&
        !declaration.body &&
        ts.isPropertyAccessExpression(callee)
      ) {
        const target = checker.getTypeAtLocation(callee.expression);
        const typeName = target.getSymbol()?.name;
        const concrete = classMap.get(
          typeName?.replace(/^I(?=[A-Z])/, '') || '',
        );
        declaration =
          concrete?.members.find(
            (m) => ts.isMethodDeclaration(m) && m.name.getText() === name,
          ) || declaration;
      }
      if (declaration?.body) {
        const inferred = combine(
          returnExpressions(declaration).map((n) => infer(n, next, depth + 1)),
        );
        if (!inferred['x-dynamic-json']) return inferred;
      }
      return typed;
    }
    const typed = schema(checker.getTypeAtLocation(expr));
    if (!JSON.stringify(typed).includes('x-dynamic-json')) return typed;
    if (ts.isIdentifier(expr)) {
      let symbol = checker.getSymbolAtLocation(expr);
      if (symbol?.flags & ts.SymbolFlags.Alias)
        symbol = checker.getAliasedSymbol(symbol);
      const d = symbol?.valueDeclaration || symbol?.declarations?.[0];
      if (d && ts.isVariableDeclaration(d) && d.initializer)
        return infer(d.initializer, next, depth + 1);
    }
    if (ts.isElementAccessExpression(expr)) {
      const parent = resolveRef(infer(expr.expression, next, depth + 1));
      if (parent.type === 'array') return parent.items;
      const key = lit(expr.argumentExpression);
      if (parent.properties?.[key]) return parent.properties[key];
    }
    if (ts.isPropertyAccessExpression(expr)) {
      const parent = resolveRef(infer(expr.expression, next, depth + 1));
      if (parent.properties?.[expr.name.text])
        return parent.properties[expr.name.text];
    }
    if (
      ts.isBinaryExpression(expr) &&
      ['??', '||'].includes(expr.operatorToken.getText())
    ) {
      const left = infer(expr.left, next, depth + 1);
      return left['x-dynamic-json'] ? infer(expr.right, next, depth + 1) : left;
    }
    if (ts.isConditionalExpression(expr))
      return combine([
        infer(expr.whenTrue, next, depth + 1),
        infer(expr.whenFalse, next, depth + 1),
      ]);
    return typed;
  }
  function responseFor(m) {
    return combine(returnExpressions(m).map((n) => infer(n)));
  }
  function methodReturns(m) {
    const signature = checker.getSignatureFromDeclaration(m);
    return checker.getAwaitedType(checker.getReturnTypeOfSignature(signature));
  }
  function param(p, kind, d) {
    const name = lit(d.args[0]);
    const type = checker.getTypeAtLocation(p);
    const sch = schema(type);
    return {
      kind,
      name,
      schema: sch,
      required: !p.questionToken && !p.initializer,
      source: p.getText(),
    };
  }
  for (const sf of sources.filter((s) =>
    relative(s.fileName).includes('/controllers/'),
  )) {
    for (const c of sf.statements.filter(ts.isClassDeclaration)) {
      const cd = decs(c);
      if (!cd.some((d) => d.name === 'Controller')) continue;
      for (const m of c.members.filter(ts.isMethodDeclaration)) {
        const ds = decs(m);
        const route = ds.find((d) =>
          [
            'Get',
            'Post',
            'Put',
            'Patch',
            'Delete',
            'Head',
            'Options',
            'All',
          ].includes(d.name),
        );
        if (!route) continue;
        const id = c.name.text + '_' + m.name.getText();
        const all = [...cd, ...ds];
        const status =
          lit(ds.find((d) => d.name === 'HttpCode')?.args[0]) ||
          (route.name === 'Post' ? 201 : 200);
        const source = m.getText(sf);
        const params = [];
        let body;
        let hasRaw = false;
        let file = false;
        for (const p of m.parameters) {
          for (const d of decs(p)) {
            if (['Body', 'Query', 'Param', 'Headers'].includes(d.name)) {
              const entry = param(p, d.name, d);
              if (d.name === 'Body') {
                if (entry.name) {
                  body ??= { type: 'object', properties: {}, required: [] };
                  body.properties[entry.name] = entry.schema;
                  if (entry.required) body.required.push(entry.name);
                } else body = entry.schema;
              } else params.push(entry);
            }
            if (['Res', 'Response'].includes(d.name)) hasRaw = true;
            if (['UploadedFile', 'UploadedFiles'].includes(d.name)) file = true;
          }
        }
        const fileMatch = source.match(
          /Files?Interceptor\(\s*['"]([^'"]+)['"]/,
        );
        const permission = all
          .filter((d) =>
            [
              'RequireResourcePermission',
              'RequireScopedPermission',
              'RequireGranularPermission',
              'RequireSelfPermission',
              'proyecto',
            ].includes(d.name),
          )
          .map((d) => ({
            mode: d.name,
            codes: lit(d.args[0]) || d.args[0]?.getText(),
          }));
        const contextual = all.some(
          (d) => d.name === 'ContextualAuthorization',
        );
        const auth =
          all.some(
            (d) =>
              d.name === 'UseGuards' &&
              d.args.some((a) => a.getText().includes('JwtAuthGuard')),
          ) ||
          all.some((d) => d.name === 'AuthenticatedAccess') ||
          permission.length > 0 ||
          /extractTokenFromHeader|(?:req|request)\.headers\.authorization/.test(
            source,
          ) ||
          (!contextual && all.some((d) => d.name === 'ApiBearerAuth'));
        const op = {
          controller: c.name.text,
          method: m.name.getText(),
          verb: route.name.toLowerCase(),
          status,
          response: responseFor(m),
          params,
          body,
          file,
          fileField: fileMatch?.[1] || 'file',
          filesMultiple: source.includes('FilesInterceptor('),
          auth,
          contextual,
          permission,
          source: relative(sf.fileName),
        };
        const api = ds.find((d) => d.name === 'ApiOperation');
        const apiOptions = lit(api?.args[0]);
        op.summary =
          apiOptions?.summary ||
          ts
            .displayPartsToString(
              checker
                .getSymbolAtLocation(m.name)
                ?.getDocumentationComment(checker),
            )
            ?.split('\n')[0] ||
          m.name.getText().replace(/([a-z])([A-Z])/g, '$1 $2');
        op.description = apiOptions?.description;
        const mime = [
          ...source.matchAll(
            /(?:setHeader|header)\(\s*['"]Content-Type['"]\s*,\s*['"]([^'"]+)['"]/gi,
          ),
        ].map((x) => x[1]);
        const redirect = source.match(/\.redirect\(\s*(\d+)?/);
        const binary =
          hasRaw &&
          /\.(?:send|end|pipe)\(/.test(source) &&
          /\bbuffer\b|\bfileBuffer\b|pipe\(res\)|sendFile\(/i.test(source);
        if (binary) {
          op.mediaType = mime[0] || 'application/octet-stream';
          op.response = { type: 'string', format: 'binary' };
          op.binary = true;
        } else if (redirect) {
          op.status = Number(redirect[1]) || 302;
          op.redirect = true;
          delete op.response;
        } else if (hasRaw) {
          const json = source.match(
            /return\s+(?:res|response)(?:\.status\(\d+\))?\.json\(([^;]+)\)/,
          );
          if (json)
            op.response = {
              type: 'object',
              additionalProperties: true,
              description:
                'Respuesta del protocolo; consulte los campos documentados de la operación.',
            };
        }
        if (hasRaw) {
          const rawResponses = {};
          function collectRaw(node) {
            if (
              ts.isCallExpression(node) &&
              ts.isPropertyAccessExpression(node.expression) &&
              node.expression.name.text === 'json' &&
              /^(res|response)(\.|$)/.test(node.expression.expression.getText())
            ) {
              const match = node.expression.expression
                .getText()
                .match(/\.status\((\d+)\)/);
              const code = match ? Number(match[1]) : 200;
              rawResponses[code] = infer(node.arguments[0]);
            }
            ts.forEachChild(node, collectRaw);
          }
          collectRaw(m);
          if (Object.keys(rawResponses).length) op.rawResponses = rawResponses;
          if (rawResponses[200] && !op.binary && !op.redirect) {
            op.status = 200;
            op.response = rawResponses[200];
          }
        }
        if (!hasRaw && !returnExpressions(m).length) {
          op.noContent = true;
          delete op.response;
        }
        if (hasRaw && route.name === 'Post' && source.includes('.rawBody')) {
          op.body = { type: 'string', format: 'binary' };
          op.requestMedia = 'application/octet-stream';
        }
        operations[id] = op;
      }
    }
  }
  const imports = sources
    .filter(
      (s) =>
        relative(s.fileName).includes('/dtos/') &&
        s.fileName.endsWith('.dto.ts') &&
        !s.fileName.endsWith('api-response.dto.ts'),
    )
    .map(
      (s) =>
        "import '../" +
        relative(s.fileName)
          .split('src/presentation/')[1]
          .replace(/\.ts$/, '') +
        "';",
    )
    .sort();
  const registry =
    '// Generado con npm run docs:generate. Registra los contratos Zod sin servicios externos.\n' +
    imports.join('\n') +
    '\n';
  const result = JSON.parse(JSON.stringify({ operations, schemas }), (_key, value) => typeof value === 'string' ? value.replaceAll('\r\n', '\n') : value);
  return { result, registry };
}
function write() {
  const { result, registry } = generate();
  const dir = path.join(root, 'src/presentation/openapi');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, 'contracts.generated.json'),
    JSON.stringify(result, null, 2) + '\n',
  );
  fs.writeFileSync(path.join(dir, 'dto-registry.generated.ts'), registry);
  console.log(
    JSON.stringify({
      operaciones: Object.keys(result.operations).length,
      modelosRespuesta: Object.keys(result.schemas).length,
    }),
  );
}
module.exports = { generate };
if (require.main === module) write();
