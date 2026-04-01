import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../constants/styles';
import Icon from '../components/Icon';

const LoginScreen = ({ onLogin, onRegister, onForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  return (
    <SafeAreaView style={styles.authSafeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.authHeader}>
            <Text style={styles.authHeaderTitle}>
              Bienven<Text style={styles.authHeaderAccent}>ido</Text>🔍!
            </Text>
            <Text style={styles.authHeaderSub}>Un nuevo comienzo te espera.</Text>
          </View>
          <View style={styles.authCard}>
            <Text style={styles.authCardTitle}>Login <Icon name="user" size={18} /></Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}><Icon name="email" size={16} /></View>
              <TextInput style={styles.textInput} placeholder="correo@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}><Icon name="lock" size={16} /></View>
              <TextInput style={[styles.textInput, { flex: 1 }]} placeholder="••••••••••••" value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Icon name={showPass ? 'eye' : 'eyeOff'} size={16} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onForgot} style={styles.forgotLink}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryBtn} onPress={onLogin} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Iniciar sesión</Text>
            </TouchableOpacity>
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}><Text style={styles.socialBtnText}>⊞</Text></TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}><Text style={[styles.socialBtnText, { color: '#EA4335' }]}>G</Text></TouchableOpacity>
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchText}>¿Ya tienes cuenta? </Text>
              <TouchableOpacity onPress={onRegister}><Text style={styles.switchLink}>Regístrate Aquí</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;