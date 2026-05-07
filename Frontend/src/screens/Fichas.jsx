import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import StatCard from '../components/StatCard.jsx';
import WebFrame from '../components/WebFrame.jsx';
import { getUserProfile } from '../services/authService';

export default function FichasScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const pagePadding = isMobile ? 10 : isTablet ? 14 : 18;

  const [profile, setProfile] = useState(null);

  const userName = (profile?.fullName || profile?.full_name)?.trim() || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(() => setProfile(null));
  }, []);

  return (
    <WebFrame>
      <View style={styles.screen}>
        <CarnetTopbar
          navigation={navigation}
          studentName={userName}
          studentInitial={userInitial}
        />

        <View style={styles.contentFrame}>
          {!isMobile && (
            <CarnetSidebar
              navigation={navigation}
              role={profile?.nameRole}
              activeKey="Fichas"
            />
          )}

          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[
              styles.mainScroll,
              { paddingHorizontal: pagePadding, minHeight: height - 60 },
            ]}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
          >
            {isMobile && (
              <CarnetSidebar
                navigation={navigation}
                role={profile?.nameRole}
                activeKey="Fichas"
              />
            )}

            <View style={styles.headerBlock}>
              <Text style={styles.pageTitle}>Gestion de ficha</Text>
              <Text style={styles.pageSubtitle}>
                Selecciona y revisa los grupos activos desde el panel institucional.
              </Text>
            </View>

            <View style={styles.row}>
              <StatCard title="Total fichas" value="128" />
              <StatCard title="Grupos activos" value="94" />
              <StatCard title="Inactivos" value="34" />
              <StatCard title="Pendientes" value="12" />
            </View>

            <View style={styles.table}>
              <Text style={styles.tableTitle}>#2540012 - ADSO</Text>
              <Text style={styles.tableText}>Infraestructura en la nube</Text>
              <Text style={styles.tableText}>Analisis de software</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EAE6E6' },
  contentFrame: { flex: 1, flexDirection: 'row' },
  mainArea: { flex: 1 },
  mainScroll: { flexGrow: 1, paddingTop: 6, paddingBottom: 16 },
  headerBlock: { marginBottom: 10 },
  pageTitle: { fontSize: 18, fontWeight: '800', color: '#151515', marginBottom: 2 },
  pageSubtitle: { maxWidth: 430, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  table: {
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDF7EC',
  },
  tableTitle: {
    color: '#1F2937',
    fontWeight: '900',
    marginBottom: 8,
  },
  tableText: {
    color: '#6B7280',
    fontWeight: '700',
    marginTop: 4,
  },
});
