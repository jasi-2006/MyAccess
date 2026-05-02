import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomInput from './CustomInput.jsx';

const inp = (icon, placeholder, value, onCT, extra = {}) => ({ icon, placeholder, value, onCT, ...extra });

export default function RegisterSteps({ step, values, onChange, errors, isMobile = false, showLabels = false }) {
  const o = (k) => (v) => onChange(k, v);
  const isCarnetStep = step === 1;
  const { name, typeDocument, document, bloodType, regional, trainingCenter, nameRole, trainingProgram, Ficha, email, password } = values;

  const stepFields = [
    [
      inp('👤', 'Nombre completo',     name,         o('name'),         { error: errors.name,     autoCapitalize: 'words' }),
      inp('🪪', 'Tipo de documento',   typeDocument,  o('typeDocument'), {}),
      inp('#️⃣', 'Número de documento', document,      o('document'),     { error: errors.document, keyboardType: 'numeric' }),
      inp('🩸', 'Tipo de sangre',      bloodType,     o('bloodType'),    { error: errors.bloodType, autoCapitalize: 'characters' }),
    ],
    [
      inp('📄', 'Regional',             regional,        o('regional'),        {}),
      inp('🏢', 'Centro de formación',  trainingCenter,  o('trainingCenter'),  {}),
      inp('👤', 'Rol',                  nameRole,        o('nameRole'),        {}),
      inp('⚙️', 'Programa de formación', trainingProgram, o('trainingProgram'), { error: errors.trainingProgram }),
      inp('🔢', 'N° Ficha',             Ficha,           o('Ficha'),           { error: errors.Ficha, keyboardType: 'numeric' }),
    ],
    [
      inp('📧', 'Correo electrónico', email,    o('email'),    { error: errors.email,    keyboardType: 'email-address', autoCapitalize: 'none' }),
      inp('🔒', 'Contraseña',         password, o('password'), { error: errors.password, secureTextEntry: true }),
    ],
  ];

  return (
    <View style={[styles.container, isCarnetStep && styles.containerDense]}>
      {stepFields[step].map((f) => (
        <CustomInput
          key={f.placeholder}
          label={showLabels ? f.placeholder : ''}
          compact={!isMobile}
          icon={showLabels ? '' : f.icon}
          placeholder={showLabels ? '' : f.placeholder}
          value={f.value}
          onChangeText={f.onCT}
          error={f.error}
          keyboardType={f.keyboardType}
          autoCapitalize={f.autoCapitalize}
          secureTextEntry={f.secureTextEntry}
          dense={isCarnetStep && !isMobile}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 2 },
  containerDense: { gap: 0 },
});
