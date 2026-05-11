import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import PrimaryButton from '../components/PrimaryButton.jsx';
import RegisterSteps from '../components/RegisterSteps.jsx';
import AuthSplitLayout from '../components/AuthSplitLayout.jsx';
import { colors } from '../theme/colors.jsx';
import { registerUser, uploadPhoto } from '../services/authService';

const STEPS = ['Personal', 'Datos', 'Acceso'];
const TITLES = ['Datos personales', 'Datos del carnet', 'Credenciales de acceso'];
const SUBTITLES = [
  'Ingresa tu informacion personal.',
  'Completa los datos de tu carnet.',
  'Crea tus credenciales de acceso.',
];

export default function RegisterGatewayScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 500;

  const [step, setStep] = useState(0);
  const isCarnetStep = step === 1;
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);

  const [values, setValues] = useState({
    name: '', typeDocument: 'CC', document: '', bloodType: '',
    regional: 'quindio', trainingCenter: 'centro comercio y turismo',
    nameRole: 'APRENDIZ', trainingProgram: '', Ficha: '',
    email: '', password: '',
  });

  const onChange = (key, val) => setValues((prev) => ({ ...prev, [key]: val }));

  const validate = (s) => {
    const e = {};
    if (s === 0) {
      if (!values.name || values.name.length < 3) e.name = 'Nombre requerido';
      if (!values.document || values.document.length < 5) e.document = 'Documento requerido';
      if (!values.bloodType) e.bloodType = 'Tipo de sangre requerido';
    }
    if (s === 1) {
      if (!values.trainingProgram) e.trainingProgram = 'Programa requerido';
      if (!values.Ficha) e.Ficha = 'Numero de ficha requerido';
    }
    if (s === 2) {
      if (!values.email.includes('@')) e.email = 'Email invalido';
      if (!values.password || values.password.length < 8) e.password = 'Minimo 8 caracteres';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const goToStep = (s) => {
    if (s < step) { setStep(s); setErrors({}); return; }
    if (s === step + 1 && validate(step)) { setStep(s); setErrors({}); }
  };

  const handleContinue = () => {
    if (step < 2) {
      if (validate(step)) { setStep(step + 1); setErrors({}); }
    } else {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    if (!validate(2)) return;
    try {
      setLoading(true);
      setSubmitError('');
      await registerUser({
        email: values.email, password: values.password,
        fullName: values.name, typeDocument: values.typeDocument,
        document: values.document, trainingProgram: values.trainingProgram,
        trainingCenter: values.trainingCenter, regional: values.regional.toLowerCase(),
        bloodType: values.bloodType, nameRole: values.nameRole, Ficha: values.Ficha,
      });
      if (photo) {
        const formData = new FormData();
        if (Platform.OS === 'web' && photo.file) {
          formData.append('photo', photo.file, 'profile.jpg');
        } else {
          formData.append('photo', { uri: photo.uri, name: 'profile.jpg', type: 'image/jpeg' });
        }
        await uploadPhoto(values.document, formData);
      }
      navigation.navigate('Verification', { email: values.email });
    } catch (error) {
      setSubmitError(error.message || 'No fue posible crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
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

      {step === 2 && submitError ? (
        <View style={styles.alertBox}>
          <Text style={styles.alertIcon}>!</Text>
          <Text style={styles.alertText}>{submitError}</Text>
        </View>
      ) : null}

      <PrimaryButton
        title={step < 2 ? 'Continuar ->' : 'Registrarse ->'}
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
});
