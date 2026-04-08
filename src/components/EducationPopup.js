import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGame } from '../context/GameContext';

export default function EducationPopup() {
  const { state, cerrarPopup } = useGame();
  const { popupConsejo } = state;
  if (!popupConsejo) return null;

  return (
    <Modal transparent animationType="fade" visible={!!popupConsejo}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Tira de azulejos */}
          <View style={styles.tileStrip}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={[styles.tile, { backgroundColor: i % 2 === 0 ? '#f5f2eb' : '#ede9e0' }]} />
            ))}
          </View>
          <View style={styles.body}>
            <View style={styles.iconCircle}>
              <Text style={{ fontSize: 28 }}>💡</Text>
            </View>
            <Text style={styles.titulo}>{popupConsejo.titulo}</Text>
            <View style={styles.divider} />
            <Text style={styles.consejo}>{popupConsejo.consejo}</Text>
            <TouchableOpacity style={styles.btnOuter} onPress={cerrarPopup}>
              <View style={styles.btnShadow} />
              <View style={styles.btnFace}>
                <Text style={styles.btnText}>¡Entendido!</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 380,
    borderWidth: 2,
    borderColor: '#8b1a1a',
  },
  tileStrip: { flexDirection: 'row', height: 8 },
  tile: { flex: 1, borderWidth: 0.5, borderColor: '#d8d2c4' },
  body: { padding: 24, alignItems: 'center' },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#fdf0ec',
    borderWidth: 2, borderColor: '#e8c4b8',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  titulo: {
    color: '#8b1a1a', fontSize: 16, fontWeight: '800',
    textAlign: 'center', marginBottom: 12,
  },
  divider: { width: '100%', height: 1, backgroundColor: '#e8e0d4', marginBottom: 12 },
  consejo: {
    color: '#4a3228', fontSize: 14, lineHeight: 22,
    textAlign: 'center', marginBottom: 22,
  },
  btnOuter: { position: 'relative', width: '100%' },
  btnShadow: { position: 'absolute', bottom: -4, left: 4, right: 4, height: '100%', backgroundColor: '#4a0c0c', borderRadius: 50 },
  btnFace: { backgroundColor: '#8b1a1a', borderRadius: 50, paddingVertical: 13, alignItems: 'center', borderWidth: 2, borderColor: '#6b1212' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
