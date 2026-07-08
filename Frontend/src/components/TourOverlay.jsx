import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTour } from '../utils/tourContext.js';

export default function TourOverlay() {
  const { isTourActive, tourRole, currentStep, nextStep, prevStep, stopTour, steps, targets } = useTour();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const isMobile = screenWidth < 768;

  // Pulse animation for the target highlight box
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  const currentStepData = steps?.[currentStep];
  const targetId = currentStepData?.targetId;
  const targetCoords = targetId ? targets[targetId] : null;
  const showHighlight = isTourActive && !!targetCoords;

  useEffect(() => {
    if (showHighlight) {
      pulseAnim.setValue(0.6);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [showHighlight, currentStep]);

  if (!isTourActive || !steps || steps.length === 0) return null;

  const stepNumber = currentStep + 1;
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  // Mask coordinates
  const tx = targetCoords?.x || 0;
  const ty = targetCoords?.y || 0;
  const tw = targetCoords?.width || 0;
  const th = targetCoords?.height || 0;

  // Tooltip positioning math
  let tooltipStyle = {};
  let arrowStyle = {};
  const tooltipWidth = Math.min(380, screenWidth - 32);

  if (targetCoords) {
    const spaceAbove = ty;
    const spaceBelow = screenHeight - (ty + th);
    const useTop = spaceAbove > spaceBelow && spaceAbove > 180;

    const targetCenter = tx + tw / 2;
    let leftPos = targetCenter - tooltipWidth / 2;
    leftPos = Math.max(16, Math.min(leftPos, screenWidth - tooltipWidth - 16));

    if (useTop) {
      tooltipStyle = {
        position: 'absolute',
        bottom: screenHeight - ty + 12,
        left: leftPos,
        width: tooltipWidth,
      };
      
      const arrowLeft = targetCenter - leftPos - 8;
      arrowStyle = {
        bottom: -10,
        left: Math.max(16, Math.min(arrowLeft, tooltipWidth - 32)),
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#059669',
      };
    } else {
      tooltipStyle = {
        position: 'absolute',
        top: ty + th + 12,
        left: leftPos,
        width: tooltipWidth,
      };

      const arrowLeft = targetCenter - leftPos - 8;
      arrowStyle = {
        top: -10,
        left: Math.max(16, Math.min(arrowLeft, tooltipWidth - 32)),
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#059669',
      };
    }
  } else {
    // Fallback to centered dialog if target coordinates are not available
    tooltipStyle = {
      position: 'absolute',
      top: '35%',
      alignSelf: 'center',
      width: tooltipWidth,
    };
  }

  return (
    <View style={styles.fullscreenContainer} pointerEvents="box-none">
      
      {/* ── MÁSCARAS DE DIMMING (RECORTAN EL ELEMENTO DESTACADO) ── */}
      {showHighlight ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* Top mask */}
          <View style={[styles.dimmer, { top: 0, left: 0, width: screenWidth, height: ty }]} />
          {/* Bottom mask */}
          <View style={[styles.dimmer, { top: ty + th, left: 0, width: screenWidth, bottom: 0 }]} />
          {/* Left mask */}
          <View style={[styles.dimmer, { top: ty, left: 0, width: tx, height: th }]} />
          {/* Right mask */}
          <View style={[styles.dimmer, { top: ty, left: tx + tw, right: 0, height: th }]} />
        </View>
      ) : (
        /* Fullscreen dimming fallback */
        <View style={[styles.dimmer, StyleSheet.absoluteFill]} pointerEvents="none" />
      )}

      {/* ── CUADRO DE RESALTADO CON BRILLO Y PULSO ── */}
      {showHighlight && (
        <Animated.View
          style={[
            styles.highlightBox,
            {
              top: ty - 4,
              left: tx - 4,
              width: tw + 8,
              height: th + 8,
              opacity: pulseAnim,
            },
          ]}
          pointerEvents="none"
        />
      )}

      {/* ── TARJETA DEL TOOLTIP GUIADO ── */}
      <View style={[styles.overlayContainer, tooltipStyle]}>
        
        {/* Flecha indicadora */}
        {targetCoords && <View style={[styles.arrow, arrowStyle]} />}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>PASO {stepNumber}/{totalSteps}</Text>
          </View>
          <Text style={styles.roleTitle} numberOfLines={1}>
            Paseo: {tourRole.charAt(0).toUpperCase() + tourRole.slice(1)}
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={stopTour}>
            <Ionicons name="close" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.body}>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepText}>{currentStepData.text}</Text>
        </View>

        {/* Footer controls */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={stopTour}>
            <Text style={styles.cancelBtnText}>Salir</Text>
          </TouchableOpacity>

          <View style={styles.navGroup}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.prevBtn} onPress={prevStep}>
                <Ionicons name="chevron-back" size={14} color="#059669" />
                <Text style={styles.prevBtnText}>Atrás</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
              <Text style={styles.nextBtnText}>
                {isLastStep ? 'Finalizar' : 'Siguiente'}
              </Text>
              <Ionicons name={isLastStep ? "checkmark" : "chevron-forward"} size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreenContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
  },
  dimmer: {
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    position: 'absolute',
  },
  highlightBox: {
    position: 'absolute',
    borderRadius: 10,
    borderWidth: 2.5,
    borderColor: '#24C565',
    shadowColor: '#24C565',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 99998,
  },
  overlayContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#059669',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 99999,
  },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: 8,
    marginBottom: 10,
    gap: 8,
  },
  badgeWrap: {
    backgroundColor: '#E8FFF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '850',
    color: '#059669',
  },
  roleTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    flex: 1,
  },
  closeBtn: {
    padding: 2,
  },
  body: {
    marginBottom: 14,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  stepText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  cancelBtnText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '700',
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prevBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#059669',
    backgroundColor: '#FFFFFF',
  },
  prevBtnText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginLeft: 2,
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#059669',
  },
  nextBtnText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

