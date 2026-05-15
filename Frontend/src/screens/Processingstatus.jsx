import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { getUserProfile } from '../services/authService';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import StatCard from '../components/StatCard.jsx';
import WebFrame from '../components/WebFrame.jsx';


export default function ProcessingStatus({navigation}) {
    const { width, height } = useWindowDimensions();
      const isMobile  = width < 768;
      const isTablet  = width >= 768 && width < 1100;
      const pagePadding = isMobile ? 10 : isTablet ? 14 : 18;
    
      const [profile, setProfile] = useState(null);
      const [card, setCard] = useState(null);
      const [loading, setLoading] = useState(true);
      const [cardError, setCardError] = useState('');
    
      const studentName    = (profile?.fullName || profile?.full_name)?.trim() || 'Aprendiz';
      const studentInitial = studentName.charAt(0).toUpperCase();
    
      useEffect(() => {
        let mounted = true;
    
        getUserProfile()
          .then(async (userProfile) => {
            if (!mounted) return;
            setProfile(userProfile);
    
            if (userProfile?.id) {
              const cards = await getCardsByUser(userProfile.id);
              if (mounted) setCard(Array.isArray(cards) && cards.length > 0 ? cards[0] : null);
            }
          })
          .catch(() => {
            if (!mounted) return;
            setProfile(null);
            setCard(null);
            setCardError('No fue posible cargar la informacion del carnet.');
          })
          .finally(() => {
            if (mounted) setLoading(false);
          });
    
        return () => {
          mounted = false;
        };
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
              {!isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} />}
    
              <ScrollView
                style={styles.mainArea}
                contentContainerStyle={[styles.mainScroll, { paddingHorizontal: pagePadding, minHeight: height - 60 }]}
                showsVerticalScrollIndicator={false}
                overScrollMode="never"
              >
                {isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} />}

                <View style={styles.headerBlock}>
                  <Text style={styles.pageTitle}>Estado de procesamiento</Text>
                  <Text style={styles.pageSubtitle}>
                    Estado actual de su solicitud de carnet
                  </Text>
                </View>

                <View style={styles.row}>
                    <StatCard title="Total fichas" value={String()} />
                    <StatCard title="Aprendices" value={String()} />
                    <StatCard title="Carnets activos" value={String()} />
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
  pageSubtitle: { maxWidth: 400, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
