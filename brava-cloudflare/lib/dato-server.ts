import { properties } from '../content/properties';
import { mapProperty, type Catalog, type DatoRecord } from './catalog';

let cached: { key: string; until: number; catalog: Catalog } | undefined;
let inFlight: { key: string; promise: Promise<Catalog> } | undefined;

export async function getCatalog(): Promise<Catalog> {
  const token = process.env.DATOCMS_READONLY_TOKEN;
  if (!token) return { source: 'demo', properties };
  const key = token;
  if (cached?.key === key && cached.until > Date.now()) return cached.catalog;
  if (inFlight?.key === key) return inFlight.promise;
  const promise = (async (): Promise<Catalog> => {
    try {
      const schemaResponse = await fetch('https://graphql.datocms.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: '{ __type(name: "InmuebleRecord") { fields { name } } }',
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!schemaResponse.ok) throw new Error('Schema unavailable');
      const schema = (await schemaResponse.json()) as {
        data?: { __type?: { fields: { name: string }[] } };
        errors?: unknown;
      };
      if (schema.errors || !schema.data?.__type)
        throw new Error('Schema unavailable');
      const withOperation = schema.data.__type.fields.some(
        (field) => field.name === 'operacion',
      );
      const records: DatoRecord[] = [];
      // DatoCMS defaults to 20 records: explicitly page through the full catalogue.
      for (let skip = 0; ; skip += 100) {
        const response = await fetch('https://graphql.datocms.com/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Exclude-Invalid': 'true',
          },
          body: JSON.stringify({
            query: `query { allInmuebles(first: 100, skip: ${skip}, orderBy: id_ASC) { id titulo precio habitaciones banos metros descripcion tipo zona ${withOperation ? 'operacion' : ''} fotos { url alt customData } } }`,
          }),
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok) throw new Error('Catalogue unavailable');
        const data = (await response.json()) as {
          data?: { allInmuebles?: DatoRecord[] };
          errors?: unknown;
        };
        const page = data.data?.allInmuebles;
        if (data.errors || !Array.isArray(page))
          throw new Error('Invalid catalogue');
        records.push(...page);
        if (page.length < 100) break;
        if (skip >= 4900) throw new Error('Catalogue exceeds supported size');
      }
      const mapped = records.map((record) => mapProperty(record));
      if (mapped.some((record) => !record))
        throw new Error('Incomplete catalogue');
      const order = new Map(
        properties.map((property, index) => [property.title, index]),
      );
      mapped.sort(
        (a, b) =>
          (a?.demo ? (order.get(a.title) ?? 6) : 7) -
          (b?.demo ? (order.get(b.title) ?? 6) : 7),
      );
      const catalog: Catalog = {
        source: 'datocms',
        properties: mapped as NonNullable<ReturnType<typeof mapProperty>>[],
      };
      cached = { key, until: Date.now() + 300000, catalog };
      return catalog;
    } catch {
      // A live catalogue failure must never be replaced with fictional listings.
      return {
        source: 'datocms',
        properties: [],
        error:
          'No podemos mostrar las viviendas ahora mismo. Vuelve a intentarlo en unos minutos.',
      };
    } finally {
      inFlight = undefined;
    }
  })();
  inFlight = { key, promise };
  return promise;
}
