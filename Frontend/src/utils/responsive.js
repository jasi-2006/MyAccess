import { useWindowDimensions, PixelRatio, Platform } from 'react-native';

const STANDARD_WIDTH = 375;
const STANDARD_HEIGHT = 812;

export const useResponsive = () => {
  const { width: deviceWidth, height: deviceHeight, scale: pixelScale } = useWindowDimensions();

  const scale = (size) => (width / STANDARD_WIDTH) * size;
  const verticalScale = (size) => (deviceHeight / STANDARD_HEIGHT) * size;
  const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;
  const fontScale = (size) => PixelRatio.roundToNearestPixel(scale(size) * pixelScale);
  
  const s = scale;
  const vs = verticalScale;
  const ms = moderateScale;
  const fs = fontScale;

  const shadowProps = (forAndroid = false) => {
    const common = {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: ms(4) },
      shadowOpacity: 0.25,
      shadowRadius: ms(4),
    };
    if (Platform.OS === 'ios' || !forAndroid) return common;
    return {
      elevation: 5,
      ...common,
    };
  };

  return { scale: s, verticalScale: vs, moderateScale: ms, fontScale: fs, shadowProps, deviceWidth, deviceHeight };
};

