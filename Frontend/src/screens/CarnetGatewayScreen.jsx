import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../theme/colors.jsx';
import { getUserProfile } from '../services/authService';

const sidebarItems = [
  { key: 'cards', label: 'Mi carnets', icon: '🪪', active: true },
  { key: 'profile', label: 'Mis perfil', icon: '👤' },
  { key: 'status', label: 'Mi estado de tramite', icon: '☑' },
];

export default function CarnetGatewayScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoadingProfile(false));
  }, []);

  const studentName = (profile?.fullName || profile?.full_name)?.trim() || 'Aprendiz';
  const studentInitial = studentName.charAt(0).toUpperCase();

  const pagePadding = isMobile ? 14 : isTablet ? 18 : 24;
  const cardWidth = isMobile ? Math.min(width - 36, 320) : isTablet ? 300 : 350;
  const cardHeight = isMobile ? 420 : 520;

  return (
    <View style={styles.screen}>
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
            </View>
          )}
        </View>

        <View style={styles.topbarRight}>

          <View style={styles.bellWrap}>
            <Text style={styles.bellIcon}>🔔</Text>
          </View>

          <View style={styles.avatar}>
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarInitial}>{studentInitial}</Text>
            </View>
            <Text
              style={styles.avatarText}
              numberOfLines={1}
            >
              {studentName}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.contentFrame}>
        {!isMobile ? (
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Area de{'\n'}Aprendiz</Text>

            <View style={styles.sidebarList}>
              {sidebarItems.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.sidebarItem, item.active && styles.sidebarItemActive]}
                >
                  <Text style={styles.sidebarIcon}>{item.icon}</Text>
                  <Text style={[styles.sidebarLabel, item.active && styles.sidebarLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

        <ScrollView
          style={styles.mainArea}
          contentContainerStyle={[
            styles.mainScroll,
            { paddingHorizontal: pagePadding, minHeight: height - 78 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {isMobile ? (
            <View style={styles.mobileMenu}>
              {sidebarItems.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.mobileMenuItem, item.active && styles.mobileMenuItemActive]}
                >
                  <Text style={styles.mobileMenuIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.mobileMenuLabel,
                      item.active && styles.mobileMenuLabelActive,
                    ]}
                    numberOfLines={2}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <View style={styles.headerBlock}>
            <Text style={styles.pageTitle}>Carnets</Text>
            <Text style={styles.pageSubtitle}>
              Una identificacion estudiantil agil y segura directamente desde los
              dispositivos
            </Text>
          </View>

          <View style={styles.cardStage}>
            <View style={[styles.mockCard, { width: cardWidth, height: cardHeight }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.cardBrand}>MyAccess</Text>
                  <Text style={styles.cardType}>Carnet digital</Text>
                </View>
                <View style={styles.cardChip} />
              </View>

              {loadingProfile ? (
                <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
              ) : (
                <>
                  <View style={styles.cardBody}>
                    <View style={styles.profileCircle}>
                      <Text style={styles.profileInitial}>{studentInitial}</Text>
                    </View>
                    <Text style={styles.studentName}>{(profile?.fullName || profile?.full_name) ?? 'Aprendiz'}</Text>
                    <Text style={styles.studentMeta}>{profile?.trainingCenter ?? '—'}</Text>
                    <Text style={styles.studentMeta}>{profile?.regional ?? '—'}</Text>
                    <Text style={styles.studentMeta}>{profile?.trainingProgram ?? '—'}</Text>
                  </View>

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.cardFooterLabel}>Documento</Text>
                      <Text style={styles.cardFooterValue}>
                        {profile?.typeDocument ?? '—'} {profile?.document ?? '—'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.cardFooterLabel}>Sangre</Text>
                      <Text style={styles.cardFooterValue}>{profile?.bloodType ?? '—'}</Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.cardFooterLabel}>Ficha</Text>
                      <Text style={styles.cardFooterValue}>{profile?.ficha ?? '—'}</Text>
                    </View>
                    <View>
                      <Text style={styles.cardFooterLabel}>Rol</Text>
                      <Text style={styles.cardFooterValue}>{profile?.nameRole ?? '—'}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EAE6E6',
  },
  topbar: {
    minHeight: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#2FD16A',
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topbarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2FD16A',
  },
  topLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  topLink: {
    fontSize: 14,
    color: '#8B8B8B',
  },
  topbarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  searchBox: {
    width: 104,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#DDDDDD',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  searchIcon: {
    color: '#6E6E6E',
    fontSize: 11,
  },
  bellWrap: {
    position: 'relative',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -2,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D62828',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  avatar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 170,
  },
  avatarBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E6DDD7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitial: {
    color: '#8B6D58',
    fontWeight: '700',
    fontSize: 16,
  },
  avatarText: {
    color: '#3E3E3E',
    fontWeight: '600',
    fontSize: 14,
    flexShrink: 1,
  },
  contentFrame: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 122,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#55D7AF',
    paddingVertical: 18,
  },
  sidebarTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#2FD16A',
    paddingHorizontal: 10,
    marginBottom: 26,
  },
  sidebarList: {
    gap: 10,
  },
  sidebarItem: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 8,
  },
  sidebarItemActive: {
    backgroundColor: '#F7FBF8',
  },
  sidebarIcon: {
    fontSize: 28,
    color: '#4E5D74',
  },
  sidebarLabel: {
    fontSize: 12,
    color: '#232323',
    lineHeight: 15,
  },
  sidebarLabelActive: {
    color: '#2FD16A',
  },
  mainArea: {
    flex: 1,
  },
  mainScroll: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 24,
  },
  mobileMenu: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  mobileMenuItem: {
    flex: 1,
    minHeight: 76,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8EBDD',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  mobileMenuItemActive: {
    borderColor: '#2FD16A',
    backgroundColor: '#F4FFF7',
  },
  mobileMenuIcon: {
    fontSize: 24,
  },
  mobileMenuLabel: {
    fontSize: 11,
    color: '#28323C',
    textAlign: 'center',
    lineHeight: 13,
  },
  mobileMenuLabelActive: {
    color: '#2FD16A',
    fontWeight: '700',
  },
  headerBlock: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#151515',
    marginBottom: 2,
  },
  pageSubtitle: {
    maxWidth: 400,
    fontSize: 13,
    lineHeight: 17,
    color: '#2C2C2C',
  },
  cardStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  mockCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDDDDD',
    padding: 22,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardBrand: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  cardType: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  cardChip: {
    width: 42,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
  },
  cardBody: {
    alignItems: 'center',
    gap: 12,
  },
  profileCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#E5F8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.primary,
  },
  studentName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#202020',
    textAlign: 'center',
  },
  studentMeta: {
    fontSize: 13,
    lineHeight: 18,
    color: '#69707A',
    textAlign: 'center',
    maxWidth: 220,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardFooterLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    color: '#7A7A7A',
    marginBottom: 4,
  },
  cardFooterValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
});
