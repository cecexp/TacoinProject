// ============================================================
// DATOS DEL JUEGO — migrado de Unity ScriptableObjects a JS
// ============================================================

export const INITIAL_STATE = {
  efectivoNegocio: 500,
  ahorroPersonal: 200,
  carteraCrypto: 0,
  precioBC: 10, // precio inicial de BirriaCoin en pesos
};

export const GAME_CONFIG = {
  accionesFinancierasPorDia: 3,
  diasPorSemana: 6,
  precioMinimo: 0.5,
  precioMaximo: 1000,
  volatilidadMin: -0.12,
  volatilidadMax: 0.18,
  probabilidadNoticia: 0.35,
};

// Noticias del barrio (BarrioNewsEvent ScriptableObjects)
export const NOTICIAS_BARRIO = [
  {
    id: "taqueria_acepta_bc",
    titulo: "🌮 ¡La taquería del güero acepta BirriaCoin!",
    descripcion: "Tres negocios del barrio anunciaron que aceptarán BirriaCoin como pago.",
    cambioPorcentualPrecio: 0.2,
  },
  {
    id: "robo_mercado",
    titulo: "🚨 Asalto en el mercado central",
    descripcion: "La inseguridad hace que la gente prefiera efectivo. BirriaCoin cae.",
    cambioPorcentualPrecio: -0.15,
  },
  {
    id: "influencer_bc",
    titulo: "📱 Influencer local promociona BirriaCoin",
    descripcion: "Un youtuber del barrio habló bien de BirriaCoin en su canal.",
    cambioPorcentualPrecio: 0.3,
  },
  {
    id: "lluvia_ventas",
    titulo: "🌧️ Semana de lluvias — pocas ventas",
    descripcion: "La gente sale menos, BirriaCoin pierde interés temporalmente.",
    cambioPorcentualPrecio: -0.08,
  },
  {
    id: "feria_barrio",
    titulo: "🎉 Feria del barrio este fin de semana",
    descripcion: "El evento atrae turistas. Todo el comercio local sube.",
    cambioPorcentualPrecio: 0.25,
  },
  {
    id: "corrupcion",
    titulo: "😤 Rumores de corrupción en el mercado crypto",
    descripcion: "Desconfianza general. BirriaCoin cae junto con todo el mercado.",
    cambioPorcentualPrecio: -0.2,
  },
  {
    id: "radio_bc",
    titulo: "📻 Radio Norteña menciona BirriaCoin",
    descripcion: "La estación más escuchada del barrio habló del token en el noticiero.",
    cambioPorcentualPrecio: 0.12,
  },
];

