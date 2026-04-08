import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, useWindowDimensions, TextInput,
} from 'react-native';
import { CONCEPTOS_FINANCIEROS } from '../data/gameData';

function TileBackground({ width, height }) {
  const TILE = 60;
  const cols = Math.ceil(width / TILE) + 1, rows = Math.ceil(height / TILE) + 1;
  const tiles = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      tiles.push(<View key={`${r}-${c}`} style={{ width: TILE, height: TILE, backgroundColor: (r + c) % 2 === 0 ? '#f5f2eb' : '#ede9e0', borderWidth: 0.8, borderColor: '#d8d2c4' }} />);
  return <View style={StyleSheet.absoluteFill}><View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{tiles}</View></View>;
}

const TODOS_CONCEPTOS = Object.entries(CONCEPTOS_FINANCIEROS).map(([id, data]) => ({ id, ...data }));

export default function GlosarioScreen({ glosarioDesbloqueado = [], onCerrar }) {
  const { width, height } = useWindowDimensions();
  const [busqueda, setBusqueda] = useState('');
  const [soloDesbloqueados, setSoloDesbloqueados] = useState(false);
  const maxW = Math.min(width, 520);

  const conceptosFiltrados = TODOS_CONCEPTOS.filter(c => {
    const matchBusqueda = c.termino.toLowerCase().includes(busqueda.toLowerCase()) ||
                          c.def.toLowerCase().includes(busqueda.toLowerCase());
    const matchDesbloqueo = soloDesbloqueados ? glosarioDesbloqueado.includes(c.id) : true;
    return matchBusqueda && matchDesbloqueo;
  });

  const totalDesbloqueados = glosarioDesbloqueado.length;
  const total = TODOS_CONCEPTOS.length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f2eb' }}>
      <TileBackground width={width} height={height} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(248,245,238,0.5)' }]} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={onCerrar}>
          <Text style={styles.closeTxt}>‹</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitulo}>📖 Glosario Financiero</Text>
          <Text style={styles.headerSub}>{totalDesbloqueados} de {total} términos desbloqueados</Text>
        </View>
      </View>

      {/* Barra de progreso del glosario */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(totalDesbloqueados / total) * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { maxWidth: maxW, alignSelf: 'center', width: '100%' }]}>

        {/* Búsqueda */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar término..."
            placeholderTextColor="#a89880"
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <TouchableOpacity
            style={[styles.filterBtn, soloDesbloqueados && styles.filterBtnActive]}
            onPress={() => setSoloDesbloqueados(v => !v)}
          >
            <Text style={[styles.filterTxt, soloDesbloqueados && styles.filterTxtActive]}>
              {soloDesbloqueados ? '🔓 Desbloqueados' : '📚 Todos'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de conceptos */}
        {conceptosFiltrados.map((c) => {
          const desbloqueado = glosarioDesbloqueado.includes(c.id);
          return (
            <View key={c.id} style={[styles.conceptoCard, !desbloqueado && styles.conceptoLocked]}>
              <View style={styles.conceptoHeader}>
                <Text style={[styles.conceptoTermino, !desbloqueado && { color: '#a89880' }]}>
                  {desbloqueado ? c.termino : '???'}
                </Text>
                {desbloqueado
                  ? <View style={styles.desbBadge}><Text style={styles.desbText}>✓ Desbloqueado</Text></View>
                  : <View style={styles.lockBadge}><Text style={styles.lockText}>🔒 Por descubrir</Text></View>
                }
              </View>
              <Text style={[styles.conceptoDef, !desbloqueado && { color: '#c8c0b4' }]}>
                {desbloqueado ? c.def : 'Toma decisiones en el juego para descubrir este concepto.'}
              </Text>
            </View>
          );
        })}

        {conceptosFiltrados.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 36 }}>🔍</Text>
            <Text style={styles.emptyTxt}>No encontramos ese término</Text>
          </View>
        )}

        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 50, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: 'rgba(245,242,235,0.95)',
    borderBottomWidth: 1, borderBottomColor: '#d8d2c4',
  },
  closeBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fdf0ec', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e8c4b8' },
  closeTxt:     { fontSize: 22, color: '#8b1a1a', fontWeight: '700', marginTop: -2 },
  headerTitulo: { fontSize: 16, fontWeight: '800', color: '#3a1a0a' },
  headerSub:    { fontSize: 11, color: '#8c7c6e', marginTop: 1 },
  progressBar:  { height: 4, backgroundColor: '#e8e0d4' },
  progressFill: { height: '100%', backgroundColor: '#b5820a' },
  content:      { padding: 16 },
  searchRow:    { flexDirection: 'row', gap: 10, marginBottom: 14 },
  searchInput:  { flex: 1, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 10, borderWidth: 1, borderColor: '#e8e0d4', paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#3a1a0a' },
  filterBtn:    { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 10, borderWidth: 1, borderColor: '#e8e0d4', paddingHorizontal: 12, justifyContent: 'center' },
  filterBtnActive: { backgroundColor: '#b5820a', borderColor: '#b5820a' },
  filterTxt:    { fontSize: 12, color: '#6b5c54', fontWeight: '600' },
  filterTxtActive: { color: '#fff' },
  conceptoCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14, borderWidth: 1, borderColor: '#e8e0d4',
    padding: 14, marginBottom: 10,
  },
  conceptoLocked: { backgroundColor: 'rgba(245,242,235,0.7)', borderColor: '#d8d2c4' },
  conceptoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  conceptoTermino:{ fontSize: 15, fontWeight: '800', color: '#3a1a0a' },
  conceptoDef:    { fontSize: 13, color: '#6b5c54', lineHeight: 19 },
  desbBadge:  { backgroundColor: '#4a9e4a18', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#4a9e4a44' },
  desbText:   { fontSize: 10, color: '#4a9e4a', fontWeight: '700' },
  lockBadge:  { backgroundColor: '#f0ece6', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  lockText:   { fontSize: 10, color: '#a89880', fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyTxt:   { fontSize: 14, color: '#8c7c6e' },
});
