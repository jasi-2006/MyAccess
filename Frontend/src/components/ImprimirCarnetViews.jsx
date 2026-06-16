import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Image } from 'react-native';
import { styles } from '../screens/Imprimir.styles.jsx';
import { resolveImageUrl } from '../services/api.js';
import { getRoleDisplayName } from '../utils/accessControl';
import {
  formatCarnetIdentityLine,
  formatCarnetNameLines,
  formatRegionalForCarnet,
} from '../utils/carnetFormat';

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

function BarcodeBlock() {
  const bars = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 3, 1];
  return (
    <View style={styles.verticalBarcodeWrap}>
      {bars.map((bar, index) => (
        <View
          key={`bar-${index}`}
          style={[
            styles.verticalBarcodeBar,
            { width: bar, marginRight: index === bars.length - 1 ? 0 : 1 },
          ]}
        />
      ))}
    </View>
  );
}

function QrBlock() {
  return (
    <View style={{ padding: 4, backgroundColor: '#FFFFFF' }}>
      <View style={{ borderWidth: 1, borderColor: '#111111' }}>
        {QR_PATTERN.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={{ flexDirection: 'row' }}>
            {row.split('').map((cell, columnIndex) => (
              <View
                key={`cell-${rowIndex}-${columnIndex}`}
                style={{
                  width: 3,
                  height: 3,
                  backgroundColor: cell === '1' ? '#111111' : '#FFFFFF',
                }}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function CarnetField({ label, value }) {
  return (
    <View style={styles.carnetFieldRow}>
      <Text style={styles.carnetFieldLabel}>{label}: </Text>
      <Text style={styles.carnetFieldValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function PhotoBox({ photoUrl }) {
  if (photoUrl) {
    return <Image source={{ uri: photoUrl }} style={styles.carnetPhoto} resizeMode="cover" />;
  }

  return (
    <Image
      source={require('../assets/silueta.png')}
      style={styles.carnetPhoto}
      resizeMode="cover"
    />
  );
}

export function CarnetPreview({ learner, card, name, onPress }) {
  const photoUrl = resolveImageUrl(learner?.photoUrl || card?.photoUrl);
  const roleLabel = getRoleDisplayName(learner?.nameRole || learner?.name_role);
  const displayName = name || learner?.fullName || learner?.full_name || 'Aprendiz';
  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress, activeOpacity: 0.88 } : {};

  return (
    <Container style={styles.carnetCard} {...containerProps}>
      <View style={styles.carnetHeader}>
        <View style={styles.carnetLogoBox}>
          <Image
            source={require('../assets/logoSena.png')}
            style={{ width: 24, height: 24 }}
            resizeMode="contain"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.carnetInstitution}>Servicio Nacional de Aprendizaje</Text>
          <Text style={styles.carnetSubtitle}>MyAccess · Vista previa</Text>
        </View>
      </View>

      <View style={styles.carnetBody}>
        <View style={styles.carnetPhotoBox}>
          <PhotoBox photoUrl={photoUrl} />
        </View>

        <View style={styles.carnetData}>
          <Text style={styles.carnetName} numberOfLines={2}>
            {displayName}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{roleLabel}</Text>
          </View>
          <CarnetField label="Doc" value={`${learner?.typeDocument || ''} ${learner?.document || '—'}`} />
          <CarnetField label="Programa" value={learner?.trainingProgram || '—'} />
          <CarnetField label="Centro" value={learner?.trainingCenter || '—'} />
          <CarnetField label="Ficha" value={learner?.ficha || learner?.files || '—'} />
          {card?.expirationDate ? (
            <CarnetField
              label="Vence"
              value={new Date(card.expirationDate).toLocaleDateString('es-CO')}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.carnetFooter}>
        <Text style={styles.carnetFooterText}>Digital: {card?.digitalState || 'pendiente'}</Text>
        <Text style={styles.carnetFooterText}>Fisico: {card?.physicalState || 'no solicitado'}</Text>
      </View>
    </Container>
  );
}

export function IndividualCarnet({ learner, card }) {
  const photoUrl = resolveImageUrl(learner?.photoUrl || card?.photoUrl);
  const roleLabel = getRoleDisplayName(learner?.nameRole || learner?.name_role);
  const regional = formatRegionalForCarnet(learner?.regional);
  const trainingCenter = learner?.trainingCenter || 'Centro de Comercio y Turismo';
  const trainingProgram = learner?.trainingProgram || 'ADSO';
  const ficha = learner?.ficha || learner?.files || '0000000';
  const fullName = learner?.fullName || learner?.full_name || 'Sin nombre';
  const { firstLine, secondLine } = formatCarnetNameLines(fullName);
  const identityLine = formatCarnetIdentityLine(learner);

  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    const next = flipped ? 0 : 1;
    Animated.spring(flipAnim, { toValue: next, friction: 8, tension: 12, useNativeDriver: true }).start();
    setFlipped(!flipped);
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0.4, 0.5], outputRange: [1, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0.4, 0.5], outputRange: [0, 1] });

  return (
    <View style={{ alignItems: 'center', gap: 10 }}>
      <TouchableOpacity onPress={flipCard} activeOpacity={1}>
        <View style={{ width: 265, height: 420 }}>
          <Animated.View
            style={[
              styles.verticalCarnet,
              {
                position: 'absolute',
                backfaceVisibility: 'hidden',
                transform: [{ rotateY: frontRotate }],
                opacity: frontOpacity,
              },
            ]}
          >
            <View style={styles.verticalTop}>
              <View style={styles.verticalLogoBox}>
                <Image source={require('../assets/logoSena.png')} style={styles.verticalLogo} resizeMode="contain" />
              </View>
              <View style={styles.verticalPhotoFrame}>
                {photoUrl ? (
                  <Image source={{ uri: photoUrl }} style={styles.verticalPhoto} resizeMode="cover" />
                ) : (
                  <Image source={require('../assets/silueta.png')} style={styles.verticalPhoto} resizeMode="cover" />
                )}
              </View>
            </View>

            <View style={styles.verticalBody}>
              <Text style={styles.verticalRole}>{roleLabel}</Text>
              <View style={styles.verticalGreenRule} />
              <Text style={styles.verticalBrand}>
                {firstLine}
                {secondLine ? `\n${secondLine}` : ''}
              </Text>
              <Text style={styles.verticalIdentity}>{identityLine}</Text>
              <BarcodeBlock />
              <Text style={styles.verticalRegional}>{regional}</Text>
              <Text style={styles.verticalCenter}>{trainingCenter}</Text>
              <Text style={styles.verticalMuted}>{trainingProgram}</Text>
              <Text style={styles.verticalMutedLast}>{`Grupo No ${ficha}`}</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.verticalCarnet,
              styles.verticalCarnetBack,
              {
                position: 'absolute',
                backfaceVisibility: 'hidden',
                transform: [{ rotateY: backRotate }],
                opacity: backOpacity,
              },
            ]}
          >
            <Text style={styles.verticalBackText}>
              Este carnet pertenece a quien lo porta, unicamente para el cumplimiento de sus funciones y para la obtencion de servicios que el SENA presta a sus funcionarios y/o contratistas.
              {'\n'}
              Se solicita a las autoridades civiles y militares prestarle toda la colaboracion para su desempeno.
            </Text>
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <QrBlock />
            </View>
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <Image source={require('../assets/firma.png')} style={styles.verticalSignatureImage} />
              <Text style={styles.verticalSignatureLabel}>FIRMA AUTORIZADA</Text>
            </View>
            <Text style={styles.verticalBackText}>
              Si por algun motivo este carnet es extraviado, por favor dirijase a la Direccion Regional Quindio - Avenida Centenario #44 Norte -15
            </Text>
          </Animated.View>
        </View>
      </TouchableOpacity>
      <Text style={styles.flipHint}>{flipped ? 'Toca para ver el frente' : 'Toca para ver el reverso'}</Text>
    </View>
  );
}
