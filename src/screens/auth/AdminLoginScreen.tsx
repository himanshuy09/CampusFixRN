import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AppButton from '../../components/AppButton';
import CollegeModal from '../../components/CollegeModal';
import {styles} from '../../styles/authStyles';
import {adminLogin} from '../../services/authService';
import {College, Screen} from '../../types';

type Props = {
  adminEmail: string; setAdminEmail: (v: string) => void;
  adminPassword: string; setAdminPassword: (v: string) => void;
  adminCollege: College | null; setAdminCollege: (v: College | null) => void;
  modalVisible: boolean; setModalVisible: (v: boolean) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setUser: (role: string, name: string, collegeId: string) => void;
  setScreen: (screen: Screen) => void;
  reset: () => void;
  openForgot: () => void;
};

const AdminLoginScreen = (props: Props) => {
  const submit = async () => {
    const cleanEmail = props.adminEmail.trim().toLowerCase();

    if (!props.adminCollege) return Alert.alert('Missing Information', 'Please select your college.');
    if (!cleanEmail) return Alert.alert('Missing Information', 'Please enter admin email.');
    if (!props.adminPassword) return Alert.alert('Missing Information', 'Please enter your password.');

    props.setLoading(true);
    try {
      const result = await adminLogin(cleanEmail, props.adminPassword, props.adminCollege);
      props.setUser(result.userRole, result.userName, result.userCollegeId);
    } catch (error: any) {
      let message = 'Unable to login as admin.';
      if (error?.code === 'auth/user-not-found') message = 'No admin account found.';
      else if (error?.code === 'auth/wrong-password' || error?.code === 'auth/invalid-credential') message = 'Incorrect admin email or password.';
      else if (error?.code === 'auth/invalid-email') message = 'Please enter a valid email address.';
      else if (error?.message) message = error.message;
      Alert.alert('Admin Login Failed', message);
    } finally {
      props.setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.formScreenContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => {
            props.reset(); props.setScreen('welcome');
          }}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.adminLogo}><Text style={styles.adminLogoText}>🔐</Text></View>
          <Text style={styles.screenTitle}>Admin Portal</Text>
          <Text style={styles.screenSubtitle}>Authorized campus administrators only</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>College / Campus</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => props.setModalVisible(true)}>
              <Text style={props.adminCollege ? styles.dropdownSelectedText : styles.dropdownPlaceholder}>
                {props.adminCollege ? props.adminCollege.name : 'Tap to select your college'}
              </Text>
              <Text style={styles.dropdownArrow}>⌄</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Admin Email</Text>
            <TextInput style={styles.input} placeholder="Enter admin email" placeholderTextColor="#9CA3AF"
              value={props.adminEmail} onChangeText={props.setAdminEmail} autoCapitalize="none"
              keyboardType="email-address" />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} placeholder="Enter admin password" placeholderTextColor="#9CA3AF"
                value={props.adminPassword} onChangeText={props.setAdminPassword}
                secureTextEntry={!props.showPassword} />
              <TouchableOpacity onPress={() => props.setShowPassword(!props.showPassword)}>
                <Text style={styles.showText}>{props.showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotButton} onPress={props.openForgot}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AppButton title="Admin Login" onPress={submit} loading={props.loading} />
          </View>

          <TouchableOpacity style={styles.backToWelcome} onPress={() => props.setScreen('welcome')}>
            <Text style={styles.backToWelcomeText}>← Back to CampusFix</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <CollegeModal
        visible={props.modalVisible}
        onClose={() => props.setModalVisible(false)}
        selected={props.adminCollege}
        onSelect={props.setAdminCollege}
      />
    </SafeAreaView>
  );
};

export default AdminLoginScreen;
