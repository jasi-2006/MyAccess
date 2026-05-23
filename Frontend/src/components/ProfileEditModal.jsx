import React from 'react';
import {
  Modal, View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator, useWindowDimensions,
} from 'react-native';

export default function ProfileEditModal({ visible, fields, form, onChange, onSave, onCancel, saving }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 910;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, isDesktop && { width: 560 }]}>
          <Text style={styles.title}>Actualizar datos</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {fields.map((f) => (
              <View key={f.key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[f.key] || ''}
                  onChangeText={(v) => onChange(f.key, v)}
                  placeholder={f.label}
                  placeholderTextColor="#94A3B8"
                />
              </View>
            ))}
          </ScrollView>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={onSave} disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveText}>Guardar</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxHeight: '85%' },
  title: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, color: '#64748B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    padding: 10, fontSize: 14, color: '#1E293B', backgroundColor: '#F8FAFC',
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  cancelText: { color: '#64748B', fontWeight: '600' },
  saveBtn: { backgroundColor: '#0F766E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveText: { color: '#fff', fontWeight: '600' },
});
