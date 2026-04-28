import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  Image, SafeAreaView, useWindowDimensions,
} from 'react-native';
import { colors } from '../theme/colors.jsx';
import CustomInput from '../components/CustomInput.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { registerUser } from '../services/authService';

export default function RegisterGatewayScreen({ navigation }) {
  const { width, height } = useWindowDimensions();

  const isSmallDevice = width < 375;
  const isTablet = width >= 500 && width < 1024;
  const isDesktop = width >= 600;
  const scale = isDesktop ? 1.4 : isTablet ? 1.2 : isSmallDevice ? 0.9 : 1.7;
  const horizontalPadding = isDesktop ? width * 0.29 : isTablet ? width * 0.20 : width * 0.10;

  const [currentStep, setCurrentStep] = useState(0);
  const steps = ['Personal', 'Datos', 'Acceso'];

  const [name, setName] = useState('');
  const [typeDocument, setTypeDocument] = useState('CC');
  const [document, setDocument] = useState('');
  const [bloodType, setBloodType] = useState('');

  const [regional, setRegional] = useState('quindio');
  const [trainingCenter, setTrainingCenter] = useState('centro comercio y turismo');
  const [nameRole, setNameRole] = useState('APRENDIZ');
  const [trainingProgram, setTrainingProgram] = useState('');
  const [ficha, setFicha] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 0) {
      if (!name || name.length < 3) newErrors.name = 'Nombre requerido';
      if (!document || document.length < 5) newErrors.document = 'Documento requerido';
      if (!bloodType) newErrors.bloodType = 'Tipo de sangre requerido';
    }
    if (step === 1) {
      if (!trainingProgram) newErrors.trainingProgram = 'Programa requerido';
      if (!ficha) newErrors.ficha = 'N° Ficha requerido';
    }
    if (step === 2) {
      if (!email.includes('@')) newErrors.email = 'Email inválido';
      if (!password || password.length < 8) newErrors.password = 'Mín. 8 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goToStep = (step) => {
    if (step < currentStep) { setCurrentStep(step); setErrors({}); return; }
    if (step === currentStep + 1 && validateStep(currentStep)) { setCurrentStep(step); setErrors({}); }
  };

  const handleContinue = () => {
    if (currentStep < 2) {
      if (validateStep(currentStep)) { setCurrentStep(currentStep + 1); setErrors({}); }
    } else {
      handleRegister();
    }
  };

  const handleRegister = async () => {
    if (!validateStep(2)) return;
    try {
      setLoading(true);
      setSubmitError('');
      await registerUser({
        email, password,
        fullName: name, typeDocument, document,
        trainingProgram, trainingCenter,
        regional: regional.toLowerCase(),
        bloodType, nameRole: 'APRENDIZ', ficha,
      });
      navigation.navigate('Verification', { email });
    } catch (error) {
      setSubmitError(error.message || 'No fue posible crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const dynamicStyles = {
    headerImage: {
      width: isDesktop ? 200 : isTablet ? 240 : isSmallDevice ? 150 : 230,
      height: isDesktop ? 320 : isTablet ? 240 : isSmallDevice ? 150 : 190,
      resizeMode: 'contain',
      alignSelf: 'center',
      marginBottom: isDesktop ? -40 : -30,
      marginTop: isDesktop ? -100 : -20,
    },
    headerCurved: {
      backgroundColor: colors.primary,
      paddingTop: isDesktop ? height * 0.003 : height * 0.04,
      paddingBottom: isDesktop ? height * 0.02 : height * 0.03,
      paddingHorizontal: horizontalPadding,
    },
    headerSubtitle: {
      fontSize: (isDesktop ? 14 : isTablet ? 18 : isSmallDevice ? 13 : 15) * scale,
      color: '#FFFFFF',
      marginTop: isDesktop ? -80 : isTablet ? 12 : isSmallDevice ? 12 : 1,
      opacity: 0.9,
      textAlign: 'center',
    },
    curveDecoration: {
      height: isDesktop ? 60 : isTablet ? 40 : 30,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: isDesktop ? 60 : isTablet ? 40 : 30,
      borderTopRightRadius: isDesktop ? 60 : isTablet ? 40 : 30,
      marginTop: 10,
    },
    content: {
      flex: 1,
      paddingHorizontal: horizontalPadding,
      paddingTop: isDesktop ? 40 : 20 * scale,
      paddingBottom: isDesktop ? 50 : 100,
      backgroundColor: '#FFFFFF',
    },
    pageTitle: {
      fontSize: (isDesktop ? 20 : isTablet ? 32 : isSmallDevice ? 11 : 20) * scale,
      fontWeight: '600',
      color: '#0F766E',
      marginTop: isDesktop ? -65 : isTablet ? 31 : isSmallDevice ? -14 : -24,
      marginBottom: 14,
    },
  };

  const stepTitles = ['Datos personales', 'Datos del carnet', 'Credenciales de acceso'];
  const stepImages = [
    require('../assets/registro.png'),
    require('../assets/datos.png'),
    require('../assets/login.png'),
  ];
  const stepSubtitles = [
    'Ingresa tu información personal.',
    'Completa los datos de tu carnet.',
    'Crea tus credenciales de acceso.',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* HEADER */}
          <View style={styles.headerContainer}>
            <View style={dynamicStyles.headerCurved}>
              <Image style={dynamicStyles.headerImage} source={stepImages[currentStep]} />
              <Text style={dynamicStyles.headerSubtitle}>{stepSubtitles[currentStep]}</Text>
            </View>
            <View style={dynamicStyles.curveDecoration} />
          </View>

          {/* CONTENIDO */}
          <View style={dynamicStyles.content}>
            <Text style={dynamicStyles.pageTitle}>{stepTitles[currentStep]}</Text>

            {/* PASO 0 */}
            {currentStep === 0 && <>
              <CustomInput icon="👤" placeholder="Nombre completo" value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" />
              <CustomInput icon="🪪" placeholder="Tipo de documento" value={typeDocument} onChangeText={setTypeDocument} />
              <CustomInput icon="#️⃣" placeholder="Número de documento" value={document} onChangeText={setDocument} keyboardType="numeric" error={errors.document} />
              <CustomInput icon="🩸" placeholder="Tipo de sangre" value={bloodType} onChangeText={setBloodType} autoCapitalize="characters" error={errors.bloodType} />
            </>}

            {/* PASO 1 */}
            {currentStep === 1 && <>
              <CustomInput icon="📄" placeholder="Regional" value={regional} onChangeText={setRegional} />
              <CustomInput icon="🏢" placeholder="Centro de formación" value={trainingCenter} onChangeText={setTrainingCenter} />
              <CustomInput icon="👤" placeholder="Rol" value={nameRole} onChangeText={setNameRole} />
              <CustomInput icon="⚙️" placeholder="Programa de formación" value={trainingProgram} onChangeText={setTrainingProgram} error={errors.trainingProgram} />
              <CustomInput icon="🔢" placeholder="N° Ficha" value={ficha} onChangeText={setFicha} keyboardType="numeric" error={errors.ficha} />
            </>}

            {/* PASO 2 */}
            {currentStep === 2 && <>
              <CustomInput icon="📧" placeholder="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
              <CustomInput icon="🔒" placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry error={errors.password} />
              {submitError ? (
                <View style={styles.alertBox}>
                  <Text style={styles.alertIcon}>⚠️</Text>
                  <Text style={styles.alertText}>{submitError}</Text>
                </View>
              ) : null}
            </>}

            <PrimaryButton title={currentStep < 2 ? 'Continuar' : loading ? 'Creando...' : 'Registrarse'} onPress={handleContinue} loading={loading} />

            {/* TABS */}
            <View style={styles.tabsContainer}>
              {steps.map((step, index) => (
                <TouchableOpacity key={step} style={[styles.tab, currentStep === index && styles.tabActive]} onPress={() => goToStep(index)} activeOpacity={0.8}>
                  <Text style={[styles.tabText, currentStep === index && styles.tabTextActive]}>{step}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: '#FFFFFF' },
  container:     { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1 },
  headerContainer: { width: '100%', backgroundColor: colors.primary },

  alertBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FEE2E2', borderLeftWidth: 4, borderLeftColor: '#EF4444',
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16, gap: 10,
  },
  alertIcon: { fontSize: 16 },
  alertText: { flex: 1, color: '#B91C1C', fontSize: 14, fontWeight: '500' },

  tabsContainer: {
    flexDirection: 'row', backgroundColor: '#C8E6C9',
    borderRadius: 25, padding: 4, marginTop: 20, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  tab:           { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 20 },
  tabActive:     { backgroundColor: colors.primary, elevation: 2 },
  tabText:       { fontSize: 14, fontWeight: '500', color: '#666' },
  tabTextActive: { color: '#FFF', fontWeight: 'bold' },

  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText:      { fontSize: 14, color: '#6B7280' },
  loginLink:      { fontSize: 14, color: '#0F766E', fontWeight: '600' },
});
