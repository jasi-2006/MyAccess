import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { normalizeRole, ROLES } from '../utils/accessControl';

const sidebarItems = [
  { key: 'home', label: 'Inicio', icon: '🏠' },
  { key: 'cards', label: 'Mi carnets', icon: '🪪' },
  { key: 'Fichas', label: 'Gestion de ficha', icon: '🗂️', management: true },
  { key: 'User', label: 'Mi perfil', icon: '🧑' },
  { key: 'Notifications', label: 'Notificaciones', icon: '🔔' },
  { key: 'status', label: 'Mi estado de tramite', icon: '🔀' },
];

export default function CarnetSidebar({ navigation, role, activeKey = 'cards' }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const normalizedRole = normalizeRole(role);
  const canManage = normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.INSTRUCTOR;
  const visibleItems = sidebarItems.filter((item) => !item.management || canManage);

  const handlePress = (key) => {
    if (key === 'home') navigation.navigate('Home');
    if (key === 'Fichas') navigation.navigate('Fichas');
    if (key === 'User') navigation.navigate('User');
    if (key === 'Notifications') navigation.navigate('Notifications');
  };

  if (isMobile) {
    return (
      <View style={styles.mobileMenu}>
        {visibleItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.mobileMenuItem, activeKey === item.key && styles.menuItemActive]}
            onPress={() => handlePress(item.key)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.mobileMenuLabel, activeKey === item.key && styles.menuLabelActive]} numberOfLines={2}>
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
        {visibleItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.sidebarItem, activeKey === item.key && styles.menuItemActive]}
            onPress={() => handlePress(item.key)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.sidebarLabel, activeKey === item.key && styles.menuLabelActive]}>
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
    width: 72,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#55D7AF',
    paddingVertical: 10,
  },
  sidebarList: { gap: 4 },
  sidebarItem: {
    paddingHorizontal: 4,
    paddingVertical: 6,
    gap: 4,
    marginHorizontal: 3,
    borderRadius: 16,
    alignItems: 'center',
  },
  sidebarLabel: { fontSize: 9, color: '#232323', lineHeight: 11, textAlign: 'center' },
  mobileMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 12,
  },
  mobileMenuItem: {
    flex: 1,
    minHeight: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8EBDD',
    borderRadius: 16,
    paddingHorizontal: 3,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mobileMenuLabel: { fontSize: 9, color: '#28323C', textAlign: 'center', lineHeight: 11 },
  menuItemActive: {
    backgroundColor: '#2FD16A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  menuLabelActive: { color: '#FFFFFF', fontWeight: '600' },
  menuIcon: { fontSize: 16, fontWeight: '900', color: '#079B72' },
});
