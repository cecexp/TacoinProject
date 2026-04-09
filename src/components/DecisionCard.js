import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useGame } from '../context/GameContext';

// ── Tendencia + volatilidad de BirriaCoin ──────────────────────
function useBCStats(historialPrecios, precioBC) {
  const hist = historialPrecios || [precioBC];
  if (hist.length < 2) return { tendLabel: '—', tendColor: '#8c7c6e', tendIcon: '➡️', volLabel: '—', volColor: '#8c7c6e' };

  const n = hist.length;
  const desde = hist[Math.max(0, n - 6)];
  const hasta = hist[n - 1];
  const cambio = ((hasta - desde) / desde) * 100;

  const retornos = [];
  for (let i = 1; i < n; i++) retornos.push((hist[i] - hist[i-1]) / hist[i-1]);
  const media = retornos.reduce((a,b) => a+b, 0) / retornos.length;
  const std = Math.sqrt(retornos.reduce((a,r) => a + Math.pow(r-media,2), 0) / retornos.length) * 100;

  const tendIcon  = cambio > 3 ? '📈' : cambio < -3 ? '📉' : '➡️';
  const tendLabel = cambio > 0 ? `+${cambio.toFixed(1)}%` : `${cambio.toFixed(1)}%`;
  const tendColor = cambio > 3 ? '#4a9e4a' : cambio < -3 ? '#c0392b' : '#d4901a';
  const volLabel  = std < 5 ? 'vol. baja' : std < 12 ? 'vol. media' : 'vol. ALTA';
  const volColor  = std < 5 ? '#4a9e4a'  : std < 12 ? '#d4901a'   : '#c0392b';

  return { tendLabel, tendColor, tendIcon, volLabel, volColor };
}

// ── Formateo del impacto financiero de la decisión ─────────────
function getImpacto(decision) {
  const ex = decision.efectoExito;
  if (!ex) return null;

  // Costo
  const costo = decision.costoEjecutar || Math.abs(Math.min(0, ex.deltaEfectivo || 0));

  // Ganancia / pérdida esperada
  if (ex.bonusVentas > 0) {
    const pct = Math.round(ex.bonusVentas * 100);
    return { costo, ganancia: `+${pct}% ventas`, esPositivo: true };
  }
  if (ex.deltaEfectivo > 0) {
    return { costo: 0, ganancia: `+$${ex.deltaEfectivo}`, esPositivo: true };
  }
  if (ex.deltaAhorro > 0) {
    return { costo, ganancia: `→ ahorro +$${ex.deltaAhorro}`, esPositivo: true };
  }
  if (ex.deltaAhorro < 0 && ex.deltaEfectivo === 0) {
    return { costo: Math.abs(ex.deltaAhorro), ganancia: 'desde ahorro', esPositivo: false };
  }
  return { costo, ganancia: null, esPositivo: false };
}

