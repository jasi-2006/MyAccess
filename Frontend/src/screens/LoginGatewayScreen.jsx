import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { colors } from '../theme/colors.jsx';
import CustomInput from '../components/CustomInput.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { loginUser } from '../services/authService';

export default function LoginGatewayScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Responsive breakpoints
  const isSmallDevice = width < 375;
  const isTablet = width >= 500 && width < 1024;
  const isDesktop = width >= 600;
  
  const scale = isDesktop ? 1.4 : isTablet ? 1.2 : isSmallDevice ? 0.9 : 1.7;
  const horizontalPadding = isDesktop ? width * 0.29 : isTablet ? width * 0.20 : width * 0.10;

  const validateForm = () => {
    const newErrors = {};
    if (!email.includes('@')) newErrors.email = 'Email inválido';
    if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setSubmitError('');
      await loginUser({ email, password });
      navigation.replace('Home');
    } catch (error) {
      const raw = (error.message || '').toLowerCase();
      let message = 'Correo o contraseña incorrectos.';

      if (raw.includes('verificada') || raw.includes('verificado')) {
        message = 'Tu cuenta no está verificada. Revisa tu correo.';
        navigation.navigate('Verification', { email });
      }

      setSubmitError(message);
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
    socialIcon: {
      width: isDesktop ? 25 : isTablet ? 36 : 28,
      height: isDesktop ? 25 : isTablet ? 36 : 28,
      resizeMode: 'contain',
      paddingBottom:
        isDesktop ? 240 : 9,
    },
    headerCurved: {
      backgroundColor: colors.primary,
      paddingTop: isDesktop ? height * 0.003 : height * 0.04,
      paddingBottom: isDesktop ? height * 0.02 : height * 0.03,
      paddingHorizontal: horizontalPadding,
    },
    content: {
      flex: 1,
      paddingHorizontal: horizontalPadding,
      paddingTop: isDesktop ? 40 : 20 * scale,
      paddingBottom: isDesktop ? 50 : 30 * scale,
      backgroundColor: '#FFFFFF',
    },
    loginTitle: {
      fontSize: (isDesktop ? 20 : isTablet ? 32 : isSmallDevice ? 11 : 20) * scale,
      fontWeight: '600',
      color: '#0F766E',
      marginTop: (isDesktop ? -65 : isTablet ? 31 : isSmallDevice ? -14: -24) ,
    },
    headerSubtitle: {
      fontSize: (isDesktop ? 14  : isTablet ? 18 : isSmallDevice ? 13 : 15) * scale,
      color: '#FFFFFF',
      marginTop: (isDesktop ? -80 : isTablet ? 12: isSmallDevice ? 12 : 1),
      opacity: 0.9,
      textAlign: 'center',
    },
    socialButton: {
      width: isDesktop ? 40 : isTablet ? 60 : 50,
      height: isDesktop ? 40 : isTablet ? 60 : 50,
      borderRadius: 16,
      backgroundColor: '#F3F4F6',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    curveDecoration: {
      height: isDesktop ? 60 : isTablet ? 40 : 30,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: isDesktop ? 60 : isTablet ? 40 : 30,
      borderTopRightRadius: isDesktop ? 60 : isTablet ? 40 : 30,
      marginTop: 10,
    },
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ===== HEADER VERDE CON CURVA ===== */}
          <View style={styles.headerContainer}>
            <View style={dynamicStyles.headerCurved}>
              <Image
                style={dynamicStyles.headerImage}
                source={require('../assets/login.png')}
              />
              <Text style={dynamicStyles.headerSubtitle}>
                Un nuevo comienzo te espera.
              </Text>
            </View>
            {/* Curva decorativa inferior */}
            <View style={dynamicStyles.curveDecoration} />
          </View>

          {/* ===== CONTENIDO PRINCIPAL ===== */}
          <View style={dynamicStyles.content}>
            {/* Título Login */}
            <View style={styles.loginTitleContainer}>
              <Text style={dynamicStyles.loginTitle}>Login</Text>
            </View>

            {/* Input Email */}
            <View style={styles.inputWrapper}>
              <CustomInput
                icon="📧"
                placeholder="Correo electrónico"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                error={errors.email}
              />
            </View>

            {/* Input Password */}
            <CustomInput
              icon="🔒"
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            {/* Alerta de error */}
            {submitError ? (
              <View style={styles.alertBox}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.alertText}>{submitError}</Text>
              </View>
            ) : null}

            {/* Olvidé contraseña */}
            <TouchableOpacity
              style={styles.forgotContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={[styles.forgotText, { fontSize: isDesktop ? 14 : 14 }]}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Botón Iniciar Sesión */}

            <PrimaryButton 
              title="Iniciar" 
              onPress={handleLogin} 
              loading={loading} 
            />
            

            {/* Login Social */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={dynamicStyles.socialButton}>
                <Image
                  source={require('../assets/microsoftLogo.png')}
                  style={dynamicStyles.socialIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity style={dynamicStyles.socialButton}>
                <Image
                  source={require('../assets/google.png')}
                  style={dynamicStyles.socialIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Registro */}
            <View style={styles.registerContainer}>
              <Text style={[styles.registerText, { fontSize: isDesktop ? 14 : 18 }]}>¿No tienes cuenta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={[styles.registerLink, { fontSize: isDesktop ? 14 : 18 }]}>Regístrate Aquí</Text>
              </TouchableOpacity>
            </View>

            {submitError ? null : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:  '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ===== HEADER =====
  headerContainer: {
    width: '100%',
    backgroundColor: colors.primary,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F766E',
    letterSpacing: 1,
    marginBottom: -30,
  },

  // ===== CONTENIDO =====
  loginTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: -9,
  },
 
  loginIcon: {
    marginLeft: 8,
  },

  // Inputs
  inputWrapper: {
    marginBottom: 9,
    height:70,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A7F3D0',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 14,
    width: '100%',
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  inputPlaceholder: {
    color: '#6B7280',
  },
  passwordText: {
    letterSpacing: 3,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 18,
  },

  // Olvidé contraseña
  forgotContainer: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotText: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Botón Login
  loginButton: {
    backgroundColor: '#5EEAD4',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F766E',
  },

  // Social Login
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
    marginTop:43,
  },

  // Registro
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 14,
    color: '#0F766E',
    fontWeight: '600',
  },

  submitError: {
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 14,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    gap: 10,
  },
  alertIcon: { fontSize: 16 },
  alertText: { flex: 1, color: '#B91C1C', fontSize: 14, fontWeight: '500' },
});
