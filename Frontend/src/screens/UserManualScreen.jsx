import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebFrame from '../components/WebFrame.jsx';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import { colors } from '../theme/colors.jsx';
import { getUserProfile } from '../services/authService.js';
import { resolveUserRole } from '../utils/accessControl.js';
import { useTour } from '../utils/tourContext.js';

export default function UserManualScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { startTour, isTourActive, tourRole } = useTour();

  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('APRENDIZ');

  useEffect(() => {
    getUserProfile()
      .then((p) => {
        setProfile(p);
        const resolved = resolveUserRole(p);
        setRole(resolved);
      })
      .catch(() => {});
  }, []);

  const tourOptions = [
    {
      id: 'aprendiz',
      title: 'Paseo del Aprendiz',
      icon: 'school-outline',
      color: '#059669',
      bgColor: '#E8FFF5',
      borderColor: '#A7F3D0',
      desc: 'Conoce cómo acceder a tu identificación digital, validar tus datos con Sofia Plus y monitorear el estado físico de tu carnet.',
      modules: ['Inicio', 'Mi Carnet Digital', 'Validar Sofia Plus', 'Estado del Trámite'],
    },
    {
      id: 'instructor',
      title: 'Paseo del Instructor',
      icon: 'people-outline',
      color: '#2563EB',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      desc: 'Aprende a buscar fichas de formación activas, consultar tus grupos asignados y listar la información de tus aprendices.',
      modules: ['Inicio', 'Gestión de Fichas', 'Validar Sofia Plus'],
    },
    {
      id: 'admin',
      title: 'Paseo del Administrador',
      icon: 'shield-checkmark-outline',
      color: '#D97706',
      bgColor: '#FEF3C7',
      borderColor: '#FDE68A',
      desc: 'Domina el panel de métricas, autoriza las solicitudes de carnetización enviadas por aprendices, audita el historial e imprime credenciales físicas.',
      modules: ['Inicio', 'Dashboard Estadístico', 'Fichas Sede', 'Aprobación de Solicitudes', 'Bitácora Histórica', 'Impresión Física'],
    }
  ];

  const userInitial = profile?.fullName ? profile.fullName.trim().charAt(0).toUpperCase() : 'U';
  const userName = profile?.fullName || 'Usuario';

  return (
    <WebFrame>
      <View style={styles.root}>
        <CarnetTopbar navigation={navigation} studentName={userName} studentInitial={userInitial} />
        
        <View style={styles.contentFrame}>
          <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="UserManual" />
          
          <View style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
              
              {/* Encabezado */}
              <View style={styles.headerBlock}>
                <Text style={styles.pageTitle}>Manual de Usuario: Paseos Guiados</Text>
                <Text style={styles.pageSubtitle}>
                  Selecciona tu rol para iniciar un paseo guiado interactivo por los módulos de la aplicación. El sistema te guiará paso a paso mostrándote cómo funciona cada sección.
                </Text>
              </View>

              {isTourActive && (
                <View style={styles.activeTourBanner}>
                  <Ionicons name="information-circle" size={20} color="#047857" />
                  <Text style={styles.activeTourText}>
                    Tienes un paseo guiado activo de **{tourRole.toUpperCase()}**.
                  </Text>
                  <TouchableOpacity style={styles.resumeBtn} onPress={() => startTour(tourRole)}>
                    <Text style={styles.resumeBtnText}>Reanudar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Grid de opciones */}
              <View style={[styles.grid, isMobile && styles.gridMobile]}>
                {tourOptions
                  .filter((opt) => {
                    const normalizedRole = role ? role.toUpperCase() : 'APRENDIZ';
                    if (normalizedRole === 'APRENDIZ') return opt.id === 'aprendiz';
                    if (normalizedRole === 'INSTRUCTOR') return opt.id === 'instructor';
                    if (normalizedRole === 'ADMIN') return opt.id === 'admin';
                    return opt.id === 'aprendiz'; // fallback
                  })
                  .map((opt) => (
                    <View key={opt.id} style={styles.optionCard}>
                    
                    {/* Icon & Title */}
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconContainer, { backgroundColor: opt.bgColor }]}>
                        <Ionicons name={opt.icon} size={28} color={opt.color} />
                      </View>
                      <Text style={styles.cardTitle}>{opt.title}</Text>
                    </View>

                    {/* Desc */}
                    <Text style={styles.cardDesc}>{opt.desc}</Text>

                    {/* List of Modules */}
                    <View style={styles.modulesSection}>
                      <Text style={styles.modulesHeading}>Recorrido del Paseo:</Text>
                      <View style={styles.modulesList}>
                        {opt.modules.map((mod, idx) => (
                          <View key={idx} style={styles.moduleBadge}>
                            <Text style={styles.moduleBadgeText}>
                              {idx + 1}. {mod}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Start Button */}
                    <TouchableOpacity
                      style={[styles.startBtn, { backgroundColor: opt.color }]}
                      onPress={() => startTour(opt.id)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.startBtnText}>Iniciar Paseo Guiado</Text>
                      <Ionicons name="play-outline" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                    </TouchableOpacity>

                  </View>
                ))}
              </View>

            </ScrollView>
          </View>
        </View>
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F9F6' },
  contentFrame: { flex: 1, flexDirection: 'row' },
  mainContainer: { flex: 1 },
  mainScroll: { flexGrow: 1, paddingVertical: 14, paddingHorizontal: 16 },
  headerBlock: { marginBottom: 16 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#4B5563', lineHeight: 18, maxWidth: 800 },
  
  // Banner de tour activo
  activeTourBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8FFF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    gap: 8,
  },
  activeTourText: { fontSize: 12, color: '#047857', flex: 1 },
  resumeBtn: {
    backgroundColor: '#059669',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  resumeBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  // Grid
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  gridMobile: {
    flexDirection: 'column',
  },
  optionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    minHeight: 360,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '850',
    color: '#111827',
  },
  cardDesc: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    marginBottom: 14,
  },

  modulesSection: {
    marginBottom: 16,
    flex: 1,
  },
  modulesHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  modulesList: {
    flexDirection: 'column',
    gap: 6,
  },
  moduleBadge: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  moduleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
  },

  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
    marginTop: 10,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
