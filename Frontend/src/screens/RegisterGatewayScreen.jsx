import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors } from '../theme/colors.jsx';
import CustomInput from '../components/CustomInput.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import HeaderCurved from '../components/HeaderCurved.jsx';
import { registerUser } from '../services/authService';

export default function RegisterGatewayScreen({ navigation }) {
  // ========== ESTADOS ==========
  const [currentStep, setCurrentStep] = useState(0); // 0: Registrate, 1: Datos, 2: Login
  const steps = ['Registrate', 'Datos', 'login'];

  // Paso 1 (Registrate): Datos personales del carnet
  const [name, setName] = useState('');
  const [documentType, setDocumentType] = useState('CC');
  const [document, setDocument] = useState('');
  const [bloodType, setBloodType] = useState('');

  // Paso 2 (Datos): Información institucional
  const [regional, setRegional] = useState('Quindio');
  const [trainingCenter, setTrainingCenter] = useState('centro comercio y turismo');
  const [nameRole, setNameRole] = useState('Aprendiz');
  const [trainingProgram, setTrainingProgram] = useState('');
  const [ficha, setFicha] = useState('');

  // Paso 3 (Login): Credenciales
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  // Otros estados
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  // ========== VALIDACIÓN POR PASO ==========
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

  // ========== NAVEGACIÓN ==========
  const goToStep = (step) => {
    // Solo permite ir a pasos anteriores o al siguiente si el actual es válido
    if (step < currentStep) {
      setCurrentStep(step);
      setErrors({});
      return;
    }
    
    if (step === currentStep + 1) {
      if (validateStep(currentStep)) {
        setCurrentStep(step);
        setErrors({});
      }
    }
  };

  const handleContinue = () => {
    if (currentStep < 2) {
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1);
        setErrors({});
      }
    } else {
      handleRegister();
    }
  };

  // ========== SUBMIT FINAL ==========
  const handleRegister = async () => {
    if (!validateStep(2)) return;

    try {
      setLoading(true);
      setSubmitError('');
      
      await registerUser({
        document,
        documentType,
        fullName: name,
        password,
        email,
        phone: '',
        nameRole: 'APRENDIZ',
        trainingProgram,
        trainingCenter,
        bloodType,
        regional: regional.toLowerCase(),
      });
      
      navigation.navigate('Verification', { email });
    } catch (error) {
      setSubmitError(error.message || 'No fue posible crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  // ========== COMPONENTE DE TABS INFERIORES ==========
  const BottomTabs = () => (
    <View style={styles.tabsContainer}>
      {steps.map((step, index) => (
        <TouchableOpacity
          key={step}
          style={[
            styles.tab,
            currentStep === index && styles.tabActive
          ]}
          onPress={() => goToStep(index)}
          activeOpacity={0.8}
        >
          <Text style={[
            styles.tabText,
            currentStep === index && styles.tabTextActive
          ]}>
            {step}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // ========== RENDERIZADO DE CADA PASO ==========
  const renderStep0 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.headerTitle}>Datos Personales!</Text>
      <Text style={styles.headerSubtitle}>Para tu carnet digital</Text>
      
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Datos del carnet</Text>
        <Text style={styles.cardIcon}>🪪</Text>
      </View>

      <CustomInput
        icon="👤"
        placeholder="Nombre completo"
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoCapitalize="words"
      />

      <CustomInput
        icon="🪪"
        placeholder="Tipo de documento"
        value={documentType}
        onChangeText={setDocumentType}
        error={errors.documentType}
      />

      <CustomInput
        icon="#️⃣"
        placeholder="Numero de documento"
        value={document}
        onChangeText={setDocument}
        keyboardType="numeric"
        error={errors.document}
      />

      <CustomInput
        icon="🩸"
        placeholder="Tipo de sangre"
        value={bloodType}
        onChangeText={setBloodType}
        autoCapitalize="characters"
        error={errors.bloodType}
      />

      <PrimaryButton 
        title="Continuar" 
        onPress={handleContinue}
        style={styles.continueButton}
      />
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.headerTitle}>Datos Personales!</Text>
      <Text style={styles.headerSubtitle}>Para tu carnet digital</Text>
      
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Datos del carnet</Text>
        <Text style={styles.cardIcon}>🪪</Text>
      </View>

      <CustomInput
        icon="📄"
        placeholder="Regional"
        value={regional}
        onChangeText={setRegional}
      />

      <CustomInput
        icon="🏢"
        placeholder="Centro"
        value={trainingCenter}
        onChangeText={setTrainingCenter}
      />

      <CustomInput
        icon="👤"
        placeholder="Rol"
        value={nameRole}
        onChangeText={setNameRole}
      />

      <CustomInput
        icon="⚙️"
        placeholder="Programa"
        value={trainingProgram}
        onChangeText={setTrainingProgram}
        error={errors.trainingProgram}
      />

      <CustomInput
        icon="🔢"
        placeholder="N° Ficha"
        value={ficha}
        onChangeText={setFicha}
        keyboardType="numeric"
        error={errors.ficha}
      />

      <PrimaryButton 
        title="Continuar" 
        onPress={handleContinue}
        style={styles.continueButton}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.headerTitle}>Datos Personales!</Text>
      <Text style={styles.headerSubtitle}>Para tu carnet digital</Text>
      
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Credenciales de acceso</Text>
        <Text style={styles.cardIcon}>🔐</Text>
      </View>

      <CustomInput
        icon="📧"
        placeholder="Correo electronico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <CustomInput
        icon="🔒"
        placeholder="Contrasena"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
      />

    

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <PrimaryButton 
        title={loading ? "Creando..." : "Iniciar sesion"} 
        onPress={handleContinue}
        loading={loading}
        style={styles.continueButton}
      />
    </View>
  );

  // ========== RENDER PRINCIPAL ==========
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <HeaderCurved height={180} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === 0 && renderStep0()}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
      </ScrollView>

      <BottomTabs />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#E8F5E9', // Verde muy claro como en la imagen
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100, // Espacio para los tabs
  },
  
  // Headers
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50', // Verde principal
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },

  // Card header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text || '#333',
  },
  cardIcon: {
    fontSize: 24,
  },

  // Step content
  stepContent: {
    width: '100%',
  },

  // Inputs estilo de la imagen (fondo verde claro)
  // Nota: Estos estilos van en CustomInput o los overrides aquí
  inputOverride: {
    backgroundColor: '#C8E6C9', // Verde menta claro
    borderRadius: 25,
    borderWidth: 0,
    marginBottom: 12,
  },

  // Botón continuar
  continueButton: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: '#81C784', // Verde medio
  },

  // Error
  submitError: {
    color: colors.error || '#F44336',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },

  // ========== TABS INFERIORES ==========
  tabsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
    flexDirection: 'row',
    backgroundColor: '#C8E6C9', // Verde menta claro como en la imagen
    borderRadius: 25,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '#81C784', // Verde más oscuro para el activo
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});