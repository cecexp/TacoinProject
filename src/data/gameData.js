// ============================================================
// DATOS DEL JUEGO — Sistema Roguelike
// Mantiene TODO el diseño original + agrega probabilidades,
// generación dinámica de decisiones y análisis contrafactual
// ============================================================

export const INITIAL_STATE = {
  efectivoNegocio: 500,
  ahorroPersonal: 200,
  carteraCrypto: 0,
  precioBC: 10,
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

// ============================================================
// BANCO DE DECISIONES ROGUELIKE
// ============================================================
export const BANCO_DECISIONES = [
  // ── NEGOCIO ──────────────────────────────────────────────
  {
    id: 'reinvertir_insumos',
    titulo: 'Reinvertir en más birria 🌮',
    descripcion: 'Comprar más insumos para vender el doble mañana.',
    consejo: 'Reinvertir en tu negocio es la base del crecimiento. ¡El flujo de caja lo es todo!',
    categoria: 'negocio',
    probabilidadExito: 0.75,
    costoEjecutar: 150,
    efectoExito:   { deltaEfectivo: -150, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: 0.35, label: 'Ventas +35% mañana' },
    efectoFracaso: { deltaEfectivo: -150, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: -0.10, label: 'Los insumos se echaron a perder' },
    esRecomendada: true,
    conceptoFinanciero: 'reinversion',
  },
  {
    id: 'ampliar_menu',
    titulo: 'Ampliar el menú 🥩',
    descripcion: 'Invertir $250 en nuevos platillos para atraer más clientes.',
    consejo: 'Diversificar tu oferta puede aumentar tus ventas hasta un 40%.',
    categoria: 'negocio',
    probabilidadExito: 0.60,
    costoEjecutar: 250,
    efectoExito:   { deltaEfectivo: -250, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: 0.40, label: 'Clientes nuevos llegaron' },
    efectoFracaso: { deltaEfectivo: -250, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: 0.05, label: 'El platillo no gustó mucho' },
    esRecomendada: true,
    conceptoFinanciero: 'capital_trabajo',
  },
  {
    id: 'contratar_ayudante',
    titulo: 'Contratar a un ayudante 👷',
    descripcion: 'Pagar $300 a un familiar para que te ayude este fin de semana.',
    consejo: 'Delegar te permite escalar. El tiempo también tiene valor.',
    categoria: 'negocio',
    probabilidadExito: 0.65,
    costoEjecutar: 300,
    efectoExito:   { deltaEfectivo: -300, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: 0.50, label: 'Servicio más rápido, más clientes' },
    efectoFracaso: { deltaEfectivo: -300, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: 0.05, label: 'El ayudante llegó tarde' },
    esRecomendada: true,
    conceptoFinanciero: 'capital_trabajo',
  },
  {
    id: 'publicidad_redes',
    titulo: 'Publicidad en redes 📣',
    descripcion: 'Invertir $100 en anuncios de Facebook para el taco stand.',
    consejo: 'El marketing digital puede multiplicar tu visibilidad con inversión mínima.',
    categoria: 'negocio',
    probabilidadExito: 0.55,
    costoEjecutar: 100,
    efectoExito:   { deltaEfectivo: -100, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: 0.60, label: '¡Viral en el barrio!' },
    efectoFracaso: { deltaEfectivo: -100, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: -0.05, label: 'Pocos vieron el anuncio' },
    esRecomendada: true,
    conceptoFinanciero: 'flujo_caja',
  },
  {
    id: 'equipo_mejor',
    titulo: 'Comprar equipo mejor 🔧',
    descripcion: 'Invertir $350 en una mejor parrilla.',
    consejo: 'Invertir en capital físico aumenta tu capacidad productiva a largo plazo.',
    categoria: 'negocio',
    probabilidadExito: 0.80,
    costoEjecutar: 350,
    efectoExito:   { deltaEfectivo: -350, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: 0.25, label: 'Cocinas más rápido y mejor' },
    efectoFracaso: { deltaEfectivo: -350, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: 0.05, label: 'La parrilla tiene fallas' },
    esRecomendada: true,
    conceptoFinanciero: 'capital_trabajo',
  },
  {
    id: 'tianguis_insumos',
    titulo: 'Ir al tianguis a comprar 🛒',
    descripcion: 'Conseguir insumos más baratos, ahorrando hasta $80.',
    consejo: 'Reducir costos es tan poderoso como aumentar ingresos.',
    categoria: 'negocio',
    probabilidadExito: 0.70,
    costoEjecutar: 0,
    efectoExito:   { deltaEfectivo: 80, deltaAhorro: 0, deltaCrypto: 0, label: '¡Ahorro de $80 en insumos!' },
    efectoFracaso: { deltaEfectivo: -20, deltaAhorro: 0, deltaCrypto: 0, label: 'Gastos de transporte, no valió' },
    esRecomendada: true,
    conceptoFinanciero: 'flujo_caja',
  },
  {
    id: 'abrir_extra',
    titulo: 'Abrir igual, vender extra 💪',
    descripcion: 'Trabajar el día de descanso para sacar $200 extra.',
    consejo: 'Maximizar ingresos a corto plazo puede afectar tu salud y sostenibilidad.',
    categoria: 'negocio',
    probabilidadExito: 0.50,
    costoEjecutar: 0,
    efectoExito:   { deltaEfectivo: 200, deltaAhorro: 0, deltaCrypto: 0, label: 'Doble venta, buen día' },
    efectoFracaso: { deltaEfectivo: -30, deltaAhorro: 0, deltaCrypto: 0, label: 'Pocos clientes, mala jornada' },
    esRecomendada: false,
    conceptoFinanciero: 'ingresos_variables',
  },
  {
    id: 'reinvertir_ganancias',
    titulo: 'Reinvertir ganancias 🔄',
    descripcion: 'Meter $200 más al negocio para el siguiente ciclo.',
    consejo: 'El interés compuesto funciona igual en negocios: reinvierte para crecer.',
    categoria: 'negocio',
    probabilidadExito: 0.70,
    costoEjecutar: 200,
    efectoExito:   { deltaEfectivo: -200, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: 0.30, label: 'Ciclo de crecimiento activado' },
    efectoFracaso: { deltaEfectivo: -200, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: 0.05, label: 'Sin impacto esta semana' },
    esRecomendada: true,
    conceptoFinanciero: 'reinversion',
  },
  // ── AHORRO ───────────────────────────────────────────────
  {
    id: 'mover_ahorro',
    titulo: 'Mover dinero al ahorro 🏦',
    descripcion: 'Separar $100 pesos para emergencias personales.',
    consejo: 'Tener un fondo de emergencia es el primer paso de la salud financiera.',
    categoria: 'ahorro',
    probabilidadExito: 1.0,
    costoEjecutar: 100,
    efectoExito:   { deltaEfectivo: -100, deltaAhorro: 100, deltaCrypto: 0, label: 'Fondo de emergencia creciendo' },
    efectoFracaso: { deltaEfectivo: -100, deltaAhorro: 100, deltaCrypto: 0, label: '' },
    esRecomendada: true,
    conceptoFinanciero: 'fondo_emergencia',
  },
  {
    id: 'guardar_colchon',
    titulo: 'Guardar todo en el colchón 🛏️',
    descripcion: 'Guardar el efectivo en casa en vez de invertirlo.',
    consejo: 'El dinero parado pierde valor por la inflación. ¡Hazlo trabajar para ti!',
    categoria: 'ahorro',
    probabilidadExito: 1.0,
    costoEjecutar: 0,
    efectoExito:   { deltaEfectivo: 0, deltaAhorro: 0, deltaCrypto: 0, label: 'Dinero seguro pero sin crecer' },
    efectoFracaso: { deltaEfectivo: 0, deltaAhorro: 0, deltaCrypto: 0, label: '' },
    esRecomendada: false,
    conceptoFinanciero: 'costo_oportunidad',
  },
  {
    id: 'pagar_deuda',
    titulo: 'Pagar deuda del local 🏪',
    descripcion: 'Saldar $180 pesos de renta atrasada.',
    consejo: 'Pagar deudas mejora tu historial crediticio y elimina intereses.',
    categoria: 'ahorro',
    probabilidadExito: 1.0,
    costoEjecutar: 180,
    efectoExito:   { deltaEfectivo: -180, deltaAhorro: 0, deltaCrypto: 0, label: 'Sin deuda pendiente 🎉' },
    efectoFracaso: { deltaEfectivo: -180, deltaAhorro: 0, deltaCrypto: 0, label: '' },
    esRecomendada: true,
    conceptoFinanciero: 'liquidez',
  },
  {
    id: 'retirar_personal',
    titulo: 'Retirar todo para gastos 💸',
    descripcion: 'Sacar $300 del negocio para gastos personales.',
    consejo: 'Mezclar finanzas personales y del negocio es una de las causas más comunes de quiebra.',
    categoria: 'ahorro',
    probabilidadExito: 1.0,
    costoEjecutar: 300,
    efectoExito:   { deltaEfectivo: -300, deltaAhorro: 150, deltaCrypto: 0, label: 'Dinero para la familia' },
    efectoFracaso: { deltaEfectivo: -300, deltaAhorro: 150, deltaCrypto: 0, label: '' },
    esRecomendada: false,
    conceptoFinanciero: 'flujo_caja',
  },
  {
    id: 'descanso',
    titulo: 'Día de descanso 😌',
    descripcion: 'Cerrar el puesto y descansar. Mañana con más energía.',
    consejo: 'El descanso es productivo. Un emprendedor quemado toma malas decisiones.',
    categoria: 'ahorro',
    probabilidadExito: 1.0,
    costoEjecutar: 0,
    efectoExito:   { deltaEfectivo: 0, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: 0.10, label: 'Mañana con más energía' },
    efectoFracaso: { deltaEfectivo: 0, deltaAhorro: 0, deltaCrypto: 0, label: '' },
    esRecomendada: true,
    conceptoFinanciero: 'costos_fijos',
  },
  {
    id: 'fiesta_vecino',
    titulo: 'Gastar en la fiesta del vecino 🎊',
    descripcion: 'Aportar $150 pesos para la parrillada del vecino.',
    consejo: 'El gasto social está bien ocasionalmente, pero no debe comprometer tu capital de trabajo.',
    categoria: 'ahorro',
    probabilidadExito: 0.40,
    costoEjecutar: 150,
    efectoExito:   { deltaEfectivo: -150, deltaAhorro: 0, deltaCrypto: 0, bonusVentas: 0.20, label: '¡El vecino te manda clientes!' },
    efectoFracaso: { deltaEfectivo: -150, deltaAhorro: 0, deltaCrypto: 0, label: 'Dinero gastado sin retorno' },
    esRecomendada: false,
    conceptoFinanciero: 'costo_oportunidad',
  },
  // ── CRYPTO / BIRRIACOIN ──────────────────────────────────
  {
    id: 'comprar_bc',
    titulo: 'Comprar BirriaCoin 🪙',
    descripcion: 'Invertir $200 pesos en BirriaCoin al precio actual.',
    consejo: 'Diversificar tus inversiones reduce el riesgo total. ¡No pongas todos los huevos en una canasta!',
    categoria: 'crypto',
    probabilidadExito: 0.55,
    costoEjecutar: 200,
    esCryptoCompra: true,
    montoCryptoCompra: 200,
    efectoExito:   { deltaEfectivo: -200, deltaAhorro: 0, deltaCrypto: null, label: 'BC podría subir 📈' },
    efectoFracaso: { deltaEfectivo: -200, deltaAhorro: 0, deltaCrypto: null, label: 'BC bajó después de comprar 📉' },
    esRecomendada: true,
    conceptoFinanciero: 'diversificacion',
  },
  {
    id: 'vender_bc',
    titulo: 'Vender BirriaCoin 📈',
    descripcion: 'Liquidar 0.5 BC al precio actual del mercado.',
    consejo: 'Saber cuándo vender es tan importante como saber cuándo comprar.',
    categoria: 'crypto',
    probabilidadExito: 0.60,
    costoEjecutar: 0,
    esCryptoVenta: true,
    cantidadVenta: 0.5,
    efectoExito:   { deltaEfectivo: 0, deltaAhorro: 0, deltaCrypto: null, label: 'Vendiste en buen momento ✅' },
    efectoFracaso: { deltaEfectivo: 0, deltaAhorro: 0, deltaCrypto: null, label: 'Subió justo después de vender 😔' },
    esRecomendada: true,
    conceptoFinanciero: 'riesgo_rendimiento',
  },
  {
    id: 'mover_ahorro_bc',
    titulo: 'Mover ahorro a crypto 🚀',
    descripcion: 'Mover $150 del ahorro personal a BirriaCoin.',
    consejo: 'El ahorro de emergencia no debería invertirse en activos volátiles.',
    categoria: 'crypto',
    probabilidadExito: 0.45,
    costoEjecutar: 150,
    esCryptoCompraDesdeAhorro: true,
    montoCryptoCompra: 150,
    efectoExito:   { deltaEfectivo: 0, deltaAhorro: -150, deltaCrypto: null, label: '¡BC disparada! Buen timing 🚀' },
    efectoFracaso: { deltaEfectivo: 0, deltaAhorro: -150, deltaCrypto: null, label: 'BC cayó. Sin fondo de emergencia 😰' },
    esRecomendada: false,
    conceptoFinanciero: 'volatilidad',
  },
  {
    id: 'hodl_bc',
    titulo: 'Hodlear BirriaCoin 💎',
    descripcion: 'No vender aunque baje. Mantener posición a largo plazo.',
    consejo: 'HODL (Hold On for Dear Life) es estrategia válida si crees en el proyecto a largo plazo.',
    categoria: 'crypto',
    probabilidadExito: 0.50,
    costoEjecutar: 0,
    efectoExito:   { deltaEfectivo: 0, deltaAhorro: 0, deltaCrypto: 0, label: '¡Subió! Buen aguante 💎' },
    efectoFracaso: { deltaEfectivo: 0, deltaAhorro: 0, deltaCrypto: 0, label: 'Bajó más. Resistencia probada' },
    esRecomendada: true,
    conceptoFinanciero: 'riesgo_rendimiento',
    requiereCrypto: true,
  },
];

// ============================================================
// GENERADOR DINÁMICO DE DECISIONES ROGUELIKE
// Selecciona 3 decisiones del banco según el estado actual
// ============================================================
export const getDecisionesParaDia = (diaGlobal, estadoJugador = {}) => {
  const { efectivoNegocio = 500, ahorroPersonal = 200, carteraCrypto = 0 } = estadoJugador;
  const capitalTotal = efectivoNegocio + ahorroPersonal;

  let disponibles = BANCO_DECISIONES.filter(d => {
    if (d.requiereCrypto && carteraCrypto <= 0) return false;
    if (d.esCryptoVenta && carteraCrypto <= 0) return false;
    if (d.costoEjecutar > 0 && capitalTotal < d.costoEjecutar) return false;
    return true;
  });

  const categorias = ['negocio', 'ahorro', 'crypto'];
  const seleccionadas = [];
  const usados = new Set();

  for (const cat of categorias) {
    if (seleccionadas.length >= 3) break;
    const candidatos = disponibles.filter(d => d.categoria === cat && !usados.has(d.id));
    if (candidatos.length === 0) continue;
    const elegida = candidatos[Math.floor(Math.random() * candidatos.length)];
    seleccionadas.push(elegida);
    usados.add(elegida.id);
  }

  if (seleccionadas.length < 3) {
    const restantes = disponibles.filter(d => !usados.has(d.id));
    while (seleccionadas.length < 3 && restantes.length > 0) {
      const idx = Math.floor(Math.random() * restantes.length);
      seleccionadas.push(restantes[idx]);
      usados.add(restantes[idx].id);
      restantes.splice(idx, 1);
    }
  }

  return seleccionadas.map(d => {
    let probAjustada = d.probabilidadExito;
    if (d.categoria === 'negocio' && capitalTotal > 800) probAjustada = Math.min(0.95, probAjustada + 0.10);
    if (capitalTotal < 200) probAjustada = Math.max(0.10, probAjustada - 0.15);
    const bonusDia = Math.min(0.10, diaGlobal * 0.005);
    probAjustada = Math.min(0.95, probAjustada + bonusDia);
    return { ...d, probabilidadExito: Math.round(probAjustada * 100) / 100 };
  });
};

// ============================================================
// MOTOR DE RESULTADO PROBABILÍSTICO
// ============================================================
export const resolverDecision = (decision) => {
  const dado = Math.random();
  const exito = dado <= decision.probabilidadExito;
  return {
    exito,
    efecto: exito ? decision.efectoExito : decision.efectoFracaso,
    dado: Math.round(dado * 100),
  };
};

// ============================================================
// ANÁLISIS CONTRAFACTUAL para Weekly Report
// ============================================================
export const generarContrafactual = (historialSemana) => {
  if (!historialSemana || historialSemana.length === 0) return null;

  const fracasos = historialSemana.filter(h => h.resultado && !h.resultado.exito);
  const noRecomendadas = historialSemana.filter(h => h.decision && !h.decision.esRecomendada);
  const contrafactuales = [];

  if (fracasos.length > 0) {
    const peor = fracasos[0];
    const decisionCompleta = BANCO_DECISIONES.find(d => d.id === peor.decision?.id);
    if (decisionCompleta) {
      contrafactuales.push({
        tipo: 'fracaso',
        titulo: `Si "${peor.decision.titulo}" hubiera salido bien...`,
        descripcion: `Tenías ${Math.round(peor.decision.probabilidadExito * 100)}% de chance. El efecto hubiera sido: ${decisionCompleta.efectoExito.label}`,
        leccion: decisionCompleta.consejo,
        emoji: '🎲',
      });
    }
  }

  if (noRecomendadas.length > 0) {
    const peorNR = noRecomendadas[0];
    contrafactuales.push({
      tipo: 'alternativa',
      titulo: `En lugar de "${peorNR.decision.titulo}"...`,
      descripcion: 'Reinvertir en insumos (75% éxito) hubiera generado +35% ventas ese día.',
      leccion: 'Las decisiones con mayor probabilidad de éxito suelen ser las más recomendadas.',
      emoji: '💡',
    });
  }

  const totalFracasos = fracasos.length;
  const totalExitos = historialSemana.filter(h => h.resultado && h.resultado.exito).length;
  let consejoPróximaSemana;
  if (totalFracasos > totalExitos) {
    consejoPróximaSemana = 'Esta semana el azar fue en tu contra. Prioriza decisiones con 70%+ de éxito para reducir el riesgo.';
  } else {
    consejoPróximaSemana = 'Buen manejo del riesgo. Puedes atreverte con decisiones de mayor rendimiento la próxima semana.';
  }

  return { contrafactuales, consejoPróximaSemana };
};

// ============================================================
// NOTICIAS DEL BARRIO
// ============================================================
export const NOTICIAS_BARRIO = [
  { id: 'taqueria_acepta_bc', titulo: '🌮 ¡La taquería del güero acepta BirriaCoin!', descripcion: 'Tres negocios del barrio anunciaron que aceptarán BirriaCoin como pago.', cambioPorcentualPrecio: 0.2 },
  { id: 'robo_mercado', titulo: '🚨 Asalto en el mercado central', descripcion: 'La inseguridad hace que la gente prefiera efectivo. BirriaCoin cae.', cambioPorcentualPrecio: -0.15 },
  { id: 'influencer_bc', titulo: '📱 Influencer local promociona BirriaCoin', descripcion: 'Un youtuber del barrio habló bien de BirriaCoin en su canal.', cambioPorcentualPrecio: 0.3 },
  { id: 'lluvia_ventas', titulo: '🌧️ Semana de lluvias — pocas ventas', descripcion: 'La gente sale menos, BirriaCoin pierde interés temporalmente.', cambioPorcentualPrecio: -0.08 },
  { id: 'feria_barrio', titulo: '🎉 Feria del barrio este fin de semana', descripcion: 'El evento atrae turistas. Todo el comercio local sube.', cambioPorcentualPrecio: 0.25 },
  { id: 'corrupcion', titulo: '😤 Rumores de corrupción en el mercado crypto', descripcion: 'Desconfianza general. BirriaCoin cae junto con todo el mercado.', cambioPorcentualPrecio: -0.2 },
  { id: 'radio_bc', titulo: '📻 Radio Norteña menciona BirriaCoin', descripcion: 'La estación más escuchada del barrio habló del token en el noticiero.', cambioPorcentualPrecio: 0.12 },
];

// ============================================================
// MISIONES POOL
// ============================================================
export const MISIONES_POOL = [
  { id: 'M_VENDE_150', titulo: 'Día productivo', desc: 'Genera al menos $150 de ventas netas hoy.', icono: '💪', tipo: 'dia_completo', recompensa: { tipo: 'efectivo', cantidad: 60 }, recompensaLabel: '+$60 de bonus', consejo: 'Trabajar el día completo es la forma más segura de generar ventas.' },
  { id: 'M_NO_AHORRO', titulo: 'Aguanta sin ahorro', desc: 'Completa el día sin mover dinero al ahorro personal.', icono: '🔒', tipo: 'no_tocar_ahorro', recompensa: { tipo: 'efectivo', cantidad: 40 }, recompensaLabel: '+$40 de bonus', consejo: 'A veces mantener el flujo del negocio es más importante que ahorrar.' },
  { id: 'M_COMPRA_BC', titulo: 'Diversifica hoy', desc: 'Invierte en BirriaCoin antes de cerrar el puesto.', icono: '🪙', tipo: 'comprar_crypto', recompensa: { tipo: 'crypto', cantidad: 0.5 }, recompensaLabel: '+0.5 BC gratis', consejo: 'Diversificar reduce el riesgo total de tu portafolio.' },
  { id: 'M_AHORRA_100', titulo: 'Fondo de emergencia', desc: 'Mueve al menos $100 al ahorro personal hoy.', icono: '🏦', tipo: 'ahorro_minimo', meta: 100, recompensa: { tipo: 'efectivo', cantidad: 30 }, recompensaLabel: '+$30 de bonus', consejo: 'El fondo de emergencia es el primer paso de la salud financiera.' },
  { id: 'M_VENDE_BC', titulo: 'Liquida con ganancia', desc: 'Vende BirriaCoin si tienes en cartera.', icono: '📈', tipo: 'vender_crypto', recompensa: { tipo: 'efectivo', cantidad: 50 }, recompensaLabel: '+$50 de bonus', consejo: 'Saber cuándo salir de una inversión es tan importante como entrar.' },
  { id: 'M_DIA_LIBRE', titulo: 'Día de estrategia', desc: 'Toma decisiones libremente — hoy no hay restricciones.', icono: '🌮', tipo: 'libre', recompensa: { tipo: 'efectivo', cantidad: 20 }, recompensaLabel: '+$20 por jugar', consejo: 'La libertad financiera viene de conocer tus opciones.' },
  { id: 'M_COMPLETO_AHORRAR', titulo: 'Trabaja y ahorra', desc: 'Completa el día Y mueve algo al ahorro.', icono: '⚡', tipo: 'dia_completo_y_ahorro', recompensa: { tipo: 'efectivo', cantidad: 80 }, recompensaLabel: '+$80 de bonus', consejo: 'La combinación de trabajo + ahorro es la fórmula del crecimiento sostenido.' },
];

export const getMisionParaDia = (diaGlobal) => {
  const idx = (diaGlobal - 1) % MISIONES_POOL.length;
  return MISIONES_POOL[idx];
};

// ============================================================
// EVENTOS SORPRESA
// ============================================================
export const EVENTOS_SORPRESA = [
  { id: 'inspector', titulo: '🕵️ ¡Inspector de sanidad!', desc: 'Un inspector llegó al puesto. Pasaste la revisión, pero tuviste que pagar una "mordida".', impactoEfectivo: -80, impactoVentas: 1.0, icono: '🕵️', tipo: 'malo', donJoseFrase: '"Todos los años lo mismo con este señor... Ay, México lindo."', leccionFinanciera: 'Siempre ten un fondo para imprevistos — los gastos inesperados son parte del negocio.' },
  { id: 'influencer_visita', titulo: '⭐ ¡Un influencer probó tu birria!', desc: 'Un youtuber con 50k seguidores publicó tu puesto. Las ventas se dispararon.', impactoEfectivo: 0, impactoVentas: 1.8, icono: '⭐', tipo: 'bueno', donJoseFrase: '"¿Y eso del youtuber? Mi abuela vendía igual de bien sin internet, joven."', leccionFinanciera: 'El marketing boca a boca es el más poderoso — y el más barato.' },
  { id: 'lluvia_torrencial', titulo: '🌧️ Lluvia torrencial', desc: 'Nadie sale a comprar tacos con este aguacero. Ventas muy bajas.', impactoEfectivo: 0, impactoVentas: 0.4, icono: '🌧️', tipo: 'malo', donJoseFrase: '"La lluvia es agua de Dios, mijo. Pero también es un problema pa\' los tacos."', leccionFinanciera: 'Los negocios físicos dependen del entorno. Diversificar ingresos protege de esto.' },
  { id: 'cliente_vip', titulo: '👔 ¡Cliente corporativo!', desc: 'Una empresa del centro pidió 50 tacos para su desayuno de trabajo.', impactoEfectivo: 200, impactoVentas: 1.0, icono: '👔', tipo: 'bueno', donJoseFrase: '"¡Cincuenta tacos! Nunca pensé que mi birria llegaría a las oficinas."', leccionFinanciera: 'Los clientes B2B pueden cambiar tu negocio. Un solo contrato puede valer más que 100 clientes individuales.' },
  { id: 'gas_agotado', titulo: '💨 ¡Se acabó el gas!', desc: 'Tuviste que cerrar temprano para ir por una nueva pipa.', impactoEfectivo: -30, impactoVentas: 0.5, icono: '💨', tipo: 'neutro', donJoseFrase: '"El gas, el aceite, los chiles... esto de tener negocio nunca acaba."', leccionFinanciera: 'El control de inventario evita paros operativos. Anticipa antes de que se acabe.' },
  { id: 'vecino_ayuda', titulo: '🤝 Tu vecino te echa la mano', desc: 'El vecino taquero cubrió tu puesto mientras descansabas. Ganaste sin trabajar.', impactoEfectivo: 80, impactoVentas: 1.0, icono: '🤝', tipo: 'bueno', donJoseFrase: '"El barrio cuida al barrio. Eso no tiene precio, mijo."', leccionFinanciera: 'Las redes de apoyo son un activo intangible. Invierte en tus relaciones.' },
  { id: 'competidor_nuevo', titulo: '😤 ¡Abrió otro puesto de tacos!', desc: 'Un competidor nuevo se instaló a media cuadra. Te robó algunos clientes hoy.', impactoEfectivo: 0, impactoVentas: 0.7, icono: '😤', tipo: 'malo', donJoseFrase: '"Que haya competencia está bien. Nos obliga a mejorar. Aunque duele."', leccionFinanciera: 'La competencia es parte del mercado libre. La diferenciación — tu sazón único — es tu ventaja.' },
  { id: 'luz_gratis', titulo: '⚡ Día sin costos de luz', desc: 'El gobierno dio un subsidio de energía hoy. Ahorras en operación.', impactoEfectivo: 35, impactoVentas: 1.0, icono: '⚡', tipo: 'bueno', donJoseFrase: '"¡Bendito el gobierno cuando sí ayuda! Aunque no pasa seguido."', leccionFinanciera: 'Los subsidios y apoyos gubernamentales son parte del entorno económico de un negocio.' },
];

export const getEventoAleatorio = () => {
  if (Math.random() > GAME_CONFIG.probabilidadNoticia) return null;
  return EVENTOS_SORPRESA[Math.floor(Math.random() * EVENTOS_SORPRESA.length)];
};

// ============================================================
// DIÁLOGOS DE DON JOSÉ
// ============================================================
export const DIALOGOS_DON_JOSE = {
  decision_buena: [
    'Eso es lo que aprendí tarde yo... tú vas bien, mijo.',
    '¡Así mero! Mi abuela decía: "El que sabe gastar, sabe ganar".',
    'Treinta años de contador me enseñaron eso exacto.',
    '¡Órale! El negocio que piensa, el negocio que crece.',
    'Decisión de empresario, no de asalariado. Así se hace.',
  ],
  decision_mala: [
    'Ay mijo... en la textilera nunca perdíamos así. Hay que aprender.',
    'Mi abuela decía: "El dinero fácil se va fácil". Cuidado.',
    'Eso lo hice yo una vez. Una sola vez. Ya sé por qué.',
    'Hmm... a veces el camino más corto es el más caro.',
    'No te me desanimes. Cada error es una lección de finanzas gratis.',
  ],
  decision_riesgo_salio_bien: [
    '¡Mira eso! El riesgo calculado valió la pena. ¡Órale!',
    'Apostaste y ganaste. Así funciona el mercado, mijo.',
    '¡Eso se llama timing! Treinta años de contador y aún me sorprendo.',
    'El valiente no es el que no tiene miedo, sino el que actúa con cabeza.',
  ],
  decision_riesgo_salio_mal: [
    'Así es la probabilidad, mijo. Hoy no fue tu día, pero el análisis era correcto.',
    'El mercado tiene memoria corta. Mañana es otra oportunidad.',
    'No ganaste hoy, pero aprendiste el precio del riesgo. Eso vale.',
    'Hasta el mejor contador a veces se equivoca. Lo importante es seguir.',
  ],
  crypto_sube: [
    '¿Monedas digitales? En la textilera solo había pesos y el reloj chocador.',
    '¡Virgen santísima! ¿Cómo sube así una moneda que no existe?',
    'Treinta años de contador y nunca vi esto. El mundo cambió, mijo.',
  ],
  crypto_baja: [
    'Ya ven, mijo. Por eso yo prefería los bonos del gobierno.',
    'Esto del crypto es como la ruleta, pero más rápido.',
    'Diversifica, te digo. No pongas todos los chiles en una cazuela.',
  ],
  cierre_temprano: [
    'El que madruga, Dios lo ayuda. El que cierra temprano... paga costos igual.',
    'Mijo, el puesto solo gana cuando está abierto.',
    'Treinta años llegando primero a la oficina. Eso me lo enseñó la vida.',
  ],
  dia_completo: [
    '¡Eso es! Día completo, cuenta alegre.',
    'Así como en la textilera: primero en llegar, último en irse.',
    'Buen día de trabajo, mijo. El negocio lo nota.',
  ],
  mision_cumplida: [
    '¡Mira qué bien! Misión cumplida. Mi abuela estaría orgullosa.',
    '¡Eso es disciplina financiera! Treinta años de contador lo confirman.',
    '¡Órale! Cuando uno se propone algo, lo logra. Así es.',
  ],
  mision_fallida: [
    'No hay pena, mijo. Mañana es otro día y otra misión.',
    'La meta se fue hoy, pero la lección se quedó.',
    'En finanzas, el que no falla nunca, nunca jugó.',
  ],
  saludo_manana: [
    '¡Buenos días! El consomé ya está listo. ¿Qué decisiones tomamos hoy?',
    'Amanecimos con $$ en la bolsa. ¡A trabajarlos!',
    '¡Arriba! El barrio nos espera. ¿Qué hacemos hoy, mijo?',
    'Nuevo día, nuevas oportunidades. Así decía mi jefe en la textilera.',
    '¡Ánimo! La birria más rica del barrio no se vende sola.',
  ],
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
  decision_riesgo_ganado:   35,
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
// CONCEPTOS FINANCIEROS
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

export const getConceptoDelDia = (historialDelDia) => {
  if (!historialDelDia || historialDelDia.length === 0) return null;
  for (const h of historialDelDia) {
    const conceptoId = h.decision?.conceptoFinanciero;
    if (conceptoId && CONCEPTOS_FINANCIEROS[conceptoId]) {
      return { id: conceptoId, ...CONCEPTOS_FINANCIEROS[conceptoId] };
    }
  }
  return null;
};
