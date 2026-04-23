import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { colors } from '../theme/colors.jsx';
import CustomInput from '../components/CustomInput.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import HeaderCurved from '../components/HeaderCurved.jsx';
import { loginUser } from '../services/authService';
import {HomeGatewayScreen} from'../screens/HomeGatewayScreen.jsx';

export default function LoginGatewayScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email.includes('@')) newErrors.email = 'Email invalido';
    if (password.length < 6) newErrors.password = 'Minimo 6 caracteres';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setSubmitError('');
      await loginUser({ email, password });
      Alert.alert('Inicio exitoso', 'Tu sesion fue iniciada correctamente.');
      navigation.replace('HomeGatewayScreen')
    } catch (error) {
      const message = error.message || 'No fue posible iniciar sesion.';
      setSubmitError(message);

      if (message.toLowerCase().includes('verificada')) {
        navigation.navigate('Verification', { email });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <HeaderCurved height={180} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Iniciar Sesion</Text>
        <Text style={styles.subtitle}>Ingresa tus credenciales</Text>

        <CustomInput
          icon="📧"
          placeholder="Correo electronico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
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

        <PrimaryButton title="Iniciar" onPress={handleLogin} loading={loading}  /> ;

        <TouchableOpacity onPress={() => navigation.navigate('')}>
          <Text>
            olvide mi contraseña
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.switchButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.switchText}>
            No tienes cuenta? <Text style={styles.switchTextBold}>Registrate </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  submitError: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  switchTextBold: {
    fontWeight: 'bold',
    color: colors.text,
  },
});
