import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, useWindowDimensions } from 'react-native';

export default function ProfileInfoCard({ profile, loading, fields, onEdit, px }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 910;

  return (
    <View style={[styles.section, { paddingHorizontal: px }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontSize: isDesktop ? 22 : 18 }]}>Mi Información</Text>
        {profile && (
          <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0F766E" style={{ marginTop: 24 }} />
      ) : profile ? (
        <View style={[styles.profileGrid, isDesktop && { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }]}>
          {fields.map((f) => f.value ? (
            <View key={f.label} style={[styles.fieldCard, isDesktop && { width: '47%' }]}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <Text style={[styles.fieldValue, { fontSize: isDesktop ? 16 : 14 }]}>{f.value}</Text>
            </View>
          ) : null)}
        </View>
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No se encontró información del perfil.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { paddingVertical: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontWeight: '700', color: '#1E293B' },
  editBtn: { backgroundColor: '#0F766E', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  editBtnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  profileGrid: { gap: 8 },
  fieldCard: {
    backgroundColor: '#fff', borderRadius: 8, padding: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  fieldLabel: { fontSize: 10, color: '#64748B', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldValue: { fontWeight: '600', color: '#1E293B' },
  emptyCard: { backgroundColor: '#fff', borderRadius: 8, padding: 16, alignItems: 'center' },
  emptyText: { color: '#94A3B8', fontSize: 13 },
});
