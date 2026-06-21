import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import WebFrame from '../components/WebFrame.jsx';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import CustomInput from '../components/CustomInput.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { getUserProfile, registerUser, uploadPhoto } from '../services/authService';
import { createCard } from '../services/cardService';
import { normalizeRole, ROLES } from '../utils/accessControl';

const DOCUMENT_TYPES = ['CC', 'TI', 'PPT'];

export default function CreateInstructorCardScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const pagePadding = isMobile ? 10 : isTablet ? 14 : 18;

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({
    name: '',
    typeDocument: 'CC',
    document: '',
    trainingCenter: 'Centro Comercio y Turismo',
    regional: 'Quindio',
    email: '',
  });

  const fileInputRef = useRef(null);

  const userName = (profile?.fullName || profile?.full_name)?.trim() || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, []);

  const onChange = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permiso de galería requerido para subir fotos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled) setPhoto(result.assets[0]);
    }
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const uri = URL.createObjectURL(file);
    setPhoto({ uri, file });
  };

  const validate = () => {
    const e = {};
    if (!values.name || values.name.trim().length < 3) {
      e.name = 'Nombre completo requerido (mínimo 3 caracteres)';
    }
    if (!values.document) {
      e.document = 'Número de documento requerido';
    } else if (!/^\d+$/.test(values.document)) {
      e.document = 'Solo se permiten números';
    } else if (values.document.length < 5) {
      e.document = 'Mínimo 5 dígitos';
    }
    if (!values.trainingCenter || values.trainingCenter.trim().length < 3) {
      e.trainingCenter = 'Centro de formación requerido';
    }
    if (!values.email) {
      e.email = 'Correo electrónico requerido';
    } else if (!values.email.includes('@')) {
      e.email = 'Correo electrónico inválido';
    }
    
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      setSubmitError('');

      // 1. Registrar usuario Instructor (con password por defecto y ficha/programa null)
      const registerResponse = await registerUser({
        email: values.email.trim().toLowerCase(),
        password: 'Instructor2026*', // Contraseña por defecto válida
        fullName: values.name.trim(),
        typeDocument: values.typeDocument,
        document: values.document.trim(),
        trainingCenter: values.trainingCenter.trim(),
        regional: values.regional.trim().toLowerCase(),
        bloodType: 'O+', // Tipo de sangre por defecto
        nameRole: 'INSTRUCTOR',
        ficha: null,
        trainingProgram: null,
      });

      // 2. Cargar foto de perfil
      let finalPhotoUrl = registerResponse?.photoUrl || null;
      if (photo) {
        const formData = new FormData();
        if (Platform.OS === 'web' && photo.file) {
          formData.append('photo', photo.file, photo.file.name || 'profile.jpg');
        } else {
          formData.append('photo', { uri: photo.uri, name: 'profile.jpg', type: 'image/jpeg' });
        }
        const photoResponse = await uploadPhoto(values.document.trim(), formData);
        finalPhotoUrl = photoResponse?.photoUrl || null;
      }

      // 3. Crear carnet digital activo en base de datos
      await createCard({
        idUser: registerResponse.id,
        photoUrl: finalPhotoUrl,
        validPhoto: true,
        digitalState: 'activo',
        physicalState: 'no solicitado',
        active: true,
        reprints: 0,
      });

      setSuccess(true);
    } catch (err) {
      setSubmitError(err.message || 'No fue posible registrar al instructor y generar su carnet.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValues({
      name: '',
      typeDocument: 'CC',
      document: '',
      trainingCenter: 'Centro Comercio y Turismo',
      regional: 'Quindio',
      email: '',
    });
    setPhoto(null);
    setErrors({});
    setSubmitError('');
    setSuccess(false);
  };

  if (loadingProfile) {
    return (
      <WebFrame>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#079B72" />
          <Text style={styles.loaderText}>Cargando perfil...</Text>
        </View>
      </WebFrame>
    );
  }

  return (
    <WebFrame>
      <View style={styles.screen}>
        <CarnetTopbar navigation={navigation} studentName={userName} studentInitial={userInitial} />

        <View style={styles.contentFrame}>
          {!isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Instructor" />}

          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[styles.mainScroll, { paddingHorizontal: pagePadding, minHeight: height - 60 }]}
            showsVerticalScrollIndicator={false}
          >
            {isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Instructor" />}

            <View style={styles.headerBlock}>
              <Text style={styles.pageTitle}>Crear Carnet Instructor</Text>
              <Text style={styles.pageSubtitle}>
                Formulario de registro exclusivo para personal de instructores. Excluye datos de ficha y programa.
              </Text>
            </View>

            {success ? (
              <View style={styles.successCard}>
                <Text style={styles.successIcon}>✓</Text>
                <Text style={styles.successTitle}>¡Carnet Creado Exitosamente!</Text>
                <Text style={styles.successText}>
                  El instructor {values.name} ha sido registrado en el sistema con el rol correspondiente y su carnet digital ya se encuentra activo.
                </Text>
                <View style={styles.successActions}>
                  <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={() => navigation.navigate('Instructor')}>
                    <Text style={styles.btnOutlineText}>Ir al Dashboard</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={handleReset}>
                    <Text style={styles.btnPrimaryText}>Crear Otro</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.formCard}>
                <View style={styles.grid}>
                  <View style={styles.gridCol}>
                    <CustomInput
                      label="Nombre Completo"
                      placeholder="Ej. Génesis Daniela Hernandez"
                      value={values.name}
                      onChangeText={(val) => onChange('name', val)}
                      error={errors.name}
                    />

                    <CustomInput
                      label="Número de Documento"
                      placeholder="Ej. 1094123456"
                      value={values.document}
                      onChangeText={(val) => onChange('document', val)}
                      error={errors.document}
                      digitsOnly
                    />

                    <View style={styles.roleBlock}>
                      <Text style={styles.roleLabel}>Tipo de documento</Text>
                      <View style={styles.roleRow}>
                        {DOCUMENT_TYPES.map((docType) => {
                          const active = values.typeDocument === docType;
                          return (
                            <TouchableOpacity
                              key={docType}
                              style={[styles.roleChip, active && styles.roleChipActive]}
                              onPress={() => onChange('typeDocument', docType)}
                            >
                              <Text style={[styles.roleChipText, active && styles.roleChipTextActive]}>
                                {docType}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  <View style={styles.gridCol}>
                    <CustomInput
                      label="Centro de Formación"
                      placeholder="Ej. Centro Comercio y Turismo"
                      value={values.trainingCenter}
                      onChangeText={(val) => onChange('trainingCenter', val)}
                      error={errors.trainingCenter}
                    />

                    <CustomInput
                      label="Regional"
                      placeholder="Ej. Quindio"
                      value={values.regional}
                      onChangeText={(val) => onChange('regional', val)}
                    />

                    <CustomInput
                      label="Correo Institucional"
                      placeholder="Ej. instructor@sena.edu.co"
                      value={values.email}
                      onChangeText={(val) => onChange('email', val)}
                      error={errors.email}
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* Subida de Fotografía */}
                <View style={styles.photoBlock}>
                  <Text style={styles.roleLabel}>Fotografía del Instructor</Text>
                  {Platform.OS === 'web' && (
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={onFileChange}
                    />
                  )}
                  <TouchableOpacity style={[styles.photoPicker, errors.photo && styles.photoPickerError]} onPress={pickImage}>
                    {photo ? (
                      <View style={styles.previewContainer}>
                        <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                        <Text style={styles.photoChangeText}>Cambiar foto</Text>
                      </View>
                    ) : (
                      <Text style={styles.photoText}>📷  Subir foto de perfil</Text>
                    )}
                  </TouchableOpacity>
                  {errors.photo ? <Text style={styles.errorText}>{errors.photo}</Text> : null}
                </View>

                {submitError ? (
                  <View style={styles.alertBox}>
                    <Text style={styles.alertIcon}>!</Text>
                    <Text style={styles.alertText}>{submitError}</Text>
                  </View>
                ) : null}

                <View style={styles.formActions}>
                  <PrimaryButton
                    title={loading ? 'Registrando...' : 'Generar Carnet Instructor ->'}
                    onPress={handleCreate}
                    loading={loading}
                    disabled={loading}
                    style={styles.submitBtn}
                    textStyle={styles.submitBtnText}
                  />
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EAE6E6' },
  contentFrame: { flex: 1, flexDirection: 'row' },
  mainArea: { flex: 1 },
  mainScroll: { flexGrow: 1, paddingTop: 6, paddingBottom: 16 },
  headerBlock: { marginBottom: 15 },
  pageTitle: { fontSize: 18, fontWeight: '800', color: '#151515', marginBottom: 2 },
  pageSubtitle: { maxWidth: 500, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F9F6', gap: 10 },
  loaderText: { color: '#079B72', fontSize: 13, fontWeight: '700' },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridCol: {
    flex: 1,
    flexBasis: 300,
    paddingHorizontal: 8,
  },
  roleBlock: {
    marginTop: 4,
    marginBottom: 8,
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
  photoBlock: {
    marginTop: 10,
  },
  photoPicker: {
    height: 80,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#24C565',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FFF8',
  },
  photoPickerError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF5F5',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  photoPreview: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  photoChangeText: {
    color: '#24C565',
    fontWeight: '700',
    fontSize: 13,
  },
  photoText: {
    color: '#24C565',
    fontWeight: '700',
    fontSize: 13,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FED7D7',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  alertIcon: {
    color: '#EF4444',
    fontWeight: '900',
    fontSize: 16,
  },
  alertText: {
    color: '#C53030',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  formActions: {
    marginTop: 10,
    alignItems: 'center',
  },
  submitBtn: {
    maxWidth: 350,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  successIcon: {
    fontSize: 48,
    color: '#24C565',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151515',
    marginBottom: 10,
    textAlign: 'center',
  },
  successText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 25,
  },
  successActions: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
    justifyContent: 'center',
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
  },
  btnOutline: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  btnOutlineText: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: 13,
  },
  btnPrimary: {
    backgroundColor: '#24C565',
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
