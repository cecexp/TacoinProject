import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {
  INITIAL_STATE, GAME_CONFIG, NOTICIAS_BARRIO, getDecisionesParaDia,
  getMisionParaDia, getEventoAleatorio, getDonJoseFrase,
  XP_POR_ACCION, getNivelActual, getConceptoDelDia,
} from '../data/gameData';

const COSTOS = {
  renta: 40,
  insumos: 30,
  ventaCompleta: 180,
  // Cerrar antes: costos extra por "desperdiciar" el día
  penaltyExtra: 60,    // multa adicional por no trabajar completo
  ventaMinima: 20,     // ventas mínimas aunque cierres (ya compraste insumos)
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
];

function verificarLogros(stats, logrosObtenidos) {
  return LOGROS.filter(l => !logrosObtenidos.includes(l.id) && l.req(stats));
}

// ── Verificar si la misión fue cumplida ───────────────────────
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

// ── Estado inicial ────────────────────────────────────────────
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
  // Nuevos campos
  misionHoy: getMisionParaDia(1),
  eventoHoy: null,
  donJoseFrase: getDonJoseFrase('saludo_manana'),
  ahorroAlInicioDelDia: 200,
  _vendioHoy: false,
  xpTotal: 0,
  conceptoDelDia: null,
  glosarioDesbloqueado: [],
};

