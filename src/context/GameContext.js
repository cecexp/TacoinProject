import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  INITIAL_STATE, GAME_CONFIG, NOTICIAS_BARRIO,
  getDecisionesParaDia, getMisionParaDia, getEventoAleatorio,
  getDonJoseFrase, XP_POR_ACCION, getNivelActual, getConceptoDelDia,
  resolverDecision, generarContrafactual,
} from '../data/gameData';

// ── Dificultad escalable por semana ───────────────────────────
const getCostosDinamicos = (semana) => ({
  renta:         40  * (1 + (semana - 1) * 0.20),
  insumos:       30  * (1 + (semana - 1) * 0.15),
  ventaCompleta: 180 * (1 + (semana - 1) * 0.05), // ventas también escalan un poco
  penaltyExtra:  80,
  ventaMinima:   15,
});

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
  { id: 'primer_dia',    titulo: '¡Primer Día!',     desc: 'Completaste tu primer día.',               emoji: '🌮', req: (h) => h.diasCompletos >= 1              },
  { id: 'ahorrador',     titulo: 'Ahorrador',         desc: 'Tienes más de $300 en ahorro.',            emoji: '🏦', req: (h) => h.ahorroPersonal > 300             },
  { id: 'crypto_inicio', titulo: 'Criptonauta',       desc: 'Compraste tu primer BirriaCoin.',          emoji: '🪙', req: (h) => h.carteraCrypto > 0                },
  { id: 'racha_3',       titulo: '¡Racha x3!',        desc: '3 días completos seguidos.',               emoji: '🔥', req: (h) => h.rachaDias >= 3                   },
  { id: 'patrimonio_1k', titulo: 'Mil Pesos',         desc: 'Patrimonio supera $1,000.',                emoji: '💰', req: (h) => h.patrimonioTotal > 1000           },
  { id: 'mision_3',      titulo: 'Cumplidor',         desc: '3 misiones cumplidas.',                    emoji: '🎯', req: (h) => h.misionesCumplidas >= 3           },
  { id: 'sin_crashes',   titulo: 'Estable',           desc: '3 días sin llegar a efectivo bajo.',       emoji: '🧱', req: (h) => h.diasSinAlerta >= 3               },
  { id: 'riesgo_maestro',titulo: 'Jugador de Riesgo', desc: 'Ganaste 3 decisiones con baja prob.',      emoji: '🎰', req: (h) => (h.decisiones_riesgo_ganadas||0) >= 3 },
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

const buildInitialDecisions = () => getDecisionesParaDia(1, {
  efectivoNegocio: INITIAL_STATE.efectivoNegocio,
  ahorroPersonal:  INITIAL_STATE.ahorroPersonal,
  carteraCrypto:   INITIAL_STATE.carteraCrypto,
});

const initialGameState = {
  efectivoNegocio:     INITIAL_STATE.efectivoNegocio,
  ahorroPersonal:      INITIAL_STATE.ahorroPersonal,
  carteraCrypto:       INITIAL_STATE.carteraCrypto,
  precioBC:            INITIAL_STATE.precioBC,
  diaGlobal: 1, diaSemana: 1, semanaGlobal: 1,
  accionesRestantes:   GAME_CONFIG.accionesFinancierasPorDia,
  accionesUsadasHoy:   0,
  historial:           [],
  screen:              'game',
  popupConsejo:        null,
  colaPopups:          [],
  popupActual:         null,
  resumenSemana:       null,
  logrosObtenidos:     [],
  rachaDias:           0,
  diasCompletos:       0,
  misionesCumplidas:   0,
  diasSinAlerta:       0,
  misionHoy:           getMisionParaDia(1),
  eventoHoy:           null,
  donJoseFrase:        getDonJoseFrase('saludo_manana'),
  ahorroAlInicioDelDia: INITIAL_STATE.ahorroPersonal,
  _vendioHoy:          false,
  xpTotal:             0,
  conceptoDelDia:      null,
  glosarioDesbloqueado: [],
  decisiones_riesgo_ganadas: 0,
  ultimoResultadoRoguelike:  null,
  historialPrecios:    [INITIAL_STATE.precioBC],
};

