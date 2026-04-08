import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  INITIAL_STATE, GAME_CONFIG, NOTICIAS_BARRIO,
  getDecisionesParaDia, getMisionParaDia, getEventoAleatorio,
  getDonJoseFrase, XP_POR_ACCION, getNivelActual, getConceptoDelDia,
  resolverDecision, generarContrafactual,
} from '../data/gameData';

const COSTOS = {
  renta: 40,
  insumos: 30,
  ventaCompleta: 180,
  penaltyExtra: 60,
  ventaMinima: 20,
};

const getEstadoAnimo = (efectivo, ahorro, crypto, precioBC) => {
  const total = efectivo + ahorro + (crypto * precioBC);
  if (efectivo <= 0)  return { emoji: '😰', label: '¡Sin efectivo!',         color: '#c0392b', alerta: true  };
  if (efectivo < 100) return { emoji: '😟', label: 'Efectivo muy bajo',       color: '#c0392b', alerta: true  };
  if (ahorro <= 0)    return { emoji: '😬', label: 'Sin fondo de emergencia', color: '#d4901a', alerta: true  };
  if (total > 2000)   return { emoji: '🤩', label: '¡Don José prospera!',     color: '#4a9e4a', alerta: false };
  if (total > 1000)   return { emoji: '😄', label: 'Negocio en forma',        color: '#4a9e4a', alerta: false };
  if (total > 600)    return { emoji: '🙂', label: 'Día a día',               color: '#d4901a', alerta: false };
  return                     { emoji: '😐', label: 'Hay que mejorar',         color: '#d4901a', alerta: false };
};

const LOGROS = [
  { id: 'primer_dia',    titulo: '¡Primer Día!',    desc: 'Completaste tu primer día.',          emoji: '🌮', req: (h) => h.diasCompletos >= 1   },
  { id: 'ahorrador',     titulo: 'Ahorrador',        desc: 'Tienes más de $300 en ahorro.',       emoji: '🏦', req: (h) => h.ahorroPersonal > 300  },
  { id: 'crypto_inicio', titulo: 'Criptonauta',      desc: 'Compraste tu primer BirriaCoin.',     emoji: '🪙', req: (h) => h.carteraCrypto > 0     },
  { id: 'racha_3',       titulo: '¡Racha x3!',      desc: '3 días completos seguidos.',          emoji: '🔥', req: (h) => h.rachaDias >= 3        },
  { id: 'patrimonio_1k', titulo: 'Mil Pesos',        desc: 'Patrimonio supera $1,000.',           emoji: '💰', req: (h) => h.patrimonioTotal > 1000 },
  { id: 'mision_3',      titulo: 'Cumplidor',        desc: '3 misiones cumplidas.',               emoji: '🎯', req: (h) => h.misionesCumplidas >= 3 },
  { id: 'sin_crashes',   titulo: 'Estable',          desc: '3 días sin llegar a efectivo bajo.', emoji: '🧱', req: (h) => h.diasSinAlerta >= 3     },
  // NUEVO: logro roguelike
  { id: 'riesgo_maestro', titulo: 'Jugador de Riesgo', desc: 'Ganaste 3 decisiones con menos del 50% de probabilidad.', emoji: '🎰', req: (h) => (h.decisiones_riesgo_ganadas || 0) >= 3 },
];

function verificarLogros(stats, logrosObtenidos) {
  return LOGROS.filter(l => !logrosObtenidos.includes(l.id) && l.req(stats));
}

function verificarMision(mision, state, diaCompleto, ahorroAntes) {
  if (!mision) return false;
  switch (mision.tipo) {
    case 'dia_completo':          return diaCompleto;
    case 'no_tocar_ahorro':       return state.ahorroPersonal <= ahorroAntes + 1;
    case 'comprar_crypto':        return state.carteraCrypto > 0;
    case 'ahorro_minimo':         return state.ahorroPersonal >= (ahorroAntes + (mision.meta || 100));
    case 'vender_crypto':         return state._vendioHoy === true;
    case 'libre':                 return true;
    case 'dia_completo_y_ahorro': return diaCompleto && state.ahorroPersonal > ahorroAntes;
    default:                      return false;
  }
}

