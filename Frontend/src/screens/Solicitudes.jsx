import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import StatCard from '../components/StatCard.jsx';
import WebFrame from '../components/WebFrame.jsx';
import { getUserProfile } from '../services/authService';

export default function SolicitudesScreen({ navigation }) {
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
          {!isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Solicitudes" />}
          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[styles.mainScroll, { paddingHorizontal: pagePadding, minHeight: height - 60 }]}
            showsVerticalScrollIndicator={false}
          >
            {isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Solicitudes" />}

            <View style={styles.headerBlock}>
              <Text style={styles.pageTitle}>Solicitud de impresiones</Text>
              <Text style={styles.pageSubtitle}>Revisa y gestiona las solicitudes de impresión de carnets.</Text>
            </View>

            <View style={styles.row}>
              <StatCard title="Pendientes" value="12" />
              <StatCard title="Validados"  value="8" />
              <StatCard title="Impresos"   value="45" />
            </View>

            <View style={styles.table}>
              <Text style={styles.tableTitle}>Solicitudes recientes</Text>
              <Text style={styles.tableText}>Coni Largo - Pendiente</Text>
              <Text style={styles.tableText}>Jersson Velasquez - Validado</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: '#EAE6E6' },
  contentFrame:  { flex: 1, flexDirection: 'row' },
  mainArea:      { flex: 1 },
  mainScroll:    { flexGrow: 1, paddingTop: 6, paddingBottom: 16 },
  headerBlock:   { marginBottom: 10 },
  pageTitle:     { fontSize: 18, fontWeight: '800', color: '#151515', marginBottom: 2 },
  pageSubtitle:  { maxWidth: 430, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
  row:           { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  table:         { backgroundColor: '#FFFFFF', marginTop: 15, padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#DDF7EC' },
  tableTitle:    { color: '#1F2937', fontWeight: '900', marginBottom: 8 },
  tableText:     { color: '#6B7280', fontWeight: '700', marginTop: 4 },
});
