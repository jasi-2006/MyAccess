import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Modal, TextInput, Image, ActivityIndicator,
} from 'react-native';
import CustomInput from '../components/CustomInput.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import SocialButtons from '../components/SocialButtons.jsx';
import AuthSplitLayout from '../components/AuthSplitLayout.jsx';
import { loginUser, socialLogin } from '../services/authService';
import { getToken } from '../services/api';
import { colors } from '../theme/colors.jsx';

export default function LoginGatewayScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const [socialModalVisible, setSocialModalVisible] = useState(false);
  const [socialProvider, setSocialProvider] = useState(null);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState('');

  const handleOpenSocialModal = (provider) => {
    setSocialProvider(provider);
    setSocialEmail('');
    setSocialError('');
    setSocialLoading(false);
    setSocialModalVisible(true);
  };

  const handleSocialSubmit = async () => {
    if (!socialEmail || !socialEmail.includes('@')) {
      setSocialError('Por favor ingresa un correo válido.');
      return;
    }
    try {
      setSocialLoading(true);
      setSocialError('');
      await socialLogin({ email: socialEmail, provider: socialProvider });
      setSocialModalVisible(false);
      
      const token = getToken();
      if (token) {
        navigation.replace('Home');
      } else {
        setSocialError('Error al obtener la sesión.');
      }
    } catch (error) {
      setSocialError(error.message || 'Error al iniciar sesión con el proveedor.');
    } finally {
      setSocialLoading(false);
    }
  };

  const validate = () => {
    const e = {};
    if (!email.includes('@')) e.email = 'Email inválido';
     if (password.length < 8)  e.password = 'Mínimo 8 caracteres';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      setSubmitError('');
      await loginUser({ email, password });
    } catch (error) {
      const raw = (error.message || '').toLowerCase();
      if (raw.includes('verificada') || raw.includes('verificado')) {
        navigation.navigate('Verification', { email });
        return;
      }
      setSubmitError('Correo o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    const token = getToken();
    if (token) {
      navigation.replace('Home');
    } else {
      setSubmitError('Error al iniciar sesión. Intenta de nuevo.');
    }
    setLoading(false);
  };

  return (
    <AuthSplitLayout
      panelTitle="Excelencia en la Gestión Académica"
      panelSubtitle="Accede a tu información académica de manera rápida y segura.">
      <Text style={styles.title}>Bienvenido!</Text>
      <Text style={styles.subtitle}>Gestión Institucional Centralizada</Text>

      <CustomInput
        label="Correo"
        placeholder=""
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        error={errors.email}
        compact={isCompact}
      />
      <CustomInput
        label="Contraseña"
        placeholder=""
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        error={errors.password}
        compact={isCompact}
      />

      {submitError ? (
        <View style={styles.alertBox}>
          <Text style={styles.alertIcon}>!</Text>
          <Text style={styles.alertText}>{submitError}</Text>
        </View>
      ) : null}

      <TouchableOpacity style={styles.forgot} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotText}>¿Olvidó su contraseña?</Text>
      </TouchableOpacity>

      <PrimaryButton
        title="Iniciar Sesión"
        onPress={handleLogin}
        loading={loading}
        style={styles.primaryButton}
        textStyle={styles.primaryButtonText}
      />

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>O accede mediante</Text>
        <View style={styles.divider} />
      </View>

      <SocialButtons
        wide
        onPressGoogle={() => handleOpenSocialModal('google')}
        onPressMicrosoft={() => handleOpenSocialModal('microsoft')}
      />

      <View style={styles.row}>
        <Text style={styles.mutedText}>¿No tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Regístrate Aquí</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={socialModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSocialModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            
            {/* Header: Logo */}
            <View style={styles.modalHeader}>
              {socialProvider === 'google' ? (
                <Image source={require('../assets/google.png')} style={styles.socialLogoImg} />
              ) : (
                <Image source={require('../assets/microsoftLogo.png')} style={styles.socialLogoImg} />
              )}
            </View>

            {/* Brand Title */}
            <Text style={styles.modalTitle}>
              {socialProvider === 'google' ? 'Iniciar sesión con Google' : 'Iniciar sesión en Microsoft'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {socialProvider === 'google' ? 'Usa tu cuenta de Google o correo institucional' : 'Usa tu cuenta profesional o educativa'}
            </Text>

            {/* Input Email */}
            <View style={styles.socialInputContainer}>
              <Text style={styles.socialInputLabel}>Correo electrónico</Text>
              <TextInput
                style={styles.socialTextInput}
                placeholder="ejemplo@soy.sena.edu.co"
                placeholderTextColor="#A0AEC0"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={socialEmail}
                onChangeText={setSocialEmail}
                editable={!socialLoading}
              />
            </View>

            {/* Error Message inside modal */}
            {socialError ? (
              <View style={styles.socialErrorBox}>
                <Text style={styles.socialErrorText}>{socialError}</Text>
              </View>
            ) : null}

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setSocialModalVisible(false)}
                disabled={socialLoading}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  { backgroundColor: socialProvider === 'google' ? '#1A73E8' : '#0067B8' }
                ]}
                onPress={handleSocialSubmit}
                disabled={socialLoading}
              >
                {socialLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Siguiente</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AuthSplitLayout>
  );
}