// Estado inicial
const buildInitialDecisions = () => getDecisionesParaDia(1, {
  efectivoNegocio: INITIAL_STATE.efectivoNegocio,
  ahorroPersonal: INITIAL_STATE.ahorroPersonal,
  carteraCrypto: INITIAL_STATE.carteraCrypto,
});

const initialGameState = {
  efectivoNegocio: INITIAL_STATE.efectivoNegocio,
  ahorroPersonal:  INITIAL_STATE.ahorroPersonal,
  carteraCrypto:   INITIAL_STATE.carteraCrypto,
  precioBC:        INITIAL_STATE.precioBC,
  diaGlobal: 1, diaSemana: 1, semanaGlobal: 1,
  accionesRestantes: GAME_CONFIG.accionesFinancierasPorDia,
  accionesUsadasHoy: 0,
  historial: [], screen: 'game',
  popupConsejo: null,
  colaPopups: [], popupActual: null,
  resumenSemana: null,
  logrosObtenidos: [], rachaDias: 0, diasCompletos: 0,
  misionesCumplidas: 0, diasSinAlerta: 0,
  misionHoy: getMisionParaDia(1),
  eventoHoy: null,
  donJoseFrase: getDonJoseFrase('saludo_manana'),
  ahorroAlInicioDelDia: 200,
  _vendioHoy: false,
  xpTotal: 0,
  conceptoDelDia: null,
  glosarioDesbloqueado: [],
  // NUEVO: estadísticas roguelike
  decisiones_riesgo_ganadas: 0,
  ultimoResultadoRoguelike: null, // { exito, dado, etiqueta }
};

