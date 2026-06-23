import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { getUserProfile } from '../services/authService';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import StatCard from '../components/StatCard.jsx';
import WebFrame from '../components/WebFrame.jsx';
import { getCardsByUser } from '../services/cardService';
import { getRequestCardsByUser } from '../services/requestCardService';

function normalizeText(value, fallback = 'Sin registro') {
  const text = String(value || '').trim();
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : fallback;
}

function resolveStatusTone(value) {
  const text = String(value || '').trim().toLowerCase();

  if (!text) return 'neutral';
  if (['aprobado', 'aprobada', 'activo', 'activa', 'impreso', 'impresa', 'entregado', 'entregada'].includes(text)) {
    return 'success';
  }
  if (['rechazado', 'rechazada', 'inactivo', 'inactiva', 'cancelado', 'cancelada'].includes(text)) {
    return 'danger';
  }
  return 'warning';
}

function getLatestRequest(requests) {
  if (!Array.isArray(requests) || !requests.length) return null;

  return [...requests].sort((left, right) => {
    const leftDate = left?.registrationDate ? new Date(left.registrationDate).getTime() : 0;
    const rightDate = right?.registrationDate ? new Date(right.registrationDate).getTime() : 0;

    if (leftDate !== rightDate) return rightDate - leftDate;
    return Number(right?.idRequest || 0) - Number(left?.idRequest || 0);
  })[0];
}