// ── Reducer ───────────────────────────────────────────────────
function gameReducer(state, action) {
  switch (action.type) {

    case 'APLICAR_DECISION': {
      const { decision } = action;
      let ef = state.efectivoNegocio, ah = state.ahorroPersonal, cr = state.carteraCrypto;
      let vendioHoy = state._vendioHoy;

      if (decision.esCryptoCompra && decision.montoCryptoCompra) {
        // Paga con efectivo primero, luego ahorro si falta
        let monto = decision.montoCryptoCompra;
        const pagoEf = Math.min(monto, ef);
        ef -= pagoEf; monto -= pagoEf;
        if (monto > 0) { const pagoAh = Math.min(monto, ah); ah -= pagoAh; monto -= pagoAh; }
        const gastado = decision.montoCryptoCompra - monto;
        cr += gastado / state.precioBC;
      } else if (decision.esCryptoCompraDesdeAhorro && decision.montoCryptoCompra) {
        const m = Math.min(decision.montoCryptoCompra, ah); ah -= m; cr += m / state.precioBC;
      } else if (decision.esCryptoVenta && decision.cantidadVenta) {
        const cant = Math.min(decision.cantidadVenta, cr); cr -= cant; ef += cant * state.precioBC;
        vendioHoy = true;
      } else {
        // Para gastos: paga con efectivo primero, luego ahorro si falta
        const deltaEf = decision.deltaEfectivo || 0;
        if (deltaEf < 0) {
          const costo = Math.abs(deltaEf);
          const pagoEf = Math.min(costo, ef);
          ef -= pagoEf;
          const pagoAh = Math.min(costo - pagoEf, ah);
          ah -= pagoAh;
        } else {
          ef = Math.max(0, ef + deltaEf);
        }
        ah = Math.max(0, ah + (decision.deltaAhorro || 0));
        cr = Math.max(0, cr + (decision.deltaCrypto || 0));
      }

      const historial = [...state.historial, {
        diaGlobal: state.diaGlobal, diaSemana: state.diaSemana,
        semanaGlobal: state.semanaGlobal, decision,
      }];
      const accionesRestantes = state.accionesRestantes - 1;
      const accionesUsadasHoy = state.accionesUsadasHoy + 1;
      const hayBancarrota = ef <= 0 && ah <= 0;

      // Frase Don José según decisión
      const frase = getDonJoseFrase(decision.esRecomendada ? 'decision_buena' : 'decision_mala');
      const xpGanado = decision.esRecomendada ? XP_POR_ACCION.decision_recomendada : XP_POR_ACCION.decision_no_recomendada;
      const nuevoXP = (state.xpTotal || 0) + xpGanado;
      const nivelAntes = getNivelActual(state.xpTotal || 0).nivel;
      const nivelDespues = getNivelActual(nuevoXP).nivel;
      const subioNivel = nivelDespues > nivelAntes;
      const newState = {
        ...state,
        efectivoNegocio: ef, ahorroPersonal: ah, carteraCrypto: cr,
        historial, accionesRestantes: Math.max(0, accionesRestantes),
        accionesUsadasHoy, _vendioHoy: vendioHoy,
        screen: hayBancarrota ? 'bankrupt' : 'game',
        donJoseFrase: frase,
        xpTotal: nuevoXP,
      };
      // nivel se muestra al fin del dia, no durante decisiones intermedias

      if (accionesRestantes <= 0 && !hayBancarrota) {
        return terminarDia({ ...newState }, true, null);
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
      // Si cerramos un popup de concepto, agregar al glosario
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

    case 'CERRAR_REPORTE_SEMANAL':
      return { ...state, screen: 'game', resumenSemana: null,
        decisionesDelDia: getDecisionesParaDia(state.diaGlobal) };

    case 'REINICIAR':
      return { ...initialGameState, decisionesDelDia: getDecisionesParaDia(1) };

    default: return state;
  }
}

// ── Fin de día ────────────────────────────────────────────────
function terminarDia(state, diaCompleto) {
  // Día completo: costos normales. Cierre anticipado: costos + penalización
  const costoFijo = diaCompleto
    ? COSTOS.renta + COSTOS.insumos
    : COSTOS.renta + COSTOS.insumos + COSTOS.penaltyExtra; // insumos comprados, equipo movilizado

  // Evento sorpresa afecta ventas
  const eventoMult = state.eventoHoy ? (state.eventoHoy.impactoVentas || 1) : 1;
  const accionesUsadas = state.accionesUsadasHoy || 0;
  const totalAcciones  = GAME_CONFIG.accionesFinancierasPorDia;
  // Cierre anticipado: ventas proporcionales pero con degradación agresiva
  // 0 acciones = 0 ventas, 1 acción = 25% ventas, 2 acciones = 55% ventas, completo = 100%
  const proporcionRaw = diaCompleto ? 1 : Math.pow(accionesUsadas / totalAcciones, 1.5);
  const proporcion    = diaCompleto ? 1 : Math.max(COSTOS.ventaMinima / COSTOS.ventaCompleta, proporcionRaw);
  const ventas     = Math.max(COSTOS.ventaMinima, COSTOS.ventaCompleta * proporcion * eventoMult * (1 + Math.random() * 0.25 - 0.05));
  const neto       = ventas - costoFijo;

  // Efecto directo del evento en efectivo
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
  // No local re-declare accionesUsadas, already set above
  const xpDia = (diaCompleto ? XP_POR_ACCION.dia_completo_bonus : 0) + (misionCumplida ? XP_POR_ACCION.mision_cumplida_bonus : 0);
  const nuevoXPTotal = (state.xpTotal || 0) + xpDia;
  const nivelAntesFinDia = getNivelActual(state.xpTotal || 0).nivel;
  const nivelDespuesFinDia = getNivelActual(nuevoXPTotal).nivel;
  const subioNivelHoy = nivelDespuesFinDia > nivelAntesFinDia;

  // Concepto del día
  const conceptoHoy = getConceptoDelDia(state.historial.filter(h => h.diaGlobal === state.diaGlobal));

  // Crypto precio
  const t = Math.random();
  let nuevoPrecio = state.precioBC * lerp(1 + GAME_CONFIG.volatilidadMin, 1 + GAME_CONFIG.volatilidadMax, t);
  let noticiaDeHoy = null;
  if (Math.random() <= GAME_CONFIG.probabilidadNoticia) {
    noticiaDeHoy = NOTICIAS_BARRIO[Math.floor(Math.random() * NOTICIAS_BARRIO.length)];
    nuevoPrecio *= (1 + noticiaDeHoy.cambioPorcentualPrecio);
  }
  nuevoPrecio = Math.min(Math.max(nuevoPrecio, GAME_CONFIG.precioMinimo), GAME_CONFIG.precioMaximo);

  // Frase Don José por resultado del día
  const cambioBC = nuevoPrecio - state.precioBC;
  let contextoFrase = diaCompleto ? 'dia_completo' : 'cierre_temprano';
  if (misionCumplida) contextoFrase = 'mision_cumplida';
  if (Math.abs(cambioBC / state.precioBC) > 0.2) {
    contextoFrase = cambioBC > 0 ? 'crypto_sube' : 'crypto_baja';
  }
  if (efConRecompensa < 100) contextoFrase = 'alerta_dinero';
  const donJoseFrase = getDonJoseFrase(contextoFrase);

  // Calendario
  const nuevoDiaGlobal = state.diaGlobal + 1;
  let nuevoDiaSemana = state.diaSemana + 1;
  let nuevaSemana    = state.semanaGlobal;
  let semanaTerminada = false, resumenSemana = null;
  if (nuevoDiaSemana > GAME_CONFIG.diasPorSemana) {
    semanaTerminada = true;
    resumenSemana = calcularResumenSemana(state.historial, state.semanaGlobal, efConRecompensa, state.ahorroPersonal);
    nuevoDiaSemana = 1; nuevaSemana = state.semanaGlobal + 1;
  }

  // Stats logros
  const nuevaRacha       = diaCompleto ? (state.rachaDias || 0) + 1 : 0;
  const diasCompletos    = (state.diasCompletos || 0) + (diaCompleto ? 1 : 0);
  const misionesCumplidas= (state.misionesCumplidas || 0) + (misionCumplida ? 1 : 0);
  const sinAlerta        = efConRecompensa >= 100 && state.ahorroPersonal > 0;
  const diasSinAlerta    = sinAlerta ? (state.diasSinAlerta || 0) + 1 : 0;
  const patrimonioTotal  = efConRecompensa + state.ahorroPersonal + (crConRecompensa * nuevoPrecio);

  const statsActuales = { rachaDias: nuevaRacha, diasCompletos, ahorroPersonal: state.ahorroPersonal, carteraCrypto: crConRecompensa, patrimonioTotal, misionesCumplidas, diasSinAlerta };
  const nuevosLogros  = verificarLogros(statsActuales, state.logrosObtenidos);
  const logrosObtIds  = [...state.logrosObtenidos, ...nuevosLogros.map(l => l.id)];

  // ── Cola de popups — máximo 2 por día ──────────────────────
  // Regla: el feedback siempre incluye todo (misión, evento, concepto, noticia).
  // Solo agregamos UN segundo popup si hay algo verdaderamente especial
  // (subiste de nivel o desbloqueaste un logro). Nada más.
  const feedbackData = generarFeedback(
    diaCompleto, state.accionesUsadasHoy || 0, GAME_CONFIG.accionesFinancierasPorDia,
    neto + efectoEvento, ventas, costoFijo,
    state.efectivoNegocio, efConRecompensa, state.ahorroPersonal,
    crConRecompensa, nuevoPrecio, misionCumplida, state.misionHoy,
    state.eventoHoy, noticiaDeHoy, conceptoHoy
  );

  const cola = [];
  cola.push({ tipo: 'feedback', data: feedbackData });

  // Solo 1 popup extra: nivel > logro (el más impactante gana)
  if (subioNivelHoy) {
    cola.push({ tipo: 'nivel', data: getNivelActual(nuevoXPTotal) });
  } else if (nuevosLogros.length > 0) {
    cola.push({ tipo: 'logro', data: nuevosLogros[0] }); // solo el primero
  }

  const [primero, ...resto] = cola;
  const hayBancarrota = efConRecompensa <= 0 && state.ahorroPersonal <= 0;

  // Nuevo evento para mañana
  const eventoManana = getEventoAleatorio();
  const misionManana = getMisionParaDia(nuevoDiaGlobal);

  return {
    ...state,
    efectivoNegocio: efConRecompensa, carteraCrypto: crConRecompensa,
    precioBC: nuevoPrecio, noticiaDeHoy,
    diaGlobal: nuevoDiaGlobal, diaSemana: nuevoDiaSemana, semanaGlobal: nuevaSemana,
    accionesRestantes: GAME_CONFIG.accionesFinancierasPorDia, accionesUsadasHoy: 0,
    _vendioHoy: false,
    decisionesDelDia: getDecisionesParaDia(nuevoDiaGlobal),
    screen: hayBancarrota ? 'bankrupt' : semanaTerminada ? 'weekly_report' : 'game',
    resumenSemana,
    rachaDias: nuevaRacha, diasCompletos, logrosObtenidos: logrosObtIds,
    misionesCumplidas, diasSinAlerta,
    colaPopups: resto, popupActual: primero || null,
    noticiaVisible: null, feedbackDia: null,
    xpTotal: nuevoXPTotal,
    conceptoDelDia: conceptoHoy,
    donJoseFrase,
    misionHoy: eventoManana ? { ...misionManana, _eventoActivo: true } : misionManana,
    eventoHoy: eventoManana,
    ahorroAlInicioDelDia: state.ahorroPersonal,
  };
}

function generarFeedback(diaCompleto, accionesUsadas, totalAcciones, neto, ventas, costos, efAntes, efDespues, ahorro, crypto, precioBC, misionCumplida, mision, evento, noticia, concepto) {
  const gano = neto >= 0;
  const patrimonioTotal = efDespues + ahorro + (crypto * precioBC);
  // Máximo 4 filas de detalle — solo lo más importante
  const detalles = [];

  // 1. Resultado del día (siempre)
  detalles.push({
    icon: gano ? '📈' : '📉',
    label: 'Resultado del día',
    value: `${gano ? '+' : ''}$${neto.toFixed(0)}`,
    color: gano ? '#4a9e4a' : '#c0392b',
    sub: diaCompleto ? `Ventas $${ventas.toFixed(0)} — Costos $${costos.toFixed(0)}` : `Solo ${accionesUsadas}/${totalAcciones} turnos — ventas reducidas`,
  });

  // 2. Misión (solo si es relevante)
  if (mision && misionCumplida) {
    detalles.push({ icon: '🎯', label: `Misión: ${mision.titulo}`, value: mision.recompensaLabel, color: '#b5820a', sub: '¡Bonus aplicado!' });
  } else if (mision && !misionCumplida && !diaCompleto) {
    detalles.push({ icon: '😔', label: `Misión fallida`, value: 'Sin bonus', color: '#8c7c6e', sub: mision.consejo });
  }

  // 3. Evento del día (si hubo)
  if (evento) {
    const impactoStr = evento.impactoEfectivo !== 0
      ? `${evento.impactoEfectivo > 0 ? '+' : ''}$${evento.impactoEfectivo}`
      : `Ventas x${evento.impactoVentas}`;
    detalles.push({
      icon: evento.icono,
      label: 'Evento del día',
      value: impactoStr,
      color: evento.tipo === 'bueno' ? '#4a9e4a' : evento.tipo === 'malo' ? '#c0392b' : '#d4901a',
      sub: evento.leccionFinanciera,
    });
  }

  // 4. Noticia de BC (si hubo — solo el impacto, sin popup separado)
  if (noticia) {
    const esBuena = noticia.cambioPorcentualPrecio >= 0;
    const pct = Math.abs(noticia.cambioPorcentualPrecio * 100).toFixed(0);
    detalles.push({
      icon: '📰',
      label: 'Noticias del barrio',
      value: `BC ${esBuena ? '+' : '-'}${pct}%`,
      color: esBuena ? '#4a9e4a' : '#c0392b',
      sub: noticia.titulo,
    });
  }

  let titulo, tipo;
  if (!diaCompleto && accionesUsadas === 0) { titulo = '😴 Don José no trabajó'; tipo = 'malo'; }
  else if (!diaCompleto) { titulo = '⏰ Día incompleto'; tipo = 'advertencia'; }
  else if (misionCumplida) { titulo = '🎯 ¡Misión cumplida!'; tipo = 'bueno'; }
  else if (gano) { titulo = '✅ ¡Buen día, Don José!'; tipo = 'bueno'; }
  else { titulo = '📉 Día difícil'; tipo = 'malo'; }

  // Concepto financiero — se muestra al pie del mismo popup, no en uno separado
  return { titulo, tipo, detalles, patrimonioTotal, concepto };
}

function calcularResumenSemana(historial, semanaGlobal, efectivo, ahorro) {
  const r = historial.filter(h => h.semanaGlobal === semanaGlobal);
  const total = r.length, rec = r.filter(h => h.decision.esRecomendada).length;
  return { semanaGlobal, totalDecisiones: total, totalRecomendadas: rec, totalNoRecomendadas: total - rec, porcentajeRecomendadas: total > 0 ? rec / total : 0, efectivoFinal: efectivo, ahorroFinal: ahorro };
}

function lerp(a, b, t) { return a + (b - a) * t; }

// ── Context ───────────────────────────────────────────────────
const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialGameState, decisionesDelDia: getDecisionesParaDia(1),
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
