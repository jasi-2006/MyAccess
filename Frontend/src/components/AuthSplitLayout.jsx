import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

const logo = require('../assets/LogoMyAccess.png');
const students = require('../assets/students.png');

export default function AuthSplitLayout({ children, panelTitle, panelSubtitle, compact = false }) {
  const { width, height } = useWindowDimensions();
  const isSplit = width >= 900;
  const panelHeight = Math.max(height, 620);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            isSplit && { minHeight: panelHeight, flexDirection: 'row' },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.formPanel, isSplit ? styles.formPanelSplit : styles.formPanelMobile]}>
            <View style={[styles.formCard, compact && styles.formCardCompact]}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
              {children}
            </View>
          </View>

          {isSplit ? (
            <View style={[styles.brandPanel, { minHeight: panelHeight }]}>
              <View style={styles.brandCopy}>
                <Text style={styles.brandTitle}>{panelTitle}</Text>
                <Text style={styles.brandSubtitle}>{panelSubtitle}</Text>
              </View>
              <Image
                source={students}
                style={[styles.students, compact && styles.studentsCompact]}
                resizeMode="contain"
              />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboard: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
  },
  formPanel: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  formPanelSplit: {
    width: '50%',
    minHeight: '100%',
    paddingHorizontal: 30,
  },
  formPanelMobile: {
    flex: 1,
    minHeight: '100%',
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 28,
  },
  formCard: {
    width: '100%',
    maxWidth: 590,
    alignSelf: 'center',
  },
  formCardCompact: {
    maxWidth: 620,
  },
  logo: {
    width: 112,
    height: 42,
    marginBottom: 22,
  },
  brandPanel: {
    flex: 1,
    backgroundColor: '#079B72',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 44,
    paddingVertical: 54,
  },
  brandCopy: {
    alignItems: 'center',
    marginBottom: 54,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  brandSubtitle: {
    color: '#DFFCF1',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 16,
    maxWidth: 560,
    textAlign: 'center',
  },
  students: {
    width: '72%',
    maxWidth: 430,
    height: 230,
  },
  studentsCompact: {
    height: 200,
  },
});
