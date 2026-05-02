import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { getUserProfile } from '../services/authService';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import CarnetCard from '../components/CarnetCard.jsx';
import WebFrame from '../components/WebFrame.jsx';

export default function CarnetGatewayScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1100;
  const pagePadding = isMobile ? 10 : isTablet ? 14 : 18;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentName    = (profile?.fullName || profile?.full_name)?.trim() || 'Aprendiz';
  const studentInitial = studentName.charAt(0).toUpperCase();

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <WebFrame>
      <View style={styles.screen}>

        <CarnetTopbar
          navigation={navigation}
          studentName={studentName}
          studentInitial={studentInitial}
        />

        <View style={styles.contentFrame}>
          {!isMobile && <CarnetSidebar navigation={navigation} />}

          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[styles.mainScroll, { paddingHorizontal: pagePadding, minHeight: height - 60 }]}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
          >
            {isMobile && <CarnetSidebar navigation={navigation} />}

            <View style={styles.headerBlock}>
              <Text style={styles.pageTitle}>Carnets</Text>
              <Text style={styles.pageSubtitle}>
                Una identificacion estudiantil agil y segura directamente desde los dispositivos
              </Text>
            </View>

            <CarnetCard profile={profile} loading={loading} />

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
  pageSubtitle: { maxWidth: 400, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
});
