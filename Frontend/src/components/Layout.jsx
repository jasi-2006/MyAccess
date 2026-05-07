import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import WebFrame from './WebFrame.jsx';

const menuItems = [
  { key: 'Home', label: 'Inicio', route: 'Home' },
  { key: 'Instructor', label: 'Gestion', route: 'Instructor' },
  { key: 'Card', label: 'Carnet digital', route: 'Card' },
  { key: 'Fichas', label: 'Gestion de ficha', route: 'Fichas' },
  { key: 'Solicitudes', label: 'Solicitudes', route: 'Solicitudes' },
  { key: 'Historial', label: 'Historial', route: 'Historial' },
];

export default function Layout({ children, title, navigation, activeKey = 'Instructor' }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 760;

  const menu = (
    <View style={[styles.sidebar, isMobile && styles.sidebarMobile]}>
      <Text style={styles.logo}>MyAccess</Text>
      <Text style={styles.area}>Area de instructor</Text>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.menuItem, activeKey === item.key && styles.menuItemActive]}
          onPress={() => navigation?.navigate(item.route)}
          activeOpacity={0.8}
        >
          <Text style={[styles.menuText, activeKey === item.key && styles.menuTextActive]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <WebFrame>
      <View style={styles.root}>
        {!isMobile ? menu : null}
        <View style={styles.content}>
          {isMobile ? menu : null}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F0F9F6',
  },
  sidebar: {
    width: 210,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#DDF7EC',
    padding: 16,
  },
  sidebarMobile: {
    width: '100%',
    borderRightWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#DDF7EC',
    borderRadius: 10,
    marginBottom: 14,
  },
  logo: {
    color: '#24C565',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 18,
  },
  area: {
    color: '#079B72',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },
  menuItemActive: {
    backgroundColor: '#E8FFF5',
    borderRightWidth: 4,
    borderRightColor: '#24C565',
  },
  menuText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
  },
  menuTextActive: {
    color: '#079B72',
    fontWeight: '900',
  },
  content: {
    flex: 1,
    padding: 18,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    marginBottom: 14,
  },
  title: {
    color: '#1F2937',
    fontSize: 22,
    fontWeight: '900',
  },
  scrollContent: {
    paddingBottom: 28,
  },
});
