import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ActivityIndicator, useWindowDimensions } from 'react-native';
import { colors } from '../theme/colors.jsx';

export default function CarnetCard({ profile, loading }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;

  const cardWidth  = isMobile ? Math.min(width - 36, 320) : isTablet ? 300 : 350;
  const cardHeight = isMobile ? 420 : 520;

  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    const toValue = flipped ? 0 : 1;
    Animated.spring(flipAnim, { toValue, friction: 8, tension: 10, useNativeDriver: true }).start();
    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backInterpolate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity     = flipAnim.interpolate({ inputRange: [0.4, 0.5], outputRange: [1, 0] });
  const backOpacity      = flipAnim.interpolate({ inputRange: [0.4, 0.5], outputRange: [0, 1] });

  const studentName    = (profile?.fullName || profile?.full_name)?.trim() || 'Aprendiz';
  const studentInitial = studentName.charAt(0).toUpperCase();

  return (
    <View style={styles.cardStage}>
      <TouchableOpacity onPress={flipCard} activeOpacity={1}>
        <View style={{ width: cardWidth, height: cardHeight }}>

          {/* FRENTE */}
          <Animated.View style={[
            styles.mockCard,
            { width: cardWidth, height: cardHeight, position: 'absolute', backfaceVisibility: 'hidden', transform: [{ rotateY: frontInterpolate }], opacity: frontOpacity },
          ]}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardBrand}>MyAccess</Text>
                <Text style={styles.cardType}>Carnet digital</Text>
              </View>
              <View style={styles.cardChip} />
            </View>

            {loading ? (
              <ActivityIndicator color={colors.primary} style={{ flex: 1 }} />
            ) : (
              <>
                <View style={styles.cardBody}>
                  <View style={styles.profileCircle}>
                    <Text style={styles.profileInitial}>{studentInitial}</Text>
                  </View>
                  <Text style={styles.studentName}>{studentName}</Text>
                  <Text style={styles.studentMeta}>{profile?.trainingCenter ?? '—'}</Text>
                  <Text style={styles.studentMeta}>{profile?.regional ?? '—'}</Text>
                  <Text style={styles.studentMeta}>{profile?.trainingProgram ?? '—'}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <View>
                    <Text style={styles.cardFooterLabel}>Documento</Text>
                    <Text style={styles.cardFooterValue}>{profile?.typeDocument ?? '—'} {profile?.document ?? '—'}</Text>
                  </View>
                  <View>
                    <Text style={styles.cardFooterLabel}>Sangre</Text>
                    <Text style={styles.cardFooterValue}>{profile?.bloodType ?? '—'}</Text>
                  </View>
                </View>
                <Text style={styles.flipHint}>Toca para voltear 🔄</Text>
              </>
            )}
          </Animated.View>

          {/* REVERSO */}
          <Animated.View style={[
            styles.mockCard, styles.mockCardBack,
            { width: cardWidth, height: cardHeight, position: 'absolute', backfaceVisibility: 'hidden', transform: [{ rotateY: backInterpolate }], opacity: backOpacity },
          ]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardBrand, { color: '#FFFFFF' }]}>MyAccess</Text>
              <Text style={[styles.cardType, { color: 'rgba(255,255,255,0.7)' }]}>Reverso</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={[styles.profileCircle, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Text style={[styles.profileInitial, { color: '#FFFFFF' }]}>{studentInitial}</Text>
              </View>
              <Text style={[styles.studentName, { color: '#FFFFFF' }]}>{studentName}</Text>
            </View>
            <View style={styles.cardFooter}>
              <View>
                <Text style={[styles.cardFooterLabel, { color: 'rgba(255,255,255,0.7)' }]}>Ficha</Text>
                <Text style={[styles.cardFooterValue, { color: '#FFFFFF' }]}>{profile?.ficha ?? '—'}</Text>
              </View>
              <View>
                <Text style={[styles.cardFooterLabel, { color: 'rgba(255,255,255,0.7)' }]}>Rol</Text>
                <Text style={[styles.cardFooterValue, { color: '#FFFFFF' }]}>{profile?.nameRole ?? '—'}</Text>
              </View>
            </View>
            <View style={styles.cardFooter}>
              <View>
                <Text style={[styles.cardFooterLabel, { color: 'rgba(255,255,255,0.7)' }]}>Programa</Text>
                <Text style={[styles.cardFooterValue, { color: '#FFFFFF' }]}>{profile?.trainingProgram ?? '—'}</Text>
              </View>
            </View>
            <Text style={[styles.flipHint, { color: 'rgba(255,255,255,0.6)' }]}>Toca para voltear 🔄</Text>
          </Animated.View>

        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardStage:   { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8 },
  mockCard: {
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDDDDD',
    padding: 22, justifyContent: 'space-between',
  },
  mockCardBack: { backgroundColor: '#0F766E' },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBrand:   { fontSize: 22, fontWeight: '800', color: colors.primary },
  cardType:    { fontSize: 12, color: '#6B7280', marginTop: 4 },
  cardChip:    { width: 42, height: 30, borderRadius: 8, backgroundColor: '#E8E8E8' },
  cardBody:    { alignItems: 'center', gap: 12 },
  profileCircle: {
    width: 92, height: 92, borderRadius: 46,
    backgroundColor: '#E5F8EC', alignItems: 'center', justifyContent: 'center',
  },
  profileInitial: { fontSize: 34, fontWeight: '800', color: colors.primary },
  studentName:    { fontSize: 22, fontWeight: '700', color: '#202020', textAlign: 'center' },
  studentMeta:    { fontSize: 13, lineHeight: 18, color: '#69707A', textAlign: 'center', maxWidth: 220 },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between' },
  cardFooterLabel:{ fontSize: 11, textTransform: 'uppercase', color: '#7A7A7A', marginBottom: 4 },
  cardFooterValue:{ fontSize: 15, fontWeight: '700', color: '#1F2937' },
  flipHint:       { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 8 },
});
