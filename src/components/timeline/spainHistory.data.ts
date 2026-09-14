import { type TimelineEvent } from './types'

export const SPAIN_HISTORY: TimelineEvent[] = [
  // ── 1 ─────────────────────────────────────────────────────────────────────
  {
    id: 'al-andalus',
    year: 711,
    era: 'Early Medieval',
    title: 'Al-Ándalus',
    shortDesc:
      'The Umayyad conquest begins 800 years of Islamic civilisation on the Iberian Peninsula.',
    fullDesc:
      `The Umayyad invasion of 711 transformed Iberia into Al-Ándalus — at its height the most sophisticated civilisation west of Constantinople. Córdoba's library held 400,000 volumes when Paris had fewer than a dozen monasteries. The period of Convivencia saw Christians, Jews, and Muslims exchange philosophy, medicine, and poetry in an unprecedented cultural synthesis that shaped the European Renaissance.`,
    tags: ['islam', 'medieval', 'convivencia', 'architecture'],
    subNodes: [
      {
        id: 'caliphate-cordoba',
        type: 'event',
        label: 'Caliphate of Córdoba',
        year: 929,
        description:
          'Abd al-Rahman III proclaims the Caliphate, making Córdoba the largest city in Western Europe and its foremost intellectual centre.',
        branchSide: 'right',
        figures: [
          {
            id: 'averroes',
            name: 'Ibn Rushd (Averroes)',
            born: 1126,
            died: 1198,
            role: 'Philosopher & Physician',
            notableWorks: [
              { title: 'Commentaries on Aristotle', year: 1169, medium: 'other' },
              { title: 'Tahāfut al-Tahāfut', year: 1180, medium: 'other' },
            ],
            connections: ['maimonides'],
          },
          {
            id: 'maimonides',
            name: 'Maimonides',
            born: 1135,
            died: 1204,
            role: 'Jewish Philosopher & Physician',
            notableWorks: [
              { title: 'Mishneh Torah', year: 1180, medium: 'other' },
              { title: 'The Guide for the Perplexed', year: 1190, medium: 'other' },
            ],
            connections: ['averroes'],
          },
        ],
      },
      {
        id: 'mezquita-cordoba',
        type: 'event',
        label: 'Mezquita de Córdoba',
        year: 785,
        description:
          'Construction begins on the Great Mosque — a forest of 856 marble columns and red-and-white striped arches later converted into a cathedral.',
        branchSide: 'left',
        figures: [
          {
            id: 'abd-al-rahman-i',
            name: 'Abd al-Rahman I',
            born: 731,
            died: 788,
            role: 'Founder of the Emirate of Córdoba',
            notableWorks: [
              { title: 'Great Mosque of Córdoba (first phase)', year: 785, medium: 'architecture' },
            ],
          },
        ],
      },
    ],
  },

  // ── 2 ─────────────────────────────────────────────────────────────────────
  {
    id: 'reconquista-1492',
    year: 1492,
    era: 'Late Medieval · Early Modern',
    title: 'Reconquista & Nuevo Mundo',
    shortDesc:
      'Granada falls, Columbus sails — Spain becomes a world empire in a single year.',
    fullDesc:
      'In 1492, three seismic events reshaped history simultaneously: the fall of Granada ended 780 years of Islamic rule; Columbus reached the Americas; and the Alhambra Decree expelled the Jewish communities, shattering the Convivencia. Within a generation, Spain controlled a global empire stretching from the Caribbean to the Philippines. The wealth — and the violence — of conquest would fund the Golden Age while accelerating the decimation of indigenous civilisations.',
    tags: ['reconquista', 'exploration', 'empire', 'columbus'],
    subNodes: [
      {
        id: 'fall-of-granada',
        type: 'battle',
        label: 'Fall of Granada',
        year: 1492,
        description:
          'Sultan Boabdil hands the keys of the Alhambra to the Catholic Monarchs on January 2 — the last Muslim kingdom in Iberia falls without a siege.',
        branchSide: 'left',
        figures: [
          {
            id: 'boabdil',
            name: 'Muhammad XII (Boabdil)',
            born: 1460,
            died: 1527,
            role: 'Last Sultan of Granada',
            notableWorks: [],
          },
          {
            id: 'reyes-católicos',
            name: 'Los Reyes Católicos',
            born: 1451,
            died: 1516,
            role: 'Catholic Monarchs — unified Castile & Aragon',
            notableWorks: [
              { title: 'Alhambra Decree (Expulsion of the Jews)', year: 1492, medium: 'other' },
            ],
          },
        ],
      },
      {
        id: 'columbus-voyage',
        type: 'event',
        label: 'Viaje de Colón',
        year: 1492,
        description:
          'Columbus reaches the Bahamas on October 12, 1492. The encounter between worlds sets off a biological, cultural, and demographic exchange that will transform both hemispheres.',
        branchSide: 'right',
        figures: [
          {
            id: 'colon',
            name: 'Cristóbal Colón',
            born: 1451,
            died: 1506,
            role: 'Navigator & Explorer',
            notableWorks: [
              { title: 'Diario de a Bordo', year: 1492, medium: 'other' },
              { title: 'Letter to Luis de Santángel', year: 1493, medium: 'other' },
            ],
          },
        ],
      },
    ],
  },

  // ── 3 ─────────────────────────────────────────────────────────────────────
  {
    id: 'siglo-de-oro',
    year: 1605,
    era: 'Golden Age',
    title: 'Siglo de Oro',
    shortDesc:
      `Cervantes, Velázquez, Lope de Vega — Spain's cultural zenith defines Western art and literature.`,
    fullDesc:
      `Roughly 1550–1680, the Spanish Golden Age produced an extraordinary simultaneous flowering of drama, poetry, painting, and prose. Imperial wealth funded patronage on an unprecedented scale. Cervantes published the first modern novel. Velázquez created the most technically sophisticated paintings of the seventeenth century. Lope de Vega wrote over 400 plays, inventing modern theatrical conventions. Counter-Reformation zeal and imperial anxiety ran as counter-currents beneath the cultural brilliance.`,
    tags: ['literature', 'painting', 'theater', 'baroque', 'empire'],
    subNodes: [
      {
        id: 'don-quijote',
        type: 'event',
        label: 'Don Quijote (1605)',
        year: 1605,
        description:
          'Cervantes publishes the first modern novel — a self-aware, polyphonic meditation on reality, fiction, and idealism that will influence every major novelist after it.',
        branchSide: 'left',
        figures: [
          {
            id: 'cervantes',
            name: 'Miguel de Cervantes',
            born: 1547,
            died: 1616,
            role: 'Novelist & Playwright',
            notableWorks: [
              { title: 'El ingenioso hidalgo Don Quijote (Part I)', year: 1605, medium: 'novel' },
              { title: 'Don Quijote de la Mancha (Part II)', year: 1615, medium: 'novel' },
              { title: 'Novelas ejemplares', year: 1613, medium: 'novel' },
            ],
          },
        ],
      },
      {
        id: 'pintura-barroca',
        type: 'movement',
        label: 'Pintura Barroca',
        year: 1650,
        description:
          'The court of Philip IV becomes the most important artistic patronage network in Europe, producing masterworks that define Western painting.',
        branchSide: 'right',
        figures: [
          {
            id: 'velazquez',
            name: 'Diego Velázquez',
            born: 1599,
            died: 1660,
            role: 'Court Painter to Philip IV',
            notableWorks: [
              { title: 'Las Meninas', year: 1656, medium: 'painting' },
              { title: 'La rendición de Breda', year: 1635, medium: 'painting' },
              { title: 'Las hilanderas', year: 1657, medium: 'painting' },
            ],
          },
          {
            id: 'murillo',
            name: 'Bartolomé Esteban Murillo',
            born: 1617,
            died: 1682,
            role: 'Painter',
            notableWorks: [
              {
                title: 'La Inmaculada Concepción de los Venerables',
                year: 1678,
                medium: 'painting',
              },
            ],
          },
        ],
      },
      {
        id: 'teatro-siglo-de-oro',
        type: 'movement',
        label: 'Teatro del Siglo de Oro',
        year: 1615,
        description:
          'The corrales de comedias host a theatrical revolution. Lope de Vega alone writes over 400 plays, defining the comedia nueva and inventing modern theatrical conventions.',
        branchSide: 'left',
        figures: [
          {
            id: 'lope-de-vega',
            name: 'Lope de Vega',
            born: 1562,
            died: 1635,
            role: 'Playwright & Poet',
            notableWorks: [
              { title: 'Fuente Ovejuna', year: 1619, medium: 'play' },
              { title: 'El caballero de Olmedo', year: 1620, medium: 'play' },
              { title: 'Arte nuevo de hacer comedias', year: 1609, medium: 'other' },
            ],
          },
          {
            id: 'calderon',
            name: 'Pedro Calderón de la Barca',
            born: 1600,
            died: 1681,
            role: 'Playwright',
            notableWorks: [
              { title: 'La vida es sueño', year: 1635, medium: 'play' },
              { title: 'El alcalde de Zalamea', year: 1651, medium: 'play' },
            ],
          },
        ],
      },
    ],
  },

  // ── 4 ─────────────────────────────────────────────────────────────────────
  {
    id: 'guerra-civil',
    year: 1936,
    era: 'Modern',
    title: 'Guerra Civil Española',
    shortDesc:
      'A brutal three-year war divides Spain and mobilises the greatest artists and writers of the century.',
    fullDesc:
      `Franco's Nationalist forces, backed by Nazi Germany and Fascist Italy, fought the elected Republican government supported by the Soviet Union and 35,000 International Brigade volunteers. Between 500,000 and 1,000,000 people died. The war produced some of the most powerful anti-fascist art in history — Picasso's Guernica, Lorca's blood tragedies, Buñuel's exile — and ended with a dictatorship that would last 36 years.`,
    tags: ['war', 'poetry', 'surrealism', 'tragedy', 'exile'],
    subNodes: [
      {
        id: 'generacion-27',
        type: 'movement',
        label: 'Generación del 27',
        year: 1927,
        description:
          'Named after the 1927 Seville tribute to Góngora, this constellation of poets and artists fused European avant-garde with deep Spanish poetic tradition. Many were killed, exiled, or silenced by the war.',
        branchSide: 'left',
        figures: [
          {
            id: 'garcia-lorca',
            name: 'Federico García Lorca',
            born: 1898,
            died: 1936,
            role: 'Poet & Playwright',
            notableWorks: [
              { title: 'Romancero Gitano', year: 1928, medium: 'poem' },
              { title: 'Poeta en Nueva York', year: 1940, medium: 'poem' },
              { title: 'Bodas de Sangre', year: 1933, medium: 'play' },
              { title: 'La Casa de Bernarda Alba', year: 1936, medium: 'play' },
            ],
            connections: ['dali', 'bunuel'],
          },
          {
            id: 'rafael-alberti',
            name: 'Rafael Alberti',
            born: 1902,
            died: 1999,
            role: 'Poet',
            notableWorks: [
              { title: 'Marinero en tierra', year: 1925, medium: 'poem' },
              { title: 'Sobre los ángeles', year: 1929, medium: 'poem' },
            ],
            connections: ['garcia-lorca'],
          },
          {
            id: 'maria-zambrano',
            name: 'María Zambrano',
            born: 1904,
            died: 1991,
            role: 'Philosopher',
            notableWorks: [
              { title: 'Horizonte del liberalismo', year: 1930, medium: 'other' },
              { title: 'Delirio y destino', year: 1952, medium: 'other' },
            ],
          },
        ],
      },
      {
        id: 'surrealismo-espanol',
        type: 'movement',
        label: 'Surrealismo Español',
        year: 1929,
        description:
          `Dalí and Buñuel break into the European avant-garde from Madrid's Residencia de Estudiantes — where they had also befriended García Lorca.`,
        branchSide: 'right',
        figures: [
          {
            id: 'dali',
            name: 'Salvador Dalí',
            born: 1904,
            died: 1989,
            role: 'Painter & Surrealist',
            notableWorks: [
              { title: 'La persistencia de la memoria', year: 1931, medium: 'painting' },
              { title: 'El gran masturbador', year: 1929, medium: 'painting' },
              { title: 'Muchacha en la ventana', year: 1925, medium: 'painting' },
            ],
            connections: ['garcia-lorca', 'bunuel'],
          },
          {
            id: 'bunuel',
            name: 'Luis Buñuel',
            born: 1900,
            died: 1983,
            role: 'Filmmaker',
            notableWorks: [
              { title: 'Un Chien Andalou', year: 1929, medium: 'film' },
              { title: "L'Age d'Or", year: 1930, medium: 'film' },
              { title: 'Viridiana', year: 1961, medium: 'film' },
              { title: 'El discreto encanto de la burguesía', year: 1972, medium: 'film' },
            ],
            connections: ['garcia-lorca', 'dali'],
          },
        ],
      },
      {
        id: 'guernica-bombing',
        type: 'event',
        label: 'Bombardeo de Guernica',
        year: 1937,
        description:
          `Nazi Germany's Condor Legion bombs the Basque market town on April 26, killing hundreds of civilians. Picasso responds in six weeks with his most famous work.`,
        branchSide: 'right',
        figures: [
          {
            id: 'picasso',
            name: 'Pablo Picasso',
            born: 1881,
            died: 1973,
            role: 'Painter & Sculptor',
            notableWorks: [
              { title: 'Guernica', year: 1937, medium: 'painting' },
              { title: "Les Demoiselles d'Avignon", year: 1907, medium: 'painting' },
              { title: 'Weeping Woman', year: 1937, medium: 'painting' },
            ],
          },
        ],
      },
      {
        id: 'brigadas-internacionales',
        type: 'faction',
        label: 'Brigadas Internacionales',
        year: 1936,
        description:
          '35,000 volunteers from 54 countries join the Republican cause. The war attracts the most prominent anti-fascist writers and journalists of the era.',
        branchSide: 'left',
        figures: [
          {
            id: 'orwell',
            name: 'George Orwell',
            born: 1903,
            died: 1950,
            role: 'Writer & POUM Militiaman',
            notableWorks: [
              { title: 'Homage to Catalonia', year: 1938, medium: 'other' },
              { title: '1984', year: 1949, medium: 'novel' },
            ],
          },
        ],
      },
    ],
  },

  // ── 5 ─────────────────────────────────────────────────────────────────────
  {
    id: 'franquismo',
    year: 1939,
    era: 'Contemporary',
    title: 'Franquismo',
    shortDesc:
      'Four decades of dictatorship suppress culture, exile artists, and reshape Spanish identity.',
    fullDesc:
      `Franco's regime (1939–1975) enforced cultural repression, mandatory Castilian, and Catholic orthodoxy. Some 500,000 went into exile — the Exilio Republicano — carrying Spanish culture into a global diaspora centred on Mexico City and Buenos Aires. Yet underground art, regional languages, and flamenco survived as forms of resistance. In the 1960s the technocratic Opus Dei "Miracle" transformed Spain from agrarian poverty into an industrial consumer economy, laying the paradoxical foundations for the democratic transition.`,
    tags: ['dictatorship', 'exile', 'resistance', 'censorship', 'flamenco'],
    subNodes: [
      {
        id: 'exilio-republicano',
        type: 'event',
        label: 'Exilio Republicano',
        year: 1939,
        description:
          'Half a million Republicans flee across the Pyrenees after the fall of Catalonia. Mexican president Lázaro Cárdenas opens the country to them — Mexico City becomes the capital of Republican Spain in exile.',
        branchSide: 'left',
        figures: [
          {
            id: 'alberti-exile',
            name: 'Rafael Alberti (exilio)',
            born: 1902,
            died: 1999,
            role: 'Poet — exiled to Argentina',
            notableWorks: [
              { title: 'Retornos de lo vivo lejano', year: 1952, medium: 'poem' },
              { title: 'Roma, peligro para caminantes', year: 1968, medium: 'poem' },
            ],
          },
          {
            id: 'bunuel-exile',
            name: 'Luis Buñuel (exilio)',
            born: 1900,
            died: 1983,
            role: 'Filmmaker — exiled to Mexico',
            notableWorks: [
              { title: 'Los olvidados', year: 1950, medium: 'film' },
              { title: 'Viridiana', year: 1961, medium: 'film' },
            ],
            connections: ['dali', 'garcia-lorca'],
          },
        ],
      },
      {
        id: 'flamenco-resistencia',
        type: 'movement',
        label: 'Flamenco como Resistencia',
        year: 1955,
        description:
          'Flamenco preserves Andalusian Romani identity under the paradox of simultaneous repression and co-option by the Franco regime for tourism. Its deepest song form — the siguiriya — becomes a coded language of mourning.',
        branchSide: 'right',
        figures: [
          {
            id: 'camaron',
            name: 'Camarón de la Isla',
            born: 1950,
            died: 1992,
            role: 'Cantaor (Flamenco Singer)',
            notableWorks: [
              { title: 'La leyenda del tiempo', year: 1979, medium: 'other' },
              { title: 'Potro de rabia y miel', year: 1992, medium: 'other' },
            ],
            connections: ['paco-de-lucia'],
          },
          {
            id: 'paco-de-lucia',
            name: 'Paco de Lucía',
            born: 1947,
            died: 2014,
            role: 'Flamenco Guitarist',
            notableWorks: [
              { title: 'Entre dos aguas', year: 1973, medium: 'other' },
              { title: 'Sólo quiero caminar', year: 1981, medium: 'other' },
            ],
            connections: ['camaron'],
          },
        ],
      },
    ],
  },

  // ── 6 ─────────────────────────────────────────────────────────────────────
  {
    id: 'transicion-movida',
    year: 1975,
    era: 'Contemporary',
    title: 'Transición y La Movida',
    shortDesc:
      'Franco dies. Spain explodes into democracy — and a decade of radical artistic freedom.',
    fullDesc:
      `Franco's death in November 1975 triggered Spain's extraordinary democratic transition, culminating in the 1978 Constitution. The released energy of 40 years of repression erupted in "La Movida Madrileña" (1977–1992) — a counter-cultural explosion of music, cinema, fashion, and queer visibility centred in Madrid. Pedro Almodóvar emerged from this scene. Spain joined the EEC in 1986 and hosted the Barcelona Olympics in 1992, completing its integration into the modern European order.`,
    tags: ['democracy', 'culture', 'cinema', 'movida', 'music'],
    subNodes: [
      {
        id: 'movida-madrilena',
        type: 'movement',
        label: 'La Movida Madrileña',
        year: 1977,
        description:
          `Madrid's counter-cultural explosion — punk, new wave, underground comics, performance art, and visible queer culture flourish after four decades of repression.`,
        branchSide: 'left',
        figures: [
          {
            id: 'almodovar',
            name: 'Pedro Almodóvar',
            born: 1949,
            role: 'Filmmaker',
            notableWorks: [
              { title: 'Pepi, Luci, Bom', year: 1980, medium: 'film' },
              { title: 'Mujeres al borde de un ataque de nervios', year: 1988, medium: 'film' },
              { title: 'Todo sobre mi madre', year: 1999, medium: 'film' },
              { title: 'Hable con ella', year: 2002, medium: 'film' },
            ],
          },
          {
            id: 'alaska',
            name: 'Alaska (Olvido Gara)',
            born: 1963,
            role: 'Singer & Movida Icon',
            notableWorks: [
              { title: 'Ni tú ni nadie', year: 1984, medium: 'other' },
              { title: 'A quién le importa', year: 1986, medium: 'other' },
            ],
          },
        ],
      },
      {
        id: 'constitucion-1978',
        type: 'event',
        label: 'Constitución de 1978',
        year: 1978,
        description:
          `Spain's democratic constitution — drafted through unprecedented cross-party consensus — is approved by 88% of voters on December 6, establishing a parliamentary monarchy.`,
        branchSide: 'right',
        figures: [
          {
            id: 'adolfo-suarez',
            name: 'Adolfo Suárez',
            born: 1932,
            died: 2014,
            role: 'First Prime Minister of Democratic Spain',
            notableWorks: [
              { title: 'Ley para la Reforma Política', year: 1976, medium: 'other' },
            ],
          },
        ],
      },
      {
        id: 'barcelona-92',
        type: 'event',
        label: 'Barcelona 1992',
        year: 1992,
        description:
          `The Barcelona Olympics — designed by a generation of Catalan architects and designers — announce Spain's arrival as a modern creative nation. Javier Mariscal's mascot Cobi becomes a design landmark.`,
        branchSide: 'left',
        figures: [
          {
            id: 'mariscal',
            name: 'Javier Mariscal',
            born: 1950,
            role: 'Designer & Illustrator',
            notableWorks: [
              { title: 'Cobi (Olympic Mascot)', year: 1986, medium: 'other' },
              { title: 'Duplex Bar, Barcelona', year: 1989, medium: 'architecture' },
            ],
          },
        ],
      },
    ],
  },
]
