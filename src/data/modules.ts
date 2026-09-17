import type { Mod } from '../types'

// ─── Lucide icon registry (inline SVG strings for use inside dangerouslySetInnerHTML) ─
const _ico = (paths: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%;display:block">${paths}</svg>`

const ICO_BRIEFCASE = _ico('<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>')
const ICO_LANDMARK  = _ico('<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="22"/><line x1="10" x2="10" y1="18" y2="22"/><line x1="14" x2="14" y1="18" y2="22"/><line x1="18" x2="18" y1="18" y2="22"/><polygon points="3 18 12 2 21 18"/>')
const ICO_SCALE     = _ico('<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21H17"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>')
const ICO_CROWN     = _ico('<path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z"/><path d="M5 21h14"/>')
const ICO_GRADCAP   = _ico('<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>')
const ICO_HEART     = _ico('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>')
const ICO_CHECK     = _ico('<path d="M20 6 9 17l-5-5"/>')
const ICO_SHIELD    = _ico('<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>')
const ICO_MAPPIN    = _ico('<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>')
const ICO_MOUNTAIN  = _ico('<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>')
const ICO_WAVES     = _ico('<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>')
const ICO_SUN       = _ico('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41m9.9 9.9 1.41 1.41M2 12h2m16 0h2m-3.93 5.66-1.41 1.41M6.34 6.34 4.93 4.93"/>')
const ICO_BUILDING  = _ico('<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01"/>')
const ICO_BOOKOPEN  = _ico('<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>')
const ICO_PALETTE   = _ico('<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>')
const ICO_MUSIC     = _ico('<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>')
const ICO_GLOBE     = _ico('<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>')
const ICO_CLOCK     = _ico('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>')
const ICO_FILETEXT  = _ico('<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8M16 13H8M16 17H8"/>')
const ICO_PHONE     = _ico('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.93 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.91 6.91l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>')
const ICO_UTENSILS  = _ico('<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>')

// Reusable HTML snippets for theory layout
const _card = (icon: string, color: string, title: string, body: string) =>
  `<div style="background:rgba(255,255,255,0.65);border:1px solid rgba(26,26,46,0.09);border-radius:0.875rem;padding:0.75rem;display:flex;flex-direction:column;gap:0.35rem">
    <div style="width:1.35rem;height:1.35rem;color:${color}">${icon}</div>
    <strong style="font-size:0.78rem;color:#1A1A2E;display:block">${title}</strong>
    <p style="font-size:0.67rem;color:rgba(26,26,46,0.58);margin:0;line-height:1.4">${body}</p>
  </div>`
const _grid = (cards: string) =>
  `<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0.6rem;margin-bottom:1rem">${cards}</div>`
const _badge = (text: string, r: number, g: number, b: number) =>
  `<span style="display:inline-flex;align-items:center;padding:0.1rem 0.45rem;background:rgba(${r},${g},${b},0.12);border:1px solid rgba(${r},${g},${b},0.28);border-radius:0.375rem;font-size:0.7rem;font-weight:700;color:rgb(${r},${g},${b});vertical-align:middle;margin:0 0.15rem">${text}</span>`
const _bar = (icon: string, color: string, html: string) =>
  `<div style="border-left:3px solid ${color};background:rgba(255,255,255,0.45);border-radius:0 0.625rem 0.625rem 0;padding:0.5rem 0.875rem;margin-top:0.75rem">
    <p style="font-size:0.78rem;color:#1A1A2E;margin:0;line-height:1.55">${html}</p>
  </div>`
const _li = (icon: string, color: string, html: string) =>
  `<div style="display:flex;align-items:flex-start;gap:0.4rem;font-size:0.72rem;color:rgba(26,26,46,0.7);line-height:1.45">
    <div style="width:0.875rem;height:0.875rem;flex-shrink:0;margin-top:0.1rem;color:${color}">${icon}</div>
    <span>${html}</span>
  </div>`
const _h = (text: string) =>
  `<p style="font-size:0.58rem;font-weight:900;color:rgba(26,26,46,0.35);text-transform:uppercase;letter-spacing:0.1em;margin:0.75rem 0 0.45rem 0">${text}</p>`


export const MODULES: Mod[] = [
  {
    id: 1,
    title: 'Gobierno, legislación y participación',
    emoji: '🏛️',
    color: '#FF4B4B',
    bg: 'bg-[#FF4B4B]',
    border: 'border-[#FF4B4B]',
    shadow: '4px 4px 0 #FF4B4B',
    heroImage: 'https://images.unsplash.com/photo-1574556462575-eb106a5865a0?w=900&h=350&fit=crop&auto=format',
    theory: `<p style="font-size:0.82rem;color:#1A1A2E;line-height:1.6;margin:0 0 0.75rem 0">España está regida por la ${_badge('Constitución de 1978', 255, 75, 75)}, su ley suprema. Tiene forma de ${_badge('Monarquía Parlamentaria', 255, 75, 75)}, donde la soberanía reside en el pueblo español.</p>${_h('División de Poderes')}${_grid(`${_card(ICO_BRIEFCASE, '#1CB0F6', 'Ejecutivo', 'El Gobierno dirige la política interior y exterior del Estado.')}${_card(ICO_LANDMARK, '#CE82FF', 'Legislativo', 'Las Cortes Generales (Congreso + Senado) elaboran y aprueban las leyes.')}${_card(ICO_SCALE, '#58CC02', 'Judicial', 'Jueces y magistrados aplican las leyes con plena independencia.')}`)}<div style="margin-top:0.75rem">${_bar(ICO_CROWN, '#FF4B4B', '<strong>El Rey Felipe VI</strong> es Jefe del Estado. Sanciona y promulga las leyes, pero <strong>no las elabora</strong> — ese poder reside en las Cortes Generales.')}</div>${_h('Hitos de la Democracia')}<div style="display:flex;flex-direction:column;gap:0.4rem">${_li(ICO_CLOCK, '#FF4B4B', '<strong>1975</strong> — Muerte del dictador Francisco Franco. Comienza la <em>Transición Democrática</em>.')}${_li(ICO_CHECK, '#FF4B4B', '<strong>6-dic-1978</strong> — La Constitución es aprobada en referéndum. Se celebra el <em>Día de la Constitución</em>.')}</div>`,
    steps: [
      { title: 'Poder Ejecutivo', summary: 'El Gobierno dirige la política interior y exterior del Estado.', detail: 'El Gobierno está formado por el Presidente, los Vicepresidentes y los Ministros. El Presidente es propuesto por el Rey y debe obtener la confianza del Congreso. Tiene su sede en el Palacio de la Moncloa (Madrid). El Gobierno puede ser derrocado mediante una moción de censura constructiva.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Congreso_de_los_Diputados_%28Madrid%29_02.jpg/640px-Congreso_de_los_Diputados_%28Madrid%29_02.jpg' },
      { title: 'Poder Legislativo', summary: 'Las Cortes Generales (Congreso + Senado) elaboran y aprueban las leyes.', detail: 'El Congreso de los Diputados tiene 350 diputados elegidos cada 4 años y es la cámara con más peso. El Senado tiene 266 senadores (elegidos o designados por las CCAAs). Ambas cámaras aprueban las leyes, aunque el Congreso puede superar el veto del Senado por mayoría absoluta.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Senado_de_Espa%C3%B1a_-_Fachada.jpg/640px-Senado_de_Espa%C3%B1a_-_Fachada.jpg' },
      { title: 'Poder Judicial', summary: 'Jueces y magistrados aplican las leyes con plena independencia.', detail: 'El poder judicial es totalmente independiente de los otros poderes. El órgano de gobierno de los jueces es el Consejo General del Poder Judicial (CGPJ). El Tribunal Supremo es el máximo órgano judicial. El Tribunal Constitucional (órgano especial) interpreta la Constitución y puede anular leyes.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Tribunal_Constitucional_de_Espa%C3%B1a.jpg/640px-Tribunal_Constitucional_de_Espa%C3%B1a.jpg' },
      { title: 'Jefatura del Estado', summary: 'El Rey Felipe VI es el Jefe del Estado y símbolo de la nación.', detail: 'El Rey Felipe VI (desde 2014, cuando Juan Carlos I abdicó) es Jefe del Estado. Su papel es representativo y arbitral: sanciona y promulga las leyes, propone al candidato a Presidente del Gobierno y representa a España en el exterior. No elabora leyes ni dirige el Gobierno.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Palacio_Real_de_Madrid_-_01.jpg?width=640' },
      { title: 'Administración Territorial', summary: '17 CCAAs + 2 Ciudades Autónomas + 50 provincias + 8.000+ municipios.', detail: 'España tiene tres niveles administrativos: el Estado central, las 17 Comunidades Autónomas (con Ceuta y Melilla como Ciudades Autónomas), las 50 provincias (gobernadas por Diputaciones) y más de 8.000 municipios (con Ayuntamientos). Cada nivel tiene competencias propias y es elegido democráticamente.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Subdivisions_of_Spain_with_coats_of_arms.png/640px-Subdivisions_of_Spain_with_coats_of_arms.png' },
      { title: 'Defensor del Pueblo', summary: 'Protege los derechos ciudadanos ante las Administraciones públicas.', detail: 'El Defensor del Pueblo es elegido por las Cortes Generales y actúa como su comisionado. Cualquier ciudadano puede presentar una queja sin coste si cree que sus derechos han sido vulnerados por un organismo público. Es un organismo independiente del Gobierno, aunque depende de las Cortes.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg/640px-Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg' },
    ],
    proTip: 'España es un Estado aconfesional (no tiene religión oficial), pero garantiza la libertad ideológica y religiosa. Los españoles pueden votar a partir de los 18 años.',
    mistakes: 'El Rey NO hace las leyes (solo las sanciona y promulga). El Defensor del Pueblo depende de las Cortes Generales, NO del Gobierno. Las Fuerzas Armadas incluyen el Ejército de Tierra, la Armada y el Ejército del Aire.',
    gifs: [
      { url: 'https://media.giphy.com/media/QXITDf8MXXd3yjAPBB/giphy.gif', caption: 'El Congreso de los Diputados en Madrid — sede del poder legislativo español', emoji: '🏛️' },
    ],
    challenges: [
      // ── Official PDF — Tarea 1 ──
      {
        type: 'checkbox',
        question: '¿Con qué rey se restaura la democracia en España después del régimen de Franco?',
        options: [{ text: 'Con Juan Carlos I.', correct: true }, { text: 'Con Felipe VI.', correct: false }, { text: 'Con Alfonso XIII.', correct: false }],
        explanation: 'Tras la muerte del dictador Francisco Franco en 1975, el rey Juan Carlos I lideró la Transición democrática. Aunque fue designado por Franco como sucesor, impulsó la reforma política que culminó con la Constitución de 1978 y la democracia actual.',
      },
      {
        type: 'checkbox',
        question: 'Los municipios y provincias forman parte de la Administración...',
        options: [{ text: 'local.', correct: true }, { text: 'central.', correct: false }, { text: 'autonómica.', correct: false }],
        explanation: 'La Administración española tiene tres niveles: central (Estado), autonómica (Comunidades Autónomas) y local. Los Ayuntamientos (municipios) y las Diputaciones (provincias) pertenecen a la Administración local.',
      },
      {
        type: 'checkbox',
        question: 'Los españoles pueden votar a partir de los...',
        options: [{ text: '16 años.', correct: false }, { text: '18 años.', correct: true }, { text: '21 años.', correct: false }],
        explanation: 'La mayoría de edad en España se alcanza a los 18 años, que es también la edad mínima para ejercer el derecho al voto en todas las elecciones (generales, autonómicas, municipales y europeas).',
      },
      {
        type: 'checkbox',
        question: '¿Cuál de los siguientes cuerpos forma parte de las Fuerzas Armadas de España?',
        options: [{ text: 'El Ejército del Aire.', correct: true }, { text: 'La Guardia Civil.', correct: false }, { text: 'El Cuerpo Nacional de Policía.', correct: false }],
        explanation: 'Las Fuerzas Armadas de España están compuestas por el Ejército de Tierra, la Armada (marina militar) y el Ejército del Aire. La Guardia Civil y el Cuerpo Nacional de Policía son Fuerzas y Cuerpos de Seguridad del Estado, no Fuerzas Armadas.',
      },
      {
        type: 'checkbox',
        question: '¿Qué título tiene la futura reina, hija del rey?',
        options: [{ text: 'Duquesa de Madrid.', correct: false }, { text: 'Infanta de España.', correct: false }, { text: 'Princesa de Asturias.', correct: true }],
        explanation: 'La Princesa Leonor, hija del Rey Felipe VI y la Reina Letizia, ostenta el título de Princesa de Asturias por ser la heredera a la Corona española. Este título tradicional se otorga siempre al heredero del trono.',
      },
      {
        type: 'checkbox',
        question: '¿Cómo se llama la organización que defiende los intereses de los trabajadores?',
        options: [{ text: 'La patronal.', correct: false }, { text: 'El sindicato.', correct: true }, { text: 'La Seguridad Social.', correct: false }],
        explanation: 'Los sindicatos son organizaciones que representan y defienden los intereses laborales de los trabajadores. Los más importantes en España son CCOO (Comisiones Obreras) y UGT (Unión General de Trabajadores). La patronal, en cambio, representa a los empresarios.',
      },
      {
        type: 'checkbox',
        question: '¿Qué organismo oficial atiende las quejas de los ciudadanos por el mal funcionamiento de las administraciones?',
        options: [{ text: 'El Defensor del Pueblo.', correct: true }, { text: 'El Tribunal Constitucional.', correct: false }, { text: 'El Ministerio del Interior.', correct: false }],
        explanation: 'El Defensor del Pueblo es el Alto Comisionado de las Cortes Generales encargado de defender los derechos y libertades de los ciudadanos ante posibles abusos de la Administración. Es independiente del Gobierno y es elegido por las Cortes.',
      },
      {
        type: 'checkbox',
        question: 'Las Cortes Generales están compuestas por el Senado y...',
        options: [{ text: 'el Tribunal Constitucional.', correct: false }, { text: 'el Congreso de los Diputados.', correct: true }, { text: 'el Consejo de Estado.', correct: false }],
        explanation: 'Las Cortes Generales son el parlamento español y representan al pueblo español. Se dividen en dos cámaras: el Congreso de los Diputados (cámara baja, 350 diputados) y el Senado (cámara alta, representación territorial). Ambas elaboran y aprueban las leyes.',
      },
      {
        type: 'checkbox',
        question: '¿Quién es el representante del Estado en una comunidad autónoma?',
        options: [{ text: 'El presidente autonómico.', correct: false }, { text: 'El delegado del Gobierno.', correct: true }, { text: 'El alcalde de la capital.', correct: false }],
        explanation: 'El Delegado del Gobierno es el representante del Gobierno central en cada Comunidad Autónoma. Coordina la Administración del Estado en el territorio autonómico y supervisa los servicios del Estado. No debe confundirse con el Presidente de la Comunidad Autónoma.',
      },
      {
        type: 'checkbox',
        question: 'El Defensor del Pueblo depende de...',
        options: [{ text: 'el Gobierno.', correct: false }, { text: 'el Tribunal Supremo.', correct: false }, { text: 'las Cortes Generales.', correct: true }],
        explanation: 'El Defensor del Pueblo es el Alto Comisionado de las Cortes Generales. Depende del Parlamento (no del Gobierno) para garantizar su independencia a la hora de defender a los ciudadanos de posibles abusos administrativos.',
      },
      // ── Additional questions ──
      {
        type: 'dragdrop',
        wordBank: ['Rey', 'Gobierno', 'Cortes Generales', 'Constitución'],
        parts: ['En España, el ', { answer: 'Rey' }, ' es el Jefe del Estado, pero es el ', { answer: 'Gobierno' }, ' quien dirige la política. Las leyes se aprueban en las ', { answer: 'Cortes Generales' }, '.'],
        explanation: 'Esta frase resume la separación de poderes española: el Rey (Jefatura del Estado), el Gobierno (poder ejecutivo) y las Cortes Generales (poder legislativo) tienen funciones claramente diferenciadas por la Constitución.',
      },
      {
        type: 'checkbox',
        question: '¿Cuál es la ley fundamental y suprema del Estado español?',
        options: [{ text: 'El Código Civil.', correct: false }, { text: 'La Constitución española.', correct: true }, { text: 'El Código Penal.', correct: false }],
        explanation: 'La Constitución española de 1978 es la norma suprema del ordenamiento jurídico. Todas las demás leyes deben respetar lo que establece. Fue aprobada en referéndum el 6 de diciembre de 1978, fecha que se celebra como Día de la Constitución.',
      },
      {
        type: 'dropdown',
        parts: ['Según la Constitución, la soberanía nacional reside en el ', { options: ['Rey', 'pueblo español', 'Gobierno'], answer: 'pueblo español' }, ' del que emanan los poderes del Estado.'],
        explanation: 'El artículo 1.2 de la Constitución establece que "la soberanía nacional reside en el pueblo español, del que emanan los poderes del Estado." Esto significa que el poder político en España proviene de los ciudadanos, quienes lo ejercen a través de elecciones.',
      },
      {
        type: 'checkbox',
        question: 'La Constitución española fue aprobada en referéndum en...',
        options: [{ text: '1975', correct: false }, { text: '1978', correct: true }, { text: '1982', correct: false }],
        explanation: 'La Constitución española fue aprobada por referéndum el 6 de diciembre de 1978, con una participación del 67% y un 88% de votos favorables. Fue el resultado de la Transición democrática tras el franquismo y sigue siendo la ley fundamental de España.',
      },
      {
        type: 'dragdrop',
        wordBank: ['Congreso de los Diputados', 'Senado', 'Tribunal Supremo'],
        parts: ['Las Cortes Generales están formadas por el ', { answer: 'Congreso de los Diputados' }, ' y el ', { answer: 'Senado' }, '.'],
        explanation: 'Las Cortes Generales son el parlamento bicameral de España. El Congreso de los Diputados es la cámara baja (350 diputados) con mayor peso legislativo. El Senado es la cámara alta con representación territorial. El Tribunal Supremo pertenece al poder judicial, no al legislativo.',
      },
      {
        type: 'checkbox',
        question: '¿A quién corresponde la sanción y promulgación de las leyes?',
        options: [{ text: 'Al Rey.', correct: true }, { text: 'Al Presidente del Gobierno.', correct: false, specificFeedback: 'El Presidente dirige el Gobierno y propone leyes, pero no las sanciona. La sanción formal es un acto del Rey, aunque es obligatorio y no puede vetarlas.' }, { text: 'Al Presidente del Tribunal Supremo.', correct: false, specificFeedback: 'El Tribunal Supremo pertenece al poder judicial, que aplica las leyes, no las sanciona ni promulga. Esa función constitucional corresponde al Rey.' }],
        explanation: 'Una vez aprobada una ley por las Cortes Generales, el Rey la sanciona (da su aprobación formal) y la promulga (la publica oficialmente en el BOE). Es un acto formal y obligatorio; el Rey no puede negarse ni vetar las leyes aprobadas por el Parlamento.',
      },
      {
        type: 'checkbox',
        question: '¿Qué órgano es el máximo intérprete de la Constitución española?',
        options: [{ text: 'El Tribunal Supremo.', correct: false, specificFeedback: 'El Tribunal Supremo es el órgano más alto del poder judicial ordinario, pero no interpreta la Constitución. Eso lo hace el Tribunal Constitucional, un órgano separado.' }, { text: 'El Congreso de los Diputados.', correct: false, specificFeedback: 'El Congreso aprueba leyes, pero no interpreta si son constitucionales. Esa función exclusiva pertenece al Tribunal Constitucional.' }, { text: 'El Tribunal Constitucional.', correct: true }],
        explanation: 'El Tribunal Constitucional es el intérprete supremo de la Constitución. Resuelve recursos de inconstitucionalidad contra las leyes y protege los derechos fundamentales de los ciudadanos. A diferencia del Tribunal Supremo, que es el órgano judicial más alto, el Constitucional es un órgano constitucional separado.',
      },
      {
        type: 'checkbox',
        question: '¿A quién corresponde dirigir la política interior y exterior de España?',
        options: [{ text: 'Al Rey.', correct: false }, { text: 'A las Cortes Generales.', correct: false }, { text: 'Al Gobierno.', correct: true }],
        explanation: 'Según el artículo 97 de la Constitución, el Gobierno dirige la política interior y exterior, la Administración civil y militar y la defensa del Estado. El Presidente del Gobierno lidera el Ejecutivo y responde ante el Congreso de los Diputados.',
      },
      {
        type: 'dropdown',
        parts: ['Las leyes orgánicas deben ser aprobadas por mayoría absoluta del ', { options: ['Senado', 'Congreso de los Diputados', 'Rey'], answer: 'Congreso de los Diputados' }, '.'],
        explanation: 'Las leyes orgánicas regulan materias especialmente importantes (derechos fundamentales, estatutos de autonomía, régimen electoral...) y requieren la aprobación por mayoría absoluta del Congreso de los Diputados (176 de 350 votos), no solo mayoría simple.',
      },
      {
        type: 'checkbox',
        question: '¿Quién propone al Congreso el candidato a la Presidencia del Gobierno?',
        options: [{ text: 'El Senado.', correct: false }, { text: 'El Rey.', correct: true }, { text: 'El Tribunal Constitucional.', correct: false }],
        explanation: 'Según la Constitución, el Rey propone al Congreso un candidato a la Presidencia del Gobierno, tras consultar con los representantes de los grupos políticos con representación parlamentaria. El Congreso es quien finalmente inviste (elige) al Presidente mediante votación.',
      },
      {
        type: 'checkbox',
        question: '¿Cuántos diputados tiene el Congreso de los Diputados?',
        options: [{ text: '200 diputados.', correct: false }, { text: '350 diputados.', correct: true }, { text: '500 diputados.', correct: false }],
        explanation: 'El Congreso de los Diputados está formado por un mínimo de 300 y un máximo de 400 escaños; actualmente son 350 diputados. Representan al pueblo español y son elegidos cada 4 años mediante sufragio universal en circunscripciones provinciales.',
      },
      {
        type: 'checkbox',
        question: 'España es...', options: [{ text: 'una monarquía parlamentaria.', correct: true }, { text: 'una república federal.', correct: false }, { text: 'una monarquía absoluta.', correct: false }],
        explanation: 'El artículo 1.3 de la Constitución establece que "la forma política del Estado español es la Monarquía parlamentaria". Esto significa que el Rey es el Jefe del Estado, pero el poder político real lo ejerce el Parlamento (Cortes Generales) y el Gobierno elegido democráticamente.',
      },
      {
        type: 'checkbox',
        question: 'Las elecciones generales en España se celebran habitualmente cada...',
        options: [{ text: '3 años.', correct: false }, { text: '4 años.', correct: true }, { text: '5 años.', correct: false }],
        explanation: 'La legislatura ordinaria en España tiene una duración de 4 años, al final de los cuales se celebran elecciones generales. El Rey puede disolver las Cortes anticipadamente a propuesta del Presidente del Gobierno, convocando nuevas elecciones antes de ese plazo.',
      },
    ],
  },
  {
    id: 2,
    title: 'Derechos y deberes fundamentales',
    emoji: '⚖️',
    color: '#1CB0F6',
    bg: 'bg-[#1CB0F6]',
    border: 'border-[#1CB0F6]',
    shadow: '4px 4px 0 #1CB0F6',
    heroImage: 'https://images.unsplash.com/photo-1571645401291-6ad7c594e0cd?w=900&h=350&fit=crop&auto=format',
    theory: `<p style="font-size:0.82rem;color:#1A1A2E;line-height:1.6;margin:0 0 0.75rem 0">La Constitución garantiza un amplio catálogo de ${_badge('Derechos Fundamentales', 28, 176, 246)} para todas las personas que viven en España, sin distinción de origen o creencia.</p>${_h('Principales Derechos')}${_grid(`${_card(ICO_GRADCAP, '#1CB0F6', 'Educación', 'La enseñanza básica (6–16 años) es obligatoria y gratuita para todos.')}${_card(ICO_HEART, '#FF4B4B', 'Sanidad', 'La atención sanitaria pública es gratuita para todos los residentes con derecho a ella.')}${_card(ICO_SHIELD, '#58CC02', 'Igualdad', 'Nadie puede ser discriminado por razón de nacimiento, sexo, religión u opinión.')}`)}<div style="margin-top:0.75rem">${_bar(ICO_GLOBE, '#1CB0F6', `España es un Estado <strong>aconfesional</strong>: <strong>no tiene religión oficial</strong>. La Constitución garantiza la libertad ideológica y religiosa de toda persona.`)}</div>${_h('Edades Clave')}<div style="display:flex;flex-direction:column;gap:0.4rem">${_li(ICO_CLOCK, '#1CB0F6', '<strong>14 años</strong> — Obligación de obtener el <em>DNI</em>.')}${_li(ICO_CLOCK, '#1CB0F6', '<strong>16 años</strong> — Fin de la escolarización obligatoria.')}${_li(ICO_CHECK, '#1CB0F6', '<strong>18 años</strong> — Mayoría de edad: derecho al voto y al trabajo pleno.')}${_h('Deberes Constitucionales')}${_li(ICO_SHIELD, '#1CB0F6', 'Defender a España, cumplir las leyes y contribuir al gasto público mediante impuestos.')}${_li(ICO_CHECK, '#1CB0F6', 'Respetar los derechos y libertades de los demás ciudadanos.')}</div>`,
    steps: [
      { title: 'Mayoría de Edad', summary: 'Plena capacidad civil, laboral y política a los 18 años.', detail: 'A los 18 años se puede votar, firmar contratos, casarse sin permiso de los padres y actuar con plena capacidad jurídica. Antes, la ley exige consentimiento de padres o tutores para actos importantes. El DNI es obligatorio desde los 14 años y las relaciones laborales pueden comenzar a los 16 con autorización paterna.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg/640px-Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg' },
      { title: 'Derecho a la Educación', summary: 'Enseñanza básica (6-16 años) obligatoria y gratuita.', detail: 'La enseñanza básica comprende Educación Primaria (6-12 años) y ESO (12-16 años), ambas obligatorias y gratuitas. El Bachillerato y la FP no son obligatorios pero son gratuitos en centros públicos. La educación universitaria tiene tasas, aunque existen becas. La educación es competencia de cada Comunidad Autónoma.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Universidad_de_Salamanca_-_fachada_rica.jpg?width=640' },
      { title: 'Derecho a la Sanidad', summary: 'Atención sanitaria pública y gratuita para todos los residentes.', detail: 'El Sistema Nacional de Salud cubre a todos los residentes con derecho reconocido. La tarjeta sanitaria (TSI) da acceso al médico de cabecera, especialistas y urgencias. Se solicita en el Centro de Salud presentando el DNI/NIE y el certificado de empadronamiento. Cada CCAA gestiona su propio sistema sanitario.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Recinte_Modernista_de_Sant_Pau_02.jpg?width=640' },
      { title: 'Secreto de Comunicaciones', summary: 'Comunicaciones privadas protegidas — solo intervenibles con orden judicial.', detail: 'El artículo 18.3 de la Constitución protege el secreto de las comunicaciones postales, telegráficas y telefónicas. Solo un juez puede ordenar la intervención. Ninguna autoridad (ni policía ni gobierno) puede interceptarlas sin autorización judicial. Esta garantía se extiende también a las comunicaciones digitales (emails, mensajería).', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg/640px-Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg' },
      { title: 'Participación Política', summary: 'Sufragio universal, libre, igual, directo y secreto desde los 18 años.', detail: 'El derecho al voto se ejerce en elecciones generales (Estado), autonómicas (CCAAs) y locales (municipios). Los ciudadanos de la UE residentes en España pueden votar en elecciones municipales y europeas, pero NO en las generales ni autonómicas. Los ciudadanos también pueden participar mediante referéndums y el ejercicio del derecho de petición.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Subdivisions_of_Spain_with_coats_of_arms.png/640px-Subdivisions_of_Spain_with_coats_of_arms.png' },
      { title: 'Fuerzas Armadas', summary: 'Ejército profesional desde 2001. Servicio militar voluntario.', detail: 'Las Fuerzas Armadas españolas se componen del Ejército de Tierra, la Armada y el Ejército del Aire y del Espacio. El servicio militar obligatorio fue suprimido en España en el año 2001. El Rey es el Jefe Supremo de las Fuerzas Armadas. España es miembro de la OTAN desde 1982 y participa en misiones internacionales de paz.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Guardia_Civil_en_el_desfile_del_12_de_Octubre_de_2010.jpg?width=640' },
    ],
    proTip: 'Los ciudadanos de la UE residentes en España pueden votar en las elecciones municipales y europeas, pero NO en las elecciones generales ni autonómicas.',
    mistakes: 'La educación obligatoria termina a los 16 años (ESO), NO a los 18. El servicio militar NO es obligatorio en España actualmente. Casarse en España actualmente requiere ser mayor de edad (18 años), tras la reforma del Código Civil de 2015.',
    gifs: [
      { url: 'https://media.giphy.com/media/jVHjDT1XZaGK6b931O/giphy.gif', caption: 'La bandera de España — símbolo de la nación y sus derechos constitucionales', emoji: '🇪🇸' },
    ],
    challenges: [
      // ── Official PDF — Tarea 2 ──
      {
        type: 'checkbox',
        question: 'Se garantiza el secreto de las comunicaciones de los españoles, salvo resolución judicial.',
        options: [{ text: 'Verdadero', correct: true }, { text: 'Falso', correct: false }],
        explanation: 'El artículo 18.3 de la Constitución garantiza el secreto de las comunicaciones (postal, telegráfica, telefónica...). Solo se puede intervenir una comunicación privada con autorización judicial expresa. Ninguna autoridad puede hacerlo sin orden del juez.',
      },
      {
        type: 'checkbox',
        question: 'La atención sanitaria es gratuita.',
        options: [{ text: 'Verdadero', correct: true }, { text: 'Falso', correct: false }],
        explanation: 'España tiene un sistema de salud público y universal. La atención en hospitales, centros de salud y urgencias es gratuita para todos los residentes con derecho a asistencia sanitaria. Está financiada mediante impuestos y cotizaciones a la Seguridad Social.',
      },
      {
        type: 'checkbox',
        question: 'La Educación Primaria (de 6 a 12 años) es obligatoria y gratuita.',
        options: [{ text: 'Verdadero', correct: true }, { text: 'Falso', correct: false }],
        explanation: 'La Educación Primaria (6-12 años) es efectivamente obligatoria y gratuita en España. Además, también lo es la Educación Secundaria Obligatoria (ESO, 12-16 años). En total, la enseñanza básica obligatoria va de los 6 a los 16 años en centros públicos.',
      },
      // ── Additional questions ──
      {
        type: 'dropdown',
        parts: ['Los españoles son mayores de edad a los ', { options: ['16 años', '18 años', '21 años'], answer: '18 años' }, ' y la educación básica obligatoria termina a los ', { options: ['14 años', '16 años', '18 años'], answer: '16 años' }, '.'],
        explanation: 'En España, la mayoría de edad se alcanza a los 18 años (para votar, contraer matrimonio sin autorización, actuar en juicio...). La enseñanza básica —Primaria y ESO— es obligatoria y gratuita hasta los 16 años.',
      },
      {
        type: 'dragdrop',
        wordBank: ['tributario', 'equitativo', 'público'],
        parts: ['Todos contribuirán al sostenimiento de los gastos ', { answer: 'público' }, 's de acuerdo con su capacidad económica mediante un sistema ', { answer: 'tributario' }, ' justo e ', { answer: 'equitativo' }, '.'],
        explanation: 'El artículo 31 de la Constitución establece el deber de contribuir al gasto público. El sistema fiscal español aplica el principio de progresividad: quien más gana, más paga. Esto se plasma en impuestos como el IRPF (Impuesto sobre la Renta de las Personas Físicas).',
      },
      {
        type: 'checkbox',
        question: '2031. La enseñanza básica en España es obligatoria y gratuita.',
        options: [{ text: 'Verdadero', correct: true }, { text: 'Falso', correct: false }],
        explanation: 'La enseñanza básica (Primaria, de 6 a 12 años, y ESO, de 12 a 16 años) es obligatoria y gratuita en los centros públicos españoles. El Estado financia la escolarización para garantizar que ningún niño quede fuera del sistema educativo por razones económicas.',
      },
      {
        type: 'checkbox',
        question: 'Los ciudadanos de la UE residentes en España pueden votar en las elecciones...',
        options: [{ text: 'Generales.', correct: false }, { text: 'Municipales.', correct: true }, { text: 'Autonómicas.', correct: false }],
        explanation: 'Los ciudadanos europeos residentes en España pueden votar en las elecciones municipales (Ayuntamientos) y europeas (Parlamento Europeo). Sin embargo, para votar en elecciones generales o autonómicas se requiere tener la nacionalidad española.',
      },
      {
        type: 'checkbox',
        question: '¿Es obligatorio el servicio militar en España en la actualidad?',
        options: [{ text: 'Sí, para hombres y mujeres.', correct: false }, { text: 'Sí, solo para hombres.', correct: false }, { text: 'No, el ejército es profesional.', correct: true }],
        explanation: 'El servicio militar obligatorio fue suspendido en España en 2001. Actualmente las Fuerzas Armadas son totalmente profesionales y voluntarias, abiertas tanto a hombres como a mujeres. España mantuvo la mili hasta los 31 años de vigencia desde la Constitución de 1978.',
      },
      {
        type: 'checkbox',
        question: '2010. Los extranjeros en España tienen los mismos derechos que los españoles...',
        options: [{ text: 'en todos los casos.', correct: false }, { text: 'en los términos que establezcan los tratados y la ley.', correct: true }, { text: 'solo si proceden de la Unión Europea.', correct: false }],
        explanation: 'El artículo 13 de la Constitución establece que los extranjeros en España gozarán de los derechos y libertades que garantiza el Título I "en los términos que establezcan los tratados y la ley". Algunos derechos (como el voto en generales) son exclusivos de los españoles.',
      },
      {
        type: 'dropdown',
        parts: ['En España no hay una religión oficial del Estado. España es un Estado ', { options: ['Aconfesional', 'Católico', 'Laico'], answer: 'Aconfesional' }, '.'],
        explanation: 'El artículo 16.3 de la Constitución establece que "ninguna confesión tendrá carácter estatal", aunque reconoce las relaciones de cooperación con la Iglesia Católica y demás confesiones. España es aconfesional: el Estado no practica ninguna religión, aunque respeta y coopera con ellas.',
      },
      {
        type: 'checkbox',
        question: '2033. En España, los ciudadanos pueden desplazarse libremente por todo el territorio nacional.',
        options: [{ text: 'Verdadero', correct: true }, { text: 'Falso', correct: false }],
        explanation: 'El artículo 19 de la Constitución garantiza el derecho de los españoles a elegir libremente su residencia y a circular por el territorio nacional. También tienen derecho a entrar y salir libremente de España, en los términos que establezca la ley.',
      },
      {
        type: 'checkbox',
        question: '¿Cuántos senadores tiene el Senado de España, aproximadamente?',
        options: [{ text: 'Menos de 100.', correct: false }, { text: 'Más de 250.', correct: true }, { text: 'Exactamente 350.', correct: false }],
        explanation: 'El Senado español tiene alrededor de 265 senadores: unos 208 son elegidos directamente por los ciudadanos (4 por provincia, más los de Ceuta y Melilla) y el resto son designados por las Asambleas de las Comunidades Autónomas. El número puede variar ligeramente.',
      },
      {
        type: 'checkbox',
        question: 'El derecho a la huelga en España está...',
        options: [{ text: 'prohibido por la Constitución.', correct: false }, { text: 'reconocido constitucionalmente como derecho fundamental.', correct: true }, { text: 'solo permitido en el sector privado.', correct: false }],
        explanation: 'El artículo 28.2 de la Constitución reconoce el derecho a la huelga de los trabajadores para la defensa de sus intereses. Es un derecho fundamental aplicable tanto en el sector privado como en el público, aunque en servicios esenciales se deben mantener servicios mínimos.',
      },
      {
        type: 'checkbox',
        question: '¿Cuál de los siguientes es un DEBER establecido por la Constitución española?',
        options: [{ text: 'Tener un trabajo remunerado.', correct: false }, { text: 'Contribuir al sostenimiento de los gastos públicos.', correct: true }, { text: 'Inscribirse en un partido político.', correct: false }],
        explanation: 'La Constitución establece como deber de todos los ciudadanos el contribuir al sostenimiento de los gastos públicos mediante un sistema tributario justo (art. 31). Otros deberes constitucionales incluyen defender a España (art. 30) y conocer el castellano (art. 3).',
      },
    ],
  },
  {
    id: 3,
    title: 'Organización territorial y geografía',
    emoji: '🗺️',
    color: '#58CC02',
    bg: 'bg-[#58CC02]',
    border: 'border-[#58CC02]',
    shadow: '4px 4px 0 #58CC02',
    heroImage: 'https://images.unsplash.com/photo-1694961585324-2e1162cc45f8?w=900&h=350&fit=crop&auto=format',
    theory: `<p style="font-size:0.82rem;color:#1A1A2E;line-height:1.6;margin:0 0 0.75rem 0">España se organiza en ${_badge('17 Comunidades Autónomas', 88, 204, 2)}, ${_badge('50 Provincias', 88, 204, 2)} y miles de municipios. Cada nivel tiene su propio gobierno y competencias.</p>${_h('Organización Territorial')}${_grid(`${_card(ICO_BUILDING, '#58CC02', 'Municipios', 'El nivel más cercano al ciudadano, gobernado por el Ayuntamiento y su Alcalde.')}${_card(ICO_MAPPIN, '#58CC02', 'Comunidades', 'Las 17 CCAAs tienen su propio Parlamento y Estatuto de Autonomía. Ceuta y Melilla son Ciudades Autónomas.')}${_card(ICO_MOUNTAIN, '#1CB0F6', 'Geografía', 'Gran meseta central, tres mares (Atlántico, Cantábrico, Mediterráneo) y dos archipiélagos.')}`)}<div style="margin-top:0.75rem">${_bar(ICO_SUN, '#58CC02', `Los picos más altos: ${_badge('Teide 3.718m', 88, 204, 2)} (Canarias) y ${_badge('Mulhacén 3.479m', 88, 204, 2)} (Sierra Nevada, Andalucía).`)}</div>${_h('Principales Ríos')}<div style="display:flex;flex-direction:column;gap:0.4rem">${_li(ICO_WAVES, '#1CB0F6', '<strong>Ebro</strong> — El único gran río que desemboca en el <em>Mediterráneo</em>.')}${_li(ICO_WAVES, '#1CB0F6', '<strong>Tajo, Duero, Guadiana, Guadalquivir</strong> — Desembocan en el <em>Atlántico</em>.')}${_h('Archipiélagos')}${_li(ICO_SUN, '#58CC02', '<strong>Islas Canarias</strong> — Frente a África. Clima subtropical. Canarias está <strong>una hora menos</strong> que la Península.')}${_li(ICO_WAVES, '#1CB0F6', '<strong>Islas Baleares</strong> — En el Mediterráneo. Incluye Mallorca, Menorca e Ibiza.')}</div>`,
    steps: [
      { title: 'Comunidades Autónomas', summary: '17 CCAAs + 2 Ciudades Autónomas. Cada una con su Estatuto de Autonomía.', detail: 'España tiene 17 Comunidades Autónomas y 2 Ciudades Autónomas: Ceuta y Melilla (en el norte de África). Cada comunidad tiene su propio Parlamento autonómico, Presidente y Estatuto de Autonomía (su "constitución" propia). Las competencias varían: algunas tienen policía propia (Mossos, Ertzaintza), otras ceden más a las Fuerzas del Estado.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Subdivisions_of_Spain_with_coats_of_arms.png/640px-Subdivisions_of_Spain_with_coats_of_arms.png' },
      { title: 'Provincias y Municipios', summary: '50 provincias y más de 8.000 municipios gobernados por Ayuntamientos.', detail: 'Las 50 provincias tienen sus Diputaciones Provinciales (excepto País Vasco y Navarra, que cuentan con Juntas Generales y Diputaciones Forales con régimen especial). Los municipios son gobernados por Ayuntamientos, encabezados por el Alcalde y los Concejales elegidos cada 4 años. En grandes ciudades hay Juntas de Distrito.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Plaza_Mayor_de_Madrid_06.jpg?width=640' },
      { title: 'Principales Ríos', summary: 'El Ebro es el único gran río que desemboca en el Mediterráneo.', detail: 'El Ebro (930 km) es el más caudaloso y desemboca en el Mediterráneo (Delta del Ebro). El Tajo es el más largo de la Península Ibérica (1.007 km) y desemboca en Lisboa (Atlántico). El Duero, Guadiana y Guadalquivir también desembocan en el Atlántico. El Guadalquivir es el único río navegable hasta Sevilla.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ebro_desde_el_Puente_de_Piedra.jpg?width=640' },
      { title: 'Montañas y Picos', summary: 'El Teide (3.718m) en Canarias es el pico más alto de España y del Atlántico.', detail: 'El Teide en Tenerife (Canarias) es el volcán activo más alto del Atlántico y el tercer volcán más grande del mundo sobre el nivel del mar. El Mulhacén (3.479 m) en Sierra Nevada (Granada, Andalucía) es el pico más alto de la Península. Los Pirineos separan España de Francia y Andorra.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Teide_national_park_view_from_mirador_de_la_ruleta.JPG?width=640' },
      { title: 'Archipiélagos', summary: 'Canarias (Atlántico) e Islas Baleares (Mediterráneo) — dos mundos distintos.', detail: 'Las Islas Canarias están frente a la costa de África (Marruecos y Mauritania), tienen clima subtropical y su huso horario es UTC+0 (una hora menos que la Península). Las Islas Baleares (Mallorca, Menorca, Ibiza, Formentera) están en el Mediterráneo y tienen clima mediterráneo. Ambas son comunidades autónomas uniprovinciales.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Subdivisions_of_Spain_with_coats_of_arms.png/640px-Subdivisions_of_Spain_with_coats_of_arms.png' },
      { title: 'Climas de España', summary: 'Cuatro zonas climáticas: mediterráneo, atlántico, continental y subtropical.', detail: 'El clima mediterráneo domina el litoral E y S (veranos secos y calurosos, inviernos suaves). El atlántico cubre el norte (Galicia, Cantabria, País Vasco): lluvioso y verde todo el año. El continental ocupa la Meseta Central: extremos térmicos, veranos calurosos e inviernos muy fríos. El subtropical cubre Canarias: temperaturas suaves todo el año.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Picos_de_Europa_-_Naranjo_de_Bulnes_03.jpg?width=640' },
    ],
    proTip: "La comunidad autónoma más grande es Castilla y León. La más poblada es Andalucía. La capital (Madrid) pertenece a la Comunidad de Madrid. El río Júcar desemboca en el Mediterráneo, no el Tajo.",
    showMap: true,
    gifs: [
      { url: 'https://media.giphy.com/media/WT465ovvyyhLCr2r6X/giphy.gif', caption: 'El Teide en Tenerife — el pico más alto de España y del Atlántico (3.718 m)', emoji: '🌋' },
    ],
    challenges: [
      // ── Official PDF — Tarea 3 ──
      {
        type: 'checkbox',
        question: 'Canarias tiene un clima...',
        options: [{ text: 'mediterráneo.', correct: false }, { text: 'atlántico.', correct: false }, { text: 'subtropical.', correct: true }],
        explanation: 'Las Islas Canarias tienen un clima subtropical, caracterizado por temperaturas suaves y estables todo el año (entre 18°C y 26°C), escasas precipitaciones y ausencia de heladas. Esta condición se debe a su latitud (28° N), cercana al Trópico de Cáncer, y a la influencia del alisio atlántico.',
      },
      {
        type: 'checkbox',
        question: '¿Cuál de estos ríos desemboca en el mar Mediterráneo?',
        options: [{ text: 'El Tajo.', correct: false, specificFeedback: 'El Tajo es el río más largo de la Península, pero desemboca en el Atlántico, en Lisboa (Portugal). Solo el Ebro y el Júcar desembocan en el Mediterráneo.' }, { text: 'El Guadalquivir.', correct: false, specificFeedback: 'El Guadalquivir desemboca en el Atlántico, en Sanlúcar de Barrameda (Cádiz). Es el único gran río navegable de España hasta Sevilla.' }, { text: 'El Júcar.', correct: true }],
        explanation: 'El río Júcar nace en la Serranía de Cuenca y desemboca en el mar Mediterráneo, cerca de Cullera (Valencia). El Tajo desemboca en el Atlántico (Lisboa, Portugal) y el Guadalquivir también en el Atlántico (Sanlúcar de Barrameda, Cádiz). El Ebro es el más caudaloso que desemboca en el Mediterráneo.',
      },
      // ── Map Pin Challenges ──
      {
        type: 'map_pin',
        targetId: 'andalucia',
        targetName: 'Andalucía',
        explanation: 'Andalucía es la comunidad autónoma más poblada de España (más de 8 millones de habitantes) y la segunda más grande. Capital: Sevilla. Incluye ciudades como Granada (Alhambra), Córdoba (Mezquita) y Málaga (Costa del Sol). El Guadalquivir es su río principal.',
      },
      {
        type: 'map_pin',
        targetId: 'cataluna',
        targetName: 'Cataluña',
        explanation: 'Cataluña (Catalunya en catalán) es una comunidad autónoma del noreste de España. Capital: Barcelona. Tiene lengua cooficial propia (el catalán). Es una de las regiones más industriales y económicamente activas de España. Limita con Francia y Andorra al norte.',
      },
      {
        type: 'map_pin',
        targetId: 'madrid',
        targetName: 'Comunidad de Madrid',
        explanation: 'La Comunidad de Madrid es la región donde se encuentra la capital del Estado, Madrid. Aunque es la más pequeña de las comunidades del interior, es la más densamente poblada. Madrid es sede del Gobierno, las Cortes Generales, el Tribunal Constitucional y la Jefatura del Estado.',
      },
      {
        type: 'map_pin',
        targetId: 'galicia',
        targetName: 'Galicia',
        explanation: 'Galicia es una comunidad autónoma del noroeste de España con lengua cooficial propia, el gallego. Capital: Santiago de Compostela, famosa por ser el destino del Camino de Santiago. Tiene un clima atlántico húmedo y abundante costa (Rías Gallegas). Es la región más septentrional del Atlántico peninsular.',
      },
      // ── Additional knowledge questions ──
      {
        type: 'checkbox',
        question: '¿Cuántas Comunidades Autónomas hay en España?',
        options: [{ text: '15', correct: false }, { text: '17', correct: true }, { text: '19', correct: false }],
        explanation: 'España está dividida en 17 Comunidades Autónomas y 2 Ciudades Autónomas (Ceuta y Melilla). Las comunidades autónomas tienen sus propios parlamentos, presidentes y competencias en materias como sanidad, educación o cultura. El sistema autonómico fue establecido por la Constitución de 1978.',
      },
      {
        type: 'checkbox',
        question: '¿Cuál es la Comunidad Autónoma más grande de España en extensión?',
        options: [{ text: 'Andalucía.', correct: false }, { text: 'Castilla y León.', correct: true }, { text: 'Aragón.', correct: false }],
        explanation: 'Castilla y León es la mayor región de España con 94.224 km², lo que la convierte también en la mayor región de la Unión Europea. Está formada por 9 provincias. Su capital es Valladolid. Andalucía es la más poblada, y Aragón es la tercera en extensión.',
      },
      {
        type: 'checkbox',
        question: '¿Cuántas provincias tiene España?',
        options: [{ text: '47', correct: false }, { text: '50', correct: true }, { text: '52', correct: false }],
        explanation: 'España está dividida en 50 provincias, a las que hay que sumar las ciudades autónomas de Ceuta y Melilla (sin rango de provincia). Las provincias son la circunscripción electoral básica para las elecciones generales y tienen su propio órgano de gobierno (Diputación Provincial).',
      },
      {
        type: 'checkbox',
        question: '3004. ¿Cómo se llama la extensa llanura situada en el centro de la Península Ibérica?',
        options: [{ text: 'Meseta.', correct: true }, { text: 'Cordillera.', correct: false }, { text: 'Marisma.', correct: false }],
        explanation: 'La Meseta Central es la gran planicie que ocupa el centro de la Península Ibérica, a una altitud media de 600-700 metros. Está dividida en Submeseta Norte (Castilla y León) y Submeseta Sur (Castilla-La Mancha, Madrid). El Sistema Central la divide.',
      },
      {
        type: 'checkbox',
        question: 'El río más caudaloso de España, que desemboca en el Mediterráneo, es el...',
        options: [{ text: 'Tajo.', correct: false }, { text: 'Duero.', correct: false }, { text: 'Ebro.', correct: true }],
        explanation: 'El río Ebro es el más caudaloso de España y el único gran río que desemboca en el Mediterráneo (Delta del Ebro, Tarragona). Nace en Fontibre (Cantabria) y recorre 930 km. El Tajo es el más largo de la Península, pero desemboca en Lisboa (Atlántico).',
      },
      {
        type: 'checkbox',
        question: 'El pico más alto de España, el Teide, se encuentra en...',
        options: [{ text: 'Canarias.', correct: true }, { text: 'Andalucía.', correct: false }, { text: 'Aragón.', correct: false }],
        explanation: 'El Teide (3.718 m) en la isla de Tenerife (Canarias) es el pico más alto de España y de todo el océano Atlántico. Es un volcán activo y Parque Nacional. El pico más alto de la Península es el Mulhacén (3.479 m) en Sierra Nevada (Granada, Andalucía).',
      },
      {
        type: 'dropdown',
        parts: ['La capital de la comunidad autónoma de Galicia es ', { options: ['A Coruña', 'Vigo', 'Santiago de Compostela'], answer: 'Santiago de Compostela' }, '.'],
        explanation: 'Santiago de Compostela es la capital de Galicia, aunque A Coruña es la ciudad más poblada y Vigo la mayor económicamente. Santiago es mundialmente conocida como destino del Camino de Santiago, peregrinación medieval de enorme importancia histórica y cultural.',
      },
      {
        type: 'checkbox',
        question: 'Ceuta y Melilla son...',
        options: [{ text: 'islas españolas en el Mediterráneo.', correct: false }, { text: 'ciudades autónomas españolas en el norte de África.', correct: true }, { text: 'provincias de Andalucía.', correct: false }],
        explanation: 'Ceuta y Melilla son las dos ciudades autónomas españolas ubicadas en el norte del continente africano, en la costa del Mediterráneo. Hacen frontera con Marruecos. Junto con las Islas Canarias, forman el territorio español que no está en la Península Ibérica.',
      },
      {
        type: 'dragdrop',
        wordBank: ['Estatuto de Autonomía', 'Constitución', 'Reglamento'],
        parts: ['La ley más importante de cada comunidad autónoma es el ', { answer: 'Estatuto de Autonomía' }, ', pero todos deben respetar la ', { answer: 'Constitución' }, ' española.'],
        explanation: 'El Estatuto de Autonomía es la norma institucional básica de cada Comunidad Autónoma: define sus instituciones, competencias y límites. Pero la Constitución española de 1978 es la norma suprema de todo el ordenamiento jurídico, y cualquier estatuto debe ser compatible con ella.',
      },
    ],
  },
  {
    id: 4,
    title: 'Cultura e historia de España',
    emoji: '🎨',
    color: '#CE82FF',
    bg: 'bg-[#CE82FF]',
    border: 'border-[#CE82FF]',
    shadow: '4px 4px 0 #CE82FF',
    heroImage: 'https://images.unsplash.com/photo-1533854257392-71c5ff28dff7?w=900&h=350&fit=crop&auto=format',
    theory: `<p style="font-size:0.82rem;color:#1A1A2E;line-height:1.6;margin:0 0 0.75rem 0">España es el ${_badge('3er país con más Patrimonio UNESCO', 206, 130, 255)}, con siglos de historia que mezclan culturas cristiana, judía y musulmana.</p>${_h('Patrimonio Cultural')}${_grid(`${_card(ICO_BOOKOPEN, '#CE82FF', 'Literatura', 'Cervantes (Don Quijote), Lope de Vega, García Lorca, Juan Ramón Jiménez (Nobel 1956), Camilo José Cela (Nobel 1989).')}${_card(ICO_PALETTE, '#CE82FF', 'Arte', 'Velázquez (Las Meninas), Goya, Picasso (Guernica), Dalí y Miró — maestros universales.')}${_card(ICO_MUSIC, '#CE82FF', 'Música y Cine', 'Flamenco (Patrimonio UNESCO), zarzuela, y el cine de Pedro Almodóvar.')}`)}<div style="margin-top:0.75rem">${_bar(ICO_GLOBE, '#CE82FF', `<strong>Lenguas de España:</strong> El castellano es oficial en todo el territorio. También son cooficiales: ${_badge('catalán', 206, 130, 255)}, ${_badge('valenciano', 206, 130, 255)}, ${_badge('gallego', 206, 130, 255)} y ${_badge('euskera', 206, 130, 255)}.`)}</div>${_h('Cronología Histórica')}<div style="display:flex;flex-direction:column;gap:0.4rem">${_li(ICO_CLOCK, '#CE82FF', '<strong>711–1492</strong> — <em>Al-Ándalus</em>: convivencia de las tres culturas en la Edad Media.')}${_li(ICO_CLOCK, '#CE82FF', '<strong>1492</strong> — Colón llega a América y termina la Reconquista (caída de Granada).')}${_li(ICO_CLOCK, '#CE82FF', '<strong>Siglos XVI–XVII</strong> — <em>Siglo de Oro</em>: cumbre literaria y artística.')}${_li(ICO_CHECK, '#CE82FF', '<strong>1986</strong> — España entra en la Unión Europea.')}</div>`,
    steps: [
      { title: 'Literatura', summary: 'Cervantes, Lorca y dos Premios Nobel: Cela (1989) y Aleixandre (1977).', detail: 'Miguel de Cervantes escribió Don Quijote de la Mancha (1605 y 1615), considerada la primera novela moderna y la obra más traducida después de la Biblia. Federico García Lorca fue poeta y dramaturgo (La Casa de Bernarda Alba). Los Premios Nobel de Literatura españoles: Vicente Aleixandre (1977) y Camilo José Cela (1989). También destacan Mercè Rodoreda, que escribía en catalán.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Cervantes_J%C3%A1uregui.jpg/480px-Cervantes_J%C3%A1uregui.jpg' },
      { title: 'Pintura', summary: 'Velázquez (Prado), Goya (Prado), Picasso (Reina Sofía) y Dalí.', detail: 'Diego Velázquez (1599–1660) pintó Las Meninas (1656), conservada en el Museo del Prado. Francisco de Goya (1746–1828) pintó Los fusilamientos del 3 de mayo, también en el Prado. Pablo Picasso pintó el Guernica (1937) como protesta al bombardeo de la ciudad vasca; hoy en el Museo Reina Sofía de Madrid. Salvador Dalí fundó el surrealismo español.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg/480px-Las_Meninas%2C_by_Diego_Vel%C3%A1zquez%2C_from_Prado_in_Google_Earth.jpg' },
      { title: 'Fiestas Populares', summary: 'Fallas (Valencia, UNESCO), Sanfermines (Pamplona) y Semana Santa.', detail: 'Las Fallas de Valencia (marzo, Patrimonio UNESCO 2016) son esculturas de madera y cartón que se queman la noche del 19 de marzo. Los Sanfermines (Pamplona, 6–14 de julio) son famosos por el encierro de toros. La Tomatina (Buñol, agosto) es la batalla de tomates más grande del mundo. La Semana Santa de Sevilla, Granada y Valladolid son Patrimonio de Interés Turístico.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Encierro_en_Pamplona_en_2007.jpg/640px-Encierro_en_Pamplona_en_2007.jpg' },
      { title: 'Historia Reciente', summary: 'Franquismo → Transición → Constitución 1978 → UE 1986 → año olímpico 1992.', detail: 'El franquismo (1939–1975) fue la dictadura de Francisco Franco tras la Guerra Civil. La Transición democrática (1975–1982) transformó España en una democracia parlamentaria con la Constitución de 1978 (aprobada por referéndum el 6 de diciembre, Día de la Constitución). En 1986 España entró en la CEE (actual UE). En 1992: Exposición Universal en Sevilla y Juegos Olímpicos en Barcelona.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg/640px-Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg' },
      { title: 'Lenguas de España', summary: 'Castellano (oficial en todo el país) + 4 lenguas cooficiales regionales.', detail: 'El castellano (español) es la única lengua oficial en todo el territorio nacional. También son cooficiales en sus comunidades: el catalán (Cataluña, Baleares), el valenciano (Comunidad Valenciana), el gallego (Galicia) y el euskera (País Vasco y parte de Navarra). El catalán, gallego y valenciano son lenguas romances; el euskera (vasco) es una lengua de origen desconocido, sin relación con las demás lenguas europeas.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Subdivisions_of_Spain_with_coats_of_arms.png/640px-Subdivisions_of_Spain_with_coats_of_arms.png' },
      { title: 'Arquitectura', summary: 'Gaudí, la Alhambra (UNESCO) y la Sagrada Família, aún en construcción.', detail: 'Antoni Gaudí (1852–1926) diseñó la Sagrada Família en Barcelona (en construcción desde 1882, Patrimonio UNESCO) y el Park Güell. La Alhambra de Granada (siglo XIII, sultanato nazarí) es el monumento más visitado de España. La Catedral de Burgos (Patrimonio UNESCO) es obra maestra del gótico. El Museo Guggenheim Bilbao (1997, Frank Gehry) renovó la arquitectura contemporánea española.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Sagrada_Familia_01.jpg/480px-Sagrada_Familia_01.jpg' },
    ],
    proTip: 'El Guernica de Picasso está en el Museo Reina Sofía (Madrid). Las Meninas de Velázquez están en el Museo del Prado. El 12 de octubre es el Día de la Hispanidad (Fiesta Nacional) y el 23 de abril es el Día del Libro (Sant Jordi en Cataluña).',
    gifs: [
      { url: 'https://media.giphy.com/media/j2e0rTwHU6qBTh9QON/giphy.gif', caption: 'El flamenco — Patrimonio Cultural Inmaterial de la Humanidad (UNESCO 2010)', emoji: '💃' },
    ],
    challenges: [
      // ── Official PDF — Tarea 4 ──
      {
        type: 'checkbox',
        question: '¿Qué tres culturas convivieron en la España medieval?',
        options: [{ text: 'La cristiana, la judía y la musulmana.', correct: true }, { text: 'La cristiana, la romana y la árabe.', correct: false }, { text: 'La visigoda, la romana y la árabe.', correct: false }],
        explanation: 'Durante la Edad Media (especialmente en Al-Ándalus), la Península Ibérica fue escenario de una singular convivencia de tres religiones y culturas: la cristiana, la judía y la musulmana. Este período de "convivencia" (con sus conflictos y sus intercambios) fue fundamental para la cultura, la ciencia y el arte medievales.',
      },
      {
        type: 'checkbox',
        question: '¿Qué escritora española escribe en otra lengua oficial de España?',
        options: [{ text: 'Ana María Matute.', correct: false }, { text: 'Mercè Rodoreda.', correct: true }, { text: 'Carmen Laforet.', correct: false }],
        explanation: 'Mercè Rodoreda (1908-1983) es la escritora catalana más reconocida internacionalmente. Escribió en catalán, lengua cooficial de Cataluña. Su novela más famosa, "La plaça del Diamant" (1962), es considerada una obra maestra de la literatura catalana del siglo XX.',
      },
      {
        type: 'checkbox',
        question: '¿Quién fue Clara Campoamor?',
        options: [{ text: 'Una defensora de los derechos de la mujer.', correct: true }, { text: 'Una pintora del siglo XX.', correct: false }, { text: 'La primera presidenta del Gobierno español.', correct: false }],
        explanation: 'Clara Campoamor (1888-1972) fue una política y abogada española que luchó por el sufragio femenino en España. Gracias a su ardua defensa en el debate parlamentario de 1931, las mujeres españolas obtuvieron el derecho al voto con la Constitución de la Segunda República. Es un símbolo del feminismo español.',
      },
      // ── Additional questions ──
      {
        type: 'checkbox',
        question: '4001. Los personajes principales de la novela el Quijote son don Quijote y...',
        options: [{ text: 'Sancho Panza.', correct: true }, { text: 'Don Juan.', correct: false }, { text: 'Doña Inés.', correct: false }],
        explanation: 'Don Quijote de la Mancha (1605 y 1615), escrita por Miguel de Cervantes, tiene como protagonistas al hidalgo Alonso Quijano (don Quijote) y su escudero Sancho Panza. Es la obra más leída en español y una de las más influyentes de la literatura universal. Es considerada la primera novela moderna.',
      },
      {
        type: 'checkbox',
        question: '4026. ¿En qué museo español puedes ver el cuadro Guernica de Picasso?',
        options: [{ text: 'Museo del Prado.', correct: false, specificFeedback: 'El Prado alberga Las Meninas (Velázquez) y Los fusilamientos (Goya), pero no el Guernica. El Guernica de Picasso está en el Museo Reina Sofía.' }, { text: 'Museo Reina Sofía.', correct: true }, { text: 'Museo Thyssen-Bornemisza.', correct: false, specificFeedback: 'El Thyssen alberga obras de maestros europeos e internacionales, pero el Guernica de Picasso se encuentra en el Museo Nacional Reina Sofía de Madrid.' }],
        explanation: 'El Guernica (1937) de Pablo Picasso es el cuadro más famoso del arte español contemporáneo. Pintado en protesta por el bombardeo de la ciudad vasca de Guernica durante la Guerra Civil, se encuentra en el Museo Nacional Centro de Arte Reina Sofía de Madrid. El Prado alberga Las Meninas.',
      },
      {
        type: 'checkbox',
        question: '4029. El 6 de diciembre se celebra en España...',
        options: [{ text: 'el Día de la Constitución.', correct: true }, { text: 'la llegada de Colón a América.', correct: false }, { text: 'el Día del Libro.', correct: false }],
        explanation: 'El 6 de diciembre es el Día de la Constitución en España, que conmemora la aprobación de la Constitución española de 1978 en referéndum. Es fiesta nacional. El 12 de octubre es el Día de la Hispanidad (llegada de Colón a América) y el 23 de abril el Día del Libro.',
      },
      {
        type: 'dropdown',
        parts: ['Las Fallas, unas de las fiestas más conocidas de España, se celebran en ', { options: ['Sevilla', 'Pamplona', 'Valencia'], answer: 'Valencia' }, '.'],
        explanation: 'Las Fallas de Valencia se celebran en marzo (especialmente el 15-19 de marzo, con la "Nit del Foc" y la "Cremà" final). Son enormes esculturas de madera y cartón que se queman la noche del 19 de marzo. Fueron declaradas Patrimonio Cultural Inmaterial de la Humanidad por la UNESCO en 2016.',
      },
      {
        type: 'dragdrop',
        wordBank: ['Velázquez', 'Goya', 'Dalí'],
        parts: ["El cuadro 'Las Meninas' fue pintado por ", { answer: 'Velázquez' }, " y los 'Fusilamientos del 3 de mayo' por ", { answer: 'Goya' }, '.'],
        explanation: 'Diego Velázquez (1599-1660) pintó Las Meninas (1656), una de las obras maestras de la pintura occidental, hoy en el Museo del Prado. Francisco de Goya (1746-1828) pintó Los fusilamientos del 3 de mayo (1814), un testimonio de la brutalidad de la guerra, también en el Prado.',
      },
      {
        type: 'checkbox',
        question: '¿En qué año ingresó España en la Comunidad Económica Europea (actual UE)?',
        options: [{ text: '1978', correct: false }, { text: '1986', correct: true }, { text: '1992', correct: false }],
        explanation: 'España firmó su adhesión a la Comunidad Económica Europea (CEE, actual Unión Europea) el 12 de junio de 1985 y se hizo efectiva el 1 de enero de 1986. Fue un paso fundamental para la modernización y apertura económica del país tras la Transición democrática.',
      },
      {
        type: 'checkbox',
        question: '¿Qué acontecimiento histórico importante se produjo en España en 1992?',
        options: [{ text: 'La Expo de Sevilla y los Juegos Olímpicos de Barcelona.', correct: true }, { text: 'La muerte de Francisco Franco.', correct: false }, { text: 'El ingreso de España en la UE.', correct: false }],
        explanation: 'El año 1992 fue histórico para España: se celebraron los Juegos Olímpicos en Barcelona (julio-agosto), la Exposición Universal de Sevilla (abril-octubre) y Madrid fue Capital Cultural Europea. Fue el año de mayor proyección internacional de la España democrática moderna.',
      },
      {
        type: 'checkbox',
        question: '¿Quién ganó el Premio Nobel de Literatura en 1989 representando a España?',
        options: [{ text: 'Federico García Lorca.', correct: false }, { text: 'Camilo José Cela.', correct: true }, { text: 'Juan Ramón Jiménez.', correct: false }],
        explanation: 'Camilo José Cela (1916-2002) ganó el Premio Nobel de Literatura en 1989. Su obra más célebre es "La familia de Pascual Duarte" (1942). Antes, Vicente Aleixandre lo ganó en 1977 y Juan Ramón Jiménez en 1956. García Lorca murió en 1936 durante la Guerra Civil sin llegar a recibir ningún Nobel.',
      },
      {
        type: 'checkbox',
        question: "El arquitecto Antoni Gaudí es especialmente conocido por sus obras en...",
        options: [{ text: 'Madrid.', correct: false }, { text: 'Barcelona.', correct: true }, { text: 'Sevilla.', correct: false }],
        explanation: 'Antoni Gaudí (1852-1926) es el arquitecto más famoso de España, conocido por su estilo modernista y orgánico. Sus principales obras están en Barcelona: la Sagrada Família (en construcción desde 1882), el Park Güell, la Casa Batlló y la Casa Milà (La Pedrera). Siete de sus obras son Patrimonio de la Humanidad.',
      },
      {
        type: 'checkbox',
        question: 'La Alhambra de Granada fue construida principalmente por...',
        options: [{ text: 'Los reyes católicos.', correct: false }, { text: 'Los romanos.', correct: false }, { text: 'Los reyes nazaríes (musulmanes).', correct: true }],
        explanation: 'La Alhambra de Granada es un conjunto palaciego y fortaleza construido principalmente por los sultanes de la dinastía nazarí entre los siglos XIII y XIV. Es el monumento árabe mejor conservado de Occidente y fue declarado Patrimonio de la Humanidad en 1984. Los Reyes Católicos añadieron posteriormente el Palacio de Carlos V.',
      },
      {
        type: 'checkbox',
        question: '¿Qué fiesta se celebra en Pamplona en julio, famosa por sus encierros?',
        options: [{ text: 'La Feria de Abril.', correct: false }, { text: 'Los Sanfermines.', correct: true }, { text: 'La Tomatina.', correct: false }],
        explanation: 'Los Sanfermines se celebran en Pamplona del 6 al 14 de julio en honor a San Fermín, patrón de la ciudad. El acto más famoso es el encierro: los toros recorren las calles de la ciudad, seguidos por corredores. Fue popularizado internacionalmente por la novela "Fiesta" de Ernest Hemingway (1926).',
      },
      // ── Memory Association Exercises ──
      {
        type: 'matching',
        prompt: '🎨 Conecta cada artista con su obra maestra',
        pairs: [
          { left: 'Cervantes', right: 'Don Quijote de la Mancha' },
          { left: 'Velázquez', right: 'Las Meninas' },
          { left: 'Goya', right: 'Los fusilamientos del 3 de mayo' },
          { left: 'Picasso', right: 'Guernica' },
        ],
        wrongHint: 'Recuerda: Las Meninas y Los fusilamientos son cuadros pintados; el Don Quijote es una novela escrita; el Guernica es la denuncia de una guerra.',
        explanation: 'Cervantes (s. XVII) escribió el Don Quijote, la primera novela moderna, considerada la obra cumbre de la lengua española. Velázquez y Goya son los grandes maestros del Prado (s. XVII–XVIII). Picasso pintó el Guernica en 1937 como protesta al bombardeo de la ciudad vasca; hoy está en el Museo Reina Sofía de Madrid.',
      },
      {
        type: 'matching',
        prompt: '🏛️ Conecta cada figura cultural con su época o movimiento',
        pairs: [
          { left: 'Cervantes', right: 'Siglo de Oro' },
          { left: 'Gaudí', right: 'Modernismo' },
          { left: 'García Lorca', right: 'Generación del 27' },
          { left: 'Dalí', right: 'Surrealismo' },
        ],
        wrongHint: 'El Siglo de Oro es literatura del s. XVI–XVII (Cervantes, Lope). El Modernismo es arquitectura del s. XIX–XX (Gaudí). La Generación del 27 son poetas de entreguerras (Lorca). El Surrealismo es vanguardia de los años 20–30 (Dalí).',
        explanation: 'El Siglo de Oro (ss. XVI–XVII) fue la cumbre literaria y artística de España: Cervantes, Lope de Vega, Quevedo. El Modernismo arquitectónico de Gaudí transformó Barcelona. La Generación del 27 fue un brillante grupo de poetas (Lorca, Alberti, Aleixandre). Dalí, junto con Buñuel y Miró, situó a España en la vanguardia surrealista internacional.',
      },
      {
        type: 'matching',
        prompt: '🗺️ Conecta cada figura con su ciudad o región de origen',
        pairs: [
          { left: 'Gaudí', right: 'Barcelona (Cataluña)' },
          { left: 'García Lorca', right: 'Granada (Andalucía)' },
          { left: 'Velázquez', right: 'Sevilla (Andalucía)' },
          { left: 'Goya', right: 'Fuendetodos (Aragón)' },
        ],
        wrongHint: 'Gaudí vivió y trabajó en Barcelona toda su vida. Lorca nació y amó Granada. Velázquez se formó en Sevilla antes de ir a Madrid. Goya nació en el pequeño pueblo aragonés de Fuendetodos.',
        explanation: 'Antoni Gaudí nació en Reus y desarrolló toda su obra en Barcelona. García Lorca nació en Fuente Vaqueros (Granada) y la Andalucía de su infancia impregna toda su poesía. Diego Velázquez nació en Sevilla, donde se formó antes de llegar a la corte de Madrid. Francisco de Goya nació en Fuendetodos, un pequeño pueblo de Aragón.',
      },
      {
        type: 'matching',
        prompt: '🎉 Conecta cada fiesta popular con su ciudad',
        pairs: [
          { left: 'Las Fallas', right: 'Valencia' },
          { left: 'Los Sanfermines', right: 'Pamplona' },
          { left: 'La Feria de Abril', right: 'Sevilla' },
          { left: 'La Tomatina', right: 'Buñol' },
        ],
        wrongHint: 'Las Fallas son en Valencia (fuego). Los Sanfermines son en Pamplona (toros). La Feria de Abril es en Sevilla (flamenco). La Tomatina es en Buñol, un pueblo valenciano (tomates).',
        explanation: 'Las Fallas (Valencia, marzo, UNESCO) queman esculturas de cartón el 19 de marzo. Los Sanfermines (Pamplona, 6–14 julio) incluyen el famoso encierro de toros. La Feria de Abril (Sevilla) es la gran fiesta andaluza, con trajes de flamenca y casetas. La Tomatina (Buñol, Valencia, último miércoles de agosto) es la mayor batalla de tomates del mundo.',
      },
      // ── Visual Scenario Challenges ──
      {
        type: 'visual_scenario',
        scene: {
          emoji: '🎭',
          title: 'El Gran Teatro del Siglo de Oro',
          setting: 'Un teatro del s. XVII rebosa de público. Las velas iluminan el escenario.',
          stageBg: 'linear-gradient(160deg, #2d1b4e 0%, #1a0a2e 60%, #3d1f6e 100%)',
          bgEmojis: ['🕯️', '🎭', '🎶', '👑', '🕯️'],
          dropZoneLabel: 'Arrastra aquí al dramaturgo',
          successEmoji: '✍️',
          successText: '¡Correcto! Lope de Vega fue el mayor dramaturgo del Siglo de Oro español.',
        },
        answer: 'Lope de Vega',
        distractors: ['Cervantes', 'Goya'],
        wrongHint: 'El gran dramaturgo del teatro barroco español fue Lope de Vega, autor de más de 400 obras. Cervantes es el novelista del Don Quijote; Goya es el pintor aragonés.',
        explanation: 'Lope de Vega (1562–1635) fue el creador del teatro nacional español, con obras como Fuente Ovejuna. Su contemporáneo Calderón de la Barca también brilló en este período llamado el Siglo de Oro.',
      },
      {
        type: 'visual_scenario',
        scene: {
          emoji: '🖼️',
          title: 'El Taller del Pintor Real',
          setting: 'El Real Alcázar de Madrid, 1656. Un lienzo enorme espera al maestro.',
          stageBg: 'linear-gradient(160deg, #3d2a1a 0%, #1a1008 60%, #5c3d22 100%)',
          bgEmojis: ['🖌️', '🎨', '👸', '🐶', '🖼️'],
          dropZoneLabel: 'Arrastra aquí al pintor de Las Meninas',
          successEmoji: '🖌️',
          successText: '¡Brillante! Velázquez pintó Las Meninas, la obra maestra del Prado.',
        },
        answer: 'Velázquez',
        distractors: ['Goya', 'Dalí'],
        wrongHint: 'Las Meninas (1656) es obra de Diego Velázquez, pintor de la corte de Felipe IV. Goya es del s. XVIII; Dalí es del s. XX.',
        explanation: 'Diego Velázquez (1599–1660) es considerado el mayor pintor español. Las Meninas, expuesta en el Museo del Prado, retrata a la infanta Margarita rodeada de sus damas de honor, con el propio Velázquez visible en el lienzo.',
      },
      {
        type: 'visual_scenario',
        scene: {
          emoji: '⚔️',
          title: 'La Llanura de La Mancha',
          setting: 'Un paisaje castellano seco y dorado. Molinos de viento giran en el horizonte.',
          stageBg: 'linear-gradient(160deg, #7a5c00 0%, #4a3800 60%, #c49200 100%)',
          bgEmojis: ['🌾', '⚔️', '🐴', '💨', '☀️'],
          dropZoneLabel: 'Arrastra al autor del Ingenioso Hidalgo',
          successEmoji: '📖',
          successText: '¡Exacto! Cervantes creó a Don Quijote en esta tierra manchega.',
        },
        answer: 'Cervantes',
        distractors: ['Lope de Vega', 'García Lorca'],
        wrongHint: 'El Ingenioso Hidalgo Don Quijote de la Mancha fue escrito por Miguel de Cervantes. Lope de Vega escribía teatro; García Lorca es un poeta del s. XX.',
        explanation: 'Miguel de Cervantes (1547–1616) publicó Don Quijote en dos partes (1605 y 1615). Ambientada en La Mancha, es considerada la primera novela moderna y la obra más importante de la lengua española.',
      },
    ],
  },
  {
    id: 5,
    title: 'Sociedad y trámites',
    emoji: '🥘',
    color: '#FFC800',
    bg: 'bg-[#FFC800]',
    border: 'border-[#FFC800]',
    shadow: '4px 4px 0 #FFC800',
    heroImage: 'https://images.unsplash.com/photo-1656423521731-9665583f100c?w=900&h=350&fit=crop&auto=format',
    theory: `<p style="font-size:0.82rem;color:#1A1A2E;line-height:1.6;margin:0 0 0.75rem 0">La vida en España tiene ritmos propios. Conocer los ${_badge('trámites esenciales', 255, 200, 0)} y los horarios te facilita la integración desde el primer día.</p>${_h('Trámites Esenciales')}${_grid(`${_card(ICO_FILETEXT, '#1A1A2E', 'DNI', 'Obligatorio desde los 14 años. Se tramita en la Comisaría de Policía con foto y partida de nacimiento.')}${_card(ICO_BUILDING, '#1CB0F6', 'Empadronamiento', 'Registro municipal en el Ayuntamiento. Necesario para acceder a servicios públicos.')}${_card(ICO_HEART, '#FF4B4B', 'Tarjeta sanitaria', 'Se solicita en el Centro de Salud más cercano. Permite el acceso a la sanidad pública.')}`)}<div style="margin-top:0.75rem">${_bar(ICO_UTENSILS, '#FFC800', '<strong>Horarios típicos:</strong> Desayuno 8–9h · Almuerzo 11–12h · <strong>Comida 14–15:30h</strong> · Merienda 17–18h · <strong>Cena 21–22h</strong>.')}</div>${_h('Números de Emergencia')}<div style="display:flex;flex-direction:column;gap:0.4rem">${_li(ICO_PHONE, '#FFC800', `${_badge('112', 255, 200, 0)} — Emergencias generales: policía, bomberos y ambulancias. Disponible 24h.`)}${_li(ICO_PHONE, '#FFC800', `${_badge('016', 255, 200, 0)} — Violencia de género. Gratuito, confidencial y disponible 24 horas.`)}${_li(ICO_PHONE, '#FFC800', `${_badge('091', 255, 200, 0)} — Policía Nacional. ${_badge('062', 255, 200, 0)} — Guardia Civil. ${_badge('061', 255, 200, 0)} — Urgencias sanitarias.`)}</div>`,
    steps: [
      { title: 'DNI y Documentación', summary: 'DNI obligatorio para españoles desde los 14 años. Se tramita en Policía Nacional.', detail: 'El Documento Nacional de Identidad (DNI) es obligatorio para todos los ciudadanos españoles a partir de los 14 años. Se tramita en la Comisaría de Policía Nacional con foto, partida de nacimiento y documentación del domicilio. El DNI electrónico (DNIe) también sirve como firma digital. Los extranjeros residentes necesitan el NIE (Número de Identidad de Extranjero) para cualquier trámite oficial.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Policia_Nacional_de_Espana_-_fachada_comisaria.jpg?width=640' },
      { title: 'Empadronamiento', summary: 'Registro en el padrón municipal. Imprescindible para acceder a servicios públicos.', detail: 'El empadronamiento es el registro oficial de residencia en un municipio. Se tramita en el Ayuntamiento presentando el contrato de alquiler o escritura de propiedad y el DNI/NIE/pasaporte. Es obligatorio y necesario para: acceder a la sanidad pública, escolarizar a los hijos, solicitar la tarjeta sanitaria, votar en elecciones locales y para muchos trámites de extranjería.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Palacio_de_Cibeles,_Madrid,_Spain.jpg?width=640' },
      { title: 'Tarjeta Sanitaria', summary: 'Tramítala en el centro de salud. Acceso gratuito a toda la sanidad pública.', detail: 'La Tarjeta Sanitaria Individual (TSI) da acceso a la atención médica del Sistema Nacional de Salud: médico de cabecera, pediatra, especialistas, urgencias y hospitalización. Se solicita en el centro de salud del barrio presentando el DNI/NIE y el certificado de empadronamiento. Cada Comunidad Autónoma gestiona su propio sistema sanitario, pero la cobertura básica es universal para todos los residentes.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hospital_Universitario_La_Paz_Madrid.jpg?width=640' },
      { title: 'Números de Emergencia', summary: '112 emergencias generales · 016 violencia de género · 091 Policía Nacional.', detail: 'El 112 es el número único europeo de emergencias: atiende llamadas de policía, bomberos y ambulancias, disponible las 24 horas en varios idiomas. El 016 es el número gratuito y confidencial para víctimas de violencia de género, también 24 horas los 365 días del año. El 091 (Policía Nacional), 062 (Guardia Civil) y 061 (Urgencias sanitarias) son números específicos. Llama al 112 si no sabes cuál usar.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ambulancia_de_soporte_vital_avanzado_(UVI_movil).jpg?width=640' },
      { title: 'Horarios Españoles', summary: 'Comida 14–15:30 h · Cena 21–22 h · Canarias tiene 1 hora menos.', detail: 'Los horarios españoles son más tardíos que en el resto de Europa. El desayuno es a las 8–9 h, el almuerzo a las 11–12 h, la comida principal a las 14–15:30 h (muchos comercios cierran), la merienda a las 17–18 h y la cena a las 21–22 h. Las tiendas suelen cerrar por la tarde entre las 14 y las 17 h. Las Islas Canarias están en el huso horario UTC+0 (siempre una hora menos que la Península).', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Tapas_in_Spain.jpg/640px-Tapas_in_Spain.jpg' },
      { title: 'Gastronomía', summary: 'Paella (Valencia), tortilla española, gazpacho (Andalucía), pintxos (País Vasco).', detail: 'La paella valenciana es el plato más internacional de España (arroz, pollo, conejo, judías verdes y garrofón). La tortilla española (de patatas y huevo) es el plato más popular del día a día. El gazpacho es una sopa fría de tomate típica de Andalucía. Los pintxos (o pinchos) son pequeñas tapas sobre pan típicas del País Vasco. El cocido madrileño, el pulpo a feira y el pan amb tomàquet catalán también son iconos gastronómicos.', imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Paella_Valenciana_original.jpg?width=640' },
    ],
    proTip: 'La ONCE es la organización que trabaja para la integración de las personas con discapacidad visual (ciegos). El Camino de Santiago es Patrimonio de la Humanidad. El título de "Doctor" se obtiene tras leer una tesis doctoral.',
    gifs: [
      { url: 'https://media.giphy.com/media/J4rXP75OV0AL0XBmuS/giphy.gif', caption: 'La paella valenciana — el plato más emblemático de la gastronomía española', emoji: '🥘' },
    ],
    challenges: [
      // ── Official PDF — Tarea 5 ──
      {
        type: 'checkbox',
        question: '¿Dónde se tramita la tarjeta sanitaria?',
        options: [{ text: 'En el Ayuntamiento.', correct: false }, { text: 'En la Comisaría de Policía.', correct: false }, { text: 'En el centro de salud.', correct: true }],
        explanation: 'La tarjeta sanitaria individual (TSI) es el documento que acredita el derecho a recibir asistencia sanitaria del sistema público. Se solicita en el centro de salud (médico de cabecera) del barrio o municipio de residencia, presentando el DNI o NIE y el certificado de empadronamiento.',
      },
      {
        type: 'checkbox',
        question: 'El horario de Canarias, con respecto a la Península, es de...',
        options: [{ text: 'la misma hora.', correct: false }, { text: 'una hora más.', correct: false }, { text: 'una hora menos.', correct: true }],
        explanation: 'Las Islas Canarias están en el huso horario UTC+0 (UTC+1 en verano), mientras que la España peninsular está en el UTC+1 (UTC+2 en verano). Esto significa que Canarias siempre tiene una hora menos que la Península. Esta diferencia se debe a su posición geográfica más occidental.',
      },
      {
        type: 'checkbox',
        question: 'El Camino de Santiago es...',
        options: [{ text: 'una ruta de senderismo privada.', correct: false }, { text: 'Patrimonio de la Humanidad.', correct: true }, { text: 'una carretera de peaje.', correct: false }],
        explanation: 'El Camino de Santiago es una red de rutas de peregrinación que convergen en la Catedral de Santiago de Compostela (Galicia). Fue declarado Primer Itinerario Cultural Europeo por el Consejo de Europa en 1987 y Patrimonio de la Humanidad por la UNESCO en 1993. El más famoso es el Camino Francés.',
      },
      {
        type: 'checkbox',
        question: '¿A qué hora se cena normalmente en España?',
        options: [{ text: 'A las 18 o 19 h.', correct: false }, { text: 'A las 21 o 22 h.', correct: true }, { text: 'A las 23 o 24 h.', correct: false }],
        explanation: 'Los horarios españoles de comidas son notablemente tardíos en comparación con otros países europeos. La cena suele ser entre las 21:00 y las 22:00 horas. La comida principal del día se hace entre las 14:00 y las 15:30. El desayuno es sobre las 8:00-9:00.',
      },
      {
        type: 'checkbox',
        question: 'La organización que trabaja para conseguir la integración de las personas con discapacidad visual es...',
        options: [{ text: 'la Cruz Roja.', correct: false }, { text: 'la ONCE.', correct: true }, { text: 'Cáritas.', correct: false }],
        explanation: 'La ONCE (Organización Nacional de Ciegos Españoles) fue fundada en 1939 y trabaja para la integración social y laboral de las personas ciegas y con otras discapacidades visuales. Es conocida por su famoso cupón de lotería (el cupón de la ONCE), que financia sus actividades sociales.',
      },
      {
        type: 'checkbox',
        question: '¿Cuándo se puede llamar al número de teléfono para atención a víctimas de violencia de género?',
        options: [{ text: 'Solo en horario de oficina.', correct: false }, { text: 'De lunes a viernes.', correct: false }, { text: 'Las 24 horas del día.', correct: true }],
        explanation: 'El 016 es el número de atención a víctimas de violencia de género en España. Es gratuito, confidencial y está disponible las 24 horas del día, los 365 días del año, en múltiples idiomas. También existe el 112 para emergencias y el 900 105 090 para víctimas de trata.',
      },
      {
        type: 'checkbox',
        question: '¿Qué título se obtiene tras realizar una tesis doctoral en España?',
        options: [{ text: 'Licenciado.', correct: false }, { text: 'Máster.', correct: false }, { text: 'Doctor.', correct: true }],
        explanation: 'En el sistema universitario español (adaptado al Plan Bolonia), los estudios superiores tienen tres niveles: Grado (4 años), Máster (1-2 años) y Doctorado. Tras presentar y defender una tesis doctoral original, el estudiante obtiene el título de Doctor, el más alto grado académico.',
      },
      // ── Additional questions ──
      {
        type: 'dropdown',
        parts: ['Para registrarte como residente de un municipio debes obtener el ', { options: ['DNI', 'Certificado de Empadronamiento', 'Pasaporte'], answer: 'Certificado de Empadronamiento' }, ' acudiendo al ', { options: ['Ayuntamiento', 'Ministerio del Interior', 'Centro de Salud'], answer: 'Ayuntamiento' }, '.'],
        explanation: 'El empadronamiento es el registro oficial de los ciudadanos y residentes en el padrón municipal. Se tramita en el Ayuntamiento del municipio donde se reside. Es fundamental para acceder a servicios públicos como la sanidad, la escolarización y para muchos trámites administrativos.',
      },
      {
        type: 'checkbox',
        question: 'El DNI es obligatorio para los españoles a partir de los...',
        options: [{ text: '14 años.', correct: true }, { text: '16 años.', correct: false }, { text: '18 años.', correct: false }],
        explanation: 'El Documento Nacional de Identidad (DNI) es obligatorio para todos los españoles mayores de 14 años. Se tramita en las Comisarías del Cuerpo Nacional de Policía. Es el documento principal de identificación personal y tiene una validez que varía según la edad del titular.',
      },
      {
        type: 'dragdrop',
        wordBank: ['Policía', 'Seguridad Social', 'Ayuntamiento'],
        parts: ['El DNI se hace en la Comisaría de ', { answer: 'Policía' }, ', el empadronamiento en el ', { answer: 'Ayuntamiento' }, ', y el número de cotización en la ', { answer: 'Seguridad Social' }, '.'],
        explanation: 'Cada trámite administrativo tiene su organismo competente: el DNI (Policía Nacional), el empadronamiento (Ayuntamiento), la tarjeta sanitaria (centro de salud), el número de afiliación a la Seguridad Social (Tesorería General de la Seguridad Social o empresario).',
      },
      {
        type: 'dropdown',
        parts: ['Si tienes una emergencia médica o policial en España, debes llamar al número ', { options: ['091', '112', '060'], answer: '112' }, '.'],
        explanation: 'El 112 es el número único de emergencias en toda la Unión Europea, incluyendo España. Es gratuito, disponible 24 horas, los 365 días, y coordina la respuesta de policía, bomberos y servicios sanitarios. El 091 es la Policía Nacional y el 062 la Guardia Civil, pero el 112 centraliza todos los servicios.',
      },
      {
        type: 'checkbox',
        question: '¿Qué comida se suele tomar en España entre las 14:00 y las 15:30 horas?',
        options: [{ text: 'La cena.', correct: false }, { text: 'La comida o almuerzo.', correct: true }, { text: 'El desayuno.', correct: false }],
        explanation: 'La comida del mediodía (también llamada "almuerzo" en algunas regiones) es la comida más importante del día en España y se toma entre las 14:00 y las 15:30, más tarde que en la mayoría de países europeos. Es habitual que incluya varios platos (primero, segundo y postre).',
      },
      {
        type: 'checkbox',
        question: 'La tarjeta sanitaria europea sirve para...',
        options: [{ text: 'recibir atención médica en todos los países del mundo.', correct: false }, { text: 'recibir atención médica durante estancias temporales en países de la UE.', correct: true }, { text: 'sustituir al DNI en viajes por Europa.', correct: false }],
        explanation: 'La Tarjeta Sanitaria Europea (TSE) garantiza el acceso a la asistencia sanitaria pública necesaria durante una estancia temporal en cualquier país de la Unión Europea, el Espacio Económico Europeo (EEE) y Suiza. No es válida para estancias permanentes ni para atención programada.',
      },
      {
        type: 'checkbox',
        question: 'En España, las farmacias que abren las 24 horas y los fines de semana se llaman farmacias...',
        options: [{ text: 'de urgencia.', correct: false }, { text: 'de guardia.', correct: true }, { text: 'permanentes.', correct: false }],
        explanation: 'Las farmacias de guardia son las que permanecen abiertas fuera del horario comercial habitual (noches, festivos y domingos) para garantizar el acceso continuo a medicamentos. Hay una en cada zona y su información se puede consultar en las puertas de otras farmacias o en webs municipales.',
      },
      {
        type: 'checkbox',
        question: "¿Qué familia se considera 'familia numerosa' en España de forma general?",
        options: [{ text: 'Una pareja con 1 hijo.', correct: false }, { text: 'Una pareja con 2 hijos.', correct: false }, { text: 'Una pareja con 3 hijos o más.', correct: true }],
        explanation: 'En España, la condición de "familia numerosa" se reconoce generalmente a partir de 3 hijos (o 2 si alguno tiene discapacidad). Esta categoría da derecho a descuentos en transporte público, reducción en tasas universitarias y otros beneficios estatales. Se gestiona mediante el Título de Familia Numerosa.',
      },
      {
        type: 'checkbox',
        question: 'El roscón de Reyes es un dulce típico que se come en España...',
        options: [{ text: 'en Semana Santa.', correct: false }, { text: 'el 6 de enero, día de Reyes.', correct: true }, { text: 'en Nochebuena.', correct: false }],
        explanation: 'El roscón de Reyes es el dulce tradicional que los españoles consumen el 6 de enero, coincidiendo con la festividad de los Reyes Magos (Epifanía). Es un bollo en forma de corona decorado con frutas confitadas. Suele llevar una figurita escondida y una "haba" seca: quien encuentra la figura es el "rey" de la celebración.',
      },
    ],
  },
]
