import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { requestPasswordResetCode, updatePasswordWithCode } from '../services/authService';
import WebFrame from '../components/WebFrame.jsx';

export default function RecoverPasswordScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isTablet = width >= 768 && width < 900;
  const isSmallDevice = height < 700;

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const cardWidth = isDesktop ? 380 : isTablet ? Math.min(width * 0.6, 360) : Math.min(width * 0.82, 320);
  const headerHeight = isDesktop ? 260 : isTablet ? 240 : isSmallDevice ? 210 : 230;
  const titleSize = isDesktop ? 42 : isTablet ? 38 : isSmallDevice ? 28 : 34;
  const subtitleSize = isDesktop ? 15 : isTablet ? 14 : 13;
  const contentTop = isDesktop ? -14 : isTablet ? -12 : -8;

  const resetMessages = () => {
    setSubmitError('');
    setSuccessMessage('');
  };

  const handleSendCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setSuccessMessage('');
      setSubmitError('Ingresa tu correo.');
      return;
    }

    if (!normalizedEmail.includes('@')) {
      setSuccessMessage('');
      setSubmitError('Ingresa un correo valido.');
      return;
    }

    try {
      setLoading(true);
      resetMessages();
      await requestPasswordResetCode(normalizedEmail);
      setStep(1);
      setSuccessMessage('Te enviamos un codigo de verificacion a tu correo.');
      
    } catch (error) {
      setSuccessMessage('');
      setSubmitError(error.message || 'No fue posible enviar el codigo al correo.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      setSuccessMessage('');
      setSubmitError('Ingresa el codigo de verificacion.');
      return;
    }

    if (newPassword.length < 8) {
      setSuccessMessage('');
      setSubmitError('La nueva contrasena debe tener minimo 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSuccessMessage('');
      setSubmitError('Las contrasenas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      resetMessages();
      await updatePasswordWithCode(normalizedEmail, normalizedCode, newPassword);
      setSuccessMessage('Tu contrasena fue actualizada correctamente.');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 900);
    } catch (error) {
      setSuccessMessage('');
      setSubmitError(error.message || 'No fue posible actualizar la contrasena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <WebFrame>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.header, { height: headerHeight }]}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={[styles.title, { fontSize: titleSize }]}>Recupera tu</Text>
              <Text style={[styles.title, styles.titleDark, { fontSize: titleSize }]}>cuenta!</Text>
              <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>
                {step === 0 ? 'Te enviaremos un codigo a tu correo.' : 'Ingresa el codigo y define tu nueva contrasena.'}
              </Text>
            </View>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.curve} />

            <View style={[styles.content, { width: cardWidth, marginTop: contentTop }]}>
              <View style={styles.labelRow}>
                <Text style={styles.labelIcon}>✉</Text>
                <Text style={styles.labelText}>Ingresa tu correo:</Text>
              </View>

              <TextInput
                style={styles.input}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#8B9B99"
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  resetMessages();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={step === 0}
              />

              {step === 1 ? (
                <>
                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>#</Text>
                    <Text style={styles.labelText}>Codigo de verificacion:</Text>
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="123456"
                    placeholderTextColor="#8B9B99"
                    value={code}
                    onChangeText={(value) => {
                      setCode(value.replace(/[^0-9]/g, ''));
                      resetMessages();
                    }}
                    keyboardType="numeric"
                    maxLength={6}
                  />

                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>🔒</Text>
                    <Text style={styles.labelText}>Nueva contraseña:</Text>
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Minimo 8 caracteres"
                    placeholderTextColor="#8B9B99"
                    value={newPassword}
                    onChangeText={(value) => {
                      setNewPassword(value);
                      resetMessages();
                    }}
                    secureTextEntry
                  />

                  <View style={styles.labelRow}>
                    <Text style={styles.labelText}>Confirmar contraseña:</Text>
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Repite la contraseña"
                    placeholderTextColor="#8B9B99"
                    value={confirmPassword}
                    onChangeText={(value) => {
                      setConfirmPassword(value);
                      resetMessages();
                    }}
                    secureTextEntry
                  />
                </>
              ) : null}

              {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}
              {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

              <PrimaryButton
                title={step === 0 ? 'enviar codigo' : 'actualizar contrasena'}
                onPress={step === 0 ? handleSendCode : handleUpdatePassword}
                loading={loading}
                style={styles.button}
                textStyle={styles.buttonText}
              />

              {step === 1 ? (
                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={() => {
                    setStep(0);
                    setCode('');
                    setNewPassword('');
                    setConfirmPassword('');
                    resetMessages();
                  }}
                >
                  <Text style={styles.secondaryActionText}>Cambiar correo</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </WebFrame>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: colors.primary,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 18,
    zIndex: 2,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  backArrow: {
    fontSize: 24,
    color: colors.primary,
    marginTop: -2,
  },
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 18,
  },
  title: {
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 54,
  },
  titleDark: {
    color: '#3E4A4A',
    marginTop: -4,
  },
  subtitle: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  bottomSection: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  curve: {
    width: '100%',
    height: 78,
    backgroundColor: colors.background,
    borderTopLeftRadius: 90,
    borderTopRightRadius: 90,
    marginTop: -34,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 24,
  },
  labelRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  labelIcon: {
    fontSize: 20,
    color: colors.primary,
    marginRight: 8,
  },
  labelText: {
    fontSize: 18,
    color: '#5D6364',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 28,
    paddingHorizontal: 24,
    textAlign: 'center',
    color: '#5E7C74',
    fontSize: 16,
    marginBottom: 14,
  },
  errorText: {
    width: '100%',
    color: '#D14343',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  successText: {
    width: '100%',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: colors.primary,
    shadowOpacity: 0,
    elevation: 0,
    marginTop: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    fontStyle: 'bold',
    textDecorationLine: 'underline',
    color: '#455253',
  },
  secondaryAction: {
    marginTop: 14,
  },
  secondaryActionText: {
    color: '#5D6364',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
