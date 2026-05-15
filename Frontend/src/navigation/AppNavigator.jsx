import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
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
import InstructorDashboard from '../screens/InstructorDashboard.jsx';
import FichasScreen from '../screens/Fichas.jsx';
import SolicitudesScreen from '../screens/Solicitudes.jsx';
import HistorialScreen from '../screens/Historial.jsx';
import GestionFichas from '../screens/GestionFichas.jsx';
import ProcessingStatus from '../screens/Processingstatus.jsx';
import { getAuthToken, getUserProfile } from '../services/authService';
import { canAccessRoute, getHomeRouteForRole, getRoleFromToken, normalizeRole } from '../utils/accessControl';


const Stack = createStackNavigator();

function ProtectedScreen({ component: Component, routeName, navigation, route }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function validateAccess() {
      const token = getAuthToken();

      if (!token) {
        navigation.replace('Login');
        return;
      }

      try {
        const profile = await getUserProfile();
        const role = normalizeRole(profile?.nameRole || getRoleFromToken(token));

        if (!canAccessRoute(role, routeName)) {
          navigation.replace(getHomeRouteForRole(role));
          return;
        }

        if (mounted) {
          setAllowed(true);
          setChecking(false);
        }
      } catch {
        navigation.replace('Login');
      }
    }

    validateAccess();

    return () => {
      mounted = false;
    };
  }, [navigation, routeName]);

  if (checking || !allowed) {
    return (
      <View style={styles.guard}>
        <ActivityIndicator color="#079B72" />
        <Text style={styles.guardText}>Validando acceso...</Text>
      </View>
    );
  }

  return <Component navigation={navigation} route={route} />;
}

function protect(routeName, Component) {
  return (props) => (
    <ProtectedScreen
      {...props}
      routeName={routeName}
      component={Component}
    />
  );
}

const ProtectedHome = protect('Home', HomeGatewayScreen);
const ProtectedCard = protect('Card', CarnetGatewayScreen);
const ProtectedUser = protect('User', UserProfile);
const ProtectedNotifications = protect('Notifications', NotificationsScreen);
const ProtectedNotificationDetail = protect('NotificationDetail', NotificationDetailScreen);
const ProtectedInstructor = protect('Instructor', InstructorDashboard);
const ProtectedFichas = protect('Fichas', FichasScreen);
const ProtectedSolicitudes = protect('Solicitudes', SolicitudesScreen);
const ProtectedHistorial = protect('Historial', HistorialScreen);
const protectedGestion = protect ('Gestion', GestionFichas );
const ProtectedProcessingStatus = protect('ProcessingStatus', ProcessingStatus);

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
        <Stack.Screen name="Home" component={ProtectedHome} />
        <Stack.Screen name="Card" component={ProtectedCard} />
        <Stack.Screen name="User" component={ProtectedUser} />
        <Stack.Screen name="Notifications" component={ProtectedNotifications} />
        <Stack.Screen name="NotificationDetail" component={ProtectedNotificationDetail} />
        <Stack.Screen name="Instructor" component={ProtectedInstructor} />
        <Stack.Screen name="Fichas" component={ProtectedFichas} />
        <Stack.Screen name="Solicitudes" component={ProtectedSolicitudes} />
        <Stack.Screen name="Historial" component={ProtectedHistorial} />
        <Stack.Screen name="Gestion" component={protectedGestion}/>
        <Stack.Screen name="Tramite" component={ProcessingStatus}/>

      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  guard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F0F9F6',
  },
  guardText: {
    color: '#079B72',
    fontSize: 13,
    fontWeight: '700',
  },
});
