import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/OnboardingScreen.jsx';
import LoginScreen from '../screens/LoginGatewayScreen.jsx';
import RegisterScreen from '../screens/RegisterGatewayScreen.jsx';
import VerificationGatewayScreen from '../screens/VerificationGatewayScreen.jsx';
import RegisterGatewayScreen from '../screens/RegisterGatewayScreen.jsx';
import LoginGatewayScreen from '../screens/LoginGatewayScreen.jsx';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: {
              opacity: progress,
            },
          }),
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginGatewayScreen} />
        <Stack.Screen name="Register" component={RegisterGatewayScreen} />
        <Stack.Screen name="Verification" component={VerificationGatewayScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
