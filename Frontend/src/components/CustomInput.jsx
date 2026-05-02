import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors } from '../theme/colors.jsx';

export default function CustomInput({ 
  label,
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  error = '',
  keyboardType = 'default',
  autoCapitalize = 'none',
  compact = false,
  dense = false,
}) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={[styles.container, compact && styles.containerCompact, dense && styles.containerDense]}>
      {label ? <Text style={[styles.label, dense && styles.labelDense]}>{label}</Text> : null}
      <View style={[styles.inputContainer, compact && styles.inputContainerCompact, dense && styles.inputContainerDense, error && styles.inputError]}>
        {icon && <Text style={[styles.icon, compact && styles.iconCompact, dense && styles.iconDense]}>{icon}</Text>}
        <TextInput
          style={[styles.input, compact && styles.inputCompact, dense && styles.inputDense]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Text style={[styles.eyeIcon, compact && styles.iconCompact]}>{isPasswordVisible ? '👁️' : '👁️'}</Text>
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container:            { marginBottom: 16 },
  containerCompact:     { marginBottom: 8 },
  containerDense:       { marginBottom: 5 },
  label:                { color: colors.textSecondary, fontSize: 11, fontWeight: '800', letterSpacing: 0.3, marginBottom: 8, textTransform: 'uppercase' },
  labelDense:           { fontSize: 9, marginBottom: 5 },
  inputContainer:       { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primaryLight, borderRadius: 28, paddingHorizontal: 20, height: 56 },
  inputContainerCompact:{ height: 42, paddingHorizontal: 14, borderRadius: 22 },
  inputContainerDense:  { height: 34, paddingHorizontal: 12, borderRadius: 17 },
  inputError:           { borderWidth: 1, borderColor: colors.error },
  icon:                 { fontSize: 20, marginRight: 12 },
  iconCompact:          { fontSize: 15, marginRight: 8 },
  iconDense:            { fontSize: 13, marginRight: 6 },
  input:                { flex: 1, fontSize: 16, color: colors.text },
  inputCompact:         { fontSize: 13 },
  inputDense:           { fontSize: 12 },
  eyeIcon:              { fontSize: 20 },
  errorText:            { color: colors.error, fontSize: 12, marginTop: 4, marginLeft: 20 },
});
