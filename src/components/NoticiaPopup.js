import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGame } from '../context/GameContext';

export default function NoticiaPopup() {
  const { state, cerrarNoticia } = useGame();
  const { noticiaVisible } = state;
  if (!noticiaVisible) return null;

  const esBuena  = noticiaVisible.cambioPorcentualPrecio >= 0;
  const pct      = Math.abs(noticiaVisible.cambioPorcentualPrecio * 100).toFixed(0);
  const accentColor = esBuena ? '#4a9e4a' : '#c0392b';

  return (
    <Modal transparent animationType="slide" visible={!!noticiaVisible}>
      <View style={styles.overlay}>
        <View style={[styles.card, { borderTopColor: accentColor }]}>
          {/* Tira de azulejos */}
          <View style={styles.tileStrip}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={[styles.tile, { backgroundColor: i % 2 === 0 ? '#f5f2eb' : '#ede9e0' }]} />
            ))}
          </View>

          <View style={styles.body}>
            <Text style={styles.badgeLabel}>📰 Noticias del Barrio</Text>
            <Text style={styles.titulo}>{noticiaVisible.titulo}</Text>
            <Text style={styles.descripcion}>{noticiaVisible.descripcion}</Text>

            <View style={[styles.impactoBox, { backgroundColor: accentColor + '15', borderColor: accentColor + '55' }]}>
              <Text style={[styles.impactoText, { color: accentColor }]}>
                {esBuena ? '📈' : '📉'}  BirriaCoin {esBuena ? '+' : '-'}{pct}%
              </Text>
            </View>

            <TouchableOpacity style={styles.btnOuter} onPress={cerrarNoticia} activeOpacity={0.85}>
              <View style={[styles.btnShadow, { backgroundColor: esBuena ? '#1a5e1a' : '#4a0c0c' }]} />
              <View style={[styles.btnFace, { backgroundColor: accentColor, borderColor: esBuena ? '#1a5e1a' : '#6b1212' }]}>
                <Text style={styles.btnText}>Ok, entendido</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 4,
  },
  tileStrip: { flexDirection: 'row', height: 8 },
  tile: { flex: 1, borderWidth: 0.5, borderColor: '#d8d2c4' },
  body: { padding: 22, paddingBottom: 36 },
  badgeLabel: { color: '#8c7c6e', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10 },
  titulo:      { color: '#3a1a0a', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  descripcion: { color: '#6b5c54', fontSize: 14, lineHeight: 21, marginBottom: 16 },
  impactoBox: {
    borderRadius: 12, padding: 14, alignItems: 'center',
    marginBottom: 20, borderWidth: 1.5,
  },
  impactoText: { fontSize: 17, fontWeight: '800' },
  btnOuter:  { position: 'relative' },
  btnShadow: { position: 'absolute', bottom: -4, left: 4, right: 4, height: '100%', borderRadius: 50 },
  btnFace:   { borderRadius: 50, paddingVertical: 14, alignItems: 'center', borderWidth: 2 },
  btnText:   { color: '#fff', fontWeight: '700', fontSize: 15 },
});
