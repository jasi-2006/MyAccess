import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { countUnreadNotifications, getNotifications } from '../services/notificationService.js';
import { logoutUser } from '../services/authService';

export default function HomeNavbar({ navigation, active = 'Home', fullName }) {
  const { width } = useWindowDimensions();
  const isMobile  = width < 480;
  const isTablet  = width >= 480 && width < 900;
  const isDesktop = width >= 900;
  
  const px = isDesktop ? 40 : isTablet ? 24 : 16;
  const [notificationCount, setNotificationCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const userInitial = fullName ? fullName.trim().charAt(0).toUpperCase() : 'U';

  const loadNotificationCount = useCallback(async () => {
    try {
      const response = await getNotifications();
      setNotificationCount(countUnreadNotifications(response));
    } catch {
      setNotificationCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotificationCount();
    }, [loadNotificationCount])
  );

  const badgeText = notificationCount > 99 ? '99+' : String(notificationCount);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logoutUser();
    navigation.replace('Login');
  };

  return (
    <View style={[styles.navbar, { paddingHorizontal: px }]}>
      {/* Sección Izquierda (Identidad y Enlaces Base) */}
      <View style={styles.navLeft}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
          <Text style={styles.logoText}>MyAccess</Text>
        </TouchableOpacity>

        <View style={styles.navLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={0.7}>
            <Text style={[styles.navLink, active === 'Home' && styles.navLinkActive]}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('User')} activeOpacity={0.7}>
            <Text style={[styles.navLink, active === 'User' && styles.navLinkActive]}>Configuracion</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.notificationLink} 
          onPress={() => navigation.navigate('Notifications')}
          activeOpacity={0.7}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          {notificationCount > 0 ? (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{badgeText}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Sección Derecha (Gestión de Usuario y Cierre de Sesión) */}
      <View style={styles.navRight}>
        <TouchableOpacity 
          style={styles.profileContainer} 
          onPress={() => setDropdownOpen(!dropdownOpen)}
          activeOpacity={0.8}
        >
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarInitial}>{userInitial}</Text>
          </View>
          <Text style={[styles.profileName, { maxWidth: isMobile ? 80 : 150 }]} numberOfLines={1}>
            {fullName || 'Usuario'}
          </Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <>
            <TouchableOpacity
              style={styles.dropdownOverlay}
              activeOpacity={1}
              onPress={() => setDropdownOpen(false)}
            />
            <View style={styles.dropdownMenu}>
              <TouchableOpacity 
                style={styles.dropdownItem} 
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownItemText}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 3,
    borderTopColor: '#2FD16A',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    zIndex: 10,
  },
  navLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2FD16A',
    letterSpacing: -0.5,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navLink: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  navLinkActive: {
    color: '#0F766E',
    fontWeight: '700',
  },
  notificationLink: {
    position: 'relative',
    padding: 4,
  },
  bellIcon: {
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingHorizontal: 2,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  navRight: {
    position: 'relative',
    zIndex: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  avatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAE0D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#8B6D58',
    fontWeight: '700',
    fontSize: 14,
  },
  profileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: -500,
    bottom: -1000,
    left: -1000,
    right: -500,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 42,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  dropdownItemText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
  },
});
