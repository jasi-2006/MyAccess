import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, useWindowDimensions, ActivityIndicator,
} from 'react-native';
import { getUserProfile } from '../services/authService';

const logoM   = require('../assets/logoM.png');
const person  = require('../assets/person.png');
const person2 = require('../assets/person2.png');

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
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* NAVBAR */}
        <View style={[styles.navbar, { paddingHorizontal: px }]}>
          <Image source={logoM} style={styles.logo} resizeMode="contain" />
          {!isMobile && (
            <View style={styles.navLinks}>
              <TouchableOpacity>
                <Text style={[styles.navLink, styles.navLinkActive]}>Inicio</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.navLink}>Notificaciones</Text>
              </TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* HERO */}
        <View style={[styles.hero, { paddingHorizontal: px, flexDirection: isDesktop ? 'row' : 'column' }]}>
          <View style={[styles.heroText, { maxWidth: isDesktop ? '50%' : '100%' }]}>
            <Text style={[styles.heroTitle, { fontSize: isDesktop ? 42 : isTablet ? 34 : 26 }]}>
              Bienvenido,{'\n'}
              <Text style={styles.heroHighlight}>
                {profile?.fullName ?? 'MyAccess'}
              </Text>
            </Text>
            <Text style={[styles.heroSubtitle, { fontSize: isDesktop ? 18 : 14 }]}>
              Conoce mas de MyAccess y disfruta de esta gran experiencia.
            </Text>
          </View>
          <Image
            source={person}
            style={{ width: isDesktop ? 340 : isTablet ? 260 : width * 0.7, height: isDesktop ? 260 : isTablet ? 200 : width * 0.5 }}
            resizeMode="contain"
          />
        </View>

        {/* TARJETAS ACCESOS */}
        <View style={[styles.cards, { paddingHorizontal: px, flexDirection: isDesktop ? 'row' : 'column' }]}>
          {[
            { icon: '🪪', title: 'Carnet Digital',  desc: 'Accede a tu carnet institucional en cualquier momento.', onPress: () => navigation.navigate('Card') },
            { icon: '🔔', title: 'Notificaciones',  desc: 'Consulta las últimas novedades del centro.', onPress: () => {} },
            { icon: '👤', title: 'Mi Perfil',       desc: 'Revisa y actualiza tu información personal.', onPress: () => {} },
          ].map((item) => (
            <TouchableOpacity key={item.title} style={[styles.card, isDesktop && { flex: 1 }]} onPress={item.onPress}>
              <Text style={[styles.cardIcon, { fontSize: isDesktop ? 36 : 28 }]}>{item.icon}</Text>
              <Text style={[styles.cardTitle, { fontSize: isDesktop ? 20 : 16 }]}>{item.title}</Text>
              <Text style={[styles.cardDesc,  { fontSize: isDesktop ? 15 : 13 }]}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {/* SOBRE NOSOTROS */}
        <View style={[styles.about, { paddingHorizontal: px }]}>
          <View style={[styles.aboutContent, isDesktop && { flexDirection: 'row', gap: 60 }]}>
            <Image
              source={person2}
              style={{ width: isDesktop ? 280 : isTablet ? 220 : width * 0.6, height: isDesktop ? 220 : isTablet ? 180 : width * 0.5 }}
              resizeMode="contain"
            />
            <View style={isDesktop && { flex: 1 }}>
              <Text style={[styles.aboutTitle, { fontSize: isDesktop ? 30 : isTablet ? 24 : 20 }]}>Sobre Nosotros</Text>
              <Text style={[styles.aboutText, { fontSize: isDesktop ? 16 : 14 }]}>
                <Text style={styles.heroHighlight}>MyAccess</Text> es una aplicación creada para gestionar
                accesos, usuarios y carnets digitales de manera segura y organizada en el
                Centro de Comercio y Turismo del{' '}
                <Text style={styles.heroHighlight}>SENA</Text> en Armenia, Quindío.
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={[styles.footer, { paddingHorizontal: px }]}>
          <Image source={logoM} style={styles.footerLogo} resizeMode="contain" />
          <Text style={[styles.footerText, { fontSize: isDesktop ? 14 : 12 }]}>
            © 2024 MyAccess · SENA Centro de Comercio y Turismo
          </Text>
          <Text style={[styles.footerText, { fontSize: isDesktop ? 14 : 12 }]}>
            Armenia, Quindío
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#F0F9F6' },
  scroll: { flexGrow: 1, paddingBottom: 40 },

  navbar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14,
    backgroundColor: '#FFFFFF', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  logo:          { width: 100, height: 34 },
  navLinks:      { flexDirection: 'row', gap: 28 },
  navLink:       { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  navLinkActive: { color: '#0F766E', fontWeight: '700' },
  logoutText:    { fontSize: 14, color: '#EF4444', fontWeight: '600' },

  hero:          { alignItems: 'center', paddingVertical: 48, backgroundColor: '#F0F9F6', gap: 24 },
  heroText:      { alignItems: 'flex-start' },
  heroTitle:     { fontWeight: '800', color: '#1F2937', lineHeight: 48, marginBottom: 12 },
  heroHighlight: { color: '#0F766E' },
  heroSubtitle:  { color: '#6B7280', lineHeight: 24, marginTop: 4 },

  cards:         { gap: 16, paddingVertical: 32 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24,
    elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6,
  },
  cardIcon:  { marginBottom: 12 },
  cardTitle: { fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  cardDesc:  { color: '#6B7280', lineHeight: 20 },

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

  about:        { paddingVertical: 40 },
  aboutContent: { flexDirection: 'column', alignItems: 'center', gap: 24 },
  aboutTitle:   { fontWeight: '700', color: '#1F2937', marginBottom: 12 },
  aboutText:    { color: '#6B7280', lineHeight: 26 },

  footer: {
    backgroundColor: '#1F2937', paddingVertical: 32,
    alignItems: 'center', gap: 8, marginTop: 16,
  },
  footerLogo: { width: 90, height: 30, marginBottom: 8 },
  footerText: { color: '#9CA3AF', textAlign: 'center' },
});
