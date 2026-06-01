import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CustomInput from './CustomInput.jsx';
import { PUBLIC_REGISTRATION_ROLES } from '../utils/accessControl';

const inp = (icon, placeholder, value, onCT, extra = {}) => ({ icon, placeholder, value, onCT, ...extra });
const DOCUMENT_TYPES = ['CC', 'TI', 'PPT'];
export const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export default function RegisterSteps({ step, values, onChange, errors, isMobile = false, showLabels = false, photo, onPhotoChange }) {
  const o = (k) => (v) => onChange(k, v);
  const isCarnetStep = step === 1;
  const { name, typeDocument, document, bloodType, regional, trainingCenter, nameRole, trainingProgram, Ficha, email, password } = values;
  const fileInputRef = useRef(null);

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled) onPhotoChange(result.assets[0]);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uri = URL.createObjectURL(file);
    onPhotoChange({ uri, file });
  };

  const stepFields = [
    [
      inp('👤', 'Nombre completo',     name,         o('name'),         { error: errors.name,     autoCapitalize: 'words' }),
      inp('#️⃣', 'Número de documento', document,      o('document'),     { error: errors.document, digitsOnly: true }),
    ],
    [
      inp('📄', 'Regional',             regional,        o('regional'),        {}),
      inp('🏢', 'Centro de formación',  trainingCenter,  o('trainingCenter'),  {}),
      inp('⚙️', 'Programa de formación', trainingProgram, o('trainingProgram'), { error: errors.trainingProgram }),
      inp('🔢', 'N° Ficha',             Ficha,           o('Ficha'),           { error: errors.Ficha, digitsOnly: true }),
    ],
    [
      inp('📧', 'Correo electrónico', email,    o('email'),    { error: errors.email,    keyboardType: 'email-address', autoCapitalize: 'none' }),
      inp('🔒', 'Contraseña',         password, o('password'), { error: errors.password, secureTextEntry: true }),
    ],
  ];

  const renderField = (f) => (
    <CustomInput
      key={f.placeholder}
      label={showLabels ? f.placeholder : ''}
      compact={!isMobile}
      icon={showLabels ? '' : f.icon}
      placeholder={showLabels ? '' : f.placeholder}
      value={f.value}
      onChangeText={f.onCT}
      error={f.error}
      keyboardType={f.keyboardType}
      autoCapitalize={f.autoCapitalize}
      secureTextEntry={f.secureTextEntry}
      digitsOnly={f.digitsOnly}
      dense={isCarnetStep && !isMobile}
    />
  );

  return (
    <View style={[styles.container, isCarnetStep && styles.containerDense]}>
      {step === 1 && (
        <View style={styles.roleBlock}>
          <Text style={styles.roleLabel}>Tipo de usuario</Text>
          <View style={styles.roleRow}>
            {PUBLIC_REGISTRATION_ROLES.map((role) => {
              const active = nameRole === role;
              return (
                <TouchableOpacity
                  key={role}
                  style={[styles.roleChip, active && styles.roleChipActive]}
                  onPress={() => onChange('nameRole', role)}
                >
                  <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                    {role === 'APRENDIZ' ? 'Aprendiz' : 'Instructor'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.nameRole ? <Text style={styles.roleError}>{errors.nameRole}</Text> : null}
        </View>
      )}
      {step === 0 ? (
        <>
          {renderField(stepFields[0][0])}
          {renderField(stepFields[0][1])}
          <View style={styles.roleBlock}>
            <Text style={styles.roleLabel}>Tipo de documento</Text>
            <View style={styles.roleRow}>
              {DOCUMENT_TYPES.map((documentType) => {
                const active = typeDocument === documentType;
                return (
                  <TouchableOpacity
                    key={documentType}
                    style={[styles.roleChip, active && styles.roleChipActive]}
                    onPress={() => onChange('typeDocument', documentType)}
                  >
                    <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                      {documentType}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          <View style={styles.roleBlock}>
            <Text style={styles.roleLabel}>Tipo de sangre</Text>
            <View style={styles.bloodTypeRow}>
              {BLOOD_TYPES.map((type) => {
                const active = bloodType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.bloodTypeChip, active && styles.roleChipActive]}
                    onPress={() => onChange('bloodType', type)}
                  >
                    <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {errors.bloodType ? <Text style={styles.roleError}>{errors.bloodType}</Text> : null}
          </View>
        </>
      ) : (
        stepFields[step].map(renderField)
      )}
      {step === 0 && (
        <>
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
            {photo
              ? <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
              : <Text style={styles.photoText}>📷  Subir foto de perfil</Text>
            }
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 2 },
  containerDense: { gap: 0 },
  photoPicker: {
    marginTop: 10,
    height: 80,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#24C565',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FFF8',
  },
  photoPreview: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  photoText: {
    color: '#24C565',
    fontWeight: '700',
    fontSize: 13,
  },
  roleBlock: {
    marginTop: 4,
    marginBottom: 4,
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  bloodTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bloodTypeChip: {
    minWidth: 52,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  roleChipActive: {
    borderColor: '#24C565',
    backgroundColor: '#E8FFF5',
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  roleChipTextActive: {
    color: '#118449',
  },
  roleError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});