// ── Reducer ───────────────────────────────────────────────────
function gameReducer(state, action) {
  switch (action.type) {

    case 'APLICAR_DECISION': {
      const { decision } = action;
      const resultado = resolverDecision(decision);
      const efecto    = resultado.efecto;
      let ef = state.efectivoNegocio, ah = state.ahorroPersonal, cr = state.carteraCrypto;
      let vendioHoy = state._vendioHoy;

      if (decision.esCryptoCompra && decision.montoCryptoCompra) {
        let monto = decision.montoCryptoCompra;
        const pagoEf = Math.min(monto, ef); ef -= pagoEf; monto -= pagoEf;
        if (monto > 0) { const pagoAh = Math.min(monto, ah); ah -= pagoAh; }
        cr += (decision.montoCryptoCompra - Math.max(0, monto)) / state.precioBC;
      } else if (decision.esCryptoCompraDesdeAhorro && decision.montoCryptoCompra) {
        const m = Math.min(decision.montoCryptoCompra, ah); ah -= m; cr += m / state.precioBC;
      } else if (decision.esCryptoVenta && decision.cantidadVenta) {
        const cant = Math.min(decision.cantidadVenta, cr); cr -= cant; ef += cant * state.precioBC;
        vendioHoy = true;
      } else {
        const deltaEf = efecto.deltaEfectivo || 0;
        if (deltaEf < 0) {
          const costo = Math.abs(deltaEf);
          const pagoEf = Math.min(costo, ef); ef -= pagoEf;
          const pagoAh = Math.min(costo - pagoEf, ah); ah -= pagoAh;
        } else {
          ef = Math.max(0, ef + deltaEf);
        }
        ah = Math.max(0, ah + (efecto.deltaAhorro || 0));
        cr = Math.max(0, cr + (efecto.deltaCrypto  || 0));
      }

      const esRiesgoAlto = decision.probabilidadExito < 0.50;
      const xpGanado = decision.esRecomendada
        ? XP_POR_ACCION.decision_recomendada
        : XP_POR_ACCION.decision_no_recomendada;
      const xpBonus = (esRiesgoAlto && resultado.exito) ? XP_POR_ACCION.decision_riesgo_ganado : 0;

      // Frase Don José
      let ctx = decision.esRecomendada ? 'decision_buena' : 'decision_mala';
      if (esRiesgoAlto && resultado.exito)  ctx = 'decision_riesgo_salio_bien';
      if (esRiesgoAlto && !resultado.exito) ctx = 'decision_riesgo_salio_mal';

      const newState = {
        ...state,
        efectivoNegocio: ef, ahorroPersonal: ah, carteraCrypto: cr,
        _vendioHoy: vendioHoy,
        accionesRestantes:  state.accionesRestantes - 1,
        accionesUsadasHoy:  state.accionesUsadasHoy + 1,
        xpTotal:            state.xpTotal + xpGanado + xpBonus,
        decisiones_riesgo_ganadas: (state.decisiones_riesgo_ganadas || 0) + (esRiesgoAlto && resultado.exito ? 1 : 0),
        historial: [...state.historial, {
          diaGlobal: state.diaGlobal, semanaGlobal: state.semanaGlobal,
          diaSemana: state.diaSemana, decision, resultado,
        }],
        donJoseFrase: getDonJoseFrase(ctx),
        ultimoResultadoRoguelike: {
          exito: resultado.exito, dado: resultado.dado,
          probabilidad: Math.round(decision.probabilidadExito * 100),
          etiqueta: resultado.efecto.label, esRiesgoAlto,
        },
      };

      // Bancarrota inmediata
      if (ef <= 0 && ah <= 0) return { ...newState, screen: 'bankrupt' };

      if (newState.accionesRestantes <= 0) return terminarDia(newState, true);
      return newState;
    }

    case 'FORZAR_FIN_DIA':
      return terminarDia({ ...state, donJoseFrase: getDonJoseFrase('cierre_temprano') }, false);

    case 'CERRAR_EVENTO':
      return { ...state, eventoHoy: null };

    case 'CERRAR_POPUP':
      return { ...state, popupConsejo: null };

    case 'POPUP_SIGUIENTE': {
      const cola = [...state.colaPopups];
      const siguiente = cola.shift();
      const nuevoGlosario = [...(state.glosarioDesbloqueado || [])];
      if (state.popupActual?.tipo === 'concepto' && state.popupActual?.data?.id) {
        if (!nuevoGlosario.includes(state.popupActual.data.id))
          nuevoGlosario.push(state.popupActual.data.id);
      }
      return { ...state, colaPopups: cola, popupActual: siguiente || null, glosarioDesbloqueado: nuevoGlosario };
    }

    case 'CERRAR_REPORTE_SEMANAL':
      return {
        ...state, screen: 'game', resumenSemana: null,
        decisionesDelDia: getDecisionesParaDia(state.diaGlobal, {
          efectivoNegocio: state.efectivoNegocio,
          ahorroPersonal:  state.ahorroPersonal,
          carteraCrypto:   state.carteraCrypto,
        }),
      };

    case 'REINICIAR':
      return { ...initialGameState, decisionesDelDia: buildInitialDecisions() };

    default: return state;
  }
}

