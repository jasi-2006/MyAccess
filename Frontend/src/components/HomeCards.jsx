import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';

export default function HomeCards({ navigation }) {
  const { width } = useWindowDimensions();
  const isTablet  = width >= 480 && width < 900;
  const isDesktop = width >= 900;
  const px = isDesktop ? 40 : isTablet ? 24 : 16;

  const items = [
    { icon: '🪪', title: 'Carnet Digital',  desc: 'Accede a tu carnet institucional en cualquier momento.', onPress: () => navigation.navigate('Card') },
    { icon: '🔔', title: 'Notificaciones',  desc: 'Consulta las últimas novedades del centro.',             onPress: () => navigation.navigate('Notifications') },
    { icon: '👤', title: 'Mi Perfil',       desc: 'Revisa y actualiza tu información personal.',            onPress: () => navigation.navigate('User') },
  ];

  return (
    <View style={[styles.cards, { paddingHorizontal: px, flexDirection: isDesktop ? 'row' : 'column' }]}>
      {items.map((item) => (
        <TouchableOpacity key={item.title} style={[styles.card, isDesktop && { flex: 1 }]} onPress={item.onPress}>
          <Text style={[styles.cardIcon, { fontSize: isDesktop ? 28 : 22 }]}>{item.icon}</Text>
          <Text style={[styles.cardTitle, { fontSize: isDesktop ? 16 : 14 }]}>{item.title}</Text>
          <Text style={[styles.cardDesc,  { fontSize: isDesktop ? 13 : 12 }]}>{item.desc}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  cards: { gap: 12, paddingVertical: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  cardIcon:  { marginBottom: 8 },
  cardTitle: { fontWeight: '600', color: '#1F2937', marginBottom: 6 },
  cardDesc:  { color: '#6B7280', lineHeight: 18 },
});

