import type { Property } from '../content/properties';

export type Catalog = {
  source: 'demo' | 'datocms';
  properties: Property[];
  error?: string;
};
export type DatoRecord = {
  id: string;
  titulo: string;
  precio: number;
  metros: number;
  habitaciones: number;
  banos: number;
  descripcion?: string;
  tipo?: string;
  zona: string;
  operacion?: string;
  fotos?: {
    url: string;
    alt?: string | null;
    customData?: Record<string, string>;
  }[];
};

export function mapProperty(
  record: DatoRecord,
  defaultOperation = '',
): Property | null {
  const operation = (record.operacion || defaultOperation).trim().toLowerCase();
  if (!record.id || !record.titulo?.trim() || !record.zona?.trim()) return null;
  if (
    ![record.precio, record.metros, record.habitaciones, record.banos].every(
      (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0,
    )
  )
    return null;
  const photos = (record.fotos || []).filter((photo) => {
    try {
      const url = new URL(photo.url);
      return (
        url.protocol === 'https:' && url.hostname === 'www.datocms-assets.com'
      );
    } catch {
      return false;
    }
  });
  // Do not substitute a stock photograph for a listing without its own images.
  if (!photos.length) return null;
  const demo = record.descripcion?.startsWith('[DEMOSTRACIÓN BRAVA]') || false;
  const [description, featureText] = (
    demo
      ? (record.descripcion || '').split('\n\n').slice(1).join('\n\n')
      : record.descripcion || ''
  ).split('\n\nCaracterísticas: ');
  const gallery = photos.map((photo, index) => {
    const url = new URL(photo.url);
    url.searchParams.set('w', '1600');
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'max');
    return {
      src: url.toString(),
      label: photo.alt || `Fotografía ${index + 1}`,
      position: /^\d+(?:\.\d+)?% \d+(?:\.\d+)?%$/.test(
        photo.customData?.brava_position || '',
      )
        ? photo.customData!.brava_position
        : '50% 50%',
      zoom:
        Number(photo.customData?.brava_zoom) > 1
          ? Math.min(2, Number(photo.customData?.brava_zoom))
          : undefined,
    };
  });
  return {
    id: record.id,
    demo,
    title: record.titulo.trim(),
    location: record.zona.trim(),
    zone: record.zona.trim(),
    operation:
      operation === 'alquiler'
        ? 'alquiler'
        : ['venta', 'compra'].includes(operation)
          ? 'compra'
          : 'consultar',
    price: record.precio,
    area: record.metros,
    bedrooms: record.habitaciones,
    bathrooms: record.banos,
    description:
      description.trim() ||
      'Consulta los detalles de esta vivienda con la agencia.',
    tag: record.tipo || 'VIVIENDA',
    features:
      demo && featureText
        ? featureText.replace(/\.$/, '').split(', ')
        : record.tipo
          ? [record.tipo]
          : [],
    image: gallery[0].src,
    alt: photos[0].alt || record.titulo,
    position: gallery[0].position,
    gallery,
  };
}
