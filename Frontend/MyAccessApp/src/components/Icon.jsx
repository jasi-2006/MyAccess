import React from 'react';
import { Text } from 'react-native';
import { COLORS } from '../constants/colors';

const Icon = ({ name, size = 20, color = COLORS.subtitle }) => {
  const icons = {
    email: '✉', lock: '🔒', eye: '👁', eyeOff: '🙈',
    user: '👤', document: '🪪', hash: '#', blood: '🩸',
    building: '🏢', center: '🏫', role: '👔', program: '⚙',
    file: '📁', camera: '📷', badge: '🪪',
  };
  return <Text style={{ fontSize: size, color }}>{icons[name] || '•'}</Text>;
};

export default Icon;