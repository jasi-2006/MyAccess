import React, { createContext, useState, useContext } from 'react';
import { navigationRef } from '../navigation/AppNavigator.jsx';

const TourContext = createContext();

export const TOUR_STEPS = {
  aprendiz: [
    {
      route: 'Home',
      title: 'Paseo de Aprendiz - Inicio',
      text: '¡Bienvenido a MyAccess! Este es tu panel de inicio. Aquí verás los accesos rápidos de la aplicación y un resumen de tu perfil.',
      placement: 'bottom'
    },
    {
      route: 'Card',
      title: 'Módulo: Mi Carnet Digital',
      text: 'Aquí se muestra tu identificación oficial. ➜ Pulsa tu carnet para voltearlo 3D y revelar el código QR institucional para entrar a la sede.',
      placement: 'top'
    },
    {
      route: 'SofiaVerification',
      title: 'Módulo: Validar Sofia Plus',
      text: 'Este módulo te permite autenticar y sincronizar tu cuenta con Sofia Plus. ➜ Ingresa tus datos oficiales para cargar tu Ficha de formación (ADSO) y habilitar tu carnet.',
      placement: 'center'
    },
    {
      route: 'Tramite',
      title: 'Módulo: Estado de Trámite',
      text: 'Consulta el estado de tu solicitud de carnet físico aquí, por si necesitas reclamarlo impreso en coordinación.',
      placement: 'bottom'
    }
  ],
  instructor: [
    {
      route: 'Home',
      title: 'Paseo de Instructor - Inicio',
      text: '¡Hola! Este es tu menú principal como Instructor. Desde aquí puedes acceder a la gestión de tus grupos asignados.',
      placement: 'bottom'
    },
    {
      route: 'Fichas',
      title: 'Módulo: Gestión de Fichas',
      text: 'Aquí visualizas los grupos de aprendices a tu cargo. ➜ Puedes realizar búsquedas por número de Ficha y expandir la lista de aprendices.',
      placement: 'top'
    },
    {
      route: 'SofiaVerification',
      title: 'Módulo: Validar Sofia Plus',
      text: 'Si lo requieres, también puedes validar y sincronizar tu propio perfil oficial de Sofia Plus en esta sección.',
      placement: 'center'
    }
  ],
  admin: [
    {
      route: 'Home',
      title: 'Paseo de Administrador - Inicio',
      text: '¡Bienvenido Administrador! Este es tu inicio. Tienes control de todos los accesos rápidos institucionales.',
      placement: 'bottom'
    },
    {
      route: 'Instructor',
      title: 'Módulo: Dashboard de Gestión',
      text: 'En este panel de control ves las métricas generales del centro. ➜ Toca "Crear Notificación" en los accesos rápidos de abajo para enviar comunicados y alertas masivas a fichas específicas o a toda la sede en tiempo real.',
      placement: 'top'
    },
    {
      route: 'Fichas',
      title: 'Módulo: Fichas',
      text: 'Revisa y gestiona la lista completa de grupos de formación de tu centro de formación.',
      placement: 'bottom'
    },
    {
      route: 'Solicitudes',
      title: 'Módulo: Solicitudes de Carnet',
      text: '¡Módulo crítico! Aquí gestionas las solicitudes enviadas por los aprendices. ➜ Cambia el estado de la solicitud haciendo clic en "Validar" para aprobar el carnet digital de manera que se firme digitalmente, o "Rechazar" si los datos no coinciden.',
      placement: 'top'
    },
    {
      route: 'Historial',
      title: 'Módulo: Historial General',
      text: 'Permite auditar y revisar el registro completo de acciones tomadas anteriormente sobre los carnets (solicitudes impresas o validadas).',
      placement: 'bottom'
    },
    {
      route: 'Imprimir',
      title: 'Módulo: Imprimir Carnet',
      text: 'Una vez que un carnet está en estado aprobado, en este módulo puedes buscar la Ficha del aprendiz. ➜ Toca "Imprimir todos" para enviar todos los carnets de la ficha seleccionada en un solo lote, o bien toca la opción individual de un carnet para imprimir únicamente ese carnet.',
      placement: 'top'
    }
  ]
};

export function TourProvider({ children }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourRole, setTourRole] = useState(null); // 'aprendiz', 'instructor', 'admin'
  const [currentStep, setCurrentStep] = useState(0);

  const startTour = (role) => {
    setTourRole(role);
    setCurrentStep(0);
    setIsTourActive(true);
    
    // Navegar al primer módulo
    const steps = TOUR_STEPS[role];
    if (steps && steps[0] && navigationRef.isReady()) {
      navigationRef.navigate(steps[0].route);
    }
  };

  const nextStep = () => {
    const steps = TOUR_STEPS[tourRole];
    if (!steps) return;

    if (currentStep < steps.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      if (navigationRef.isReady()) {
        navigationRef.navigate(steps[nextIdx].route);
      }
    } else {
      // Tour Terminado
      setIsTourActive(false);
      setTourRole(null);
      setCurrentStep(0);
      if (navigationRef.isReady()) {
        navigationRef.navigate('UserManual');
        setTimeout(() => {
          alert('¡Felicitaciones! Has completado el paseo guiado por todos los módulos del sistema.');
        }, 500);
      }
    }
  };

  const prevStep = () => {
    const steps = TOUR_STEPS[tourRole];
    if (!steps) return;

    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      if (navigationRef.isReady()) {
        navigationRef.navigate(steps[prevIdx].route);
      }
    }
  };

  const stopTour = () => {
    setIsTourActive(false);
    setTourRole(null);
    setCurrentStep(0);
    if (navigationRef.isReady()) {
      navigationRef.navigate('UserManual');
    }
  };

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        tourRole,
        currentStep,
        startTour,
        nextStep,
        prevStep,
        stopTour,
        steps: tourRole ? TOUR_STEPS[tourRole] : []
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour debe usarse dentro de un TourProvider');
  }
  return context;
}
