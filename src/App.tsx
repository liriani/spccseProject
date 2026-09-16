import { useState, useRef, useMemo, useEffect, type CSSProperties } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TimelineMindMap } from './components/timeline/TimelineMindMap'
import { DocumentWallet } from './components/sociedad/DocumentWallet'
import { RoutineTimeSlider } from './components/sociedad/RoutineTimeSlider'
import { EmergencyPhone } from './components/sociedad/EmergencyPhone'
import { FestiveCalendar } from './components/cultura/FestiveCalendar'

// ─── Types ────────────────────────────────────────────────────────────────────

type Challenge =
  | { type: 'checkbox'; question: string; options: { text: string; correct: boolean; specificFeedback?: string }[]; explanation?: string }
  | { type: 'dropdown'; parts: (string | { options: string[]; answer: string })[]; explanation?: string }
  | { type: 'dragdrop'; wordBank: string[]; parts: (string | { answer: string })[]; explanation?: string }
  | { type: 'map_pin'; targetId: string; targetName: string; explanation?: string }
  | { type: 'matching'; prompt: string; pairs: { left: string; right: string }[]; wrongHint?: string; explanation?: string }
  | { type: 'visual_scenario'; scene: { emoji: string; title: string; setting: string; stageBg: string; bgEmojis: string[]; dropZoneLabel: string; successEmoji: string; successText: string }; answer: string; distractors: string[]; wrongHint?: string; explanation?: string }

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

