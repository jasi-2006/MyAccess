import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/OnboardingScreen.jsx';
import LoginGatewayScreen from '../screens/LoginGatewayScreen.jsx';
import RegisterGatewayScreen from '../screens/RegisterGatewayScreen.jsx';
import VerificationGatewayScreen from '../screens/VerificationGatewayScreen.jsx';
import HomeGatewayScreen from '../screens/HomeGatewayScreen.jsx';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen.jsx';
import VerifyResetCodeScreen from '../screens/VerifyResetCodeScreen.jsx';
import ResetPasswordScreen from '../screens/ResetPasswordScreen.jsx';
import CarnetGatewayScreen from '../screens/CarnetGatewayScreen.jsx';
import UserProfile from '../screens/UserProfile.jsx';
import NotificationsScreen from '../screens/NotificationsScreen.jsx';
import NotificationDetailScreen from '../screens/NotificationDetailScreen.jsx';


const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          cardStyle: { overflow: 'auto' },
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: {
              opacity: progress,
              overflow: 'auto',
            },
          }),
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginGatewayScreen} />
        <Stack.Screen name="Register" component={RegisterGatewayScreen} />
        <Stack.Screen name="Verification" component={VerificationGatewayScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyResetCode" component={VerifyResetCodeScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Home" component={HomeGatewayScreen} />
        <Stack.Screen name="Card" component={CarnetGatewayScreen} />
        <Stack.Screen name="User" component={UserProfile} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="NotificationDetail" component={NotificationDetailScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
