import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform, ScrollView, Modal, Image } from 'react-native';
import PrimaryButton from '../components/PrimaryButton.jsx';
import RegisterSteps, { BLOOD_TYPES } from '../components/RegisterSteps.jsx';
import AuthSplitLayout from '../components/AuthSplitLayout.jsx';
import { validateCarnetPhoto } from '../services/photoValidationService.js';
import { colors } from '../theme/colors.jsx';
import { isPublicRegistrationRole, ROLES } from '../utils/accessControl';
import { isDigitsOnly } from '../utils/inputFilters.js';
import { registerUser, uploadPhoto } from '../services/authService';

const STEPS = ['Personal', 'Datos', 'Acceso'];
const TITLES = ['Datos personales', 'Datos del carnet', 'Credenciales de acceso'];
const SUBTITLES = [
  'Ingresa tu informacion personal.',
  'Completa los datos de tu carnet.',
  'Crea tus credenciales de acceso.',
];
const passwordRegex = /^[A-Z](?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function RegisterGatewayScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 500;

  const [step, setStep] = useState(0);
  const isCarnetStep = step === 1;
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const [values, setValues] = useState({
    nombres: '', apellidos: '', typeDocument: 'C.C', document: '', bloodType: 'O+',
    regional: 'Quindio', trainingCenter: 'Centro Comercio y Turismo',
    nameRole: ROLES.APRENDIZ, trainingProgram: '', Ficha: '', fichas: [],
    email: '', password: '',
  });

  const onChange = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));

  const validateCapitalization = (text) => {
    if (!text) return false;
    const words = text.trim().split(/\s+/);
    if (words.length === 0 || (words.length === 1 && words[0] === '')) return false;
    const wordRegex = /^[A-ZÁÉÍÓÚÑÜ][a-záéíóúñü]*$/;
    return words.every(word => wordRegex.test(word));
  };

  const formatCapitalization = (text) => {
    if (!text) return '';
    return text
      .trim()
      .split(/\s+/)
      .map(word => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };

  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!values.nombres || values.nombres.trim().length < 2) {
        e.nombres = 'Nombres requeridos';
      } else if (!validateCapitalization(values.nombres)) {
        e.nombres = 'Cada nombre y apellido debe iniciar con mayúscula.';
      }

      if (!values.apellidos || values.apellidos.trim().length < 2) {
        e.apellidos = 'Apellidos requeridos';
      } else if (!validateCapitalization(values.apellidos)) {
        e.apellidos = 'Cada nombre y apellido debe iniciar con mayúscula.';
      }

      if (!values.document) {
        e.document = 'Documento requerido';
      } else if (!isDigitsOnly(values.document)) {
        e.document = 'Solo se permiten numeros';
      } else if (values.document.length < 5) {
        e.document = 'Minimo 5 digitos';
      }
      if (!BLOOD_TYPES.includes(values.bloodType)) {
        e.bloodType = 'Selecciona un tipo de sangre valido';
      }
    }
    if (s === 1) {
      if (!values.trainingProgram) e.trainingProgram = 'Programa requerido';
      if (!values.Ficha) {
        e.Ficha = 'Numero de ficha requerido';
      } else if (!isDigitsOnly(values.Ficha)) {
        e.Ficha = 'Solo se permiten numeros';
      }
    }
    if (s === 2) {
      if (!values.email.includes('@')) e.email = 'Email invalido';
      if (!passwordRegex.test(values.password)) {
        e.password = 'Debe iniciar con mayúscula, tener 8 caracteres, un número y un carácter especial';
      }
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const goToStep = (s) => {
    if (s < step) { setStep(s); setErrors({}); return; }
    if (s === step + 1 && validate(step)) { setStep(s); setErrors({}); }
  };

  const closeReview = () => {
    setShowReview(false);
    setSubmitError('');
  };

  const handleContinue = () => {
    if (step < 2) {
      if (validate(step)) { setStep(step + 1); setErrors({}); }
    } else {
      if (validate(2)) setShowReview(true);
    }
  };

  const handleRegister = async () => {
    if (!validate(2)) return;
    try {
      setLoading(true);
      setSubmitError('');

      if (photo && Platform.OS === 'web' && photo.file) {
        try {
          const validation = await validateCarnetPhoto(photo.file);
          if (!validation.valid) {
            setSubmitError('Foto no válida:\n• ' + validation.errors.join('\n• '));
            return;
          }
          if (validation.file) {
            photo.file = validation.file;
            photo.uri = URL.createObjectURL(validation.file);
            setPhoto({ ...photo });
          }
        } catch (validationErr) {
          setSubmitError('No se pudo validar la foto: ' + (validationErr?.message || 'Error desconocido'));
          return;
        }
      }

      const cleanNombres = formatCapitalization(values.nombres);
      const cleanApellidos = formatCapitalization(values.apellidos);
      const combinedFullName = `${cleanNombres} ${cleanApellidos}`;

      const registerResponse = await registerUser({
        email: values.email, password: values.password,
        nombres: cleanNombres,
        apellidos: cleanApellidos,
        fullName: combinedFullName,
        typeDocument: values.typeDocument,
        document: values.document, trainingProgram: values.trainingProgram,
        trainingCenter: values.trainingCenter, regional: values.regional.toLowerCase(),
        bloodType: values.bloodType,
        nameRole: values.nameRole,
        ficha: values.nameRole === ROLES.INSTRUCTOR
          ? values.fichas.join(',')
          : values.Ficha,
      });

      if (photo) {
        const formData = new FormData();
        if (Platform.OS === 'web' && photo.file) {
          formData.append('photo', photo.file, photo.file.name || 'profile.jpg');
        } else {
          formData.append('photo', { uri: photo.uri, name: 'profile.jpg', type: 'image/jpeg' });
        }
        await uploadPhoto(values.document, formData);
      }

      navigation.navigate('Verification', {
        email: values.email,
        emailWarning: registerResponse?.verificationEmailSent === false
          ? (registerResponse?.verificationEmailMessage
            || 'No pudimos enviar el correo. Usa Reenviar codigo o contacta al administrador.')
          : '',
      });
    } catch (error) {
      if (error?.status === 409) {
        setSubmitError('Este correo o documento ya esta registrado. Ve a la pantalla de verificacion y usa "Reenviar codigo", o inicia sesion.');
        navigation.navigate('Verification', {
          email: values.email.trim().toLowerCase(),
          emailWarning: '',
        });
        return;
      }
      setSubmitError(error.message || 'No fue posible crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <AuthSplitLayout
        compact
        panelTitle="Excelencia en la Gestión Académica"
        panelSubtitle="Crea tu cuenta para acceder al seguimiento de fichas, gestión académica y reportes institucionales en tiempo real."
      >
        <Text style={[styles.title, isMobile && { fontSize: 24 }, isCarnetStep && styles.titleCompact]}>{TITLES[step]}</Text>
        <Text style={[styles.subtitle, isCarnetStep && styles.subtitleCompact]}>{SUBTITLES[step]}</Text>

        <View style={[styles.tabs, isMobile && { marginBottom: 20 }, isCarnetStep && styles.tabsCompact]}>
          {STEPS.map((s, i) => (
            <TouchableOpacity
              key={s}
              style={[styles.tab, isMobile && styles.tabMobile, step === i && styles.tabActive]}
              onPress={() => goToStep(i)}
            >
              <Text style={[styles.tabText, isMobile && { fontSize: 14 }, step === i && styles.tabTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <RegisterSteps
          step={step}
          values={values}
          onChange={onChange}
          errors={errors}
          isMobile={isMobile}
          showLabels
          photo={photo}
          onPhotoChange={setPhoto}
        />

        {submitError ? (
          <View style={styles.alertBox}>
            <Text style={styles.alertIcon}>!</Text>
            <Text style={styles.alertText}>{submitError}</Text>
          </View>
        ) : null}

        <PrimaryButton
          title={step < 2 ? 'Continuar ->' : 'Revisar y registrar ->'}
          onPress={handleContinue}
          loading={loading}
          style={[styles.primaryButton, { height: isMobile ? 52 : 44 }, isCarnetStep && !isMobile && styles.primaryButtonCompact]}
          textStyle={[styles.primaryButtonText, { fontSize: isMobile ? 15 : 13 }]}
        />

        <View style={styles.row}>
          <Text style={[styles.mutedText, isMobile && { fontSize: 14 }]}>Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.link, isMobile && { fontSize: 14 }]}>Inicia sesion</Text>
          </TouchableOpacity>
        </View>
      </AuthSplitLayout>

      <Modal visible={showReview} transparent animationType="fade" onRequestClose={closeReview}>
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewPanel}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewHeaderText}>
                <Text style={styles.reviewTitle}>Revisa tu información</Text>
                <Text style={styles.reviewSubtitle}>Verifica que todo esté correcto antes de registrarte.</Text>
              </View>
              <TouchableOpacity
                style={styles.reviewCloseBtn}
                onPress={closeReview}
                accessibilityLabel="Cerrar"
                accessibilityRole="button"
              >
                <Text style={styles.reviewCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.reviewScroll} showsVerticalScrollIndicator={false}>
              {photo?.uri && (
                <View style={styles.reviewPhotoRow}>
                  <Image source={{ uri: photo.uri }} style={styles.reviewPhoto} />
                </View>
              )}
              {[
                ['Nombres',   values.nombres],
                ['Apellidos', values.apellidos],
                ['Documento', `${values.typeDocument} ${values.document}`],
                ['Sangre',    values.bloodType],
                ['Regional',  values.regional],
                ['Centro',    values.trainingCenter],
                ['Programa',  values.trainingProgram],
                ['Ficha(s)',  values.nameRole === ROLES.INSTRUCTOR ? (values.fichas.join(', ') || '-') : values.Ficha],
                ['Rol',       values.nameRole],
                ['Correo',    values.email],
              ].map(([label, val]) => (
                <View key={label} style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>{label}</Text>
                  <Text style={styles.reviewValue}>{val || '-'}</Text>
                </View>
              ))}
            </ScrollView>

            {submitError ? (
              <View style={styles.alertBox}>
                <Text style={styles.alertIcon}>!</Text>
                <Text style={styles.alertText}>{submitError}</Text>
              </View>
            ) : null}

            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={styles.reviewEditBtn}
                onPress={closeReview}
              >
                <Text style={styles.reviewEditText}>Editar datos</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewConfirmBtn, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.reviewConfirmText}>{loading ? 'Registrando...' : 'Confirmar y registrar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  titleCompact: { fontSize: 22, marginBottom: 2 },
  subtitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginBottom: 16 },
  subtitleCompact: { fontSize: 12, marginBottom: 10 },
  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', borderLeftWidth: 4, borderLeftColor: '#EF4444', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10, gap: 8 },
  alertIcon: { fontSize: 13 },
  alertText: { flex: 1, color: '#B91C1C', fontSize: 12, fontWeight: '500' },
  primaryButton: { borderRadius: 8, backgroundColor: '#24C565', shadowOpacity: 0, elevation: 0, marginTop: 4, marginBottom: 18 },
  primaryButtonCompact: { height: 40, marginTop: 2, marginBottom: 14 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800' },
  tabs: { flexDirection: 'row', backgroundColor: '#E8FFF5', borderRadius: 22, padding: 4, marginBottom: 16 },
  tabsCompact: { marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 7, alignItems: 'center', borderRadius: 18 },
  tabMobile: { paddingVertical: 13 },
  tabActive: { backgroundColor: colors.primary, elevation: 2 },
  tabText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  tabTextActive: { color: '#FFF', fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  mutedText: { fontSize: 12, color: '#6B7280' },
  link: { fontSize: 12, color: '#0F9F76', fontWeight: '800' },
  reviewOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  reviewPanel: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, width: '100%', maxWidth: 420, maxHeight: '85%' },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  reviewHeaderText: { flex: 1 },
  reviewCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  reviewCloseIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6B7280',
    lineHeight: 18,
  },
  reviewTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  reviewSubtitle: { fontSize: 12, color: '#6B7280' },
  reviewScroll: { maxHeight: 340, marginBottom: 12 },
  reviewPhotoRow: { alignItems: 'center', marginBottom: 12 },
  reviewPhoto: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: '#24C565' },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  reviewLabel: { fontSize: 12, color: '#6B7280', fontWeight: '700', flex: 1 },
  reviewValue: { fontSize: 12, color: '#1F2937', fontWeight: '600', flex: 2, textAlign: 'right' },
  reviewActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  reviewEditBtn: { flex: 1, paddingVertical: 11, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
  reviewEditText: { fontSize: 13, color: '#374151', fontWeight: '700' },
  reviewConfirmBtn: { flex: 2, paddingVertical: 11, borderRadius: 8, backgroundColor: '#24C565', alignItems: 'center' },
  reviewConfirmText: { fontSize: 13, color: '#FFFFFF', fontWeight: '800' },
});