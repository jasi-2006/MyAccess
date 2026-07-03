import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebFrame from '../components/WebFrame.jsx';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import { colors } from '../theme/colors.jsx';
import { getUserProfile } from '../services/authService.js';
import { resolveUserRole } from '../utils/accessControl.js';

// --- DATOS DE LAS GUÍAS INTERACTIVAS ---
const GUIDES = [
  {
    id: 'carnet',
    title: 'Ver y voltear mi Carnet Digital',
    category: 'aprendiz',
    icon: 'card-outline',
    desc: 'Aprende a visualizar tu carnet institucional y a girarlo para mostrar el código QR de acceso.',
    steps: [
      {
        title: 'Paso 1: Abrir mi carnet',
        text: 'Ve a la opción "Mi carnet digital" en la barra de navegación para ver tu carnet frontal.',
        actionText: 'Toca el carnet de la derecha para prepararte.'
      },
      {
        title: 'Paso 2: Girar el carnet',
        text: 'Toca el carnet digital para darle la vuelta. La tarjeta rotará en 3D simulando el reverso físico.',
        actionText: '¡Pruébalo! Toca el carnet en el celular simulado para girarlo.'
      },
      {
        title: 'Paso 3: Códigos de barras y QR',
        text: 'El frente tiene el código de barras y el reverso el código QR institucional que usarás para entrar al centro.',
        actionText: 'Interactúa con el carnet tantas veces como quieras para ver ambos lados.'
      }
    ]
  },
  {
    id: 'sofia',
    title: 'Validar cuenta con Sofia Plus',
    category: 'aprendiz',
    icon: 'shield-checkmark-outline',
    desc: 'Verifica tu información con la base de datos de Sofia Plus para activar tu carnet.',
    steps: [
      {
        title: 'Paso 1: Ir a Validación',
        text: 'Ingresa a "Validar Sofia Plus" desde tu barra lateral.',
        actionText: 'Verás el formulario de verificación en la pantalla de la derecha.'
      },
      {
        title: 'Paso 2: Llenar el formulario',
        text: 'Selecciona tu tipo de documento, escribe tu número de documento y tu contraseña oficial de Sofia Plus.',
        actionText: 'Ingresa datos ficticios en el formulario del celular simulado.'
      },
      {
        title: 'Paso 3: Validar y Sincronizar',
        text: 'Presiona el botón "Validar". El sistema consultará el servicio de validación y cargará tu ficha y programa.',
        actionText: 'Toca "Validar" en el celular simulado para ver cómo funciona el proceso.'
      }
    ]
  },
  {
    id: 'solicitudes',
    title: 'Aprobar solicitudes de carnet',
    category: 'admin',
    icon: 'checkbox-outline',
    desc: 'Flujo exclusivo de administradores para aprobar o rechazar las solicitudes de carnetización de aprendices.',
    steps: [
      {
        title: 'Paso 1: Entrar a Solicitudes',
        text: 'En el panel de administración, haz clic en la sección "Solicitudes" para ver el listado de pendientes.',
        actionText: 'Revisa el listado de solicitudes que cargará a la derecha.'
      },
      {
        title: 'Paso 2: Revisar información del aprendiz',
        text: 'Valida los nombres, documento y foto del aprendiz solicitante antes de tomar una decisión.',
        actionText: 'Puedes ver los detalles de los aprendices en la lista simulada.'
      },
      {
        title: 'Paso 3: Aprobar o Rechazar',
        text: 'Toca el botón "Validar" para aprobar el carnet. Esto generará su firma autorizada y activará su QR.',
        actionText: 'Toca "Validar" en alguno de los aprendices simulados para ver el cambio de estado.'
      }
    ]
  },
  {
    id: 'fichas',
    title: 'Gestionar grupos y Fichas',
    category: 'instructor',
    icon: 'people-outline',
    desc: 'Cómo los instructores y administradores pueden buscar grupos de formación y listar aprendices por fichas.',
    steps: [
      {
        title: 'Paso 1: Ir a Fichas',
        text: 'Haz clic en "Fichas" en tu menú lateral para visualizar tus grupos asignados.',
        actionText: 'Verás la lista de fichas en la derecha.'
      },
      {
        title: 'Paso 2: Filtrar o buscar ficha',
        text: 'Usa la barra de búsqueda superior para encontrar una ficha específica escribiendo su número de código.',
        actionText: 'Prueba escribiendo "268" en el buscador del celular simulado.'
      },
      {
        title: 'Paso 3: Ver aprendices de la ficha',
        text: 'Toca sobre la ficha en la lista para desplegar a todos los aprendices inscritos en esa jornada.',
        actionText: 'Toca sobre la ficha en el celular de la derecha para ver sus aprendices.'
      }
    ]
  },
  {
    id: 'notificaciones',
    title: 'Enviar notificaciones masivas',
    category: 'admin',
    icon: 'notifications-outline',
    desc: 'Aprende a redactar y enviar avisos urgentes a fichas específicas o a todo el centro de formación.',
    steps: [
      {
        title: 'Paso 1: Abrir el creador',
        text: 'Haz clic en "Crear notificación" desde los accesos rápidos del panel de administración.',
        actionText: 'Aparecerá el formulario de redacción a la derecha.'
      },
      {
        title: 'Paso 2: Rellenar datos y destino',
        text: 'Ingresa un título llamativo, escribe el cuerpo del mensaje y selecciona la ficha que debe recibir el aviso.',
        actionText: 'Ingresa datos ficticios en el formulario del celular simulado.'
      },
      {
        title: 'Paso 3: Enviar mensaje',
        text: 'Presiona "Enviar". Los aprendices de la ficha elegida recibirán una alerta instantánea y un correo electrónico.',
        actionText: 'Presiona "Enviar" en el celular simulado para ver la alerta de confirmación.'
      }
    ]
  }
];