// Decisiones diarias (DecisionesDiarias ScriptableObjects)
export const DECISIONES_POR_DIA = {
  1: [
    {
      id: "D1_A",
      titulo: "Reinvertir en más birria 🌮",
      descripcion: "Comprar más insumos para vender el doble mañana.",
      consejo: "Reinvertir en tu negocio es la base del crecimiento. ¡El flujo de caja lo es todo!",
      deltaEfectivo: -150,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: true,
    },
    {
      id: "D1_B",
      titulo: "Guardar todo en el colchón 🛏️",
      descripcion: "Guardar el efectivo en casa 'por si acaso'.",
      consejo: "El dinero parado pierde valor por la inflación. ¡Hazlo trabajar para ti!",
      deltaEfectivo: 0,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: false,
    },
    {
      id: "D1_C",
      titulo: "Mover dinero al ahorro 🏦",
      descripcion: "Separar $100 pesos para emergencias personales.",
      consejo: "Tener un fondo de emergencia es el primer paso de la salud financiera.",
      deltaEfectivo: -100,
      deltaAhorro: 100,
      deltaCrypto: 0,
      esRecomendada: true,
    },
  ],
  2: [
    {
      id: "D2_A",
      titulo: "Comprar BirriaCoin 🪙",
      descripcion: "Invertir $200 pesos en BirriaCoin al precio actual.",
      consejo: "Diversificar tus inversiones reduce el riesgo total. ¡No pongas todos los huevos en una canasta!",
      deltaEfectivo: -200,
      deltaAhorro: 0,
      deltaCrypto: null, // calculado dinámicamente por precio
      esRecomendada: true,
      esCryptoCompra: true,
      montoCryptoCompra: 200,
    },
    {
      id: "D2_B",
      titulo: "Pagar deuda del local 🏪",
      descripcion: "Saldar $180 pesos de renta atrasada.",
      consejo: "Pagar deudas mejora tu historial crediticio y elimina intereses.",
      deltaEfectivo: -180,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: true,
    },
    {
      id: "D2_C",
      titulo: "Gastar en la fiesta del vecino 🎊",
      descripcion: "Aportar $150 pesos para la parrillada del vecino.",
      consejo: "El gasto social está bien ocasionalmente, pero no debe comprometer tu capital de trabajo.",
      deltaEfectivo: -150,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: false,
    },
  ],
  3: [
    {
      id: "D3_A",
      titulo: "Vender BirriaCoin 📈",
      descripcion: "Liquidar 0.5 BC al precio actual del mercado.",
      consejo: "Saber cuándo vender es tan importante como saber cuándo comprar.",
      deltaEfectivo: 0,
      deltaAhorro: 0,
      deltaCrypto: null,
      esRecomendada: true,
      esCryptoVenta: true,
      cantidadVenta: 0.5,
    },
    {
      id: "D3_B",
      titulo: "Ampliar el menú 🥩",
      descripcion: "Invertir $250 en nuevos platillos para atraer más clientes.",
      consejo: "Diversificar tu oferta puede aumentar tus ventas hasta un 40%.",
      deltaEfectivo: -250,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: true,
    },
    {
      id: "D3_C",
      titulo: "Nada, esperar al rato 😴",
      descripcion: "No hacer nada hoy.",
      consejo: "La inacción también tiene un costo: oportunidades perdidas.",
      deltaEfectivo: 0,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: false,
    },
  ],
  4: [
    {
      id: "D4_A",
      titulo: "Contratar a un ayudante 👷",
      descripcion: "Pagar $300 a un familiar para que te ayude este fin de semana.",
      consejo: "Delegar te permite escalar. El tiempo también tiene valor.",
      deltaEfectivo: -300,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: true,
    },
    {
      id: "D4_B",
      titulo: "Mover ahorro a crypto 🚀",
      descripcion: "Mover $150 del ahorro personal a BirriaCoin.",
      consejo: "El ahorro de emergencia no debería invertirse en activos volátiles.",
      deltaEfectivo: 0,
      deltaAhorro: -150,
      deltaCrypto: null,
      esRecomendada: false,
      esCryptoCompraDesdeAhorro: true,
      montoCryptoCompra: 150,
    },
    {
      id: "D4_C",
      titulo: "Publicidad en redes 📣",
      descripcion: "Invertir $100 en anuncios de Facebook para el taco stand.",
      consejo: "El marketing digital puede multiplicar tu visibilidad con inversión mínima.",
      deltaEfectivo: -100,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: true,
    },
  ],
  5: [
    {
      id: "D5_A",
      titulo: "Reinvertir ganancias 🔄",
      descripcion: "Meter $200 más al negocio para el siguiente ciclo.",
      consejo: "El interés compuesto funciona igual en negocios: reinvierte para crecer.",
      deltaEfectivo: -200,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: true,
    },
    {
      id: "D5_B",
      titulo: "Retirar todo 💸",
      descripcion: "Sacar $300 para gastos personales.",
      consejo: "Mezclar finanzas personales y del negocio es una de las causas más comunes de quiebra.",
      deltaEfectivo: -300,
      deltaAhorro: 150,
      deltaCrypto: 0,
      esRecomendada: false,
    },
    {
      id: "D5_C",
      titulo: "Comprar equipo mejor 🔧",
      descripcion: "Invertir $350 en una mejor parrilla.",
      consejo: "Invertir en capital físico aumenta tu capacidad productiva a largo plazo.",
      deltaEfectivo: -350,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: true,
    },
  ],
  6: [
    {
      id: "D6_A",
      titulo: "Día de descanso 😌",
      descripcion: "Cerrar el puesto y descansar.",
      consejo: "El descanso es productivo. Un emprendedor quemado toma malas decisiones.",
      deltaEfectivo: 0,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: true,
    },
    {
      id: "D6_B",
      titulo: "Abrir igual, vender extra 💪",
      descripcion: "Trabajar el día de descanso para sacar $200 extra.",
      consejo: "Maximizar ingresos a corto plazo puede afectar tu salud y sostenibilidad.",
      deltaEfectivo: 200,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: false,
    },
    {
      id: "D6_C",
      titulo: "Ir al tianguis a comprar 🛒",
      descripcion: "Conseguir insumos más baratos, ahorrando $80.",
      consejo: "Reducir costos es tan poderoso como aumentar ingresos.",
      deltaEfectivo: 80,
      deltaAhorro: 0,
      deltaCrypto: 0,
      esRecomendada: true,
    },
  ],
};