const styles = StyleSheet.create({
  title:     { 
    fontSize: 23,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom:10 },

  subtitle:  { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#6B7280', 
    marginBottom: 24 
  },

  forgot: 
     { 
      alignSelf: 'flex-end', 
      marginBottom: 14, 
      marginTop: -4
    
  },

  forgotText:{ 
    fontSize: 12, 
    color: '  #0F9F76', 
    fontWeight: '800' 
  },

  primaryButton: { 
    height: 44, 
    borderRadius: 8,
     backgroundColor: '#0F9F76', 
     shadowOpacity: 0, elevation: 0 
    },

  primaryButtonText: { 
    color: '#FFFFFF', 
    fontSize: 13, 
    fontWeight: '800' 
  },

  dividerRow: {
     flexDirection: 'row',
      alignItems: 'center',
      gap: 8, 
      marginTop: 22 
    },

  divider: { 
    flex: 1, 
    height: 1,
   backgroundColor: '#E5E7EB' 
  },

  dividerText: { 
    color: '#9CA3AF', 
    fontSize: 11, 
    fontWeight: '600'
   },

  alertBox:  {
     flexDirection: 'row', 
     alignItems: 'center', 
     backgroundColor: '#FEE2E2',
      borderLeftWidth: 4, 
      borderLeftColor: '#EF4444', 
      borderRadius: 8, 
      paddingHorizontal: 14,
       paddingVertical: 10, 
       marginBottom: 14, gap: 10 },

  alertIcon: { 
  fontSize: 15 },

  alertText: { 
    flex: 1, 
    color: '#B91C1C', 
    fontSize: 13, 
    fontWeight: '500'
   },

  row:       { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },

  mutedText: { 
    fontSize: 14, 
    color: '#6B7280' 
  },

  link:      {
     fontSize: 14, 
     color: '#0F766E', 
     fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  socialLogoImg: {
    width: 38,
    height: 38,
    resizeMode: 'contain',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  socialInputContainer: {
    marginBottom: 16,
  },
  socialInputLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#718096',
    marginBottom: 6,
  },
  socialTextInput: {
    borderWidth: 1,
    borderColor: '#CBD5E0',
    borderRadius: 6,
    height: 42,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#2D3748',
    backgroundColor: '#FAFBFC',
  },
  socialErrorBox: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FEB2B2',
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  socialErrorText: {
    color: '#C53030',
    fontSize: 13,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  cancelBtnText: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    height: 38,
    minWidth: 90,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
