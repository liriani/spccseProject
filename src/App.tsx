import { useState, useRef, useMemo, useEffect, type CSSProperties } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Challenge =
  | { type: 'checkbox'; question: string; options: { text: string; correct: boolean; specificFeedback?: string }[]; explanation?: string }
  | { type: 'dropdown'; parts: (string | { options: string[]; answer: string })[]; explanation?: string }
  | { type: 'dragdrop'; wordBank: string[]; parts: (string | { answer: string })[]; explanation?: string }
  | { type: 'map_pin'; targetId: string; targetName: string; explanation?: string }

interface Step {
  title: string
  summary: string
  detail: string
  imageUrl: string
}

interface Badge {
  id: string
  name: string
  emoji: string
  xpRequired: number
  trivia: string
}

interface Mod {
  id: number
  title: string
  emoji: string
  color: string
  bg: string
  border: string
  shadow: string
  heroImage: string
  theory: string
  steps: Step[]
  proTip?: string
  mistakes?: string
  showMap?: boolean
  gifs: { url: string; caption: string; emoji: string }[]
  challenges: Challenge[]
}

// ─── Progression badges ───────────────────────────────────────────────────────

const BADGES: Badge[] = [
  { id: 'b0', name: 'Estudiante', emoji: '🎓', xpRequired: 0,    trivia: 'Has dado el primer paso hacia la ciudadanía española. ¡Bienvenido!' },
  { id: 'b1', name: 'La Alhambra', emoji: '🏰', xpRequired: 50,   trivia: 'La Alhambra de Granada fue construida en el s. XIII por los sultanes nazaríes y es el monumento más visitado de España.' },
  { id: 'b2', name: 'Sagrada Família', emoji: '⛪', xpRequired: 150, trivia: 'La Sagrada Família de Gaudí lleva en construcción desde 1882, es Patrimonio UNESCO y aún no está terminada.' },
  { id: 'b3', name: 'El Prado', emoji: '🖼️', xpRequired: 300,  trivia: 'El Museo del Prado alberga Las Meninas de Velázquez y Los fusilamientos de Goya. Es uno de los más importantes del mundo.' },
  { id: 'b4', name: 'El Teide', emoji: '🌋', xpRequired: 500,  trivia: 'El Teide (3.718 m) en Tenerife es el pico más alto de España y el tercer volcán más grande del mundo.' },
  { id: 'b5', name: 'La Meseta', emoji: '🏔️', xpRequired: 800,  trivia: 'La Meseta Central ocupa el 40% del territorio español y es la meseta más elevada de Europa Occidental.' },
  { id: 'b6', name: 'El Camino', emoji: '⛺', xpRequired: 1200, trivia: 'El Camino de Santiago (Patrimonio UNESCO) tiene más de 1.000 años de historia. La ruta Francesa mide 780 km.' },
  { id: 'b7', name: 'Ciudadano de Honor', emoji: '🇪🇸', xpRequired: 2000, trivia: '¡Dominas el CCSE! El examen real tiene 25 preguntas y necesitas acertar al menos 15 (60%) para obtener la nacionalidad.' },
]

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

// ─── Data ─────────────────────────────────────────────────────────────────────

