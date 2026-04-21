import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { styles } from '../constants/styles';
import Icon from './Icon';

const DataField = ({ icon, label, value, onChange, placeholder, keyboardType = 'default' }) => (
  <View style={styles.dataFieldWrapper}>
    <View style={styles.dataFieldIconBox}>
      <Icon name={icon} size={16} />
    </View>
    <View style={styles.dataFieldContent}>
      <Text style={styles.dataFieldLabel}>{label}</Text>
      <TextInput
        style={styles.dataFieldInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

export default DataField;