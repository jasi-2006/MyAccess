import React, {useEffect,useState}from 'react';
import {View, Text, StyleSheet,ScrollView}from 'react-native';
import { getUserProfile } from '../services/authService';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';

export default function UserProfile({navigation}){
    // const {width}= useWindowsDimentions ();
    // const isMobile= width < 480;
    // const isTablet = width >= 490 &&   width <900;
    // const isDesktop = width >= 910;
    // const px = desktop ? 70: isTablet ? 60:20;

    useEffect(()=>{
        getUSerProfile()
            .then(setProfile)
            .catch(()=>setProfile(null))
            .finally(()=>setLoading(false));
    }, []);
    
    const fields =[
        {label: 'nombre completo', value: profile?.fullName},
        {label: 'Tipo documento', value: profile?.TypeDocument},
        {label: 'Docuemto', value: profile?.document},
        {label: 'tipo de sangre', value: profile?.bloodType},
        {label: 'Ficha', value: profile?.Ficha},
        {label: 'Programa ', value: profile?.trainingProgram},
        {label: 'Centro', value: profile?.trainingCenter},
        {label: 'Regional', value: profile?.regional},
        {label: 'Rol', value: profile?.nameRole},
    ];
    
    return(
        <View>
            <CarnatTopbar
            navigation={navigation}
            studentName={studentName}
            studentInitial={studentInital}
            />

            <View style={[styles.section, { paddingHorizontal: px }]}>
            <Text style={[styles.sectionTitle, { fontSize: isDesktop ? 22 : 18 }]}>Mi Información</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#0F766E" style={{ marginTop: 24 }} />
            ) : profile ? (
              <View style={[styles.profileGrid, isDesktop && { flexDirection: 'row', flexWrap: 'wrap', gap: 16 }]}>
                {fields.map((f) => f.value ? (
                    <View key={f.label} style={[styles.fieldCard, isDesktop && { width: '47%' }]}>
                      <Text style={styles.fieldLabel}>{f.label}</Text>
                    <Text style={[styles.fieldValue, { fontSize: isDesktop ? 16 : 14 }]}>{f.value}</Text>
                  </View>
                ) : null)}
              </View>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>No se encontró información del perfil.</Text>
              </View>
            )}
          </View>
        </View>
    )


 }