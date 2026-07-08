import React, { createContext, useState, useContext } from 'react';
import { navigationRef } from '../navigation/AppNavigator.jsx';

const TourContext = createContext();

export const TOUR_STEPS = {
  aprendiz: [
    {
      route: 'Home',
      title: 'Paseo de Aprendiz - Inicio',
      text: 'Panel Principal de Inicio. Desde aquí puedes orientarte:\n\n• Menú Hamburguesa (arriba izq.): Pulsa para abrir o contraer la barra de navegación lateral.\n• Campana de Alertas (arriba der.): Muestra tus avisos pendientes.\n• Perfil de Usuario (arriba der.): Acceso rápido a tu información.\n• Tarjetas del Home: Atajos directos a Mi Carnet, Validación Sofia y Estado de Trámite.',
      placement: 'bottom',
      targetId: 'home-cards-section'
    },
    {
      route: 'Card',
      title: 'Módulo: Mi Carnet Digital',
      text: 'Credencial de Identificación. Visualiza tus datos:\n\n• Tarjeta del Carnet: Toca para voltearla 3D. El frente muestra tu foto y datos; el reverso muestra tu código QR y código de barras para el lector de ingreso de la sede.\n• Solicitar Carnet Físico: Botón inferior para enviar tu petición de impresión plástica a la oficina de administración.',
      placement: 'top',
      targetId: 'carnet-card-view'
    },
    {
      route: 'SofiaVerification',
      title: 'Módulo: Validar Sofia Plus',
      text: 'Sincronización con la plataforma Sofia Plus:\n\n• Tipo de Documento: Selector desplegable para elegir tu documento (C.C, T.I, etc.).\n• Número de Documento: Campo de texto para ingresar tu identificación.\n• Contraseña: Campo de texto seguro para tu contraseña de Sofia Plus.\n• Validar Cuenta: Botón verde para verificar tu matrícula oficial y activar automáticamente tu carnet digital.',
      placement: 'center',
      targetId: 'sofia-form-card'
    },
    {
      route: 'Tramite',
      title: 'Módulo: Estado de Trámite',
      text: 'Estado de tu Carnet Físico:\n\n• Barra de Progreso: Muestra visualmente la fase actual (Solicitado ➔ Aprobado ➔ Impreso).\n• Mensaje Informativo: Explica detalladamente si tu carnet físico ya está disponible para reclamar en coordinación.',
      placement: 'bottom',
      targetId: 'tramite-timeline-card'
    },
    {
      route: 'Notifications',
      title: 'Módulo: Novedades y Avisos',
      text: 'Buzón de Mensajes Recibidos:\n\n• Buscador (arriba): Escribe palabras clave para filtrar mensajes por asunto o contenido.\n• Limpiar: Botón al lado del buscador para vaciar el filtro.\n• Mensajes: Lista de circulares recibidas. Toca cualquier mensaje para abrirlo, leerlo completo y marcarlo como leído.',
      placement: 'top',
      targetId: 'notif-list-panel'
    },
    {
      route: 'User',
      title: 'Módulo: Mi Perfil',
      text: 'Configuración de Perfil Personal:\n\n• Avatar/Foto: Retrato que aparecerá en tu carnet.\n• Subir Foto: Botón verde para abrir tu galería o cámara y actualizar tu fotografía oficial.\n• Datos Personales: Muestra tu Nombre, Correo, Ficha y Rol.\n• Cerrar Sesión: Botón inferior para salir de forma segura de tu cuenta.',
      placement: 'bottom',
      targetId: 'profile-edit-btn'
    }
  ],
  instructor: [
    {
      route: 'Home',
      title: 'Paseo de Instructor - Inicio',
      text: 'Panel Principal del Instructor:\n\n• Menú Hamburguesa (arriba izq.): Permite abrir o cerrar la barra de navegación lateral.\n• Campana de Alertas (arriba der.): Accede a avisos importantes de la sede.\n• Atajos del Home: Botones centrales para ir a tu Carnet, Fichas, Notificaciones y Perfil.',
      placement: 'bottom',
      targetId: 'home-cards-section'
    },
    {
      route: 'Card',
      title: 'Módulo: Mi Carnet de Instructor',
      text: 'Carnet Digital Docente. Tu credencial oficial:\n\n• Tarjeta del Carnet: Toca para voltearla 3D, permitiéndote mostrar tu foto en el frente y tu código QR de ingreso en el reverso.',
      placement: 'top',
      targetId: 'carnet-card-view'
    },
    {
      route: 'Fichas',
      title: 'Módulo: Gestión de Fichas',
      text: 'Gestión de Fichas Académicas:\n\n• Buscador de Fichas: Campo de texto para ingresar el número de grupo de formación.\n• Lista de Fichas: Listado de tus grupos asignados. Toca una ficha para expandir en cascada el listado de aprendices matriculados en ella.',
      placement: 'top',
      targetId: 'fichas-search-input'
    },
    {
      route: 'Notifications',
      title: 'Módulo: Avisos Recibidos',
      text: 'Buzón de Notificaciones y Envíos:\n\n• Mensajes: Revisa avisos recibidos.\n• Crear (botón verde arriba der.): Abre el formulario modal para redactar y enviar una notificación masiva (Asunto, Mensaje, Ficha) a tus aprendices.',
      placement: 'top',
      targetId: 'notif-create-btn'
    },
    {
      route: 'User',
      title: 'Módulo: Mi Perfil',
      text: 'Configuración de Perfil Docente:\n\n• Foto de Perfil: Tu retrato oficial.\n• Subir Foto: Botón para cambiar o tomar una nueva foto docente.\n• Datos: Muestra tu información de contacto y el botón Cerrar Sesión.',
      placement: 'bottom',
      targetId: 'profile-edit-btn'
    }
  ],
  admin: [
    {
      route: 'Home',
      title: 'Paseo de Administrador - Inicio',
      text: 'Panel Principal del Administrador. Gestión global:\n\n• Menú Lateral (arriba izq.): Navega rápidamente entre módulos.\n• Atajos del Home: Acceso directo a Dashboard, Fichas, Solicitudes, Historial e Impresión.',
      placement: 'bottom',
      targetId: 'home-cards-section'
    },
    {
      route: 'Instructor',
      title: 'Módulo: Dashboard de Gestión',
      text: 'Dashboard de Gestión y Control:\n\n• Métricas Rápidas: Tarjetas que muestran totales de Fichas, Solicitudes Pendientes, Validadas e Impresiones.\n• Acceso Rápido Inferior: Botones para gestionar fichas, solicitudes y el botón "Crear Notificación" para redactar circulares a la sede.',
      placement: 'bottom',
      targetId: 'admin-dashboard-stats'
    },
    {
      route: 'Card',
      title: 'Módulo: Mi Carnet de Administrador',
      text: 'Carnet Digital del Administrador:\n\n• Tarjeta de Carnet: Púlsala para voltearla 3D y mostrar tu código QR de ingreso en portería.',
      placement: 'top',
      targetId: 'carnet-card-view'
    },
    {
      route: 'Fichas',
      title: 'Módulo: Fichas',
      text: 'Administración de Fichas de la Sede:\n\n• Buscador de Ficha: Filtra por código numérico.\n• Lista de Fichas: Lista completa de grupos de la sede. Toca un grupo para desplegar el listado de sus aprendices.',
      placement: 'bottom',
      targetId: 'fichas-search-input'
    },
    {
      route: 'Solicitudes',
      title: 'Módulo: Solicitudes de Carnet',
      text: 'Aprobación de Solicitudes de Carnet:\n\n• Lista de Solicitudes: Peticiones enviadas por aprendices con su foto y datos.\n• Validar (botón verde): Aprueba el carnet digital, firma digitalmente la credencial y genera el código QR.\n• Rechazar (botón rojo): Declina la solicitud si los datos no coinciden.',
      placement: 'top',
      targetId: 'solicitudes-list-panel'
    },
    {
      route: 'Historial',
      title: 'Módulo: Historial General',
      text: 'Bitácora de Acciones de Administración:\n\n• Lista del Historial: Auditoría cronológica de solicitudes validadas, rechazadas e impresas con la fecha y el administrador responsable.',
      placement: 'bottom',
      targetId: 'historial-list-panel'
    },
    {
      route: 'Imprimir',
      title: 'Módulo: Imprimir Carnet',
      text: 'Impresión Física de Carnets en Lote:\n\n• Selector de Ficha: Menú desplegable para cargar los aprendices de un grupo.\n• Imprimir todos (botón verde): Envía la ficha completa a imprimir en la impresora física en un solo lote.\n• Botón Imprimir (individual): Ubicado al lado de cada aprendiz para imprimir únicamente ese carnet plástico.',
      placement: 'top',
      targetId: 'imprimir-ficha-tabs'
    },
    {
      route: 'Notifications',
      title: 'Módulo: Novedades del Centro',
      text: 'Buzón de Notificaciones y Envíos Masivos:\n\n• Buscador / Limpiar: Filtra la lista de circulares.\n• Crear (botón verde): Abre el formulario para enviar una alerta a la sede (Asunto, Mensaje, Categoría, Ficha destino).',
      placement: 'top',
      targetId: 'notif-create-btn'
    },
    {
      route: 'User',
      title: 'Módulo: Mi Perfil',
      text: 'Perfil del Administrador:\n\n• Foto y Subir Foto: Carga tu retrato oficial de administrador.\n• Ficha de Datos: Muestra tus credenciales y el botón de Cerrar Sesión.',
      placement: 'bottom',
      targetId: 'profile-edit-btn'
    }
  ]
};

export function TourProvider({ children }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourRole, setTourRole] = useState(null); // 'aprendiz', 'instructor', 'admin'
  const [currentStep, setCurrentStep] = useState(0);
  const [targets, setTargets] = useState({});

  const registerTarget = (targetId, coords) => {
    setTargets((prev) => ({ ...prev, [targetId]: coords }));
  };

  const unregisterTarget = (targetId) => {
    setTargets((prev) => {
      const next = { ...prev };
      delete next[targetId];
      return next;
    });
  };

  const startTour = (role) => {
    setTourRole(role);
    setCurrentStep(0);
    setTargets({}); // Reset measured targets
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
      setTargets({});
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
    setTargets({});
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
        targets,
        registerTarget,
        unregisterTarget,
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

