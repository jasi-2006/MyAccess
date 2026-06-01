import React, { useRef } from 'react';
import {
  Modal, View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator, useWindowDimensions,
  Image, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { digitsOnly } from '../utils/inputFilters.js';
import { resolveImageUrl } from '../services/api.js';

export default function ProfileEditModal({
  visible,
  fields,
  form,
  onChange,
  onSave,
  onCancel,
  saving,
  currentPhotoUrl,
  photo,
  onPhotoChange,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 910;
  const fileInputRef = useRef(null);
  const previewUrl = photo?.uri || resolveImageUrl(currentPhotoUrl);

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) onPhotoChange(result.assets[0]);
  };

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onPhotoChange({ uri: URL.createObjectURL(file), file });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.content, isDesktop && { width: 560 }]}>
          <Text style={styles.title}>Actualizar datos</Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.photoSection}>
              <Text style={styles.inputLabel}>Foto del carnet</Text>
              {Platform.OS === 'web' && (
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={onFileChange}
                />
              )}
              <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
                {previewUrl ? (
                  <Image source={{ uri: previewUrl }} style={styles.photoPreview} />
                ) : (
                  <Text style={styles.photoText}>Subir o cambiar foto</Text>
                )}
              </TouchableOpacity>
            </View>

            {fields.map((f) => (
              <View key={f.key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  value={form[f.key] || ''}
                  onChangeText={(v) => onChange(f.key, f.numeric ? digitsOnly(v) : v)}
                  placeholder={f.label}
                  placeholderTextColor="#94A3B8"
                  keyboardType={f.numeric ? 'numeric' : 'default'}
                  inputMode={f.numeric ? 'numeric' : 'text'}
                  editable={f.key !== 'document'}
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
  photoSection: { marginBottom: 16, alignItems: 'center' },
  photoPicker: {
    marginTop: 8,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: '#0F766E',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FFF8',
    overflow: 'hidden',
  },
  photoPreview: { width: 120, height: 120, borderRadius: 60 },
  photoText: { color: '#0F766E', fontSize: 12, fontWeight: '600', textAlign: 'center', paddingHorizontal: 8 },
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
