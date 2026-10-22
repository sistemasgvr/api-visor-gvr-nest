import { readFileSync } from 'node:fs';
import '../openapi/dto-registry.generated';
import { dtoSchemas } from './zod-dto';
interface Baseline {
  labels: string[];
  values: unknown[];
  models: Record<string, { properties: Record<string, number> }>;
  intentionallyStricter: string[];
}
const baseline = JSON.parse(
  readFileSync('test/fixtures/validation-before-zod.json', 'utf8'),
) as Baseline;
describe('Compatibilidad de validación en la migración completa a Zod', () => {
  it('conserva 16 562 decisiones históricas y endurece solo los 25 casos mal tipados registrados', () => {
    const unexpected: string[] = [];
    const stricter = new Set(baseline.intentionallyStricter);
    let checked = 0;
    for (const [name, model] of Object.entries(baseline.models)) {
      const schema = dtoSchemas.get(name);
      expect(schema).toBeDefined();
      for (const [property, mask] of Object.entries(model.properties))
        for (let index = 0; index < baseline.labels.length; index++) {
          const label = baseline.labels[index];
          const parsed = schema!.safeParse(
            label === 'ausente' ? {} : { [property]: baseline.values[index] },
          );
          const rejected =
            !parsed.success &&
            parsed.error.issues.some((issue) => issue.path[0] === property);
          const rejectedBefore = !!(mask & (1 << index));
          const key = [name, property, label].join(':');
          if (rejected !== (rejectedBefore || stricter.has(key)))
            unexpected.push(key);
          checked++;
        }
    }
    expect(checked).toBe(16562);
    expect(unexpected).toEqual([]);
  });
});
