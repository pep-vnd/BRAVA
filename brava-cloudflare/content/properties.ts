// Todos los inmuebles, ubicaciones asociadas, precios y características son FICTICIOS.
// Las fotos de archivo son provisionales y no representan inmuebles en comercialización.
export type Property = {
  id: string;
  demo?: boolean;
  title: string;
  location: string;
  zone: string;
  operation: 'compra' | 'alquiler' | 'consultar';
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  tag: string;
  description: string;
  features: string[];
  image: string;
  position: string;
  alt: string;
  gallery: { src: string; label: string; position?: string; zoom?: number }[];
};
export const properties: Property[] = [
  {
    demo: true,
    id: 'BRV-001',
    title: 'Villa de la luz',
    location: 'Begur, Costa Brava',
    zone: 'Begur',
    operation: 'compra',
    price: 1250000,
    area: 245,
    bedrooms: 4,
    bathrooms: 3,
    tag: 'LUZ, AGUA Y CALMA',
    description:
      'Una casa abierta al exterior, donde la luz marca el ritmo del día. Los espacios de estar se prolongan hacia el porche y la piscina, con rincones para leer, compartir una sobremesa o disfrutar del silencio. Una propuesta de vida mediterránea, sencilla y generosa.',
    features: [
      'Piscina privada',
      'Porche y jardín',
      'Cocina abierta',
      'Aire acondicionado',
      'Aparcamiento privado',
      'Orientación sur',
    ],
    image: '/images/hero.jpg',
    position: '50% 65%',
    alt: 'Villa blanca contemporánea abierta a una piscina y un jardín',
    gallery: [
      {
        src: '/images/hero.jpg',
        label: 'Fachada y piscina',
        position: '50% 65%',
      },
      { src: '/images/villa-pool.jpg', label: 'Otra perspectiva del exterior' },
    ],
  },
  {
    demo: true,
    id: 'BRV-002',
    title: 'Piedra y tiempo',
    location: 'Pals, Baix Empordà',
    zone: 'Pals',
    operation: 'compra',
    price: 645000,
    area: 186,
    bedrooms: 3,
    bathrooms: 2,
    tag: 'EL CARÁCTER PERMANECE',
    description:
      'Una casa de pueblo con textura, historia y una forma tranquila de entender el espacio. La piedra natural y la madera aportan calidez a una distribución pensada para vivirla todo el año. Un refugio para quienes valoran los materiales que mejoran con el tiempo.',
    features: [
      'Casa de pueblo',
      'Piedra natural',
      'Carpintería de madera',
      'Salón comedor',
      'Calefacción',
      'Zona de almacenaje',
    ],
    image: '/images/stone-house.jpg',
    position: '50% 43%',
    alt: 'Casa tradicional de piedra con puertas y ventanas de madera',
    gallery: [
      {
        src: '/images/stone-house.jpg',
        label: 'Vista de la fachada',
        position: '50% 43%',
      },
      {
        src: '/images/stone-house.jpg',
        label: 'Detalle ampliado de la misma fotografía',
        position: '50% 43%',
        zoom: 1.5,
      },
    ],
  },
  {
    demo: true,
    id: 'BRV-003',
    title: 'Un lugar para la luz',
    location: 'Palafrugell, Costa Brava',
    zone: 'Palafrugell',
    operation: 'alquiler',
    price: 1450,
    area: 92,
    bedrooms: 2,
    bathrooms: 1,
    tag: 'LO COTIDIANO, EXTRAORDINARIO',
    description:
      'Un apartamento luminoso, de líneas sencillas y tonos naturales. El salón invita a quedarse y la distribución aprovecha cada metro sin renunciar al espacio. Un punto de partida cómodo para hacer del Mediterráneo tu día a día.',
    features: [
      'Alquiler de larga estancia',
      'Amueblado',
      'Cocina equipada',
      'Aire acondicionado',
      'Salón luminoso',
      'Lavadero',
    ],
    image: '/images/bright-apartment.jpg',
    position: '50% 50%',
    alt: 'Salón luminoso con sofás claros, plantas y comedor',
    gallery: [
      { src: '/images/bright-apartment.jpg', label: 'Salón y comedor' },
      {
        src: '/images/bright-apartment.jpg',
        label: 'Detalle ampliado de la misma fotografía',
        position: '30% 60%',
        zoom: 1.55,
      },
    ],
  },
  {
    demo: true,
    id: 'BRV-004',
    title: 'La casa del patio',
    location: 'Begur, Costa Brava',
    zone: 'Begur',
    operation: 'compra',
    price: 785000,
    area: 164,
    bedrooms: 3,
    bathrooms: 2,
    tag: 'LA VIDA HACIA FUERA',
    description:
      'Un patio que se convierte en el centro de la casa. Espacios para desayunar despacio, abrir las ventanas y dejar que el día entre. Una vivienda de escala cercana, con interiores conectados al exterior y la intimidad que apetece al volver a casa.',
    features: [
      'Patio privado',
      'Zona de comedor exterior',
      'Carpintería de madera',
      'Cocina equipada',
      'Calefacción',
      'Entrada independiente',
    ],
    image: '/images/courtyard-house.jpg',
    position: '50% 60%',
    alt: 'Patio mediterráneo con vegetación y muros de piedra',
    gallery: [
      {
        src: '/images/courtyard-house.jpg',
        label: 'El patio',
        position: '50% 60%',
      },
      {
        src: '/images/courtyard-house.jpg',
        label: 'Detalle ampliado de la misma fotografía',
        position: '65% 60%',
        zoom: 1.5,
      },
    ],
  },
  {
    demo: true,
    id: 'BRV-005',
    title: 'Arriba, el cielo',
    location: 'Cadaqués, Alt Empordà',
    zone: 'Cadaqués',
    operation: 'alquiler',
    price: 2200,
    area: 108,
    bedrooms: 2,
    bathrooms: 2,
    tag: 'TU RINCÓN AL AIRE LIBRE',
    description:
      'Un ático para vivir también al aire libre. La terraza añade otra habitación a la casa: un lugar para conversar, cuidar unas plantas o disfrutar del final del día. Interiores cálidos, una distribución práctica y mucho espacio para desconectar.',
    features: [
      'Alquiler de larga estancia',
      'Terraza privada',
      'Amueblado',
      'Cocina equipada',
      'Aire acondicionado',
      'Zona de trabajo',
    ],
    image: '/images/penthouse-terrace.jpg',
    position: '50% 60%',
    alt: 'Terraza luminosa con muebles de madera y tejidos naturales',
    gallery: [
      {
        src: '/images/penthouse-terrace.jpg',
        label: 'Terraza exterior',
        position: '50% 60%',
      },
      {
        src: '/images/penthouse-terrace.jpg',
        label: 'Detalle ampliado de la misma fotografía',
        position: '50% 75%',
        zoom: 1.5,
      },
    ],
  },
  {
    demo: true,
    id: 'BRV-006',
    title: 'El ritmo del campo',
    location: 'Pals, Baix Empordà',
    zone: 'Pals',
    operation: 'compra',
    price: 980000,
    area: 278,
    bedrooms: 4,
    bathrooms: 3,
    tag: 'ESPACIO PARA RESPIRAR',
    description:
      'Una edificación de piedra para rehabilitar entre olivos. Su carácter rural y el paisaje que la rodea son el punto de partida para imaginar un nuevo proyecto. En esta propuesta ficticia, la distribución de cuatro dormitorios y tres baños representa una posible configuración futura, no el estado actual de la finca.',
    features: [
      'Rehabilitación integral',
      'Edificación de piedra',
      'Entorno de olivos',
      'Parcela rústica',
      'Acceso por camino',
      'Distribución propuesta',
    ],
    image: '/images/country-estate.jpg',
    position: '50% 88%',
    alt: 'Casa de campo mediterránea rodeada de árboles y paisaje verde',
    gallery: [
      {
        src: '/images/country-estate.jpg',
        label: 'La casa y su entorno',
        position: '50% 88%',
      },
      {
        src: '/images/country-estate.jpg',
        label: 'Detalle ampliado de la misma fotografía',
        position: '50% 90%',
        zoom: 1.5,
      },
    ],
  },
];
export const formatPrice = (property: Pick<Property, 'price' | 'operation'>) =>
  property.operation === 'consultar'
    ? 'Consultar precio'
    : new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(property.price) +
      (property.operation === 'alquiler' ? ' / mes' : '');
