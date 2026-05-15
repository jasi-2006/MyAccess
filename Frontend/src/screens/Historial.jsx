import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import StatCard from '../components/StatCard.jsx';
import WebFrame from '../components/WebFrame.jsx';
import { getUserProfile } from '../services/authService';

export default function HistorialScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const pagePadding = isMobile ? 10 : isTablet ? 14 : 18;

  const [profile, setProfile] = useState(null);
  const userName    = (profile?.fullName || profile?.full_name)?.trim() || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    getUserProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  return (
    <WebFrame>
      <View style={styles.screen}>
        <CarnetTopbar navigation={navigation} studentName={userName} studentInitial={userInitial} />
        <View style={styles.contentFrame}>
          {!isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Historial" />}
          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[styles.mainScroll, { paddingHorizontal: pagePadding, minHeight: height - 60 }]}
            showsVerticalScrollIndicator={false}
          >
            {isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Historial" />}

            <View style={styles.headerBlock}>
              <Text style={styles.pageTitle}>Historial</Text>
              <Text style={styles.pageSubtitle}>Consulta el historial de movimientos y validaciones.</Text>
            </View>

            <View style={styles.row}>
              <StatCard title="Seleccion"  value="120" />
              <StatCard title="Validacion" value="45" />
              <StatCard title="Solicitud"  value="30" />
              <StatCard title="Impresion"  value="15" />
            </View>

            <View style={styles.chart}>
              <Text style={styles.chartText}>Resumen de movimientos recientes</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#EAE6E6' },
  contentFrame: { flex: 1, flexDirection: 'row' },
  mainArea:     { flex: 1 },
  mainScroll:   { flexGrow: 1, paddingTop: 6, paddingBottom: 16 },
  headerBlock:  { marginBottom: 10 },
  pageTitle:    { fontSize: 18, fontWeight: '800', color: '#151515', marginBottom: 2 },
  pageSubtitle: { maxWidth: 430, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
  row:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chart:        { backgroundColor: '#FFFFFF', marginTop: 15, padding: 20, borderRadius: 10, borderWidth: 1, borderColor: '#DDF7EC' },
  chartText:    { color: '#6B7280', fontWeight: '700' },
});
