import type { Badge } from '../types'

export const BADGES: Badge[] = [
  { id: 'b0', name: 'Estudiante', emoji: '🎓', xpRequired: 0,    trivia: 'Has dado el primer paso hacia la ciudadanía española. ¡Bienvenido!' },
  { id: 'b1', name: 'La Alhambra', emoji: '🏰', xpRequired: 50,   trivia: 'La Alhambra de Granada fue construida en el s. XIII por los sultanes nazaríes y es el monumento más visitado de España.' },
  { id: 'b2', name: 'Sagrada Família', emoji: '⛪', xpRequired: 150, trivia: 'La Sagrada Família de Gaudí lleva en construcción desde 1882, es Patrimonio UNESCO y aún no está terminada.' },
  { id: 'b3', name: 'El Prado', emoji: '🖼️', xpRequired: 300,  trivia: 'El Museo del Prado alberga Las Meninas de Velázquez y Los fusilamientos de Goya. Es uno de los más importantes del mundo.' },
  { id: 'b4', name: 'El Teide', emoji: '🌋', xpRequired: 500,  trivia: 'El Teide (3.718 m) en Tenerife es el pico más alto de España y el tercer volcán más grande del mundo.' },
  { id: 'b5', name: 'La Meseta', emoji: '🏔️', xpRequired: 800,  trivia: 'La Meseta Central ocupa el 40% del territorio español y es la meseta más elevada de Europa Occidental.' },
  { id: 'b6', name: 'El Camino', emoji: '⛺', xpRequired: 1200, trivia: 'El Camino de Santiago (Patrimonio UNESCO) tiene más de 1.000 años de historia. La ruta Francesa mide 780 km.' },
  { id: 'b7', name: 'Ciudadano de Honor', emoji: '🇪🇸', xpRequired: 2000, trivia: '¡Dominas el CCSE! El examen real tiene 25 preguntas y necesitas acertar al menos 15 (60%) para obtener la nacionalidad.' },
]