export default function ProcessingStatus({navigation}) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const pagePadding = isMobile ? 10 : isTablet ? 14 : 18;

  const [profile, setProfile] = useState(null);
  const [card, setCard] = useState(null);
  const [latestRequest, setLatestRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cardError, setCardError] = useState('');

  const studentName = (profile?.fullName || profile?.full_name)?.trim() || 'Aprendiz';
  const studentInitial = studentName.charAt(0).toUpperCase();

  useEffect(() => {
    let mounted = true;

    async function loadStatus() {
      setLoading(true);
      setCardError('');

      try {
        const userProfile = await getUserProfile();
        if (!mounted) return;

        setProfile(userProfile);

        if (!userProfile?.id) {
          setCard(null);
          setLatestRequest(null);
          return;
        }

        const [cards, requests] = await Promise.all([
          getCardsByUser(userProfile.id),
          getRequestCardsByUser(userProfile.id),
        ]);

        if (!mounted) return;

        setCard(Array.isArray(cards) && cards.length > 0 ? cards[0] : null);
        setLatestRequest(getLatestRequest(requests));
      } catch {
        if (!mounted) return;
        setProfile(null);
        setCard(null);
        setLatestRequest(null);
        setCardError('No fue posible cargar el seguimiento del tramite.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadStatus();

    return () => {
      mounted = false;
    };
  }, []);

  const requestState = normalizeText(latestRequest?.state, card?.idCard ? 'Asignado por administracion' : 'Sin solicitud');
  const digitalState = normalizeText(card?.digitalState, 'Pendiente');
  const physicalState = normalizeText(card?.physicalState, 'No solicitado');
  const cardAssignedLabel = card?.idCard ? `#${card.idCard}` : 'Pendiente';

  const steps = [
    {
      key: 'request',
      title: 'Solicitud registrada',
      value: latestRequest?.idRequest ? `Radicado #${latestRequest.idRequest}` : 'Sin solicitud registrada',
      tone: latestRequest?.idRequest ? 'success' : 'neutral',
    },
    {
      key: 'review',
      title: 'Revision administrativa',
      value: requestState,
      tone: resolveStatusTone(latestRequest?.state),
    },
    {
      key: 'assigned',
      title: 'Carnet digital asignado',
      value: card?.idCard ? `Carnet digital ${cardAssignedLabel}` : 'Aun no asignado por administracion',
      tone: card?.idCard ? 'success' : 'warning',
    },
    {
      key: 'digital',
      title: 'Estado del carnet digital',
      value: digitalState,
      tone: resolveStatusTone(card?.digitalState),
    },
    {
      key: 'physical',
      title: 'Estado del carnet fisico',
      value: physicalState,
      tone: resolveStatusTone(card?.physicalState),
    },
  ];

  return (
    <WebFrame>
      <View style={styles.screen}>
        <CarnetTopbar
          navigation={navigation}
          studentName={studentName}
          studentInitial={studentInitial}
        />
        <View style={styles.contentFrame}>
          {!isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="status" />}

          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[styles.mainScroll, { paddingHorizontal: pagePadding, minHeight: height - 60 }]}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
          >
            {isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="status" />}

            <View style={styles.headerBlock}>
              <Text style={styles.pageTitle}>Estado del tramite</Text>
              <Text style={styles.pageSubtitle}>
                Seguimiento del estado del carnet asignado y de la ultima gestion realizada por administracion.
              </Text>
            </View>

            <View style={styles.row}>
              <StatCard title="Solicitud" value={latestRequest?.idRequest ? `#${latestRequest.idRequest}` : 'No'} />
              <StatCard title="Carnet digital asignado" value={cardAssignedLabel} />
              <StatCard title="Estado actual" value={requestState} />
            </View>

            {loading ? (
              <View style={styles.stateBox}>
                <ActivityIndicator color="#079B72" />
                <Text style={styles.loadingText}>Cargando seguimiento...</Text>
              </View>
            ) : (
              <>
                {!!cardError && <Text style={styles.errorText}>{cardError}</Text>}

                <View style={styles.statusCard}>
                  <Text style={styles.sectionTitle}>Resumen del tramite</Text>
                  <View style={styles.summaryGrid}>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Tipo de solicitud</Text>
                      <Text style={styles.summaryValue}>{normalizeText(latestRequest?.requestTipe, 'Sin registro')}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Tipo de carnet</Text>
                      <Text style={styles.summaryValue}>{normalizeText(latestRequest?.cardTipe, 'Institucional')}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Carnet digital asignado</Text>
                      <Text style={styles.summaryValue}>{card?.idCard ? `Carnet digital ${cardAssignedLabel}` : 'Pendiente de asignacion'}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryLabel}>Estado activo</Text>
                      <Text style={styles.summaryValue}>{card?.active === false ? 'Inactivo' : 'Activo'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.statusCard}>
                  <Text style={styles.sectionTitle}>Seguimiento</Text>
                  {steps.map((step, index) => (
                    <View key={step.key} style={[styles.timelineRow, index === steps.length - 1 && styles.timelineRowLast]}>
                      <View style={styles.timelineRail}>
                        <View style={[styles.timelineDot, styles[`tone_${step.tone}`]]} />
                        {index < steps.length - 1 && <View style={styles.timelineLine} />}
                      </View>
                      <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>{step.title}</Text>
                        <Text style={styles.timelineValue}>{step.value}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {!!latestRequest?.reasonRejection && (
                  <View style={styles.alertCard}>
                    <Text style={styles.alertTitle}>Observacion de administracion</Text>
                    <Text style={styles.alertText}>{latestRequest.reasonRejection}</Text>
                  </View>
                )}
              </>
            )}
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
  pageSubtitle: { maxWidth: 500, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stateBox: {
    marginTop: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#59645F',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    marginTop: 12,
    color: '#B42318',
    fontSize: 12,
    fontWeight: '800',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDF7EC',
  },
  sectionTitle: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryItem: {
    flexGrow: 1,
    flexBasis: 180,
    minHeight: 72,
    borderRadius: 8,
    backgroundColor: '#F8FBF9',
    borderWidth: 1,
    borderColor: '#E5EEE9',
    padding: 12,
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  summaryValue: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '900',
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
  },
  timelineRowLast: {
    minHeight: 48,
  },
  timelineRail: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 3,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#D7E6DE',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 12,
  },
  timelineTitle: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 4,
  },
  timelineValue: {
    color: '#4B5563',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
  tone_success: {
    backgroundColor: '#16A34A',
  },
  tone_warning: {
    backgroundColor: '#D97706',
  },
  tone_danger: {
    backgroundColor: '#DC2626',
  },
  tone_neutral: {
    backgroundColor: '#94A3B8',
  },
  alertCard: {
    backgroundColor: '#FFF4E5',
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F4C98D',
  },
  alertTitle: {
    color: '#9A3412',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 6,
  },
  alertText: {
    color: '#7C2D12',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
});

