import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WebFrame from '../components/WebFrame.jsx';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import { colors } from '../theme/colors.jsx';

// --- GUÍAS PASO A PASO CON SUS ELEMENTOS INTERACTIVOS INTEGRADOS ---
const GUIDES = [
  {
    id: 'carnet',
    title: 'Ver y voltear mi Carnet Digital',
    category: 'aprendiz',
    icon: 'card-outline',
    desc: 'Aprende a ver tu carnet digital e interactuar con él (frente y reverso).',
    steps: [
      {
        title: 'Ver el frente del carnet',
        text: 'Este es el frente de tu carnet. Contiene tu foto, nombre completo, rol (Aprendiz) y código de barras. Toca la tarjeta o el botón de abajo para girarla.',
        instruction: 'Toca el carnet o presiona "Girar Carnet"',
        type: 'carnet-front'
      },
      {
        title: 'Ver el reverso del carnet',
        text: 'Este es el reverso de tu carnet. Aquí encuentras la firma autorizada y tu código QR personal, el cual usarás en los lectores de acceso.',
        instruction: 'Toca el carnet para volver al frente',
        type: 'carnet-back'
      },
      {
        title: '¡Guía Completada!',
        text: 'Ya sabes cómo alternar las vistas de tu carnet. Recuerda que puedes presentarlo desde tu celular en cualquier portería del centro.',
        instruction: 'Presiona "Siguiente Guía" para continuar aprendiendo.',
        type: 'carnet-success'
      }
    ]
  },
  {
    id: 'sofia',
    title: 'Validar cuenta con Sofia Plus',
    category: 'aprendiz',
    icon: 'shield-checkmark-outline',
    desc: 'Vincula tu cuenta de Sofia Plus para activar tu perfil en MyAccess.',
    steps: [
      {
        title: 'Ingresar datos de Sofia Plus',
        text: 'Para empezar, debes escribir tu documento de identidad y tu contraseña de Sofia Plus. Ingresa datos ficticios en el formulario de abajo para probar.',
        instruction: 'Ingresa un documento y contraseña y haz clic en "Continuar"',
        type: 'sofia-form'
      },
      {
        title: 'Ejecutar la validación',
        text: 'Una vez ingresados los datos, presiona el botón "Validar" para simular la conexión segura con los servidores de Sofia Plus.',
        instruction: 'Haz clic en el botón verde "Validar" para procesar',
        type: 'sofia-submit'
      },
      {
        title: 'Resultado de la validación',
        text: '¡Éxito! Tus datos fueron validados correctamente. El sistema ha cargado tu Ficha (2687392) y Programa de Formación (ADSO). Tu carnet digital ya está activo.',
        instruction: '¡Excelente! Has aprendido a validar tu cuenta.',
        type: 'sofia-success'
      }
    ]
  },
  {
    id: 'solicitudes',
    title: 'Aprobar solicitudes (Admin)',
    category: 'admin',
    icon: 'checkbox-outline',
    desc: 'Flujo administrativo para autorizar y firmar carnet digitales de aprendices.',
    steps: [
      {
        title: 'Revisar solicitudes pendientes',
        text: 'Aquí se muestran los aprendices que han solicitado su carnet. Debes seleccionar a uno de la lista para ver su información detallada.',
        instruction: 'Toca a "Mateo Gómez" para ver su solicitud',
        type: 'requests-list'
      },
      {
        title: 'Validar información',
        text: 'Observa la foto de perfil y los datos del aprendiz. Si son válidos y corresponden al estudiante, presiona el botón "Aprobar Solicitud".',
        instruction: 'Haz clic en el botón "Aprobar Solicitud"',
        type: 'requests-approve'
      },
      {
        title: 'Solicitud Aprobada',
        text: '¡Perfecto! La solicitud de Mateo Gómez ha sido aprobada. El carnet se ha firmado digitalmente y se le notificará a su celular.',
        instruction: 'Guía de solicitudes completada con éxito.',
        type: 'requests-success'
      }
    ]
  },
  {
    id: 'fichas',
    title: 'Gestionar grupos y Fichas',
    category: 'instructor',
    icon: 'people-outline',
    desc: 'Permite buscar grupos de formación y desplegar listas de estudiantes.',
    steps: [
      {
        title: 'Buscar ficha en el buscador',
        text: 'Los instructores tienen una lista de sus fichas asignadas. Escribe "268" en el campo de búsqueda para simular una búsqueda rápida.',
        instruction: 'Escribe "268" en el campo de texto',
        type: 'fichas-search'
      },
      {
        title: 'Seleccionar ficha del listado',
        text: 'El sistema filtrará los resultados mostrando la Ficha correspondiente. Toca la ficha de ADSO para expandirla.',
        instruction: 'Toca la ficha "2687392 - ADSO"',
        type: 'fichas-expand'
      },
      {
        title: 'Revisar aprendices inscritos',
        text: 'Ahora puedes visualizar la lista de todos los aprendices inscritos y activos en este grupo de formación.',
        instruction: 'Has completado la guía de gestión de fichas.',
        type: 'fichas-success'
      }
    ]
  },
  {
    id: 'notificaciones',
    title: 'Enviar notificaciones masivas',
    category: 'admin',
    icon: 'notifications-outline',
    desc: 'Envía anuncios institucionales a los dispositivos móviles de los aprendices.',
    steps: [
      {
        title: 'Redactar el anuncio',
        text: 'Escribe un título y el cuerpo del mensaje en el formulario para definir tu aviso institucional de prueba.',
        instruction: 'Completa los campos del formulario de abajo',
        type: 'notif-form'
      },
      {
        title: 'Seleccionar destinatarios',
        text: 'Selecciona si enviarás el mensaje a todos los usuarios o a una ficha en específico (ej. Ficha 2687392).',
        instruction: 'Selecciona una ficha de destino y haz clic en "Enviar"',
        type: 'notif-target'
      },
      {
        title: 'Notificación transmitida',
        text: '¡Enviado! El mensaje ha sido transmitido instantáneamente a los celulares de los estudiantes de la ficha seleccionada.',
        instruction: 'Has aprendido a enviar notificaciones masivas.',
        type: 'notif-success'
      }
    ]
  }
];