// ── terminarDia ───────────────────────────────────────────────
function terminarDia(state, diaCompleto) {
  const costos = getCostosDinamicos(state.semanaGlobal);
  const costoFijo = diaCompleto
    ? costos.renta + costos.insumos
    : costos.renta + costos.insumos + costos.penaltyExtra;

  // Ventas proporcionales + eventos
  const eventoMult = state.eventoHoy ? (state.eventoHoy.impactoVentas || 1) : 1;
  const accionesUsadas = state.accionesUsadasHoy || 0;
  const proporcion = diaCompleto
    ? 1
    : Math.max(costos.ventaMinima / costos.ventaCompleta, Math.pow(accionesUsadas / GAME_CONFIG.accionesFinancierasPorDia, 1.5));

  const bonusVentasAcumulado = state.historial
    .filter(h => h.diaGlobal === state.diaGlobal && h.resultado?.efecto?.bonusVentas)
    .reduce((acc, h) => acc + (h.resultado.efecto.bonusVentas || 0), 0);

  const ventasBase = costos.ventaCompleta * proporcion * eventoMult * (1 + Math.random() * 0.20 - 0.05);
  const ventas     = Math.max(costos.ventaMinima, ventasBase * (1 + bonusVentasAcumulado));
  const neto       = ventas - costoFijo;

  const efectoEvento  = state.eventoHoy ? (state.eventoHoy.impactoEfectivo || 0) : 0;
  const nuevoEf       = Math.max(0, state.efectivoNegocio + neto + efectoEvento);

  // Misión
  const misionCumplida = verificarMision(state.misionHoy, state, diaCompleto, state.ahorroAlInicioDelDia);
  let efConRecompensa = nuevoEf;
  let crConRecompensa = state.carteraCrypto;
  if (misionCumplida && state.misionHoy) {
    const r = state.misionHoy.recompensa;
    if (r.tipo === 'efectivo') efConRecompensa += r.cantidad;
    if (r.tipo === 'crypto')   crConRecompensa += r.cantidad;
  }

  // XP
  const xpDia = (diaCompleto ? XP_POR_ACCION.dia_completo_bonus : 0)
              + (misionCumplida ? XP_POR_ACCION.mision_cumplida_bonus : 0);
  const nuevoXPTotal = (state.xpTotal || 0) + xpDia;
  const subioNivel   = getNivelActual(nuevoXPTotal).nivel > getNivelActual(state.xpTotal || 0).nivel;

  // Precio BirriaCoin — volatilidad blockchain realista
  const t = Math.random();
  let nuevoPrecio = state.precioBC * (0.82 + t * 0.52); // rango: -18% a +34%
  let noticiaDeHoy = null;
  if (Math.random() <= GAME_CONFIG.probabilidadNoticia) {
    noticiaDeHoy = NOTICIAS_BARRIO[Math.floor(Math.random() * NOTICIAS_BARRIO.length)];
    nuevoPrecio *= (1 + noticiaDeHoy.cambioPorcentualPrecio);
  }
  nuevoPrecio = Math.min(Math.max(nuevoPrecio, GAME_CONFIG.precioMinimo), GAME_CONFIG.precioMaximo);
  const nuevoHistorialPrecios = [...(state.historialPrecios || [state.precioBC]), nuevoPrecio].slice(-14);

  // Frase Don José
  const cambioBC = nuevoPrecio - state.precioBC;
  let ctxFrase = diaCompleto ? 'dia_completo' : 'cierre_temprano';
  if (misionCumplida) ctxFrase = 'mision_cumplida';
  if (Math.abs(cambioBC / state.precioBC) > 0.2) ctxFrase = cambioBC > 0 ? 'crypto_sube' : 'crypto_baja';
  if (efConRecompensa < 100) ctxFrase = 'alerta_dinero';
  const donJoseFrase = getDonJoseFrase(ctxFrase);

  // Calendario
  const nuevoDiaGlobal = state.diaGlobal + 1;
  let nuevoDiaSemana   = state.diaSemana + 1;
  let nuevaSemana      = state.semanaGlobal;
  let semanaTerminada  = false;
  let resumenSemana    = null;

  if (nuevoDiaSemana > GAME_CONFIG.diasPorSemana) {
    semanaTerminada  = true;
    nuevoDiaSemana   = 1;
    nuevaSemana      = state.semanaGlobal + 1;
    const histSem    = state.historial.filter(h => h.semanaGlobal === state.semanaGlobal);
    resumenSemana    = calcularResumenSemana(state.historial, state.semanaGlobal, efConRecompensa, state.ahorroPersonal, histSem);
  }

  // ── CHECK DE SUPERVIVENCIA ──
  // Capital mínimo escala suavemente: semana 1 = $50, semana 2 = $80, semana 3 = $110…
  // Score mínimo escala: semana 1 = 40%, semana 2 = 50%, semana 3+ = 55%
  const CAPITAL_MIN  = 30 + (state.semanaGlobal * 20);
  const SCORE_MIN    = Math.min(0.55, 0.35 + state.semanaGlobal * 0.075);
  const histSemCheck = state.historial.filter(h => h.semanaGlobal === state.semanaGlobal);
  const decConRes    = histSemCheck.filter(h => h.resultado);
  const exitosPct    = decConRes.length > 0
    ? decConRes.filter(h => h.resultado.exito).length / decConRes.length
    : 1.0;
  const fallaSupervivencia = semanaTerminada
    && (efConRecompensa < CAPITAL_MIN || exitosPct < SCORE_MIN);

  // Logros
  const nuevaRacha    = diaCompleto ? (state.rachaDias || 0) + 1 : 0;
  const diasCompletos = (state.diasCompletos || 0) + (diaCompleto ? 1 : 0);
  const misionesCumpl = (state.misionesCumplidas || 0) + (misionCumplida ? 1 : 0);
  const sinAlerta     = efConRecompensa >= 100 && state.ahorroPersonal > 0;
  const diasSinAlerta = sinAlerta ? (state.diasSinAlerta || 0) + 1 : 0;
  const patrimonioTotal = efConRecompensa + state.ahorroPersonal + (crConRecompensa * nuevoPrecio);

  const statsActuales = {
    rachaDias: nuevaRacha, diasCompletos, ahorroPersonal: state.ahorroPersonal,
    carteraCrypto: crConRecompensa, patrimonioTotal, misionesCumplidas: misionesCumpl,
    diasSinAlerta, decisiones_riesgo_ganadas: state.decisiones_riesgo_ganadas || 0,
  };
  const nuevosLogros = verificarLogros(statsActuales, state.logrosObtenidos);
  const logrosObtIds = [...state.logrosObtenidos, ...nuevosLogros.map(l => l.id)];

  // Concepto del día
  const conceptoHoy = getConceptoDelDia(state.historial.filter(h => h.diaGlobal === state.diaGlobal));

  // Feedback estructurado compatible con PopupManager
  const bonusPct = Math.round(bonusVentasAcumulado * 100);
  const decisionesHoy = state.historial.filter(h => h.diaGlobal === state.diaGlobal && h.resultado);
  const exitosHoy = decisionesHoy.filter(h => h.resultado.exito).length;
  const feedbackData = {
    titulo: diaCompleto
      ? (misionCumplida ? '🎯 ¡Misión cumplida!' : '✅ ¡Buen día, Don José!')
      : (accionesUsadas === 0 ? '😴 Don José no trabajó' : '⏰ Día incompleto'),
    tipo: neto >= 0 ? 'bueno' : 'malo',
    detalles: [
      {
        icon: neto >= 0 ? '📈' : '📉',
        label: 'Resultado del día',
        value: `${neto >= 0 ? '+' : ''}$${neto.toFixed(0)}`,
        color: neto >= 0 ? '#4a9e4a' : '#c0392b',
        sub: `Ventas $${ventas.toFixed(0)} — Costos $${costoFijo.toFixed(0)}${bonusPct > 0 ? ` (+${bonusPct}% bonos)` : ''}`,
      },
      ...(decisionesHoy.length > 0 ? [{
        icon: '🎲',
        label: 'Decisiones',
        value: `${exitosHoy}/${decisionesHoy.length} exitosas`,
        color: exitosHoy >= decisionesHoy.length / 2 ? '#4a9e4a' : '#d4901a',
        sub: exitosHoy === decisionesHoy.length ? '¡Todas salieron bien!' : 'El mercado fue mixto hoy.',
      }] : []),
      ...(misionCumplida && state.misionHoy ? [{
        icon: '🎯', label: `Misión: ${state.misionHoy.titulo}`,
        value: state.misionHoy.recompensaLabel, color: '#b5820a', sub: '¡Bonus aplicado!',
      }] : []),
      ...(noticiaDeHoy ? [{
        icon: '📰', label: 'Noticias del barrio',
        value: `BC ${noticiaDeHoy.cambioPorcentualPrecio >= 0 ? '+' : ''}${(noticiaDeHoy.cambioPorcentualPrecio * 100).toFixed(0)}%`,
        color: noticiaDeHoy.cambioPorcentualPrecio >= 0 ? '#4a9e4a' : '#c0392b',
        sub: noticiaDeHoy.titulo,
      }] : []),
    ],
    patrimonioTotal: efConRecompensa + state.ahorroPersonal + (crConRecompensa * nuevoPrecio),
    concepto: conceptoHoy,
  };

  // Cola de popups (feedback siempre primero)
  const cola = [{ tipo: 'feedback', data: feedbackData }];
  if (subioNivel)             cola.push({ tipo: 'nivel',    data: getNivelActual(nuevoXPTotal) });
  else if (nuevosLogros[0])   cola.push({ tipo: 'logro',    data: nuevosLogros[0] });
  if (conceptoHoy)            cola.push({ tipo: 'concepto', data: conceptoHoy });

  const [primero, ...resto] = cola;
  const hayBancarrota = (efConRecompensa <= 0 && state.ahorroPersonal <= 0) || fallaSupervivencia;

  return {
    ...state,
    efectivoNegocio:   efConRecompensa,
    carteraCrypto:     crConRecompensa,
    precioBC:          nuevoPrecio,
    noticiaDeHoy,
    historialPrecios:  nuevoHistorialPrecios,
    diaGlobal:         nuevoDiaGlobal,
    diaSemana:         nuevoDiaSemana,
    semanaGlobal:      nuevaSemana,
    accionesRestantes: GAME_CONFIG.accionesFinancierasPorDia,
    accionesUsadasHoy: 0,
    _vendioHoy:        false,
    decisionesDelDia:  getDecisionesParaDia(nuevoDiaGlobal, {
      efectivoNegocio: efConRecompensa,
      ahorroPersonal:  state.ahorroPersonal,
      carteraCrypto:   crConRecompensa,
    }),
    screen: hayBancarrota ? 'bankrupt' : semanaTerminada ? 'weekly_report' : 'game',
    resumenSemana,
    colaPopups:    resto,
    popupActual:   primero || null,
    rachaDias:     nuevaRacha,
    diasCompletos,
    logrosObtenidos: logrosObtIds,
    misionesCumplidas: misionesCumpl,
    diasSinAlerta,
    donJoseFrase,
    misionHoy:     getMisionParaDia(nuevoDiaGlobal),
    eventoHoy:     getEventoAleatorio(),
    ahorroAlInicioDelDia: state.ahorroPersonal,
    ultimoResultadoRoguelike: null,
    xpTotal:       nuevoXPTotal,
    conceptoDelDia: conceptoHoy,
  };
}

