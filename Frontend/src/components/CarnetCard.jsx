import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
  Image,
} from 'react-native';
import { colors } from '../theme/colors.jsx';
import { resolveImageUrl } from '../services/api.js';
import { resolveUserRole, getRoleDisplayName, ROLES } from '../utils/accessControl';



const QR_PATTERN = [
  '11111110001001111111',
  '10000010110010100001',
  '10111010101110101101',
  '10111010010000101101',
  '10111010111110101101',
  '10000010001000100001',
  '11111110101010111111',
  '00000000110110000000',
  '10110111100011101011',
  '00101100111001011001',
  '11100011101011100011',
  '00111001010100101110',
  '10101110111110001011',
  '00000000101000100000',
  '11111110110101111111',
  '10000010001100100001',
  '10111010111010101101',
  '10111010010100101101',
  '10000010101110100001',
  '11111110011000111111',
];

function QrBlock() {
  return (
    <View style={styles.qrOuter}>
      <View style={styles.qrGrid}>
        {QR_PATTERN.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.qrRow}>
            {row.split('').map((cell, columnIndex) => (
              <View
                key={`cell-${rowIndex}-${columnIndex}`}
                style={[styles.qrCell, cell === '1' ? styles.qrCellDark : styles.qrCellLight]}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function BarcodeBlock() {
  const bars = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 3, 1];
  return (
    <View style={styles.barcodeWrap}>
      {bars.map((bar, index) => (
        <View
          key={`bar-${index}`}
          style={[
            styles.barcodeBar,
            { width: bar, marginRight: index === bars.length - 1 ? 0 : 1 },
          ]}
        />
      ))}
    </View>
  );
}

function SenaLogo() {
  return (
    <View style={styles.logoBlock}>
      <Image source={require('../assets/logoSena.png')} style={styles.logoSenaImg} resizeMode="contain" />
    </View>
  );
}

export default function CarnetCard({ profile, card, loading, cardError }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const cardWidth = isMobile ? Math.min(width - 40, 265) : 265;
  const cardHeight = 420;

  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    const nextValue = flipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue: nextValue,
      friction: 8,
      tension: 12,
      useNativeDriver: true,
    }).start();
    setFlipped(!flipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0.4, 0.5],
    outputRange: [1, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0.4, 0.5],
    outputRange: [0, 1],
  });

  const studentName = (profile?.fullName || profile?.full_name || 'Aprendiz').trim();
  const documentType = profile?.typeDocument || 'C.C';
  const documentNumber = profile?.document || '0.000.000.000';
  const bloodType = profile?.bloodType || 'RH O+';
  const normalizedRole = resolveUserRole(profile);
  const roleLabel = getRoleDisplayName(normalizedRole);
  const canManageCard = [ROLES.ADMIN, ROLES.INSTRUCTOR].includes(normalizedRole);
  const isActive = card?.active ?? true;
  const hasCardRecord = Boolean(card?.idCard);
  const regional = profile?.regional || 'Regional Quindio';
  const trainingCenter = profile?.trainingCenter || 'Centro de Comercio y Turismo';
  const trainingProgram = profile?.trainingProgram || 'ADSO';
  const ficha = profile?.ficha || profile?.Ficha || '0000000';
  const photoUrl = resolveImageUrl(profile?.photoUrl || card?.photoUrl);

  const accessHashTop = `${documentType}${documentNumber}${studentName}`.replace(/\s+/g, '').toUpperCase();
  const accessHashBottom = `${regional}${trainingCenter}${ficha}`.replace(/\s+/g, '').toUpperCase();

  return (
    <View style={styles.cardStage}>
      <View style={styles.statusPanel}>
        <View>
          <Text style={styles.statusLabel}>Estado del carnet</Text>
          <Text style={[styles.statusValue, isActive ? styles.statusActive : styles.statusInactive]}>
            {isActive ? 'Activo' : 'Inactivo'}
          </Text>
        </View>

      </View>

      {!!cardError && <Text style={styles.statusError}>{cardError}</Text>}
      {canManageCard && !loading && !hasCardRecord && (
        <Text style={styles.statusHint}>Aun no hay un registro de carnet para actualizar.</Text>
      )}

      <TouchableOpacity onPress={flipCard} activeOpacity={1}>
        <View style={{ width: cardWidth, height: cardHeight }}>
          <Animated.View
            style={[
              styles.cardBase,
              styles.cardFront,
              !isActive && styles.cardDisabled,
              {
                width: cardWidth,
                height: cardHeight,
                position: 'absolute',
                backfaceVisibility: 'hidden',
                transform: [{ rotateY: frontInterpolate }],
                opacity: frontOpacity,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : (
              <>
                <View style={styles.frontTop}>
                  <SenaLogo />
                  <View style={styles.photoFrame}>
                    {photoUrl ? (
                      <Image source={{ uri: photoUrl }} style={styles.photoImage} resizeMode="cover" />
                    ) : (
                      <Image source={require('../assets/silueta.png')} style={styles.photoImage} resizeMode="cover" />
                    )}
                  </View>
                </View>

                <View style={styles.frontBody}>
                  <Text style={styles.roleLabel}>{roleLabel}</Text>
                  <View style={styles.greenRule} />
                  <Text style={styles.studentNameFront}>{studentName}</Text>
                  <Text style={styles.identityText}>{`${documentType} ${documentNumber} RH ${bloodType}`}</Text>
                  <BarcodeBlock />
                </View>

                <View style={styles.frontFooter}>
                  {!isActive && (
                    <View style={styles.inactiveBadge}>
                      <Text style={styles.inactiveBadgeText}>CARNET INACTIVO</Text>
                    </View>
                  )}
                  <Text style={styles.footerPrimary}>Regional {regional}</Text>
                  <Text style={styles.footerSecondary}>{trainingCenter}</Text>
                  <Text style={styles.footerTertiary}>{trainingProgram}</Text>
                  <Text style={styles.footerTertiary}>{`Grupo No ${ficha}`}</Text>
                </View>

                {!isActive && (
                  <View style={styles.inactiveOverlay}>
                    <Text style={styles.inactiveOverlayText}>DESACTIVADO</Text>
                  </View>
                )}
              </>
            )}
          </Animated.View>

          <Animated.View
            style={[
              styles.cardBase,
              styles.cardBack,
              !isActive && styles.cardDisabled,
              {
                width: cardWidth,
                height: cardHeight,
                position: 'absolute',
                backfaceVisibility: 'hidden',
                transform: [{ rotateY: backInterpolate }],
                opacity: backOpacity,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} style={styles.loader} />
            ) : (
              <>
                <Text style={styles.hashTop}>
                  Este carnet pertenece a quien lo porta, unicamente para el cumplimiento de sus funciones y para la obtencion de servicios que el SENA presta a sus funcionarios y/o contratistas {'\n'}
                  Se solicita a las autoridades civiles y militares prestarle toda la colaboracion para su desempeno

                </Text>
              
                <View style={styles.qrSection}>
                  <QrBlock />
                </View>

                <View style={styles.signatureBlock}>
                  <Image source={require('../assets/firma.png')} style={styles.signatureImage} />
                  <Text style={styles.signatureLabel}>FIRMA AUTORIZADA</Text>
                </View>

                <Text style={styles.hashBottom}>
                  Si por algun motivo este carné es extraviado, por favor dirijase a la Direccion Regional Quindio - Avenida Centenario #44 Norte -15
                </Text>

                {!isActive && (
                  <View style={styles.inactiveOverlay}>
                    <Text style={styles.inactiveOverlayText}>DESACTIVADO</Text>
                  </View>
                )}
              </>
            )}
          </Animated.View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
  },
  statusPanel: {
    width: '100%',
    maxWidth: 360,
    minHeight: 54,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8E8E1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  statusLabel: {
    fontSize: 11,
    color: '#59645F',
    fontWeight: '700',
  },
  statusValue: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: '900',
  },
  statusActive: {
    color: '#087C4A',
  },
  statusInactive: {
    color: '#B42318',
  },
  statusError: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 8,
    color: '#B42318',
    fontSize: 12,
    fontWeight: '700',
  },
  statusHint: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 8,
    color: '#59645F',
    fontSize: 12,
    fontWeight: '700',
  },
  cardBase: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  cardFront: {
    backgroundColor: '#FDFDFD',
  },
  cardBack: {
    backgroundColor: '#FFFFFF',
    paddingTop: 14,
    paddingBottom: 14,
  },
  cardDisabled: {
    borderColor: '#B42318',
  },
  loader: {
    flex: 1,
  },
  frontTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  logoBlock: {
    width: 88,
    alignItems: 'center',
    marginTop: 2,
  },
  logoSenaImg: {
    width: 80,
    height: 80,
  },
  logoText: {
    color: '#0A8A4A',
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 21,
    letterSpacing: 0.2,
  },
  logoSymbol: {
    width: 56,
    height: 64,
    marginTop: 2,
    alignItems: 'center',
  },
  logoCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0A8A4A',
    marginBottom: 3,
  },
  logoArms: {
    width: 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  logoArm: {
    width: 22,
    height: 6,
    backgroundColor: '#0A8A4A',
    borderRadius: 3,
  },
  logoArmLeft: {
    transform: [{ rotate: '8deg' }],
  },
  logoArmRight: {
    transform: [{ rotate: '-8deg' }],
  },
  logoStem: {
    width: 7,
    height: 16,
    borderRadius: 3,
    backgroundColor: '#0A8A4A',
    marginBottom: 2,
  },
  logoLegs: {
    width: 42,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logoLeg: {
    width: 8,
    height: 28,
    backgroundColor: '#0A8A4A',
    borderRadius: 4,
  },
  logoLegLeft: {
    transform: [{ rotate: '32deg' }],
  },
  logoLegRight: {
    transform: [{ rotate: '-32deg' }],
  },
  photoFrame: {
    width: 122,
    height: 152,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  frontBody: {
    marginTop: -25,
  },
  roleLabel: {
    fontSize: 12,
    color: '#000000',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: -25,
  },
  greenRule: {
    height: 4,
    backgroundColor: '#0A8A4A',
    borderRadius: 2,
  },
  studentNameFront: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '900',
    color: '#118449',
    marginBottom: 6,
  },
  identityText: {
    fontSize: 14,
    color: '#3A3A3A',
  },
  barcodeWrap: {
    height: 43,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barcodeBar: {
    height: 24,
    backgroundColor: '#111111',
  },
  frontFooter: {
    gap: 2,
  },
  inactiveBadge: {
    alignSelf: 'flex-start',
    marginBottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#FEE4E2',
  },
  inactiveBadgeText: {
    color: '#B42318',
    fontSize: 9,
    fontWeight: '900',
  },
  inactiveOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: '44%',
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#B42318',
    backgroundColor: 'rgba(254, 228, 226, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  inactiveOverlayText: {
    color: '#B42318',
    fontSize: 18,
    fontWeight: '900',
  },
  footerPrimary: {
    fontSize: 13,
    color: '#4A4A4A',
    fontWeight: '700',
  },
  footerSecondary: {
    fontSize: 11,
    color: '#5D9C7A',
    fontWeight: '700',
  },
  footerTertiary: {
    fontSize: 10,
    color: '#4A4A4A',
  },
  hashTop: {
    fontSize: 10,
    color: '#2E2E2E',
    lineHeight: 13,
  },
  qrSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  qrOuter: {
    padding: 6,
    backgroundColor: '#FFFFFF',
  },
  qrGrid: {
    borderWidth: 1,
    borderColor: '#111111',
  },
  qrRow: {
    flexDirection: 'row',
  },
  qrCell: {
    width: 4,
    height: 4,
  },
  qrCellDark: {
    backgroundColor: '#111111',
  },
  qrCellLight: {
    backgroundColor: '#FFFFFF',
  },
  signatureBlock: {
    alignItems: 'center',
    marginBottom: 10,
  },
  signatureImage: {
    width: 200,
    height: 70,
    marginBottom: 3,
    resizeMode: 'contain',
  },
  signatureLabel: {
    fontSize: 11,
    color: '#333333',
    textAlign: 'center',
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  hashBottom: {
    fontSize: 10,
    color: '#2E2E2E',
    lineHeight: 13,
  },
});