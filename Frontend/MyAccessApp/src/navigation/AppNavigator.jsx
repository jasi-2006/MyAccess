import React, { useState } from 'react';
import SplashScreen          from '../screens/SplashScreen';
import OnboardingScreen      from '../screens/OnboardingScreen';
import LoginScreen           from '../screens/LoginScreen';
import RegisterScreen        from '../screens/RegisterScreen';
import DatosPersonalesScreen from '../screens/DatosPersonalesScreen';
import DatosInstitucionales  from '../screens/DatosInstitucionales';
import VerificaCorreoScreen  from '../screens/VerificaCorreoScreen';
import VerificaCodigoScreen  from '../screens/VerificaCodigoScreen';

const AppNavigator = () => {
  const [screen, setScreen]       = useState('splash');
  const [activeTab, setActiveTab] = useState('Registrate');

  const handleTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'login')      setScreen('login');
    if (tab === 'Registrate') setScreen('register');
    if (tab === 'Datos')      setScreen('datos');
  };

  switch (screen) {
    case 'splash':
      return <SplashScreen onFinish={() => setScreen('onboarding')} />;

    case 'onboarding':
      return <OnboardingScreen onStart={() => setScreen('login')} />;

    case 'login':
      return (
        <LoginScreen
          onLogin={() => setScreen('verificaCorreo')}
          onRegister={() => { setScreen('register'); setActiveTab('Registrate'); }}
          onForgot={() => setScreen('verificaCorreo')}
        />
      );

    case 'register':
      return (
        <RegisterScreen
          onContinue={() => { setScreen('datos'); setActiveTab('Datos'); }}
          activeTab={activeTab}
          setActiveTab={handleTab}
        />
      );

    case 'datos':
      return (
        <DatosPersonalesScreen
          onContinue={() => setScreen('institucional')}
          activeTab={activeTab}
          setActiveTab={handleTab}
        />
      );

    case 'institucional':
      return (
        <DatosInstitucionales
          onFinish={() => setScreen('verificaCorreo')}
          activeTab={activeTab}
          setActiveTab={handleTab}
        />
      );

    case 'verificaCorreo':
      return (
        <VerificaCorreoScreen
          onValidar={() => setScreen('verificaCodigo')}
          onBack={() => setScreen('login')}
        />
      );

    case 'verificaCodigo':
      return (
        <VerificaCodigoScreen
          onExito={() => setScreen('login')}
          onBack={() => setScreen('verificaCorreo')}
          onReenviar={() => {}}
        />
      );

    default:
      return <SplashScreen onFinish={() => setScreen('onboarding')} />;
  }
};

export default AppNavigator;