import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';

const sidebarItems = [
  { key: 'home',          label: 'Inicio',        icon: '🏠', active: true },
  { key: 'card',          label: 'Carnet',         icon: '🪪' },
  { key: 'notifications', label: 'Notificaciones', icon: '🔔' },
  { key: 'User',       label: 'Mi Perfil',      icon: '👤' },
];

export default function HomeSidebar({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile  = width < 480;
  const isTablet  = width >= 480 && width < 900;
  const isDesktop = width >= 900;

  const handlePress = (key) => {
    if (key === 'card') navigation.navigate('Card');
    if (key === 'home') navigation.navigate('Home');
    if (key === 'User') navigation.navigate('User');
  };

  if (isMobile) {
    return (
      <View style={styles.mobileMenu}>
        {sidebarItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.mobileItem, item.active && styles.itemActive]}
            onPress={() => handlePress(item.key)}
          >
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <Text style={[styles.mobileLabel, item.active && styles.labelActive]} numberOfLines={2}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={[styles.sidebar, { width: isDesktop ? 140 : 110 }]}>
      <Text style={styles.sidebarTitle}>MyAccess</Text>
      <View style={styles.sidebarList}>
        {sidebarItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.sidebarItem, item.active && styles.itemActive]}
            onPress={() => handlePress(item.key)}
          >
            <Text style={styles.itemIcon}>{item.icon}</Text>
            <Text style={[styles.sidebarLabel, item.active && styles.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1, borderRightColor: '#D1FAE5',
    paddingVertical: 18,
  },
  sidebarTitle: {
    fontSize: 14, fontWeight: '800', color: '#0F766E',
    paddingHorizontal: 10, marginBottom: 24, textAlign: 'center',
  },
  sidebarList: { gap: 8 },
  sidebarItem: {
    paddingHorizontal: 10, paddingVertical: 12, gap: 6,
    marginHorizontal: 6, borderRadius: 28, alignItems: 'center',
  },
  sidebarLabel: { fontSize: 11, color: '#374151', textAlign: 'center', lineHeight: 14 },

  mobileMenu: {
    flexDirection: 'row', gap: 10, marginBottom: 20,
  },
  mobileItem: {
    flex: 1, minHeight: 70, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#D1FAE5', borderRadius: 28,
    paddingHorizontal: 6, paddingVertical: 10,
    justifyContent: 'center', alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
  },
  mobileLabel: { fontSize: 10, color: '#374151', textAlign: 'center', lineHeight: 13 },

  itemActive: {
    backgroundColor: '#0F766E',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
  },
  labelActive: { color: '#FFFFFF', fontWeight: '600' },
  itemIcon:    { fontSize: 22 },
});
