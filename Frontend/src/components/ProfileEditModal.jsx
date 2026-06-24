import React, { useRef, useState } from 'react';
import {
  Modal, View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator, useWindowDimensions,
  Image, Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { digitsOnly } from '../utils/inputFilters.js';
import { resolveImageUrl } from '../services/api.js';
import { removePhotoBackground } from '../services/photoBackgroundService.js';
import { normalizeRole, ROLES } from '../utils/accessControl';

const appendCacheBust = (url, revision) => {
  if (!url) return null;
  const cacheBuster = `v=${revision || 0}`;
  return url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;
};

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
  userRole,
  photoRevision,
  passwordForm,
  onPasswordChange,
}) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 910;
  const fileInputRef = useRef(null);
  const previewUrl = photo?.uri || appendCacheBust(resolveImageUrl(currentPhotoUrl), photoRevision);
  const [fichaInput, setFichaInput] = useState('');

  const isInstructor = normalizeRole(userRole) === ROLES.INSTRUCTOR;

  const fichas = isInstructor
    ? String(form.ficha || '').split(',').map((f) => f.trim()).filter(Boolean)
    : [];

  const addFicha = () => {
    const val = fichaInput.trim();
    if (!val || !/^\d+$/.test(val) || fichas.includes(val)) { setFichaInput(''); return; }
    onChange('ficha', [...fichas, val].join(','));
    setFichaInput('');
  };

  const removeFicha = (f) => {
    onChange('ficha', fichas.filter((x) => x !== f).join(','));
  };

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
    if (!result.canceled) onPhotoChange(await removePhotoBackground(result.assets[0]));
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onPhotoChange(await removePhotoBackground({ uri: URL.createObjectURL(file), file, fileName: file.name, type: file.type }));
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

            {fields.map((f) => {
              if (f.key === 'ficha' && isInstructor) {
                return (
                  <View key={f.key} style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Fichas asignadas</Text>
                    <View style={styles.fichaInputRow}>
                      <TextInput
                        style={styles.fichaInput}
                        value={fichaInput}
                        onChangeText={(v) => setFichaInput(v.replace(/\D/g, ''))}
                        placeholder="N° de ficha"
                        keyboardType="numeric"
                        returnKeyType="done"
                        onSubmitEditing={addFicha}
                        placeholderTextColor="#94A3B8"
                      />
                      <TouchableOpacity style={styles.fichaAddBtn} onPress={addFicha}>
                        <Text style={styles.fichaAddBtnText}>+ Agregar</Text>
                      </TouchableOpacity>
                    </View>
                    {fichas.length > 0 && (
                      <View style={styles.fichaChips}>
                        {fichas.map((fc) => (
                          <View key={fc} style={styles.fichaChip}>
                            <Text style={styles.fichaChipText}>#{fc}</Text>
                            <TouchableOpacity onPress={() => removeFicha(fc)}>
                              <Text style={styles.fichaChipRemove}>?</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              }

              return (
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
              );
            })}

            <View style={styles.passwordSection}>
              <Text style={styles.passwordTitle}>Contraseña</Text>
              <Text style={styles.passwordHint}>Si no deseas cambiarla, deja estos campos vacíos.</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contraseña actual</Text>
                <TextInput
                  style={styles.input}
                  value={passwordForm?.currentPassword || ''}
                  onChangeText={(v) => onPasswordChange('currentPassword', v)}
                  placeholder="Ingresa tu contrasña actual"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nueva contraseña</Text>
                <TextInput
                  style={styles.input}
                  value={passwordForm?.newPassword || ''}
                  onChangeText={(v) => onPasswordChange('newPassword', v)}
                  placeholder="Nueva contraseña"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirmar nueva contraseña</Text>
                <TextInput
                  style={styles.input}
                  value={passwordForm?.confirmPassword || ''}
                  onChangeText={(v) => onPasswordChange('confirmPassword', v)}
                  placeholder="Repite la nueva contraseña"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>
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
  photoPreview: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFFFFF' },
  photoText: { color: '#0F766E', fontSize: 12, fontWeight: '600', textAlign: 'center', paddingHorizontal: 8 },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, color: '#64748B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8,
    padding: 10, fontSize: 14, color: '#1E293B', backgroundColor: '#F8FAFC',
  },
  passwordSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  passwordTitle: { fontSize: 15, fontWeight: '800', color: '#0F766E', marginBottom: 4 },
  passwordHint: { fontSize: 12, color: '#64748B', marginBottom: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  cancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  cancelText: { color: '#64748B', fontWeight: '600' },
  saveBtn: { backgroundColor: '#0F766E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  saveText: { color: '#fff', fontWeight: '600' },
  fichaInputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  fichaInput: {
    flex: 1, height: 40, borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 8, paddingHorizontal: 12, fontSize: 13,
    color: '#1E293B', backgroundColor: '#F8FAFC',
  },
  fichaAddBtn: {
    height: 40, paddingHorizontal: 14, borderRadius: 8,
    backgroundColor: '#0F766E', alignItems: 'center', justifyContent: 'center',
  },
  fichaAddBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 12 },
  fichaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  fichaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    backgroundColor: '#E8FFF5', borderWidth: 1, borderColor: '#0F766E',
  },
  fichaChipText: { fontSize: 12, fontWeight: '700', color: '#0F766E' },
  fichaChipRemove: { fontSize: 11, color: '#EF4444', fontWeight: '900' },
});
