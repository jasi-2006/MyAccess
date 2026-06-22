import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { countUnreadNotifications, getNotifications } from '../services/notificationService.js';
import { logoutUser } from '../services/authService';

export default function HomeNavbar({ navigation, active = 'Home', fullName, role }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const pagePadding = isMobile ? 14 : width < 1100 ? 18 : 24;

  const [notificationCount, setNotificationCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const userInitial = fullName ? fullName.trim().charAt(0).toUpperCase() : 'U';
  const badgeText = notificationCount > 99 ? '99+' : String(notificationCount);

  const loadNotificationCount = useCallback(async () => {
    try {
      const response = await getNotifications();
      setNotificationCount(countUnreadNotifications(response));
    } catch {
      setNotificationCount(0);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadNotificationCount(); }, [loadNotificationCount]));

  const handleLogout = async () => {
    setMenuOpen(false);
    await logoutUser();
    navigation.replace('Login');
  };

  return (
    <View style={[styles.topbar, { paddingHorizontal: pagePadding }]}>

      {/* IZQUIERDA — Logo */}
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={styles.brand}>MyAccess</Text>
      </TouchableOpacity>

      {/* DERECHA — Inicio · Campana · Nombre */}
      <View style={styles.rightSection}>

        {/* Inicio */}
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={[styles.linkText, active === 'Home' && styles.linkActive]}>Inicio</Text>
        </TouchableOpacity>

        {/* Campana */}
        <TouchableOpacity style={styles.bellWrap} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.bellIcon}>🔔</Text>
          {notificationCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badgeText}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Nombre con dropdown Salir */}
        <View style={styles.userWrap}>
          <TouchableOpacity style={styles.userBtn} onPress={() => setMenuOpen((v) => !v)}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{userInitial}</Text>
            </View>
            <Text style={styles.userName} numberOfLines={1}>{fullName || 'Usuario'}</Text>
          </TouchableOpacity>

          {menuOpen && (
            <View style={styles.dropdown}>
              <Text style={styles.dropdownName} numberOfLines={1}>{fullName || 'Usuario'}</Text>
              <View style={styles.divider} />
              <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                <Text style={styles.logoutText}>Salir</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderTopColor: '#2FD16A',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  brand: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2FD16A',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  linkText: {
    fontSize: 13,
    color: '#555555',
    fontWeight: '500',
  },
  linkActive: {
    color: '#079B72',
    fontWeight: '700',
  },
  bellWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellIcon: { fontSize: 16 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  userWrap: {
    position: 'relative',
    zIndex: 200,
  },
  userBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  avatarCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E6DDD7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#8B6D58',
    fontWeight: '700',
    fontSize: 12,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3E3E3E',
    maxWidth: 140,
  },
  dropdown: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    minWidth: 160,
    zIndex: 999,
    paddingVertical: 6,
  },
  dropdownName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3E3E3E',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 10,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '600',
  },
});
