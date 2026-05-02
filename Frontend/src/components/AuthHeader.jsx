import React from 'react';
import { View, Text, Image, useWindowDimensions } from 'react-native';
import { colors } from '../theme/colors.jsx';

export default function AuthHeader({ image, subtitle, compact = false }) {
  const { width, height } = useWindowDimensions();
  const isSmallDevice = width < 375;
  const isTablet      = width >= 500 && width < 1024;
  const isDesktop     = width >= 600;
  const horizontalPadding = isDesktop ? width * 0.29 : isTablet ? width * 0.20 : width * 0.10;

  const imgW = compact
    ? (isDesktop ? 160 : isTablet ? 190 : isSmallDevice ? 110 : 200)
    : (isDesktop ? 190 : isTablet ? 240 : isSmallDevice ? 150 : 230);
  const imgH = compact
    ? (isDesktop ? 160 : isTablet ? 180 : isSmallDevice ? 110 : 200)
    : (isDesktop ? 240 : isTablet ? 220 : isSmallDevice ? 140 : 190);

  const paddingTop    = compact ? (isDesktop ? 16 : 20) : (isDesktop ? height * 0.04 : height * 0.05);
  const paddingBottom = compact ? 12 : 16;
  const subtitleSize  = isDesktop ? 13 : isTablet ? 14 : 13;
  const curveHeight   = isDesktop ? 40 : isTablet ? 30 : 24;
  const curveRadius   = curveHeight;

  return (
    <View style={{ width: '100%', backgroundColor: colors.primary }}>
      <View style={{
        backgroundColor: colors.primary,
        paddingTop,
        paddingBottom,
        paddingHorizontal: horizontalPadding,
        alignItems: 'center',
      }}>
        <Image
          source={image}
          style={{ width: imgW, height: imgH, resizeMode: 'contain' }}
        />
        <Text style={{
          fontSize: subtitleSize,
          color: '#FFFFFF',
          opacity: 0.9,
          textAlign: 'center',
          marginTop: 10,
        }}>
          {subtitle}
        </Text>
      </View>
      <View style={{
        height: curveHeight,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: curveRadius,
        borderTopRightRadius: curveRadius,
      }} />
    </View>
  );
}
