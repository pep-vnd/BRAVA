import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapProperty } from '../lib/catalog.ts';
import { emailPayload, sendInquiry } from '../lib/contact.ts';

const record = {
  id: 'test',
  titulo: 'Casa <script>texto</script>',
  zona: 'Cádiz',
  precio: 900,
  metros: 80,
  habitaciones: 2,
  banos: 1,
  tipo: 'piso',
  fotos: [{ url: 'https://www.datocms-assets.com/test/house.jpg' }],
};
test('only an explicit operation distinguishes monthly rent from sale', () => {
  assert.equal(mapProperty(record).operation, 'consultar');
  assert.equal(
    mapProperty({ ...record, operacion: 'alquiler' }).operation,
    'alquiler',
  );
  assert.equal(
    mapProperty({ ...record, operacion: 'venta' }).operation,
    'compra',
  );
  assert.equal(
    mapProperty({ ...record, operacion: 'invalid' }).operation,
    'consultar',
  );
});
test('email reports failure and disabled mode never sends', async () => {
  const config = {
    enabled: true,
    serviceId: 's',
    templateId: 't',
    publicKey: 'p',
  };
  const inquiry = {
    name: 'Prueba',
    email: 'test@example.com',
    phone: '',
    message: '',
    area: '',
    kind: 'Contacto',
    title: '',
    price: '',
    zone: '',
    url: '',
  };
  let calls = 0;
  const fake = async () => {
    calls++;
    return new Response('OK', { status: 200 });
  };
  await sendInquiry(config, inquiry, fake);
  assert.equal(calls, 1);
  await assert.rejects(
    sendInquiry({ ...config, enabled: false }, inquiry, fake),
  );
  assert.equal(calls, 1);
  await assert.rejects(
    sendInquiry(
      config,
      inquiry,
      async () => new Response('Quota', { status: 429 }),
    ),
  );
  await assert.rejects(
    sendInquiry(config, inquiry, async () => {
      throw new Error('Offline');
    }),
  );
});
test('preserves the real gallery and plain text, never inserts stock photos', () => {
  assert.equal(mapProperty(record).title, record.titulo);
  assert.match(mapProperty(record).gallery[0].src, /w=1600/);
  assert.equal(mapProperty({ ...record, fotos: [] }), null);
  assert.equal(
    mapProperty({ ...record, fotos: [{ url: 'javascript:alert(1)' }] }),
    null,
  );
  assert.equal(mapProperty({ ...record, precio: -1 }), null);
});
test('email uses existing Spanish template fields and no visitor-controlled recipient', () => {
  const payload = emailPayload(
    { serviceId: 's', templateId: 't', publicKey: 'p', enabled: true },
    {
      name: 'Prueba',
      email: 'test@example.com',
      phone: '',
      message: 'Mensaje',
      area: 'Cádiz',
      kind: 'Valoración',
      title: '',
      price: '',
      zone: '',
      url: 'https://example.com/',
    },
  );
  assert.equal(payload.template_params.nombre, 'Prueba');
  assert.equal(payload.template_params.zona, 'Cádiz');
  assert.match(payload.template_params.mensaje, /Valoración/);
  assert.equal(payload.template_params.to_email, undefined);
  assert.equal(payload.accessToken, undefined);
});

test('imported demonstrations retain their features and gallery crop without exposing the import marker as description', () => {
  const mapped = mapProperty({
    ...record,
    operacion: 'alquiler',
    descripcion:
      '[DEMOSTRACIÓN BRAVA] Ejemplo ficticio.\n\nSalón luminoso.\n\nCaracterísticas: Terraza, Calefacción.',
    fotos: [
      {
        url: record.fotos[0].url,
        customData: { brava_position: '50% 65%', brava_zoom: '1.5' },
      },
    ],
  });
  assert.equal(mapped.demo, true);
  assert.equal(mapped.operation, 'alquiler');
  assert.equal(mapped.description, 'Salón luminoso.');
  assert.deepEqual(mapped.features, ['Terraza', 'Calefacción']);
  assert.equal(mapped.gallery[0].zoom, 1.5);
  assert.equal(mapped.position, '50% 65%');
});