const SPAIN_REGIONS = [
  { id: 'galicia',              name: 'Galicia',                       x: 16, y: 17 },
  { id: 'asturias',             name: 'Principado de Asturias',        x: 33, y: 7  },
  { id: 'cantabria',            name: 'Cantabria',                     x: 44, y: 9  },
  { id: 'pais_vasco',           name: 'País Vasco',                    x: 52, y: 7  },
  { id: 'navarra',              name: 'Comunidad Foral de Navarra',    x: 59, y: 14 },
  { id: 'aragon',               name: 'Aragón',                        x: 66, y: 35 },
  { id: 'cataluna',             name: 'Cataluña',                      x: 77, y: 28 },
  { id: 'castilla_leon',        name: 'Castilla y León',               x: 40, y: 26 },
  { id: 'madrid',               name: 'Comunidad de Madrid',           x: 44, y: 40 },
  { id: 'extremadura',          name: 'Extremadura',                   x: 30, y: 54 },
  { id: 'castilla_la_mancha',   name: 'Castilla-La Mancha',            x: 51, y: 54 },
  { id: 'comunidad_valenciana', name: 'Comunidad Valenciana',          x: 67, y: 56 },
  { id: 'murcia',               name: 'Región de Murcia',              x: 62, y: 71 },
  { id: 'andalucia',            name: 'Andalucía',                     x: 40, y: 83 },
  { id: 'baleares',             name: 'Islas Baleares',                x: 85, y: 55 },
  { id: 'canarias',             name: 'Canarias',                      x: 12, y: 93 },
  { id: 'la_rioja',             name: 'La Rioja',                      x: 55, y: 20 },
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
      viewBox="228 0 400 312"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <rect x="228" y="0" width="400" height="312" fill="#bfdbfe" />
      <g fill="#dcfce7" stroke="#4ade80" strokeWidth="0.8" strokeLinejoin="round">
    
    <path d="m 438.39514,249.58858 -0.01,0.64 -1.23,0.51 -0.44,1.01 -1.72,0.46 -2.19,-2.7 -1.48,-1.17 -1.33,-0.24 -1.63,1.04 -1.35,-0.9 0.35,0.36 -0.44,-0.32 -2.25,0.65 -1.68,3.23 -0.68,0.73 -1.44,0.57 -1.91,0.06 -1.17,-0.81 -0.95,0.35 -2.01,-1.94 -1.45,0.48 -7.49,-0.55 -2.3,0.53 -0.72,0.81 -1.5,0.69 -1.64,-0.11 -1.26,-0.95 0.11,0.23 -0.9,0.12 -1.26,-0.99 -1.5,-0.09 -0.55,0.58 -1.03,-0.11 -0.38,0.46 -0.55,-0.62 -0.48,0.27 -1.83,-0.84 -3.32,0.95 -3.05,-0.75 -0.99,0.82 -2.11,0.31 -3.96,0.11 -1.82,-0.38 -0.58,0.53 0.04,-0.39 -2.68,4.01 -0.6,0.61 -1.92,0.69 -0.9,1.82 -2.84,0.77 -2.97,-0.73 -1.61,0.02 -2.56,1.58 -2.04,0.29 -2.02,1.19 -0.61,-0.03 -1.15,1.33 -0.77,2.24 -1.85,2.64 -0.62,2.51 -0.7,-0.04 -0.58,-0.73 -1.08,0.11 -0.6,1.16 0.46,2.38 -0.92,0.69 -0.59,-0.13 -3.3,1.59 -0.99,-1.41 -1.16,-0.62 -0.99,0.21 -1.52,-0.93 -0.52,0.33 -1.72,-2.25 -1.54,-1.3 -3.24,0.08 -1.86,-3.46 -1.04,-0.39 -1.01,-2.36 -1,-0.91 -1.97,-4.35 -0.78,-0.16 1.04,-0.51 -0.32,0.33 0.35,0.1 0.06,-0.32 -0.12,0.42 0.52,1 0.13,-0.39 0.08,0.25 0.74,-1.3 0.23,-0.92 -0.25,-0.46 -1,0.05 -0.92,-1.27 -0.61,0.18 0.28,-0.18 -0.5,-0.23 0.09,0.48 -0.5,-0.53 -0.37,0.36 -0.99,-0.64 -1.33,-3.52 2.32,-1.85 -1.11,-0.65 -1.29,-3.12 -2.24,-2.67 -6.37,-4.23 -2.78,-1.28 -1.89,-1.49 0.6,0.96 2.21,1.81 -3.02,-2.61 -0.65,-0.08 0.39,0.42 -0.34,-0.02 -2.69,-1.23 -7.37,0.57 -0.99,0.79 -0.97,-0.38 -0.3,-1.66 -0.5,-0.67 0.32,-0.8 -0.56,-1.25 0.03,-2.71 -0.62,-0.66 0.5,-0.32 -0.66,-1.73 0.17,-0.59 -0.57,-0.38 -0.21,-0.84 -0.54,-0.06 -0.33,-1.05 0.42,-0.2 0.1,-1.55 1.36,-1.49 0.92,-3.74 0.75,-0.23 2.54,-2.58 0.53,-1.92 0.71,-1.01 -0.09,-1.9 1.55,-0.7 1.97,-0.01 0.11,-0.89 0.67,-0.48 1.1,0.84 1.47,-0.13 0.57,-2.79 0.94,-1.72 -0.38,-0.21 0.03,-0.51 0.92,-1.15 0,0 2.32,1.04 1.38,-0.04 -0.44,2.28 1.05,-0.02 0.03,0.43 0.63,0.27 0.72,-0.31 1.94,0.35 0.56,-0.27 0.69,0.73 0,0 0.43,0.52 0,0 0.12,1.33 0.66,-0.2 0,0 0.32,0 0,0 1.94,0.75 0.31,-0.21 -0.16,-0.61 0.73,-0.58 -0.25,-0.32 1.03,-0.1 1.24,0.32 0.28,1.15 0.74,0.63 0,0 0.13,0.05 0,0 0.62,0.63 1.4,0.25 0.37,0.41 1.03,-0.1 0.56,0.74 1.77,-1.51 1.78,-0.46 2.67,0.09 0.49,-1.78 0.71,-0.72 -0.57,-0.73 0.08,-0.58 1.24,-0.93 0.08,-0.79 0.71,-0.56 1.41,-0.1 0.49,-0.38 0.69,0.17 0.78,-0.56 1.13,0.53 0.04,0.73 -0.26,-0.36 -0.31,0.17 0.26,0.54 -1.24,0.79 0.19,1.39 0.77,0.23 1.93,-1.93 1.42,0.22 0.19,-0.64 1.03,-0.44 -0.15,-0.77 0.35,-0.66 0,0 0.1,-0.05 0,0 0.04,-2 -1.3,-2.28 0.44,-1.28 -0.74,-0.71 0.03,-0.55 1.01,-1.66 0.72,-0.46 0.96,0 0.13,-0.72 1.85,-1.25 0,0 -0.11,-0.26 0,0 0.39,-0.67 0.47,0.26 -0.22,-0.5 0.62,-1.03 1.7,0.17 -0.09,-0.51 0.52,-0.64 0.97,-0.5 0.88,-1.1 0.25,0.26 0.15,-0.63 0.22,0.38 0.1,-0.35 0.33,0.27 -0.01,-0.53 0.47,-0.06 0,0 0.04,-0.08 0,0 -0.46,-1.34 2.35,0.36 1.4,-0.77 0,0 0.99,0.43 0.21,0.78 1.57,0.43 1.88,-0.08 0.51,2.45 4.1,1.41 0.12,0.67 1.02,0.17 1.18,0.89 0.78,1.27 0.22,-0.28 0.52,0.18 0.2,0.5 0.48,-0.18 2.39,2.81 4.49,2 0.49,-0.13 -0.25,-1.13 0.37,-0.69 3.64,0.72 5.87,0.38 1.61,-0.2 0.67,-0.63 0.19,-0.79 0.67,-0.2 0,0 0.5,-0.16 0,0 1.14,0.39 0.27,-0.35 3.12,1.06 0.73,-0.38 0.16,-1.5 0.38,-0.07 0.85,0.31 0.21,1.12 1.64,0.38 1.2,-0.3 1.31,-1.18 -0.04,-0.68 0,0 0.11,-0.31 0,0 1.31,-0.42 0,0 0.15,0.07 0,0 1.21,0.74 3.8,0.64 1.93,-1.33 1.74,2.39 0.23,-1.48 0.75,-0.63 1.66,0.01 0.63,0.57 0.54,-0.8 0.63,-0.34 0.21,0.26 0,-0.34 1.06,-0.51 0.11,-0.43 0.2,0.17 0.29,-0.77 2.58,1.27 1.79,-0.62 0,0 0.25,0 0,0 0.86,0.78 -0.11,2.64 2.44,0.62 -0.06,3.28 1.19,0.55 0.16,0.72 -0.5,1.68 0.2,1.08 -2.91,3.53 0.75,0.44 0,0 0.35,0 0,0 2.49,1.32 2.22,0.2 0,0 1.11,0.78 1.25,2.23 2.19,1.7 1.31,-0.41 1.07,0.94 0.6,-0.35 1.11,0.51 0.44,-0.39 0.49,0.21 0,0 0.17,-0.01 0,0 0.2,0.26 -0.57,0.79 -0.37,2.29 0.37,1.65 -0.47,0.92 0.3,1.64 0,0 0.18,0.19 0,0 4.08,6.6 0.98,0.72 -0.04,-0.62 2.05,0.37 2.96,2.32 0,0 -1.34,0.7 -0.88,1.64 -2.49,2.7 -1.34,5.33 -1.4,2.71 0.13,1.37 -0.29,0.42 -0.91,0 -0.72,1.26 -0.63,0.13 -0.35,0.47 0.11,1.39 -1.07,0.51 -0.62,0.94 z" />
    
    <path d="m 444.20514,66.648576 0.28,0.55 1.87,-0.03 1.43,1.39 1.7,-0.31 2.62,1.83 0,0 0.66,0.13 0,0 0.52,-0.16 0,0 0.32,-0.3 0,0 2.51,0.15 0.76,-0.9 -0.09,-0.49 1.19,-2.2 0.93,-0.93 -0.16,-1.1 0,0 -0.28,0.03 0,0 -0.84,-0.02 -0.39,-1.22 -0.88,-0.73 0.19,-1.99 -0.68,-1.44 0.7,-1.97 -0.2,-0.66 1.89,-2.29 -0.14,-0.6 -0.66,-0.27 0.49,-1.68 1.76,-1.87 -0.33,-1.78 0.64,-1.24 0.96,0.53 0.57,-0.25 0,0 0.14,0 0,0 0.04,-1.07 1.18,-0.79 -0.56,-0.46 0.6,0.02 0.12,-1.36 3.06,0.04 0.01,-1.62 0.38,-0.35 1.54,-0.11 1.26,-1.48 0.61,0.01 0.01,-0.64 0.97,-0.08 0.46,-0.89 -0.33,-0.45 0.11,-1.76 1,-0.79 0.08,-1.26 0.94,-0.71 1.57,0.07 0,0 -0.23,0.85 0.96,0.65 0.5,-0.22 0.56,0.89 1.49,1.08 0.04,0.93 0.9,-0.01 0.03,0.91 0.42,0.16 0.23,-0.56 0.43,-0.02 0.06,-0.65 0.61,-0.61 1.68,1.21 0.86,-0.46 0.7,0.23 1,-1.33 0.59,0.11 0.34,-0.56 1.49,1.06 0.41,-0.08 0.13,0.53 1.38,0.8 0.74,-0.41 1.48,2.86 1.01,0.11 0.19,0.83 1.26,0.37 0.65,-0.16 0.17,-0.44 0.97,0.19 0.74,-0.68 0.98,0.15 1.32,-0.46 0.39,-0.52 2.27,0.78 0.11,0.83 0.83,0.73 0.72,-0.36 0.12,-0.79 0.95,-0.72 1.7,1.23 1.54,-0.34 1.04,0.31 0.29,-0.42 1.61,0.29 0.28,-0.39 1.74,0.53 0,0 0.11,0.26 0,0 0.22,0.14 0,0 0.61,0.82 0.27,1.34 1.68,0.42 -0.69,2.45 0.25,0.38 -0.43,-0.19 -0.36,0.45 -0.04,0.52 0.53,0.28 -0.68,0.66 -0.34,-0.26 -0.3,0.32 1.48,3.7 -0.62,0.69 1.28,0.52 -0.81,0.55 0.65,0.55 -1.68,4.88 -0.12,0.6 0.46,0.32 -0.57,0.48 0.24,1.23 -0.87,2.59 -0.39,0.24 0,1.51 -0.33,0.62 -0.12,-0.39 -0.54,0.18 -0.35,0.99 -0.49,-0.21 -0.67,1.05 1.21,0.66 -0.31,0.07 -0.09,1.14 0.4,0.51 -0.72,0.31 -0.02,0.42 -0.66,-0.03 -0.33,1.15 -0.81,-0.02 -0.83,0.76 -0.42,1.29 -1.87,0.25 -0.09,0.93 -0.31,-0.29 -1.58,2.21 -0.04,0.68 0.87,1.05 -0.21,1.16 1.42,0.24 0.71,-0.33 0.53,2.14 -1.36,1.89 -1.51,0.21 0.34,1.21 -0.94,2.01 1.44,1.51 -0.7,0.89 0.57,0.43 -0.11,0.52 0.59,0.94 -0.21,1.51 -0.39,-0.05 -0.05,0.47 -1.14,0.06 -0.72,2.37 -1.12,0.27 -0.17,0.7 -0.9,-0.26 -0.34,0.4 0.01,1.430004 0.51,0.09 0.3,0.97 -0.34,0.46 0.37,-0.18 -0.01,0.45 0.37,-0.21 0.89,0.72 -0.49,0.19 0.6,1.21 0,0 -0.05,0.28 0,0 0.34,0.22 -1.09,1.82 0,0 0.03,0.2 0,0 -0.39,1.07 1.04,2.23 -1.19,1.21 -0.14,0.7 -1.43,0.44 -0.05,0.48 -0.39,-0.31 0.25,0.57 0,0 -0.62,0.52 -1.06,-0.29 -1.84,1.27 0,0 -0.32,-0.11 0,0 -0.32,-1.01 0,0 -0.01,-0.11 0,0 -0.54,-0.17 0,0 -0.54,0.03 0,0 -1.09,0.09 -1.23,-0.58 -0.97,-0.86 -0.02,-0.62 -1.41,0.05 -0.94,1.54 -0.16,1.77 -1.93,1.1 -0.61,-0.69 -1.33,0.5 0.26,1.87 1.24,0.37 0.84,-0.25 -0.19,3.41 0.65,0.56 0.12,0.8 -1.68,0.68 -0.35,0.54 1.63,1.95 0.15,0.79 -1.59,0.91 -0.74,1.23 -0.63,-0.03 -0.3,0.41 0.47,1.08 -1.18,0.72 -1.8,0.55 -1.39,-0.84 -0.95,4.05 -0.83,0.39 -0.5,0.82 0.36,1.16 -0.44,-0.13 -1.37,1.06 -1.97,-0.06 -0.73,1.84 -1.47,0.59 -0.05,1.89 1.12,1.5 -2.03,1.2 -1.15,-0.87 0.3,-0.63 -0.34,-0.98 0.24,-0.76 -0.44,-0.89 -0.32,0.28 -1.51,-0.85 -2.27,0.08 -0.55,0.38 -0.65,-0.14 -0.22,0.37 -0.47,-0.33 0,0 -0.63,-1.45 0,0 2.22,-0.91 0.33,-0.47 -0.17,-0.69 -1.91,-1.54 -2.65,-0.13 0,-1.02 -0.81,-0.5 -0.44,-1.05 0,0 -0.17,-0.43 0,0 -0.03,-0.32 -0.54,0.46 0.01,1.78 -0.45,0.2 0,0 -0.49,0.43 0,0 -0.62,-0.3 -0.49,0.2 0,0 -0.3,-0.18 0,0 -1.28,-0.18 0,0 0.29,-1.9 -0.96,0.41 -0.95,-0.64 -0.87,0.45 -4.03,-4.27 -0.81,1.16 -0.24,-0.87 0.25,-0.57 0.61,-0.05 -0.66,-0.76 0,0 -0.16,-0.09 0,0 -1.33,-1.68 -0.73,-0.29 0.03,-0.38 0.22,-0.32 0.24,0.22 1.09,-1.92 1.41,-0.79 -0.25,-1.68 0.24,-1.44 0.53,-0.56 2.04,1.05 1.42,-1.22 -0.48,-0.63 0.75,-2.58 -0.66,-1.84 0.54,-0.75 0.07,-1.26 -0.48,-1.24 -0.45,-0.09 -1.3,-1.7 0.34,-1.72 0,0 -0.25,-0.58 0,0 -0.86,-0.76 0,0 -0.31,-0.49 0,0 -3.86,-4.000004 -1.4,-0.47 -1.28,-1.22 0,0 -0.34,0.1 0,0 -1.33,-1.39 -2.54,0.85 0,0 -0.74,-0.9 -1.77,-0.44 -0.79,-3.78 0.55,-1.57 -0.17,-0.74 1.05,-0.61 0.64,-2.69 1.76,0.65 -0.22,1.14 0.4,0.43 2.45,-0.83 0.03,-0.49 -0.46,-0.13 0.05,-1.35 -0.75,-0.89 0.39,-2.15 -0.76,-1.25 0.05,-0.72 1.86,0.03 0.74,-1.27 0,0 0.24,-0.14 0,0 0.37,-0.02 0.43,-0.84 1.38,-0.08 -0.09,-0.85 1,-1.37 -0.91,-0.44 0.12,-0.62 -1.37,-1.29 0.92,-1.37 0.04,-0.96 -1,-1.86 -0.05,-2.3 0,0 z" />
    
    <path d="m 335.46514,5.658576 0.33,0.63 1.35,0.44 -0.23,0.53 0.59,0.36 0.3,0.88 2.14,0.43 -0.42,0.37 -0.22,-0.24 0.13,0.63 0.34,-0.27 -0.32,0.53 0.64,0.08 0.23,-0.33 0.47,0.29 0.77,-0.59 0.69,0.38 2.05,-0.18 0.61,0.31 2.39,-0.4 0.51,0.93 0.44,-0.34 2.11,0.16 2.16,2.3 2.5,-0.39 3,0.98 2.38,-0.15 1.41,0.72 0.96,-0.12 0.1,0.47 0.6,-0.22 3.18,1.18 2.08,0.46 2.9,0.05 0,0 0.03,0.49 -0.75,0.9 0.59,1.63 -0.14,1.27 -0.71,0.36 -0.12,-0.66 -1.44,-0.5 -0.71,1.2 -2.62,0.39 0.27,0.84 -0.48,1.74 -1.1,-0.19 -0.89,0.38 0,0 -0.14,-0.07 0,0 -0.61,0.08 0,0 -0.83,-1.64 -1.15,-0.39 -1.44,0.97 -0.87,1.39 -0.67,-0.41 -1.46,0.13 -0.72,2.92 -1.04,-0.04 -0.21,-0.42 -1.61,0.79 0,0 -0.08,0.18 0,0 -3.14,0.36 -0.52,-0.58 -0.68,-0.02 -0.42,0.31 -0.19,1.37 -2.41,-0.2 -0.38,1.25 -3.85,-0.49 -1.51,-0.86 -1.02,0.57 -1.07,2.06 0.08,0.6 -1.16,0.25 -0.99,0.03 -0.54,-0.65 -0.76,0.02 0.08,-0.5 -0.72,0.04 -1.18,-1.01 -0.47,-1.69 -1.26,0.37 -1.64,-0.75 -0.47,1.63 -1.08,0.44 -1.08,-1.02 -1.03,0.02 -0.35,1.37 -1.01,-0.26 -0.55,-0.71 -0.3,0.34 -0.85,-0.18 -0.11,-0.52 -0.74,-0.5 -0.39,0.66 -0.64,0.12 0.11,0.65 -0.5,0.11 -0.33,1.1 -0.38,-0.16 -0.24,0.42 -0.7,-0.37 0,0 -0.18,0.01 0,0 0.13,0.93 1.04,0.13 -0.01,0.86 -1.15,0.24 -0.35,0.51 -0.59,-0.3 -0.88,0.55 -1.86,-0.44 -2.08,0.1 -0.95,0.2 -1.02,1.3 -0.36,-0.04 0.05,-0.6 -1.39,-0.58 0,0 -0.46,-0.46 0.14,-1.16 -0.94,-1.13 -1.02,-0.03 -1.27,-1.72 -0.05,1.48 -0.41,0.02 -0.68,-0.93 0.43,-0.77 0.44,0.24 -0.03,-0.98 0.74,-0.94 0.67,0.45 0.54,-0.63 0.62,0 1.12,-1.16 0.19,-0.77 -0.91,-1.06 -0.79,0.19 0.05,0.35 -1.47,0.92 -0.5,-0.08 -0.64,-1.14 0.42,-0.84 -0.15,-0.58 -0.82,-0.16 -0.25,-0.57 -0.3,0.33 -1.11,-1.12 -0.26,-0.89 0.27,-1.34 -1.08,0.06 -0.82,-1.01 0.06,-1.53 -0.24,-0.51 -0.59,0.33 -0.49,-0.3 0.12,-0.68 0,0 -0.04,-0.13 0,0 0.01,-0.94 1.89,0.1 0.38,-1.05 0.93,-0.65 0,0 0.62,-0.95 -0.28,-0.37 0.31,-0.81 0.7,0.06 -0.68,-0.55 0.06,-0.56 1.47,0.13 0.6,-0.55 0.16,0.21 0.05,-0.46 1.49,0.2 0.35,0.43 0.67,-0.49 1.17,0.61 1.77,-0.44 0.58,0.67 0.38,-0.54 0.96,0.13 1.31,-0.46 0.22,0.38 0.41,-0.14 0.1,0.42 1.54,-0.03 0.24,0.38 1.65,-0.12 0.08,-0.81 1.15,0.67 0.9,-0.27 1.12,0.34 2.69,-1.01 0.32,-0.63 0.63,0.58 0.32,-0.25 0.16,0.47 0.4,-0.24 -0.01,0.56 0.75,-0.17 1.23,0.53 2.63,-1.24 0.64,0.58 1.04,-0.25 0.51,-0.56 -0.26,-0.14 0.88,-0.34 0,-0.65 0.93,-0.02 0.6,-0.47 0.03,-0.71 0.43,-0.04 z" />
    
    <path d="m 405.09514,22.748576 -0.6,-2.02 1.09,-0.51 0.47,0.26 -0.54,1.05 0.03,1.05 0,0 -0.45,0.17 z m -8.22,-11.71 0.02,0.42 0.98,-0.27 0.31,0.62 0.6,-0.11 0.39,0.79 1.92,0.35 0.19,0.78 -0.8,0.17 0.75,1.02 0.48,-0.31 1.22,0.3 1.16,-0.28 -0.05,0.72 0.59,-0.35 2.04,0.48 0.93,1.23 1.09,0.4 0,0 -0.11,1.94 -0.91,0.12 -0.5,0.55 -0.42,-0.93 -1.46,0.7 -0.43,-0.39 -0.75,0.29 -0.25,-0.3 -0.2,0.84 -1.19,0.29 -0.42,0.89 -1.39,0.38 0.22,0.71 0,0 0.18,0.28 0,0 0.46,2.8 0,0 -2.01,0.01 -2.22,-0.71 -0.82,0.09 -0.23,-0.68 -1.04,-0.44 -0.91,1.39 0,0 -0.02,0.17 0,0 -0.57,0.84 -1.32,0.57 -0.33,0.75 -1.79,0 -0.71,-0.35 0.16,1.82 -1.15,-0.01 -0.72,0.98 -0.96,0.51 -0.99,2.53 0.45,0.83 1.17,-0.13 -0.07,0.57 1.78,-2.06 1,0.99 -0.97,1.09 -1.21,-0.48 0.46,0.84 -0.83,-0.01 0.7,0.3 -0.41,0.55 0,0 -0.04,0.21 0,0 1.1,0.33 0.23,-1.35 0.75,0.36 0.58,1.64 -0.16,1.28 -1.12,0.46 -0.82,-0.66 -0.48,1.35 -0.55,-0.21 -1.28,0.56 -0.12,-0.38 -0.46,0 -0.16,-2.3 -0.42,0.44 0.14,0.45 -0.46,0.23 0.13,0.42 -0.56,0.28 0.08,0.59 -0.96,0.16 -0.48,-1.09 -1.36,0.07 -0.91,-0.76 -0.04,-0.42 0.67,-0.61 0.61,0.19 0.28,-0.9 -0.61,-0.51 -1.36,0.98 -0.67,-0.45 0.07,-1.98 -0.4,-0.22 -0.06,-1.49 -2.95,-0.65 -1.46,-2.27 -1.7,-1.01 -0.41,0.82 -1.16,-0.26 -1.03,1.01 -1.28,-0.61 -0.88,0.7 -1.21,-0.34 -1.44,0.2 -0.14,-1.28 -0.63,-0.02 -0.01,-0.71 -1.79,-1 -0.51,-0.88 0.44,-1.18 -0.46,-0.61 0.34,-0.31 0,0 0.61,-0.08 0,0 0.14,0.07 0,0 0.89,-0.38 1.1,0.19 0.48,-1.74 -0.27,-0.84 2.62,-0.39 0.71,-1.2 1.44,0.5 0.12,0.66 0.71,-0.36 0.14,-1.27 -0.59,-1.63 0.75,-0.9 -0.03,-0.49 0,0 1.12,0.17 1.42,-0.35 0.98,0.28 1.24,-0.55 0.44,0.6 1.16,0.04 2.86,-0.49 1.71,-0.66 0.82,-0.73 0.74,0.18 0.21,-0.44 0.34,0.43 0.38,-0.59 1.48,0.4 -0.36,-0.13 0.93,-1.1 2.91,-0.31 0.72,-0.6 0.74,0.12 -0.06,0.52 0.63,0.39 -1.06,0.24 -0.9,0.71 -0.01,0.4 0.65,0.23 -0.11,0.85 0.25,-0.54 0.12,0.27 0.63,-0.4 -0.35,-0.41 0.37,-0.04 0.14,-0.59 0.73,-0.07 -0.67,-0.35 1.01,0.04 0.34,-0.55 0.92,-0.06 1.16,-0.87 0.85,0.06 0.73,-0.6 z m -14.25,25.6 0.04,-0.05 0,0 0.02,0 0,0 0.36,0.18 0,0 0.11,0.78 -0.34,0.24 -0.27,-0.82 0,0 0.08,-0.33 z m -1.55,0.12 0.15,0.16 0,0 -0.03,0.17 0,0 -0.3,0.12 0,0 -0.19,-0.26 0,0 -0.04,-0.1 0,0 0.02,-0.09 0,0 0.1,-0.04 0,0 0.29,0.04 z" />
    
    <path d="m 414.47514,44.638576 0.33,0.41 -0.51,-0.2 0,0 0.18,-0.21 z m -1.41,0.14 -0.19,0.1 0,0 0.03,-0.17 0,0 0.07,-0.11 0,0 -0.02,-0.13 0,0 -0.01,-0.04 0,0 0.27,-0.03 0,0 -0.02,0.2 0,0 -0.13,0.18 z m 4.46,-6.62 0.08,-0.05 0,0 2.5,-0.29 2.39,1.05 1.1,-0.19 0.38,0.73 0.83,-0.45 -0.42,1.43 -0.4,0.47 -0.3,-0.14 -0.24,0.69 0.87,1.04 1.48,-0.57 0.15,1.39 -0.84,0.27 -0.17,-0.39 -2.21,0.07 -0.63,-0.91 -1.23,-0.06 -0.38,0.44 -1.34,-0.15 -0.48,-1.18 -1.07,-0.38 -1.22,-1.14 0.82,-1.54 0,0 0.16,-0.47 0,0 0.1,0.17 0,0 0.07,0.16 z m -36.66,-1.41 0.21,0.02 0,0 0.09,0.04 0,0 0,0 0,0 0.06,0.11 0,0 -0.03,0.17 0,0 -0.3,0.12 0,0 -0.19,-0.26 0,0 -0.04,-0.1 0,0 0.02,-0.09 0,0 0.1,-0.04 0,0 0.08,0.03 z m 2.02,-0.06 0.17,0.08 0,0 0.11,0.78 -0.34,0.24 -0.27,-0.82 0,0 0.12,-0.38 0,0 0.02,0 0,0 0.19,0.1 z m -74.12,-3.38 1.39,0.58 -0.05,0.6 0.36,0.04 1.02,-1.3 0.95,-0.2 2.08,-0.1 1.86,0.44 0.88,-0.55 0.59,0.3 0.35,-0.51 1.15,-0.24 0.01,-0.86 -1.04,-0.13 -0.13,-0.93 0,0 0.18,-0.01 0,0 0.7,0.37 0.24,-0.42 0.38,0.16 0.33,-1.1 0.5,-0.11 -0.11,-0.65 0.64,-0.12 0.39,-0.66 0.74,0.5 0.11,0.52 0.85,0.18 0.3,-0.34 0.55,0.71 1.01,0.26 0.35,-1.37 1.03,-0.02 1.08,1.02 1.08,-0.44 0.47,-1.63 1.64,0.75 1.26,-0.37 0.47,1.69 1.18,1.01 0.72,-0.04 -0.08,0.5 0.76,-0.02 0.54,0.65 0.99,-0.03 1.16,-0.25 -0.08,-0.6 1.07,-2.06 1.02,-0.57 1.51,0.86 3.85,0.49 0.38,-1.25 2.41,0.2 0.19,-1.37 0.42,-0.31 0.68,0.02 0.52,0.58 3.14,-0.36 0,0 0.08,-0.18 0,0 1.61,-0.79 0.21,0.42 1.04,0.04 0.72,-2.92 1.46,-0.13 0.67,0.41 0.87,-1.39 1.44,-0.97 1.15,0.39 0.83,1.64 0,0 -0.34,0.31 0.46,0.61 -0.44,1.18 0.51,0.88 1.79,1 0.01,0.71 0.63,0.02 0.14,1.28 1.44,-0.2 1.21,0.34 0.88,-0.7 1.28,0.61 1.03,-1.01 1.16,0.26 0.41,-0.82 1.7,1.01 1.46,2.27 2.95,0.65 0.06,1.49 0.4,0.22 -0.07,1.98 0.67,0.45 1.36,-0.98 0.61,0.51 -0.28,0.9 -0.61,-0.19 -0.67,0.61 0.04,0.42 0.91,0.76 1.36,-0.07 0.48,1.09 0.96,-0.16 -0.08,-0.59 0.56,-0.28 -0.13,-0.42 0.46,-0.23 -0.14,-0.45 0.42,-0.44 0.16,2.3 0.46,0 0.12,0.38 1.28,-0.56 0.55,0.21 0.48,-1.35 0.82,0.66 1.12,-0.46 0.17,-1.29 -0.58,-1.64 -0.75,-0.36 -0.23,1.35 -1.1,-0.33 0,0 0.04,-0.21 0,0 0.41,-0.55 -0.7,-0.3 0.83,0.01 -0.46,-0.84 1.21,0.48 0.97,-1.09 -1,-0.99 -1.78,2.06 0.07,-0.57 -1.17,0.13 -0.45,-0.83 0.99,-2.53 0.96,-0.51 0.66,-0.98 1.15,0.01 -0.16,-1.82 0.71,0.35 1.79,0 0.33,-0.75 1.32,-0.57 0.57,-0.84 0,0 0.02,-0.17 0,0 0.91,-1.39 1.04,0.44 0.23,0.68 0.82,-0.09 2.22,0.71 2.01,-0.01 0,0 4.46,-2.39 0.85,0.98 1.48,-0.22 0.65,0.42 -1.06,1.82 0.78,0.53 0.29,-0.2 0.2,0.46 -0.62,0.86 0.45,0.26 -0.02,1.4 -0.95,0.29 0.85,0.55 2.27,0.15 0.67,0.8 -0.13,0.4 1.68,1.18 -1.07,1.11 -1.97,0.33 -1.54,-0.69 0.06,-0.6 -2.15,-0.57 -1.65,2.51 1.92,2.05 0.26,-0.05 -0.42,-0.41 0.82,-1.12 0.93,0.46 1.05,-1.3 0.28,0.77 -1.36,2.5 0.92,0.57 -0.63,1.17 2.67,-0.29 0.18,0.96 0.69,-0.05 0,0 0,0.13 0,0 0.99,1.23 1.36,-0.14 0.76,0.52 0.14,0.87 0,0 -0.07,0.07 0,0 0.29,0.7 0.84,0.38 0,0 -0.68,0.64 -0.37,-0.25 -0.38,0.3 -0.93,-0.72 -1,0.13 -0.61,-0.35 -0.37,0.46 -1.78,-0.32 0.63,1.91 0,0 -0.41,0.1 0,0 -0.78,1.19 -0.8,0.43 0.26,0.33 0.95,-0.19 0.44,0.35 -0.11,0.95 -0.52,0.56 1.33,1.54 -0.45,0.79 0.18,1.99 -0.69,-0.95 0.11,-0.72 -0.61,-0.02 -0.11,1.12 0.56,0.01 0.58,0.91 -1.26,0.33 0.22,0.85 0,0 0.16,0.12 0,0 -0.31,0.45 0.47,2.47 -0.39,1.19 -0.68,0.58 2.6,4.05 2.62,-0.08 0.59,1.78 0,0 0,0.29 0,0 0.87,0.84 0.83,-0.78 1.2,-0.24 0.42,-2.37 0,0 0.07,-0.25 0,0 0.48,-0.56 0.6,0.23 0.44,-0.26 0.77,0.78 -0.07,0.73 -1.28,1.87 0.3,0.85 1.13,-0.22 0.82,0.66 1.33,-0.35 1.18,0.39 0.89,-2.06 0.89,-0.64 0.05,-1.63 0.76,0.26 0.76,-0.31 0.46,-0.76 3.27,-0.3 1.05,0.5 0.38,1.55 0.9,-0.51 2.92,0.16 -0.03,0.69 -0.87,0.5 1.44,2.23 -0.36,0.31 0.23,1.24 2.67,0.65 0,0 0.16,0.16 0,0 0.74,0.72 0.5,-0.03 2.91,-1.74 0,0 0.04,2.29 1.01,1.86 -0.05,0.97 -0.91,1.36 1.36,1.29 -0.12,0.62 0.91,0.44 -1,1.37 0.09,0.85 -1.37,0.08 -0.43,0.85 -0.37,0.02 0,0 -0.23,0.14 0,0 -0.74,1.27 -1.87,-0.03 -0.05,0.72 0.75,1.25 -0.38,2.15 0.75,0.9 -0.05,1.35 0.46,0.13 -0.03,0.5 -2.45,0.82 -0.4,-0.43 0.22,-1.14 -1.77,-0.65 -0.64,2.69 -1.05,0.62 0.18,0.73 -0.55,1.57 0.79,3.79 1.77,0.44 0.74,0.9 0,0 -0.3,1.2 0.44,1.280004 -0.25,0.33 -2.08,-1.800004 -1.16,1.22 -1.42,-0.49 -0.83,1.020004 -0.81,-0.12 -0.84,0.5 -0.91,-1.040004 -1.68,1.010004 -0.36,-0.53 -1.02,-0.18 -0.38,-1.340004 -0.73,-0.16 -0.22,-1.02 -0.55,-0.46 -1.02,0.81 -0.57,-0.38 0.42,-1.03 -1.15,-0.23 0.77,-0.49 0.1,-0.91 -1.08,0.31 -0.45,-0.85 -1.7,-0.41 -0.24,-0.79 -1.19,0.03 -0.44,0.68 -1.12,-0.11 -1.28,-0.61 -0.11,-1.56 -1.03,-0.38 -0.91,0.47 -0.29,0.77 -1.85,0.13 -1.17,0.54 -3.41,-1.07 -1.27,0.39 -0.58,1.31 -0.49,-0.63 -0.49,0.65 -0.89,-0.12 -0.33,0.33 -1.58,-0.17 -0.53,-0.54 0.42,1.01 -0.12,1.15 -1.09,-0.06 -0.59,1.12 -1.1,0.48 0,0 -0.25,0.23 0,0 -0.06,0.05 0,0 -0.31,-0.1 0,0 -0.31,0 0,0 0,0 0,0 -1.36,0.18 -1.15,0.82 -1.23,1.890004 -1.71,1.05 -1.1,1.88 -3.06,1.23 -0.79,1.38 -0.44,0.09 -1.12,5 -1.34,0.21 -1.15,-0.42 -0.73,1.59 -1.74,2.14 0,0 -0.63,-0.31 0,0 -0.41,0.11 0,0 -1.44,0.23 -0.6,0.46 0,0 0,0 0,0 -0.42,-0.15 -0.78,0.51 -0.05,0.6 0,0 -0.38,0.38 1.18,0.32 0,0 0.33,0.88 -0.3,1.37 -0.87,0.5 -0.16,0.54 0.32,2.47 -0.68,1.03 0.51,0.93 -2.72,0.15 -0.56,0.73 0.1,1.31 -0.6,0.33 0.17,0.76 -1.26,0.22 -0.68,-1.03 -0.54,0.09 0.48,1.74 -1.08,1.23 0.24,1.23 -0.52,0.27 0,0 -1.73,0.67 -1.05,-0.36 -0.18,-1.49 -0.43,-0.39 0.16,-0.76 -1.11,0.31 0,0 -0.56,0.39 0,0 -1.21,-0.5 -0.37,0.77 0.27,0.71 -1.79,1.25 0,0 -0.08,0.18 0,0 -1.28,0.88 -0.15,1.23 -1.88,0.84 0,0 -0.26,0.07 0,0 -0.31,-1.74 -1.34,0.29 -0.57,0.93 -0.29,-0.11 -1.12,1.25 -0.8,0.21 -0.85,0.12 -0.27,-0.84 -1.37,-0.12 0,0 -0.18,-0.04 0,0 -1.04,0.11 0,0 -0.6,-0.18 0,0 -0.19,-0.08 0,0 -0.88,-1.7 -0.05,-1.91 0.73,-1.64 -2.31,0.36 -1.17,1.53 -0.7,0.34 -1.44,0 0,0 -0.22,-0.07 0,0 -0.33,-0.21 0,0 -0.41,-0.21 0,0 -0.79,-0.17 -0.2,-1 -0.78,-0.15 -0.21,-0.71 -0.9,-0.77 -1.27,-0.07 -0.73,0.48 -0.74,-0.21 -0.29,-0.38 0.49,-0.9 -0.69,-1.33 -2.29,1.41 -0.69,1.46 -1.56,-0.5 0,0 -0.28,-0.19 0,0 -0.74,-0.53 0,0 -0.13,-0.18 0,0 0.06,-0.74 -2.38,-0.59 0.6,-0.29 -0.1,-0.48 0.35,-0.28 -0.31,-0.15 0.49,-0.18 -0.53,-0.37 0,0 -0.13,-0.05 0,0 -1.02,-0.48 0.33,-0.71 -0.78,0.21 -0.36,-0.79 -1.98,-1.04 -3.2,1.86 0,0 -0.38,0.39 0,0 -0.18,0.71 -1.33,0.14 -0.62,0.98 -0.66,-0.04 -2.22,1.12 -0.46,0.77 0.16,1.04 -0.82,0.73 -2.09,0.21 -0.74,0.76 -0.71,-0.96 -1.05,1.05 -0.77,-0.34 0,0 -0.48,0 0,0 -0.1,0.26 -0.76,-0.18 -0.87,-0.74 0,0 0.11,-1.1 1.89,-1.16 0.29,-1.21 -1.49,-1.6 -0.31,-1.41 1.39,-2.24 -0.14,-1.37 -1.13,-0.66 1.31,-3.26 -0.96,-3.31 0.39,-1.89 -0.27,-1.33 0.69,-0.13 0,-0.52 -0.22,-0.8 -1.05,-0.68 -0.3,-1.74 -1.7,-1.87 -0.29,-0.93 0.45,-0.33 1.49,0.41 1.4,-0.35 1.42,-2.320004 -0.37,-1.13 1.91,-1.78 0.21,-0.98 1.15,-1.36 1.33,0.11 0.26,-0.39 0.46,0.58 1.41,-1.32 0.28,0.39 0.51,-0.13 0.38,-0.3 -0.25,-0.52 1.12,-0.33 0.86,-1.72 1.03,-0.41 -0.43,-0.36 0.08,-0.56 0.59,-0.31 0.45,0.53 0.94,-0.3 -0.43,-0.86 1,-0.83 -0.25,-0.6 3.11,-4.49 -0.37,-0.83 -0.79,-0.33 -1.7,-1.92 -4,-0.93 -0.38,0.59 -1.14,0.4 -1.35,-1.06 0.04,-1.39 -0.53,-0.75 1.43,-4.52 -1.5,-0.54 0.68,-1.74 -1.13,-1.24 -0.87,0.94 -2.14,0.27 -1.41,-0.33 -0.64,-1.55 -0.75,-0.21 -0.82,1.71 -3.1,-0.03 -0.39,-0.84 -0.65,-0.2 0,0 -0.15,-0.78 0.73,-1.17 -0.37,-1.01 -0.92,0.09 -0.65,-0.87 0.8,-0.39 0.43,-1.37 0.97,-0.27 0.23,-1.58 1.18,-0.63 0.41,-0.9 1.14,-0.44 1.26,0.71 0.06,-0.56 0,0 -0.14,-0.3 0,0 1.62,-2.37 0.15,-2.28 -0.9,-0.28 -0.39,-0.55 -1.07,-0.17 -0.58,-0.65 0,0 0.02,-0.08 0,0 0.66,-0.76 -0.19,-0.92 0.41,-0.52 -0.42,-0.96 -0.85,0.24 -2.04,-1.24 -0.83,0.12 -0.4,0.88 -1.71,-0.47 0,0 -0.5,-0.04 0,0 -0.55,-0.03 0.45,-0.79 -0.17,-0.88 0.84,-1.13 -0.38,-0.46 0.04,-1.21 1.15,-0.56 -1.04,-1.91 0.91,-1.05 1.04,-0.07 0.35,-1.07 0.67,0.49 1.86,-1.72 -0.05,-0.53 0.74,-0.79 -0.79,-1.86 1,-0.29 -0.18,-0.91 0.47,-0.33 z" />
    
    <path d="m 378.13514,114.77858 0.6,-0.46 1.44,-0.23 0,0 0.41,-0.11 0,0 0.63,0.31 0,0 -0.38,0.78 0.36,1.55 -1.86,0.7 0,0 -0.45,0.04 0,0 -0.45,-0.13 -0.22,-0.79 -0.52,0.01 0,0 -1.18,-0.32 0.38,-0.38 0,0 1.69,-0.1 -0.45,-0.87 z m 20.01,-17.530004 0.31,0 0,0 0.31,0.1 0,0 0.06,-0.05 0,0 0.25,-0.23 0,0 1.1,-0.48 0.59,-1.12 1.09,0.06 0.12,-1.15 -0.42,-1.01 0.53,0.54 1.58,0.17 0.33,-0.33 0.89,0.12 0.49,-0.65 0.49,0.63 0.58,-1.31 1.27,-0.39 3.41,1.07 1.17,-0.54 1.85,-0.13 0.29,-0.77 0.91,-0.47 1.03,0.38 0.11,1.56 1.28,0.61 1.12,0.11 0.44,-0.68 1.19,-0.03 0.24,0.79 1.7,0.41 0.45,0.85 1.08,-0.31 -0.1,0.91 -0.77,0.49 1.15,0.23 -0.42,1.03 0.57,0.38 1.02,-0.81 0.55,0.46 0.22,1.02 0.73,0.16 0.38,1.340004 1.02,0.18 0.36,0.53 1.68,-1.010004 0.91,1.040004 0.84,-0.5 0.81,0.12 0.83,-1.020004 1.42,0.490004 1.16,-1.220004 2.08,1.800004 0.25,-0.33 -0.44,-1.280004 0.3,-1.2 0,0 2.54,-0.84 1.33,1.39 0,0 0.34,-0.1 0,0 1.28,1.22 1.4,0.47 3.86,4.010004 0,0 0.31,0.48 0,0 0.87,0.76 0,0 0.25,0.59 0,0 -0.34,1.71 1.3,1.71 0.45,0.09 0.48,1.24 -0.07,1.26 -0.54,0.75 0.66,1.85 -0.75,2.57 0.48,0.64 -1.42,1.21 -2.04,-1.05 -0.53,0.56 -0.25,1.44 0.25,1.67 -1.41,0.79 -1.09,1.92 -0.23,-0.22 -0.23,0.32 -0.03,0.37 0.73,0.29 1.33,1.68 0,0 0.17,0.1 0,0 0.66,0.76 -0.61,0.05 -0.25,0.57 0.24,0.86 0.82,-1.16 4.03,4.27 0.87,-0.45 0.95,0.64 0.96,-0.41 -0.3,1.9 0,0 -0.01,0.69 1.19,0.86 -0.28,0.27 1.22,2.72 2.66,0.34 0,0 0.05,0.1 0,0 0.72,0.23 2.25,-0.57 0,0 0.63,1.45 0,0 -1.72,0.75 -0.18,0.58 0.39,0.7 0,0 -0.09,0.43 0,0 -0.46,3.35 -1.6,2.42 0.35,1.4 -0.44,0.68 -0.96,0.29 0,0 -0.73,-0.35 0,0 -0.78,-0.29 -0.93,0.79 -1.59,3.14 -1.57,0.95 0.48,0.09 0.1,1.64 -0.35,0.16 0.24,0.63 -0.27,0.7 -0.41,0.15 0.23,0.81 0.63,0.09 0,0 -0.2,0.24 0,0 0.6,0 -0.18,0.65 0.61,0 -0.26,0.32 0.38,-0.21 0,0 0.07,-0.06 0,0 0.19,0.61 -0.39,0.01 0.5,0.18 -0.05,0.48 0,0 -0.12,0.06 0,0 0.67,-0.49 0,0 0.06,0.16 0,0 0.06,0.33 0.05,-0.65 0.69,0.16 -0.29,0.31 0.67,0.05 0,0.44 0.47,-0.04 0.84,0.77 0.23,-0.29 0,0 0.18,0.05 0,0 0.94,0.35 0,0 0.16,0 0,0 0.57,0.07 0,0 0.16,0.08 0,0 0.91,0.35 0.32,-0.33 1.24,0.68 -0.52,3.35 -2,3.62 -0.21,2.11 1.01,0.75 2.23,3.34 3.01,-0.19 0.88,-0.54 1.12,0.2 0.3,1.19 0.66,0.59 -0.32,1.3 0.35,1.11 -0.14,1.36 -0.9,0.42 1.25,2.65 -1.29,1.37 -1.74,0.03 0,0 -2.44,-1.91 -0.1,-0.95 -1.82,-0.56 -1.37,0.43 0,0 -0.33,0.16 0,0 -2.54,2.08 -0.65,-0.92 -0.51,0.18 -1.71,1.69 -0.11,2.33 -0.95,0.67 -0.27,0.94 0.47,1.81 0.05,3.72 -3.02,2.26 -2.16,-0.02 -0.62,-1 0,0 -0.01,-0.14 0,0 0.26,-0.53 -0.51,-0.5 -0.45,0.38 -0.72,-0.6 -0.69,0.06 -0.03,0.46 -0.67,-0.14 0.3,0.46 -3.4,2.02 -1.99,0.56 -1.77,-0.85 -0.5,0.37 0,0 -0.36,0.66 0,0 -0.95,1.34 -2.68,1.17 -1.48,3.29 -1.71,1.42 -0.27,1.41 0,0 -2.22,-0.2 -2.49,-1.32 0,0 -0.35,0 0,0 -0.75,-0.44 2.91,-3.53 -0.2,-1.08 0.5,-1.68 -0.16,-0.72 -1.19,-0.55 0.06,-3.28 -2.44,-0.62 0.11,-2.64 -0.86,-0.78 0,0 -0.25,0 0,0 -1.79,0.62 -2.58,-1.27 -0.29,0.77 -0.2,-0.17 -0.11,0.43 -1.06,0.51 0,0.34 -0.21,-0.26 -0.63,0.34 -0.54,0.8 -0.63,-0.57 -1.66,-0.01 -0.75,0.63 -0.23,1.48 -1.74,-2.39 -1.93,1.33 -3.8,-0.64 -1.21,-0.74 0,0 -0.15,-0.07 0,0 -1.31,0.42 0,0 -0.11,0.31 0,0 0.04,0.68 -1.31,1.18 -1.2,0.3 -1.64,-0.38 -0.21,-1.12 -0.85,-0.31 -0.38,0.07 -0.16,1.5 -0.73,0.38 -3.12,-1.06 -0.27,0.35 -1.14,-0.39 0,0 -0.5,0.16 0,0 -0.67,0.2 -0.19,0.79 -0.67,0.63 -1.61,0.2 -5.87,-0.38 -3.64,-0.72 -0.37,0.69 0.25,1.13 -0.49,0.13 -4.49,-2 -2.39,-2.81 -0.48,0.18 -0.25,-0.43 -0.52,-0.11 -0.22,0.28 -0.78,-1.27 -1.18,-0.89 -1.02,-0.17 -0.12,-0.67 -4.1,-1.41 -0.51,-2.45 -1.88,0.08 -1.57,-0.43 -0.21,-0.78 -0.99,-0.43 0,0 1.57,-0.43 1.49,-4.27 0.53,-0.78 1.8,0.14 0.44,-1.87 -1.98,-0.9 -0.46,0.12 -1.11,-3.43 2.29,0.89 1.13,-0.43 0,0 0.09,-0.05 0,0 0.17,-0.55 -0.47,-0.33 0,0 -0.28,-0.11 0,0 -0.52,-0.98 0.93,-2.12 0,0 0.19,0 0,0 0.67,-1.21 1.89,0.2 2.46,0.97 -1.6,-1.56 -0.16,-1.2 -0.5,-0.29 -0.77,-2.4 1.45,-0.29 0.06,-1.27 0.96,-2.08 -0.55,-0.92 -1.33,0.98 0,0 -0.21,0.09 0,0 -0.81,0.79 -1.55,0.3 0,0 -0.07,0.07 0,0 -0.97,0.66 -2.19,-0.84 -2.92,-3.28 -0.8,-0.18 -1.96,-2.41 0,0 -0.46,-0.41 0,0 -0.81,-0.96 1.25,-1.56 0,0 -0.01,-0.33 0,0 0.58,-2.21 -0.94,-1.39 0.39,-0.23 -0.21,-1.44 -1.08,0.12 -1.27,1.59 -1.47,-0.25 -0.11,-2.41 0.73,-1.22 -1.12,-1.05 -2.21,0.5 1.13,-3.73 -0.1,-4.09 0.91,-0.56 0,0 0.19,0.08 0,0 0.6,0.18 0,0 1.04,-0.11 0,0 0.18,0.04 0,0 1.37,0.12 0.27,0.84 0.85,-0.12 0.8,-0.21 1.12,-1.25 0.29,0.11 0.57,-0.93 1.34,-0.29 0.31,1.74 0,0 0.26,-0.07 0,0 1.88,-0.84 0.15,-1.23 1.28,-0.88 0,0 0.08,-0.18 0,0 1.79,-1.25 -0.27,-0.71 0.37,-0.77 1.21,0.5 0,0 0.56,-0.39 0,0 1.11,-0.31 -0.16,0.76 0.43,0.39 0.18,1.49 1.05,0.36 1.73,-0.67 0,0 1.33,0.6 0.43,-0.6 2.12,-0.74 0.07,-0.76 1.4,-1.05 0.14,-1.05 0.6,0.37 0.18,2.5 0.45,-0.03 0.31,0.46 0.37,-0.29 0.26,0.5 0.68,-0.51 0.62,-1.4 1.57,-0.8 1.31,1.1 -0.04,0.65 1.16,0.13 0.82,-0.83 1.32,0.59 -0.05,0.48 0.93,0.93 1.04,-0.13 0.11,0.84 0.51,-0.51 0.44,0.45 1.06,0 1.08,1.05 0.77,-0.57 0.98,1.36 0.76,0.22 0.61,-0.51 0.88,0.53 0.58,-0.37 0.13,0.46 1.49,0.77 -0.39,1.9 -1.75,1.44 -0.44,-0.15 -0.36,1.12 -0.61,0.29 0.14,0.3 0,0 0.22,0.07 0,0 -0.11,0.24 -0.63,-0.28 0.15,0.5 -0.33,0.26 0.05,-0.66 -0.69,0.67 -0.64,-0.29 -0.66,0.88 -0.2,-0.41 -0.52,0.1 -0.54,0.42 0.2,0.28 0,0 -0.02,0.14 0,0 0.21,0.47 1.66,0.63 1.14,-1.15 0,0 0.18,-0.11 0,0 0.35,-0.7 0.95,-0.51 0.34,0.22 1.92,-0.69 -0.31,-0.74 0,0 0.41,-0.1 0,0 0.77,-0.8 1.86,-0.27 0.39,-0.98 0.99,0.27 0.58,-0.3 0.05,0.42 0.6,-0.33 0.78,0.39 0.59,-0.7 -0.05,-0.71 1.2,-0.22 0.82,1 0.75,0.19 0.25,-0.33 1.7,-0.1 0.38,-0.79 0,0 0.07,0 0,0 0.51,-0.32 0.17,0.93 1.08,0.11 0.96,-0.36 0.88,-1.2 -1.15,-1.26 0.18,-0.76 0.55,0.21 -0.47,-1.12 0.2,-1.35 -0.56,-1.74 -0.36,-0.39 -1.04,0.77 -0.6,1.05 -0.62,-0.47 0.4,-2.27 1.08,-1.37 -0.31,-0.63 0.6,-1.31 -0.67,-1.22 -1.17,-0.1 -0.07,-2.57 -0.86,-0.9 -0.9,0.09 0,0 -0.16,0.07 0,0 -0.68,-0.04 0.34,-1.22 -1.27,-0.91 0.25,-0.58 -0.44,-0.47 0.37,-0.2 0,0 0.04,-0.4 0,0 0.16,-0.36 -0.64,0.55 -0.66,-0.33 -0.19,-1.14 -0.57,-0.49 -0.32,0.78 -0.48,-0.41 -0.5,0.22 0,0 -0.03,-0.11 0,0 -0.64,-0.41 0.88,-1.42 -0.44,-0.29 0.1,-0.93 0,0 0,-0.11 0,0 -0.48,-0.65 -1.27,-0.15 1.16,-1.95 -0.16,-0.8 0.87,-0.56 -0.52,-0.92 0.47,-0.01 0.74,-2.89 0.54,-0.49 -1.18,-1.47 0.36,-1.41 -1.73,-0.420004 -0.57,-1.49 -0.81,-0.48 0.08,-0.55 z" />
    
    <path d="m 548.96514,50.388576 -1.52,-0.24 0.88,-1.3 0.14,1.03 0.5,0.51 z m 30.49,11.57 0.41,0.75 1.01,0.15 -0.2,0.22 1.17,1.34 -0.41,0.86 0.01,1.42 -0.27,-0.04 0.63,1.24 0.57,0.15 0.08,0.71 -0.42,0.29 -0.22,1.48 -0.71,0.5 -0.14,0.72 -0.7,0.21 -0.53,0.75 -0.81,-0.12 -1.58,2.42 -1.84,0.79 -1.14,1.52 -3.22,1 -0.71,0.54 -0.38,0.93 -6.63,2.85 -4.04,2.67 -2.96,1.25 -2.04,2.68 -0.76,1.86 0.38,-1.6 -0.55,1.21 -0.44,0.05 -0.04,0.28 0.46,-0.14 -0.72,1.27 -0.84,0.67 -2.53,0.8 -2.38,0.12 -1.69,0.9 -1.43,0.02 -1.97,0.63 -0.38,0.47 0.17,-0.36 -6.1,1.33 -3.12,1.69 -2.64,0.18 -1.45,0.92 -0.25,0.08 0.22,-0.37 -0.97,0.36 -1,1.610004 -1.22,-0.72 -2.08,0.37 -1.76,0.85 -3.41,3.38 -1.89,2.89 -1.09,0.72 -0.28,0.83 -1.11,0.68 0.83,1.27 1.4,0.05 -1.08,-0.81 0.76,-0.04 1.7,2.1 1.79,0.45 -1.37,1.46 -2.43,1.28 -2.24,2.87 -1.35,0.21 -0.71,-0.85 0.45,0.25 -0.04,-0.57 1.08,0.72 0.33,-0.23 -0.51,-0.34 1.76,-0.27 0.86,-1.55 -1.4,-0.2 -0.84,0.54 -1.68,0.16 0.09,0.41 -0.32,-0.21 -1.48,1.74 -0.67,1.6 0,0 -2.06,-0.88 0.13,-1.09 -1.12,-0.87 -1.7,-0.21 -1.59,-0.74 -0.41,-0.56 0.55,-1.63 0,0 -0.2,-0.08 0,0 -0.08,-0.09 0,0 -0.27,-0.27 0,0 -0.63,0.08 0,0 -0.15,0 0,0 -0.31,-1.13 -0.77,0.3 -0.75,-0.35 0,0 -0.25,-0.58 0.39,0.31 0.05,-0.48 1.42,-0.43 0.15,-0.7 1.19,-1.21 -1.04,-2.23 0.39,-1.08 0,0 -0.03,-0.2 0,0 1.09,-1.82 -0.33,-0.22 0,0 0.04,-0.27 0,0 -0.6,-1.21 0.5,-0.19 -0.89,-0.72 -0.38,0.2 0.01,-0.45 -0.37,0.19 0.33,-0.47 -0.3,-0.96 -0.51,-0.1 0,-1.430004 0.34,-0.4 0.9,0.26 0.17,-0.7 1.12,-0.27 0.72,-2.37 1.14,-0.06 0.06,-0.47 0.39,0.05 0.21,-1.51 -0.59,-0.94 0.11,-0.52 -0.57,-0.43 0.7,-0.9 -1.45,-1.5 0.95,-2.01 -0.34,-1.2 1.5,-0.22 1.36,-1.88 -0.53,-2.15 -0.72,0.33 -1.42,-0.24 0.21,-1.16 -0.87,-1.05 0.04,-0.68 1.58,-2.21 0.3,0.3 0.09,-0.93 1.87,-0.25 0.42,-1.28 0.83,-0.77 0.82,0.03 0.33,-1.15 0.66,0.03 0.02,-0.42 0.72,-0.31 -0.39,-0.52 0.09,-1.14 0.31,-0.07 -1.21,-0.66 0.67,-1.05 0.49,0.2 0.35,-0.99 0.54,-0.18 0.13,0.39 0.33,-0.62 0,-1.51 0.38,-0.24 0.87,-2.59 -0.24,-1.22 0.57,-0.48 -0.46,-0.32 0.12,-0.6 1.68,-4.89 -0.64,-0.55 0.81,-0.55 -1.28,-0.52 0.62,-0.69 -1.48,-3.7 0.29,-0.32 0.34,0.26 0.69,-0.66 -0.53,-0.28 0.04,-0.53 0.36,-0.45 0.43,0.19 -0.26,-0.38 0.7,-2.45 -1.68,-0.42 -0.27,-1.34 -0.61,-0.82 0,0 -0.21,-0.14 0,0 -0.11,-0.25 0,0 0.39,0 0.17,-0.64 -0.51,-1.51 -0.57,-0.2 0.67,-0.75 -0.59,-0.28 0.69,-0.81 -0.32,-1.23 1.36,-0.86 1.84,0.92 0.71,-0.13 1.44,0.47 1.91,1.38 0.93,-0.61 0.64,0.71 1.69,0.21 0.9,-0.28 1.35,1.25 0.13,0.97 0.97,0.73 1.67,-0.71 0.62,0.47 2.8,-0.16 -0.15,0.59 0.99,0.51 0.02,0.75 0.69,0.52 0.16,1.09 0.66,0.81 -0.44,0.77 0.47,0.57 -0.81,1.1 0.98,-0.13 0.49,1.08 -1.32,1 0.59,0.31 0.2,1.39 2.78,0.19 0.32,-0.9 0.48,0.3 0.52,-0.67 1.6,0.01 0.38,-1.36 0.89,0.5 0.58,-0.42 1.06,0.54 1.06,-0.15 0.97,0.33 1.14,1.21 1.46,-0.14 0.12,0.84 0.49,0.29 0.19,1.47 1.44,1.25 1.88,-0.52 0.21,-0.56 0.64,-0.24 0.23,-0.95 0.83,-0.5 1.25,0.29 1.51,-0.82 1,0.57 0.63,-0.13 0.97,0.77 2.19,0.43 0.04,0.65 1.29,1.3 1.61,0.25 0.35,-0.74 0.62,-0.17 2.59,0.65 0.07,-0.68 -0.6,-1.05 0.49,0.02 0.07,-0.61 1.19,-0.61 1.06,-0.19 0.62,0.5 1.33,-1 0.34,-0.72 0.54,0.17 0.34,-0.48 1.24,0.4 0.8,-0.95 0.54,0.61 1.98,-0.29 1.26,1.76 0.93,-0.44 1.48,0.1 -0.44,0.25 0.27,0.41 -0.48,0.88 0.37,0.12 -0.31,0.33 0.21,0.73 0.65,0.32 0.2,0.59 0.92,-0.57 0.63,0.77 0.45,-0.37 0.53,0.54 0.98,0.21 -0.96,0.58 0.34,0.69 -0.61,-0.07 0.29,0.76 -0.24,0.45 -0.69,0.01 0.26,0.56 -0.96,-0.49 -0.26,0.71 -1.04,-0.52 -0.29,-0.69 -0.89,0.61 -0.62,1.56 0.27,2.56 z" />
    
    <path d="m 307.61514,129.30858 0.87,0.75 0.76,0.17 0.1,-0.25 0,0 0.49,-0.01 0,0 0.77,0.34 1.05,-1.05 0.71,0.96 0.73,-0.77 2.1,-0.21 0.82,-0.73 -0.16,-1.04 0.47,-0.77 2.21,-1.12 0.67,0.04 0.62,-0.98 1.33,-0.14 0.18,-0.71 0,0 0.38,-0.39 0,0 3.19,-1.87 1.98,1.04 0.36,0.8 0.78,-0.21 -0.33,0.71 1.02,0.48 0,0 0.12,0.05 0,0 0.54,0.37 -0.5,0.18 0.32,0.16 -0.36,0.28 0.11,0.48 -0.6,0.28 2.38,0.6 -0.06,0.74 0,0 0.12,0.18 0,0 0.74,0.53 0,0 0.28,0.19 0,0 1.56,0.5 0.69,-1.45 2.3,-1.41 0.69,1.33 -0.49,0.9 0.29,0.38 0.73,0.21 0.73,-0.48 1.27,0.07 0.9,0.77 0.21,0.71 0.78,0.15 0.2,1 0.79,0.17 0,0 0.41,0.21 0,0 0.33,0.21 0,0 0.21,0.07 0,0 1.45,-0.01 0.7,-0.34 1.17,-1.53 2.31,-0.36 -0.73,1.64 0.05,1.91 0.88,1.7 0,0 -0.91,0.56 0.11,4.09 -1.13,3.72 2.21,-0.5 1.13,1.04 -0.73,1.23 0.11,2.41 1.47,0.25 1.27,-1.59 1.07,-0.12 0.21,1.43 -0.39,0.23 0.94,1.39 -0.58,2.21 0,0 0.01,0.34 0,0 -1.25,1.56 0.81,0.96 0,0 0.46,0.41 0,0 1.96,2.41 0.79,0.18 2.92,3.28 2.2,0.84 0.97,-0.65 0,0 0.06,-0.07 0,0 1.56,-0.3 0.8,-0.79 0,0 0.22,-0.09 0,0 1.32,-0.98 0.56,0.92 -0.96,2.08 -0.06,1.27 -1.45,0.3 0.77,2.39 0.5,0.29 0.16,1.21 1.6,1.56 -2.46,-0.97 -1.89,-0.2 -0.68,1.2 0,0 -0.18,0 0,0 -0.93,2.12 0.52,0.99 0,0 0.28,0.11 0,0 0.47,0.33 -0.17,0.55 0,0 -0.09,0.05 0,0 -1.13,0.43 -2.29,-0.89 1.1,3.42 0.46,-0.12 1.98,0.9 -0.44,1.87 -1.8,-0.13 -0.52,0.77 -1.49,4.27 -1.57,0.43 0,0 -1.4,0.77 -2.35,-0.36 0.47,1.34 0,0 -0.04,0.08 0,0 -0.47,0.06 0.01,0.53 -0.33,-0.27 -0.11,0.35 -0.22,-0.38 -0.15,0.63 -0.24,-0.26 -0.88,1.11 -0.97,0.49 -0.52,0.64 0.09,0.51 -1.7,-0.18 -0.61,1.03 0.22,0.5 -0.47,-0.26 -0.39,0.67 0,0 0.11,0.26 0,0 -1.85,1.25 -0.13,0.72 -0.96,0 -0.72,0.46 -1.01,1.65 -0.03,0.56 0.74,0.71 -0.44,1.28 1.3,2.27 -0.04,2 0,0 -0.1,0.06 0,0 -0.35,0.65 0.15,0.77 -1.03,0.44 -0.19,0.64 -1.41,-0.23 -1.94,1.94 -0.77,-0.23 -0.19,-1.39 1.24,-0.79 -0.27,-0.54 0.31,-0.16 0.26,0.36 -0.04,-0.73 -1.13,-0.53 -0.79,0.56 -0.69,-0.17 -0.49,0.38 -1.41,0.1 -0.71,0.56 -0.08,0.79 -1.24,0.93 -0.08,0.58 0.57,0.72 -0.71,0.73 -0.49,1.78 -2.66,-0.09 -1.78,0.46 -1.78,1.51 -0.56,-0.74 -1.03,0.1 -0.36,-0.41 -1.4,-0.25 -0.62,-0.63 0,0 -0.14,-0.05 0,0 -0.73,-0.63 -0.28,-1.15 -1.24,-0.32 -1.02,0.1 0.24,0.31 -0.73,0.59 0.16,0.6 -0.32,0.21 -1.94,-0.75 0,0 -0.32,0 0,0 -0.66,0.2 -0.12,-1.34 0,0 -0.43,-0.52 0,0 -0.69,-0.73 -0.56,0.27 -1.94,-0.34 -0.73,0.3 -0.62,-0.27 -0.03,-0.43 -1.05,0.01 0.43,-2.28 -1.37,0.04 -2.32,-1.04 0,0 -0.15,-0.48 -0.56,0.06 -0.43,0.47 -0.24,-0.25 -0.87,0.24 -0.46,0.7 -1.03,-0.1 -0.45,0.51 -1.46,-2 -0.43,-1.64 -0.46,-0.13 -2.75,-3.87 -0.2,-0.96 -0.99,-0.68 -0.5,0.13 1.02,-1.31 -0.71,-0.11 0.52,-2.23 1.62,-2.78 -0.76,-0.51 0.33,-2.96 1.36,-0.77 2.19,-2.35 0.91,-0.12 0.86,-1.27 0.77,-0.36 0.17,-0.54 -0.49,-0.99 2.61,-4.08 -0.25,-1.02 -0.73,-1.38 -1.21,-0.8 -2.03,0.61 -0.83,-0.31 -0.25,-0.47 0.35,-1.7 -2.22,-0.8 -0.7,-0.69 -0.22,-1.36 0.44,-0.95 -2.03,-1.99 -0.44,-1.58 0.64,-1.21 0.13,-1.62 -1.43,-0.97 -0.45,0.22 -0.44,-0.32 -0.26,-1.39 -1.06,-0.16 -1.01,-1.5 -0.86,-0.41 -0.75,-2.35 -0.4,-0.28 2.29,0.08 3.29,0.75 2.29,-0.92 2.81,0.48 0.62,-0.36 1.59,0.19 1.4,-0.46 1.09,-3.58 -0.25,-1.4 0.88,-0.41 1.19,-1.39 0.08,-2.14 0.45,-0.39 0.13,-1.58 0.57,-1.13 -2.07,-3.43 -1.64,-0.33 -0.83,-2.42 0.51,-1.42 1.24,-0.39 0.35,-0.71 1.15,0.12 z" />
    
    <path d="m 252.04514,59.318576 0.5,0.59 -0.63,-0.17 0.13,-0.42 z m -0.24,-1.56 0.57,0.82 -0.45,0.58 0.24,-0.47 -0.36,-0.93 z m -0.09,-5.24 -0.66,1.48 -0.02,-0.97 0.36,-0.63 0.32,0.12 z m -2.54,-3.28 0.39,0.51 -0.28,0.25 -0.11,-0.76 z m 3.79,-3.27 0.13,0.35 0.37,-0.1 0.12,0.74 -0.43,0.08 0.11,0.67 -0.27,0.04 -0.21,-0.33 0.29,0.07 -0.24,-0.32 0.29,-0.62 -0.62,-0.39 0.46,-0.19 z m 25.8,-43.46 0.63,-1.08 0.34,0.23 0.63,-0.41 0.25,0.38 -0.33,1.08 0.57,0.94 -0.67,-0.44 -0.04,1.25 -0.37,0.12 0.52,0.46 -0.91,0.04 0.68,0.39 0.8,-0.52 -0.44,-0.92 0.89,-0.17 0.25,0.52 0.48,-0.17 -0.62,-0.56 0.5,-0.24 -0.05,-0.35 2.42,-0.92 0.99,-0.98 -0.05,-0.56 0.72,0.63 -1.04,1.44 0.54,0.22 0.23,-0.62 0.99,-0.24 0.23,1.16 0.59,0.16 -0.2,1.44 0.34,0.83 0.17,-0.99 0.51,-0.35 -0.22,-0.7 0.73,0.06 0.04,-0.76 0.9,-0.24 0.27,0.5 1.25,-0.03 -0.24,0.6 3.28,1.38 0.53,1.48 1.14,1.23 -0.36,0.33 0.48,-0.15 1.19,0.7 -0.29,0.56 -0.38,-0.04 0.52,0.22 -0.25,0.22 0.64,-0.7 2.01,0.59 1.38,-0.3 1.88,0.22 0.17,0.74 -0.44,0.64 -0.09,1.76 0,0 -0.93,0.65 -0.38,1.05 -1.89,-0.1 -0.02,0.93 0,0 0.05,0.13 0,0 -0.12,0.68 0.49,0.3 0.58,-0.33 0.25,0.45 -0.06,1.53 0.82,1.01 1.08,-0.06 -0.27,1.34 0.26,0.89 1.11,1.12 0.3,-0.33 0.25,0.57 0.82,0.16 0.15,0.58 -0.42,0.84 0.64,1.14 0.5,0.08 1.47,-0.92 -0.05,-0.35 0.79,-0.19 0.91,1.06 -0.19,0.77 -1.12,1.16 -0.62,0 -0.54,0.63 -0.67,-0.45 -0.74,0.94 0.03,0.98 -0.44,-0.24 -0.43,0.77 0.68,0.93 0.41,-0.02 0.05,-1.48 1.27,1.72 1.02,0.03 0.94,1.13 -0.14,1.16 0.46,0.46 0,0 -0.46,0.31 0.18,0.91 -1,0.29 0.79,1.86 -0.74,0.79 0.05,0.53 -1.86,1.72 -0.67,-0.49 -0.35,1.07 -1.04,0.07 -0.91,1.05 1.04,1.91 -1.15,0.56 -0.04,1.21 0.38,0.46 -0.84,1.13 0.17,0.88 -0.45,0.79 0.55,0.03 0,0 0.5,0.04 0,0 1.71,0.47 0.4,-0.88 0.83,-0.12 2.04,1.24 0.85,-0.24 0.42,0.96 -0.41,0.52 0.19,0.92 -0.66,0.76 0,0 -0.02,0.08 0,0 0.58,0.65 1.07,0.17 0.39,0.55 0.9,0.28 -0.15,2.28 -1.62,2.37 0,0 0.14,0.3 0,0 -0.06,0.56 -1.26,-0.71 -1.14,0.44 -0.41,0.9 -1.18,0.63 -0.23,1.58 -0.97,0.27 -0.43,1.37 -0.8,0.39 0.65,0.87 0.92,-0.09 0.37,1.01 -0.73,1.17 0.15,0.78 0,0 -0.7,0.84 -1.67,0.05 -0.52,-0.9 -0.84,-0.47 -1.62,0.22 -0.29,1.4 0.35,0.85 -0.57,1.39 -3.17,1.33 -1.13,0.08 -0.27,-0.38 -1.57,1.56 -0.7,-1.91 -1.18,-0.34 -0.94,1.11 -2.31,0.39 0.3,-1.38 0.46,-0.42 -2.03,-0.14 -1.15,-0.88 -1,0.54 -0.57,-0.22 -0.85,0.56 -1.23,0.14 -1.18,1.04 -0.34,-0.39 0.16,-2.2 -0.48,-0.18 -0.51,1.77 -1.54,0.19 -0.98,1.52 -1.13,0.52 -1.96,0.28 -1.01,-0.35 -0.16,-2.05 -0.85,0.11 -0.41,-1.37 1.47,-2.58 0.9,-0.87 1.12,-0.37 0.11,-1.18 -0.8,-1.17 -1.89,0.42 -0.41,-3.15 -0.7,0.76 -0.63,-0.22 -0.3,0.62 -1.65,0.69 -0.37,0.7 -0.87,-0.21 -0.5,0.5 -1.14,0.16 -0.52,-0.37 -2.1,0.09 -0.14,0.6 -0.54,0.3 -2.35,0.2 -0.67,0.72 -0.23,1.01 -2.19,1.37 -0.29,1.07 -1.76,0.84 -1.35,1.7 -0.28,-0.49 -0.22,-3.52 0.34,-1 -0.67,-4.05 0.58,0.02 0.78,-0.64 0.45,0.58 0.28,-0.14 0.14,-0.87 -0.84,-0.6 0.75,-0.01 0.2,-1.13 1.01,-0.65 0.43,-0.98 0.6,-0.03 -0.36,0.08 0.33,0.18 2.19,-2.14 1.34,-0.09 -0.41,-0.8 0.43,-1.25 -0.58,-0.36 -0.11,0.99 -0.65,0.42 0.04,0.87 -1.44,0.56 -0.15,-0.48 -0.37,0.07 -0.17,0.56 -0.75,0.49 -0.49,-0.19 -0.26,0.61 -0.57,-0.47 -0.47,0.29 -0.68,-0.36 -0.21,0.54 -0.26,-0.12 0.47,-2.16 0.68,1.13 0.39,-0.01 -0.08,-1.25 -0.5,-0.92 0.96,0 0.43,0.4 0.87,-0.44 0.8,-1.64 1.99,-1.55 -0.82,0.25 -0.24,-0.69 -2.26,1.91 -1.09,-0.48 -0.66,0.61 -1.15,-1.13 0.24,-0.75 -0.37,-0.8 -0.72,-0.19 -0.39,0.42 -0.47,-0.47 0.17,-0.6 1.31,-0.05 -0.06,-0.46 0.55,-0.28 0.43,1.06 -0.45,0.4 0.08,0.51 0.75,-0.54 0.66,0.49 -0.39,-1.21 0.63,-0.43 -0.34,-0.47 0.24,-0.83 -0.43,0.37 -0.28,-1.15 0.55,-0.32 -0.41,-0.09 0.1,-0.5 0.94,-0.15 0.8,-0.8 -0.34,-0.49 0.63,-1.21 -0.39,-0.21 -0.94,0.61 -0.48,-0.34 0.25,-0.73 -0.76,-0.79 0.01,0.96 -0.31,-0.16 -0.28,0.7 0.63,0.52 -0.56,0.23 0.03,0.73 -0.83,-0.15 0.37,-0.81 -0.72,-0.23 -1.01,1.15 0.48,0.78 -0.86,0.07 -0.29,0.55 -0.7,0.15 -0.03,1.12 -1.47,0.66 0.26,-1.49 -0.6,-0.68 -0.49,0.36 -0.46,-0.37 1.35,-2.16 0.5,-2.78 0.38,0 0.65,-1.14 0.85,-0.19 0.89,-1.47 0.41,-0.17 0.66,0.72 -0.38,-0.71 0.1,-0.85 0.93,-0.51 -0.42,-0.03 -0.26,0.46 -0.48,-0.68 -0.1,1.2 -0.45,0.19 -0.18,-0.35 -0.81,1.02 -0.51,-0.53 -0.03,0.55 -0.92,-0.11 -0.1,-0.78 -0.61,0.57 -0.61,-0.04 0.41,0.71 -1.12,1.13 -0.29,-0.58 -0.49,0.03 -0.48,-1.4 -0.44,-0.24 1.17,-0.92 -0.1,-0.72 -0.57,-0.09 -0.54,-1.07 0.59,-1.29 -0.9,-0.16 -0.93,-1.69 0.3,1.53 -0.73,-0.05 -0.32,-0.9 -0.37,0.02 -0.02,0.53 -0.85,0.36 -0.1,1.35 -0.33,-0.36 0.12,-0.72 -0.63,-0.43 0.12,-0.67 0.8,-1.23 0,-1.12 0.37,0.18 0.18,-0.32 -0.79,-0.22 -0.59,-1.7 0.63,0.4 0.48,-0.23 0.03,-1.51 0.97,0.16 0.05,-1.01 0.98,0.93 0.6,-1.21 1.04,-0.4 -1.1,0.23 -0.02,-0.92 -0.5,1.06 -0.56,-0.19 -0.28,-1.22 0.41,0.26 0.51,-0.43 0.16,-0.97 0.5,0.34 0.19,-0.49 0.41,0.19 0.14,-0.27 1.34,0.62 1.06,-0.44 0.8,-1.48 0.42,0.61 0.45,-0.46 0.96,0.06 -0.06,0.47 0.51,-0.25 0.31,-0.75 0.44,0 -0.45,-0.09 -0.72,0.88 0.18,-0.48 -0.4,-1.1 -0.66,0.04 -0.41,-0.51 0.93,-0.71 0.78,0.45 0.08,-0.44 0.48,0.03 -0.08,-1.07 0.98,0.35 0.1,-0.38 0.69,0.12 0.16,-0.96 1.48,1.53 2.14,0.49 2.7,-1.18 1.39,0.43 0.61,-0.18 0.65,-0.45 0.4,-1.17 0.5,0.23 0.57,-0.28 0.55,-0.86 0.76,0.5 0.2,-0.75 0.48,0.82 -0.54,0.19 0.52,0.33 0.07,0.85 -0.08,-0.4 0.95,-0.19 0.31,-1.17 -0.46,-0.1 0.14,-0.58 1.17,-0.35 0.33,0.78 0.85,0.09 0.44,0.66 -0.11,0.53 1.15,0.89 -0.09,-0.53 0.32,0.17 -0.53,-0.63 0.29,-0.38 -0.31,-1.1 0.41,-0.62 0.88,-0.06 0.03,-0.31 -0.65,-0.21 -0.56,0.35 -0.38,-0.41 -0.79,0.4 -0.57,-0.66 -1.01,-0.33 0.36,-0.07 -0.22,-0.32 1.09,-0.33 0.13,0.31 0.33,-0.42 0.71,0.39 0.74,-0.14 0.55,-0.47 -0.09,-0.41 0.36,0.21 0.23,-0.7 -1.9,0.94 0.03,-0.36 -0.46,0.11 0.05,-0.58 -0.57,0.98 -0.79,0.25 -0.55,-0.37 -0.6,0.44 -0.23,-0.24 0.79,-1.22 -0.24,-0.83 0.87,-0.59 -0.79,-0.98 0.35,-0.31 0.49,0.5 0.93,-0.05 1.87,-1.65 0.12,-0.75 0.93,0.14 -0.03,0.73 0.39,-1.39 0.82,-0.21 0.49,-0.98 0.18,1.09 0.42,-0.23 0.5,0.4 -0.57,-0.6 0.51,0 -0.03,-0.42 -0.56,0.01 0.37,-1.68 0.8,-0.35 0.89,0.33 1.31,-0.89 0.04,-0.48 0.6,0.1 z" />
    
    <path d="m 443.90514,68.128576 -2.91,1.74 -0.5,0.03 -0.74,-0.72 0,0 -0.16,-0.16 0,0 -2.67,-0.65 -0.23,-1.24 0.36,-0.31 -1.44,-2.23 0.87,-0.5 0.03,-0.69 -2.92,-0.16 -0.9,0.51 -0.38,-1.55 -1.05,-0.5 -3.27,0.3 -0.46,0.76 -0.76,0.31 -0.76,-0.26 -0.05,1.63 -0.89,0.64 -0.89,2.06 -1.18,-0.39 -1.33,0.35 -0.82,-0.66 -1.13,0.22 -0.3,-0.85 1.28,-1.87 0.07,-0.73 -0.77,-0.78 -0.44,0.26 -0.6,-0.23 -0.48,0.56 0,0 -0.07,0.25 0,0 -0.41,2.33 -1.2,0.24 -0.83,0.78 -0.87,-0.84 0,0 0,-0.29 0,0 -0.59,-1.78 -2.62,0.08 -2.6,-4.05 0.68,-0.58 0.39,-1.19 -0.47,-2.47 0.31,-0.45 0,0 -0.16,-0.12 0,0 -0.22,-0.85 1.26,-0.33 -0.58,-0.91 -0.56,-0.01 0.11,-1.12 0.61,0.02 -0.11,0.72 0.69,0.95 -0.18,-1.99 0.45,-0.79 -1.33,-1.54 0.52,-0.56 0.11,-0.95 -0.44,-0.35 -0.95,0.19 -0.26,-0.33 0.8,-0.43 0.78,-1.19 0,0 0.41,-0.1 0,0 -0.63,-1.91 1.78,0.32 0.37,-0.46 0.61,0.35 1,-0.13 0.93,0.72 0.38,-0.3 0.37,0.25 0.68,-0.64 0,0 0.41,0.33 0.02,0.76 0.63,-0.12 -0.04,0.77 -0.56,0.35 0,0 0.08,0.4 0,0 0.52,0.53 0.11,-0.48 0.33,0.14 0.63,-0.56 0.41,-1.55 0.66,0.01 1.57,0.99 -0.27,2.01 0,0 -0.36,0.87 0,0 0.77,-0.33 -0.03,0.6 0.6,0.24 0.27,0.74 1.13,-0.73 0.28,1.13 0.68,-0.79 1.05,0.38 -0.18,-0.44 0.76,-0.88 -0.13,1.08 1.02,0.15 0.77,-0.38 0.74,0.26 0,0 0.6,0.61 1.28,0.31 0.19,0.49 0.37,-0.09 -0.1,-0.42 0,0 0.23,-0.11 0,0 0.8,0.41 0.02,-0.38 0.28,0.08 0,0 0.19,0.36 0,0 0.17,0.39 0.94,0.17 -0.06,0.38 0.75,0.25 -0.04,0.28 0.8,-0.08 0.42,0.39 0.46,-0.39 1.17,-0.06 -0.17,0.75 1.01,1.13 -0.24,0.8 0.53,0.12 1.38,-0.94 0.61,0.22 0.7,0.38 0.13,0.66 0.62,-0.01 0.29,0.48 0.35,-0.21 0.11,0.99 1.24,0.44 -0.06,1.33 0.49,0.09 0.09,-0.34 0.82,0.39 0.16,0.73 2.64,0.58 0.4,0.75 0.6,-0.01 -0.55,0.71 0.53,0.78 -0.57,0.4 -0.45,0.26 -1.11,-0.65 -0.68,0.46 -1.12,-0.53 -1.85,2.48 -0.37,0.97 0.19,1.03 1.23,0.98 0.24,-0.17 0,0 -0.27,1.45 z m -31.06,-23.28 0.05,-0.14 0,0 0.07,-0.11 0,0 -0.02,-0.13 0,0 -0.01,-0.04 0,0 0.27,-0.03 0,0 -0.02,0.2 0,0 -0.13,0.16 0,0 -0.19,0.1 0,0 -0.02,-0.01 z m 1.46,-0.04 0.17,-0.16 0,0 0.33,0.41 -0.51,-0.2 0,0 0,-0.05 z" />
    
    <path d="m 378.13514,114.77858 0.45,0.86 -1.69,0.1 0,0 0.05,-0.6 0.78,-0.51 0.41,0.15 z m 20.01,-17.530004 -0.04,0.58 0.81,0.48 0.57,1.49 1.73,0.420004 -0.36,1.41 1.18,1.47 -0.54,0.49 -0.74,2.89 -0.47,0.01 0.52,0.92 -0.87,0.56 0.16,0.8 -1.16,1.95 1.27,0.15 0.48,0.65 0,0 0,0.11 0,0 -0.1,0.93 0.44,0.29 -0.88,1.42 0.64,0.41 0,0 0.03,0.11 0,0 0.5,-0.22 0.48,0.41 0.32,-0.78 0.57,0.49 0.19,1.14 0.66,0.33 0.64,-0.55 -0.16,0.36 0,0 -0.04,0.4 0,0 -0.37,0.2 0.44,0.47 -0.25,0.58 1.27,0.91 -0.34,1.22 0.68,0.04 0,0 0.16,-0.07 0,0 0.9,-0.09 0.86,0.9 0.07,2.57 1.17,0.1 0.67,1.22 -0.6,1.31 0.31,0.63 -1.08,1.37 -0.4,2.27 0.62,0.47 0.6,-1.05 1.04,-0.77 0.36,0.39 0.56,1.74 -0.2,1.35 0.47,1.12 -0.55,-0.21 -0.18,0.76 1.15,1.26 -0.88,1.2 -0.96,0.36 -1.08,-0.11 -0.17,-0.93 -0.51,0.32 0,0 -0.07,0 0,0 -0.38,0.79 -1.7,0.1 -0.25,0.33 -0.75,-0.19 -0.82,-1 -1.2,0.22 0.05,0.71 -0.59,0.7 -0.78,-0.39 -0.6,0.33 -0.05,-0.42 -0.58,0.3 -0.99,-0.27 -0.39,0.98 -1.86,0.27 -0.77,0.8 0,0 -0.41,0.1 0,0 0.31,0.74 -1.92,0.69 -0.34,-0.22 -0.95,0.51 -0.35,0.7 0,0 -0.18,0.11 0,0 -1.14,1.15 -1.66,-0.63 -0.21,-0.47 0,0 0.02,-0.14 0,0 -0.2,-0.28 0.54,-0.42 0.52,-0.1 0.2,0.41 0.66,-0.88 0.64,0.29 0.69,-0.67 -0.05,0.66 0.33,-0.26 -0.15,-0.5 0.63,0.28 0.11,-0.24 0,0 -0.22,-0.07 0,0 -0.14,-0.3 0.61,-0.29 0.36,-1.12 0.44,0.15 1.75,-1.44 0.39,-1.9 -1.49,-0.77 -0.13,-0.46 -0.58,0.37 -0.88,-0.53 -0.61,0.51 -0.76,-0.22 -0.98,-1.36 -0.77,0.57 -1.08,-1.05 -1.06,0 -0.44,-0.45 -0.51,0.51 -0.11,-0.84 -1.04,0.13 -0.93,-0.93 0.05,-0.48 -1.32,-0.59 -0.82,0.83 -1.16,-0.13 0.04,-0.65 -1.31,-1.1 -1.57,0.8 -0.62,1.4 -0.68,0.51 -0.26,-0.5 -0.37,0.29 -0.31,-0.46 -0.45,0.03 -0.18,-2.5 -0.6,-0.37 -0.14,1.05 -1.4,1.05 -0.07,0.76 -2.12,0.74 -0.43,0.6 -1.33,-0.6 0,0 0.52,-0.27 -0.24,-1.23 1.08,-1.23 -0.48,-1.74 0.54,-0.09 0.68,1.03 1.29,-0.15 -0.17,-0.76 0.6,-0.33 -0.1,-1.31 0.56,-0.73 2.72,-0.15 -0.51,-0.93 0.68,-1.03 -0.32,-2.47 0.16,-0.54 0.87,-0.5 0.3,-1.37 -0.33,-0.88 0,0 0.52,-0.01 0.22,0.79 0.45,0.13 0,0 0.45,-0.04 0,0 1.86,-0.7 -0.36,-1.55 0.38,-0.78 0,0 1.74,-2.14 0.73,-1.59 1.15,0.42 1.34,-0.21 1.12,-5 0.44,-0.09 0.79,-1.38 3.06,-1.23 1.1,-1.88 1.71,-1.05 1.23,-1.890004 1.15,-0.82 1.35,-0.23 z" />
    
    <path d="m 474.44514,217.28858 -0.2,1.18 0.57,2.05 -0.7,-1.93 0.33,-1.3 z m -0.23,-1.07 -0.06,0.6 0.52,0.46 -0.54,-0.41 -0.21,-0.6 0.29,-0.05 z m -43.44,-8.56 0.27,-1.41 1.71,-1.42 1.48,-3.29 2.68,-1.17 0.95,-1.34 0,0 0.36,-0.66 0,0 0.5,-0.37 1.77,0.85 1.99,-0.56 3.4,-2.02 -0.3,-0.46 0.67,0.14 0.03,-0.46 0.69,-0.06 0.72,0.6 0.45,-0.38 0.51,0.5 -0.26,0.53 0,0 0.01,0.14 0,0 0.62,1 2.16,0.02 3.02,-2.26 -0.05,-3.72 -0.47,-1.81 0.27,-0.94 0.95,-0.67 0.11,-2.33 1.71,-1.69 0.51,-0.18 0.65,0.92 2.54,-2.08 0,0 0.33,-0.16 0,0 1.37,-0.43 1.82,0.56 0.1,0.95 2.44,1.91 0,0 0.69,2.85 -0.65,1.75 0.32,0.92 -2.15,2.03 0.4,0.21 -0.19,2.93 2.9,0.33 0.6,1.52 -0.6,2.85 -1.34,2.2 0.17,1.55 3.19,6.07 1.97,2.09 1.3,0.66 0.57,-0.08 0,0 0.38,1.95 -0.98,-0.97 -0.53,1.41 -1.11,0.96 -0.44,0.98 1.66,2.2 1.7,0.91 0.59,-0.79 0.42,0.7 0.4,-0.04 -0.9,1.09 -1.66,0.4 -1.02,0.69 -0.68,-0.34 -0.87,0.23 -1.15,0.84 -1.17,-0.23 -0.12,-0.27 0.57,-0.08 -0.8,-0.19 -0.26,-0.42 0.26,-0.32 -0.52,-0.11 0.14,0.68 -0.55,-0.14 -0.41,0.44 -1.37,-0.38 -0.99,0.54 -0.46,0.57 0.44,0.61 -1.51,-0.24 -0.15,-0.63 -0.88,-0.65 -1.14,-0.09 -0.31,0.65 -1.91,-0.17 -2.02,1.9 -1.6,0.7 -0.74,2.19 -0.89,-0.29 -1.16,0.92 -0.92,0.15 -0.87,0.88 0,0 -2.96,-2.32 -2.05,-0.37 0.04,0.62 -0.98,-0.72 -4.08,-6.6 0,0 -0.18,-0.19 0,0 -0.3,-1.64 0.47,-0.92 -0.37,-1.65 0.37,-2.29 0.57,-0.79 -0.2,-0.26 0,0 -0.17,0.01 0,0 -0.49,-0.21 -0.44,0.39 -1.11,-0.51 -0.6,0.35 -1.07,-0.94 -1.31,0.41 -2.19,-1.7 -1.25,-2.23 -1.06,-0.81 z" />
    
    <path d="m 449.43514,18.578576 0.81,0.18 -0.18,0.89 0.61,1.16 0.87,0.08 0.54,-1.08 -0.17,-0.35 1.33,-0.21 1.41,0.84 1.36,-0.05 0.81,0.77 0,2.33 -0.53,0.43 -0.35,1.86 -1.6,1.46 0.9,1.56 2.35,0.66 0.26,-2.46 0.67,-0.69 1.33,-0.19 -1.06,1.82 1.26,0.95 1.33,-0.32 1.89,1.04 0.07,0.6 0.76,-0.59 0.91,0.88 1.88,0.3 0.42,0.65 1.44,0.79 1.03,-0.38 0.27,0.33 2.37,0.14 1.48,-0.63 0.66,0.84 -0.18,0.4 0.35,0.56 0,0 -1.57,-0.07 -0.94,0.71 -0.08,1.26 -1,0.79 -0.11,1.76 0.33,0.45 -0.46,0.89 -0.97,0.08 -0.01,0.64 -0.61,-0.01 -1.26,1.48 -1.54,0.11 -0.38,0.35 -0.01,1.62 -3.06,-0.04 -0.12,1.36 -0.6,-0.02 0.56,0.46 -1.18,0.79 -0.04,1.07 0,0 -0.14,0 0,0 -0.57,0.25 -0.96,-0.53 -0.64,1.24 0.33,1.78 -1.76,1.87 -0.49,1.68 0.66,0.27 0.14,0.6 -1.89,2.29 0.2,0.66 -0.7,1.97 0.68,1.44 -0.19,1.99 0.88,0.73 0.39,1.22 0.84,0.02 0,0 0.28,-0.03 0,0 0.16,1.1 -0.93,0.93 -1.19,2.2 0.09,0.49 -0.76,0.9 -2.51,-0.15 0,0 -0.32,0.3 0,0 -0.52,0.16 0,0 -0.66,-0.13 0,0 -2.62,-1.83 -1.7,0.31 -1.43,-1.39 -1.87,0.03 -0.28,-0.55 0,0 -0.24,0.18 -1.23,-0.99 -0.19,-1.02 0.36,-0.98 1.86,-2.47 1.11,0.53 0.68,-0.46 1.11,0.65 0.45,-0.26 0.57,-0.4 -0.53,-0.78 0.55,-0.71 -0.6,0 -0.41,-0.75 -2.64,-0.58 -0.16,-0.73 -0.82,-0.39 -0.09,0.33 -0.49,-0.09 0.06,-1.32 -1.24,-0.44 -0.1,-0.99 -0.35,0.21 -0.29,-0.47 -0.61,0.01 -0.14,-0.67 -0.7,-0.38 -0.6,-0.22 -1.38,0.94 -0.53,-0.12 0.25,-0.8 -1.02,-1.13 0.17,-0.75 -1.17,0.06 -0.46,0.39 -0.42,-0.39 -0.8,0.09 0.03,-0.28 -0.74,-0.26 0.06,-0.38 -0.95,-0.17 -0.17,-0.38 0,0 -0.18,-0.36 0,0 -0.29,-0.08 -0.02,0.38 -0.8,-0.41 0,0 -0.24,0.11 0,0 0.11,0.42 -0.37,0.09 -0.19,-0.48 -1.28,-0.31 -0.6,-0.61 0,0 -0.02,-0.77 0.83,-0.26 -0.11,-2.97 -0.71,-0.29 -0.8,1.4 -0.29,-0.72 -0.75,0.03 -0.24,-1.08 0.46,0.12 0.84,-1.24 0.98,-0.58 0.87,0.22 0.3,0.49 -0.25,0.33 2.42,-0.65 0.09,-0.59 -0.12,-0.36 -0.47,0.2 -0.35,-1.89 0.19,-0.58 1.49,-0.35 -0.49,-1.42 1.29,-2 -0.26,-1.68 0,0 -0.22,-0.32 0,0 0.32,0.01 0.04,-1.07 0.74,-0.95 0.8,0.53 1.45,-0.18 0.63,-0.3 0.35,-0.95 1.41,-0.25 0.3,-0.65 -0.37,-1.23 0.55,-0.61 0,0 0.07,-0.34 0,0 0.15,-0.61 1.77,-0.91 1.22,-1.41 -0.48,-0.65 0.17,-2.66 0.87,0.62 0.16,-0.87 0.4,0.73 0.32,-0.43 0,0 0.23,-0.05 0,0 1.28,-0.78 0.05,-1.14 0,0 0.3,-0.34 0,0 0.06,-0.07 0,0 0.41,0.04 0,0 0.9,-0.5 0,0 1.02,-0.5 z" />
    
    <path d="m 533.64514,182.65858 0.48,0.79 0.43,-0.1 0.16,0.89 1.03,0.86 0.37,0.17 1.06,-0.66 0.44,0.8 -0.32,0.6 -1.33,-0.05 -1.01,-0.86 -1.07,-0.25 -1.72,1.53 -0.13,-2.72 0.44,-0.55 0.25,0.24 0.58,-0.31 0.18,-1.22 0.16,0.84 z m -0.46,-1.72 0.28,0.77 -0.42,-0.35 0.14,-0.42 z m 3.08,-11.16 0.6,0.83 1.27,0.1 -0.17,0.27 0.32,0.13 -0.5,0.14 -0.09,0.44 0.9,1.23 -0.99,0.43 -0.11,0.9 -1.27,0.21 -0.09,0.96 -0.3,0.1 0.24,0.27 -0.5,-0.06 -0.91,1.18 -0.54,-0.16 -0.01,0.49 -0.46,-0.45 -0.04,0.46 -0.48,-0.02 -0.45,0.94 0.08,1.56 -0.59,-0.37 -0.37,0.41 -0.73,-1.38 -0.66,0.5 -0.05,-0.36 -0.54,0.16 0,-0.47 -0.72,-0.13 -0.65,0.81 -0.65,-0.54 -0.3,-1.09 0.62,-1.29 -0.57,-0.67 0.38,-0.56 0.43,0.29 1.67,-0.22 -0.6,-0.7 0.38,-0.58 -0.13,-0.78 1.31,-0.76 0.47,-0.72 0.46,0.4 0.35,-0.6 0.78,0.06 0.2,-0.5 0.43,0.39 1.27,-1.02 0.29,0.41 0.27,-0.53 0.75,-0.11 z m 38.59,-1.63 0.61,0.21 -0.53,0.38 0.03,0.72 -1,-0.02 -0.12,-1.2 0.4,0.64 -0.06,-0.41 0.56,0.21 0.11,-0.53 z m -16.95,-14.83 -0.75,0.53 0.94,-0.93 -0.19,0.4 z m 23.98,-13.11 -0.27,0.55 -1.29,0.73 -0.64,-0.13 -0.56,0.99 -0.51,-0.43 -0.33,0.37 0.09,0.83 0.58,0.66 2.68,-1.11 -0.4,0.31 0.21,0.72 -0.5,0.72 -1.5,0.21 -0.02,1.07 0.52,0.93 0.76,0.7 2.3,0.98 2.05,-1.08 0.52,-1.04 2.34,1.57 0.72,-0.06 -0.17,0.87 0.71,0.26 -0.63,0.35 -0.02,1.72 -0.39,-0.02 -0.13,0.77 -0.79,-0.08 -0.38,0.53 -0.22,1.12 0.49,0.37 -0.69,0.14 -0.29,0.85 -0.98,0.45 0.22,0.14 -1.44,1.7 -0.35,2.52 -0.34,-0.35 0.17,0.33 -0.84,1.63 -0.31,0 0.2,0.2 -1.24,0.41 -0.45,0.87 -0.67,-0.12 -2.03,2.14 -0.61,0.12 -1,-1.55 -0.75,-0.21 0.09,-0.78 -0.84,-0.85 -0.78,-0.06 -0.44,0.44 -0.81,-0.48 -1.3,-0.07 -0.18,0.39 -0.6,-0.38 -0.53,0.15 -1.26,-1.55 0.14,-1.23 -0.68,-1.21 0.72,-1.22 -2.14,-1.79 -0.97,0.05 0.25,-0.22 -0.29,-0.04 -0.25,0.65 0.45,-0.15 -0.21,0.3 -0.71,-0.23 -0.43,0.73 -1.39,0.25 0.21,0.44 -0.37,0.22 -0.29,1.67 -0.88,-0.52 -0.39,0.23 0.08,-0.88 -0.62,-0.5 0.64,-0.42 -0.75,-0.67 -0.89,0.49 0.09,-0.5 -0.46,0 -0.49,0.59 0.01,-0.47 -0.69,0.06 0.73,-0.51 -0.48,0.08 -0.7,-0.72 0.27,-1.42 2.88,-1.68 1.82,-1.75 0.74,0.04 0.84,-0.58 0.91,-1.4 1.18,-0.58 0.16,-0.69 0.34,-0.23 0.32,0.3 0.17,-0.7 2.06,-1.02 0.08,-0.55 1.83,-0.19 0.24,-0.48 2.22,-1.02 0.4,-0.59 0.89,0.41 1.63,-1.02 -0.11,0.27 0.62,-0.1 -0.03,0.46 0.89,-0.55 0.72,0.13 1.24,-0.98 0.41,-0.04 -0.18,0.34 1.05,-0.32 z m 26.01,3.89 -3.59,-2.36 -2.06,-0.79 -1.63,0.56 -2.06,0.02 0.27,-2.8 -0.96,0.11 -0.19,-0.77 0.85,-1.1 1.21,-0.23 0.85,-0.06 0.63,0.49 0.33,-0.6 1.22,0.42 1.44,-0.51 0.58,0.48 0.96,-0.59 -0.2,-0.72 0.47,0.11 -0.17,0.93 0.3,0.53 0.81,-0.66 -0.17,1.31 0.37,-0.3 -0.1,-1.13 0.97,0.22 -0.32,0.92 0.57,0.44 0.36,-0.36 0.28,1.38 0.05,-0.7 0.34,0.57 1.36,0 -0.39,0.14 0.31,0.38 -0.32,0.63 0.4,0.17 -0.12,0.46 0.41,-0.17 0.14,1.37 0.61,0.49 0.06,0.64 0.46,0.14 -0.46,0.22 -0.39,-0.73 -1.05,-0.18 1.06,0.52 0.3,0.57 -0.1,1.17 -0.85,0.82 -1.75,-0.56 -1.09,-0.89 z" />
    
    <path d="m 418.70514,13.518576 0.9,-0.37 0.32,1 1.29,0.87 1.23,-0.37 0.78,0.91 0.45,-0.11 0.47,0.47 0.59,-0.32 0.35,0.63 1.08,-0.12 1.31,1.52 2.88,1.38 1.96,0.13 1.49,-0.6 0.6,0.26 0.09,-0.29 0.35,0.71 0.9,0.28 3.44,-1.29 1.07,0.2 -0.05,-0.37 0.86,-0.47 1.24,0.06 1.84,-1.6 1.58,-0.6 0.23,1.23 -0.69,0.42 1.33,0.28 0.57,0.5 0.16,1.16 0,0 -0.9,0.5 0,0 -0.41,-0.04 0,0 -0.06,0.06 0,0 -0.3,0.34 0,0 -0.05,1.15 -1.28,0.78 0,0 -0.23,0.05 0,0 -0.32,0.42 -0.4,-0.72 -0.16,0.86 -0.87,-0.61 -0.17,2.66 0.48,0.65 -1.22,1.4 -1.77,0.91 -0.14,0.61 0,0 -0.07,0.34 0,0 -0.55,0.6 0.37,1.23 -0.29,0.65 -1.42,0.25 -0.35,0.94 -0.63,0.3 -1.45,0.18 -0.8,-0.53 -0.75,0.95 -0.04,1.07 -0.33,-0.01 0,0 0.22,0.32 0,0 0.26,1.68 -1.29,2 0.49,1.42 -1.49,0.35 -0.19,0.58 0.34,1.9 0.47,-0.21 0.13,0.36 -0.09,0.59 -2.42,0.65 0.26,-0.33 -0.31,-0.49 -0.86,-0.22 -0.98,0.58 -0.84,1.25 -0.46,-0.13 0.24,1.09 0.75,-0.03 0.29,0.72 0.8,-1.4 0.71,0.28 0.11,2.98 -0.83,0.26 0.02,0.76 0,0 -0.74,-0.26 -0.77,0.38 -1.02,-0.15 0.13,-1.08 -0.76,0.88 0.18,0.44 -1.05,-0.38 -0.68,0.79 -0.28,-1.13 -1.13,0.73 -0.27,-0.74 -0.6,-0.24 0.03,-0.6 -0.77,0.33 0,0 0.36,-0.87 0,0 0.27,-2.01 -1.57,-0.99 -0.66,-0.01 -0.41,1.55 -0.63,0.56 -0.33,-0.14 -0.11,0.48 -0.52,-0.53 0,0 -0.08,-0.4 0,0 0.56,-0.35 0.04,-0.77 -0.63,0.12 -0.02,-0.76 -0.41,-0.33 0,0 -0.84,-0.38 -0.29,-0.7 0,0 0.07,-0.07 0,0 -0.14,-0.87 -0.76,-0.52 -1.36,0.14 -0.99,-1.23 0,0 0,-0.13 0,0 -0.69,0.05 -0.18,-0.96 -2.67,0.29 0.63,-1.17 -0.92,-0.57 1.36,-2.5 -0.28,-0.77 -1.05,1.3 -0.93,-0.46 -0.82,1.12 0.42,0.41 -0.26,0.05 -1.92,-2.05 1.65,-2.51 2.15,0.57 -0.06,0.6 1.54,0.69 1.97,-0.33 1.07,-1.11 -1.68,-1.18 0.13,-0.4 -0.67,-0.8 -2.27,-0.15 -0.85,-0.55 0.95,-0.29 0.02,-1.4 -0.45,-0.26 0.62,-0.86 -0.2,-0.46 -0.29,0.2 -0.78,-0.53 1.06,-1.82 -0.65,-0.42 -1.48,0.22 -0.85,-0.98 -4.46,2.39 0,0 -0.46,-2.8 0,0 -0.18,-0.28 0,0 -0.22,-0.71 1.39,-0.38 0.42,-0.89 1.19,-0.29 0.2,-0.84 0.25,0.3 0.75,-0.29 0.43,0.39 1.46,-0.7 0.42,0.93 0.5,-0.55 0.91,-0.12 0.11,-1.94 0,0 0.7,-0.06 0.32,0.43 0.19,-0.74 0.32,0 1.38,0.91 0.39,-0.28 -0.3,0.27 0.64,0.5 0.17,-0.85 -0.62,-0.95 0.88,-0.33 0.93,-1.12 0.64,0.01 -0.01,-0.87 3.74,0.21 0.64,-0.53 z m -13.61,9.23 -0.6,-2.02 1.09,-0.51 0.47,0.26 -0.54,1.05 0.03,1.05 0,0 -0.45,0.17 z m 12.18,15.03 0.07,0.02 0,0 0.1,0.17 0,0 0.16,0.14 0,0 2.5,-0.29 2.39,1.05 1.1,-0.19 0.38,0.73 0.83,-0.45 -0.42,1.43 -0.4,0.47 -0.3,-0.14 -0.24,0.69 0.87,1.04 1.48,-0.57 0.15,1.39 -0.84,0.27 -0.17,-0.39 -2.21,0.07 -0.63,-0.91 -1.23,-0.06 -0.38,0.44 -1.34,-0.15 -0.48,-1.18 -1.07,-0.38 -1.22,-1.14 0.82,-1.54 0,0 0.08,-0.52 z" />
    
    <path d="m 454.97514,133.73858 1.28,0.18 0,0 0.31,0.18 0,0 0.48,-0.2 0.62,0.3 0,0 0.49,-0.43 0,0 0.45,-0.2 -0.01,-1.78 0.54,-0.46 0.03,0.32 0,0 0.17,0.43 0,0 0.43,1.05 0.81,0.5 0.01,1.02 2.64,0.13 1.92,1.54 0.17,0.69 -0.33,0.47 -2.22,0.91 0,0 -2.25,0.57 -0.72,-0.23 0,0 -0.05,-0.1 0,0 -2.66,-0.34 -1.22,-2.72 0.28,-0.27 -1.19,-0.86 0.02,-0.7 z m 8.42,6.1 0.48,0.33 0.21,-0.37 0.65,0.15 0.55,-0.39 2.27,-0.07 1.51,0.85 0.32,-0.28 0.44,0.89 -0.24,0.76 0.34,0.98 -0.3,0.63 1.15,0.87 2.03,-1.2 -1.13,-1.51 0.06,-1.88 1.46,-0.59 0.73,-1.85 1.96,0.07 1.37,-1.06 0.44,0.13 -0.36,-1.16 0.5,-0.82 0.83,-0.39 0.96,-4.06 1.38,0.84 1.81,-0.55 1.18,-0.71 -0.47,-1.08 0.3,-0.41 0.63,0.03 0.74,-1.24 1.58,-0.91 -0.15,-0.79 -1.63,-1.96 0.35,-0.54 1.68,-0.67 -0.12,-0.81 -0.65,-0.56 0.19,-3.41 -0.83,0.25 -1.24,-0.38 -0.26,-1.87 1.33,-0.5 0.61,0.69 1.93,-1.09 0.16,-1.77 0.93,-1.54 1.41,-0.05 0.03,0.62 0.97,0.86 1.23,0.58 1.09,-0.09 0,0 0.54,-0.03 0,0 0.54,0.18 0,0 0.01,0.11 0,0 0.32,1 0,0 0.32,0.12 0,0 1.84,-1.27 1.06,0.28 0.62,-0.52 0,0 0.75,0.35 0.77,-0.3 0.31,1.13 0,0 0.15,0 0,0 0.63,-0.08 0,0 0.27,0.27 0,0 0.08,0.09 0,0 0.2,0.08 0,0 -0.55,1.63 0.41,0.56 1.59,0.74 1.7,0.21 1.12,0.87 -0.13,1.09 2.06,0.88 0,0 -1.01,2.29 -0.05,-0.27 -1.54,2.36 -0.25,1.52 -2.25,2.9 -1.06,0.81 -0.57,1.58 -1.97,1.26 -1.32,3.3 -2.65,1.74 -1.49,4.14 -1.61,1.95 -0.49,0.04 -2.66,4.4 -0.82,2.81 -1.4,1.57 -1.56,3.42 0.05,2.14 -0.38,-0.29 0.34,0.58 -0.45,0.21 0.84,3.67 2.43,5.08 -0.62,0.43 0.06,1.09 2.1,5.19 3.77,4.14 3.96,0.88 -0.43,0.14 0.19,0.3 0.14,-0.29 0,0.39 2.08,1.05 -0.4,0.39 0.22,0.68 0.52,0.48 0.38,-0.15 0.27,0.97 -1.4,0.55 -0.89,1.38 -0.56,-0.21 -0.85,0.48 -0.67,0.94 0.25,0.5 -0.93,-0.36 -0.53,0.56 -0.88,-0.17 -0.72,0.43 -0.94,1.38 0.35,0.56 -1.27,1.33 -1.47,-0.39 -0.59,0.68 -3.1,0.98 -2.41,1.58 -0.78,1.34 0.01,1.79 -1.16,-0.34 -1.19,1.24 0.26,-0.58 -0.61,0.29 -0.42,1.8 0.29,2.69 -0.4,0.48 -1.91,0.04 -0.59,0.6 -0.75,2.46 -0.12,3.4 -0.55,0.89 -0.89,0.3 -0.59,1.91 -0.84,0.47 -0.31,1.72 0,0 -0.57,0.08 -1.3,-0.66 -1.97,-2.09 -3.19,-6.07 -0.17,-1.55 1.34,-2.2 0.6,-2.85 -0.6,-1.52 -2.9,-0.33 0.19,-2.93 -0.4,-0.21 2.15,-2.03 -0.32,-0.92 0.65,-1.75 -0.69,-2.85 0,0 1.74,-0.03 1.29,-1.37 -1.25,-2.65 0.9,-0.42 0.14,-1.36 -0.35,-1.11 0.32,-1.3 -0.66,-0.59 -0.3,-1.19 -1.12,-0.2 -0.88,0.54 -3.01,0.19 -2.23,-3.34 -1.01,-0.75 0.21,-2.11 2,-3.62 0.52,-3.35 -1.24,-0.68 -0.32,0.33 -0.91,-0.35 0,0 -0.16,-0.08 0,0 -0.57,-0.07 0,0 -0.16,0 0,0 -0.94,-0.35 0,0 -0.18,-0.05 0,0 -0.23,0.29 -0.84,-0.77 -0.47,0.04 0,-0.44 -0.67,-0.05 0.29,-0.31 -0.69,-0.16 -0.05,0.65 -0.06,-0.33 0,0 -0.06,-0.16 0,0 -0.67,0.49 0,0 0.12,-0.06 0,0 0.05,-0.48 -0.5,-0.18 0.39,-0.01 -0.19,-0.61 0,0 -0.07,0.06 0,0 -0.38,0.21 0.26,-0.32 -0.61,0 0.18,-0.65 -0.6,0 0,0 0.2,-0.24 0,0 -0.63,-0.09 -0.23,-0.81 0.41,-0.15 0.27,-0.7 -0.24,-0.63 0.35,-0.16 -0.1,-1.64 -0.48,-0.09 1.57,-0.95 1.59,-3.14 0.93,-0.79 0.78,0.29 0,0 0.73,0.35 0,0 0.96,-0.29 0.44,-0.68 -0.35,-1.4 1.6,-2.42 0.46,-3.35 0,0 0.09,-0.43 0,0 -0.39,-0.7 0.18,-0.58 1.78,-0.8 z" />
  </g>
      <g transform="translate(242, -250)">
    
    <rect x="0" y="525" width="70" height="30" rx="4" fill="none" stroke="#4ade80" strokeWidth="1" strokeDasharray="3 3" />
    
    
    <path fill="#dcfce7" stroke="#4ade80" strokeWidth="0.8" strokeLinejoin="round" d="m 6.6551421,536.85858 0.61,0.25 0.53,1.12 -0.85,1.06 -0.34,1.18 -0.81,0.38 -0.57,2.44 -0.86,-0.31 -1.11,-1.31 -2.58000003,-0.33 -0.41,-0.35 0.16,-1.25 0.54,-0.45 1.46000003,0.52 1.2,-0.28 1.3,-1.17 -0.12,-0.67 1.85,-0.83 z m 68.1899999,-10.15 0.5,0.46 -0.17,1.01 0,-0.83 -0.28,0.94 0,-0.53 -0.32,0.23 0.5,1.22 -0.24,1.23 1.26,1.53 0.16,0.56 -0.45,0.74 0.69,1 -0.71,0.26 -0.25,1.09 0.24,0.99 -0.8,0.37 -0.36,1.24 -3.34,1.19 -0.56,0.92 -0.78,0.08 -1.62,-0.69 -0.4,0.23 -3.06,-2.6 -1.26,-2.32 0.27,-3.19 0.99,-0.23 1.79,-1.49 0.64,-2.48 -0.33,-0.48 0.71,-0.13 0.43,0.36 0.8,-0.42 0.99,0.85 2.03,-0.33 1.64,0.88 0.79,-0.35 -0.12,-0.87 0.62,-0.44 z m -50.46,-1.06 0.38,-0.08 0.45,0.53 1.31,0.02 0.33,0.62 1.75,0.84 0.42,0.74 0.06,1.11 -1.86,1.76 -0.82,0.34 -1.94,-0.06 -1.34,-1.03 -0.04,-0.54 -0.75,-0.68 0.1,-1.66 0.65,-1.39 1.3,-0.52 z m 13.91,-4.94 0.97,-0.02 1.43,-0.79 1.92,0.24 1.43,-0.78 1.09,-0.02 2.2,-2.07 0.52,-1.21 0.76,-0.61 1.27,-0.28 0.36,-0.69 2.72,0.4 1.77,-0.7 0.7,0.22 0.34,0.67 -0.15,0.85 -2.99,1.39 -0.46,0.97 -2.95,2.32 0,2.24 -1.75,3.15 -0.04,1.71 -3.27,3.78 -1.33,-0.13 -1.31,0.78 -1.56,-0.02 -0.27,-1.3 -0.72,-0.29 0.02,-0.91 -1.15,-1.06 -1.58,-2.66 -0.11,-1.77 -1.52,-2.08 -0.76,-0.29 0.2,-0.6 2.3,-0.98 0.66,0.5 1.26,0.04 z m 78.069998,-11.75 1.55,1.36 0.38,3.71 -0.57,2.73 -0.66,0.72 0.41,2.69 -1.16,2.14 -0.04,1.12 -0.55,1.08 -0.74,0.7 -1.15,0.03 -0.69,0.64 -5.63,1.31 -3.08,3.71 -3.91,-1.02 -0.899998,0.36 0.449998,-1.38 0.27,0.31 1.1,-0.02 2,-0.53 3.93,-2.88 0.57,-3.52 1.12,-1.29 0.42,-2.17 1.44,-1.43 1.6,-3.26 -0.12,-0.75 0.82,-1.85 -0.22,-1.22 3.36,-1.29 z m 2.27,-0.29 -0.1,0.77 -0.43,0.06 -0.19,-0.47 0.72,-0.36 z m -111.5799979,-2.79 1.43,0.75 1.33,-0.4 0.8599999,0.16 0.74,2.1 0.72,0.92 -1.26,2.04 0.56,1.61 -0.26,1.65 -2.2199999,3.63 -0.74,-0.63 -0.33,-2.07 -1.24,-1.73 -1.49,-4.01 -0.72,-0.97 0.05,-0.83 1.04,-1.33 1.53,-0.89 z m 120.9399979,-11.46 1.14,0.57 0.1,0.75 -0.23,0.93 -0.98,0.82 0.45,1.25 -0.5,0.99 0.03,1.16 -0.57,0.79 -1.39,0.73 -0.29,0.53 -1.34,0.11 -1.25,0.92 -2.52,0.38 -1.4,2.11 -0.38,-0.62 -1.95,0.11 -0.24,-0.97 1.42,-1.31 -0.11,-1.88 0.5,-1.37 1.65,-1.38 1.27,-0.04 1.54,-1.34 0.49,0.23 0.86,-0.62 1.47,0.53 0.62,-0.72 0.77,-2.4 0.7,-0.61 0.14,0.35 z m -1.14,-1.97 0.95,0.83 -0.87,1.21 -1.07,0.17 0.99,-2.21 z m 0.08,-3.89 0.47,0.41 -0.52,0.56 -0.61,0.01 0.17,-0.84 0.49,-0.14 z" />
  </g>
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

      {/* aspect-ratio: ~1.5:1 matches Spain's geographic proportions; preserveAspectRatio="none" on SVG fills this area */}
      <div className="relative w-full" style={{ paddingBottom: '78%' }}>
        <SpainMapSVG />
        {SPAIN_REGIONS.map(r => {
          const isFound = found.has(r.id)
          const isShaking = shake === r.id
          return (
            <button
              key={r.id}
              onClick={() => click(r.id)}
              className={`absolute rounded-full border-2 border-white cursor-pointer transition-all duration-200 hover:scale-125 ${isShaking ? 'animate-shake' : ''}`}
              style={{
                left: `${r.x}%`,
                top: `${r.y}%`,
                transform: 'translate(-50%, -50%)',
                background: isFound ? '#58CC02' : (done ? '#1CB0F6' : color),
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                zIndex: isFound ? 5 : 2,
                width: '2rem',
                height: '2rem',
                minWidth: '2rem',
                minHeight: '2rem',
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

function Exercises({ mod, onXP, onHeartLost }: { mod: Mod; onXP: (n: number) => void; onHeartLost: () => void }) {
  const [quizState, setQuizState] = useState<QuizState>({})
  const [dropState, setDropState] = useState<DropState>({})
  const [dragWord, setDragWord] = useState<string | null>(null)
  const [shakeKey, setShakeKey] = useState<string | null>(null)
  const [matchSel, setMatchSel] = useState<Record<string, string | null>>({})
  const [matchFlash, setMatchFlash] = useState<Record<string, { left: string; right: string } | null>>({})

  // Shuffle options once per module — prevents re-shuffling on every state update
  const stableOpts = useMemo(
    () => mod.challenges.map(q =>
      q.type === 'checkbox' ? { ...q, options: shuffle(q.options) } : q
    ),
    [mod.id] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Shuffle right-side items for matching questions once per module
  const stableMatchRights = useMemo<Record<number, string[]>>(
    () => {
      const result: Record<number, string[]> = {}
      mod.challenges.forEach((q, i) => {
        if (q.type === 'matching') result[i] = shuffle(q.pairs.map(p => p.right))
      })
      return result
    },
    [mod.id] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // Shuffle figure options for visual_scenario questions once per module
  const stableSceneFigures = useMemo<Record<number, string[]>>(
    () => {
      const result: Record<number, string[]> = {}
      mod.challenges.forEach((q, i) => {
        if (q.type === 'visual_scenario') result[i] = shuffle([q.answer, ...q.distractors])
      })
      return result
    },
    [mod.id] // eslint-disable-line react-hooks/exhaustive-deps
  )

  function handleSceneDrop(qKey: string, figure: string, answer: string) {
    if (dropState[`${qKey}-vs`] === answer) return
    setDropState(s => ({ ...s, [`${qKey}-vs`]: figure }))
    setDragWord(null)
    if (figure === answer) {
      onXP(15)
    } else {
      setShakeKey(qKey)
      setTimeout(() => {
        setShakeKey(null)
        setDropState(s => { const next = { ...s }; delete next[`${qKey}-vs`]; return next })
      }, 1200)
    }
  }

  function answerQuiz(key: string, opt: { text: string; correct: boolean }) {
    if (quizState[key] !== undefined) return
    setQuizState(s => ({ ...s, [key]: { optionText: opt.text, correct: opt.correct } }))
    if (opt.correct) onXP(10)
    else {
      onHeartLost()
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
                          onClick={() => !used && setDragWord(dragWord === word ? null : word)}
                          className="px-3 py-1.5 rounded-lg border-2 border-[#1A1A2E] font-bold text-sm text-[#1A1A2E] cursor-grab select-none transition-all"
                          style={{
                            background: used ? '#e5e5e5' : dragWord === word ? mod.color + '30' : '#fff',
                            opacity: used ? 0.4 : 1,
                            boxShadow: dragWord === word ? `0 0 0 2px ${mod.color}` : used ? 'none' : '2px 2px 0 #1A1A2E',
                            outline: dragWord === word ? `2px solid ${mod.color}` : 'none',
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
                          onClick={() => {
                            if (dragWord && !isCorrect) {
                              answerDrop(k, part.answer, dragWord)
                              setDragWord(null)
                            }
                          }}
                          className={`inline-block mx-1 px-3 py-0.5 rounded-lg border-2 font-bold text-sm align-middle transition-all min-w-[80px] text-center ${isCorrect ? 'cursor-default' : dragWord ? 'cursor-pointer ring-2 ring-offset-1' : 'cursor-pointer'} ${shakeKey === k ? 'animate-shake' : ''}`}
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
                    <div className="relative w-full" style={{ paddingBottom: '78%' }}>
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

        if (q.type === 'matching') {
          const rights = stableMatchRights[qi] ?? q.pairs.map(p => p.right)
          const selectedLeft = matchSel[qKey] ?? null
          const flash = matchFlash[qKey] ?? null
          const allMatched = q.pairs.every(p => dropState[`${qKey}-m-${p.left}`] === p.right)
          const isFlashing = !!flash

          const handleMatchLeft = (left: string) => {
            if (allMatched || isFlashing) return
            const isAlreadyMatched = dropState[`${qKey}-m-${left}`] === q.pairs.find(p => p.left === left)?.right
            if (isAlreadyMatched) return
            setMatchSel(s => ({ ...s, [qKey]: s[qKey] === left ? null : left }))
          }

          const handleMatchRight = (right: string) => {
            if (allMatched || !selectedLeft || isFlashing) return
            const isAlreadyMatchedRight = q.pairs.some(p => dropState[`${qKey}-m-${p.left}`] === right)
            if (isAlreadyMatchedRight) return
            const expectedRight = q.pairs.find(p => p.left === selectedLeft)?.right
            const left = selectedLeft
            setMatchSel(s => ({ ...s, [qKey]: null }))
            if (right === expectedRight) {
              setDropState(s => ({ ...s, [`${qKey}-m-${left}`]: right }))
              onXP(10)
            } else {
              setMatchFlash(s => ({ ...s, [qKey]: { left, right } }))
              setTimeout(() => setMatchFlash(s => ({ ...s, [qKey]: null })), 1000)
            }
          }

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
                  <p className="font-bold text-[#1A1A2E] mb-1">{q.prompt}</p>
                  {/* Status hint — fixed height prevents layout jump */}
                  <p className="text-xs font-semibold mb-3 leading-snug" style={{ minHeight: '2.4em' }}>
                    {flash ? (
                      <span className="text-[#cc1a1a]">
                        ✗ <strong>«{flash.left}»</strong> no corresponde a <strong>«{flash.right}»</strong>.{' '}
                        <span className="font-normal opacity-80">{q.wrongHint ?? 'Inténtalo de nuevo.'}</span>
                      </span>
                    ) : selectedLeft ? (
                      <span style={{ color: mod.color }}>
                        Seleccionado: <strong>«{selectedLeft}»</strong> — ahora toca su pareja →
                      </span>
                    ) : (
                      <span className="text-[#4B4B6B]">Toca un elemento de la izquierda y luego su pareja de la derecha</span>
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Left column */}
                    <div className="flex flex-col gap-2">
                      {q.pairs.map((pair, pi) => {
                        const isMatched = dropState[`${qKey}-m-${pair.left}`] === pair.right
                        const isSelected = selectedLeft === pair.left
                        const isFlashWrong = flash?.left === pair.left
                        return (
                          <button
                            key={pi}
                            onClick={() => handleMatchLeft(pair.left)}
                            disabled={isMatched || allMatched || isFlashing}
                            className="px-3 py-2.5 rounded-xl border-2 font-bold text-sm text-[#1A1A2E] text-left transition-all duration-200"
                            style={{
                              borderColor: isMatched ? '#58CC02' : isFlashWrong ? '#FF4B4B' : isSelected ? mod.color : '#1A1A2E',
                              background: isMatched ? 'rgba(88,204,2,0.12)' : isFlashWrong ? 'rgba(255,75,75,0.12)' : isSelected ? mod.color + '22' : '#fff',
                              boxShadow: isMatched ? '2px 2px 0 #58CC02' : isFlashWrong ? '2px 2px 0 #FF4B4B' : isSelected ? `2px 2px 0 ${mod.color}` : '2px 2px 0 #1A1A2E',
                              opacity: isMatched || isFlashWrong || isSelected ? 1 : (allMatched ? 0.5 : 1),
                            }}
                          >
                            {isMatched && <span className="text-[#58CC02] mr-1">✓</span>}
                            {isFlashWrong && <span className="text-[#FF4B4B] mr-1">✗</span>}
                            {pair.left}
                          </button>
                        )
                      })}
                    </div>
                    {/* Right column */}
                    <div className="flex flex-col gap-2">
                      {rights.map((right, ri) => {
                        const isMatched = q.pairs.some(p => dropState[`${qKey}-m-${p.left}`] === right)
                        const isFlashWrong = flash?.right === right
                        const isActive = !!selectedLeft && !isMatched && !isFlashing
                        return (
                          <button
                            key={ri}
                            onClick={() => handleMatchRight(right)}
                            disabled={isMatched || allMatched || isFlashing}
                            className="px-3 py-2.5 rounded-xl border-2 font-bold text-sm text-[#1A1A2E] text-left transition-all duration-200"
                            style={{
                              borderColor: isMatched ? '#58CC02' : isFlashWrong ? '#FF4B4B' : isActive ? '#1A1A2E' : 'rgba(26,26,46,0.3)',
                              background: isMatched ? 'rgba(88,204,2,0.12)' : isFlashWrong ? 'rgba(255,75,75,0.12)' : isActive ? '#FFFBF0' : '#f0ede4',
                              boxShadow: isMatched ? '2px 2px 0 #58CC02' : isFlashWrong ? '2px 2px 0 #FF4B4B' : isActive ? '2px 2px 0 #1A1A2E' : 'none',
                              opacity: isMatched || isFlashWrong || isActive ? 1 : 0.5,
                            }}
                          >
                            {isMatched && <span className="text-[#58CC02] mr-1">✓</span>}
                            {isFlashWrong && <span className="text-[#FF4B4B] mr-1">✗</span>}
                            {right}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                  {allMatched && (
                    <div className="mt-3 px-4 py-2 rounded-xl text-sm font-bold animate-bounce-in bg-[#58CC02]/15 text-[#2d6e00] border-2 border-[#58CC02]">
                      ✅ ¡Todas las parejas correctas! +{q.pairs.length * 10} XP
                    </div>
                  )}
                  {allMatched && q.explanation && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#4B4B6B] border border-[#1A1A2E]/10 bg-white/60 leading-relaxed">
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

        if (q.type === 'visual_scenario') {
          const figures = stableSceneFigures[qi] ?? [q.answer, ...q.distractors]
          const vsKey = `${qKey}-vs`
          const placed = dropState[vsKey]
          const isCorrect = placed === q.answer
          const isWrong = !!placed && placed !== q.answer
          const isShakingVS = shakeKey === qKey

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
                  <p className="font-bold text-[#1A1A2E] mb-1">{q.scene.emoji} {q.scene.title}</p>
                  <p className="text-xs text-[#4B4B6B] mb-3">{q.scene.setting} — <em>¿Quién pertenece a esta escena?</em></p>

                  {/* Stage */}
                  <div
                    className="relative rounded-2xl border-3 border-[#1A1A2E] mb-4 overflow-hidden"
                    style={{
                      background: q.scene.stageBg,
                      minHeight: '120px',
                      boxShadow: '4px 4px 0 #1A1A2E',
                    }}
                    onDragOver={e => { e.preventDefault() }}
                    onDrop={e => {
                      e.preventDefault()
                      const fig = e.dataTransfer.getData('text/plain')
                      if (fig) handleSceneDrop(qKey, fig, q.answer)
                    }}
                    onClick={() => {
                      if (!dragWord || isCorrect) return
                      handleSceneDrop(qKey, dragWord, q.answer)
                    }}
                  >
                    {/* Background emoji scenery */}
                    <div className="absolute inset-0 flex items-end justify-around pb-2 pointer-events-none select-none opacity-60 text-3xl px-3">
                      {q.scene.bgEmojis.map((em, i) => <span key={i}>{em}</span>)}
                    </div>

                    {/* Drop zone */}
                    <div className="relative z-10 flex flex-col items-center justify-center" style={{ minHeight: '120px' }}>
                      {isCorrect ? (
                        <div className="flex flex-col items-center gap-1 animate-land">
                          <span className="text-5xl drop-shadow-lg">{q.scene.successEmoji}</span>
                          <span className="text-sm font-black text-white drop-shadow px-3 py-1 rounded-xl" style={{ background: 'rgba(0,0,0,0.45)' }}>
                            {placed}
                          </span>
                          <span className="text-xs font-bold text-[#58CC02] bg-white/80 px-2 py-0.5 rounded-full">+15 XP ✅</span>
                        </div>
                      ) : isWrong ? (
                        <div className={`flex flex-col items-center gap-1 ${isShakingVS ? 'animate-shake' : ''}`}>
                          <span className="text-4xl opacity-50">😕</span>
                          <span className="text-xs font-bold text-white/80 bg-black/30 px-3 py-1 rounded-xl text-center max-w-[180px]">
                            {q.wrongHint ?? 'No es correcto. Inténtalo de nuevo.'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-white/70">
                          <span className="text-3xl">🎯</span>
                          <span className="text-xs font-bold border-2 border-dashed border-white/40 rounded-xl px-4 py-2 text-center" style={{ minWidth: '140px' }}>
                            {q.scene.dropZoneLabel}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Figure buttons */}
                  {!isCorrect && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {figures.map((fig, fi) => {
                        const isSelected = dragWord === fig
                        return (
                          <button
                            key={fi}
                            draggable
                            onDragStart={e => { e.dataTransfer.setData('text/plain', fig); setDragWord(fig) }}
                            onDragEnd={() => setDragWord(null)}
                            onClick={() => {
                              if (dragWord === fig) {
                                handleSceneDrop(qKey, fig, q.answer)
                              } else {
                                setDragWord(fig)
                              }
                            }}
                            className="px-4 py-2.5 rounded-xl border-2 font-black text-sm transition-all duration-150 cursor-grab active:cursor-grabbing select-none"
                            style={{
                              borderColor: isSelected ? mod.color : '#1A1A2E',
                              background: isSelected ? mod.color + '22' : '#FFFBF0',
                              boxShadow: isSelected ? `3px 3px 0 ${mod.color}` : '3px 3px 0 #1A1A2E',
                              transform: isSelected ? 'translateY(-2px)' : 'none',
                              color: '#1A1A2E',
                            }}
                          >
                            {fig}
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {isCorrect && q.scene.successText && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#2d6e00] border-2 border-[#58CC02] bg-[#58CC02]/10 font-bold">
                      🎉 {q.scene.successText}
                    </div>
                  )}
                  {isCorrect && q.explanation && (
                    <div className="mt-2 px-4 py-2 rounded-xl text-xs text-[#4B4B6B] border border-[#1A1A2E]/10 bg-white/60 leading-relaxed">
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

// ─── Onboarding Carousel (3 steps, shown on first visit) ─────────────────────

const ONBOARDING_STEPS = [
  {
    emoji: '🇪🇸',
    title: '¡Bienvenido/a!',
    subtitle: 'Tu guía para el examen CCSE',
    body: 'Esta app te prepara para el examen de Conocimientos Constitucionales y Socioculturales de España. ¡Todo lo que necesitas, en un solo lugar!',
    color: '#FF4B4B',
    decorations: ['📜', '⚖️', '🏛️'],
  },
  {
    emoji: '🎮',
    title: 'Aprende jugando',
    subtitle: 'Gamificación educativa',
    body: 'Gana ⭐ XP en cada ejercicio, mantén tu racha 🔥 diaria, desbloquea insignias 🏅 y explora mapas interactivos de España.',
    color: '#58CC02',
    decorations: ['⭐', '🔥', '🏅'],
  },
  {
    emoji: '🚀',
    title: '¡Todo tuyo!',
    subtitle: 'Empieza tu aventura',
    body: '4 módulos completos con teoría, ejercicios reales, mapas y cultura. Estudia a tu ritmo y ¡consigue tu ciudadanía española! ❤️',
    color: '#CE82FF',
    decorations: ['🗺️', '🎨', '🏆'],
  },
]

function OnboardingCarousel({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const current = ONBOARDING_STEPS[step]

  function goNext() {
    if (step < ONBOARDING_STEPS.length - 1) {
      setDirection(1)
      setStep(s => s + 1)
    } else {
      onDone()
    }
  }

  function goBack() {
    if (step > 0) {
      setDirection(-1)
      setStep(s => s - 1)
    }
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0, scale: 0.95 }),
  }

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.75)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-sm"
        initial={{ scale: 0.85, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        {/* Card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: '4px solid #1A1A2E', background: '#FFFBF0', boxShadow: '8px 8px 0 #1A1A2E' }}
        >
          {/* Colorful top strip */}
          <div
            className="h-2"
            style={{ background: `linear-gradient(to right, ${current.color}, ${current.color}99)` }}
          />

          {/* Floating decorations */}
          <div className="relative px-8 pt-8 pb-4 overflow-hidden">
            {current.decorations.map((deco, i) => (
              <span
                key={i}
                className="absolute text-3xl opacity-10 select-none pointer-events-none"
                style={{
                  top: `${[10, 20, 5][i]}%`,
                  right: `${[8, 25, 45][i]}%`,
                  transform: `rotate(${[-15, 12, -8][i]}deg)`,
                }}
              >
                {deco}
              </span>
            ))}

            {/* Step content — animated slide */}
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              >
                {/* Big emoji */}
                <motion.div
                  className="text-7xl text-center mb-4 leading-none"
                  initial={{ scale: 0.4, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.08 }}
                >
                  {current.emoji}
                </motion.div>

                <h2
                  className="text-2xl font-black text-center text-[#1A1A2E] mb-1"
                  style={{ fontFamily: "'Fredoka One', cursive" }}
                >
                  {current.title}
                </h2>
                <p className="text-xs font-black text-center uppercase tracking-widest mb-4" style={{ color: current.color }}>
                  {current.subtitle}
                </p>
                <p className="text-sm text-[#4B4B6B] font-semibold text-center leading-relaxed">
                  {current.body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 pb-5">
            {ONBOARDING_STEPS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setDirection(i > step ? 1 : -1); setStep(i) }}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === step ? '1.5rem' : '0.5rem',
                  height: '0.5rem',
                  background: i === step ? current.color : '#1A1A2E30',
                  border: `2px solid ${i === step ? current.color : 'transparent'}`,
                }}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="px-6 pb-6 flex gap-3">
            {step > 0 ? (
              <button
                onClick={goBack}
                className="flex-1 py-3 rounded-2xl font-black text-sm border-2 border-[#1A1A2E] transition-all hover:bg-[#1A1A2E]/5"
                style={{ boxShadow: '3px 3px 0 #1A1A2E' }}
              >
                ← Atrás
              </button>
            ) : (
              <button
                onClick={onDone}
                className="flex-1 py-3 rounded-2xl font-black text-sm border-2 border-[#1A1A2E]/30 text-[#1A1A2E]/40 transition-all hover:border-[#1A1A2E]/60"
              >
                Omitir
              </button>
            )}
            <motion.button
              onClick={goNext}
              className="flex-[2] py-3 rounded-2xl font-black text-sm text-white border-2 border-[#1A1A2E] transition-all"
              style={{ background: current.color, boxShadow: '4px 4px 0 #1A1A2E' }}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97, y: 2, boxShadow: '2px 2px 0 #1A1A2E' }}
            >
              {step < ONBOARDING_STEPS.length - 1 ? 'Siguiente →' : '¡Empezar! 🚀'}
            </motion.button>
          </div>
        </div>

        {/* Step counter badge */}
        <div
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full border-3 border-[#1A1A2E] flex items-center justify-center font-black text-sm text-white"
          style={{ background: current.color, borderWidth: 3, boxShadow: '3px 3px 0 #1A1A2E' }}
        >
          {step + 1}/{ONBOARDING_STEPS.length}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── About Modal (Sobre el proyecto) ─────────────────────────────────────────

function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.7)', backdropFilter: 'blur(6px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ scale: 0.88, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: '4px solid #1A1A2E', background: '#FFFBF0', boxShadow: '8px 8px 0 #1A1A2E' }}
        >
          {/* Hero */}
          <div
            className="px-7 pt-7 pb-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FF4B4B15 0%, #CE82FF15 100%)' }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-xl border-2 border-[#1A1A2E] flex items-center justify-center font-black text-lg hover:bg-[#1A1A2E]/10 transition-colors"
              style={{ boxShadow: '2px 2px 0 #1A1A2E' }}
            >
              ×
            </button>
            <div className="text-4xl mb-3">🇪🇸</div>
            <h2 className="font-black text-[#1A1A2E] text-xl mb-0.5" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Sobre el Proyecto
            </h2>
            <p className="text-xs font-bold text-[#1A1A2E]/50 uppercase tracking-widest">Prueba CCSE · Español para siempre</p>
          </div>

          {/* Content */}
          <div className="px-7 py-5 space-y-4 max-h-[55vh] overflow-y-auto">
            {/* What it is */}
            <div
              className="rounded-2xl p-4"
              style={{ border: '2px solid #1A1A2E', background: '#FFC80018', boxShadow: '3px 3px 0 #FFC800' }}
            >
              <p className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]/50 mb-1.5">¿Qué es esto? 📚</p>
              <p className="text-sm text-[#1A1A2E] font-semibold leading-relaxed">
                Una herramienta gratuita para preparar el examen <strong>CCSE</strong> (Conocimientos Constitucionales y Socioculturales de España), requisito para la nacionalidad española.
              </p>
            </div>

            {/* How to use */}
            <div
              className="rounded-2xl p-4"
              style={{ border: '2px solid #1A1A2E', background: '#1CB0F618', boxShadow: '3px 3px 0 #1CB0F6' }}
            >
              <p className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]/50 mb-2">¿Cómo usarla? 🗺️</p>
              <div className="space-y-1.5">
                {[
                  ['1', 'Elige un módulo en el menú lateral'],
                  ['2', 'Lee la teoría y los datos clave'],
                  ['3', 'Practica con los ejercicios interactivos'],
                  ['4', 'Sigue tu progreso con las insignias 🏅'],
                ].map(([n, text]) => (
                  <div key={n} className="flex items-start gap-2.5">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0 mt-0.5"
                      style={{ background: '#1CB0F6' }}
                    >
                      {n}
                    </span>
                    <p className="text-sm text-[#1A1A2E] font-semibold">{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div
              className="rounded-2xl p-4"
              style={{ border: '2px solid #1A1A2E', background: '#58CC0215', boxShadow: '3px 3px 0 #58CC02' }}
            >
              <p className="text-xs font-black uppercase tracking-widest text-[#1A1A2E]/50 mb-1.5">Contacto & Sugerencias 💬</p>
              <p className="text-sm text-[#1A1A2E] font-semibold leading-relaxed">
                ¿Encontraste un error o tienes una sugerencia? ¿Encontraste un error o tienes una sugerencia? Escríbeme a{' '}
                <a
                  href="mailto:its.liriani@gmail.com"
                  className="font-black underline decoration-dotted"
                  style={{ color: '#58CC02' }}
                >
                  its.liriani@gmail.com
                </a>
              </p>
            </div>

            {/* Thank you */}
            <div
              className="rounded-2xl p-4 text-center"
              style={{ border: '2px solid #1A1A2E', background: '#FF4B4B12', boxShadow: '3px 3px 0 #FF4B4B' }}
            >
              <p className="text-2xl mb-2">❤️</p>
              <p className="text-sm text-[#1A1A2E] font-bold leading-relaxed">
                Gracias por usar esta herramienta. Fue hecha con <strong>mucho amor</strong> para ayudarte a cumplir tu sueño. ¡Tú puedes!
              </p>
              <p className="text-xs text-[#1A1A2E]/40 font-semibold mt-2 uppercase tracking-wider">Hecho con ❤️ para la comunidad</p>
            </div>
          </div>

          {/* Close button */}
          <div className="px-7 pb-6">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-2xl font-black text-sm text-white border-2 border-[#1A1A2E] transition-all hover:scale-[1.02]"
              style={{ background: '#FF4B4B', boxShadow: '4px 4px 0 #1A1A2E' }}
            >
              ¡Entendido, a estudiar! 📖
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
  const [activeView, setActiveView] = useState<'module' | 'progress' | 'timeline' | 'sociedad'>('module')
  const [unlockedBadges, setUnlockedBadges] = useState<Set<string>>(new Set(['b0']))
  const [newBadgeAlert, setNewBadgeAlert] = useState<Badge | null>(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [onboardingDone, setOnboardingDone] = useState<boolean>(() => {
    try { return !!localStorage.getItem('ccse_onboarded') } catch { return false }
  })
  const xpIdRef = useRef(0)
  const mainRef = useRef<HTMLDivElement>(null)
  const unlockedBadgeIdsRef = useRef<Set<string>>(new Set(['b0']))

  const mod = MODULES.find(m => m.id === modId)!
  const progress = Math.round((completed.size / MODULES.length) * 100)

  // Prevent page scroll while the off-canvas drawer is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#FFFBF0', fontFamily: "'Nunito', sans-serif" }}>

      {/* Onboarding carousel — shows only on first visit */}
      <AnimatePresence>
        {!onboardingDone && (
          <OnboardingCarousel onDone={() => {
            try { localStorage.setItem('ccse_onboarded', '1') } catch {}
            setOnboardingDone(true)
          }} />
        )}
      </AnimatePresence>

      {/* About / Sobre el proyecto modal */}
      <AnimatePresence>
        {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
      </AnimatePresence>

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

      {/* Off-canvas backdrop — fades in/out with the drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            className="fixed inset-0 z-30"
            style={{ background: 'rgba(26,26,46,0.55)', backdropFilter: 'blur(3px)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      {/* Mobile: fixed full-height drawer (h-dvh fills the visible viewport including dynamic chrome) */}
      {/* Desktop: relative static column that scrolls with the page */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-72 h-dvh flex flex-col
          border-r-4 border-[#1A1A2E]
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          will-change-transform
          ${sidebarOpen
            ? 'translate-x-0 shadow-[6px_0_24px_rgba(26,26,46,0.18)]'
            : '-translate-x-full'}
        `}
        style={{ background: '#FFFBF0' }}
      >
        {/* Logo — click to open About modal */}
        <button
          onClick={() => setAboutOpen(true)}
          className="p-5 border-b-4 border-[#1A1A2E] flex items-center gap-3 w-full text-left hover:bg-[#1A1A2E]/5 transition-colors"
          title="Sobre el proyecto"
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-3 border-[#1A1A2E] font-black flex-shrink-0 transition-transform hover:scale-110"
            style={{ background: '#FF4B4B', boxShadow: '3px 3px 0 #1A1A2E', borderWidth: 3 }}
          >
            🇪🇸
          </div>
          <div>
            <div className="font-black text-[#1A1A2E] text-lg leading-tight" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Prueba CCSE
            </div>
            <div className="text-xs font-bold text-[#1A1A2E]/50 uppercase tracking-wider">Toca para saber más ✨</div>
          </div>
        </button>

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
            onClick={() => { setActiveView('timeline'); setSidebarOpen(false) }}
            className="w-full text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all font-bold"
            style={{
              borderColor: activeView === 'timeline' ? '#FF6B35' : 'transparent',
              background: activeView === 'timeline' ? '#FF6B3520' : 'transparent',
              boxShadow: activeView === 'timeline' ? '3px 3px 0 #FF6B35' : 'none',
              color: '#1A1A2E',
            }}
          >
            <span className="text-xl">🗺️</span>
            <span className="flex-1 text-sm leading-snug">Historia de España</span>
          </button>
          <button
            onClick={() => { setActiveView('sociedad'); setSidebarOpen(false) }}
            className="w-full text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all font-bold"
            style={{
              borderColor: activeView === 'sociedad' ? '#1CB0F6' : 'transparent',
              background: activeView === 'sociedad' ? '#1CB0F620' : 'transparent',
              boxShadow: activeView === 'sociedad' ? '3px 3px 0 #1CB0F6' : 'none',
              color: '#1A1A2E',
            }}
          >
            <span className="text-xl">🏙️</span>
            <span className="flex-1 text-sm leading-snug">Sociedad y trámites</span>
          </button>
          {/* Mi Progresión — last in nav */}
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
      <div ref={mainRef} className="flex-1 relative min-w-0">

        {/* Top bar */}
        <div
          className="sticky top-0 z-20 px-4 md:px-8 h-16 flex items-center justify-between border-b-4 border-[#1A1A2E]"
          style={{ background: '#FFFBF0' }}
        >
          {/* Hamburger / close toggle — visible on all screen sizes */}
          <button
            className="w-10 h-10 rounded-xl border-2 border-[#1A1A2E] flex items-center justify-center font-black transition-colors hover:bg-[#1A1A2E]/5"
            style={{ boxShadow: '2px 2px 0 #1A1A2E' }}
            onClick={() => setSidebarOpen(s => !s)}
            aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={sidebarOpen}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={sidebarOpen ? 'close' : 'open'}
                initial={{ scale: 0.4, opacity: 0, rotate: sidebarOpen ? -45 : 45 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.15 }}
                style={{ display: 'block', lineHeight: 1 }}
              >
                {sidebarOpen ? '✕' : '☰'}
              </motion.span>
            </AnimatePresence>
          </button>

          <div className="flex items-center gap-2 md:gap-4">
            {MODULES.map(m => (
              <button
                key={m.id}
                onClick={() => navigate(m.id)}
                className="hidden w-9 h-9 rounded-full border-2 border-[#1A1A2E] items-center justify-center text-base transition-transform hover:scale-110"
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

          {/* Stat pills — each navigates to Mi Progresión */}
          <div className="flex items-center gap-3 text-sm font-black text-[#1A1A2E]">
            <button
              onClick={() => { setActiveView('progress'); setSidebarOpen(false) }}
              title="Ver Mi Progresión"
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-[#1A1A2E] transition-all duration-300 hover:scale-110 cursor-pointer ${xpAnim ? 'scale-125 shadow-brutal-sun' : ''}`}
              style={{ background: '#FFC800', boxShadow: xpAnim ? '4px 4px 0 #1A1A2E' : '2px 2px 0 #1A1A2E' }}
            >
              ⭐ <span className={xpAnim ? 'animate-pop' : ''}>{xp}</span>
            </button>
            <button
              onClick={() => { setActiveView('progress'); setSidebarOpen(false) }}
              title="Ver Mi Progresión"
              className="flex items-center gap-1 px-3 py-1 rounded-full border-2 border-[#1A1A2E] hover:scale-110 transition-transform cursor-pointer"
              style={{ background: '#FF4B4B22' }}
            >
              🔥 {streak}
            </button>
            <button
              onClick={() => { setActiveView('progress'); setSidebarOpen(false) }}
              title="Ver Mi Progresión"
              className="flex items-center gap-1 px-3 py-1 rounded-full border-2 border-[#1A1A2E] hover:scale-110 transition-transform cursor-pointer"
              style={{ background: '#FF4B4B22' }}
            >
              ❤️ {hearts}
            </button>
          </div>
        </div>

        {/* Content */}
        {activeView === 'progress' ? (
          <ProgressionMap xp={xp} unlockedBadges={unlockedBadges} />
        ) : activeView === 'timeline' ? (
          <TimelineMindMap />
        ) : activeView === 'sociedad' ? (
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-10 space-y-16">
            <DocumentWallet />
            <RoutineTimeSlider />
            <EmergencyPhone />
          </div>
        ) : null}
        <div className={`max-w-3xl mx-auto px-4 md:px-8 py-8 pb-24 space-y-10 ${activeView !== 'module' ? 'hidden' : ''}`}>

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

          {/* ── Festive Calendar (Module 4 only) ── */}
          {mod.id === 4 && (
            <div>
              <FestiveCalendar />
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
            <Exercises mod={mod} onXP={gainXP} onHeartLost={() => setHearts(h => Math.max(0, h - 1))} />
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
