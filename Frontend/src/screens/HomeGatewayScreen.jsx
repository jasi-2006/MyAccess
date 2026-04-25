import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';

const logoM = require('../assets/logoM.png');
const person = require('../assets/person.png');
const datos = require('../assets/datos.png');

export default function HomeGatewayScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        {/* NAVBAR */}
        <View style={styles.navbar}>
          <Image source={logoM} style={styles.logo} resizeMode="contain" />
          <View style={styles.navLinks}>
            <TouchableOpacity>
              <Text style={[styles.navLink, styles.navLinkActive]}>Inicio</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.navLink}>Notificaciones</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => navigation.replace('Login')}>
            <Text style={styles.logoutText}>Salir</Text>
          </TouchableOpacity>
        </View>

        {/* HERO */}
        <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>
              Bienvenido a{'\n'}
              <Text style={styles.heroHighlight}>MyAccess</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Conoce mas de MyAccess y disfruta de esta gran experiencia .
            </Text>
          </View>
          <Image source={person} style={styles.heroImage} resizeMode="contain" />
        </View>

        {/* TARJETAS */}
        <View style={[styles.cards, isDesktop && styles.cardsDesktop]}>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>🪪</Text>
            <Text style={styles.cardTitle}>Carnet Digital</Text>
            <Text style={styles.cardDesc}>Accede a tu carnet institucional en cualquier momento.</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>📋</Text>
            <Text style={styles.cardTitle}>Novedades</Text>
            <Text style={styles.cardDesc}>Consulta las últimas novedades del centro.</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardIcon}>👤</Text>
            <Text style={styles.cardTitle}>Mi Perfil</Text>
            <Text style={styles.cardDesc}>Revisa y actualiza tu información personal.</Text>
          </View>
        </View>

        {/* SOBRE NOSOTROS */}
        <View style={styles.about}>
          <View style={[styles.aboutContent, isDesktop && styles.aboutContentDesktop]}>
            <Image source={datos} style={styles.aboutImage} resizeMode="contain" />
            <View style={styles.aboutTextContainer}>
              <Text style={styles.aboutTitle}>Sobre Nosotros</Text>
              <Text style={styles.aboutText}>
                <Text style={styles.heroHighlight}>MyAccess</Text> es una aplicación creada para gestionar
                accesos, usuarios y carnets digitales de manera segura y organizada en el
                Centro de Comercio y Turismo del <Text style={styles.heroHighlight}>SENA</Text> en Armenia, Quindío.
              </Text>
            </View>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Image source={logoM} style={styles.footerLogo} resizeMode="contain" />
          <Text style={styles.footerText}>© 2024 MyAccess · SENA Centro de Comercio y Turismo</Text>
          <Text style={styles.footerText}>Armenia, Quindío</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#E8F4F8' 
  },
  scrollContent: { 
    flexGrow: 1,
  },

  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  logo: { width: 110, height: 36 },
  navLinks: { flexDirection: 'row', gap: 24 },
  navLink: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  navLinkActive: { color: '#0F766E', fontWeight: '700' },
  logoutText: { fontSize: 14, color: '#EF4444', fontWeight: '600' },

  hero: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    backgroundColor: '#E8F4F8',
  },
  heroDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 80,
  },
  heroText: { marginBottom: 24 },
  heroTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 44,
    marginBottom: 16,
  },
  heroHighlight: { color: '#0F766E' },
  heroSubtitle: { fontSize: 16, color: '#6B7280', lineHeight: 24 },
  heroImage: { width: 280, height: 200 },

  cards: {
    flexDirection: 'column',
    gap: 16,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  cardsDesktop: {
    flexDirection: 'row',
    paddingHorizontal: 80,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  cardIcon: { fontSize: 32, marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  cardDesc: { fontSize: 14, color: '#6B7280', lineHeight: 22 },

  about: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  aboutContent: { flexDirection: 'column', alignItems: 'center' },
  aboutContentDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 120,
  },
  aboutImage: { width: 220, height: 180 },
  aboutTitle: { fontSize: 26, fontWeight: '700', color: '#1F2937', marginBottom: 14 },
  aboutText: { fontSize: 15, color: '#6B7280', lineHeight: 26 },

  footer: {
    backgroundColor: '#1F2937',
    paddingVertical: 32,
    alignItems: 'center',
    gap: 10,
  },
  footerLogo: { width: 100, height: 32 },
  footerText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
});