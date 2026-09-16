import { type TimelineEvent } from './types'

export const SPAIN_HISTORY: TimelineEvent[] = [
  // ── 1 ─────────────────────────────────────────────────────────────────────
  {
    id: 'al-andalus',
    year: 711,
    era: 'Alta Edad Media',
    title: 'Al-Ándalus',
    shortDesc:
      'La conquista omeya da inicio a 800 años de civilización islámica en la península ibérica.',
    fullDesc:
      `La invasión omeya de 711 transformó Iberia en Al-Ándalus: en su apogeo, la civilización más sofisticada al oeste de Constantinopla. La biblioteca de Córdoba albergaba 400.000 volúmenes cuando París apenas contaba con una docena de monasterios. El periodo de la Convivencia vio a cristianos, judíos y musulmanes intercambiar filosofía, medicina y poesía en una síntesis cultural sin precedentes que forjó el Renacimiento europeo.`,
    tags: ['islam', 'medieval', 'convivencia', 'arquitectura'],
    subNodes: [
      {
        id: 'caliphate-cordoba',
        type: 'event',
        label: 'Califato de Córdoba',
        year: 929,
        description:
          'Abd al-Rahman III proclama el Califato, convirtiendo Córdoba en la ciudad más grande de Europa occidental y su principal centro intelectual.',
        branchSide: 'right',
        figures: [
          {
            id: 'averroes',
            name: 'Ibn Rushd (Averroes)',
            born: 1126,
            died: 1198,
            role: 'Filósofo y médico',
            notableWorks: [
              { title: 'Comentarios a Aristóteles', year: 1169, medium: 'other' },
              { title: 'Tahāfut al-Tahāfut', year: 1180, medium: 'other' },
            ],
            connections: ['maimonides'],
          },
          {
            id: 'maimonides',
            name: 'Maimónides',
            born: 1135,
            died: 1204,
            role: 'Filósofo y médico judío',
            notableWorks: [
              { title: 'Mishneh Torah', year: 1180, medium: 'other' },
              { title: 'Guía de los perplejos', year: 1190, medium: 'other' },
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
          'Se inicia la construcción de la Gran Mezquita — un bosque de 856 columnas de mármol y arcos bicolores en rojo y blanco, convertida siglos después en catedral.',
        branchSide: 'left',
        figures: [
          {
            id: 'abd-al-rahman-i',
            name: 'Abd al-Rahman I',
            born: 731,
            died: 788,
            role: 'Fundador del Emirato de Córdoba',
            notableWorks: [
              { title: 'Gran Mezquita de Córdoba (primera fase)', year: 785, medium: 'architecture' },
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
    era: 'Baja Edad Media · Edad Moderna',
    title: 'Reconquista y Nuevo Mundo',
    shortDesc:
      'Cae Granada, zarpa Colón — España se convierte en un imperio mundial en un solo año.',
    fullDesc:
      'En 1492 tuvieron lugar tres sucesos que transformaron simultáneamente la historia: la caída de Granada puso fin a 780 años de dominio islámico; Colón llegó a América; y el Decreto de la Alhambra expulsó a las comunidades judías, quebrando la Convivencia. En una generación, España controlaba un imperio global que se extendía desde el Caribe hasta las Filipinas. La riqueza — y la violencia — de la conquista financiaría el Siglo de Oro, a la vez que aceleraba la devastación de las civilizaciones indígenas.',
    tags: ['reconquista', 'exploración', 'imperio', 'colón'],
    subNodes: [
      {
        id: 'fall-of-granada',
        type: 'battle',
        label: 'Caída de Granada',
        year: 1492,
        description:
          'El sultán Boabdil entrega las llaves de la Alhambra a los Reyes Católicos el 2 de enero — el último reino musulmán de la Península cae sin necesidad de asedio.',
        branchSide: 'left',
        figures: [
          {
            id: 'boabdil',
            name: 'Muhammad XII (Boabdil)',
            born: 1460,
            died: 1527,
            role: 'Último sultán de Granada',
            notableWorks: [],
          },
          {
            id: 'reyes-católicos',
            name: 'Los Reyes Católicos',
            born: 1451,
            died: 1516,
            role: 'Monarcas que unificaron Castilla y Aragón',
            notableWorks: [
              { title: 'Decreto de la Alhambra (expulsión de los judíos)', year: 1492, medium: 'other' },
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
          'Colón llega a las Bahamas el 12 de octubre de 1492. El encuentro entre dos mundos desencadena un intercambio biológico, cultural y demográfico que transformará ambos hemisferios.',
        branchSide: 'right',
        figures: [
          {
            id: 'colon',
            name: 'Cristóbal Colón',
            born: 1451,
            died: 1506,
            role: 'Navegante y explorador',
            notableWorks: [
              { title: 'Diario de a Bordo', year: 1492, medium: 'other' },
              { title: 'Carta a Luis de Santángel', year: 1493, medium: 'other' },
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
    era: 'Siglo de Oro',
    title: 'Siglo de Oro',
    shortDesc:
      'Cervantes, Velázquez, Lope de Vega — el cénit cultural de España define el arte y la literatura de Occidente.',
    fullDesc:
      `Entre 1550 y 1680 aproximadamente, el Siglo de Oro español produjo un extraordinario florecimiento simultáneo del teatro, la poesía, la pintura y la prosa. La riqueza imperial financió el mecenazgo a una escala sin precedentes. Cervantes publicó la primera novela moderna. Velázquez creó las pinturas técnicamente más sofisticadas del siglo XVII. Lope de Vega escribió más de 400 obras de teatro, inventando las convenciones del teatro moderno. El fervor contrarreformista y la ansiedad imperial corrían como contracorrientes bajo el esplendor cultural.`,
    tags: ['literatura', 'pintura', 'teatro', 'barroco', 'imperio'],
    subNodes: [
      {
        id: 'don-quijote',
        type: 'event',
        label: 'Don Quijote (1605)',
        year: 1605,
        description:
          'Cervantes publica la primera novela moderna — una meditación autoconsciente y polifónica sobre la realidad, la ficción y el idealismo que influirá en todos los grandes novelistas posteriores.',
        branchSide: 'left',
        figures: [
          {
            id: 'cervantes',
            name: 'Miguel de Cervantes',
            born: 1547,
            died: 1616,
            role: 'Novelista y dramaturgo',
            notableWorks: [
              { title: 'El ingenioso hidalgo Don Quijote (Primera parte)', year: 1605, medium: 'novel' },
              { title: 'Don Quijote de la Mancha (Segunda parte)', year: 1615, medium: 'novel' },
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
          'La corte de Felipe IV se convierte en la red de mecenazgo artístico más importante de Europa, produciendo obras maestras que definen la pintura occidental.',
        branchSide: 'right',
        figures: [
          {
            id: 'velazquez',
            name: 'Diego Velázquez',
            born: 1599,
            died: 1660,
            role: 'Pintor de cámara de Felipe IV',
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
            role: 'Pintor',
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
          'Los corrales de comedias acogen una revolución teatral. Lope de Vega escribe más de 400 obras, definiendo la comedia nueva e inventando las convenciones del teatro moderno.',
        branchSide: 'left',
        figures: [
          {
            id: 'lope-de-vega',
            name: 'Lope de Vega',
            born: 1562,
            died: 1635,
            role: 'Dramaturgo y poeta',
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
            role: 'Dramaturgo',
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
    era: 'Edad Contemporánea',
    title: 'Guerra Civil Española',
    shortDesc:
      'Una brutal guerra de tres años divide España y moviliza a los más grandes artistas y escritores del siglo.',
    fullDesc:
      `Las fuerzas nacionales de Franco, respaldadas por la Alemania nazi y la Italia fascista, combatieron al Gobierno republicano legítimamente elegido, apoyado por la Unión Soviética y 35.000 voluntarios de las Brigadas Internacionales. Entre 500.000 y 1.000.000 de personas perdieron la vida. La guerra produjo algunas de las obras antifascistas más poderosas de la historia — el Guernica de Picasso, las tragedias de Lorca, el exilio de Buñuel — y concluyó con una dictadura que duraría 36 años.`,
    tags: ['guerra', 'poesía', 'surrealismo', 'tragedia', 'exilio'],
    subNodes: [
      {
        id: 'generacion-27',
        type: 'movement',
        label: 'Generación del 27',
        year: 1927,
        description:
          'Bautizada con el nombre del homenaje a Góngora celebrado en Sevilla en 1927, esta constelación de poetas y artistas fusionó las vanguardias europeas con la profunda tradición poética española. Muchos fueron asesinados, exiliados o silenciados por la guerra.',
        branchSide: 'left',
        figures: [
          {
            id: 'garcia-lorca',
            name: 'Federico García Lorca',
            born: 1898,
            died: 1936,
            role: 'Poeta y dramaturgo',
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
            role: 'Poeta',
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
            role: 'Filósofa',
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
          `Dalí y Buñuel irrumpen en la vanguardia europea desde la Residencia de Estudiantes de Madrid, donde también habían trabado amistad con García Lorca.`,
        branchSide: 'right',
        figures: [
          {
            id: 'dali',
            name: 'Salvador Dalí',
            born: 1904,
            died: 1989,
            role: 'Pintor y surrealista',
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
            role: 'Cineasta',
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
          `La Legión Cóndor de la Alemania nazi bombardea la localidad vasca el 26 de abril, causando cientos de víctimas civiles. Picasso responde en seis semanas con su obra más célebre.`,
        branchSide: 'right',
        figures: [
          {
            id: 'picasso',
            name: 'Pablo Picasso',
            born: 1881,
            died: 1973,
            role: 'Pintor y escultor',
            notableWorks: [
              { title: 'Guernica', year: 1937, medium: 'painting' },
              { title: "Les Demoiselles d'Avignon", year: 1907, medium: 'painting' },
              { title: 'La mujer que llora', year: 1937, medium: 'painting' },
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
          '35.000 voluntarios de 54 países se unen a la causa republicana. La guerra atrae a los escritores y periodistas antifascistas más destacados de la época.',
        branchSide: 'left',
        figures: [
          {
            id: 'orwell',
            name: 'George Orwell',
            born: 1903,
            died: 1950,
            role: 'Escritor y miliciano del POUM',
            notableWorks: [
              { title: 'Homenaje a Cataluña', year: 1938, medium: 'other' },
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
    era: 'Época Contemporánea',
    title: 'Franquismo',
    shortDesc:
      'Cuatro décadas de dictadura suprimen la cultura, exilian a los artistas y reconfiguran la identidad española.',
    fullDesc:
      `El régimen de Franco (1939–1975) impuso la represión cultural, el castellano como única lengua oficial y la ortodoxia católica. Alrededor de 500.000 personas marcharon al exilio — el Exilio Republicano — llevando la cultura española a una diáspora global centrada en Ciudad de México y Buenos Aires. Sin embargo, el arte clandestino, las lenguas regionales y el flamenco sobrevivieron como formas de resistencia. En los años sesenta, el «Milagro» tecnocrático del Opus Dei transformó España de una economía agraria empobrecida en una sociedad industrial de consumo, sentando las paradójicas bases de la transición democrática.`,
    tags: ['dictadura', 'exilio', 'resistencia', 'censura', 'flamenco'],
    subNodes: [
      {
        id: 'exilio-republicano',
        type: 'event',
        label: 'Exilio Republicano',
        year: 1939,
        description:
          'Medio millón de republicanos huyen a través de los Pirineos tras la caída de Cataluña. El presidente mexicano Lázaro Cárdenas les abre el país — Ciudad de México se convierte en la capital de la España republicana en el exilio.',
        branchSide: 'left',
        figures: [
          {
            id: 'alberti-exile',
            name: 'Rafael Alberti (exilio)',
            born: 1902,
            died: 1999,
            role: 'Poeta — exiliado en Argentina',
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
            role: 'Cineasta — exiliado en México',
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
          'El flamenco preserva la identidad gitana andaluza bajo la paradoja de la represión y la cooptación simultáneas por parte del régimen franquista con fines turísticos. Su forma de cante más profunda — la siguiriya — se convierte en un lenguaje codificado del duelo.',
        branchSide: 'right',
        figures: [
          {
            id: 'camaron',
            name: 'Camarón de la Isla',
            born: 1950,
            died: 1992,
            role: 'Cantaor flamenco',
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
            role: 'Guitarrista flamenco',
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
    era: 'Época Contemporánea',
    title: 'Transición y La Movida',
    shortDesc:
      'Muere Franco. España estalla en democracia — y una década de radical libertad artística.',
    fullDesc:
      `La muerte de Franco en noviembre de 1975 desencadenó la extraordinaria transición democrática española, que culminó con la Constitución de 1978. La energía reprimida durante 40 años de dictadura estalló en «La Movida Madrileña» (1977–1992) — una explosión contracultural de música, cine, moda y visibilidad queer centrada en Madrid. Pedro Almodóvar emergió de esta escena. España ingresó en la CEE en 1986 y acogió los Juegos Olímpicos de Barcelona en 1992, completando su integración en el orden europeo moderno.`,
    tags: ['democracia', 'cultura', 'cine', 'movida', 'música'],
    subNodes: [
      {
        id: 'movida-madrilena',
        type: 'movement',
        label: 'La Movida Madrileña',
        year: 1977,
        description:
          `La explosión contracultural de Madrid — punk, nueva ola, cómics underground, performance art y cultura queer visible florecen tras cuatro décadas de represión.`,
        branchSide: 'left',
        figures: [
          {
            id: 'almodovar',
            name: 'Pedro Almodóvar',
            born: 1949,
            role: 'Cineasta',
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
            role: 'Cantante e icono de La Movida',
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
          `La Constitución democrática española — redactada mediante un consenso entre fuerzas políticas sin precedentes — es aprobada por el 88 % de los votantes el 6 de diciembre, instaurando una monarquía parlamentaria.`,
        branchSide: 'right',
        figures: [
          {
            id: 'adolfo-suarez',
            name: 'Adolfo Suárez',
            born: 1932,
            died: 2014,
            role: 'Primer Presidente del Gobierno de la España democrática',
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
          `Los Juegos Olímpicos de Barcelona — diseñados por una generación de arquitectos y diseñadores catalanes — proclaman la llegada de España como nación creativa moderna. La mascota Cobi, de Javier Mariscal, se convierte en un hito del diseño.`,
        branchSide: 'left',
        figures: [
          {
            id: 'mariscal',
            name: 'Javier Mariscal',
            born: 1950,
            role: 'Diseñador e ilustrador',
            notableWorks: [
              { title: 'Cobi (Mascota Olímpica)', year: 1986, medium: 'other' },
              { title: 'Duplex Bar, Barcelona', year: 1989, medium: 'architecture' },
            ],
          },
        ],
      },
    ],
  },
]