// Para días > 6, cicla con variaciones
export const getDecisionesParaDia = (dia) => {
  const diaEnCiclo = ((dia - 1) % 6) + 1;
  return DECISIONES_POR_DIA[diaEnCiclo] || DECISIONES_POR_DIA[1];
};

// ============================================================
// MISIONES DIARIAS
// tipo: 'efectivo_minimo' | 'no_tocar_ahorro' | 'comprar_crypto' |
//       'dia_completo' | 'vender_crypto' | 'ahorro_minimo' | 'libre'
// ============================================================
export const MISIONES_POOL = [
  {
    id: 'M_VENDE_150',
    titulo: 'Día productivo',
    desc: 'Genera al menos $150 de ventas netas hoy.',
    icono: '💪',
    tipo: 'dia_completo',
    recompensa: { tipo: 'efectivo', cantidad: 60 },
    recompensaLabel: '+$60 de bonus',
    consejo: 'Trabajar el día completo es la forma más segura de generar ventas.',
  },
  {
    id: 'M_NO_AHORRO',
    titulo: 'Aguanta sin ahorro',
    desc: 'Completa el día sin mover dinero al ahorro personal.',
    icono: '🔒',
    tipo: 'no_tocar_ahorro',
    recompensa: { tipo: 'efectivo', cantidad: 40 },
    recompensaLabel: '+$40 de bonus',
    consejo: 'A veces mantener el flujo del negocio es más importante que ahorrar.',
  },
  {
    id: 'M_COMPRA_BC',
    titulo: 'Diversifica hoy',
    desc: 'Invierte en BirriaCoin antes de cerrar el puesto.',
    icono: '🪙',
    tipo: 'comprar_crypto',
    recompensa: { tipo: 'crypto', cantidad: 0.5 },
    recompensaLabel: '+0.5 BC gratis',
    consejo: 'Diversificar reduce el riesgo total de tu portafolio.',
  },
  {
    id: 'M_AHORRA_100',
    titulo: 'Fondo de emergencia',
    desc: 'Mueve al menos $100 al ahorro personal hoy.',
    icono: '🏦',
    tipo: 'ahorro_minimo',
    meta: 100,
    recompensa: { tipo: 'efectivo', cantidad: 30 },
    recompensaLabel: '+$30 de bonus',
    consejo: 'El fondo de emergencia es el primer paso de la salud financiera.',
  },
  {
    id: 'M_VENDE_BC',
    titulo: 'Liquida con ganancia',
    desc: 'Vende BirriaCoin si tienes en cartera.',
    icono: '📈',
    tipo: 'vender_crypto',
    recompensa: { tipo: 'efectivo', cantidad: 50 },
    recompensaLabel: '+$50 de bonus',
    consejo: 'Saber cuándo salir de una inversión es tan importante como entrar.',
  },
  {
    id: 'M_DIA_LIBRE',
    titulo: 'Día de estrategia',
    desc: 'Toma decisiones libremente — hoy no hay restricciones.',
    icono: '🌮',
    tipo: 'libre',
    recompensa: { tipo: 'efectivo', cantidad: 20 },
    recompensaLabel: '+$20 por jugar',
    consejo: 'La libertad financiera viene de conocer tus opciones.',
  },
  {
    id: 'M_COMPLETO_AHORRAR',
    titulo: 'Trabaja y ahorra',
    desc: 'Completa el día Y mueve algo al ahorro.',
    icono: '⚡',
    tipo: 'dia_completo_y_ahorro',
    recompensa: { tipo: 'efectivo', cantidad: 80 },
    recompensaLabel: '+$80 de bonus',
    consejo: 'La combinación de trabajo + ahorro es la fórmula del crecimiento sostenido.',
  },
];