// Reducer
function gameReducer(state, action) {
  switch (action.type) {

    case 'APLICAR_DECISION': {
      const { decision } = action;

      // ── MOTOR PROBABILÍSTICO ROGUELIKE ──────────────────
      const resultado = resolverDecision(decision);
      const efecto = resultado.efecto;

      let ef = state.efectivoNegocio, ah = state.ahorroPersonal, cr = state.carteraCrypto;
      let vendioHoy = state._vendioHoy;

      if (decision.esCryptoCompra && decision.montoCryptoCompra) {
        let monto = decision.montoCryptoCompra;
        const pagoEf = Math.min(monto, ef);
        ef -= pagoEf; monto -= pagoEf;
        if (monto > 0) { const pagoAh = Math.min(monto, ah); ah -= pagoAh; }
        const gastado = decision.montoCryptoCompra - Math.max(0, monto);
        cr += gastado / state.precioBC;
      } else if (decision.esCryptoCompraDesdeAhorro && decision.montoCryptoCompra) {
        const m = Math.min(decision.montoCryptoCompra, ah); ah -= m; cr += m / state.precioBC;
      } else if (decision.esCryptoVenta && decision.cantidadVenta) {
        const cant = Math.min(decision.cantidadVenta, cr); cr -= cant; ef += cant * state.precioBC;
        vendioHoy = true;
      } else {
        // Aplicar efecto probabilístico
        const deltaEf = efecto.deltaEfectivo || 0;
        if (deltaEf < 0) {
          const costo = Math.abs(deltaEf);
          const pagoEf = Math.min(costo, ef); ef -= pagoEf;
          const pagoAh = Math.min(costo - pagoEf, ah); ah -= pagoAh;
        } else {
          ef = Math.max(0, ef + deltaEf);
        }
        ah = Math.max(0, ah + (efecto.deltaAhorro || 0));
        cr = Math.max(0, cr + (efecto.deltaCrypto || 0));
      }

      // XP — bonus si ganó con probabilidad baja
      const esRiesgoAlto = decision.probabilidadExito < 0.50;
      const xpGanado = decision.esRecomendada
        ? XP_POR_ACCION.decision_recomendada
        : XP_POR_ACCION.decision_no_recomendada;
      const xpBonus = (esRiesgoAlto && resultado.exito) ? XP_POR_ACCION.decision_riesgo_ganado : 0;
      const nuevoXP = (state.xpTotal || 0) + xpGanado + xpBonus;

      const nivelAntes = getNivelActual(state.xpTotal || 0).nivel;
      const nivelDespues = getNivelActual(nuevoXP).nivel;
      const subioNivel = nivelDespues > nivelAntes;

      // Contador de riesgos ganados
      const nuevasRiesgoGanadas = (state.decisiones_riesgo_ganadas || 0) +
        (esRiesgoAlto && resultado.exito ? 1 : 0);

      // Frase Don José según resultado probabilístico
      let contextoDJ = decision.esRecomendada ? 'decision_buena' : 'decision_mala';
      if (esRiesgoAlto && resultado.exito) contextoDJ = 'decision_riesgo_salio_bien';
      if (esRiesgoAlto && !resultado.exito) contextoDJ = 'decision_riesgo_salio_mal';
      const frase = getDonJoseFrase(contextoDJ);

      const historial = [...state.historial, {
        diaGlobal: state.diaGlobal,
        diaSemana: state.diaSemana,
        semanaGlobal: state.semanaGlobal,
        decision,
        resultado, // NUEVO: guardamos el resultado probabilístico
      }];

      const accionesRestantes = state.accionesRestantes - 1;
      const accionesUsadasHoy = state.accionesUsadasHoy + 1;
      const hayBancarrota = ef <= 0 && ah <= 0;

      const newState = {
        ...state,
        efectivoNegocio: ef, ahorroPersonal: ah, carteraCrypto: cr,
        historial, accionesRestantes: Math.max(0, accionesRestantes),
        accionesUsadasHoy, _vendioHoy: vendioHoy,
        screen: hayBancarrota ? 'bankrupt' : 'game',
        donJoseFrase: frase,
        xpTotal: nuevoXP,
        decisiones_riesgo_ganadas: nuevasRiesgoGanadas,
        ultimoResultadoRoguelike: {
          exito: resultado.exito,
          dado: resultado.dado,
          probabilidad: Math.round(decision.probabilidadExito * 100),
          etiqueta: resultado.efecto.label,
          esRiesgoAlto,
        },
      };

      if (accionesRestantes <= 0 && !hayBancarrota) {
        return terminarDia({ ...newState }, true);
      }
      return newState;
    }

    case 'FORZAR_FIN_DIA':
      return terminarDia({ ...state, donJoseFrase: getDonJoseFrase('cierre_temprano') }, false);

    case 'CERRAR_EVENTO':
      return { ...state, eventoHoy: null };

    case 'POPUP_SIGUIENTE': {
      const cola = [...state.colaPopups];
      const siguiente = cola.shift();
      const nuevoGlosario = [...(state.glosarioDesbloqueado || [])];
      if (state.popupActual?.tipo === 'concepto' && state.popupActual?.data?.id) {
        if (!nuevoGlosario.includes(state.popupActual.data.id)) {
          nuevoGlosario.push(state.popupActual.data.id);
        }
      }
      return { ...state, colaPopups: cola, popupActual: siguiente || null, glosarioDesbloqueado: nuevoGlosario };
    }

    case 'CERRAR_POPUP':
      return { ...state, popupConsejo: null };

    case 'CERRAR_REPORTE_SEMANAL': {
      const nuevasDecisiones = getDecisionesParaDia(state.diaGlobal, {
        efectivoNegocio: state.efectivoNegocio,
        ahorroPersonal: state.ahorroPersonal,
        carteraCrypto: state.carteraCrypto,
      });
      return { ...state, screen: 'game', resumenSemana: null, decisionesDelDia: nuevasDecisiones };
    }

    case 'REINICIAR':
      return { ...initialGameState, decisionesDelDia: buildInitialDecisions() };

    default: return state;
  }
}