export default function DecisionCard({ decision, onPress, disabled }) {
  const { state } = useGame();
  const { efectivoNegocio, ahorroPersonal, carteraCrypto, precioBC, historialPrecios } = state;
  const capitalTotal = efectivoNegocio + ahorroPersonal;
  const bcStats = useBCStats(historialPrecios, precioBC);

  // ── Puede ejecutar? ──────────────────────────────────────────
  const puedeEjecutar = (() => {
    if (decision.esCryptoCompra)            return capitalTotal     >= (decision.montoCryptoCompra || 0);
    if (decision.esCryptoCompraDesdeAhorro) return ahorroPersonal   >= (decision.montoCryptoCompra || 0);
    if (decision.esCryptoVenta)             return carteraCrypto    >= (decision.cantidadVenta     || 0);
    const costo = Math.abs(Math.min(0, decision.deltaEfectivo || 0)) || (decision.costoEjecutar || 0);
    return costo === 0 || capitalTotal >= costo;
  })();

  const bloq       = !puedeEjecutar;
  const estaDisab  = disabled || bloq;
  const esCrypto   = decision.categoria === 'crypto';

  // ── Colores ──────────────────────────────────────────────────
  const accentColor = (() => {
    if (bloq)     return '#b8b0a4';
    if (esCrypto) return '#8b1a1a';
    const delta = decision.efectoExito?.deltaEfectivo || decision.deltaEfectivo || 0;
    if (delta > 0)                          return '#4a9e4a';
    if (decision.efectoExito?.bonusVentas > 0) return '#4a9e4a';
    if (delta < 0)                          return '#c0392b';
    return '#8c7c6e';
  })();

  const badgeInfo = (() => {
    if (bloq)                              return { txt: 'BLOQUEADO', bg: '#b8b0a4' };
    if (esCrypto)                          return { txt: 'CRYPTO',    bg: '#8b1a1a' };
    if (decision.categoria === 'ahorro')   return { txt: 'AHORRO',    bg: '#1a6fb5' };
    return                                        { txt: 'NEGOCIO',   bg: '#4a9e4a' };
  })();

  // ── Probabilidad ─────────────────────────────────────────────
  const pct      = Math.round((decision.probabilidadExito || 1) * 100);
  const pctColor = pct >= 70 ? '#4a9e4a' : pct >= 50 ? '#d4901a' : '#c0392b';
  const esGarant = decision.probabilidadExito >= 1.0;

  // ── Impacto financiero compacto ───────────────────────────────
  const impacto = bloq ? null : getImpacto(decision);

  // ── Datos crypto relevantes ───────────────────────────────────
  const monto = decision.montoCryptoCompra || (decision.cantidadVenta ? decision.cantidadVenta * precioBC : null);
  const bcActuales = carteraCrypto > 0 ? `Tienes ${carteraCrypto.toFixed(2)} BC` : null;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: accentColor },
        bloq                          && styles.cardBloq,
        estaDisab && !bloq            && { opacity: 0.4 },
      ]}
      onPress={() => !estaDisab && onPress(decision)}
      disabled={estaDisab}
      activeOpacity={0.7}
    >
      <View style={styles.row}>
        {/* ── Contenido ── */}
        <View style={styles.content}>

          {/* Fila 1: badge + prob + crypto‑pill */}
          <View style={styles.topRow}>
            <View style={[styles.badge, { backgroundColor: badgeInfo.bg }]}>
              <Text style={styles.badgeTxt}>{badgeInfo.txt}</Text>
            </View>

            {!bloq && (
              esGarant
                ? <Text style={styles.garantizado}>✅ Garantizado</Text>
                : <Text style={[styles.prob, { color: pctColor }]}>{pct}% éxito</Text>
            )}

            {/* Stats de BC inline si es carta crypto */}
            {esCrypto && !bloq && (
              <View style={styles.bcPill}>
                <Text style={[styles.bcTend, { color: bcStats.tendColor }]}>
                  {bcStats.tendIcon} {bcStats.tendLabel}
                </Text>
                <Text style={styles.bcSep}>·</Text>
                <Text style={[styles.bcVol, { color: bcStats.volColor }]}>{bcStats.volLabel}</Text>
              </View>
            )}
          </View>

          {/* Fila 2: título */}
          <Text
            style={[styles.titulo, bloq && { color: '#a89880' }]}
            numberOfLines={1}
          >
            {decision.titulo}
          </Text>

          {/* Fila 3: impacto financiero O alerta fondos */}
          {bloq ? (
            <Text style={styles.fondosAlert} numberOfLines={1}>
              🔒 Capital insuf. — tienes ${capitalTotal.toFixed(0)}
            </Text>
          ) : (
            <View style={styles.financRow}>
              {/* Costo */}
              {impacto && impacto.costo > 0 && (
                <View style={styles.chip}>
                  <Text style={styles.chipTxt}>💸 -${impacto.costo}</Text>
                </View>
              )}
              {/* Ganancia esperada */}
              {impacto && impacto.ganancia && (
                <View style={[styles.chip, { backgroundColor: impacto.esPositivo ? '#f0fdf4' : '#fef2f2', borderColor: impacto.esPositivo ? '#bbf7d0' : '#fecaca' }]}>
                  <Text style={[styles.chipTxt, { color: impacto.esPositivo ? '#15803d' : '#991b1b' }]}>
                    {impacto.ganancia}
                  </Text>
                </View>
              )}
              {/* Para crypto: precio actual + tenencia */}
              {esCrypto && (
                <>
                  <View style={styles.chip}>
                    <Text style={styles.chipTxt}>$BC {precioBC.toFixed(2)}</Text>
                  </View>
                  {bcActuales && (
                    <View style={styles.chip}>
                      <Text style={styles.chipTxt}>{bcActuales}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          )}

        </View>

        {/* ── Flecha ── */}
        <View style={[
          styles.arrow,
          { backgroundColor: bloq ? '#f0ece6' : accentColor + '18',
            borderColor:      bloq ? '#d8d2c4' : accentColor + '55' },
        ]}>
          <Text style={{ color: bloq ? '#b8b0a4' : accentColor, fontSize: 20, fontWeight: '800' }}>
            {bloq ? '🔒' : '›'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 12, borderWidth: 1, borderColor: '#e8e0d4', borderLeftWidth: 5,
    paddingVertical: 10, paddingHorizontal: 12, marginBottom: 8,
    shadowColor: '#8c7c6e', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  cardBloq: { opacity: 0.7, backgroundColor: 'rgba(245,242,235,0.9)' },

  row:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  content: { flex: 1, gap: 4 },

  topRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  badge:   { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  badgeTxt:{ color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1.1 },
  prob:    { fontSize: 11, fontWeight: '800' },
  garantizado: { fontSize: 10, color: '#4a9e4a', fontWeight: '700' },

  // BC pill — stats de tendencia y volatilidad
  bcPill:  { flexDirection: 'row', alignItems: 'center', gap: 4,
             backgroundColor: '#fdf0ec', borderRadius: 8,
             paddingHorizontal: 7, paddingVertical: 2,
             borderWidth: 1, borderColor: '#f0d4c8' },
  bcTend:  { fontSize: 10, fontWeight: '800' },
  bcSep:   { fontSize: 9, color: '#c8b8a8' },
  bcVol:   { fontSize: 9, fontWeight: '700' },

  titulo:  { fontSize: 14, fontWeight: '800', color: '#3a1a0a' },

  fondosAlert: { fontSize: 11, color: '#b5820a', fontWeight: '600' },

  // Chips de impacto financiero
  financRow: { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  chip:      { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
               backgroundColor: '#f5f2eb', borderWidth: 1, borderColor: '#e8e0d4' },
  chipTxt:   { fontSize: 10, fontWeight: '700', color: '#5a4a3e' },

  arrow: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, flexShrink: 0,
  },
});