export const getMisionParaDia = (diaGlobal) => {
  const idx = (diaGlobal - 1) % MISIONES_POOL.length;
  return MISIONES_POOL[idx];
};

// ============================================================
// EVENTOS SORPRESA
// impacto: multiplicador de ventas ese día
// ============================================================
export const EVENTOS_SORPRESA = [
  {
    id: 'inspector',
    titulo: '🕵️ ¡Inspector de sanidad!',
    desc: 'Un inspector llegó al puesto. Pasaste la revisión, pero tuviste que pagar una "mordida".',
    impactoEfectivo: -80,
    impactoVentas: 1.0,
    icono: '🕵️',
    tipo: 'malo',
    donJoseFrase: '"Todos los años lo mismo con este señor... Ay, México lindo."',
    leccionFinanciera: 'Siempre ten un fondo para imprevistos — los gastos inesperados son parte del negocio.',
  },
  {
    id: 'influencer_visita',
    titulo: '⭐ ¡Un influencer probó tu birria!',
    desc: 'Un youtuber con 50k seguidores publicó tu puesto. Las ventas se dispararon.',
    impactoEfectivo: 0,
    impactoVentas: 1.8,
    icono: '⭐',
    tipo: 'bueno',
    donJoseFrase: '"¿Y eso del youtuber? Mi abuela vendía igual de bien sin internet, joven."',
    leccionFinanciera: 'El marketing boca a boca es el más poderoso — y el más barato.',
  },
  {
    id: 'lluvia_torrencial',
    titulo: '🌧️ Lluvia torrencial',
    desc: 'Nadie sale a comprar tacos con este aguacero. Ventas muy bajas.',
    impactoEfectivo: 0,
    impactoVentas: 0.4,
    icono: '🌧️',
    tipo: 'malo',
    donJoseFrase: '"La lluvia es agua de Dios, mijo. Pero también es un problema pa\' los tacos."',
    leccionFinanciera: 'Los negocios físicos dependen del entorno. Diversificar ingresos protege de esto.',
  },
  {
    id: 'cliente_vip',
    titulo: '👔 ¡Cliente corporativo!',
    desc: 'Una empresa del centro pidió 50 tacos para su desayuno de trabajo.',
    impactoEfectivo: 200,
    impactoVentas: 1.0,
    icono: '👔',
    tipo: 'bueno',
    donJoseFrase: '"¡Cincuenta tacos! Nunca pensé que mi birria llegaría a las oficinas."',
    leccionFinanciera: 'Los clientes B2B pueden cambiar tu negocio. Un solo contrato puede valer más que 100 clientes individuales.',
  },
  {
    id: 'gas_agotado',
    titulo: '💨 ¡Se acabó el gas!',
    desc: 'Tuviste que cerrar temprano para ir por una nueva pipa. Sin penalización hoy.',
    impactoEfectivo: -30,
    impactoVentas: 0.5,
    icono: '💨',
    tipo: 'neutro',
    donJoseFrase: '"El gas, el aceite, los chiles... esto de tener negocio nunca acaba."',
    leccionFinanciera: 'El control de inventario evita paros operativos. Anticipa antes de que se acabe.',
  },
  {
    id: 'vecino_ayuda',
    titulo: '🤝 Tu vecino te echa la mano',
    desc: 'El vecino taquero cubrió tu puesto mientras descansabas. Ganaste sin trabajar.',
    impactoEfectivo: 80,
    impactoVentas: 1.0,
    icono: '🤝',
    tipo: 'bueno',
    donJoseFrase: '"El barrio cuida al barrio. Eso no tiene precio, mijo."',
    leccionFinanciera: 'Las redes de apoyo son un activo intangible. Invierte en tus relaciones.',
  },
  {
    id: 'competidor_nuevo',
    titulo: '😤 ¡Abrió otro puesto de tacos!',
    desc: 'Un competidor nuevo se instaló a media cuadra. Te robó algunos clientes hoy.',
    impactoEfectivo: 0,
    impactoVentas: 0.7,
    icono: '😤',
    tipo: 'malo',
    donJoseFrase: '"Que haya competencia está bien. Nos obliga a mejorar. Aunque duele."',
    leccionFinanciera: 'La competencia es parte del mercado libre. La diferenciación — tu sazón único — es tu ventaja.',
  },
  {
    id: 'luz_gratis',
    titulo: '⚡ Día sin costos de luz',
    desc: 'El gobierno dio un subsidio de energía hoy. Ahorras en operación.',
    impactoEfectivo: 35,
    impactoVentas: 1.0,
    icono: '⚡',
    tipo: 'bueno',
    donJoseFrase: '"¡Bendito el gobierno cuando sí ayuda! Aunque no pasa seguido."',
    leccionFinanciera: 'Los subsidios y apoyos gubernamentales son parte del entorno económico de un negocio.',
  },
];

