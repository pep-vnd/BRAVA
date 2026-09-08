'use client';
/* Fotografías locales de archivo, compartidas con el catálogo. */
/* oxlint-disable next/no-img-element */
import { useEffect, useRef } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

const chapters = [
  {
    word: 'LUZ',
    title: 'Que entre\nla vida.',
    copy: 'Abrir las ventanas. Cambiar de ritmo.',
    image: '/images/villa-pool.jpg',
    alt: 'Villa blanca y piscina bajo la luz mediterránea',
    position: '50% 65%',
    label: '01 — La luz',
  },
  {
    word: 'CALMA',
    title: 'Espacio para\nser tú.',
    copy: 'Lo que importa también está dentro.',
    image: '/images/bright-apartment.jpg',
    alt: 'Salón luminoso con materiales naturales',
    position: '50% 50%',
    label: '02 — El espacio',
  },
  {
    word: 'VIDA',
    title: 'El lujo de\nestar aquí.',
    copy: 'Y no querer estar en ningún otro sitio.',
    image: '/images/penthouse-terrace.jpg',
    alt: 'Terraza mediterránea abierta al mar',
    position: '50% 61%',
    label: '03 — Tu manera de vivir',
  },
];
const clamp = (n: number) => Math.max(0, Math.min(1, n));

const ease = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

// Suaviza los pasos de la rueda sin sustituir ni interceptar el scroll nativo.
// La respuesta depende del tiempo, no de los Hz de la pantalla. El bucle se detiene al asentarse.
function followScroll(
  el: HTMLElement,
  update: (progress: number, reduced: boolean) => void,
) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0,
    current = 0,
    target = 0,
    previous = 0;
  const sample = () => {
    el.dataset.motion = String(!preference.matches);
    const rect = el.getBoundingClientRect();
    target = preference.matches
      ? 0
      : clamp(-rect.top / Math.max(1, rect.height - innerHeight));
    if (preference.matches || rect.bottom <= 0 || rect.top >= innerHeight)
      current = target;
  };
  const tick = (time: number) => {
    frame = 0;
    const dt = previous ? Math.min(64, time - previous) : 16.67;
    previous = time;
    current += (target - current) * (1 - Math.exp(-dt / 100));
    const settled = Math.abs(target - current) < 0.00008;
    if (settled) current = target;
    update(current, preference.matches);
    if (!settled) frame = requestAnimationFrame(tick);
    else previous = 0;
  };
  const schedule = () => {
    sample();
    if (!frame) frame = requestAnimationFrame(tick);
  };
  sample();
  current = target;
  update(current, preference.matches);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  preference.addEventListener('change', schedule);
  return () => {
    cancelAnimationFrame(frame);
    removeEventListener('scroll', schedule);
    removeEventListener('resize', schedule);
    preference.removeEventListener('change', schedule);
  };
}

export function MotionDirector() {
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('.cinematic-hero');
    const intro = document.querySelector<HTMLElement>('.intro');
    if (!hero) return;
    return followScroll(hero, (progress, reduced) => {
      hero.style.setProperty('--hero-progress', String(progress));
      if (intro) {
        const r = intro.getBoundingClientRect();
        intro.style.setProperty(
          '--ink-progress',
          `${reduced ? 100 : clamp((innerHeight - r.top) / (innerHeight * 0.9)) * 100}%`,
        );
      }
    });
  }, []);
  return null;
}

export function ScrollExperience() {
  const track = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const panels = Array.from(
      el.querySelectorAll<HTMLElement>('.experience-panel'),
    );
    const bars = Array.from(
      el.querySelectorAll<HTMLElement>('.experience-meter-fill'),
    );
    return followScroll(el, (progress) => {
      el.style.setProperty('--journey-progress', String(progress));
      panels.forEach((panel, i) => {
        const local = progress * 3 - i;
        const amount = clamp(local);
        // La foto alcanza todos los bordes antes del final y permanece ahí hasta el siguiente fundido.
        panel.style.setProperty('--chapter', String(amount));
        panel.style.setProperty('--expand', String(ease(local / 0.74)));
        panel.style.setProperty(
          '--chapter-opacity',
          String(i === 0 ? 1 : ease(local / 0.28)),
        );
        bars[i].style.transform = `scaleX(${amount})`;
      });
    });
  }, []);
  return (
    <section
      ref={track}
      className="experience"
      aria-label="La luz, el espacio y la vida mediterránea"
    >
      <div className="experience-stage">
        <div className="experience-top">
          <span>EL MEDITERRÁNEO SE SIENTE.</span>
          <a href="#vende">
            Continuar <ArrowDownRight size={18} />
          </a>
        </div>
        <div className="experience-scenes">
          {chapters.map((chapter, i) => (
            <article className="experience-panel" key={chapter.word}>
              <span className="experience-word" aria-hidden="true">
                {chapter.word}
              </span>
              <div className="experience-photo">
                <img
                  src={chapter.image}
                  alt={chapter.alt}
                  loading="lazy"
                  width={1800}
                  height={1200}
                  style={{ objectPosition: chapter.position }}
                />
                <div className="experience-photo-shade" />
              </div>
              <div className="experience-caption">
                <span className="experience-chapter">
                  {String(i + 1).padStart(2, '0')} / UNA FORMA DE VIVIR
                </span>
                <h2>
                  {chapter.title.split('\n').map((line, index) => (
                    <span key={line}>
                      {line}
                      {index === 0 && <br />}
                    </span>
                  ))}
                </h2>
                <p>{chapter.copy}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="experience-bottom">
          <div className="experience-meter" aria-hidden="true">
            {chapters.map((c) => (
              <div key={c.word}>
                <span>{c.label}</span>
                <div className="experience-meter-track">
                  <i className="experience-meter-fill" />
                </div>
              </div>
            ))}
          </div>
          <span className="experience-note">
            FOTOGRAFÍAS PROVISIONALES <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </section>
  );
}
