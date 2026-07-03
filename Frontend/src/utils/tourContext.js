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
      text: 'Aquí se muestra tu identificación oficial. Puedes pulsar tu carnet para voltearlo 3D y revelar el código QR institucional para entrar a la sede.',
      placement: 'top'
    },
    {
      route: 'SofiaVerification',
      title: 'Módulo: Validar Sofia Plus',
      text: 'Este módulo te permite autenticar y sincronizar tu cuenta con Sofia Plus para cargar tu Ficha de formación (ADSO) y habilitar tu carnet.',
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
      text: 'Aquí visualizas los grupos de aprendices a tu cargo. Puedes realizar búsquedas por número de Ficha y expandir la lista de aprendices.',
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
      text: 'Este panel muestra las estadísticas rápidas del centro: total de fichas, solicitudes registradas, aprobadas y carnets listos.',
      placement: 'top'
    },
    {
      route: 'Fichas',
      title: 'Módulo: Fichas',
      text: 'Revisa y gestiona la lista completa de grupos de formación del centro de formación.',
      placement: 'bottom'
    },
    {
      route: 'Solicitudes',
      title: 'Módulo: Solicitudes Pendientes',
      text: 'Aquí apruebas o rechazas las solicitudes de carnetización digital que envían los aprendices. Al aprobar, generas su firma autorizada.',
      placement: 'top'
    },
    {
      route: 'Historial',
      title: 'Módulo: Historial General',
      text: 'Monitorea todas las solicitudes validadas e impresas anteriormente por el equipo.',
      placement: 'bottom'
    },
    {
      route: 'Imprimir',
      title: 'Módulo: Imprimir Carnets',
      text: 'Envía a imprimir los carnets digitales aprobados a la impresora física institucional.',
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