export const getEventoAleatorio = () => {
  const probabilidad = 0.35; // 35% de chance cada día
  if (Math.random() > probabilidad) return null;
  return EVENTOS_SORPRESA[Math.floor(Math.random() * EVENTOS_SORPRESA.length)];
};

// ============================================================
// DIÁLOGOS DE DON JOSÉ
// Se disparan según contexto
// ============================================================
export const DIALOGOS_DON_JOSE = {
  // Al tomar decisiones recomendadas
  decision_buena: [
    'Eso es lo que aprendí tarde yo... tú vas bien, mijo.',
    '¡Así mero! Mi abuela decía: "El que sabe gastar, sabe ganar".',
    'Treinta años de contador me enseñaron eso exacto.',
    '¡Órale! El negocio que piensa, el negocio que crece.',
    'Decisión de empresario, no de asalariado. Así se hace.',
  ],
  // Al tomar decisiones no recomendadas
  decision_mala: [
    'Ay mijo... en la textilera nunca perdíamos así. Hay que aprender.',
    'Mi abuela decía: "El dinero fácil se va fácil". Cuidado.',
    'Eso lo hice yo una vez. Una sola vez. Ya sé por qué.',
    'Hmm... a veces el camino más corto es el más caro.',
    'No te me desanimes. Cada error es una lección de finanzas gratis.',
  ],
  // Cuando BC sube mucho (+20% o más)
  crypto_sube: [
    '¿Monedas digitales? En la textilera solo había pesos y el reloj chocador.',
    '¡Virgen santísima! ¿Cómo sube así una moneda que no existe?',
    'Treinta años de contador y nunca vi esto. El mundo cambió, mijo.',
    '¡Ese BirriaCoin! Si mi abuela supiera...',
  ],
  // Cuando BC baja mucho (-20% o más)
  crypto_baja: [
    'Ya ven, mijo. Por eso yo prefería los bonos del gobierno.',
    'Esto del crypto es como la ruleta, pero más rápido.',
    'Diversifica, te digo. No pongas todos los chiles en una cazuela.',
    'Ay, el mercado... impredecible como el tiempo en Jalisco.',
  ],
  // Al cerrar temprano
  cierre_temprano: [
    'El que madruga, Dios lo ayuda. El que cierra temprano... paga costos igual.',
    'Mijo, el puesto solo gana cuando está abierto.',
    'Treinta años llegando primero a la oficina. Eso me lo enseñó la vida.',
    'Hmm... hoy no fue nuestro día completo. Mañana más.',
  ],
  // Al completar el día
  dia_completo: [
    '¡Eso es! Día completo, cuenta alegre.',
    'Así como en la textilera: primero en llegar, último en irse.',
    'Buen día de trabajo, mijo. El negocio lo nota.',
    '¡Órale! Hoy Don José estuvo a la altura.',
  ],
  // Al lograr la misión
  mision_cumplida: [
    '¡Mira qué bien! Misión cumplida. Mi abuela estaría orgullosa.',
    '¡Eso es disciplina financiera! Treinta años de contador lo confirman.',
    '¡Órale! Cuando uno se propone algo, lo logra. Así es.',
    '¡Bien hecho! En el negocio, los objetivos son la brújula.',
  ],
  // Al fallar la misión
  mision_fallida: [
    'No hay pena, mijo. Mañana es otro día y otra misión.',
    'La meta se fue hoy, pero la lección se quedó.',
    'En finanzas, el que no falla nunca, nunca jugó.',
    'Ay... pero ya sabemos dónde mejorar. Eso vale.',
  ],
  // Saludo del día
  saludo_manana: [
    '¡Buenos días! El consomé ya está listo. ¿Qué decisiones tomamos hoy?',
    'Amanecimos con $$ en la bolsa. ¡A trabajarlos!',
    '¡Arriba! El barrio nos espera. ¿Qué hacemos hoy, mijo?',
    'Nuevo día, nuevas oportunidades. Así decía mi jefe en la textilera.',
    '¡Ánimo! La birria más rica del barrio no se vende sola.',
  ],
  // Si patrimonio es muy bajo
  alerta_dinero: [
    'Mijo... esto se está poniendo serio. Hay que cuidar el centavo.',
    'Cuando era contador, una caja chica baja era señal de problemas. Cuidado.',
    'No hay que alarmarse, pero sí hay que actuar. ¿Qué vendemos hoy?',
  ],
};

