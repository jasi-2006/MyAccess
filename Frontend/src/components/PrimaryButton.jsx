import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, useWindowDimensions, PixelRatio, Platform } from 'react-native';
import { colors } from '../theme/colors.jsx';

const STANDARD_WIDTH = 375;
const STANDARD_HEIGHT = 812;

const useResponsive = () => {
  const { width: deviceWidth, height: deviceHeight, scale: pixelScale } = useWindowDimensions();

  const scale = (size) => (deviceWidth / STANDARD_WIDTH) * size;
  const verticalScale = (size) => (deviceHeight / STANDARD_HEIGHT) * size;
  const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
  const fontScale = (size) => PixelRatio.roundToNearestPixel(scale(size) * pixelScale);

  const shadowProps = () => ({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: moderateScale(4) },
    shadowOpacity: 0.25,
    shadowRadius: moderateScale(4),
    ...(Platform.OS === 'android' && { elevation: 5 }),
  });

  return { scale, verticalScale, moderateScale, fontScale, shadowProps };
};

export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) {
  const { moderateScale: ms, fontScale: fs, shadowProps } = useResponsive();

  const buttonHeight = ms(56);
  const borderRadius = buttonHeight / 2;
  const fontSize = fs(16);

  return (
    <TouchableOpacity
      style={[
        {
          height: buttonHeight,
          borderRadius,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        },
        variant === 'primary' && { backgroundColor: colors.primary },
        variant === 'secondary' && { 
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.grayDark,
        },
        disabled && { opacity: 0.5 },
        style,
        shadowProps(),
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.text : colors.background} />
      ) : (
        <Text style={[
          { 
            fontSize, 
            fontWeight: '600', 
            color: colors.text 
          },
          variant === 'secondary' && { color: colors.textSecondary },
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