// ── Fin de día ────────────────────────────────────────────────
function terminarDia(state, diaCompleto) {
  const costoFijo = diaCompleto
    ? COSTOS.renta + COSTOS.insumos
    : COSTOS.renta + COSTOS.insumos + COSTOS.penaltyExtra;

  const eventoMult = state.eventoHoy ? (state.eventoHoy.impactoVentas || 1) : 1;
  const accionesUsadas = state.accionesUsadasHoy || 0;
  const totalAcciones  = GAME_CONFIG.accionesFinancierasPorDia;
  const proporcionRaw  = diaCompleto ? 1 : Math.pow(accionesUsadas / totalAcciones, 1.5);
  const proporcion     = diaCompleto ? 1 : Math.max(COSTOS.ventaMinima / COSTOS.ventaCompleta, proporcionRaw);

  // Bonus de ventas acumulado de las decisiones del día (roguelike)
  const bonusVentasAcumulado = state.historial
    .filter(h => h.diaGlobal === state.diaGlobal && h.resultado?.efecto?.bonusVentas)
    .reduce((acc, h) => acc + (h.resultado.efecto.bonusVentas || 0), 0);

  const ventasBase = COSTOS.ventaCompleta * proporcion * eventoMult * (1 + Math.random() * 0.25 - 0.05);
  const ventas     = Math.max(COSTOS.ventaMinima, ventasBase * (1 + bonusVentasAcumulado));
  const neto       = ventas - costoFijo;

  const efectoEvento = state.eventoHoy ? (state.eventoHoy.impactoEfectivo || 0) : 0;
  const nuevoEf      = Math.max(0, state.efectivoNegocio + neto + efectoEvento);

  // Verificar misión
  const misionCumplida = verificarMision(state.misionHoy, { ...state, _vendioHoy: state._vendioHoy }, diaCompleto, state.ahorroAlInicioDelDia);
  let efConRecompensa  = nuevoEf;
  let crConRecompensa  = state.carteraCrypto;
  if (misionCumplida && state.misionHoy) {
    const r = state.misionHoy.recompensa;
    if (r.tipo === 'efectivo') efConRecompensa += r.cantidad;
    if (r.tipo === 'crypto')   crConRecompensa += r.cantidad;
  }

  // XP del día
  const xpDia = (diaCompleto ? XP_POR_ACCION.dia_completo_bonus : 0) + (misionCumplida ? XP_POR_ACCION.mision_cumplida_bonus : 0);
  const nuevoXPTotal = (state.xpTotal || 0) + xpDia;
  const nivelAntesFinDia = getNivelActual(state.xpTotal || 0).nivel;
  const nivelDespuesFinDia = getNivelActual(nuevoXPTotal).nivel;
  const subioNivelHoy = nivelDespuesFinDia > nivelAntesFinDia;

  // Concepto del día
  const conceptoHoy = getConceptoDelDia(state.historial.filter(h => h.diaGlobal === state.diaGlobal));

  // Precio BirriaCoin
  const t = Math.random();
  let nuevoPrecio = state.precioBC * lerp(1 + GAME_CONFIG.volatilidadMin, 1 + GAME_CONFIG.volatilidadMax, t);
  let noticiaDeHoy = null;
  if (Math.random() <= GAME_CONFIG.probabilidadNoticia) {
    noticiaDeHoy = NOTICIAS_BARRIO[Math.floor(Math.random() * NOTICIAS_BARRIO.length)];
    nuevoPrecio *= (1 + noticiaDeHoy.cambioPorcentualPrecio);
  }
  nuevoPrecio = Math.min(Math.max(nuevoPrecio, GAME_CONFIG.precioMinimo), GAME_CONFIG.precioMaximo);

  // Frase Don José
  const cambioBC = nuevoPrecio - state.precioBC;
  let contextoFrase = diaCompleto ? 'dia_completo' : 'cierre_temprano';
  if (misionCumplida) contextoFrase = 'mision_cumplida';
  if (Math.abs(cambioBC / state.precioBC) > 0.2) contextoFrase = cambioBC > 0 ? 'crypto_sube' : 'crypto_baja';
  if (efConRecompensa < 100) contextoFrase = 'alerta_dinero';
  const donJoseFrase = getDonJoseFrase(contextoFrase);

  // Calendario
  const nuevoDiaGlobal = state.diaGlobal + 1;
  let nuevoDiaSemana = state.diaSemana + 1;
  let nuevaSemana    = state.semanaGlobal;
  let semanaTerminada = false, resumenSemana = null;
  if (nuevoDiaSemana > GAME_CONFIG.diasPorSemana) {
    semanaTerminada = true;
    // Pasar historial de la semana para el contrafactual
    const historialSemana = state.historial.filter(h => h.semanaGlobal === state.semanaGlobal);
    resumenSemana = calcularResumenSemana(state.historial, state.semanaGlobal, efConRecompensa, state.ahorroPersonal, historialSemana);
    nuevoDiaSemana = 1; nuevaSemana = state.semanaGlobal + 1;
  }

  // Stats logros
  const nuevaRacha        = diaCompleto ? (state.rachaDias || 0) + 1 : 0;
  const diasCompletos     = (state.diasCompletos || 0) + (diaCompleto ? 1 : 0);
  const misionesCumplidas = (state.misionesCumplidas || 0) + (misionCumplida ? 1 : 0);
  const sinAlerta         = efConRecompensa >= 100 && state.ahorroPersonal > 0;
  const diasSinAlerta     = sinAlerta ? (state.diasSinAlerta || 0) + 1 : 0;
  const patrimonioTotal   = efConRecompensa + state.ahorroPersonal + (crConRecompensa * nuevoPrecio);

  const statsActuales = {
    rachaDias: nuevaRacha, diasCompletos, ahorroPersonal: state.ahorroPersonal,
    carteraCrypto: crConRecompensa, patrimonioTotal, misionesCumplidas, diasSinAlerta,
    decisiones_riesgo_ganadas: state.decisiones_riesgo_ganadas || 0,
  };
  const nuevosLogros  = verificarLogros(statsActuales, state.logrosObtenidos);
  const logrosObtIds  = [...state.logrosObtenidos, ...nuevosLogros.map(l => l.id)];

  // Cola de popups
  const feedbackData = generarFeedback(
    diaCompleto, state.accionesUsadasHoy || 0, GAME_CONFIG.accionesFinancierasPorDia,
    neto + efectoEvento, ventas, costoFijo, bonusVentasAcumulado,
    state.efectivoNegocio, efConRecompensa, state.ahorroPersonal,
    crConRecompensa, nuevoPrecio, misionCumplida, state.misionHoy,
    state.eventoHoy, noticiaDeHoy, conceptoHoy,
    state.historial.filter(h => h.diaGlobal === state.diaGlobal)
  );

  const cola = [];
  cola.push({ tipo: 'feedback', data: feedbackData });
  if (subioNivelHoy) {
    cola.push({ tipo: 'nivel', data: getNivelActual(nuevoXPTotal) });
  } else if (nuevosLogros.length > 0) {
    cola.push({ tipo: 'logro', data: nuevosLogros[0] });
  }

  const [primero, ...resto] = cola;
  const hayBancarrota = efConRecompensa <= 0 && state.ahorroPersonal <= 0;

  const eventoManana = getEventoAleatorio();
  const misionManana = getMisionParaDia(nuevoDiaGlobal);

  // Generar nuevas decisiones dinámicas para mañana
  const nuevasDecisiones = getDecisionesParaDia(nuevoDiaGlobal, {
    efectivoNegocio: efConRecompensa,
    ahorroPersonal: state.ahorroPersonal,
    carteraCrypto: crConRecompensa,
  });

  return {
    ...state,
    efectivoNegocio: efConRecompensa, carteraCrypto: crConRecompensa,
    precioBC: nuevoPrecio, noticiaDeHoy,
    diaGlobal: nuevoDiaGlobal, diaSemana: nuevoDiaSemana, semanaGlobal: nuevaSemana,
    accionesRestantes: GAME_CONFIG.accionesFinancierasPorDia, accionesUsadasHoy: 0,
    _vendioHoy: false,
    decisionesDelDia: nuevasDecisiones,
    screen: hayBancarrota ? 'bankrupt' : semanaTerminada ? 'weekly_report' : 'game',
    resumenSemana,
    rachaDias: nuevaRacha, diasCompletos, logrosObtenidos: logrosObtIds,
    misionesCumplidas, diasSinAlerta,
    colaPopups: resto, popupActual: primero || null,
    noticiaVisible: null, feedbackDia: null,
    xpTotal: nuevoXPTotal,
    conceptoDelDia: conceptoHoy,
    donJoseFrase,
    misionHoy: misionManana,
    eventoHoy: eventoManana,
    ahorroAlInicioDelDia: state.ahorroPersonal,
    ultimoResultadoRoguelike: null,
  };
}

