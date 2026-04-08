import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useGame } from '../context/GameContext';

// Barra de probabilidad con color semáforo
function BarraProbabilidad({ pct }) {
  const color = pct >= 70 ? '#4a9e4a' : pct >= 50 ? '#d4901a' : '#c0392b';
  const label = pct >= 70 ? 'Alta' : pct >= 50 ? 'Media' : 'Baja';
  return (
    <View style={bp.wrap}>
      <View style={bp.row}>
        <Text style={[bp.pct, { color }]}>{pct}% de éxito</Text>
        <Text style={[bp.label, { color }]}>{label}</Text>
      </View>
      <View style={bp.track}>
        <View style={[bp.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}
const bp = StyleSheet.create({
  wrap:  { marginTop: 6 },
  row:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  pct:   { fontSize: 11, fontWeight: '800' },
  label: { fontSize: 10, fontWeight: '700' },
  track: { height: 5, backgroundColor: '#e8e0d4', borderRadius: 3, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 3 },
});

export default function DecisionCard({ decision, onPress, disabled }) {
  const { state } = useGame();
  const { efectivoNegocio, ahorroPersonal, carteraCrypto, precioBC } = state;
  const capitalTotal = efectivoNegocio + ahorroPersonal;
  const pct = Math.round((decision.probabilidadExito || 1) * 100);

  const puedeEjecutar = (() => {
    if (decision.esCryptoCompra) return capitalTotal >= (decision.montoCryptoCompra || 0);
    if (decision.esCryptoCompraDesdeAhorro) return ahorroPersonal >= (decision.montoCryptoCompra || 0);
    if (decision.esCryptoVenta) return carteraCrypto >= (decision.cantidadVenta || 0);
    const costo = Math.abs(Math.min(0, decision.deltaEfectivo || 0)) || (decision.costoEjecutar || 0);
    if (costo === 0) return true;
    return capitalTotal >= costo;
  })();

  const bloqueadoPorFondos = !puedeEjecutar;
  const estaDisabled = disabled || bloqueadoPorFondos;

  const getColor = () => {
    if (bloqueadoPorFondos) return '#b8b0a4';
    if (decision.categoria === 'crypto') return '#8b1a1a';
    const delta = (decision.efectoExito?.deltaEfectivo || decision.deltaEfectivo || 0);
    if (delta > 0) return '#4a9e4a';
    if (delta < 0) return '#c0392b';
    return '#8c7c6e';
  };

  const getTipo = () => {
    if (bloqueadoPorFondos) return { txt: 'ACCIÓN', bg: '#8c7c6e' };
    if (decision.categoria === 'crypto') return { txt: 'CRYPTO', bg: '#8b1a1a' };
    if (decision.categoria === 'ahorro') return { txt: 'AHORRO', bg: '#1a6fb5' };
    return { txt: 'NEGOCIO', bg: '#4a9e4a' };
  };

  // Mostrar impacto de éxito vs fracaso
  const getImpactos = () => {
    const exito = decision.efectoExito;
    const fracaso = decision.efectoFracaso;
    if (!exito) return null;
    return { exitoLabel: exito.label || 'Resultado positivo', fracasoLabel: fracaso?.label || 'Sin efecto' };
  };

  const color  = getColor();
  const tipo   = getTipo();
  const impactos = getImpactos();
  const esCryptoCard = decision.categoria === 'crypto';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: color },
        estaDisabled && !bloqueadoPorFondos && styles.disabledGlobal,
        bloqueadoPorFondos && styles.disabledFondos,
      ]}
      onPress={() => !estaDisabled && onPress(decision)}
      disabled={estaDisabled}
      activeOpacity={0.78}
    >
      {/* Badge tipo */}
      <View style={styles.headerRow}>
        <View style={[styles.tipoBadge, { backgroundColor: tipo.bg }]}>
          <Text style={styles.tipoText}>{tipo.txt}</Text>
        </View>
        {/* Badge cripto especial */}
        {esCryptoCard && !bloqueadoPorFondos && (
          <View style={styles.cryptoBadge}>
            <Text style={styles.cryptoBadgeText}>🪙 BirriaCoin</Text>
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={[styles.titulo, bloqueadoPorFondos && { color: '#a89880' }]}>
            {decision.titulo}
          </Text>
          <Text style={[styles.descripcion, bloqueadoPorFondos && { color: '#c8c0b4' }]}>
            {decision.descripcion}
          </Text>

          {/* Barra de probabilidad ROGUELIKE */}
          {!bloqueadoPorFondos && decision.probabilidadExito < 1.0 && (
            <BarraProbabilidad pct={pct} />
          )}
          {!bloqueadoPorFondos && decision.probabilidadExito >= 1.0 && (
            <View style={styles.garantizadoBadge}>
              <Text style={styles.garantizadoText}>✅ Resultado garantizado</Text>
            </View>
          )}

          {/* Efectos éxito / fracaso */}
          {!bloqueadoPorFondos && impactos && decision.probabilidadExito < 1.0 && (
            <View style={styles.efectosRow}>
              <View style={[styles.efectoBox, { borderColor: '#4a9e4a30', backgroundColor: '#4a9e4a08' }]}>
                <Text style={styles.efectoIcon}>✅</Text>
                <Text style={[styles.efectoLabel, { color: '#4a9e4a' }]}>{impactos.exitoLabel}</Text>
              </View>
              <View style={[styles.efectoBox, { borderColor: '#c0392b30', backgroundColor: '#c0392b08' }]}>
                <Text style={styles.efectoIcon}>❌</Text>
                <Text style={[styles.efectoLabel, { color: '#c0392b' }]}>{impactos.fracasoLabel}</Text>
              </View>
            </View>
          )}

          {/* Fondos insuficientes */}
          {bloqueadoPorFondos && (
            <View style={styles.fondosRow}>
              <Text style={styles.fondosIcon}>💡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.fondosLabel}>Capital insuficiente</Text>
                <Text style={styles.fondosSub}>
                  Tienes ${capitalTotal.toFixed(0)} disponibles (efectivo + ahorro)
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={[
          styles.arrow,
          bloqueadoPorFondos
            ? { backgroundColor: '#f0ece6', borderColor: '#d8d2c4' }
            : { backgroundColor: color + '15', borderColor: color + '40' }
        ]}>
          <Text style={{ color: bloqueadoPorFondos ? '#b8b0a4' : color, fontSize: 20, fontWeight: '700' }}>
            {bloqueadoPorFondos ? '🔒' : '›'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14, borderWidth: 1, borderColor: '#e8e0d4',
    borderLeftWidth: 5, padding: 14, marginBottom: 10,
    shadowColor: '#8c7c6e', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  disabledGlobal: { opacity: 0.4 },
  disabledFondos: { opacity: 0.75, backgroundColor: 'rgba(245,242,235,0.9)' },

  headerRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tipoBadge:   { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  tipoText:    { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  cryptoBadge: { backgroundColor: '#8b1a1a12', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 1, borderColor: '#8b1a1a30' },
  cryptoBadgeText: { color: '#8b1a1a', fontSize: 10, fontWeight: '700' },

  row:     { flexDirection: 'row', alignItems: 'center', gap: 10 },
  content: { flex: 1, gap: 4 },
  titulo:  { color: '#3a1a0a', fontSize: 15, fontWeight: '800' },
  descripcion: { color: '#6b5c54', fontSize: 13, lineHeight: 18 },

  garantizadoBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  garantizadoText:  { fontSize: 11, color: '#4a9e4a', fontWeight: '700' },

  efectosRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  efectoBox:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  efectoIcon: { fontSize: 12 },
  efectoLabel:{ fontSize: 10, fontWeight: '600', flex: 1 },

  fondosRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#e8c4b844', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, marginTop: 4, backgroundColor: '#fdf8f0' },
  fondosIcon:  { fontSize: 14 },
  fondosLabel: { fontSize: 11, fontWeight: '700', color: '#b5820a' },
  fondosSub:   { fontSize: 10, color: '#8c7c6e', marginTop: 1 },

  arrow: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
});
