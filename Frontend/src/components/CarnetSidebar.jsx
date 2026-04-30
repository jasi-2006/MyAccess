import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';

const sidebarItems = [
  { key: 'home',    label: 'Inicio',             icon: '🏠' },
  { key: 'cards',   label: 'Mi carnets',          icon: '🪪', active: true },
  { key: 'User',    label: 'Mi perfil',           icon: '👤' },
  { key: 'status',  label: 'Mi estado de tramite', icon: '☑' },
];

export default function CarnetSidebar({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const handlePress = (key) => {
    if (key === 'home') navigation.navigate('Home');
    if (key === 'User') navigation.navigate('User');
  };

  if (isMobile) {
    return (
      <View style={styles.mobileMenu}>
        {sidebarItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.mobileMenuItem, item.active && styles.menuItemActive]}
            onPress={() => handlePress(item.key)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.mobileMenuLabel, item.active && styles.menuLabelActive]} numberOfLines={2}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarList}>
        {sidebarItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.sidebarItem, item.active && styles.menuItemActive]}
            onPress={() => handlePress(item.key)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.sidebarLabel, item.active && styles.menuLabelActive]}>
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
    width: 122, backgroundColor: '#FFFFFF',
    borderRightWidth: 1, borderRightColor: '#55D7AF', paddingVertical: 18,
  },
  sidebarTitle: {
    fontSize: 16, lineHeight: 20, fontWeight: '700', color: '#2FD16A',
    paddingHorizontal: 10, marginBottom: 26,
  },
  sidebarList: { gap: 10 },
  sidebarItem: {
    paddingHorizontal: 10, paddingVertical: 12, gap: 8,
    marginHorizontal: 6, borderRadius: 28, alignItems: 'center',
  },
  sidebarLabel: { fontSize: 12, color: '#232323', lineHeight: 15, textAlign: 'center' },
  mobileMenu: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 18,
  },
  mobileMenuItem: {
    flex: 1, minHeight: 76, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#D8EBDD', borderRadius: 28,
    paddingHorizontal: 8, paddingVertical: 10,
    justifyContent: 'center', alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  mobileMenuLabel: { fontSize: 11, color: '#28323C', textAlign: 'center', lineHeight: 13 },
  menuItemActive: {
    backgroundColor: '#2FD16A',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
  },
  menuLabelActive: { color: '#FFFFFF', fontWeight: '600' },
  menuIcon: { fontSize: 24 },
});
