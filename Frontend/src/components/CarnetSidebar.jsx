import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { normalizeRole, ROLES } from '../utils/accessControl';

const sidebarItems = [
  { key: 'home',        label: 'Inicio'      },
  { key: 'Card',        label: 'Mi carnet', management: true},
  { key: 'User',        label: 'Mi perfil'},
  { key: 'Notifications', label: 'Notificaciones'},
  { key: 'status',      label: 'Estado tramite', aprendizOnly: true },
  { key: 'SofiaVerification', label: 'Validar Sofia Plus', aprendizOnly: true },
  { key: 'Instructor',  label: 'Dashboard', managementOnly: true },
  { key: 'Fichas',      label: 'Fichas', managementOnly: true },
  { key: 'Solicitudes', label: 'Solicitudes', managementOnly: true },
  { key: 'Historial',   label: 'Historial', managementOnly: true },
  { key: 'Imprimir',    label: 'Imprimir', managementOnly: true },
];

export default function CarnetSidebar({ navigation, role, activeKey }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const normalizedRole = normalizeRole(role);
  const canManage = normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.INSTRUCTOR;

  const visibleItems = sidebarItems.filter((item) => {
    if (item.managementOnly && !canManage) return false;
    if (item.aprendizOnly && canManage) return false;
    if (item.aprendizOnly && canManage) return false;
    return true;
  });

  const handlePress = (key) => {
    const routes = {
      home: 'Home', Card: 'Card', User: 'User',
      status: 'Tramite', Notifications: 'Notifications', Instructor: 'Instructor',
      Fichas: 'Fichas', Solicitudes: 'Solicitudes', Historial: 'Historial',
      Imprimir: 'Imprimir', SofiaVerification: 'SofiaVerification',
    };
    if (routes[key]) navigation.navigate(routes[key]);
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
    width: 200, backgroundColor: '#FFFFFF',
    borderRightWidth: 1, borderRightColor: '#55D7AF', paddingVertical: 40,
  },
  sidebarList: { gap: 4 },
  sidebarItem: {
    paddingHorizontal: 8, paddingVertical: 12, gap: 4,
    marginHorizontal: 9, borderRadius: 10, left: 10,
  
  },
  sidebarLabel: { fontSize: 14, color: '#232323', lineHeight: 11,   width: 190 },
  mobileMenu: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 6, marginBottom: 12,
  },
  mobileMenuItem: {
    flex: 1, minHeight: 52, backgroundColor: '#FFFFFF',
    borderWidth: 1, borderColor: '#D8EBDD', borderRadius: 16,
    paddingHorizontal: 3, paddingVertical: 6,
    justifyContent: 'center', alignItems: 'center', gap: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  mobileMenuLabel: { fontSize: 9, color: '#28323C', textAlign: 'center', lineHeight: 11 },
  menuItemActive: {
    backgroundColor: '#2FD16A',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
  },
  menuLabelActive: { color: '#FFFFFF', fontWeight: '600' },
  menuIcon: { fontSize: 18, color: '#079B72' },
});
