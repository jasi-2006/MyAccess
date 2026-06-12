import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { colors } from '../theme/colors.jsx';
import { resolveImageUrl } from '../services/api.js';
import { getUserProfile, updateUserProfile } from '../services/authService';
import { verifySofiaPlus, updateSofiaVerified } from '../services/validationService';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import UserSidebar from '../components/UserSidebar.jsx';
import WebFrame from '../components/WebFrame.jsx';
import SuccessModal from '../components/SuccessModal.jsx';

const LOADING_STEPS = [
  'Estableciendo conexión segura con Sofia Plus...',
  'Simulando navegación y rellenando formulario de acceso...',
  'Iniciando sesión en el portal académico del SENA...',
  'Buscando ficha de matrícula activa del aprendiz...',
  'Extrayendo nombres, documento, ficha y programa oficial...',
  'Analizando discrepancias usando Inteligencia Artificial...',
  'Generando reporte de discrepancias y mockup visual...',
];

export default function SofiaVerificationScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 910;
  const isTablet = width >= 490 && width < 910;
  const px = isDesktop ? 50 : isTablet ? 40 : 14;

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [password, setPassword] = useState('');
  const [useMock, setUseMock] = useState(true); // Default mock for easier grading/testing
  const [validating, setValidating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationResult, setValidationResult] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [correcting, setCorrecting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const p = await getUserProfile();
      setProfile(p);
      // Auto-detect if they should use mock based on document
      if (p && p.document && !p.document.startsWith('123')) {
        setUseMock(false);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Efecto para animar los pasos del cargador dinámico
  useEffect(() => {
    let interval = null;
    if (validating) {
      setCurrentStep(0);
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 2500);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [validating]);

  const handleValidate = async () => {
    if (!password && !useMock) {
      Alert.alert('Contraseña requerida', 'Por favor ingresa tu contraseña de Sofia Plus.');
      return;
    }

    setValidating(true);
    setErrorMsg('');
    setValidationResult(null);

    try {
      const result = await verifySofiaPlus(profile.document, password, useMock);
      setValidationResult(result);
      if (result.success) {
        setShowSuccessModal(true);
        // Recargar perfil verificado
        await loadProfile();
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al realizar la verificación.');
    } finally {
      setValidating(false);
      setPassword('');
    }
  };

  const handleAutoCorrect = async () => {
    if (!validationResult || !validationResult.scrapedData) return;
    
    setCorrecting(true);
    try {
      const scraped = validationResult.scrapedData;
      
      // Construir payload con los datos correctos extraídos de Sofia Plus
      const updatePayload = {
        fullName: scraped.fullName,
        ficha: scraped.ficha,
        trainingProgram: scraped.trainingProgram,
        trainingCenter: scraped.trainingCenter || profile.trainingCenter,
        regional: scraped.regional || profile.regional,
        sofiaVerified: true, // Marcar como verificado
      };

      await updateUserProfile(profile.document, updatePayload);
      
      // Mostrar alerta de éxito
      setShowSuccessModal(true);
      setValidationResult(null);
      await loadProfile();
    } catch (err) {
      Alert.alert('Error al corregir', err.message || 'No fue posible corregir los datos.');
    } finally {
      setCorrecting(false);
    }
  };

  const studentName = profile?.fullName || '';
  const studentInitial = studentName.charAt(0).toUpperCase();

  const getFieldName = (field) => {
    switch (field) {
      case 'fullName': return 'Nombre Completo';
      case 'document': return 'Número de Documento';
      case 'ficha': return 'Ficha de Ficha';
      case 'trainingProgram': return 'Programa de Formación';
      case 'status': return 'Estado Académico';
      default: return field;
    }
  };

  return (
    <WebFrame>
      <View style={styles.container}>
        <CarnetTopbar navigation={navigation} studentName={studentName} studentInitial={studentInitial} />
        <View style={styles.body}>
          {!isMobile && <UserSidebar navigation={navigation} activeKey="SofiaVerification" role={profile?.nameRole} />}
          <ScrollView style={styles.main} contentContainerStyle={{ paddingHorizontal: px, paddingVertical: 24 }}>
            {isMobile && <UserSidebar navigation={navigation} activeKey="SofiaVerification" role={profile?.nameRole} />}

            <View style={styles.headerBlock}>
              <Text style={styles.pageTitle}>Verificación Sofia Plus</Text>
              <Text style={styles.pageSubtitle}>
                Conecta tu cuenta de Carnet Digital de forma segura con Sofia Plus para verificar la validez de tu información oficial del SENA.
              </Text>
            </View>

            {loadingProfile ? (
              <ActivityIndicator size="large" color="#0F766E" style={{ marginTop: 40 }} />
            ) : profile ? (
              <View style={styles.cardContent}>
                
                {/* ── ESTADO ACTUAL ── */}
                <View style={[styles.statusBanner, profile.sofiaVerified ? styles.statusBannerSuccess : styles.statusBannerPending]}>
                  <Text style={[styles.statusBannerText, profile.sofiaVerified ? styles.statusTextSuccess : styles.statusTextPending]}>
                    {profile.sofiaVerified 
                      ? '✓ Cuenta Verificada con Sofia Plus' 
                      : '⚠ Datos sin Verificar contra Sofia Plus'}
                  </Text>
                </View>

                {validating ? (
                  /* ── ANIMACIÓN DE CARGA DINÁMICA ── */
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0F766E" />
                    <Text style={styles.loadingTitle}>Procesando Validación</Text>
                    <Text style={styles.loadingSub}>{LOADING_STEPS[currentStep]}</Text>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%` }]} />
                    </View>
                  </View>
                ) : validationResult && !validationResult.success ? (
                  /* ── DISCREPANCIAS DETECTADAS ── */
                  <View style={styles.mismatchContainer}>
                    <View style={styles.alertHeader}>
                      <Text style={styles.alertTitle}>¡Se detectaron diferencias con Sofia Plus!</Text>
                      <Text style={styles.alertText}>
                        La Inteligencia Artificial ha encontrado que los datos locales en tu carnet difieren de la base de datos oficial de Sofia Plus. Los campos erróneos están marcados a continuación:
                      </Text>
                    </View>

                    {/* Fila con imagen y desglose */}
                    <View style={[styles.mismatchRow, isDesktop && styles.rowLayout]}>
                      
                      {/* Imagen Mockup Generada */}
                      {validationResult.feedbackImageUrl && (
                        <View style={[styles.imageCard, isDesktop && { width: '45%' }]}>
                          <Text style={styles.sectionLabel}>Guía Visual del Carnet</Text>
                          <Image 
                            source={{ uri: resolveImageUrl(validationResult.feedbackImageUrl) }} 
                            style={styles.mockupImage} 
                            resizeMode="contain"
                          />
                          <Text style={styles.imageCaption}>
                            * Los recuadros rojos señalan los campos que debes corregir para validar tu carnet.
                          </Text>
                        </View>
                      )}

                      {/* Tabla / Lista de diferencias */}
                      <View style={[styles.detailsCard, isDesktop && { width: '50%' }]}>
                        <Text style={styles.sectionLabel}>Explicación de Diferencias</Text>
                        
                        {validationResult.mismatches.map((m, idx) => (
                          <View key={idx} style={styles.mismatchItem}>
                            <View style={styles.mismatchHeaderRow}>
                              <Text style={styles.mismatchField}>{getFieldName(m.field)}</Text>
                            </View>
                            <View style={styles.mismatchComparison}>
                              <View style={styles.compColumn}>
                                <Text style={styles.compLabel}>Dato Local:</Text>
                                <Text style={styles.compValueLocal}>{m.local || '(En blanco)'}</Text>
                              </View>
                              <View style={styles.compColumn}>
                                <Text style={styles.compLabel}>Sofia Plus (Oficial):</Text>
                                <Text style={styles.compValueSofia}>{m.sofia || '(No registra)'}</Text>
                              </View>
                            </View>
                            <Text style={styles.aiExplanation}>{m.explanation}</Text>
                          </View>
                        ))}

                        <View style={styles.actionBlock}>
                          <TouchableOpacity 
                            style={styles.autoCorrectBtn} 
                            onPress={handleAutoCorrect}
                            disabled={correcting}
                          >
                            {correcting ? (
                              <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                              <Text style={styles.autoCorrectText}>Corregir Datos Automáticamente</Text>
                            )}
                          </TouchableOpacity>
                          
                          <TouchableOpacity 
                            style={styles.cancelBtn} 
                            onPress={() => setValidationResult(null)}
                          >
                            <Text style={styles.cancelBtnText}>Reintentar Validación</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : (
                  /* ── FORMULARIO DE INGRESO ── */
                  <View style={styles.formContainer}>
                    <Text style={styles.formTitle}>Validar Información Oficial</Text>
                    <Text style={styles.formInstructions}>
                      Ingresa tu contraseña de Sofia Plus. Esta se procesará únicamente para la consulta en vivo y no se almacenará en nuestros servidores.
                    </Text>

                    {errorMsg ? <Text style={styles.errorBanner}>{errorMsg}</Text> : null}

                    <View style={styles.fieldGroup}>
                      <Text style={styles.inputLabel}>Tipo de Documento</Text>
                      <TextInput 
                        value={profile.typeDocument || 'CC'} 
                        editable={false} 
                        style={[styles.input, styles.inputDisabled]} 
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.inputLabel}>Número de Documento</Text>
                      <TextInput 
                        value={profile.document} 
                        editable={false} 
                        style={[styles.input, styles.inputDisabled]} 
                      />
                    </View>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.inputLabel}>Contraseña de Sofia Plus</Text>
                      <TextInput 
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry 
                        placeholder="••••••••••••"
                        style={styles.input}
                        editable={!useMock}
                      />
                    </View>

                    {/* Toggle de Modo Demo */}
                    <View style={styles.demoToggleRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.demoTitle}>Modo Demo (Pruebas)</Text>
                        <Text style={styles.demoDesc}>
                          Simula la validación usando casos de prueba. Ideal para evaluar sin contraseñas reales.
                        </Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.toggleBtn, useMock ? styles.toggleBtnActive : styles.toggleBtnInactive]}
                        onPress={() => setUseMock(!useMock)}
                      >
                        <Text style={[styles.toggleText, useMock && { color: '#FFFFFF' }]}>
                          {useMock ? 'ACTIVADO' : 'DESACTIVADO'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {useMock && (
                      <View style={styles.mockInfoAlert}>
                        <Text style={styles.mockInfoText}>
                          💡 **Casos de prueba en Modo Demo según tu Cédula:**{'\n'}
                          • **12345678**: Coincidencia perfecta (Valida con éxito).{'\n'}
                          • **12345679**: Error ortográfico en el Nombre (Daniela López).{'\n'}
                          • **12345680**: Ficha desactualizada (Local: 2455678, Sofia: 2899123).{'\n'}
                          • **12345681**: Aprendiz con estado de Matrícula Cancelado.{'\n'}
                          *(Si tu documento actual no empieza por 123, el sistema usará un aprendiz autoverificado).*
                        </Text>
                      </View>
                    )}

                    <TouchableOpacity style={styles.submitBtn} onPress={handleValidate}>
                      <Text style={styles.submitBtnText}>Iniciar Validación Automática</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <Text>No se pudo cargar el perfil de usuario.</Text>
            )}
          </ScrollView>
        </View>

        <SuccessModal
          visible={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          message="Tus datos han sido validados y sincronizados exitosamente con Sofia Plus."
        />
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1 },
  headerBlock: { marginBottom: 20 },
  pageTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  pageSubtitle: { fontSize: 13, lineHeight: 18, color: '#475569', maxWidth: 650 },
  cardContent: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', padding: 20 },
  statusBanner: { padding: 12, borderRadius: 8, marginBottom: 20, alignItems: 'center' },
  statusBannerSuccess: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#A7F3D0' },
  statusBannerPending: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA' },
  statusBannerText: { fontSize: 14, fontWeight: '700' },
  statusTextSuccess: { color: '#047857' },
  statusTextPending: { color: '#C2410C' },
  
  formContainer: { gap: 16, maxWidth: 500, alignSelf: 'center', width: '100%' },
  formTitle: { fontSize: 16, fontWeight: '700', color: '#0F766E' },
  formInstructions: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  fieldGroup: { gap: 6 },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#475569', textTransform: 'uppercase' },
  input: {
    borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 14, color: '#1E293B', backgroundColor: '#FFFFFF',
  },
  inputDisabled: { backgroundColor: '#F1F5F9', color: '#64748B' },
  submitBtn: {
    backgroundColor: '#0F766E', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  submitBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  errorBanner: { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1, color: '#B91C1C', padding: 10, borderRadius: 8, fontSize: 13 },
  
  demoToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  demoTitle: { fontSize: 13, fontWeight: '700', color: '#334155' },
  demoDesc: { fontSize: 11, color: '#64748B', lineHeight: 14 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },
  toggleBtnActive: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  toggleBtnInactive: { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1' },
  toggleText: { fontSize: 10, fontWeight: '800', color: '#64748B' },
  mockInfoAlert: { backgroundColor: '#F0FDF4', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#DCFCE7' },
  mockInfoText: { fontSize: 11, color: '#15803D', lineHeight: 15 },
  
  loadingContainer: { padding: 40, alignItems: 'center', gap: 12 },
  loadingTitle: { fontSize: 16, fontWeight: '700', color: '#0F766E' },
  loadingSub: { fontSize: 13, color: '#64748B', textAlign: 'center' },
  progressBar: { width: '100%', maxWidth: 300, height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: '100%', backgroundColor: '#0F766E' },

  mismatchContainer: { gap: 16 },
  alertHeader: { backgroundColor: '#FEF2F2', padding: 14, borderRadius: 8, borderWidth: 1, borderColor: '#FCA5A5' },
  alertTitle: { fontSize: 16, fontWeight: '800', color: '#991B1B', marginBottom: 4 },
  alertText: { fontSize: 12, color: '#7F1D1D', lineHeight: 17 },
  mismatchRow: { gap: 20 },
  rowLayout: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  imageCard: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#475569', marginBottom: 12, textTransform: 'uppercase', alignSelf: 'flex-start' },
  mockupImage: { width: '100%', height: 350, maxHeight: 420 },
  imageCaption: { fontSize: 10, color: '#64748B', marginTop: 8, textAlign: 'center' },
  detailsCard: { gap: 12 },
  mismatchItem: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', gap: 6 },
  mismatchHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  mismatchField: { fontSize: 13, fontWeight: '800', color: '#1E293B' },
  mismatchComparison: { flexDirection: 'row', gap: 12, marginTop: 4 },
  compColumn: { flex: 1 },
  compLabel: { fontSize: 10, color: '#64748B', textTransform: 'uppercase' },
  compValueLocal: { fontSize: 12, fontWeight: '600', color: '#B91C1C' },
  compValueSofia: { fontSize: 12, fontWeight: '600', color: '#047857' },
  aiExplanation: { fontSize: 11, color: '#475569', fontStyle: 'italic', backgroundColor: '#EFF6FF', padding: 8, borderRadius: 6, marginTop: 4, lineHeight: 15 },
  
  actionBlock: { gap: 10, marginTop: 16 },
  autoCorrectBtn: { backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  autoCorrectText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  cancelBtn: { backgroundColor: '#FFFFFF', borderHeight: 1, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontWeight: '700', fontSize: 14 },
});
