import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { colors } from '../theme/colors.jsx';
import CustomInput from '../components/CustomInput.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { forgotPassword } from '../services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const horizontalPadding = isDesktop ? width * 0.25 : isTablet ? width * 0.15 : width * 0.08;

  const handleSend = async () => {
    if (!email.includes('@')) {
      setError('Email inválido');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await forgotPassword(email);
      navigation.navigate('VerifyResetCode', { email });
    } catch (e) {
      setError(e.message || 'No fue posible enviar el código.');
    } finally {
      setLoading(false);
    }
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
            <View style={[styles.headerCurved, { paddingHorizontal: horizontalPadding }]}>
              {/* Botón de regreso */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>

              <Text style={styles.headerTitle}>
                Verifica tu{'\n'}correo!
              </Text>
              <Text style={styles.headerSubtitle}>
                Un nuevo comienzo te espera.
              </Text>
            </View>
            {/* Curva decorativa inferior */}
            <View style={[styles.curveDecoration, {
              height: isDesktop ? 60 : isTablet ? 45 : 35,
              borderTopLeftRadius: isDesktop ? 60 : isTablet ? 45 : 35,
              borderTopRightRadius: isDesktop ? 60 : isTablet ? 45 : 35,
            }]} />
          </View>

          {/* ===== CONTENIDO PRINCIPAL ===== */}
          <View style={[styles.content, { paddingHorizontal: horizontalPadding }]}>
            {/* Label del input */}
            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputIcon}>✉️</Text>
              <Text style={styles.inputLabel}>Ingresa tu correo:</Text>
            </View>

            {/* Input Email */}
            <View style={styles.inputWrapper}>
              <CustomInput
                placeholder=""
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                error={error}
                style={styles.customInput}
              />
            </View>

            {/* Botón Validar */}
            <PrimaryButton
              title="validar"
              onPress={handleSend}
              loading={loading}
              style={styles.validateButton}
              textStyle={styles.validateButtonText}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // Verde del header
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
    backgroundColor: '#5AEDB8',
  },
  headerCurved: {
    backgroundColor: '#5AEDB8',
    paddingTop: 20,
    paddingBottom: 50,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backArrow: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 40,
    lineHeight: 50,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 10,
    opacity: 0.9,
  },
  curveDecoration: {
    backgroundColor: '#FFFFFF',
    marginTop: -10,
  },

  // ===== CONTENIDO =====
  content: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  customInput: {
    backgroundColor: '#E8FDF4', // Verde muy claro
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#9CA3AF',
    borderWidth: 0,
  },
  validateButton: {
    backgroundColor: '#5AEDB8',
    borderRadius: 30,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  validateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textDecorationLine: 'underline',
  },
});