function calcularResumenSemana(historial, semanaGlobal, efectivo, ahorro, historialSemana) {
  const r   = historial.filter(h => h.semanaGlobal === semanaGlobal);
  const rec = r.filter(h => h.decision.esRecomendada).length;
  return {
    semanaGlobal,
    totalDecisiones:       r.length,
    totalRecomendadas:     rec,
    totalNoRecomendadas:   r.length - rec,
    porcentajeRecomendadas: r.length > 0 ? rec / r.length : 0,
    efectivoFinal:  efectivo,
    ahorroFinal:    ahorro,
    contrafactual:  generarContrafactual(historialSemana),
    historialSemana,
  };
}

// ── Context ───────────────────────────────────────────────────
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialGameState,
    decisionesDelDia: buildInitialDecisions(),
  });

  const aplicarDecision      = useCallback((d) => dispatch({ type: 'APLICAR_DECISION',      decision: d }), []);
  const forzarFinDeDia       = useCallback(()  => dispatch({ type: 'FORZAR_FIN_DIA'                    }), []);
  const cerrarPopup          = useCallback(()  => dispatch({ type: 'CERRAR_POPUP'                      }), []);
  const cerrarEvento         = useCallback(()  => dispatch({ type: 'CERRAR_EVENTO'                     }), []);
  const avanzarPopup         = useCallback(()  => dispatch({ type: 'POPUP_SIGUIENTE'                   }), []);
  const cerrarReporteSemanal = useCallback(()  => dispatch({ type: 'CERRAR_REPORTE_SEMANAL'            }), []);
  const reiniciar            = useCallback(()  => dispatch({ type: 'REINICIAR'                         }), []);

  const estadoAnimo = getEstadoAnimo(
    state.efectivoNegocio, state.ahorroPersonal, state.carteraCrypto, state.precioBC
  );

  return (
    <GameContext.Provider value={{
      state, estadoAnimo,
      aplicarDecision, forzarFinDeDia, cerrarPopup, cerrarEvento,
      avanzarPopup, cerrarReporteSemanal, reiniciar,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
};