const MODULES: Mod[] = [
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
      { title: 'Jefatura del Estado', summary: 'El Rey Felipe VI es el Jefe del Estado y símbolo de la nación.', detail: 'El Rey Felipe VI (desde 2014, cuando Juan Carlos I abdicó) es Jefe del Estado. Su papel es representativo y arbitral: sanciona y promulga las leyes, propone al candidato a Presidente del Gobierno y representa a España en el exterior. No elabora leyes ni dirige el Gobierno.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Congreso_de_los_Diputados_%28Madrid%29_02.jpg/640px-Congreso_de_los_Diputados_%28Madrid%29_02.jpg' },
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
      { title: 'Derecho a la Educación', summary: 'Enseñanza básica (6-16 años) obligatoria y gratuita.', detail: 'La enseñanza básica comprende Educación Primaria (6-12 años) y ESO (12-16 años), ambas obligatorias y gratuitas. El Bachillerato y la FP no son obligatorios pero son gratuitos en centros públicos. La educación universitaria tiene tasas, aunque existen becas. La educación es competencia de cada Comunidad Autónoma.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Tribunal_Constitucional_de_Espa%C3%B1a.jpg/640px-Tribunal_Constitucional_de_Espa%C3%B1a.jpg' },
      { title: 'Derecho a la Sanidad', summary: 'Atención sanitaria pública y gratuita para todos los residentes.', detail: 'El Sistema Nacional de Salud cubre a todos los residentes con derecho reconocido. La tarjeta sanitaria (TSI) da acceso al médico de cabecera, especialistas y urgencias. Se solicita en el Centro de Salud presentando el DNI/NIE y el certificado de empadronamiento. Cada CCAA gestiona su propio sistema sanitario.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Tapas_in_Spain.jpg/640px-Tapas_in_Spain.jpg' },
      { title: 'Secreto de Comunicaciones', summary: 'Comunicaciones privadas protegidas — solo intervenibles con orden judicial.', detail: 'El artículo 18.3 de la Constitución protege el secreto de las comunicaciones postales, telegráficas y telefónicas. Solo un juez puede ordenar la intervención. Ninguna autoridad (ni policía ni gobierno) puede interceptarlas sin autorización judicial. Esta garantía se extiende también a las comunicaciones digitales (emails, mensajería).', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg/640px-Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg' },
      { title: 'Participación Política', summary: 'Sufragio universal, libre, igual, directo y secreto desde los 18 años.', detail: 'El derecho al voto se ejerce en elecciones generales (Estado), autonómicas (CCAAs) y locales (municipios). Los ciudadanos de la UE residentes en España pueden votar en elecciones municipales y europeas, pero NO en las generales ni autonómicas. Los ciudadanos también pueden participar mediante referéndums y el ejercicio del derecho de petición.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Subdivisions_of_Spain_with_coats_of_arms.png/640px-Subdivisions_of_Spain_with_coats_of_arms.png' },
      { title: 'Fuerzas Armadas', summary: 'Ejército profesional desde 2001. Servicio militar voluntario.', detail: 'Las Fuerzas Armadas españolas se componen del Ejército de Tierra, la Armada y el Ejército del Aire y del Espacio. El servicio militar obligatorio fue suprimido en España en el año 2001. El Rey es el Jefe Supremo de las Fuerzas Armadas. España es miembro de la OTAN desde 1982 y participa en misiones internacionales de paz.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Congreso_de_los_Diputados_%28Madrid%29_02.jpg/640px-Congreso_de_los_Diputados_%28Madrid%29_02.jpg' },
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
      { title: 'Provincias y Municipios', summary: '50 provincias y más de 8.000 municipios gobernados por Ayuntamientos.', detail: 'Las 50 provincias tienen sus Diputaciones Provinciales (excepto País Vasco y Navarra, que cuentan con Juntas Generales y Diputaciones Forales con régimen especial). Los municipios son gobernados por Ayuntamientos, encabezados por el Alcalde y los Concejales elegidos cada 4 años. En grandes ciudades hay Juntas de Distrito.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Congreso_de_los_Diputados_%28Madrid%29_02.jpg/640px-Congreso_de_los_Diputados_%28Madrid%29_02.jpg' },
      { title: 'Principales Ríos', summary: 'El Ebro es el único gran río que desemboca en el Mediterráneo.', detail: 'El Ebro (930 km) es el más caudaloso y desemboca en el Mediterráneo (Delta del Ebro). El Tajo es el más largo de la Península Ibérica (1.007 km) y desemboca en Lisboa (Atlántico). El Duero, Guadiana y Guadalquivir también desembocan en el Atlántico. El Guadalquivir es el único río navegable hasta Sevilla.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Senado_de_Espa%C3%B1a_-_Fachada.jpg/640px-Senado_de_Espa%C3%B1a_-_Fachada.jpg' },
      { title: 'Montañas y Picos', summary: 'El Teide (3.718m) en Canarias es el pico más alto de España y del Atlántico.', detail: 'El Teide en Tenerife (Canarias) es el volcán activo más alto del Atlántico y el tercer volcán más grande del mundo sobre el nivel del mar. El Mulhacén (3.479 m) en Sierra Nevada (Granada, Andalucía) es el pico más alto de la Península. Los Pirineos separan España de Francia y Andorra.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Tribunal_Constitucional_de_Espa%C3%B1a.jpg/640px-Tribunal_Constitucional_de_Espa%C3%B1a.jpg' },
      { title: 'Archipiélagos', summary: 'Canarias (Atlántico) e Islas Baleares (Mediterráneo) — dos mundos distintos.', detail: 'Las Islas Canarias están frente a la costa de África (Marruecos y Mauritania), tienen clima subtropical y su huso horario es UTC+0 (una hora menos que la Península). Las Islas Baleares (Mallorca, Menorca, Ibiza, Formentera) están en el Mediterráneo y tienen clima mediterráneo. Ambas son comunidades autónomas uniprovinciales.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Subdivisions_of_Spain_with_coats_of_arms.png/640px-Subdivisions_of_Spain_with_coats_of_arms.png' },
      { title: 'Climas de España', summary: 'Cuatro zonas climáticas: mediterráneo, atlántico, continental y subtropical.', detail: 'El clima mediterráneo domina el litoral E y S (veranos secos y calurosos, inviernos suaves). El atlántico cubre el norte (Galicia, Cantabria, País Vasco): lluvioso y verde todo el año. El continental ocupa la Meseta Central: extremos térmicos, veranos calurosos e inviernos muy fríos. El subtropical cubre Canarias: temperaturas suaves todo el año.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg/640px-Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg' },
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
      { title: 'Literatura', summary: 'Cervantes, Lorca y dos Premios Nobel: Cela (1989) y Aleixandre (1977).', detail: 'Miguel de Cervantes escribió Don Quijote de la Mancha (1605 y 1615), considerada la primera novela moderna y la obra más traducida después de la Biblia. Federico García Lorca fue poeta y dramaturgo (La Casa de Bernarda Alba). Los Premios Nobel de Literatura españoles: Vicente Aleixandre (1977) y Camilo José Cela (1989). También destacan Mercè Rodoreda, que escribía en catalán.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Congreso_de_los_Diputados_%28Madrid%29_02.jpg/640px-Congreso_de_los_Diputados_%28Madrid%29_02.jpg' },
      { title: 'Pintura', summary: 'Velázquez (Prado), Goya (Prado), Picasso (Reina Sofía) y Dalí.', detail: 'Diego Velázquez (1599–1660) pintó Las Meninas (1656), conservada en el Museo del Prado. Francisco de Goya (1746–1828) pintó Los fusilamientos del 3 de mayo, también en el Prado. Pablo Picasso pintó el Guernica (1937) como protesta al bombardeo de la ciudad vasca; hoy en el Museo Reina Sofía de Madrid. Salvador Dalí fundó el surrealismo español.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Tribunal_Constitucional_de_Espa%C3%B1a.jpg/640px-Tribunal_Constitucional_de_Espa%C3%B1a.jpg' },
      { title: 'Fiestas Populares', summary: 'Fallas (Valencia, UNESCO), Sanfermines (Pamplona) y Semana Santa.', detail: 'Las Fallas de Valencia (marzo, Patrimonio UNESCO 2016) son esculturas de madera y cartón que se queman la noche del 19 de marzo. Los Sanfermines (Pamplona, 6–14 de julio) son famosos por el encierro de toros. La Tomatina (Buñol, agosto) es la batalla de tomates más grande del mundo. La Semana Santa de Sevilla, Granada y Valladolid son Patrimonio de Interés Turístico.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Senado_de_Espa%C3%B1a_-_Fachada.jpg/640px-Senado_de_Espa%C3%B1a_-_Fachada.jpg' },
      { title: 'Historia Reciente', summary: 'Franquismo → Transición → Constitución 1978 → UE 1986 → año olímpico 1992.', detail: 'El franquismo (1939–1975) fue la dictadura de Francisco Franco tras la Guerra Civil. La Transición democrática (1975–1982) transformó España en una democracia parlamentaria con la Constitución de 1978 (aprobada por referéndum el 6 de diciembre, Día de la Constitución). En 1986 España entró en la CEE (actual UE). En 1992: Exposición Universal en Sevilla y Juegos Olímpicos en Barcelona.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg/640px-Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg' },
      { title: 'Lenguas de España', summary: 'Castellano (oficial en todo el país) + 4 lenguas cooficiales regionales.', detail: 'El castellano (español) es la única lengua oficial en todo el territorio nacional. También son cooficiales en sus comunidades: el catalán (Cataluña, Baleares), el valenciano (Comunidad Valenciana), el gallego (Galicia) y el euskera (País Vasco y parte de Navarra). El catalán, gallego y valenciano son lenguas romances; el euskera (vasco) es una lengua de origen desconocido, sin relación con las demás lenguas europeas.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Subdivisions_of_Spain_with_coats_of_arms.png/640px-Subdivisions_of_Spain_with_coats_of_arms.png' },
      { title: 'Arquitectura', summary: 'Gaudí, la Alhambra (UNESCO) y la Sagrada Família, aún en construcción.', detail: 'Antoni Gaudí (1852–1926) diseñó la Sagrada Família en Barcelona (en construcción desde 1882, Patrimonio UNESCO) y el Park Güell. La Alhambra de Granada (siglo XIII, sultanato nazarí) es el monumento más visitado de España. La Catedral de Burgos (Patrimonio UNESCO) es obra maestra del gótico. El Museo Guggenheim Bilbao (1997, Frank Gehry) renovó la arquitectura contemporánea española.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Congreso_de_los_Diputados_%28Madrid%29_02.jpg/640px-Congreso_de_los_Diputados_%28Madrid%29_02.jpg' },
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
      { title: 'DNI y Documentación', summary: 'DNI obligatorio para españoles desde los 14 años. Se tramita en Policía Nacional.', detail: 'El Documento Nacional de Identidad (DNI) es obligatorio para todos los ciudadanos españoles a partir de los 14 años. Se tramita en la Comisaría de Policía Nacional con foto, partida de nacimiento y documentación del domicilio. El DNI electrónico (DNIe) también sirve como firma digital. Los extranjeros residentes necesitan el NIE (Número de Identidad de Extranjero) para cualquier trámite oficial.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg/640px-Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg' },
      { title: 'Empadronamiento', summary: 'Registro en el padrón municipal. Imprescindible para acceder a servicios públicos.', detail: 'El empadronamiento es el registro oficial de residencia en un municipio. Se tramita en el Ayuntamiento presentando el contrato de alquiler o escritura de propiedad y el DNI/NIE/pasaporte. Es obligatorio y necesario para: acceder a la sanidad pública, escolarizar a los hijos, solicitar la tarjeta sanitaria, votar en elecciones locales y para muchos trámites de extranjería.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Congreso_de_los_Diputados_%28Madrid%29_02.jpg/640px-Congreso_de_los_Diputados_%28Madrid%29_02.jpg' },
      { title: 'Tarjeta Sanitaria', summary: 'Tramítala en el centro de salud. Acceso gratuito a toda la sanidad pública.', detail: 'La Tarjeta Sanitaria Individual (TSI) da acceso a la atención médica del Sistema Nacional de Salud: médico de cabecera, pediatra, especialistas, urgencias y hospitalización. Se solicita en el centro de salud del barrio presentando el DNI/NIE y el certificado de empadronamiento. Cada Comunidad Autónoma gestiona su propio sistema sanitario, pero la cobertura básica es universal para todos los residentes.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Senado_de_Espa%C3%B1a_-_Fachada.jpg/640px-Senado_de_Espa%C3%B1a_-_Fachada.jpg' },
      { title: 'Números de Emergencia', summary: '112 emergencias generales · 016 violencia de género · 091 Policía Nacional.', detail: 'El 112 es el número único europeo de emergencias: atiende llamadas de policía, bomberos y ambulancias, disponible las 24 horas en varios idiomas. El 016 es el número gratuito y confidencial para víctimas de violencia de género, también 24 horas los 365 días del año. El 091 (Policía Nacional), 062 (Guardia Civil) y 061 (Urgencias sanitarias) son números específicos. Llama al 112 si no sabes cuál usar.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Tribunal_Constitucional_de_Espa%C3%B1a.jpg/640px-Tribunal_Constitucional_de_Espa%C3%B1a.jpg' },
      { title: 'Horarios Españoles', summary: 'Comida 14–15:30 h · Cena 21–22 h · Canarias tiene 1 hora menos.', detail: 'Los horarios españoles son más tardíos que en el resto de Europa. El desayuno es a las 8–9 h, el almuerzo a las 11–12 h, la comida principal a las 14–15:30 h (muchos comercios cierran), la merienda a las 17–18 h y la cena a las 21–22 h. Las tiendas suelen cerrar por la tarde entre las 14 y las 17 h. Las Islas Canarias están en el huso horario UTC+0 (siempre una hora menos que la Península).', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Subdivisions_of_Spain_with_coats_of_arms.png/640px-Subdivisions_of_Spain_with_coats_of_arms.png' },
      { title: 'Gastronomía', summary: 'Paella (Valencia), tortilla española, gazpacho (Andalucía), pintxos (País Vasco).', detail: 'La paella valenciana es el plato más internacional de España (arroz, pollo, conejo, judías verdes y garrofón). La tortilla española (de patatas y huevo) es el plato más popular del día a día. El gazpacho es una sopa fría de tomate típica de Andalucía. Los pintxos (o pinchos) son pequeñas tapas sobre pan típicas del País Vasco. El cocido madrileño, el pulpo a feira y el pan amb tomàquet catalán también son iconos gastronómicos.', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg/640px-Firma_de_la_Constituci%C3%B3n_espa%C3%B1ola_de_1978.jpg' },
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

const SPAIN_REGIONS = [
  { id: 'galicia', name: 'Galicia', x: 17, y: 18 },
  { id: 'asturias', name: 'Principado de Asturias', x: 33, y: 13 },
  { id: 'cantabria', name: 'Cantabria', x: 49, y: 14 },
  { id: 'pais_vasco', name: 'País Vasco', x: 60, y: 16 },
  { id: 'navarra', name: 'Comunidad Foral de Navarra', x: 67, y: 20 },
  { id: 'aragon', name: 'Aragón', x: 70, y: 32 },
  { id: 'cataluna', name: 'Cataluña', x: 86, y: 30 },
  { id: 'castilla_leon', name: 'Castilla y León', x: 42, y: 35 },
  { id: 'madrid', name: 'Comunidad de Madrid', x: 52, y: 47 },
  { id: 'extremadura', name: 'Extremadura', x: 31, y: 62 },
  { id: 'castilla_la_mancha', name: 'Castilla-La Mancha', x: 55, y: 60 },
  { id: 'comunidad_valenciana', name: 'Comunidad Valenciana', x: 74, y: 55 },
  { id: 'murcia', name: 'Región de Murcia', x: 68, y: 73 },
  { id: 'andalucia', name: 'Andalucía', x: 42, y: 80 },
  { id: 'baleares', name: 'Islas Baleares', x: 92, y: 55 },
  { id: 'canarias', name: 'Canarias', x: 15, y: 92 },
  { id: 'la_rioja', name: 'La Rioja', x: 62, y: 24 },
]

// ─── Helper ───────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function bold(text: unknown) {
  if (typeof text !== 'string') return ''
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
}

// ─── Components ───────────────────────────────────────────────────────────────

function AccordionItem({ step, index, color }: { step: Step; index: number; color: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '3px solid #1A1A2E', boxShadow: open ? `4px 4px 0 ${color}` : '3px 3px 0 #1A1A2E', transition: 'box-shadow 0.2s' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left"
        style={{ background: open ? color + '18' : '#fff' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
          style={{ background: color }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-[#1A1A2E] text-sm leading-tight">{step.title}</p>
          <p className="text-[#4B4B6B] text-xs leading-snug mt-0.5 font-semibold">{step.summary}</p>
        </div>
        <span
          className="flex-shrink-0 text-lg font-black text-[#1A1A2E] transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ⌄
        </span>
      </button>
      {open && (
        <div style={{ borderTop: '2px solid #1A1A2E', background: '#FFFBF0' }}>
          {step.imageUrl && (
            <img
              src={step.imageUrl}
              alt={step.title}
              className="w-full object-cover"
              style={{ maxHeight: '140px', borderBottom: '2px solid #1A1A2E' }}
            />
          )}
          <div className="p-4">
            <p className="text-[#1A1A2E] text-sm leading-relaxed">{step.detail}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function MediaCard({ gif, color }: { gif: { url: string; caption: string; emoji: string }; color: string }) {
  const [loaded, setLoaded] = useState(false)
  const [errored, setErrored] = useState(false)

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col group"
      style={{ border: '3px solid #1A1A2E', boxShadow: '4px 4px 0 #1A1A2E' }}
    >
      {/* 16:9 media area */}
      <div className="relative overflow-hidden" style={{ paddingBottom: '56.25%', background: color + '22' }}>
        {!loaded && !errored && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl animate-bounce">{gif.emoji}</span>
          </div>
        )}
        {!errored && (
          <img
            loading="lazy"
            src={gif.url}
            alt={gif.caption}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        )}
        {errored && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-5xl">{gif.emoji}</span>
            <p className="text-xs font-bold" style={{ color: 'rgba(26,26,46,0.4)' }}>Imagen no disponible</p>
          </div>
        )}
        {/* GIF badge */}
        {loaded && (
          <div
            className="absolute top-2 right-2 px-2 py-0.5 text-[0.58rem] font-black tracking-widest rounded-md text-white"
            style={{ background: 'rgba(26,26,46,0.8)', backdropFilter: 'blur(4px)' }}
          >
            GIF
          </div>
        )}
        {/* Hover shimmer */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 pointer-events-none" />
      </div>
      {/* Caption bar */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5"
        style={{ background: color + '18', borderTop: '1px solid rgba(26,26,46,0.08)' }}
      >
        <span className="text-base flex-shrink-0">{gif.emoji}</span>
        <p className="flex-1 text-[0.72rem] font-bold text-[#1A1A2E] leading-snug">{gif.caption}</p>
        <span className="flex-shrink-0 text-[0.52rem] font-black tracking-widest uppercase" style={{ color: 'rgba(26,26,46,0.2)' }}>GIPHY</span>
      </div>
    </div>
  )
}

// Inline SVG map of Spain — reliable, no network dependency, perfectly aligned with SPAIN_REGIONS coordinates
function SpainMapSVG() {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* Ocean */}
      <rect width="100" height="100" fill="#bfdbfe" />
      {/* Light wave texture */}
      <line x1="0" y1="30" x2="100" y2="30" stroke="#93c5fd" strokeWidth="0.3" strokeDasharray="3,4" />
      <line x1="0" y1="50" x2="100" y2="50" stroke="#93c5fd" strokeWidth="0.3" strokeDasharray="3,4" />
      <line x1="0" y1="70" x2="100" y2="70" stroke="#93c5fd" strokeWidth="0.3" strokeDasharray="3,4" />

      {/* Mainland Spain — polygon coordinates match SPAIN_REGIONS percentage positions */}
      <polygon
        points="10,20 14,12 18,9 24,8 32,8 50,10 60,12 68,13 74,14 82,18 90,27 90,40 87,52 83,62 78,72 74,80 70,86 62,92 45,92 32,90 22,86 14,78 10,68 8,54 8,38 10,28"
        fill="#dcfce7"
        stroke="#4ade80"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      {/* Inner land shading for depth */}
      <polygon
        points="14,22 17,15 22,12 30,11 50,13 60,15 67,16 73,17 80,21 87,29 87,40 84,51 80,61 76,70 72,78 66,88 45,89 34,87 24,83 17,76 13,66 11,52 11,38 14,28"
        fill="none"
        stroke="#86efac"
        strokeWidth="0.5"
        strokeLinejoin="round"
        opacity="0.6"
      />

      {/* Canary Islands — inset box (pin coords: x=15, y=92) */}
      <rect x="3" y="83" width="24" height="15" rx="2" fill="#bfdbfe" stroke="#4ade80" strokeWidth="0.5" strokeDasharray="2,1.5" />
      <ellipse cx="6.5"  cy="89" rx="2.2" ry="1.3" fill="#dcfce7" stroke="#4ade80" strokeWidth="0.6" />
      <ellipse cx="11"   cy="90.5" rx="2.8" ry="1.5" fill="#dcfce7" stroke="#4ade80" strokeWidth="0.6" />
      <ellipse cx="16"   cy="90"   rx="2.4" ry="1.3" fill="#dcfce7" stroke="#4ade80" strokeWidth="0.6" />
      <ellipse cx="20.5" cy="88.5" rx="2"   ry="1.1" fill="#dcfce7" stroke="#4ade80" strokeWidth="0.6" />
      <text x="4.5" y="97" fontSize="2.2" fill="#15803d" fontFamily="sans-serif" fontWeight="600">Canarias</text>

      {/* Balearic Islands (pin coords: x=92, y=55) */}
      <ellipse cx="91" cy="50" rx="3.5" ry="1.8" fill="#dcfce7" stroke="#4ade80" strokeWidth="0.7" />
      <ellipse cx="96" cy="55" rx="2.6" ry="1.4" fill="#dcfce7" stroke="#4ade80" strokeWidth="0.7" />
      <ellipse cx="91" cy="59" rx="2"   ry="1.1" fill="#dcfce7" stroke="#4ade80" strokeWidth="0.7" />
      <text x="92" y="64" fontSize="1.9" fill="#15803d" fontFamily="sans-serif" textAnchor="middle">Baleares</text>

      {/* Spain label */}
      <text x="46" y="44" textAnchor="middle" fontSize="5" fill="#15803d" fontFamily="sans-serif" fontWeight="800" opacity="0.18" letterSpacing="1">ESPAÑA</text>
    </svg>
  )
}

// Floating "+XP" notification — appears on correct answer, floats up and fades
function FloatingXP({ amount, id, onDone }: { amount: number; id: number; onDone: (id: number) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(id), 1200)
    return () => clearTimeout(t)
  }, [id, onDone])

  return (
    <div className="fixed z-50 pointer-events-none animate-float-score" style={{ top: '3.5rem', right: '1rem' }}>
      <div
        className="flex items-center gap-1.5 font-black text-[#1A1A2E] px-3 py-1.5 rounded-2xl border-2 border-[#1A1A2E]"
        style={{ background: '#FFC800', boxShadow: '3px 3px 0 #1A1A2E', fontSize: '1rem' }}
      >
        ⭐ +{amount} XP
      </div>
    </div>
  )
}

function MapGame({ color }: { color: string }) {
  const [queue] = useState(() => shuffle(SPAIN_REGIONS))
  const [idx, setIdx] = useState(0)
  const [found, setFound] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState<{ text: string; ok: boolean } | null>(null)
  const [shake, setShake] = useState<string | null>(null)

  const target = queue[idx]
  const done = idx >= queue.length

  function click(id: string) {
    if (done || found.has(id)) return
    if (id === target.id) {
      const next = new Set(found)
      next.add(id)
      setFound(next)
      setIdx(i => i + 1)
      setFeedback({ text: `✅ ¡Correcto! ${target.name}`, ok: true })
    } else {
      setShake(id)
      setFeedback({ text: '❌ Esa no es. ¡Inténtalo de nuevo!', ok: false })
      setTimeout(() => setShake(null), 400)
    }
  }

  function reset() {
    setIdx(0)
    setFound(new Set())
    setFeedback(null)
  }

  return (
    <div className="rounded-2xl border-3 border-[#1A1A2E] overflow-hidden" style={{ borderWidth: 3, boxShadow: '4px 4px 0 #1A1A2E' }}>
      <div className="p-4 flex items-center justify-between" style={{ background: color + '33' }}>
        <div className="font-bold text-[#1A1A2E]">
          {done ? '🎉 ¡Completado!' : (
            <span>Encuentra: <span className="text-lg" style={{ color }}>{target.name}</span></span>
          )}
        </div>
        <div className="text-sm font-bold text-[#1A1A2E]">{found.size} / {SPAIN_REGIONS.length}</div>
      </div>

      <div className="relative w-full" style={{ paddingBottom: '75%' }}>
        <SpainMapSVG />
        {SPAIN_REGIONS.map(r => {
          const isFound = found.has(r.id)
          const isShaking = shake === r.id
          return (
            <button
              key={r.id}
              onClick={() => click(r.id)}
              className={`absolute w-5 h-5 rounded-full border-2 border-white cursor-pointer transition-all duration-200 hover:scale-125 ${isShaking ? 'animate-shake' : ''}`}
              style={{
                left: `${r.x}%`,
                top: `${r.y}%`,
                transform: 'translate(-50%, -50%)',
                background: isFound ? '#58CC02' : (done ? '#1CB0F6' : color),
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                zIndex: isFound ? 5 : 2,
              }}
              title={isFound ? r.name : '?'}
            />
          )
        })}
      </div>

      <div className="px-4 py-3 border-t-2 border-[#1A1A2E] flex items-center justify-between gap-4" style={{ background: '#FFFBF0' }}>
        <span className={`text-sm font-bold ${feedback ? (feedback.ok ? 'text-[#58CC02]' : 'text-[#FF4B4B]') : 'text-transparent'}`}>
          {feedback?.text ?? '·'}
        </span>
        {done && (
          <button
            onClick={reset}
            className="text-xs font-bold px-3 py-1.5 rounded-lg border-2 border-[#1A1A2E] bg-white hover:bg-[#FFC800] transition-colors"
          >
            🔄 Reiniciar
          </button>
        )}
      </div>
    </div>
  )
}

type QuizState = Record<string, { optionText: string; correct: boolean }>
type DropState = Record<string, string>

function Exercises({ mod, onXP }: { mod: Mod; onXP: (n: number) => void }) {
  const [quizState, setQuizState] = useState<QuizState>({})
  const [dropState, setDropState] = useState<DropState>({})
  const [dragWord, setDragWord] = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState<string | null>(null)

  // Shuffle options once per module — prevents re-shuffling on every state update
  const stableOpts = useMemo(
    () => mod.challenges.map(q =>
      q.type === 'checkbox' ? { ...q, options: shuffle(q.options) } : q
    ),
    [mod.id] // eslint-disable-line react-hooks/exhaustive-deps
  )

  function answerQuiz(key: string, opt: { text: string; correct: boolean }) {
    if (quizState[key] !== undefined) return
    setQuizState(s => ({ ...s, [key]: { optionText: opt.text, correct: opt.correct } }))
    if (opt.correct) onXP(10)
    else {
      setShakeKey(key)
      setTimeout(() => setShakeKey(null), 400)
    }
  }

  function answerDrop(key: string, expected: string, value: string) {
    if (dropState[key] === expected) return
    const correct = value === expected
    setDropState(s => ({ ...s, [key]: value }))
    if (correct) onXP(10)
    else {
      setShakeKey(key)
      setTimeout(() => setShakeKey(null), 400)
      // Keep wrong selection visible so user sees what they picked — no jarring reset
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-px flex-1 bg-[#1A1A2E]/20" />
        <span className="text-xs font-black tracking-widest text-[#1A1A2E]/50 uppercase">🎯 Práctica de Examen</span>
        <div className="h-px flex-1 bg-[#1A1A2E]/20" />
      </div>

      {stableOpts.map((q, qi) => {
        const qKey = `${mod.id}-${qi}`
        const isShaking = shakeKey === qKey

        if (q.type === 'checkbox') {
          return (
            <div key={qi} className={`${isShaking ? 'animate-shake' : ''}`}>
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: mod.color }}
                >
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#1A1A2E] mb-3 leading-snug">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const ans = quizState[qKey]
                      const isAnswered = !!ans
                      const isSelected = ans?.optionText === opt.text
                      const revealCorrect = isAnswered && !ans.correct && opt.correct

                      let cardStyle = `border-2 ${isAnswered ? 'border-[#1A1A2E]/20' : 'border-[#1A1A2E]'} bg-white ${!isAnswered ? 'hover:bg-[#FFC800]/20' : ''}`
                      let shadow: CSSProperties = { boxShadow: isAnswered ? 'none' : '3px 3px 0 #1A1A2E' }

                      if (isSelected && ans?.correct) {
                        cardStyle = 'border-2 border-[#58CC02] bg-[#58CC02]/10'
                        shadow = { boxShadow: '3px 3px 0 #58CC02' }
                      } else if (isSelected && !ans?.correct) {
                        cardStyle = 'border-2 border-[#FF4B4B] bg-[#FF4B4B]/10'
                        shadow = { boxShadow: '3px 3px 0 #FF4B4B' }
                      } else if (revealCorrect) {
                        cardStyle = 'border-2 border-[#58CC02] bg-[#58CC02]/10'
                        shadow = { boxShadow: '3px 3px 0 #58CC02' }
                      }

                      return (
                        <button
                          key={oi}
                          onClick={() => answerQuiz(qKey, opt)}
                          disabled={isAnswered}
                          className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-[#1A1A2E] transition-all ${cardStyle} btn-choice`}
                          style={shadow}
                        >
                          <span className="mr-2 font-black">{oi === 0 ? 'A' : oi === 1 ? 'B' : 'C'}</span>
                          {opt.text}
                          {revealCorrect && <span className="ml-2 text-[#58CC02] text-xs font-black">✓ correcta</span>}
                        </button>
                      )
                    })}
                  </div>
                  {quizState[qKey] && (
                    <div className={`mt-3 px-4 py-2 rounded-xl text-sm font-bold animate-bounce-in ${quizState[qKey].correct ? 'bg-[#58CC02]/15 text-[#2d6e00] border-2 border-[#58CC02]' : 'bg-[#FF4B4B]/10 text-[#cc1a1a] border-2 border-[#FF4B4B]'}`}>
                      {quizState[qKey].correct
                        ? '✅ ¡Correcto! +10 XP'
                        : (() => {
                            const selected = q.options.find(o => o.text === quizState[qKey].optionText)
                            return selected?.specificFeedback
                              ? `❌ ${selected.specificFeedback}`
                              : '❌ Respuesta incorrecta — la correcta está destacada arriba'
                          })()
                      }
                    </div>
                  )}
                  {quizState[qKey] && q.explanation && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#4B4B6B] border border-[#1A1A2E]/10 bg-white/60">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        if (q.type === 'dropdown') {
          const allCorrect = q.parts
            .filter(p => typeof p !== 'string')
            .every(p => {
              if (typeof p === 'string') return true
              const k = `${qKey}-${(p as any).answer}`
              return dropState[k] === (p as any).answer
            })

          return (
            <div key={qi} className={`${isShaking ? 'animate-shake' : ''}`}>
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: mod.color }}
                >
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#1A1A2E] leading-relaxed text-base">
                    {q.parts.map((part, pi) => {
                      if (typeof part === 'string') return <span key={pi}>{part}</span>
                      const k = `${qKey}-${part.answer}`
                      const val = dropState[k] || ''
                      const isCorrect = val === part.answer
                      const isWrong = val && !isCorrect
                      return (
                        <select
                          key={pi}
                          value={val}
                          onChange={e => answerDrop(k, part.answer, e.target.value)}
                          disabled={isCorrect}
                          className={`inline-block mx-1 px-2 py-0.5 rounded-lg border-2 font-bold text-sm outline-none transition-all ${isCorrect ? 'cursor-default' : 'cursor-pointer'} ${shakeKey === k ? 'animate-shake' : ''}`}
                          style={{
                            borderColor: isCorrect ? '#58CC02' : isWrong ? '#FF4B4B' : mod.color,
                            background: isCorrect ? 'rgba(88, 204, 2, 0.12)' : isWrong ? 'rgba(255, 75, 75, 0.1)' : '#fff',
                            color: '#1A1A2E',
                          }}
                        >
                          <option value="" disabled>···</option>
                          {part.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      )
                    })}
                  </p>
                  {allCorrect && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-sm font-bold animate-bounce-in bg-[#58CC02]/15 text-[#2d6e00] border-2 border-[#58CC02]">
                      ✅ ¡Correcto! +10 XP
                    </div>
                  )}
                  {allCorrect && q.explanation && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#4B4B6B] border border-[#1A1A2E]/10 bg-white/60">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        if (q.type === 'dragdrop') {
          const blanksCorrect = q.parts
            .filter(p => typeof p !== 'string')
            .every(p => {
              if (typeof p === 'string') return true
              const k = `${qKey}-${(p as any).answer}`
              return dropState[k] === (p as any).answer
            })

          return (
            <div key={qi}>
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: mod.color }}
                >
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <div
                    className="rounded-xl px-4 py-3 border-2 border-dashed border-[#1A1A2E]/30 mb-3 flex flex-wrap gap-2 items-center"
                    style={{ background: mod.color + '15' }}
                  >
                    <span className="text-xs font-black text-[#1A1A2E]/40 uppercase tracking-wider mr-1">Arrastra →</span>
                    {q.wordBank.map(word => {
                      // Scope check to this question only — prevents cross-question greying
                      const used = q.parts
                        .filter((p): p is { answer: string } => typeof p !== 'string')
                        .some(p => dropState[`${qKey}-${p.answer}`] === word)
                      return (
                        <div
                          key={word}
                          draggable={!used}
                          onDragStart={() => setDragWord(word)}
                          onDragEnd={() => setDragWord(null)}
                          className="px-3 py-1.5 rounded-lg border-2 border-[#1A1A2E] font-bold text-sm text-[#1A1A2E] cursor-grab select-none transition-all"
                          style={{
                            background: used ? '#e5e5e5' : '#fff',
                            opacity: used ? 0.4 : 1,
                            boxShadow: used ? 'none' : '2px 2px 0 #1A1A2E',
                          }}
                        >
                          {word}
                        </div>
                      )
                    })}
                  </div>

                  <p className="font-bold text-[#1A1A2E] leading-loose text-base">
                    {q.parts.map((part, pi) => {
                      if (typeof part === 'string') return <span key={pi}>{part}</span>
                      const k = `${qKey}-${part.answer}`
                      const val = dropState[k]
                      const isCorrect = val === part.answer
                      const isWrong = val && !isCorrect

                      return (
                        <span
                          key={pi}
                          onDragOver={e => e.preventDefault()}
                          onDrop={e => {
                            e.preventDefault()
                            if (dragWord && !isCorrect) answerDrop(k, part.answer, dragWord)
                          }}
                          className={`inline-block mx-1 px-3 py-0.5 rounded-lg border-2 font-bold text-sm align-middle transition-all min-w-[80px] text-center ${isCorrect ? 'cursor-default' : 'cursor-pointer'} ${shakeKey === k ? 'animate-shake' : ''}`}
                          style={{
                            borderStyle: val ? 'solid' : 'dashed',
                            borderColor: isCorrect ? '#58CC02' : isWrong ? '#FF4B4B' : '#1A1A2E',
                            background: isCorrect ? 'rgba(88, 204, 2, 0.12)' : isWrong ? 'rgba(255, 75, 75, 0.1)' : '#f8f4e8',
                            color: isCorrect ? '#2d6e00' : isWrong ? '#cc1a1a' : '#999',
                          }}
                        >
                          {val || '···'}
                        </span>
                      )
                    })}
                  </p>

                  {blanksCorrect && Object.keys(dropState).filter(k => k.startsWith(qKey)).length > 0 && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-sm font-bold animate-bounce-in bg-[#58CC02]/15 text-[#2d6e00] border-2 border-[#58CC02]">
                      ✅ ¡Correcto! +10 XP
                    </div>
                  )}
                  {blanksCorrect && Object.keys(dropState).filter(k => k.startsWith(qKey)).length > 0 && q.explanation && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#4B4B6B] border border-[#1A1A2E]/10 bg-white/60">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        if (q.type === 'map_pin') {
          const ans = quizState[qKey]
          const isAnswered = !!ans

          return (
            <div key={qi} className={`${isShaking ? 'animate-shake' : ''}`}>
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                  style={{ background: mod.color }}
                >
                  {qi + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#1A1A2E] mb-3">
                    📍 Encuentra en el mapa: <span style={{ color: mod.color }}>{q.targetName}</span>
                  </p>
                  <div className="rounded-2xl overflow-hidden border-3 border-[#1A1A2E] mb-2" style={{ borderWidth: 3, boxShadow: '3px 3px 0 #1A1A2E' }}>
                    <div className="relative w-full" style={{ paddingBottom: '75%' }}>
                      <SpainMapSVG />
                      {SPAIN_REGIONS.map(r => {
                        const isTarget = r.id === q.targetId
                        const isClicked = ans?.optionText === r.id
                        const isCorrectReveal = isAnswered && isTarget

                        let bg = mod.color
                        if (isAnswered) {
                          if (isCorrectReveal) bg = '#58CC02'
                          else if (isClicked && !ans?.correct) bg = '#FF4B4B'
                          else bg = '#ccc'
                        }

                        return (
                          <button
                            key={r.id}
                            onClick={() => {
                              if (isAnswered) return
                              const correct = r.id === q.targetId
                              setQuizState(s => ({ ...s, [qKey]: { optionText: r.id, correct } }))
                              if (correct) onXP(10)
                              else { setShakeKey(qKey); setTimeout(() => setShakeKey(null), 400) }
                            }}
                            disabled={isAnswered}
                            title={isAnswered ? r.name : '?'}
                            className={`absolute w-5 h-5 rounded-full border-2 border-white transition-all duration-200 hover:scale-125`}
                            style={{
                              left: `${r.x}%`,
                              top: `${r.y}%`,
                              transform: 'translate(-50%, -50%)',
                              background: bg,
                              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                              opacity: isAnswered && !isTarget && !isClicked ? 0.3 : 1,
                              zIndex: isCorrectReveal ? 5 : 2,
                              cursor: isAnswered ? 'default' : 'pointer',
                            }}
                          />
                        )
                      })}
                    </div>
                  </div>
                  {isAnswered && (
                    <div className={`mt-2 px-4 py-2 rounded-xl text-sm font-bold animate-bounce-in ${ans.correct ? 'bg-[#58CC02]/15 text-[#2d6e00] border-2 border-[#58CC02]' : 'bg-[#FF4B4B]/10 text-[#cc1a1a] border-2 border-[#FF4B4B]'}`}>
                      {ans.correct ? `✅ ¡Correcto! +10 XP — ${q.targetName}` : `❌ Incorrecto — el punto verde es ${q.targetName}`}
                    </div>
                  )}
                  {isAnswered && q.explanation && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#4B4B6B] border border-[#1A1A2E]/10 bg-white/60">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

// ─── Progression Map ──────────────────────────────────────────────────────────

function ProgressionMap({ xp, unlockedBadges }: { xp: number; unlockedBadges: Set<string> }) {
  const nextBadge = BADGES.find(b => !unlockedBadges.has(b.id))
  const xpToNext = nextBadge ? nextBadge.xpRequired - xp : 0
  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-black text-[#1A1A2E] text-2xl mb-1" style={{ fontFamily: "'Fredoka One', cursive" }}>Mi Progresión</h1>
        <p className="text-[#4B4B6B] text-sm font-semibold">Desbloquea monumentos icónicos de España a medida que ganas XP</p>
      </div>

      {/* XP progress to next badge */}
      {nextBadge && (
        <div className="rounded-2xl p-4" style={{ border: '3px solid #1A1A2E', background: '#fff', boxShadow: '4px 4px 0 #CE82FF' }}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{nextBadge.emoji}</span>
            <div>
              <p className="font-black text-[#1A1A2E] text-sm">Próxima insignia: <span style={{ color: '#CE82FF' }}>{nextBadge.name}</span></p>
              <p className="text-[#4B4B6B] text-xs font-semibold">Faltan <strong>{xpToNext} XP</strong> — tienes {xp} XP</p>
            </div>
          </div>
          <div className="h-3 w-full bg-[#1A1A2E]/10 rounded-full overflow-hidden border border-[#1A1A2E]/20">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.round((xp / nextBadge.xpRequired) * 100))}%`, background: '#CE82FF' }}
            />
          </div>
        </div>
      )}
      {!nextBadge && (
        <div className="rounded-2xl p-4 text-center" style={{ border: '3px solid #58CC02', background: '#58CC0215', boxShadow: '4px 4px 0 #58CC02' }}>
          <p className="font-black text-[#1A1A2E] text-lg">🏆 ¡Colección completa!</p>
          <p className="text-[#4B4B6B] text-sm">Has desbloqueado todas las insignias de España.</p>
        </div>
      )}

      {/* Badge grid */}
      <div className="grid grid-cols-2 gap-4">
        {BADGES.map(badge => {
          const unlocked = unlockedBadges.has(badge.id)
          return (
            <div
              key={badge.id}
              className="rounded-2xl p-4 flex flex-col gap-2 transition-all"
              style={{
                border: `3px solid ${unlocked ? '#1A1A2E' : '#1A1A2E40'}`,
                background: unlocked ? '#fff' : '#1A1A2E08',
                boxShadow: unlocked ? '3px 3px 0 #CE82FF' : 'none',
                opacity: unlocked ? 1 : 0.5,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-3xl flex-shrink-0" style={{ filter: unlocked ? 'none' : 'grayscale(1)' }}>{badge.emoji}</span>
                <div className="min-w-0">
                  <p className="font-black text-[#1A1A2E] text-sm leading-tight truncate">{badge.name}</p>
                  <p className="text-xs font-bold truncate" style={{ color: unlocked ? '#CE82FF' : '#1A1A2E60' }}>
                    {unlocked ? '✓ Desbloqueada' : `${badge.xpRequired} XP`}
                  </p>
                </div>
              </div>
              {unlocked && (
                <p className="text-xs text-[#4B4B6B] leading-snug">{badge.trivia}</p>
              )}
              {!unlocked && (
                <p className="text-xs text-[#1A1A2E]/40 leading-snug">Necesitas {badge.xpRequired} XP para desbloquear</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [modId, setModId] = useState(1)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [xp, setXp] = useState(0)
  const [streak] = useState(3)
  const [hearts, setHearts] = useState(5)
  const [xpAnim, setXpAnim] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [floatingXPs, setFloatingXPs] = useState<{ id: number; amount: number }[]>([])
  const [activeView, setActiveView] = useState<'module' | 'progress'>('module')
  const [unlockedBadges, setUnlockedBadges] = useState<Set<string>>(new Set(['b0']))
  const [newBadgeAlert, setNewBadgeAlert] = useState<Badge | null>(null)
  const xpIdRef = useRef(0)
  const mainRef = useRef<HTMLDivElement>(null)
  const unlockedBadgeIdsRef = useRef<Set<string>>(new Set(['b0']))

  const mod = MODULES.find(m => m.id === modId)!
  const progress = Math.round((completed.size / MODULES.length) * 100)

  function gainXP(n: number) {
    setXp(x => {
      const next = x + n
      const newlyUnlocked = BADGES.filter(b => b.xpRequired > x && b.xpRequired <= next && !unlockedBadgeIdsRef.current.has(b.id))
      if (newlyUnlocked.length > 0) {
        const badge = newlyUnlocked[newlyUnlocked.length - 1]
        unlockedBadgeIdsRef.current = new Set([...unlockedBadgeIdsRef.current, ...newlyUnlocked.map(b => b.id)])
        setUnlockedBadges(prev => new Set([...prev, ...newlyUnlocked.map(b => b.id)]))
        setNewBadgeAlert(badge)
        setTimeout(() => setNewBadgeAlert(null), 4500)
      }
      return next
    })
    setXpAnim(true)
    setTimeout(() => setXpAnim(false), 700)
    const id = ++xpIdRef.current
    setFloatingXPs(prev => [...prev, { id, amount: n }])
  }

  function removeFloatingXP(id: number) {
    setFloatingXPs(prev => prev.filter(f => f.id !== id))
  }

  function navigate(id: number) {
    setModId(id)
    setActiveView('module')
    setSidebarOpen(false)
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FFFBF0', fontFamily: "'Nunito', sans-serif" }}>

      {/* Floating XP notifications */}
      {floatingXPs.map(f => (
        <FloatingXP key={f.id} id={f.id} amount={f.amount} onDone={removeFloatingXP} />
      ))}

      {/* Badge unlock toast */}
      {newBadgeAlert && (
        <div
          className="fixed top-4 right-4 z-50 animate-bounce-in"
          style={{ maxWidth: '280px' }}
        >
          <div
            className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: '#1A1A2E', border: '3px solid #FFC800', boxShadow: '4px 4px 0 #FFC800' }}
          >
            <span className="text-3xl flex-shrink-0">{newBadgeAlert.emoji}</span>
            <div>
              <p className="text-[#FFC800] text-xs font-black uppercase tracking-widest mb-0.5">¡Insignia desbloqueada!</p>
              <p className="text-white font-black text-sm leading-tight">{newBadgeAlert.name}</p>
              <p className="text-white/60 text-xs mt-1 leading-snug">{newBadgeAlert.trivia}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40 w-72 flex flex-col
          border-r-4 border-[#1A1A2E] transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
        style={{ background: '#FFFBF0' }}
      >
        {/* Logo */}
        <div className="p-5 border-b-4 border-[#1A1A2E] flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-3 border-[#1A1A2E] font-black"
            style={{ background: '#FF4B4B', boxShadow: '3px 3px 0 #1A1A2E', borderWidth: 3 }}
          >
            🇪🇸
          </div>
          <div>
            <div className="font-black text-[#1A1A2E] text-lg leading-tight" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Prueba CCSE
            </div>
            <div className="text-xs font-bold text-[#1A1A2E]/50 uppercase tracking-wider">Nacionalidad Española</div>
          </div>
        </div>

        {/* Progress */}
        <div className="px-5 py-4 border-b-2 border-[#1A1A2E]/20">
          <div className="flex justify-between text-xs font-black text-[#1A1A2E]/60 uppercase tracking-wider mb-2">
            <span>Progreso</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 w-full bg-[#1A1A2E]/10 rounded-full overflow-hidden border border-[#1A1A2E]/20">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: '#58CC02' }}
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {MODULES.map(m => {
            const isActive = activeView === 'module' && m.id === modId
            const isDone = completed.has(m.id)
            return (
              <button
                key={m.id}
                onClick={() => navigate(m.id)}
                className="w-full text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all font-bold"
                style={{
                  borderColor: isActive ? m.color : 'transparent',
                  background: isActive ? m.color + '20' : 'transparent',
                  boxShadow: isActive ? `3px 3px 0 ${m.color}` : 'none',
                  color: '#1A1A2E',
                }}
              >
                <span className="text-xl">{m.emoji}</span>
                <span className="flex-1 text-sm leading-snug">{m.title}</span>
                {isDone && <span className="text-[#58CC02] text-base">✓</span>}
              </button>
            )
          })}
          <button
            onClick={() => { setActiveView('progress'); setSidebarOpen(false) }}
            className="w-full text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all font-bold"
            style={{
              borderColor: activeView === 'progress' ? '#CE82FF' : 'transparent',
              background: activeView === 'progress' ? '#CE82FF20' : 'transparent',
              boxShadow: activeView === 'progress' ? '3px 3px 0 #CE82FF' : 'none',
              color: '#1A1A2E',
            }}
          >
            <span className="text-xl">🏅</span>
            <span className="flex-1 text-sm leading-snug">Mi Progresión</span>
            <span className="text-xs font-black text-[#CE82FF]">{unlockedBadges.size}/{BADGES.length}</span>
          </button>
        </nav>

        {/* XP display */}
        <div className="p-4 border-t-4 border-[#1A1A2E]">
          <div
            className={`rounded-xl border-2 border-[#1A1A2E] p-3 flex items-center justify-between transition-all duration-300 ${xpAnim ? 'scale-105' : ''}`}
            style={{ background: xpAnim ? '#FFC800' : '#FFC80030', boxShadow: xpAnim ? '4px 4px 0 #1A1A2E' : 'none' }}
          >
            <div className="flex items-center gap-2">
              <span className={`text-xl transition-transform ${xpAnim ? 'animate-pop' : ''}`}>⭐</span>
              <span className={`font-black text-[#1A1A2E] text-lg transition-all ${xpAnim ? 'animate-pop' : ''}`}>
                {xp} XP
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm font-black">
              <span>🔥 {streak}</span>
              <span>❤️ {hearts}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div ref={mainRef} className="flex-1 overflow-y-auto relative">

        {/* Top bar */}
        <div
          className="sticky top-0 z-20 px-4 md:px-8 h-16 flex items-center justify-between border-b-4 border-[#1A1A2E]"
          style={{ background: '#FFFBF0' }}
        >
          <button
            className="md:hidden w-10 h-10 rounded-xl border-2 border-[#1A1A2E] flex items-center justify-center font-black"
            style={{ boxShadow: '2px 2px 0 #1A1A2E' }}
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            {MODULES.map(m => (
              <button
                key={m.id}
                onClick={() => navigate(m.id)}
                className="hidden md:flex w-9 h-9 rounded-full border-2 border-[#1A1A2E] items-center justify-center text-base transition-transform hover:scale-110"
                style={{
                  background: m.id === modId ? m.color : completed.has(m.id) ? '#58CC02' : '#e5e0d4',
                  boxShadow: m.id === modId ? `3px 3px 0 #1A1A2E` : 'none',
                }}
                title={m.title}
              >
                {completed.has(m.id) ? '✓' : m.emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-sm font-black text-[#1A1A2E]">
            <span
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-[#1A1A2E] transition-all duration-300 ${xpAnim ? 'scale-125 shadow-brutal-sun' : ''}`}
              style={{ background: '#FFC800', boxShadow: xpAnim ? '4px 4px 0 #1A1A2E' : '2px 2px 0 #1A1A2E' }}
            >
              ⭐ <span className={xpAnim ? 'animate-pop' : ''}>{xp}</span>
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full border-2 border-[#1A1A2E]" style={{ background: '#FF4B4B22' }}>
              🔥 {streak}
            </span>
            <span className="flex items-center gap-1 px-3 py-1 rounded-full border-2 border-[#1A1A2E]" style={{ background: '#FF4B4B22' }}>
              ❤️ {hearts}
            </span>
          </div>
        </div>

        {/* Content */}
        {activeView === 'progress' ? (
          <ProgressionMap xp={xp} unlockedBadges={unlockedBadges} />
        ) : null}
        <div className={`max-w-3xl mx-auto px-4 md:px-8 py-8 pb-24 space-y-10 ${activeView === 'progress' ? 'hidden' : ''}`}>

          {/* ── Hero ── */}
          <div
            className="rounded-3xl overflow-hidden border-4 border-[#1A1A2E] relative"
            style={{ boxShadow: `6px 6px 0 #1A1A2E` }}
          >
            <div className="relative h-52 md:h-64">
              <img
                src={mod.heroImage}
                alt={mod.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 60%)' }} />
              <div className="absolute bottom-4 left-5 right-5">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-2 border-2 border-white/50"
                  style={{ background: mod.color }}
                >
                  <span>{mod.emoji}</span>
                  <span className="text-white">Módulo {mod.id}</span>
                </div>
                <h1
                  className="text-white text-2xl md:text-3xl leading-tight font-black"
                  style={{ fontFamily: "'Fredoka One', cursive", textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}
                >
                  {mod.title}
                </h1>
              </div>
            </div>
          </div>

          {/* ── Theory ── */}
          <div
            className="rounded-2xl border-3 border-[#1A1A2E] p-6"
            style={{ borderWidth: 3, background: mod.color + '12', boxShadow: `4px 4px 0 ${mod.color}` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📖</span>
              <h2 className="font-black text-[#1A1A2E] uppercase text-xs tracking-widest">Teoría Principal</h2>
            </div>
            <div dangerouslySetInnerHTML={{ __html: mod.theory }} />
          </div>

          {/* ── Key Points Accordion ── */}
          {mod.steps.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📌</span>
                <h2 className="font-black text-[#1A1A2E] uppercase text-xs tracking-widest">Datos Clave</h2>
              </div>
              <div className="flex flex-col gap-3">
                {mod.steps.map((step, i) => (
                  <AccordionItem key={i} step={step} index={i} color={mod.color} />
                ))}
              </div>
            </div>
          )}

          {/* ── GIF Gallery ── */}
          {mod.gifs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎬</span>
                <h2 className="font-black text-[#1A1A2E] uppercase text-xs tracking-widest">Ejemplos Culturales</h2>
              </div>
              <div className={`grid gap-4 ${mod.gifs.length >= 3 ? 'grid-cols-3' : mod.gifs.length === 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-lg mx-auto w-full'}`}>
                {mod.gifs.map((gif, i) => (
                  <MediaCard key={i} gif={gif} color={mod.color} />
                ))}
              </div>
            </div>
          )}

          {/* ── Pro Tip / Warning ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mod.proTip && (
              <div
                className="rounded-2xl border-3 border-[#1A1A2E] p-5"
                style={{ borderWidth: 3, background: '#FFC800' + '20', boxShadow: '3px 3px 0 #FFC800' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h3 className="font-black text-[#1A1A2E] mb-1">¿Sabías que...?</h3>
                    <p className="text-sm text-[#1A1A2E]/80 font-semibold leading-relaxed">{mod.proTip}</p>
                  </div>
                </div>
              </div>
            )}
            {mod.mistakes && (
              <div
                className="rounded-2xl border-3 border-[#1A1A2E] p-5"
                style={{ borderWidth: 3, background: '#FF4B4B' + '15', boxShadow: '3px 3px 0 #FF4B4B' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-black text-[#1A1A2E] mb-1">¡Atención!</h3>
                    <p className="text-sm text-[#1A1A2E]/80 font-semibold leading-relaxed">{mod.mistakes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Interactive Map ── */}
          {mod.showMap && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📍</span>
                <h2 className="font-black text-[#1A1A2E] uppercase text-xs tracking-widest">Mapa Interactivo: Comunidades Autónomas</h2>
              </div>
              <MapGame color={mod.color} />
            </div>
          )}

          {/* ── Exercises ── */}
          <div
            className="rounded-2xl border-3 border-[#1A1A2E] p-6"
            style={{ borderWidth: 3, background: '#fff', boxShadow: `5px 5px 0 #1A1A2E` }}
          >
            <Exercises mod={mod} onXP={gainXP} />
          </div>

          {/* ── Complete ── */}
          <div className="pt-4 border-t-4 border-dashed border-[#1A1A2E]/20">
            <button
              onClick={() => {
                setCompleted(prev => {
                  const next = new Set(prev)
                  if (next.has(mod.id)) next.delete(mod.id)
                  else { next.add(mod.id); gainXP(50) }
                  return next
                })
              }}
              className="px-6 py-3 rounded-2xl border-3 border-[#1A1A2E] font-black text-sm flex items-center gap-2 transition-all"
              style={{
                borderWidth: 3,
                background: completed.has(mod.id) ? '#58CC02' : mod.color,
                color: '#fff',
                boxShadow: completed.has(mod.id) ? '4px 4px 0 #1A1A2E' : `4px 4px 0 #1A1A2E`,
              }}
            >
              {completed.has(mod.id) ? '✅ Módulo Completado — +50 XP!' : '⬜ Marcar como Completado (+50 XP)'}
            </button>
          </div>

          {/* ── Navigation ── */}
          <div className="flex justify-between items-center pt-2">
            <button
              disabled={mod.id === 1}
              onClick={() => navigate(mod.id - 1)}
              className="px-5 py-2.5 rounded-xl border-2 border-[#1A1A2E] font-black text-sm disabled:opacity-30 flex items-center gap-2 transition-all hover:bg-[#1A1A2E]/5"
              style={{ boxShadow: mod.id === 1 ? 'none' : '3px 3px 0 #1A1A2E' }}
            >
              ← Anterior
            </button>
            <span className="text-sm font-black text-[#1A1A2E]/40">
              {mod.id} / {MODULES.length}
            </span>
            <button
              disabled={mod.id === MODULES.length}
              onClick={() => navigate(mod.id + 1)}
              className="px-5 py-2.5 rounded-xl border-2 border-[#1A1A2E] font-black text-sm disabled:opacity-30 flex items-center gap-2 transition-all"
              style={{
                background: mod.color,
                color: '#fff',
                boxShadow: mod.id === MODULES.length ? 'none' : `3px 3px 0 #1A1A2E`,
              }}
            >
              Siguiente →
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