function generarFeedback(diaCompleto, accionesUsadas, totalAcciones, neto, ventas, costos, bonusVentas, efAntes, efDespues, ahorro, crypto, precioBC, misionCumplida, mision, evento, noticia, concepto, historialDia) {
  const gano = neto >= 0;
  const patrimonioTotal = efDespues + ahorro + (crypto * precioBC);
  const detalles = [];

  // 1. Resultado del día con bonus roguelike
  const bonusPct = Math.round(bonusVentas * 100);
  detalles.push({
    icon: gano ? '📈' : '📉',
    label: 'Resultado del día',
    value: `${gano ? '+' : ''}$${neto.toFixed(0)}`,
    color: gano ? '#4a9e4a' : '#c0392b',
    sub: diaCompleto
      ? `Ventas $${ventas.toFixed(0)} — Costos $${costos.toFixed(0)}${bonusPct > 0 ? ` (+${bonusPct}% por decisiones)` : ''}`
      : `Solo ${accionesUsadas}/${totalAcciones} turnos — ventas reducidas`,
  });

  // 2. Resumen de decisiones probabilísticas del día
  const decisionesConResultado = (historialDia || []).filter(h => h.resultado);
  if (decisionesConResultado.length > 0) {
    const exitosas = decisionesConResultado.filter(h => h.resultado.exito).length;
    const total = decisionesConResultado.length;
    detalles.push({
      icon: '🎲',
      label: 'Suerte del día',
      value: `${exitosas}/${total} decisiones exitosas`,
      color: exitosas >= total / 2 ? '#4a9e4a' : '#d4901a',
      sub: exitosas === total
        ? '¡Día perfecto! Todas las decisiones salieron bien.'
        : exitosas === 0
        ? 'El azar no estuvo de tu lado hoy. ¡Mañana es otro día!'
        : 'El mercado fue mixto hoy.',
    });
  }

  // 3. Misión
  if (mision && misionCumplida) {
    detalles.push({ icon: '🎯', label: `Misión: ${mision.titulo}`, value: mision.recompensaLabel, color: '#b5820a', sub: '¡Bonus aplicado!' });
  } else if (mision && !misionCumplida && !diaCompleto) {
    detalles.push({ icon: '😔', label: 'Misión fallida', value: 'Sin bonus', color: '#8c7c6e', sub: mision.consejo });
  }

  // 4. Evento
  if (evento) {
    const impactoStr = evento.impactoEfectivo !== 0
      ? `${evento.impactoEfectivo > 0 ? '+' : ''}$${evento.impactoEfectivo}`
      : `Ventas x${evento.impactoVentas}`;
    detalles.push({
      icon: evento.icono, label: 'Evento del día', value: impactoStr,
      color: evento.tipo === 'bueno' ? '#4a9e4a' : evento.tipo === 'malo' ? '#c0392b' : '#d4901a',
      sub: evento.leccionFinanciera,
    });
  }

  // 5. Noticia BC
  if (noticia) {
    const esBuena = noticia.cambioPorcentualPrecio >= 0;
    const pct = Math.abs(noticia.cambioPorcentualPrecio * 100).toFixed(0);
    detalles.push({
      icon: '📰', label: 'Noticias del barrio',
      value: `BC ${esBuena ? '+' : '-'}${pct}%`,
      color: esBuena ? '#4a9e4a' : '#c0392b', sub: noticia.titulo,
    });
  }

  let titulo, tipo;
  if (!diaCompleto && accionesUsadas === 0) { titulo = '😴 Don José no trabajó'; tipo = 'malo'; }
  else if (!diaCompleto) { titulo = '⏰ Día incompleto'; tipo = 'advertencia'; }
  else if (misionCumplida) { titulo = '🎯 ¡Misión cumplida!'; tipo = 'bueno'; }
  else if (gano) { titulo = '✅ ¡Buen día, Don José!'; tipo = 'bueno'; }
  else { titulo = '📉 Día difícil'; tipo = 'malo'; }

  return { titulo, tipo, detalles, patrimonioTotal, concepto };
}

