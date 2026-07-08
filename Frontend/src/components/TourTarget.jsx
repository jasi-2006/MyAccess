import React, { useRef, useEffect } from 'react';
import { View } from 'react-native';
import { useTour } from '../utils/tourContext.js';

/**
 * TourTarget wraps any React Native component and automatically registers 
 * its exact screen coordinates in the TourContext when a tour is active.
 */
export default function TourTarget({ targetId, children, style }) {
  const { registerTarget, unregisterTarget, isTourActive, currentStep } = useTour();
  const ref = useRef(null);

  const measureElement = () => {
    if (ref.current) {
      ref.current.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          registerTarget(targetId, { x, y, width, height });
        }
      });
    }
  };

  useEffect(() => {
    if (!isTourActive) return;

    // Wait a brief moment for the page transitions / layout to settle, then measure
    const timer = setTimeout(measureElement, 250);

    return () => {
      clearTimeout(timer);
      unregisterTarget(targetId);
    };
  }, [isTourActive, targetId, currentStep]);

  const onLayout = () => {
    if (isTourActive) {
      // Re-measure whenever layout changes (e.g. window resize)
      measureElement();
    }
  };

  return (
    <View
      ref={ref}
      onLayout={onLayout}
      style={style}
      collapsable={false}
    >
      {children}
    </View>
  );
}
