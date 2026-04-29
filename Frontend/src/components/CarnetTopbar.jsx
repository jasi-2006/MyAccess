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
            <TouchableOpacity>
              <Text style={styles.topLink}>Configuracion</Text>
            </TouchableOpacity>
            <View style={styles.bellWrap}>
              <Text style={styles.bellIcon}>🔔</Text>
            </View>
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
    minHeight: 64, backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#2FD16A',
    borderBottomWidth: 1, borderBottomColor: '#DADADA',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  topbarLeft:  { flexDirection: 'row', alignItems: 'center', gap: 28 },
  brand:       { fontSize: 22, fontWeight: '800', color: '#2FD16A' },
  topLinks:    { flexDirection: 'row', alignItems: 'center', gap: 28 },
  topLink:     { fontSize: 14, color: '#8B8B8B' },
  bellWrap:    { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  bellIcon:    { fontSize: 22 },
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar:      { flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: 170 },
  avatarBadge: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#E6DDD7', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarInitial: { color: '#8B6D58', fontWeight: '700', fontSize: 16 },
  avatarText:    { color: '#3E3E3E', fontWeight: '600', fontSize: 14, flexShrink: 1 },
});
