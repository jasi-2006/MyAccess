import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';

export default function CarnetTopbar({ navigation, studentName, studentInitial }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const pagePadding = isMobile ? 14 : isTablet ? 18 : 24;

  return (
    <View style={[styles.topbar, { paddingHorizontal: pagePadding }]}>
      <View style={styles.topbarLeft}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.brand}>MyAccess</Text>
        </TouchableOpacity>
        {!isMobile && (
          <View style={styles.topLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text style={styles.topLink}>Inicio</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=> navigation.navigate('User')}>
              <Text style={styles.topLink}>Configuracion</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellWrap} onPress={()=> navigation.navigate('Notifications')}>
              <Text style={styles.bellIcon}>🔔</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.topbarRight}>
        <View style={styles.avatar}>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarInitial}>{studentInitial}</Text>
          </View>
          <Text style={styles.avatarText} numberOfLines={1}>{studentName}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    minHeight: 42, backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#2FD16A',
    borderBottomWidth: 1, borderBottomColor: '#DADADA',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  topbarLeft:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  brand:       { fontSize: 14, fontWeight: '800', color: '#2FD16A' },
  topLinks:    { flexDirection: 'row', alignItems: 'center', gap: 16 },
  topLink:     { fontSize: 11, color: '#8B8B8B' },
  bellWrap:    { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  bellIcon:    { fontSize: 14 },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar:      { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: 130 },
  avatarBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#E6DDD7', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarInitial: { color: '#8B6D58', fontWeight: '700', fontSize: 11 },
  avatarText:    { color: '#3E3E3E', fontWeight: '600', fontSize: 11, flexShrink: 1 },
});