export default function UserManualScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 900;
  const pagePadding = isMobile ? 12 : 20;

  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState('APRENDIZ');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'aprendiz', 'instructor', 'admin'
  const [activeGuide, setActiveGuide] = useState(GUIDES[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // --- ESTADOS INTERACTIVOS DE LOS SIMULADORES ---
  // Simulator Carnet
  const [carnetFlipped, setCarnetFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Simulator Sofia Plus
  const [sofiaDoc, setSofiaDoc] = useState('');
  const [sofiaPass, setSofiaPass] = useState('');
  const [sofiaLoading, setSofiaLoading] = useState(false);
  const [sofiaResult, setSofiaResult] = useState(null);

  // Simulator Solicitudes
  const [mockRequests, setMockRequests] = useState([
    { id: 1, name: 'Mateo Gómez Montoya', doc: '1.094.223.112', status: 'Pendiente' },
    { id: 2, name: 'Juliana Ríos Castaño', doc: '1.094.887.411', status: 'Pendiente' },
    { id: 3, name: 'Santiago Blandón A.', doc: '1.095.334.229', status: 'Pendiente' }
  ]);
  const [requestLoadingId, setRequestLoadingId] = useState(null);

  // Simulator Fichas
  const [fichaSearch, setFichaSearch] = useState('');
  const [expandedFicha, setExpandedFicha] = useState(false);
  const allFichas = [
    { id: '2687392', title: 'ADSO - Diurna', center: 'Comercio y Turismo', students: ['Carlos Pérez', 'Andrés Marín', 'Laura Rojas', 'Sofía Ospina'] },
    { id: '2712993', title: 'Diseño Gráfico - Mixta', center: 'Construcción', students: ['María Restrepo', 'Daniela Tobón', 'Juan López'] },
    { id: '2561102', title: 'Gestión Empresarial', center: 'Comercio y Turismo', students: ['Patricia C.', 'Felipe V.', 'Olga M.'] }
  ];

  // Simulator Notificaciones
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifTarget, setNotifTarget] = useState('2687392');
  const [notifSuccess, setNotifSuccess] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then((p) => {
        setProfile(p);
        const resolved = resolveUserRole(p);
        setRole(resolved);
      })
      .catch(() => {});
  }, []);

  // --- FUNCIÓN DE ROTACIÓN EN SIMULADOR CARNET ---
  const handleFlipCarnet = () => {
    const toValue = carnetFlipped ? 0 : 1;
    setCarnetFlipped(!carnetFlipped);
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 15,
      useNativeDriver: true,
    }).start();
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg']
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0.4, 0.5],
    outputRange: [1, 0]
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0.4, 0.5],
    outputRange: [0, 1]
  });

  // --- ACCIONES SIMULADAS ---
  const runSofiaSimulation = () => {
    if (!sofiaDoc || !sofiaPass) {
      alert('Por favor, ingresa los datos de prueba primero.');
      return;
    }
    setSofiaLoading(true);
    setSofiaResult(null);
    setTimeout(() => {
      setSofiaLoading(false);
      setSofiaResult({
        success: true,
        name: 'PAULO RODRÍGUEZ GÓMEZ',
        ficha: '2687392',
        program: 'Análisis y Desarrollo de Software (ADSO)'
      });
      if (currentStepIndex === 1) {
        setCurrentStepIndex(2);
      }
    }, 1500);
  };

  const runValidateRequest = (id) => {
    setRequestLoadingId(id);
    setTimeout(() => {
      setMockRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'Validado' } : req));
      setRequestLoadingId(null);
    }, 1000);
  };

  const resetSofiaSim = () => {
    setSofiaDoc('');
    setSofiaPass('');
    setSofiaResult(null);
  };

  const runSendNotification = () => {
    if (!notifTitle || !notifBody) {
      alert('Completa el título y mensaje de la notificación.');
      return;
    }
    setNotifSuccess(true);
    setTimeout(() => {
      setNotifSuccess(false);
      setNotifTitle('');
      setNotifBody('');
    }, 3000);
  };

  // --- FILTRADO DE GUÍAS ---
  const filteredGuides = GUIDES.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guide.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectGuide = (guide) => {
    setActiveGuide(guide);
    setCurrentStepIndex(0);
    setCarnetFlipped(false);
    flipAnim.setValue(0);
    resetSofiaSim();
    setNotifTitle('');
    setNotifBody('');
    setNotifSuccess(false);
    setExpandedFicha(false);
  };

  const nextStep = () => {
    if (currentStepIndex < activeGuide.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // --- COMPONENTE MOCKUP CELULAR INTELIGENTE ---
  const renderSimulatorPhone = () => {
    return (
      <View style={styles.phoneContainer}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneScreen}>
          
          <View style={styles.mockAppHeader}>
            <Text style={styles.mockAppTitle}>MyAccess Sim</Text>
            <View style={styles.mockHeaderDot} />
          </View>

          <ScrollView contentContainerStyle={styles.mockScrollContent} showsVerticalScrollIndicator={false}>
            {activeGuide.id === 'carnet' && (
              <View style={styles.simCarnetStage}>
                <Text style={styles.simTip}>Toca el carnet para voltearlo</Text>
                
                <TouchableOpacity onPress={handleFlipCarnet} activeOpacity={0.95} style={styles.cardTouchable}>
                  <View style={{ width: 170, height: 260 }}>
                    {/* Frente */}
                    <Animated.View style={[
                      styles.mockCard, 
                      styles.mockCardFront, 
                      {
                        transform: [{ rotateY: frontInterpolate }],
                        opacity: frontOpacity,
                        position: 'absolute',
                        backfaceVisibility: 'hidden',
                        width: 170,
                        height: 260
                      }
                    ]}>
                      <View style={styles.mockCardHeader}>
                        <View style={styles.mockSenaCircle} />
                        <Text style={styles.mockSenaText}>SENA</Text>
                      </View>
                      
                      <View style={styles.mockPhotoFrame}>
                        <Ionicons name="person" size={32} color="#CCCCCC" />
                      </View>

                      <Text style={styles.mockRoleLabel}>APRENDIZ</Text>
                      <View style={styles.mockCardLine} />
                      <Text style={styles.mockStudentName}>PAULO RODRIGUEZ</Text>
                      <Text style={styles.mockStudentInfo}>C.C 1.094.733.910 {'\n'}RH O+</Text>
                      
                      <View style={styles.mockBarcode}>
                        <View style={[styles.barcodeLine, { width: 3 }]} />
                        <View style={[styles.barcodeLine, { width: 1 }]} />
                        <View style={[styles.barcodeLine, { width: 2 }]} />
                        <View style={[styles.barcodeLine, { width: 4 }]} />
                        <View style={[styles.barcodeLine, { width: 1 }]} />
                        <View style={[styles.barcodeLine, { width: 3 }]} />
                        <View style={[styles.barcodeLine, { width: 2 }]} />
                      </View>
                    </Animated.View>

                    {/* Reverso */}
                    <Animated.View style={[
                      styles.mockCard, 
                      styles.mockCardBack, 
                      {
                        transform: [{ rotateY: backInterpolate }],
                        opacity: backOpacity,
                        position: 'absolute',
                        backfaceVisibility: 'hidden',
                        width: 170,
                        height: 260
                      }
                    ]}>
                      <Text style={styles.mockBackTerms}>
                        Este documento es personal e intransferible. Válido para el ingreso al centro de formación.
                      </Text>
                      
                      <View style={styles.mockQrCode}>
                        <Ionicons name="qr-code-outline" size={64} color="#000000" />
                      </View>

                      <View style={styles.mockSignature}>
                        <View style={styles.signatureLine} />
                        <Text style={styles.signatureLabel}>FIRMA AUTORIZADA</Text>
                      </View>
                    </Animated.View>
                  </View>
                </TouchableOpacity>

                <View style={styles.simStatusBadge}>
                  <Text style={styles.simStatusLabel}>Estado del Carnet: </Text>
                  <Text style={styles.simStatusValue}>ACTIVO</Text>
                </View>
              </View>
            )}

            {activeGuide.id === 'sofia' && (
              <View style={styles.simSofiaStage}>
                <Text style={styles.simSubTitle}>Verificación Sofia Plus</Text>
                <Text style={styles.simInputLabel}>Número de documento:</Text>
                <TextInput
                  style={styles.simInput}
                  placeholder="Ej: 1094733910"
                  value={sofiaDoc}
                  onChangeText={setSofiaDoc}
                  keyboardType="numeric"
                />
                
                <Text style={styles.simInputLabel}>Contraseña Sofia Plus:</Text>
                <TextInput
                  style={styles.simInput}
                  placeholder="******"
                  secureTextEntry
                  value={sofiaPass}
                  onChangeText={setSofiaPass}
                />

                {sofiaLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 12 }} />
                ) : (
                  <TouchableOpacity style={styles.simButton} onPress={runSofiaSimulation}>
                    <Text style={styles.simButtonText}>Validar Cuenta</Text>
                  </TouchableOpacity>
                )}

                {sofiaResult && (
                  <View style={styles.simSofiaResult}>
                    <Ionicons name="checkmark-circle" size={20} color="#087C4A" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.simResultName}>{sofiaResult.name}</Text>
                      <Text style={styles.simResultDetails}>Ficha: {sofiaResult.ficha}</Text>
                      <Text style={styles.simResultDetails}>{sofiaResult.program}</Text>
                    </View>
                    <TouchableOpacity onPress={resetSofiaSim}>
                      <Ionicons name="close-circle-outline" size={14} color="#999" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {activeGuide.id === 'solicitudes' && (
              <View style={styles.simSofiaStage}>
                <Text style={styles.simSubTitle}>Solicitudes Pendientes</Text>
                {mockRequests.map((req) => (
                  <View key={req.id} style={styles.simRequestRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.simRequestName}>{req.name}</Text>
                      <Text style={styles.simRequestDoc}>Doc: {req.doc}</Text>
                      <Text style={[styles.simRequestStatus, req.status === 'Validado' ? styles.statusTextSuccess : styles.statusTextPending]}>
                        {req.status}
                      </Text>
                    </View>
                    {req.status === 'Pendiente' && (
                      <TouchableOpacity 
                        style={styles.simMiniBtn} 
                        onPress={() => runValidateRequest(req.id)}
                        disabled={requestLoadingId === req.id}
                      >
                        {requestLoadingId === req.id ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={styles.simMiniBtnText}>Validar</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}

            {activeGuide.id === 'fichas' && (
              <View style={styles.simSofiaStage}>
                <Text style={styles.simSubTitle}>Gestión de Fichas</Text>
                
                <View style={styles.simSearchBox}>
                  <Ionicons name="search-outline" size={12} color="#666" style={{ marginRight: 4 }} />
                  <TextInput
                    style={styles.simSearchInput}
                    placeholder="Buscar ficha..."
                    value={fichaSearch}
                    onChangeText={(t) => {
                      setFichaSearch(t);
                      if(t.trim() !== '') setExpandedFicha(false);
                    }}
                  />
                </View>

                {allFichas
                  .filter(f => f.id.includes(fichaSearch) || f.title.toLowerCase().includes(fichaSearch.toLowerCase()))
                  .map(ficha => (
                    <View key={ficha.id} style={styles.simFichaCard}>
                      <TouchableOpacity 
                        style={styles.simFichaHeader} 
                        onPress={() => setExpandedFicha(expandedFicha === ficha.id ? null : ficha.id)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.simFichaNum}>Ficha: {ficha.id}</Text>
                          <Text style={styles.simFichaTitle}>{ficha.title}</Text>
                        </View>
                        <Ionicons 
                          name={expandedFicha === ficha.id ? "chevron-up" : "chevron-down"} 
                          size={14} 
                          color="#333" 
                        />
                      </TouchableOpacity>

                      {expandedFicha === ficha.id && (
                        <View style={styles.simFichaStudents}>
                          <Text style={styles.simStudentsTitle}>Aprendices inscritos ({ficha.students.length}):</Text>
                          {ficha.students.map((s, idx) => (
                            <Text key={idx} style={styles.simStudentRow}>• {s}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                ))}
              </View>
            )}

            {activeGuide.id === 'notificaciones' && (
              <View style={styles.simSofiaStage}>
                <Text style={styles.simSubTitle}>Enviar Notificación</Text>
                
                <Text style={styles.simInputLabel}>Título:</Text>
                <TextInput
                  style={styles.simInput}
                  placeholder="Ej: Entrega de Carnets"
                  value={notifTitle}
                  onChangeText={setNotifTitle}
                />

                <Text style={styles.simInputLabel}>Mensaje:</Text>
                <TextInput
                  style={[styles.simInput, { height: 48, textAlignVertical: 'top' }]}
                  placeholder="Ej: Mañana a las 8 AM en coordinación."
                  multiline
                  numberOfLines={2}
                  value={notifBody}
                  onChangeText={setNotifBody}
                />

                <Text style={styles.simInputLabel}>Ficha Destino:</Text>
                <View style={styles.simSelectContainer}>
                  {['2687392', '2712993', 'Todas'].map((fichaNum) => (
                    <TouchableOpacity 
                      key={fichaNum}
                      style={[styles.simSelectOption, notifTarget === fichaNum && styles.simSelectOptionActive]}
                      onPress={() => setNotifTarget(fichaNum)}
                    >
                      <Text style={[styles.simSelectOptionText, notifTarget === fichaNum && styles.simSelectOptionTextActive]}>
                        {fichaNum}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity style={styles.simButton} onPress={runSendNotification}>
                  <Text style={styles.simButtonText}>Enviar Notificación</Text>
                </TouchableOpacity>

                {notifSuccess && (
                  <View style={styles.simSofiaResult}>
                    <Ionicons name="mail" size={20} color="#087C4A" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.simResultName}>¡Notificación Emitida!</Text>
                      <Text style={styles.simResultDetails}>Enviada a ficha: {notifTarget}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.mockAppBottomBar}>
            <Ionicons name="home" size={14} color="#666" />
            <Ionicons name="card" size={14} color={activeGuide.id === 'carnet' ? '#059669' : '#666'} />
            <Ionicons name="notifications" size={14} color={activeGuide.id === 'notificaciones' ? '#059669' : '#666'} />
            <Ionicons name="person" size={14} color="#666" />
          </View>
        </View>

        <View style={styles.phoneHomeBtn} />
      </View>
    );
  };

  const userInitial = profile?.fullName ? profile.fullName.trim().charAt(0).toUpperCase() : 'U';
  const userName = profile?.fullName || 'Usuario';

  return (
    <WebFrame>
      <View style={styles.root}>
        <CarnetTopbar navigation={navigation} studentName={userName} studentInitial={userInitial} />
        
        <View style={styles.contentFrame}>
          <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="UserManual" />
          
          <View style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
              
              <View style={styles.headerBlock}>
                <Text style={styles.pageTitle}>Manual de Usuario Interactivo</Text>
                <Text style={styles.pageSubtitle}>
                  Selecciona una guía y sigue los pasos en la pantalla de la izquierda mientras interactúas con el celular simulado en la derecha.
                </Text>
              </View>

              <View style={[styles.mainGrid, isMobile && styles.mainGridMobile]}>
                
                <View style={styles.leftPanel}>
                  
                  <View style={styles.searchSection}>
                    <View style={styles.searchBar}>
                      <Ionicons name="search-outline" size={16} color="#6B7280" style={{ marginRight: 6 }} />
                      <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar guías..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                    </View>

                    <View style={styles.categoriesRow}>
                      {[
                        { id: 'all', label: 'Todos' },
                        { id: 'aprendiz', label: 'Aprendices' },
                        { id: 'instructor', label: 'Instructores' },
                        { id: 'admin', label: 'Admin' }
                      ].map((cat) => (
                        <TouchableOpacity
                          key={cat.id}
                          style={[styles.categoryBtn, selectedCategory === cat.id && styles.categoryBtnActive]}
                          onPress={() => setSelectedCategory(cat.id)}
                        >
                          <Text style={[styles.categoryBtnText, selectedCategory === cat.id && styles.categoryBtnTextActive]}>
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.guidesListSection}>
                    <Text style={styles.sectionHeading}>Selecciona una Guía:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.guidesListScroll}>
                      {filteredGuides.map((guide) => (
                        <TouchableOpacity
                          key={guide.id}
                          style={[styles.guideCard, activeGuide.id === guide.id && styles.guideCardActive]}
                          onPress={() => selectGuide(guide)}
                          activeOpacity={0.8}
                        >
                          <View style={[styles.guideIconContainer, activeGuide.id === guide.id && styles.guideIconContainerActive]}>
                            <Ionicons 
                              name={guide.icon} 
                              size={18} 
                              color={activeGuide.id === guide.id ? '#FFFFFF' : '#059669'} 
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.guideCardTitle, activeGuide.id === guide.id && styles.guideCardTitleActive]}>
                              {guide.title}
                            </Text>
                            <Text style={styles.guideCardCategory} numberOfLines={1}>
                              Para: {guide.category.toUpperCase()}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                      {filteredGuides.length === 0 && (
                        <Text style={styles.emptyText}>No se encontraron guías que coincidan con la búsqueda.</Text>
                      )}
                    </ScrollView>
                  </View>

                  <View style={styles.stepDetailsCard}>
                    <View style={styles.stepCardHeader}>
                      <Text style={styles.stepBadge}>
                        Paso {currentStepIndex + 1} de {activeGuide.steps.length}
                      </Text>
                      <Text style={styles.stepLabel}>{activeGuide.title}</Text>
                    </View>

                    <Text style={styles.stepTitle}>
                      {activeGuide.steps[currentStepIndex].title}
                    </Text>
                    
                    <Text style={styles.stepText}>
                      {activeGuide.steps[currentStepIndex].text}
                    </Text>

                    {activeGuide.steps[currentStepIndex].highlight && (
                      <View style={styles.tipBox}>
                        <Ionicons name="information-circle" size={14} color="#047857" style={{ marginRight: 4 }} />
                        <Text style={styles.tipText}>
                          {activeGuide.steps[currentStepIndex].highlight}
                        </Text>
                      </View>
                    )}

                    <View style={styles.actionInstructionBox}>
                      <Ionicons name="phone-portrait-outline" size={14} color="#059669" style={{ marginRight: 4 }} />
                      <Text style={styles.actionInstructionText}>
                        {activeGuide.steps[currentStepIndex].actionText}
                      </Text>
                    </View>

                    <View style={styles.stepControls}>
                      <TouchableOpacity
                        style={[styles.controlBtn, currentStepIndex === 0 && styles.controlBtnDisabled]}
                        onPress={prevStep}
                        disabled={currentStepIndex === 0}
                      >
                        <Ionicons name="arrow-back" size={16} color={currentStepIndex === 0 ? '#9CA3AF' : '#059669'} />
                        <Text style={[styles.controlBtnText, currentStepIndex === 0 && styles.controlBtnTextDisabled]}>Anterior</Text>
                      </TouchableOpacity>

                      <View style={styles.progressDots}>
                        {activeGuide.steps.map((_, idx) => (
                          <View 
                            key={idx} 
                            style={[styles.progressDot, currentStepIndex === idx && styles.progressDotActive]} 
                          />
                        ))}
                      </View>

                      <TouchableOpacity
                        style={[styles.controlBtn, currentStepIndex === activeGuide.steps.length - 1 && styles.controlBtnDisabled]}
                        onPress={nextStep}
                        disabled={currentStepIndex === activeGuide.steps.length - 1}
                      >
                        <Text style={[styles.controlBtnText, currentStepIndex === activeGuide.steps.length - 1 && styles.controlBtnTextDisabled]}>Siguiente</Text>
                        <Ionicons name="arrow-forward" size={16} color={currentStepIndex === activeGuide.steps.length - 1 ? '#9CA3AF' : '#059669'} />
                      </TouchableOpacity>
                    </View>
                  </View>

                </View>

                <View style={styles.rightPanel}>
                  <Text style={styles.simulatorTitle}>Celular Simulado</Text>
                  {renderSimulatorPhone()}
                </View>

              </View>
              
            </ScrollView>
          </View>
        </View>
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F9F6' },
  contentFrame: { flex: 1, flexDirection: 'row' },
  mainContainer: { flex: 1 },
  mainScroll: { flexGrow: 1, paddingVertical: 14, paddingHorizontal: 16 },
  headerBlock: { marginBottom: 12 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#4B5563', lineHeight: 18, maxWidth: 800 },
  
  mainGrid: { flexDirection: 'row', gap: 16 },
  mainGridMobile: { flexDirection: 'column' },
  leftPanel: { flex: 1.4, gap: 14 },
  rightPanel: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', minWidth: 280 },
  simulatorTitle: { fontSize: 13, fontWeight: '700', color: '#374151', alignSelf: 'center', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },

  searchSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 13, color: '#1F2937' },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  categoryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  categoryBtnActive: { backgroundColor: '#059669' },
  categoryBtnText: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
  categoryBtnTextActive: { color: '#FFFFFF' },

  guidesListSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeading: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase' },
  guidesListScroll: { flexDirection: 'row', paddingBottom: 4 },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: 210,
    gap: 8,
  },
  guideCardActive: {
    backgroundColor: '#E8FFF5',
    borderColor: '#059669',
  },
  guideIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8FFF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideIconContainerActive: {
    backgroundColor: '#059669',
  },
  guideCardTitle: { fontSize: 12, fontWeight: '700', color: '#1F2937' },
  guideCardTitleActive: { color: '#047857' },
  guideCardCategory: { fontSize: 9, color: '#6B7280', fontWeight: '500', marginTop: 2 },
  emptyText: { color: '#6B7280', fontSize: 12, fontStyle: 'italic', paddingVertical: 10 },

  stepDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  stepCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
    marginBottom: 10,
  },
  stepBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    backgroundColor: '#E8FFF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stepLabel: { fontSize: 11, color: '#4B5563', fontWeight: '600' },
  stepTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 8 },
  stepText: { fontSize: 13, color: '#374151', lineHeight: 18, marginBottom: 12 },
  
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8FFF5',
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  tipText: { fontSize: 11, color: '#047857', fontWeight: '600', flex: 1 },
  
  actionInstructionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
    padding: 8,
    borderRadius: 6,
    marginBottom: 14,
  },
  actionInstructionText: { fontSize: 11, color: '#1E40AF', fontWeight: '600', flex: 1 },

  stepControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#059669',
  },
  controlBtnDisabled: {
    borderColor: '#D1D5DB',
  },
  controlBtnText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  controlBtnTextDisabled: { color: '#9CA3AF' },
  
  progressDots: { flexDirection: 'row', gap: 6 },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  progressDotActive: {
    backgroundColor: '#059669',
    width: 14,
  },

  phoneContainer: {
    width: 240,
    height: 480,
    borderRadius: 32,
    borderWidth: 8,
    borderColor: '#111827',
    backgroundColor: '#000000',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phoneNotch: {
    width: 80,
    height: 14,
    backgroundColor: '#111827',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    position: 'absolute',
    top: 0,
    zIndex: 100,
  },
  phoneScreen: {
    flex: 1,
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  phoneHomeBtn: {
    width: 35,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    marginBottom: 4,
    marginTop: 2,
  },

  mockAppHeader: {
    height: 38,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  mockAppTitle: { fontSize: 10, fontWeight: '800', color: '#059669' },
  mockHeaderDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#059669' },
  
  mockScrollContent: {
    flexGrow: 1,
    padding: 10,
    alignItems: 'center',
    width: '100%',
  },

  mockAppBottomBar: {
    height: 28,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },

  simCarnetStage: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 4,
  },
  simTip: { fontSize: 9, color: '#6B7280', marginBottom: 8, fontStyle: 'italic' },
  cardTouchable: {
    width: 170,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    padding: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mockCardFront: {
    backgroundColor: '#FDFDFD',
  },
  mockCardBack: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  mockCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mockSenaCircle: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#059669' },
  mockSenaText: { fontSize: 8, fontWeight: '800', color: '#059669' },
  mockPhotoFrame: {
    width: 60,
    height: 75,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -8,
  },
  mockRoleLabel: { fontSize: 7, color: '#374151', fontWeight: '700', letterSpacing: 0.5, marginTop: 4 },
  mockCardLine: { height: 2, backgroundColor: '#059669', width: '100%', marginVertical: 2 },
  mockStudentName: { fontSize: 10, fontWeight: '800', color: '#059669' },
  mockStudentInfo: { fontSize: 8, color: '#4B5563', lineHeight: 10 },
  mockBarcode: { height: 14, flexDirection: 'row', alignItems: 'flex-end', marginTop: 4, gap: 1 },
  barcodeLine: { height: 14, backgroundColor: '#000000' },
  
  simStatusBadge: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  simStatusLabel: { fontSize: 8, color: '#4B5563' },
  simStatusValue: { fontSize: 8, fontWeight: '800', color: '#047857' },

  mockBackTerms: { fontSize: 7, color: '#4B5563', textAlign: 'center', lineHeight: 9 },
  mockQrCode: { marginVertical: 14 },
  mockSignature: { alignItems: 'center', width: '100%', marginBottom: 6 },
  signatureLine: { height: 1, backgroundColor: '#000000', width: '70%', marginBottom: 2 },
  signatureLabel: { fontSize: 6, fontWeight: '700', color: '#666666' },

  simSofiaStage: { width: '100%', padding: 4 },
  simSubTitle: { fontSize: 11, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  simInputLabel: { fontSize: 8, color: '#4B5563', marginBottom: 2, fontWeight: '600' },
  simInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 30,
    fontSize: 9,
    marginBottom: 8,
    width: '100%'
  },
  simButton: {
    backgroundColor: '#059669',
    borderRadius: 6,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 4,
  },
  simButtonText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  simSofiaResult: {
    flexDirection: 'row',
    backgroundColor: '#E8FFF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 6,
    padding: 8,
    marginTop: 10,
    gap: 6,
    alignItems: 'center',
    width: '100%',
  },
  simResultName: { fontSize: 9, fontWeight: '800', color: '#047857' },
  simResultDetails: { fontSize: 8, color: '#065F46' },

  simRequestRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  },
  simRequestName: { fontSize: 9, fontWeight: '700', color: '#1F2937' },
  simRequestDoc: { fontSize: 8, color: '#6B7280' },
  simRequestStatus: { fontSize: 8, fontWeight: '700', marginTop: 2 },
  statusTextPending: { color: '#D97706' },
  statusTextSuccess: { color: '#059669' },
  simMiniBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  simMiniBtnText: { color: '#FFFFFF', fontSize: 8, fontWeight: '700' },

  simSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 8,
    height: 28,
    marginBottom: 8,
    width: '100%'
  },
  simSearchInput: { flex: 1, fontSize: 8 },
  simFichaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 6,
    overflow: 'hidden',
    width: '100%'
  },
  simFichaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#F9FAFB',
  },
  simFichaNum: { fontSize: 8, color: '#6B7280' },
  simFichaTitle: { fontSize: 9, fontWeight: '700', color: '#1F2937' },
  simFichaStudents: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  simStudentsTitle: { fontSize: 8, fontWeight: '700', color: '#374151', marginBottom: 4 },
  simStudentRow: { fontSize: 8, color: '#4B5563', marginVertical: 1 },

  simSelectContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  simSelectOption: {
    flex: 1,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simSelectOptionActive: {
    backgroundColor: '#E8FFF5',
    borderColor: '#059669',
  },
  simSelectOptionText: { fontSize: 7, color: '#4B5563', fontWeight: '600' },
  simSelectOptionTextActive: { color: '#047857', fontWeight: '800' },
});
