import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useGame } from '../context/GameContext';

export default function DecisionCard({ decision, onPress, disabled }) {
  const { state } = useGame();
  const { efectivoNegocio, ahorroPersonal, carteraCrypto, precioBC } = state;

  // ── Calcular si el usuario PUEDE ejecutar esta decisión ─────
  // Usa efectivo + ahorro como capital total disponible
  const capitalTotal = efectivoNegocio + ahorroPersonal;

  const puedeEjecutar = (() => {
    if (decision.esCryptoCompra) {
      return efectivoNegocio >= (decision.montoCryptoCompra || 0) ||
             capitalTotal    >= (decision.montoCryptoCompra || 0);
    }
    if (decision.esCryptoCompraDesdeAhorro) {
      return ahorroPersonal >= (decision.montoCryptoCompra || 0);
    }
    if (decision.esCryptoVenta) {
      return carteraCrypto >= (decision.cantidadVenta || 0);
    }
    // Decisión normal con costo
    const costo = Math.abs(Math.min(0, decision.deltaEfectivo || 0));
    if (costo === 0) return true; // sin costo, siempre disponible
    // Puede pagar con efectivo O con efectivo+ahorro
    return capitalTotal >= costo;
  })();

  const bloqueadoPorFondos = !puedeEjecutar;
  const estaDisabled = disabled || bloqueadoPorFondos;

  // ── Colores según tipo ───────────────────────────────────────
  const getColor = () => {
    if (bloqueadoPorFondos) return '#b8b0a4';
    if (decision.esCryptoCompra || decision.esCryptoVenta || decision.esCryptoCompraDesdeAhorro) return '#8b1a1a';
    const delta = (decision.deltaEfectivo || 0) + (decision.deltaAhorro || 0);
    if (delta > 0) return '#4a9e4a';
    if (delta < 0) return '#c0392b';
    return '#8c7c6e';
  };

  const getImpacto = () => {
    if (decision.esCryptoCompra)
      return { label: `Inviertes $${decision.montoCryptoCompra}`, sub: 'a cambio de BirriaCoin', icon: '🪙' };
    if (decision.esCryptoVenta)
      return { label: `Vendes ${decision.cantidadVenta} BC`, sub: 'recibes pesos', icon: '💵' };
    if (decision.esCryptoCompraDesdeAhorro)
      return { label: `Del ahorro: $${decision.montoCryptoCompra}`, sub: 'a BirriaCoin', icon: '🪙' };
    const parts = [];
    if (decision.deltaEfectivo) parts.push(`Efectivo ${decision.deltaEfectivo > 0 ? '+' : ''}$${decision.deltaEfectivo}`);
    if (decision.deltaAhorro)   parts.push(`Ahorro ${decision.deltaAhorro > 0 ? '+' : ''}$${decision.deltaAhorro}`);
    if (decision.deltaCrypto)   parts.push(`BC ${decision.deltaCrypto > 0 ? '+' : ''}${decision.deltaCrypto}`);
    return parts.length
      ? { label: parts.join('  ·  '), sub: 'impacto en tus finanzas', icon: parts[0].includes('+') ? '📈' : '📉' }
      : { label: 'Sin cambio financiero', sub: 'no afecta tus números', icon: '➖' };
  };

  const getTipo = () => {
    if (bloqueadoPorFondos) return { txt: 'ACCIÓN', bg: '#8c7c6e' };
    if (decision.esCryptoCompra || decision.esCryptoVenta || decision.esCryptoCompraDesdeAhorro)
      return { txt: 'CRYPTO', bg: '#8b1a1a' };
    const delta = (decision.deltaEfectivo || 0) + (decision.deltaAhorro || 0);
    if (delta > 0) return { txt: 'INGRESO', bg: '#4a9e4a' };
    if (delta < 0) return { txt: 'GASTO',   bg: '#c0392b' };
    return { txt: 'ACCIÓN', bg: '#8c7c6e' };
  };

  const color  = getColor();
  const impacto = getImpacto();
  const tipo   = getTipo();

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
      <View style={[styles.tipoBadge, { backgroundColor: tipo.bg }]}>
        <Text style={styles.tipoText}>{tipo.txt}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={[styles.titulo, bloqueadoPorFondos && { color: '#a89880' }]}>
            {decision.titulo}
          </Text>
          <Text style={[styles.descripcion, bloqueadoPorFondos && { color: '#c8c0b4' }]}>
            {decision.descripcion}
          </Text>

          {/* Impacto o mensaje de fondos insuficientes */}
          {bloqueadoPorFondos ? (
            <View style={styles.fondosRow}>
              <Text style={styles.fondosIcon}>💡</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.fondosLabel}>Capital insuficiente</Text>
                <Text style={styles.fondosSub}>
                  Tienes ${capitalTotal.toFixed(0)} disponibles (efectivo + ahorro)
                </Text>
              </View>
            </View>
          ) : (
            <View style={[styles.impactoRow, { backgroundColor: color + '12', borderColor: color + '40' }]}>
              <Text style={styles.impactoIcon}>{impacto.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.impactoLabel, { color }]}>{impacto.label}</Text>
                <Text style={styles.impactoSub}>{impacto.sub}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Flecha o candado */}
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

  tipoBadge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginBottom: 8 },
  tipoText:  { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },

  row:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  content:     { flex: 1, gap: 6 },
  titulo:      { color: '#3a1a0a', fontSize: 15, fontWeight: '800' },
  descripcion: { color: '#6b5c54', fontSize: 13, lineHeight: 18 },

  impactoRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, marginTop: 2 },
  impactoIcon: { fontSize: 16 },
  impactoLabel:{ fontSize: 12, fontWeight: '700' },
  impactoSub:  { fontSize: 10, color: '#8c7c6e', marginTop: 1 },

  fondosRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#e8c4b844', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, marginTop: 2, backgroundColor: '#fdf8f0' },
  fondosIcon:  { fontSize: 14 },
  fondosLabel: { fontSize: 11, fontWeight: '700', color: '#b5820a' },
  fondosSub:   { fontSize: 10, color: '#8c7c6e', marginTop: 1 },

  arrow: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
});