function calcularResumenSemana(historial, semanaGlobal, efectivo, ahorro, historialSemana) {
  const r = historial.filter(h => h.semanaGlobal === semanaGlobal);
  const total = r.length, rec = r.filter(h => h.decision.esRecomendada).length;
  // NUEVO: análisis contrafactual
  const contrafactual = generarContrafactual(historialSemana);
  return {
    semanaGlobal, totalDecisiones: total,
    totalRecomendadas: rec, totalNoRecomendadas: total - rec,
    porcentajeRecomendadas: total > 0 ? rec / total : 0,
    efectivoFinal: efectivo, ahorroFinal: ahorro,
    contrafactual, // NUEVO
    historialSemana, // NUEVO: para mostrar detalle
  };
}

function lerp(a, b, t) { return a + (b - a) * t; }

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialGameState, decisionesDelDia: buildInitialDecisions(),
  });

  const aplicarDecision      = useCallback((d) => dispatch({ type: 'APLICAR_DECISION',      decision: d }), []);
  const forzarFinDeDia       = useCallback(()  => dispatch({ type: 'FORZAR_FIN_DIA'                    }), []);
  const cerrarPopup          = useCallback(()  => dispatch({ type: 'CERRAR_POPUP'                      }), []);
  const cerrarEvento         = useCallback(()  => dispatch({ type: 'CERRAR_EVENTO'                     }), []);
  const avanzarPopup         = useCallback(()  => dispatch({ type: 'POPUP_SIGUIENTE'                   }), []);
  const cerrarReporteSemanal = useCallback(()  => dispatch({ type: 'CERRAR_REPORTE_SEMANAL'            }), []);
  const reiniciar            = useCallback(()  => dispatch({ type: 'REINICIAR'                         }), []);

  const estadoAnimo = getEstadoAnimo(state.efectivoNegocio, state.ahorroPersonal, state.carteraCrypto, state.precioBC);

  return (
    <GameContext.Provider value={{ state, estadoAnimo, aplicarDecision, forzarFinDeDia, cerrarPopup, cerrarEvento, avanzarPopup, cerrarReporteSemanal, reiniciar }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
