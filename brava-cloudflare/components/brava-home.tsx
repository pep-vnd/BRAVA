'use client';

/* Las imágenes locales incluyen dimensiones y carga diferida; se sirven sin depender de un optimizador externo. */
/* oxlint-disable next/no-img-element */
import {
  MotionDirector,
  ScrollExperience,
} from '@/components/scroll-experience';
import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  X,
  Menu,
  SlidersHorizontal,
  BedDouble,
  Bath,
  Scan,
  Check,
  Plus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatPrice, type Property } from '@/content/properties';
import { site } from '@/content/site';
import type { Catalog } from '@/lib/catalog';
import { sendInquiry, type EmailConfig } from '@/lib/contact';

function Choice({
  id,
  label,
  value,
  onChange,
  items,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <div className="filter-field">
      <span id={`${id}-label`}>{label}</span>
      <Select
        items={items}
        value={value}
        onValueChange={(v) => onChange(v ?? 'todas')}
      >
        <SelectTrigger
          id={id}
          aria-labelledby={`${id}-label`}
          className="filter-select"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false} className="filter-options">
          {items.map((item) => (
            <SelectItem
              value={item.value}
              key={item.value}
              className="filter-option"
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function InquiryForm({
  kind,
  property,
  config,
}: {
  kind: 'contacto' | 'visita' | 'valoracion';
  property?: Property;
  config: EmailConfig;
}) {
  const [complete, setComplete] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const pendingRef = useRef(false);
  const resultRef = useRef<HTMLOutputElement>(null);
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    setError('');
    setComplete(false);
    if (!config.enabled) {
      setComplete(true);
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get('website')) return;
    const value = (key: string) => {
      const entry = data.get(key);
      return typeof entry === 'string' ? entry.trim() : '';
    };
    if (value('name').length < 2) {
      setError('Escribe tu nombre, por favor.');
      return;
    }
    pendingRef.current = true;
    setSending(true);
    try {
      await sendInquiry(config, {
        name: value('name'),
        email: value('email'),
        phone: value('phone'),
        message: value('message'),
        area: value('area'),
        kind:
          kind === 'visita'
            ? 'Solicitud de visita'
            : kind === 'valoracion'
              ? 'Valoración de vivienda'
              : 'Contacto',
        title: property?.title || '',
        price: property ? formatPrice(property) : '',
        zone: property?.zone || '',
        url: window.location.href,
      });
      setComplete(true);
      form.reset();
    } catch {
      setError(
        'No hemos podido confirmar el envío. Tus datos siguen aquí; espera un momento antes de intentarlo otra vez.',
      );
    } finally {
      pendingRef.current = false;
      setSending(false);
    }
  }
  useEffect(() => {
    if (complete) resultRef.current?.focus();
  }, [complete]);
  return (
    <form
      className="inquiry-form"
      onSubmit={submit}
      onChange={() => {
        setComplete(false);
        setError('');
      }}
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="form-trap"
      />
      <fieldset disabled={sending} className="form-fields">
        {property && <p className="form-property">{property.title}</p>}
        <div className="form-row">
          <label>
            Tu nombre
            <input
              required
              name="name"
              autoComplete="name"
              minLength={2}
              maxLength={80}
              placeholder="Cómo te llamas"
            />
          </label>
          <label>
            Correo electrónico
            <input
              required
              name="email"
              type="email"
              autoComplete="email"
              maxLength={150}
              placeholder="tu@email.com"
            />
          </label>
        </div>
        <label>
          Teléfono <span>(opcional)</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            pattern="[+0-9 ()\-]{6,22}"
            maxLength={22}
            placeholder="Para hablar con calma"
          />
        </label>
        {kind === 'valoracion' && (
          <label>
            Zona de tu vivienda
            <input
              required
              name="area"
              minLength={2}
              maxLength={120}
              placeholder="Localidad o barrio"
            />
          </label>
        )}
        <label>
          {kind === 'visita'
            ? '¿Cuándo te vendría bien visitarla?'
            : 'Cuéntanos un poco más'}{' '}
          <span>(opcional)</span>
          <textarea
            name="message"
            maxLength={1500}
            rows={3}
            placeholder={
              kind === 'visita'
                ? 'Dinos qué días y horarios te van mejor.'
                : kind === 'valoracion'
                  ? 'Tipo de vivienda, superficie aproximada y lo que la hace especial.'
                  : 'Qué buscas, qué imaginas, por dónde empezamos…'
            }
          />
        </label>
        <p className="form-note">
          {config.enabled
            ? 'Al enviar, tus datos se transmitirán mediante EmailJS para atender tu consulta. Solicitar una visita no confirma una reserva.'
            : 'Formulario de demostración. Los datos se comprueban en tu dispositivo; no se guardan ni se envían. No se realiza ninguna reserva.'}
        </p>
        <button className="button button-terra" type="submit">
          {sending
            ? 'Enviando…'
            : config.enabled
              ? 'Enviar solicitud'
              : kind === 'visita'
                ? 'Comprobar solicitud de visita'
                : kind === 'valoracion'
                  ? 'Comprobar petición de valoración'
                  : 'Comprobar mensaje'}
          <ArrowUpRight size={19} />
        </button>
      </fieldset>
      {error && (
        <p role="alert" className="form-result">
          {error}
        </p>
      )}
      {complete && (
        <output ref={resultRef} tabIndex={-1} className="form-result">
          <Check size={21} />
          <div>
            <strong>
              {config.enabled
                ? 'Solicitud enviada.'
                : 'Los datos están bien cumplimentados.'}
            </strong>
            <p>
              {config.enabled
                ? 'El servicio de correo ha aceptado tu solicitud. La visita queda pendiente de confirmación.'
                : 'Esto es una demostración. No se ha enviado ninguna solicitud ni se ha guardado tu información.'}
            </p>
          </div>
        </output>
      )}
    </form>
  );
}

export default function Home({
  catalog,
  emailConfig,
}: {
  catalog: Catalog;
  emailConfig: EmailConfig;
}) {
  const properties = catalog.properties;
  const isDemo = catalog.source === 'demo';
  const [operation, setOperation] = useState('todas');
  const [zone, setZone] = useState('todas');
  const [price, setPrice] = useState('todos');
  const [selected, setSelected] = useState<Property | null>(null);
  const selectedDemo = isDemo || !!selected?.demo;
  const [photo, setPhoto] = useState(0);
  const [view, setView] = useState<'detail' | 'visit' | 'valuation'>('detail');
  const [valuation, setValuation] = useState(false);
  const [menu, setMenu] = useState(false);
  const [legal, setLegal] = useState<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (popupRef.current) popupRef.current.scrollTop = 0;
  }, [view, selected?.id]);
  const visible = properties.filter(
    (p) =>
      (operation === 'todas' || p.operation === operation) &&
      (zone === 'todas' || p.zone === zone) &&
      (price === 'todos' ||
        (p.operation !== 'consultar' && p.price <= Number(price))),
  );
  const maxPrices =
    operation === 'alquiler'
      ? [1500, 2000, 2500]
      : operation === 'compra'
        ? [650000, 800000, 1000000, 1500000]
        : [2000, 650000, 1000000, 1500000];
  const reset = () => {
    setOperation('todas');
    setZone('todas');
    setPrice('todos');
  };
  const close = () => {
    setSelected(null);
    setValuation(false);
    setView('detail');
  };
  const showProperty = (
    p: Property,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    triggerRef.current = event.currentTarget;
    setPhoto(0);
    setView('detail');
    setSelected(p);
  };
  const showValuation = (event: React.MouseEvent<HTMLButtonElement>) => {
    triggerRef.current = event.currentTarget;
    setView('valuation');
    setValuation(true);
  };
  useEffect(() => {
    if (!menu) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenu(false);
        document.querySelector<HTMLButtonElement>('.menu-button')?.focus();
      }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, [menu]);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    if (!preference.matches)
      nodes.forEach((node) => {
        node.classList.add('reveal-ready');
        observer.observe(node);
      });
    const onPreference = () => {
      if (preference.matches) nodes.forEach((n) => n.classList.add('revealed'));
    };
    preference.addEventListener('change', onPreference);
    return () => {
      observer.disconnect();
      preference.removeEventListener('change', onPreference);
    };
  }, []);
  return (
    <>
      <a className="skip-link" href="#propiedades">
        Ir a las propiedades
      </a>
      <header className="site-header" id="inicio">
        <a
          className="brand"
          href="#inicio"
          aria-label={`${site.name} ${site.descriptor}, inicio`}
        >
          {site.name}
          <span>{site.descriptor.toUpperCase()}</span>
        </a>
        <nav aria-label="Navegación principal">
          <a href="#propiedades">Propiedades</a>
          <a href="#vende">Vende tu vivienda</a>
          <a href="#nosotros">Nosotros</a>
          <a className="nav-contact" href="#contacto">
            Contacto <ArrowUpRight size={16} />
          </a>
        </nav>
        <button
          className="menu-button"
          onClick={() => setMenu(!menu)}
          aria-expanded={menu}
          aria-controls="mobile-nav"
          aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menu ? <X /> : <Menu />}
        </button>
        {menu && (
          <nav
            id="mobile-nav"
            className="mobile-nav"
            aria-label="Navegación móvil"
          >
            {[
              ['propiedades', 'Propiedades'],
              ['vende', 'Vende tu vivienda'],
              ['nosotros', 'Nosotros'],
              ['contacto', 'Contacto'],
            ].map(([id, label]) => (
              <a href={`#${id}`} key={id} onClick={() => setMenu(false)}>
                {label}
                <ArrowUpRight size={20} />
              </a>
            ))}
          </nav>
        )}
      </header>
      <main>
        <MotionDirector />
        <div className="cinematic-hero">
          <section className="hero" aria-labelledby="hero-title">
            <img
              className="hero-photo"
              src="/images/hero.jpg"
              alt="Villa mediterránea con piscina y arquitectura luminosa"
              fetchPriority="high"
              width={2400}
              height={1601}
            />
            <div className="hero-shade" />
            <div className="hero-top">
              <span className="eyebrow">
                <i /> MEDITERRÁNEO. MUY TUYO.
              </span>
              <span className="hero-index">
                VIVIENDAS CON CARÁCTER · COSTA BRAVA
              </span>
            </div>
            <div className="hero-main">
              <h1 id="hero-title">
                Tu próxima vida
                <br />
                empieza aquí<span>.</span>
              </h1>
              <div className="hero-bottom">
                <p>
                  Viviendas con carácter.
                  <br />
                  Lugares para quedarse.
                </p>
                <a className="button button-cream" href="#propiedades">
                  Explorar propiedades <ArrowUpRight size={21} />
                </a>
                <a
                  className="scroll-cue"
                  href="#propiedades"
                  aria-label="Bajar a las propiedades"
                >
                  <ArrowDown size={24} />
                </a>
              </div>
            </div>
            <span className="hero-photo-note">
              FOTOGRAFÍA PROVISIONAL · DEMOSTRACIÓN
            </span>
          </section>
        </div>
        <section id="propiedades" className="properties-section">
          <div className="intro section-pad" data-reveal>
            <span className="eyebrow dark-eye">01 / NUESTRA SELECCIÓN</span>
            <h2>
              Hay casas.
              <br />Y hay <em>algo más.</em>
            </h2>
            <p>
              La luz que entra. Los materiales que permanecen. Esa sensación de
              haber llegado. Encuentra un lugar que tenga que ver contigo.
            </p>
          </div>
          <div className="catalog">
            <search className="filters" aria-label="Buscar propiedades">
              <RadioGroup
                value={operation}
                onValueChange={(v) => {
                  setOperation(String(v));
                  setPrice('todos');
                }}
                className="operation-group"
                aria-label="Tipo de operación"
              >
                {[
                  ['todas', 'Todas'],
                  ['compra', 'Comprar'],
                  ['alquiler', 'Alquilar'],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className={
                      operation === value ? 'operation active' : 'operation'
                    }
                  >
                    <RadioGroupItem value={value} className="operation-radio" />
                    {label}
                  </label>
                ))}
              </RadioGroup>
              <Choice
                id="zone"
                label="¿DÓNDE?"
                value={zone}
                onChange={setZone}
                items={[
                  { value: 'todas', label: 'Todas las zonas' },
                  ...[...new Set(properties.map((p) => p.zone))]
                    .sort((a, b) => a.localeCompare(b, 'es'))
                    .map((z) => ({
                      value: z,
                      label: z,
                    })),
                ]}
              />
              <Choice
                id="price"
                label={
                  operation === 'alquiler'
                    ? 'PRECIO MÁXIMO / MES'
                    : 'PRECIO MÁXIMO'
                }
                value={price}
                onChange={setPrice}
                items={[
                  { value: 'todos', label: 'Sin límite' },
                  ...maxPrices.map((p) => ({
                    value: String(p),
                    label: `Hasta ${new Intl.NumberFormat('es-ES').format(p)} €`,
                  })),
                ]}
              />
              <a
                className="filter-search"
                href="#resultados"
                aria-label={`Ver ${visible.length} ${visible.length === 1 ? 'vivienda' : 'viviendas'}`}
              >
                <ArrowRight size={26} />
              </a>
            </search>
            <div className="results-meta" id="resultados">
              <output aria-live="polite">
                <span>{String(visible.length).padStart(2, '0')}</span>{' '}
                {visible.length === 1
                  ? 'vivienda para descubrir'
                  : 'viviendas para descubrir'}
              </output>
              {operation !== 'todas' ||
              zone !== 'todas' ||
              price !== 'todos' ? (
                <button onClick={reset}>
                  Limpiar filtros <X size={14} />
                </button>
              ) : (
                <span className="demo-label">
                  <i />{' '}
                  {isDemo ? 'SELECCIÓN DE DEMOSTRACIÓN' : 'NUESTRA SELECCIÓN'}
                </span>
              )}
            </div>
            {visible.length > 0 ? (
              <div className="property-grid">
                {visible.map((p, i) => (
                  <article className="property-card" key={p.id}>
                    <button
                      className="property-open"
                      onClick={(e) => showProperty(p, e)}
                      aria-label={`Ver ${p.title}, ${formatPrice(p)}`}
                    >
                      <div className="property-image">
                        <img
                          src={p.image}
                          alt={p.alt}
                          style={{ objectPosition: p.position }}
                          loading="lazy"
                          width={1200}
                          height={900}
                        />
                        <span className="property-badge">
                          {p.operation === 'compra'
                            ? 'EN VENTA'
                            : p.operation === 'alquiler'
                              ? 'EN ALQUILER'
                              : 'CONSULTAR OPERACIÓN'}
                        </span>
                        <span className="property-arrow">
                          <ArrowUpRight size={25} />
                        </span>
                        <span className="image-number">
                          {String(i + 1).padStart(2, '0')} /{' '}
                          {String(visible.length).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="property-location">
                        {p.location}
                        {p.demo && <span>Demostración</span>}
                      </div>
                      <div className="property-title">
                        <h3>{p.title}</h3>
                        <p>{formatPrice(p)}</p>
                      </div>
                      <div className="property-specs">
                        <span>
                          <Scan /> {p.area} m²
                        </span>
                        <span>
                          <BedDouble /> {p.bedrooms} dormitorios
                        </span>
                        <span>
                          <Bath /> {p.bathrooms} baños
                        </span>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <SlidersHorizontal size={32} />
                <h3>
                  {catalog.error
                    ? 'El catálogo no está disponible.'
                    : 'Ampliemos un poco la búsqueda.'}
                </h3>
                <p>
                  {catalog.error ||
                    'No hay viviendas con esa combinación. Prueba'}
                  {!catalog.error && ' otra zona o un precio mayor.'}
                </p>
                <button className="button button-dark" onClick={reset}>
                  Limpiar filtros <ArrowUpRight size={19} />
                </button>
              </div>
            )}
            <p className="catalog-disclaimer">
              {isDemo
                ? 'Inmuebles y precios ficticios. Fotografías de archivo provisionales, sin vinculación con las ubicaciones indicadas.'
                : 'Consulta la disponibilidad y los detalles de cada vivienda con la agencia.'}
            </p>
          </div>
        </section>
        <ScrollExperience />
        <section className="seller section-pad" id="vende">
          <div className="seller-top" data-reveal>
            <span className="eyebrow">02 / PARA PROPIETARIOS</span>
            <span className="seller-index">CADA CASA TIENE SU HISTORIA.</span>
          </div>
          <div className="seller-content" data-reveal>
            <h2>
              Tu vivienda
              <br />
              merece una
              <br />
              <em>buena venta.</em>
            </h2>
            <div className="seller-aside">
              <p>
                Entender lo que la hace especial es el primer paso. Te
                acompañamos con una valoración razonada, una presentación
                cuidada y conversaciones claras, de principio a fin.
              </p>
              <button className="button button-cream" onClick={showValuation}>
                Solicitar una valoración <ArrowUpRight size={20} />
              </button>
              <span>Sin compromiso. Empezamos escuchándote.</span>
            </div>
          </div>
          <div className="seller-steps">
            <div>
              <span>01</span>
              <p>Conocemos tu casa</p>
            </div>
            <div>
              <span>02</span>
              <p>Cuidamos su presentación</p>
            </div>
            <div>
              <span>03</span>
              <p>Te acompañamos hasta el final</p>
            </div>
          </div>
        </section>
        <section className="about section-pad" id="nosotros">
          <div className="about-image" data-reveal>
            <img
              src="/images/stone-house.jpg"
              alt="Piedra y madera en la arquitectura mediterránea"
              loading="lazy"
              width={1200}
              height={1500}
            />
            <span>LO QUE NOS INSPIRA · EL CARÁCTER DE AQUÍ</span>
          </div>
          <div className="about-copy" data-reveal>
            <span className="eyebrow">03 / SOMOS {site.name}</span>
            <h2>
              De aquí.
              <br />Y <em>de tu lado.</em>
            </h2>
            <p>
              Nos gustan las casas con algo que contar y las relaciones en las
              que se puede hablar claro. {site.name} nace de esa forma de mirar:
              cercana, atenta y muy mediterránea.
            </p>
            <p>
              Escuchamos lo que necesitas, elegimos con criterio y te damos
              tiempo para decidir. Porque encontrar casa es también encontrar tu
              manera de vivir.
            </p>
            <a className="text-link" href="#contacto">
              Vamos a conocernos <ArrowUpRight size={20} />
            </a>
            <span className="about-demo">
              {site.name} es una agencia ficticia creada para esta demostración.
            </span>
          </div>
        </section>
        <section className="contact section-pad" id="contacto">
          <div className="contact-copy" data-reveal>
            <span className="eyebrow">04 / HABLEMOS</span>
            <h2>
              Las buenas
              <br />
              historias empiezan
              <br />
              con un <em>hola.</em>
            </h2>
            <p>
              Busques casa o quieras vender la tuya,
              <br />
              nos encantará saber de ti.
            </p>
            <div className="contact-details">
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <span>{site.location}</span>
              <span>{site.hours}</span>
              <small>
                {emailConfig.enabled
                  ? 'También puedes escribirnos directamente por correo.'
                  : 'Puedes escribirnos directamente. El envío desde el formulario aún está en preparación.'}
              </small>
            </div>
          </div>
          <InquiryForm kind="contacto" config={emailConfig} />
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-top">
          <span>
            VIVIENDAS CON CARÁCTER.
            <br />
            VIDAS POR ESTRENAR.
          </span>
          <a href="#inicio" className="back-top">
            Volver arriba <ArrowUpRight size={19} />
          </a>
        </div>
        <a
          href="#inicio"
          className="footer-wordmark"
          aria-label="BRAVA, volver al inicio"
        >
          {site.name}
        </a>
        <div className="footer-bottom">
          <span>
            © 2026 {site.name} {site.descriptor} · Proyecto de demostración
          </span>
          <div>
            <button onClick={() => setLegal('Información de la demo')}>
              Información de la demo
            </button>
            <button onClick={() => setLegal('Fotografías')}>
              Créditos de imágenes
            </button>
          </div>
          <span>COSTA BRAVA, MEDITERRÁNEO.</span>
        </div>
      </footer>
      <Dialog
        open={!!selected || valuation}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent
          ref={popupRef}
          className={view === 'detail' ? 'property-dialog' : 'form-dialog'}
          showCloseButton={false}
          finalFocus={triggerRef}
        >
          <div className="dialog-top">
            <span className="eyebrow">
              {site.name} / {selected ? 'VIVIENDAS' : 'PROPIETARIOS'}
              {selectedDemo ? ' · DEMOSTRACIÓN' : ''}
            </span>
            <DialogClose className="close-dialog" aria-label="Cerrar ficha">
              <X size={24} />
            </DialogClose>
          </div>
          {selected && view === 'detail' ? (
            <>
              <section className="gallery" aria-label="Galería de la vivienda">
                <div className="gallery-image">
                  <img
                    key={`${selected.id}-${photo}`}
                    src={selected.gallery[photo].src}
                    alt={`${selected.title}: ${selected.gallery[photo].label}`}
                    style={{
                      objectPosition:
                        selected.gallery[photo].position ?? '50% 50%',
                      transform: `scale(${selected.gallery[photo].zoom ?? 1})`,
                    }}
                  />
                </div>
                <button
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      setPhoto((photo + 1) % selected.gallery.length);
                    }
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      setPhoto(
                        (photo - 1 + selected.gallery.length) %
                          selected.gallery.length,
                      );
                    }
                  }}
                  className="gallery-prev"
                  aria-label="Fotografía anterior"
                  onClick={() =>
                    setPhoto(
                      (photo - 1 + selected.gallery.length) %
                        selected.gallery.length,
                    )
                  }
                >
                  <ArrowLeft />
                </button>
                <button
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      setPhoto((photo + 1) % selected.gallery.length);
                    }
                    if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      setPhoto(
                        (photo - 1 + selected.gallery.length) %
                          selected.gallery.length,
                      );
                    }
                  }}
                  className="gallery-next"
                  aria-label="Fotografía siguiente"
                  onClick={() =>
                    setPhoto((photo + 1) % selected.gallery.length)
                  }
                >
                  <ArrowRight />
                </button>
                <div className="gallery-caption" aria-live="polite">
                  <span>{selected.gallery[photo].label}</span>
                  <span>
                    {photo + 1} / {selected.gallery.length}
                  </span>
                </div>
              </section>
              <div className="gallery-thumbs">
                {selected.gallery.map((g, i) => (
                  <button
                    key={i}
                    className={photo === i ? 'selected' : ''}
                    aria-label={`Ver imagen ${i + 1}: ${g.label}`}
                    aria-pressed={photo === i}
                    onClick={() => setPhoto(i)}
                  >
                    <img
                      src={g.src}
                      alt=""
                      style={{ objectPosition: g.position }}
                    />
                    {g.zoom && <Plus size={16} />}
                  </button>
                ))}
                <p>
                  {selectedDemo
                    ? 'Fotos provisionales. Los detalles ampliados proceden de la misma fotografía.'
                    : 'Fotografías del catálogo de la agencia.'}
                </p>
              </div>
              <div className="detail-body">
                <div className="detail-heading">
                  <div>
                    <span className="eyebrow">{selected.location}</span>
                    <DialogTitle className="detail-title">
                      {selected.title}
                    </DialogTitle>
                  </div>
                  <p className="detail-price">
                    {formatPrice(selected)}
                    <span>
                      {selected.operation === 'consultar'
                        ? 'Operación y precio pendientes de confirmar'
                        : selected.operation === 'compra'
                          ? selectedDemo
                            ? 'Precio ficticio · gastos e impuestos no incluidos'
                            : 'Precio publicado por la agencia'
                          : selectedDemo
                            ? 'Renta ficticia · suministros no incluidos'
                            : 'Renta mensual publicada por la agencia'}
                    </span>
                  </p>
                </div>
                <div className="detail-specs">
                  <span>
                    <Scan />
                    <strong>{selected.area} m²</strong> construidos
                  </span>
                  <span>
                    <BedDouble />
                    <strong>{selected.bedrooms}</strong> dormitorios
                  </span>
                  <span>
                    <Bath />
                    <strong>{selected.bathrooms}</strong> baños
                  </span>
                </div>
                <DialogDescription className="detail-description">
                  {selected.description}
                </DialogDescription>
                <h3 className="features-title">
                  {selectedDemo
                    ? 'Lo que la hace especial'
                    : 'Tipo de vivienda'}
                </h3>
                <ul className="features">
                  {selected.features.map((f) => (
                    <li key={f}>
                      <Check size={17} />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="detail-cta">
                  <p>
                    ¿Te imaginas aquí?<span>El primer paso es conocerla.</span>
                  </p>
                  <button
                    className="button button-terra"
                    onClick={() => setView('visit')}
                  >
                    Solicitar visita <ArrowUpRight size={20} />
                  </button>
                </div>
                <p className="detail-disclaimer">
                  {selectedDemo
                    ? 'Vivienda de demostración. La ubicación, la descripción y las características son ficticias. Las fotografías ilustran el estilo y no corresponden a una oferta real.'
                    : 'Información facilitada a través del catálogo de la agencia. Consulta la disponibilidad y las condiciones antes de tomar una decisión.'}
                </p>
              </div>
            </>
          ) : (
            <div className="modal-form-body">
              {selected && (
                <button className="back-link" onClick={() => setView('detail')}>
                  <ArrowLeft size={17} /> Volver a la vivienda
                </button>
              )}
              <DialogTitle className="form-title">
                {view === 'valuation'
                  ? 'Cada buena venta empieza aquí.'
                  : 'Vamos a conocer tu próxima casa.'}
              </DialogTitle>
              <DialogDescription className="form-description">
                {view === 'valuation'
                  ? 'Cuéntanos un poco sobre tu vivienda.'
                  : emailConfig.enabled
                    ? 'Deja tus datos y tu disponibilidad.'
                    : 'Deja tus datos y tu disponibilidad para probar la solicitud.'}
              </DialogDescription>
              <InquiryForm
                config={
                  selectedDemo && selected
                    ? { ...emailConfig, enabled: false }
                    : emailConfig
                }
                key={view}
                kind={view === 'valuation' ? 'valoracion' : 'visita'}
                property={selected ?? undefined}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!legal}
        onOpenChange={(open) => {
          if (!open) setLegal(null);
        }}
      >
        <DialogContent className="info-dialog" showCloseButton={false}>
          <DialogClose
            className="close-dialog info-close"
            aria-label="Cerrar información"
          >
            <X />
          </DialogClose>
          <DialogTitle className="info-title">{legal}</DialogTitle>
          <DialogDescription>
            {legal === 'Fotografías'
              ? 'Las fotografías decorativas son de archivo y provisionales. Las galerías del catálogo conectado proceden de DatoCMS.'
              : isDemo
                ? 'BRAVA Inmobiliaria es una agencia ficticia. Los inmuebles son de demostración.'
                : 'BRAVA mantiene su identidad de demostración. Las viviendas y sus fotografías se leen del catálogo de DatoCMS.'}
          </DialogDescription>
          {legal === 'Fotografías' ? (
            <div className="credits">
              <p>
                Villa y piscina:{' '}
                <a
                  href="https://unsplash.com/@johnfo"
                  target="_blank"
                  rel="noreferrer"
                >
                  John Fornander / Unsplash ↗
                </a>
              </p>
              <p>
                Consulta las fuentes, los autores y las licencias de cada
                fotografía en{' '}
                <a href="/image-credits.txt" target="_blank" rel="noreferrer">
                  los créditos completos ↗
                </a>
                .
              </p>
              <p>
                {isDemo
                  ? 'Las galerías de demostración combinan fotografías y detalles ampliados identificados como tales.'
                  : 'Las fotografías de cada vivienda se gestionan en DatoCMS. Los créditos anteriores corresponden a las imágenes decorativas de BRAVA.'}
              </p>
            </div>
          ) : (
            <div className="credits">
              <p>
                {emailConfig.enabled
                  ? 'Los formularios envían tu consulta mediante EmailJS. No confirman reservas.'
                  : 'Los formularios solo comprueban los datos en tu navegador. No envían solicitudes, no crean reservas y no guardan información.'}
              </p>
              <p>
                Esta web no utiliza cuentas de visitantes, analítica ni cookies
                propias. Cuando está conectado, DatoCMS proporciona las
                viviendas publicadas. El acceso privado de la plataforma puede
                requerir su propia sesión.
              </p>
              <p>
                Antes de usarla como agencia real habrá que sustituir los datos
                de ejemplo, conectar el contacto y añadir la información legal
                correspondiente.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
