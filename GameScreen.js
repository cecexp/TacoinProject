import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useGame } from '../context/GameContext';
import HUD from '../components/HUD';
import DecisionCard from '../components/DecisionCard';
import PopupManager from '../components/PopupManager';
import MisionDelDia from '../components/MisionDelDia';
import EventoSorpresaPopup from '../components/EventoSorpresaPopup';
import DonJoseDialogo from '../components/DonJoseDialogo';
import CelebracionOverlay from '../components/CelebracionOverlay';

function TileBackground({ width, height }) {
  const TILE = 60;
  const cols = Math.ceil(width / TILE) + 1, rows = Math.ceil(height / TILE) + 1;
  const tiles = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      tiles.push(<View key={`${r}-${c}`} style={{ width: TILE, height: TILE, backgroundColor: (r + c) % 2 === 0 ? '#f5f2eb' : '#ede9e0', borderWidth: 0.8, borderColor: '#d8d2c4' }} />);
  return <View style={StyleSheet.absoluteFill}><View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{tiles}</View></View>;
}

export default function GameScreen({ onVerGlosario }) {
  const { state, estadoAnimo, aplicarDecision, forzarFinDeDia } = useGame();
  const { decisionesDelDia, accionesRestantes, diaGlobal, semanaGlobal, popupActual, popupConsejo, eventoHoy } = state;
  const { width, height } = useWindowDimensions();
  const bloqueado   = !!popupActual || !!popupConsejo || !!eventoHoy;
  const puedeDecidir = accionesRestantes > 0 && !bloqueado;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f2eb' }}>
      <TileBackground width={width} height={height} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(248,245,238,0.5)' }]} />
      <HUD />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { maxWidth: 600, alignSelf: 'center', width: '100%' }]}
      >
        {/* Misión del día */}
        <MisionDelDia />

        {/* Don José habla */}
        <DonJoseDialogo />

        {/* Alerta sin ahorro */}
        {state.ahorroPersonal <= 0 && (
          <View style={styles.alertaAhorro}>
            <Text style={{ fontSize: 20 }}>🏦</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertaTitulo}>Sin fondo de emergencia</Text>
              <Text style={styles.alertaSub}>Si el efectivo llega a $0, ¡bancarrota! Mueve algo al ahorro.</Text>
            </View>
          </View>
        )}

        {/* Instrucción + botón glosario */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
        <View style={[styles.instruccion, { flex: 1, marginBottom: 0 }]}>
          <Text style={{ fontSize: 16 }}>
            {accionesRestantes === 3 ? '👇' : accionesRestantes === 2 ? '🎯' : accionesRestantes === 1 ? '⚡' : '✅'}
          </Text>
          <Text style={styles.instruccionText}>
            {accionesRestantes === 3 ? 'Tienes 3 acciones hoy. Cada una mueve el negocio.' :
             accionesRestantes === 2 ? '2 acciones restantes. Cada peso cuenta.' :
             accionesRestantes === 1 ? '¡Última decisión del día! Elige con cuidado.' :
             'Día terminado. Revisa el resumen.'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>¿Qué hace Don José hoy?</Text>

        {decisionesDelDia.map((decision) => (
          <DecisionCard
            key={decision.id}
            decision={decision}
            onPress={aplicarDecision}
            disabled={!puedeDecidir}
          />
        ))}

        {accionesRestantes > 0 && (
          <TouchableOpacity
            style={[styles.btnCerrar, !puedeDecidir && { opacity: 0.4 }]}
            onPress={forzarFinDeDia}
            disabled={!puedeDecidir}
          >
            <Text style={{ fontSize: 22 }}>🌙</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.btnCerrarTitle}>Cerrar el puesto ahora</Text>
              <Text style={styles.btnCerrarSub}>⚠️ Reduce ventas — los costos igual se cobran</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* Evento sorpresa — aparece al inicio del día si lo hay */}
      <EventoSorpresaPopup />

      {/* Cola de popups del fin del día */}
      <PopupManager />
      {/* Partículas de celebración */}
      <CelebracionOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  content:        { padding: 14 },
  alertaAhorro:   { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff3cd', borderRadius: 10, borderWidth: 1.5, borderColor: '#fde68a', padding: 12, marginBottom: 10 },
  alertaTitulo:   { fontSize: 13, fontWeight: '800', color: '#78520a' },
  alertaSub:      { fontSize: 11, color: '#78520a', marginTop: 2, lineHeight: 16 },
  instruccion:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, borderWidth: 1, borderColor: '#e8e0d4', padding: 10, marginBottom: 10 },
  instruccionText:{ flex: 1, fontSize: 13, color: '#4a3228', fontWeight: '500', lineHeight: 18 },
  sectionTitle:   { fontSize: 12, fontWeight: '800', color: '#8c7c6e', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 },
  btnCerrar:      { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6, borderRadius: 14, borderWidth: 1.5, borderColor: '#d8d2c4', borderStyle: 'dashed', padding: 14, backgroundColor: 'rgba(255,255,255,0.6)' },
  btnCerrarTitle: { fontSize: 14, fontWeight: '700', color: '#6b5c54' },
  btnCerrarSub:   { fontSize: 11, color: '#c0392b', marginTop: 2, lineHeight: 15 },
  btnGlosario:    { width: 44, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, borderWidth: 1, borderColor: '#e8e0d4', alignItems: 'center', justifyContent: 'center' },
  btnGlosarioTxt: { fontSize: 20 },
});
