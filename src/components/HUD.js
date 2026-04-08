import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useGame } from '../context/GameContext';
import { getNivelActual } from '../data/gameData';

export default function HUD() {
  const { state } = useGame();
  const { efectivoNegocio, ahorroPersonal, carteraCrypto, precioBC,
          diaGlobal, semanaGlobal, accionesRestantes, xpTotal } = state;
  const { width } = useWindowDimensions();
  const valorCrypto  = carteraCrypto * precioBC;
  const TOTAL        = 3;
  const nivel        = getNivelActual(xpTotal || 0);
  const barPct       = Math.round(nivel.progreso * 100);

  return (
    <View style={styles.container}>
      {/* Tira azulejos */}
      <View style={styles.tileStrip}>
        {Array.from({ length: Math.ceil(width / 30) + 1 }).map((_, i) => (
          <View key={i} style={[styles.tile, { backgroundColor: i % 2 === 0 ? '#f5f2eb' : '#ede9e0' }]} />
        ))}
      </View>

      <View style={styles.inner}>
        {/* Fila 1: Día · Nivel · Acciones */}
        <View style={styles.topRow}>
          <View style={styles.diaWrap}>
            <Text style={styles.diaIcon}>📅</Text>
            <View>
              <Text style={styles.diaNum}>Día {diaGlobal}</Text>
              <Text style={styles.semanaLabel}>Semana {semanaGlobal}</Text>
            </View>
          </View>

          {/* Nivel */}
          <View style={styles.nivelWrap}>
            <Text style={styles.nivelEmoji}>{nivel.emoji}</Text>
            <View>
              <Text style={[styles.nivelTitulo, { color: nivel.color }]}>{nivel.titulo}</Text>
              <View style={styles.xpTrack}>
                <View style={[styles.xpFill, { width: `${barPct}%`, backgroundColor: nivel.color }]} />
              </View>
            </View>
          </View>

          {/* Acciones */}
          <View style={styles.accionesWrap}>
            <Text style={styles.accionesTitle}>Acciones</Text>
            <View style={styles.accionesDots}>
              {Array.from({ length: TOTAL }).map((_, i) => (
                <View key={i} style={[styles.accionDot, i < accionesRestantes ? styles.accionActiva : styles.accionUsada]}>
                  <Text style={i < accionesRestantes ? styles.checkActivo : styles.checkUsado}>
                    {i < accionesRestantes ? '●' : '✓'}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.accionesNum}>{accionesRestantes}/{TOTAL}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Cards financieras */}
        <View style={styles.cards}>
          <FinanceCard icon="💵" label="Efectivo"  value={`$${efectivoNegocio.toFixed(0)}`}  color="#4a9e4a" help="Dinero para operar" />
          <FinanceCard icon="🏦" label="Ahorro"    value={`$${ahorroPersonal.toFixed(0)}`}   color="#1a6fb5" help="Emergencias" />
          <FinanceCard icon="🪙" label="BC"         value={`${carteraCrypto.toFixed(2)}`}     color="#b5820a" sub={`≈$${valorCrypto.toFixed(0)}`} help="BirriaCoin" />
          <FinanceCard icon="📈" label="Precio BC" value={`$${precioBC.toFixed(2)}`}          color="#8b1a1a" help="Por moneda" />
        </View>
      </View>
    </View>
  );
}

function FinanceCard({ icon, label, value, sub, color, help }) {
  return (
    <View style={[styles.card, { borderTopColor: color }]}>
      <View style={styles.cardTopRow}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={[styles.cardValue, { color }]}>{value}</Text>
      </View>
      {sub && <Text style={[styles.cardSub, { color }]}>{sub}</Text>}
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardHelp}>{help}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#d8d2c4', paddingTop: 44, shadowColor: '#8c7c6e', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  tileStrip: { position: 'absolute', top: 0, left: 0, right: 0, height: 44, flexDirection: 'row', overflow: 'hidden' },
  tile:      { width: 30, height: 44, borderWidth: 0.5, borderColor: '#d8d2c4' },
  inner:     { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  topRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  diaWrap:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  diaIcon:   { fontSize: 22 },
  diaNum:    { fontSize: 18, fontWeight: '800', color: '#8b1a1a' },
  semanaLabel: { fontSize: 10, color: '#8c7c6e', fontStyle: 'italic' },
  nivelWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  nivelEmoji:{ fontSize: 16 },
  nivelTitulo: { fontSize: 11, fontWeight: '700', marginBottom: 3 },
  xpTrack:   { width: 60, height: 4, backgroundColor: '#e8e0d4', borderRadius: 2, overflow: 'hidden' },
  xpFill:    { height: '100%', borderRadius: 2 },
  accionesWrap: { alignItems: 'flex-end', gap: 3 },
  accionesTitle: { fontSize: 9, color: '#8c7c6e', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  accionesDots:  { flexDirection: 'row', gap: 5 },
  accionDot:  { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  accionActiva: { backgroundColor: '#fdf0ec', borderColor: '#8b1a1a' },
  accionUsada:  { backgroundColor: '#f0ece6', borderColor: '#d8d2c4' },
  checkActivo:  { color: '#8b1a1a', fontSize: 13, fontWeight: '800' },
  checkUsado:   { color: '#b8b0a4', fontSize: 11 },
  accionesNum:  { fontSize: 10, color: '#8c7c6e' },
  divider:   { height: 1, backgroundColor: '#ede9e0', marginBottom: 10 },
  cards:     { flexDirection: 'row', gap: 8 },
  card:      { flex: 1, backgroundColor: '#faf8f5', borderRadius: 10, borderTopWidth: 3, borderWidth: 1, borderColor: '#e8e0d4', padding: 8, gap: 1 },
  cardTopRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardIcon:  { fontSize: 13 },
  cardValue: { fontSize: 12, fontWeight: '800' },
  cardSub:   { fontSize: 9, fontWeight: '600', opacity: 0.8 },
  cardLabel: { fontSize: 9, color: '#6b5c54', fontWeight: '700', marginTop: 2 },
  cardHelp:  { fontSize: 8, color: '#a89880', fontStyle: 'italic' },
});
