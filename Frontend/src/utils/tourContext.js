import React, { createContext, useState, useContext } from 'react';
import { navigationRef } from '../navigation/AppNavigator.jsx';

const TourContext = createContext();

export const TOUR_STEPS = {
  aprendiz: [
    {
      route: 'Home',
      title: 'Paseo de Aprendiz - Inicio',
      text: '¡Bienvenido a MyAccess! Este es tu Inicio. ➜ Aquí ves tu perfil resumido, accesos directos rápidos y notificaciones recientes. En el menú superior izquierdo tienes el icono de tres líneas (hamburguesa) para expandir la barra lateral. En el lado superior derecho tienes la campana de alertas y el avatar de tu perfil.',
      placement: 'bottom'
    },
    {
      route: 'Card',
      title: 'Módulo: Mi Carnet Digital',
      text: 'Aquí se muestra tu identificación oficial. ➜ Tu carnet digital. Puedes tocar la tarjeta para voltearla en 3D (el frente tiene tu foto/datos y el reverso tu código QR y de barras). Abajo encuentras el botón "Solicitar Carnet Físico" si deseas pedir la tarjeta plástica impresa.',
      placement: 'top'
    },
    {
      route: 'SofiaVerification',
      title: 'Módulo: Validar Sofia Plus',
      text: 'Este módulo te permite autenticar y sincronizar tu cuenta con Sofia Plus. ➜ Vincula tu matrícula oficial. Tienes tres campos clave: Tipo de documento, Número de documento, y Contraseña de Sofia Plus. Ingresa tus datos oficiales y pulsa el botón verde "Validar Cuenta" para activar tu carnet.',
      placement: 'center'
    },
    {
      route: 'Tramite',
      title: 'Módulo: Estado de Trámite',
      text: 'Módulo: Estado de Trámite. ➜ Monitorea tu carnet físico. Muestra una barra de progreso que indica si tu plástico físico ya está Solicitado, Aprobado o Listo para reclamar en las oficinas del centro.',
      placement: 'bottom'
    },
    {
      route: 'Notifications',
      title: 'Módulo: Novedades y Avisos',
      text: 'Bandeja de Notificaciones. ➜ Revisa tus mensajes. Cuenta con una barra de búsqueda para filtrar por asunto/mensaje, un botón "Limpiar" para restablecer el filtro y una lista de tarjetas de mensajes que puedes tocar para leer en detalle.',
      placement: 'top'
    },
    {
      route: 'User',
      title: 'Módulo: Mi Perfil',
      text: 'Módulo: Mi Perfil. ➜ Revisa tus datos personales. Tienes tu foto de perfil y el botón "Subir Foto" para actualizar tu retrato oficial de carnet. Abajo encuentras tus datos (nombre, correo, teléfono y rol) y el botón para Cerrar Sesión.',
      placement: 'bottom'
    }
  ],
  instructor: [
    {
      route: 'Home',
      title: 'Paseo de Instructor - Inicio',
      text: 'Módulo de Inicio. ➜ Tu panel como Instructor. Tienes accesos rápidos a tus fichas, tu perfil y notificaciones. Cuenta con el menú lateral desplegable en la parte superior izquierda y los atajos directos en el cuerpo.',
      placement: 'bottom'
    },
    {
      route: 'Card',
      title: 'Módulo: Mi Carnet de Instructor',
      text: 'Módulo: Mi Carnet de Instructor. ➜ Tu credencial docente. Toca el carnet para voltearlo 3D y mostrar tu código QR en portería. No cuentas con el botón de solicitud física ya que es exclusivo de los aprendices.',
      placement: 'top'
    },
    {
      route: 'Fichas',
      title: 'Módulo: Gestión de Fichas',
      text: 'Módulo: Gestión de Fichas. ➜ Consulta tus grupos. Usa la barra de búsqueda en la parte superior para filtrar por número de Ficha y toca sobre una ficha del listado para expandirla hacia abajo y listar a tus aprendices activos.',
      placement: 'top'
    },
    {
      route: 'Notifications',
      title: 'Módulo: Avisos Recibidos',
      text: 'Bandeja de Notificaciones. ➜ Revisa alertas y comunicados generales. Como instructor, tienes el botón verde "Crear" arriba a la derecha de la lista; púlsalo para abrir un formulario modal y redactar circulares masivas para tus grupos.',
      placement: 'top'
    },
    {
      route: 'User',
      title: 'Módulo: Mi Perfil',
      text: 'Módulo: Mi Perfil. ➜ Revisa tus datos. Cuentas con tu foto oficial de instructor, el botón "Subir Foto" para cargar una nueva desde la galería y el listado de tus datos institucionales con la opción de Cerrar Sesión abajo.',
      placement: 'bottom'
    }
  ],
  admin: [
    {
      route: 'Home',
      title: 'Paseo de Administrador - Inicio',
      text: 'Módulo de Inicio. ➜ Panel de control del Administrador. Te da accesos rápidos generales a toda la plataforma. Cuenta con el menú lateral en la izquierda y los botones del centro.',
      placement: 'bottom'
    },
    {
      route: 'Instructor',
      title: 'Módulo: Dashboard de Gestión',
      text: 'Módulo: Dashboard de Gestión. ➜ Aquí ves el panel estadístico del centro: número de fichas, solicitudes pendientes, aprobadas y carnets impresos. Abajo encuentras atajos para cambiar estado de solicitudes, administrar fichas y el botón "Crear Notificación" para redactar circulares masivas.',
      placement: 'bottom'
    },
    {
      route: 'Card',
      title: 'Módulo: Mi Carnet de Administrador',
      text: 'Módulo: Mi Carnet de Administrador. ➜ Esta es tu credencial digital oficial de personal. Puedes pulsar sobre la tarjeta para voltearla 3D y revelar tu código QR institucional de ingreso a la sede.',
      placement: 'top'
    },
    {
      route: 'Fichas',
      title: 'Módulo: Fichas',
      text: 'Módulo: Fichas de la Sede. ➜ Administra grupos. Tienes la barra de búsqueda para filtrar por código numérico de Ficha y puedes tocar a cualquier grupo de la lista para desplegar en cascada el listado de sus aprendices.',
      placement: 'bottom'
    },
    {
      route: 'Solicitudes',
      title: 'Módulo: Solicitudes de Carnet',
      text: 'Módulo: Solicitudes de Carnet. ➜ Aquí gestionas las solicitudes de aprendices. Cada tarjeta tiene la foto y datos del estudiante. Tienes dos botones clave: "Validar" (para aprobar la solicitud, firmarla digitalmente y generar el QR) y "Rechazar" (si la información está errónea).',
      placement: 'top'
    },
    {
      route: 'Historial',
      title: 'Módulo: Historial General',
      text: 'Módulo: Historial General. ➜ Consulta la bitácora histórica. Se muestra una lista de acciones cronológicas indicando qué administrador validó o imprimió cada carnet con su fecha respectiva.',
      placement: 'bottom'
    },
    {
      route: 'Imprimir',
      title: 'Módulo: Imprimir Carnet',
      text: 'Módulo: Imprimir Carnet. ➜ Genera carnets físicos. Usa el selector desplegable para elegir la Ficha. Cuentas con el botón "Imprimir todos" para enviar la Ficha entera a la impresora física, o bien puedes presionar el botón "Imprimir" de cada fila para procesar un solo carnet.',
      placement: 'top'
    },
    {
      route: 'Notifications',
      title: 'Módulo: Novedades del Centro',
      text: 'Bandeja de Notificaciones. ➜ Consulta circulares. Cuentas con el buscador de mensajes, el botón "Limpiar" y el botón verde "Crear" en el encabezado para redactar y enviar una alerta masiva indicando Asunto, Mensaje, Categoría y Ficha destino.',
      placement: 'top'
    },
    {
      route: 'User',
      title: 'Módulo: Mi Perfil',
      text: 'Módulo: Mi Perfil. ➜ Revisa tus credenciales administrativas. Tienes tu foto de perfil, el botón "Subir Foto" para cargar una nueva foto oficial y tu ficha de contacto de administrador con el botón para Cerrar Sesión.',
      placement: 'bottom'
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