export const getDonJoseFrase = (contexto) => {
  const frases = DIALOGOS_DON_JOSE[contexto];
  if (!frases || frases.length === 0) return null;
  return frases[Math.floor(Math.random() * frases.length)];
};

// ============================================================
// SISTEMA XP Y NIVELES
// ============================================================
export const NIVELES_XP = [
  { nivel: 1, titulo: 'Aprendiz Taquero',   emoji: '🌱', xpRequerido: 0,    color: '#8c7c6e' },
  { nivel: 2, titulo: 'Taquero del Barrio', emoji: '🌮', xpRequerido: 100,  color: '#4a9e4a' },
  { nivel: 3, titulo: 'Empresario Local',   emoji: '💼', xpRequerido: 250,  color: '#1a6fb5' },
  { nivel: 4, titulo: 'Inversor Cripto',    emoji: '🪙', xpRequerido: 500,  color: '#b5820a' },
  { nivel: 5, titulo: 'Don José Famoso',    emoji: '🏆', xpRequerido: 1000, color: '#8b1a1a' },
];

export const XP_POR_ACCION = {
  decision_recomendada:     20,
  decision_no_recomendada:  5,
  dia_completo_bonus:       15,
  mision_cumplida_bonus:    30,
  logro_desbloqueado:       25,
};

