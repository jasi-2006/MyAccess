import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { normalizeRole, ROLES } from '../utils/accessControl';

export default function HomeCards({ navigation, role }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 480 && width < 900;
  const isDesktop = width >= 900;
  const px = isDesktop ? 40 : isTablet ? 24 : 16;
  const isAdmin = normalizeRole(role) === ROLES.ADMIN;

  const items = [
    ...(isAdmin
      ? [{
          title: 'Area de gestion',
          desc: 'Administra fichas, solicitudes, carnets y notificaciones.',
          onPress: () => navigation.navigate('Instructor'),
          featured: true,
        }]
      : []),
    {  title: 'Carnet Digital', desc: 'Accede a tu carnet institucional en cualquier momento.', onPress: () => navigation.navigate('Card') },
    {title: 'Notificaciones', desc: 'Consulta las ultimas novedades del centro.', onPress: () => navigation.navigate('Notifications') },
    {title: 'Mi Perfil', desc: 'Revisa y actualiza tu informacion personal.', onPress: () => navigation.navigate('User') },
  ];

  return (
    <View style={[styles.cards, { paddingHorizontal: px, flexDirection: isDesktop ? 'row' : 'column' }]}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.title}
          style={[
            styles.card,
            item.featured && styles.managementCard,
            isDesktop && { flex: 1 },
          ]}
          onPress={item.onPress}
          activeOpacity={0.85}
        >
          <Text style={[styles.cardIcon, item.featured && styles.managementIcon, { fontSize: isDesktop ? 28 : 22 }]}>
            {item.icon}
          </Text>
          <Text style={[styles.cardTitle, item.featured && styles.managementTitle, { fontSize: isDesktop ? 16 : 14 }]}>
            {item.title}
          </Text>
          <Text style={[styles.cardDesc, item.featured && styles.managementDesc, { fontSize: isDesktop ? 13 : 12 }]}>
            {item.desc}
          </Text>
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
    borderWidth: 1,
    borderColor: 'transparent',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  managementCard: {
    backgroundColor: '#E8FFF5',
    borderColor: '#DDF7EC',
    borderRightWidth: 4,
    borderRightColor: '#24C565',
  },

  cardTitle: { fontWeight: '600', color: '#1F2937', marginBottom: 6 },
  cardDesc: { color: '#6B7280', lineHeight: 18 },
  managementIcon: { color: '#079B72', fontWeight: '900' },
  managementTitle: { color: '#079B72', fontWeight: '900' },
  managementDesc: { color: '#047857', fontWeight: '700' },
});
