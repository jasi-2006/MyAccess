import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, useWindowDimensions,
} from 'react-native';
import CustomInput from '../components/CustomInput.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import SocialButtons from '../components/SocialButtons.jsx';
import AuthSplitLayout from '../components/AuthSplitLayout.jsx';
import { loginUser } from '../services/authService';
import { getToken } from '../services/api';

export default function LoginGatewayScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email.includes('@')) e.email = 'Email inválido';
    if (password.length < 6)  e.password = 'Mínimo 6 caracteres';
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
      panelSubtitle="Accede a tu portal unificado para el seguimiento de fichas, gestión de aprendices y reportes estadísticos en tiempo real."
    >
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

      <SocialButtons wide />

      <View style={styles.row}>
        <Text style={styles.mutedText}>¿No tienes cuenta? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Regístrate Aquí</Text>
        </TouchableOpacity>
      </View>
    </AuthSplitLayout>
  );
}

const styles = StyleSheet.create({
  title:     { 
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4 },

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
});