export const getNivelActual = (xpTotal) => {
  let nivelActual = NIVELES_XP[0];
  for (const n of NIVELES_XP) {
    if (xpTotal >= n.xpRequerido) nivelActual = n;
    else break;
  }
  const idx = NIVELES_XP.indexOf(nivelActual);
  const siguiente = NIVELES_XP[idx + 1] || null;
  const xpEnNivel = xpTotal - nivelActual.xpRequerido;
  const xpParaSiguiente = siguiente ? siguiente.xpRequerido - nivelActual.xpRequerido : 999;
  const progreso = siguiente ? xpEnNivel / xpParaSiguiente : 1;
  return { ...nivelActual, siguiente, xpEnNivel, xpParaSiguiente, progreso };
};

// ============================================================
// CONCEPTOS FINANCIEROS — educación integrada
// ============================================================
export const CONCEPTOS_FINANCIEROS = {
  'reinversion':         { termino: 'Reinversión',          def: 'Usar las ganancias del negocio para hacerlo crecer en lugar de gastarlas.' },
  'flujo_caja':          { termino: 'Flujo de Caja',        def: 'El dinero que entra y sale de tu negocio. Si sale más de lo que entra, hay problema.' },
  'fondo_emergencia':    { termino: 'Fondo de Emergencia',  def: 'Dinero guardado para imprevistos. Lo ideal: 3-6 meses de gastos básicos.' },
  'diversificacion':     { termino: 'Diversificación',      def: 'No poner todos los recursos en una sola inversión. Reduce el riesgo total.' },
  'costo_oportunidad':   { termino: 'Costo de Oportunidad', def: 'Lo que pierdes al elegir una opción en vez de otra. Cerrar antes = ventas perdidas.' },
  'volatilidad':         { termino: 'Volatilidad',          def: 'Qué tan rápido y fuerte cambia el precio de algo. El crypto es muy volátil.' },
  'liquidez':            { termino: 'Liquidez',             def: 'Qué tan fácil puedes convertir un activo en efectivo sin perder valor.' },
  'capital_trabajo':     { termino: 'Capital de Trabajo',   def: 'El dinero disponible para operar el negocio día a día. Sin él, no hay operación.' },
  'riesgo_rendimiento':  { termino: 'Riesgo vs Rendimiento',def: 'A mayor ganancia potencial, mayor riesgo. El crypto da más, pero puede perderse todo.' },
  'patrimonio':          { termino: 'Patrimonio Neto',      def: 'Todo lo que tienes (efectivo + ahorro + inversiones). Es tu riqueza total.' },
  'costos_fijos':        { termino: 'Costos Fijos',         def: 'Gastos que pagas aunque no trabajes: renta, servicios, etc.' },
  'ingresos_variables':  { termino: 'Ingresos Variables',   def: 'Lo que ganas depende de cuánto trabajas y vendes. Sin trabajo, sin ingreso.' },
};

// Qué concepto enseña cada decisión
export const CONCEPTO_POR_DECISION = {
  'D1_A': 'reinversion',
  'D1_B': 'costo_oportunidad',
  'D1_C': 'fondo_emergencia',
  'D2_A': 'diversificacion',
  'D2_B': 'liquidez',
  'D2_C': 'costo_oportunidad',
  'D3_A': 'riesgo_rendimiento',
  'D3_B': 'capital_trabajo',
  'D3_C': 'costo_oportunidad',
  'D4_A': 'capital_trabajo',
  'D4_B': 'volatilidad',
  'D4_C': 'flujo_caja',
  'D5_A': 'reinversion',
  'D5_B': 'flujo_caja',
  'D5_C': 'capital_trabajo',
  'D6_A': 'costos_fijos',
  'D6_B': 'ingresos_variables',
  'D6_C': 'flujo_caja',
};

export const getConceptoDelDia = (historialDelDia) => {
  if (!historialDelDia || historialDelDia.length === 0) return null;
  for (const h of historialDelDia) {
    const conceptoId = CONCEPTO_POR_DECISION[h.decision?.id];
    if (conceptoId && CONCEPTOS_FINANCIEROS[conceptoId]) {
      return { id: conceptoId, ...CONCEPTOS_FINANCIEROS[conceptoId] };
    }
  }
  return null;
};