export default function UserManualScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [activeGuide, setActiveGuide] = useState(GUIDES[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // --- ESTADOS INTERACTIVOS DE LOS PASOS ---
  // Guía Carnet
  const [carnetFlipped, setCarnetFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  // Guía Sofia
  const [sofiaDoc, setSofiaDoc] = useState('');
  const [sofiaPass, setSofiaPass] = useState('');
  const [sofiaStatus, setSofiaStatus] = useState('idle'); // 'idle', 'loading', 'success'

  // Guía Solicitudes (Admin)
  const [requestSelected, setRequestSelected] = useState(false);
  const [requestApproved, setRequestApproved] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);

  // Guía Fichas (Instructor)
  const [fichaSearchText, setFichaSearchText] = useState('');
  const [fichaExpanded, setFichaExpanded] = useState(false);

  // Guía Notificaciones (Admin)
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifSelectedFicha, setNotifSelectedFicha] = useState('2687392');
  const [notifStatus, setNotifStatus] = useState('idle'); // 'idle', 'sending', 'success'

  const handleFlipCarnet = () => {
    const toValue = carnetFlipped ? 0 : 1;
    setCarnetFlipped(!carnetFlipped);
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      tension: 15,
      useNativeDriver: true,
    }).start(() => {
      // Avanzar al paso 2 si estaba en el paso 1 y se volteó
      if (currentStepIndex === 0 && !carnetFlipped) {
        setCurrentStepIndex(1);
      } else if (currentStepIndex === 1 && carnetFlipped) {
        setCurrentStepIndex(2);
      }
    });
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

  const handleSelectGuide = (guide) => {
    setActiveGuide(guide);
    setCurrentStepIndex(0);
    // Reiniciar estados
    setCarnetFlipped(false);
    flipAnim.setValue(0);
    setSofiaDoc('');
    setSofiaPass('');
    setSofiaStatus('idle');
    setRequestSelected(false);
    setRequestApproved(false);
    setFichaSearchText('');
    setFichaExpanded(false);
    setNotifTitle('');
    setNotifBody('');
    setNotifStatus('idle');
  };

  const nextStep = () => {
    if (currentStepIndex < activeGuide.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Siguiente guía si terminó
      const currentIndex = GUIDES.findIndex(g => g.id === activeGuide.id);
      if (currentIndex < GUIDES.length - 1) {
        handleSelectGuide(GUIDES[currentIndex + 1]);
      } else {
        handleSelectGuide(GUIDES[0]);
      }
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // --- FILTRADO DE GUÍAS ---
  const filteredGuides = GUIDES.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guide.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- RENDERIZADORES DE SIMULACIÓN DENTRO DE LA TARJETA ---
  const renderCardSimulator = (type) => {
    switch (type) {
      // 1. CARNET DIGITAL
      case 'carnet-front':
      case 'carnet-back':
      case 'carnet-success':
        return (
          <View style={styles.simContainer}>
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
            
            <TouchableOpacity style={styles.simActionBtn} onPress={handleFlipCarnet}>
              <Ionicons name="sync-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.simActionBtnText}>Girar Carnet</Text>
            </TouchableOpacity>
          </View>
        );

      // 2. SOFIA PLUS
      case 'sofia-form':
        return (
          <View style={styles.simContainer}>
            <Text style={styles.simInputLabel}>Número de Documento:</Text>
            <TextInput
              style={styles.simTextInput}
              placeholder="Ej: 1094733910"
              value={sofiaDoc}
              onChangeText={setSofiaDoc}
              keyboardType="numeric"
            />
            <Text style={styles.simInputLabel}>Contraseña Sofia Plus:</Text>
            <TextInput
              style={styles.simTextInput}
              placeholder="Contraseña oficial"
              secureTextEntry
              value={sofiaPass}
              onChangeText={setSofiaPass}
            />
            <TouchableOpacity 
              style={[styles.simActionBtn, (!sofiaDoc || !sofiaPass) && styles.simActionBtnDisabled]} 
              disabled={!sofiaDoc || !sofiaPass}
              onPress={() => setCurrentStepIndex(1)}
            >
              <Text style={styles.simActionBtnText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        );

      case 'sofia-submit':
        return (
          <View style={styles.simContainer}>
            <View style={styles.simFormSummary}>
              <Text style={styles.simSummaryText}>Doc: {sofiaDoc}</Text>
              <Text style={styles.simSummaryText}>Pass: ********</Text>
            </View>

            {sofiaStatus === 'loading' ? (
              <ActivityIndicator size="small" color="#059669" style={{ marginVertical: 12 }} />
            ) : (
              <TouchableOpacity 
                style={styles.simActionBtn} 
                onPress={() => {
                  setSofiaStatus('loading');
                  setTimeout(() => {
                    setSofiaStatus('success');
                    setCurrentStepIndex(2);
                  }, 1200);
                }}
              >
                <Text style={styles.simActionBtnText}>Validar en Sofia Plus</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'sofia-success':
        return (
          <View style={styles.simContainer}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-circle" size={32} color="#059669" />
              <Text style={styles.successBadgeTitle}>¡Sincronización Exitosa!</Text>
              <Text style={styles.successBadgeSubtitle}>PAULO RODRÍGUEZ GÓMEZ</Text>
              <Text style={styles.successBadgeFicha}>Ficha: 2687392 (ADSO)</Text>
            </View>
            <TouchableOpacity style={styles.simActionBtn} onPress={() => handleSelectGuide(GUIDES[2])}>
              <Text style={styles.simActionBtnText}>Ir a Siguiente Guía</Text>
            </TouchableOpacity>
          </View>
        );

      // 3. APROBAR SOLICITUDES
      case 'requests-list':
        return (
          <View style={styles.simContainer}>
            <Text style={styles.simListHeading}>Solicitudes de Carnetización</Text>
            <TouchableOpacity 
              style={[styles.simListItem, requestSelected && styles.simListItemActive]} 
              onPress={() => {
                setRequestSelected(true);
                setTimeout(() => {
                  setCurrentStepIndex(1);
                }, 800);
              }}
            >
              <Ionicons name="person-circle-outline" size={24} color="#059669" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.simListItemTitle}>Mateo Gómez Montoya</Text>
                <Text style={styles.simListItemDesc}>Doc: 1.094.223.112 | Ficha: 2687392</Text>
              </View>
              <Text style={styles.simListItemBadge}>Pendiente</Text>
            </TouchableOpacity>

            <View style={[styles.simListItem, { opacity: 0.6 }]}>
              <Ionicons name="person-circle-outline" size={24} color="#666" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.simListItemTitle}>Juliana Ríos Castaño</Text>
                <Text style={styles.simListItemDesc}>Doc: 1.094.887.411 | Ficha: 2687392</Text>
              </View>
              <Text style={styles.simListItemBadge}>Pendiente</Text>
            </View>
          </View>
        );

      case 'requests-approve':
        return (
          <View style={styles.simContainer}>
            <View style={styles.simDetailCard}>
              <Text style={styles.simDetailTitle}>Detalles de Solicitud</Text>
              <View style={styles.simDetailRow}><Text style={styles.simDetailLabel}>Aprendiz:</Text><Text style={styles.simDetailVal}>Mateo Gómez</Text></View>
              <View style={styles.simDetailRow}><Text style={styles.simDetailLabel}>Documento:</Text><Text style={styles.simDetailVal}>1.094.223.112</Text></View>
              <View style={styles.simDetailRow}><Text style={styles.simDetailLabel}>Ficha:</Text><Text style={styles.simDetailVal}>2687392</Text></View>
              
              {approveLoading ? (
                <ActivityIndicator size="small" color="#059669" style={{ marginTop: 14 }} />
              ) : (
                <TouchableOpacity 
                  style={[styles.simActionBtn, { backgroundColor: '#059669', marginTop: 14 }]} 
                  onPress={() => {
                    setApproveLoading(true);
                    setTimeout(() => {
                      setApproveLoading(false);
                      setRequestApproved(true);
                      setCurrentStepIndex(2);
                    }, 1200);
                  }}
                >
                  <Text style={styles.simActionBtnText}>Aprobar Solicitud</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );

      case 'requests-success':
        return (
          <View style={styles.simContainer}>
            <View style={styles.successBadge}>
              <Ionicons name="shield-checkmark" size={32} color="#059669" />
              <Text style={styles.successBadgeTitle}>¡Carnet Autorizado!</Text>
              <Text style={styles.successBadgeSubtitle}>La firma digital y código QR se han generado.</Text>
            </View>
            <TouchableOpacity style={styles.simActionBtn} onPress={() => handleSelectGuide(GUIDES[3])}>
              <Text style={styles.simActionBtnText}>Ir a Siguiente Guía</Text>
            </TouchableOpacity>
          </View>
        );

      // 4. GESTIÓN DE FICHAS
      case 'fichas-search':
        return (
          <View style={styles.simContainer}>
            <Text style={styles.simInputLabel}>Buscador de Fichas:</Text>
            <View style={styles.simSearchBox}>
              <Ionicons name="search-outline" size={16} color="#666" style={{ marginRight: 6 }} />
              <TextInput
                style={styles.simSearchInput}
                placeholder="Escribe '268'..."
                value={fichaSearchText}
                onChangeText={(t) => {
                  setFichaSearchText(t);
                  if (t.includes('268')) {
                    setTimeout(() => {
                      setCurrentStepIndex(1);
                    }, 1000);
                  }
                }}
              />
            </View>
          </View>
        );

      case 'fichas-expand':
        return (
          <View style={styles.simContainer}>
            <Text style={styles.simInputLabel}>Resultados de búsqueda:</Text>
            <TouchableOpacity 
              style={[styles.simFichaItem, fichaExpanded && styles.simFichaItemActive]} 
              onPress={() => {
                setFichaExpanded(true);
                setTimeout(() => {
                  setCurrentStepIndex(2);
                }, 1000);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.simFichaTitle}>Ficha: 2687392</Text>
                <Text style={styles.simFichaDesc}>Programa: ADSO | 45 Aprendices</Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={16} color="#059669" />
            </TouchableOpacity>
          </View>
        );

      case 'fichas-success':
        return (
          <View style={styles.simContainer}>
            <View style={styles.simStudentsList}>
              <Text style={styles.simStudentsHeading}>Aprendices en Ficha 2687392:</Text>
              {['Carlos Mario Pérez', 'Andrés Felipe Marín', 'Laura Camila Rojas', 'Sofía Ospina Tabares'].map((student, idx) => (
                <View key={idx} style={styles.simStudentRow}>
                  <Text style={styles.simStudentText}>{student}</Text>
                  <Text style={styles.simStudentStatus}>Activo</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.simActionBtn} onPress={() => handleSelectGuide(GUIDES[4])}>
              <Text style={styles.simActionBtnText}>Ir a Siguiente Guía</Text>
            </TouchableOpacity>
          </View>
        );

      // 5. ENVIAR NOTIFICACIONES MASIVAS
      case 'notif-form':
        return (
          <View style={styles.simContainer}>
            <Text style={styles.simInputLabel}>Título de Notificación:</Text>
            <TextInput
              style={styles.simTextInput}
              placeholder="Ej: Entrega de Carnets"
              value={notifTitle}
              onChangeText={setNotifTitle}
            />
            <Text style={styles.simInputLabel}>Cuerpo del Mensaje:</Text>
            <TextInput
              style={[styles.simTextInput, { height: 50, textAlignVertical: 'top' }]}
              placeholder="Mensaje para los aprendices..."
              multiline
              numberOfLines={2}
              value={notifBody}
              onChangeText={setNotifBody}
            />
            <TouchableOpacity 
              style={[styles.simActionBtn, (!notifTitle || !notifBody) && styles.simActionBtnDisabled]} 
              disabled={!notifTitle || !notifBody}
              onPress={() => setCurrentStepIndex(1)}
            >
              <Text style={styles.simActionBtnText}>Elegir Destinatario</Text>
            </TouchableOpacity>
          </View>
        );

      case 'notif-target':
        return (
          <View style={styles.simContainer}>
            <Text style={styles.simInputLabel}>Seleccionar Ficha de Destino:</Text>
            <View style={styles.simSelectRow}>
              {['2687392', '2712993', 'Todas'].map((num) => (
                <TouchableOpacity 
                  key={num} 
                  style={[styles.simSelectOpt, notifSelectedFicha === num && styles.simSelectOptActive]}
                  onPress={() => setNotifSelectedFicha(num)}
                >
                  <Text style={[styles.simSelectOptText, notifSelectedFicha === num && styles.simSelectOptTextActive]}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {notifStatus === 'sending' ? (
              <ActivityIndicator size="small" color="#059669" style={{ marginVertical: 12 }} />
            ) : (
              <TouchableOpacity 
                style={styles.simActionBtn} 
                onPress={() => {
                  setNotifStatus('sending');
                  setTimeout(() => {
                    setNotifStatus('success');
                    setCurrentStepIndex(2);
                  }, 1200);
                }}
              >
                <Text style={styles.simActionBtnText}>Enviar Notificación Masiva</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case 'notif-success':
        return (
          <View style={styles.simContainer}>
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-done-circle" size={32} color="#059669" />
              <Text style={styles.successBadgeTitle}>¡Notificación Transmitida!</Text>
              <Text style={styles.successBadgeSubtitle}>Los aprendices la recibirán en tiempo real.</Text>
            </View>
            <TouchableOpacity style={styles.simActionBtn} onPress={() => handleSelectGuide(GUIDES[0])}>
              <Text style={styles.simActionBtnText}>Volver al Inicio del Manual</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  const userInitial = 'U';
  const userName = 'Usuario';

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
                  Aprende a utilizar las funciones de MyAccess interactivamente a través de estas tarjetas paso a paso.
                </Text>
              </View>

              {/* Selector de Guías */}
              <View style={styles.guidesSelectorCard}>
                <Text style={styles.selectorHeading}>¿Qué quieres aprender hoy?</Text>
                <View style={styles.searchBox}>
                  <Ionicons name="search-outline" size={16} color="#6B7280" style={{ marginRight: 6 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar tema de ayuda..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                <View style={styles.categoriesRow}>
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'aprendiz', label: 'Para Aprendices' },
                    { id: 'instructor', label: 'Para Instructores' },
                    { id: 'admin', label: 'Administrativos' }
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

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
                  {filteredGuides.map((guide) => (
                    <TouchableOpacity
                      key={guide.id}
                      style={[styles.guideOptionCard, activeGuide.id === guide.id && styles.guideOptionCardActive]}
                      onPress={() => handleSelectGuide(guide)}
                      activeOpacity={0.85}
                    >
                      <Ionicons 
                        name={guide.icon} 
                        size={20} 
                        color={activeGuide.id === guide.id ? '#FFFFFF' : '#059669'} 
                      />
                      <Text style={[styles.guideOptionTitle, activeGuide.id === guide.id && styles.guideOptionTitleActive]}>
                        {guide.title}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* TARJETA INTERACTIVA DE PASO A PASO */}
              <View style={styles.interactiveStepCard}>
                
                {/* Header de la tarjeta */}
                <View style={styles.stepCardHeader}>
                  <View style={styles.badgeWrap}>
                    <Text style={styles.badgeText}>
                      Paso {currentStepIndex + 1} de {activeGuide.steps.length}
                    </Text>
                  </View>
                  <Text style={styles.guideTitleText}>{activeGuide.title}</Text>
                </View>

                {/* Explicación del paso */}
                <View style={styles.stepExplainSection}>
                  <Text style={styles.stepTitleText}>
                    {activeGuide.steps[currentStepIndex].title}
                  </Text>
                  <Text style={styles.stepDescText}>
                    {activeGuide.steps[currentStepIndex].text}
                  </Text>
                </View>

                {/* Área de interacción del simulador integrada en la tarjeta */}
                <View style={styles.simCardWrapper}>
                  <Text style={styles.simHeading}>ZONA DE INTERACCIÓN</Text>
                  <View style={styles.simCardBorder}>
                    <View style={styles.instructionBadge}>
                      <Ionicons name="bulb-outline" size={14} color="#059669" style={{ marginRight: 4 }} />
                      <Text style={styles.instructionText}>{activeGuide.steps[currentStepIndex].instruction}</Text>
                    </View>
                    {renderCardSimulator(activeGuide.steps[currentStepIndex].type)}
                  </View>
                </View>

                {/* Controles de navegación */}
                <View style={styles.stepCardFooter}>
                  <TouchableOpacity
                    style={[styles.navBtn, currentStepIndex === 0 && styles.navBtnDisabled]}
                    onPress={prevStep}
                    disabled={currentStepIndex === 0}
                  >
                    <Ionicons name="chevron-back" size={16} color={currentStepIndex === 0 ? '#9CA3AF' : '#059669'} />
                    <Text style={[styles.navBtnText, currentStepIndex === 0 && styles.navBtnTextDisabled]}>Anterior</Text>
                  </TouchableOpacity>

                  <View style={styles.dotsIndicator}>
                    {activeGuide.steps.map((_, idx) => (
                      <View 
                        key={idx} 
                        style={[styles.dot, currentStepIndex === idx && styles.dotActive]} 
                      />
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.navBtn}
                    onPress={nextStep}
                  >
                    <Text style={styles.navBtnText}>
                      {currentStepIndex === activeGuide.steps.length - 1 ? 'Siguiente Guía' : 'Siguiente'}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#059669" />
                  </TouchableOpacity>
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
  headerBlock: { marginBottom: 14 },
  pageTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, color: '#4B5563', lineHeight: 18 },

  // Selector de Guías
  guidesSelectorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  selectorHeading: { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8, textTransform: 'uppercase' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 34,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 12, color: '#1F2937' },
  categoriesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  categoryBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  categoryBtnActive: { backgroundColor: '#059669' },
  categoryBtnText: { fontSize: 10, color: '#4B5563', fontWeight: '600' },
  categoryBtnTextActive: { color: '#FFFFFF' },
  selectorScroll: { flexDirection: 'row', paddingVertical: 4 },
  guideOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 36,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  guideOptionCardActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  guideOptionTitle: { fontSize: 11, fontWeight: '700', color: '#1F2937' },
  guideOptionTitleActive: { color: '#FFFFFF' },

  // TARJETA DE PASOS INTERACTIVA
  interactiveStepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
  },
  badgeWrap: {
    backgroundColor: '#E8FFF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#059669' },
  guideTitleText: { fontSize: 12, fontWeight: '600', color: '#4B5563', flex: 1 },

  stepExplainSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  stepTitleText: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 6 },
  stepDescText: { fontSize: 13, color: '#374151', lineHeight: 18 },

  // Contenedor del simulador integrado
  simCardWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  simHeading: { fontSize: 9, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8, marginBottom: 6 },
  simCardBorder: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    padding: 14,
    alignItems: 'center',
  },
  instructionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8FFF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  instructionText: { fontSize: 10, color: '#047857', fontWeight: '700' },

  simContainer: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },

  // Controles del pie de tarjeta
  stepCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  navBtn: {
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
  navBtnDisabled: {
    borderColor: '#D1D5DB',
  },
  navBtnText: { fontSize: 12, fontWeight: '700', color: '#059669' },
  navBtnTextDisabled: { color: '#9CA3AF' },
  dotsIndicator: { flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB' },
  dotActive: { backgroundColor: '#059669', width: 14 },

  // ESTILOS DE LOS SIMULADORES
  cardTouchable: {
    width: 170,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
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
  mockCardFront: { backgroundColor: '#FDFDFD' },
  mockCardBack: { backgroundColor: '#FFFFFF', alignItems: 'center' },
  mockCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mockSenaCircle: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#059669' },
  mockSenaText: { fontSize: 7, fontWeight: '800', color: '#059669' },
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
  mockBackTerms: { fontSize: 7, color: '#4B5563', textAlign: 'center', lineHeight: 9 },
  mockQrCode: { marginVertical: 14 },
  mockSignature: { alignItems: 'center', width: '100%', marginBottom: 6 },
  signatureLine: { height: 1, backgroundColor: '#000000', width: '70%', marginBottom: 2 },
  signatureLabel: { fontSize: 6, fontWeight: '700', color: '#666666' },

  simActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 6,
  },
  simActionBtnDisabled: {
    backgroundColor: '#9CA3AF',
  },
  simActionBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  // Inputs del simulador
  simInputLabel: { fontSize: 10, color: '#4B5563', fontWeight: '600', alignSelf: 'flex-start', marginBottom: 3 },
  simTextInput: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 34,
    fontSize: 11,
    marginBottom: 8,
  },
  simFormSummary: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  simSummaryText: { fontSize: 10, color: '#374151', fontWeight: '600' },

  // Badges y resultados
  successBadge: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E8FFF5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    width: '100%',
    marginBottom: 10,
  },
  successBadgeTitle: { fontSize: 12, fontWeight: '800', color: '#047857', marginTop: 4 },
  successBadgeSubtitle: { fontSize: 10, color: '#065F46', textAlign: 'center', marginTop: 2 },
  successBadgeFicha: { fontSize: 10, color: '#047857', fontWeight: '700', marginTop: 2 },

  // Listas de solicitudes
  simListHeading: { fontSize: 11, fontWeight: '700', color: '#374151', alignSelf: 'flex-start', marginBottom: 8 },
  simListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    marginBottom: 6,
  },
  simListItemActive: {
    borderColor: '#059669',
    backgroundColor: '#E8FFF5',
  },
  simListItemTitle: { fontSize: 10, fontWeight: '700', color: '#1F2937' },
  simListItemDesc: { fontSize: 8, color: '#6B7280' },
  simListItemBadge: { fontSize: 8, fontWeight: '700', color: '#D97706', backgroundColor: '#FEF3C7', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },

  // Detalle de solicitud
  simDetailCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
  },
  simDetailTitle: { fontSize: 11, fontWeight: '700', color: '#1F2937', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingBottom: 4 },
  simDetailRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 2 },
  simDetailLabel: { fontSize: 9, color: '#6B7280' },
  simDetailVal: { fontSize: 9, fontWeight: '700', color: '#374151' },

  // Gestión de fichas
  simFichaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
  },
  simFichaItemActive: {
    borderColor: '#059669',
    backgroundColor: '#E8FFF5',
  },
  simFichaTitle: { fontSize: 10, fontWeight: '700', color: '#1F2937' },
  simFichaDesc: { fontSize: 8, color: '#6B7280' },

  simStudentsList: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 8,
    marginBottom: 8,
  },
  simStudentsHeading: { fontSize: 9, fontWeight: '700', color: '#374151', marginBottom: 6 },
  simStudentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  simStudentText: { fontSize: 9, color: '#4B5563' },
  simStudentStatus: { fontSize: 8, fontWeight: '600', color: '#059669' },

  // Selectores de notificaciones
  simSelectRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    marginBottom: 10,
  },
  simSelectOpt: {
    flex: 1,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simSelectOptActive: {
    backgroundColor: '#E8FFF5',
    borderColor: '#059669',
  },
  simSelectOptText: { fontSize: 8, color: '#4B5563', fontWeight: '600' },
  simSelectOptTextActive: { color: '#047857', fontWeight: '800' },
});
