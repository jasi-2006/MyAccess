import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTour } from '../utils/tourContext.js';

export default function TourOverlay() {
  const { isTourActive, tourRole, currentStep, nextStep, prevStep, stopTour, steps } = useTour();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  if (!isTourActive || !steps || steps.length === 0) return null;

  const currentStepData = steps[currentStep];
  const stepNumber = currentStep + 1;
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  // Determinar posición según el paso
  const getContainerStyle = () => {
    switch (currentStepData.placement) {
      case 'top':
        return [styles.overlayContainer, styles.positionTop, isMobile ? { width: '90%' } : { width: 480 }];
      case 'center':
        return [styles.overlayContainer, styles.positionCenter, isMobile ? { width: '90%' } : { width: 480 }];
      case 'bottom':
      default:
        return [styles.overlayContainer, styles.positionBottom, isMobile ? { width: '90%' } : { width: 480 }];
    }
  };

  return (
    <View style={styles.backdrop} pointerEvents="box-none">
      <View style={getContainerStyle()}>
        {/* Flecha indicadora (Tooltip Arrow) */}
        {currentStepData.placement === 'top' && <View style={[styles.arrow, styles.arrowTop]} />}
        {currentStepData.placement === 'bottom' && <View style={[styles.arrow, styles.arrowBottom]} />}
        {currentStepData.placement === 'center' && <View style={[styles.arrow, styles.arrowLeft]} />}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badgeWrap}>
            <Text style={styles.badgeText}>MÓDULO {stepNumber}/{totalSteps}</Text>
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99999,
  },
  overlayContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#059669',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
    position: 'absolute',
  },
  // Posicionamientos
  positionTop: {
    top: 70,
  },
  positionCenter: {
    top: '38%',
  },
  positionBottom: {
    bottom: 30,
  },

  // Cabecera
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
    fontWeight: '800',
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

  // Cuerpo
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

  // Pie
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
    fontWeight: '600',
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
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  arrowTop: {
    top: -10,
    left: '50%',
    marginLeft: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#059669',
  },
  arrowBottom: {
    bottom: -10,
    left: '50%',
    marginLeft: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#059669',
  },
  arrowLeft: {
    left: -10,
    top: '50%',
    marginTop: -8,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#059669',
  },
});
