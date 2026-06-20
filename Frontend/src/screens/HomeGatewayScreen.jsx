import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { getUserProfile } from '../services/authService';
import HomeNavbar   from '../components/HomeNavbar.jsx';
import HomeHero     from '../components/HomeHero.jsx';
import HomeCards    from '../components/HomeCards.jsx';
import HomeAbout    from '../components/HomeAbout.jsx';
import HomeFooter   from '../components/HomeFooter.jsx';
import WebFrame     from '../components/WebFrame.jsx';

export default function HomeGatewayScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile  = width < 480;
  const isTablet  = width >= 480 && width < 900;
  const isDesktop = width >= 900;
  const px = isDesktop ? 80 : isTablet ? 40 : 20;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const fields = [
    { label: 'Nombre completo', value: profile?.fullName },
    { label: 'Tipo documento',  value: profile?.typeDocument },
    { label: 'Documento',       value: profile?.document },
    { label: 'Tipo de sangre',  value: profile?.bloodType },
    { label: 'Ficha',           value: profile?.ficha },
    { label: 'Programa',        value: profile?.trainingProgram },
    { label: 'Centro',          value: profile?.trainingCenter },
    { label: 'Regional',        value: profile?.regional },
    { label: 'Rol',             value: profile?.nameRole },
  ];

  return (
    <WebFrame>
      <View style={styles.root}>
        <HomeNavbar navigation={navigation} role={profile?.nameRole} fullName={profile?.fullName} />

        <View style={styles.body}>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={styles.scroll}>

          <HomeHero fullName={profile?.fullName} />

          <HomeCards navigation={navigation} role={profile?.nameRole} />

          {/* PERFIL */}
          

            <HomeAbout />
            <View style={styles.footerEnd}>
              <HomeFooter />
            </View>

          </ScrollView>
        </View>
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F0F9F6' },
  body:   { flex: 1, flexDirection: 'row' },
  scrollView: { flex: 1 },
  scroll: { flexGrow: 1 },
  footerEnd: { marginTop: 'auto' },

  section:      { paddingVertical: 32 },
  sectionTitle: { fontWeight: '700', color: '#1F2937', marginBottom: 20 },
  profileGrid:  { flexDirection: 'column', gap: 12 },
  fieldCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 4,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  fieldLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  fieldValue: { color: '#1F2937', fontWeight: '500' },
  emptyCard:  { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText:  { color: '#6B7280', fontSize: 14 },
});
