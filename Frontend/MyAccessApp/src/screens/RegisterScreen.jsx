import React, { useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { styles } from '../constants/styles';
import Icon from '../components/Icon';
import BottomTab from '../components/BottomTab';

const RegisterScreen = ({ onContinue, activeTab, setActiveTab }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  return (
    <SafeAreaView style={styles.authSafeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.authScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.authHeader}>
            <Text style={styles.authHeaderTitle}>Crea <Text style={styles.authHeaderAccent}>tu</Text> cuenta!</Text>
            <Text style={styles.authHeaderSub}>Únete a nuestra comunidad</Text>
          </View>
          <View style={styles.authCard}>
            <Text style={styles.authCardTitle}>Registrarte ✏</Text>
            <View style={styles.inputWrapper}>
              <View style={styles.inputIconBox}><Icon name="user" size={16} /></View>
              <TextInput style={styles.textInput} placeholder="Nombre" value={name} onChangeText={setName} />
            </View>
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
            <TouchableOpacity style={styles.primaryBtn} onPress={onContinue} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Continuar</Text>
            </TouchableOpacity>
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}><Text style={styles.socialBtnText}>⊞</Text></TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}><Text style={[styles.socialBtnText, { color: '#EA4335' }]}>G</Text></TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomTab active={activeTab} setActive={setActiveTab} />
    </SafeAreaView>
  );
};

export default RegisterScreen;