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
import {College, Screen} from '../../types';
import {studentSignUp} from '../../services/authService';

type Props = {
  name: string; setName: (v: string) => void;
  rollNumber: string; setRollNumber: (v: string) => void;
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  confirmPassword: string; setConfirmPassword: (v: string) => void;
  showPassword: boolean; setShowPassword: (v: boolean) => void;
  showConfirmPassword: boolean; setShowConfirmPassword: (v: boolean) => void;
  selectedCollege: College | null; setSelectedCollege: (v: College | null) => void;
  collegeModalVisible: boolean; setCollegeModalVisible: (v: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setScreen: (screen: Screen) => void;
  reset: () => void;
};

const StudentSignUpScreen = (props: Props) => {
  const submit = async () => {
    const cleanName = props.name.trim();
    const cleanRoll = props.rollNumber.trim().toUpperCase();
    const cleanEmail = props.email.trim().toLowerCase();

    if (!cleanName) return Alert.alert('Missing Information', 'Please enter your full name.');
    if (!props.selectedCollege) return Alert.alert('Missing Information', 'Please select your college.');
    if (!cleanRoll) return Alert.alert('Missing Information', 'Please enter your roll number.');
    if (!cleanEmail) return Alert.alert('Missing Information', 'Please enter your email address.');
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return Alert.alert('Invalid Email', 'Please enter a valid email address.');
    }
    if (!props.password) return Alert.alert('Missing Information', 'Please create a password.');
    if (props.password.length < 6) {
      return Alert.alert('Invalid Password', 'Password must be at least 6 characters.');
    }
    if (props.password !== props.confirmPassword) {
      return Alert.alert('Password Mismatch', 'Passwords do not match.');
    }

    props.setLoading(true);
    try {
      await studentSignUp(cleanName, cleanRoll, cleanEmail, props.password, props.selectedCollege);
      props.reset();
      Alert.alert(
        'Account Created 🎉',
        'Your CampusFix student account has been created successfully. You can now sign in.',
        [{text: 'Sign In', onPress: () => props.setScreen('signin')}],
      );
    } catch (error: any) {
      let message = 'Unable to create your account.';
      if (error?.code === 'auth/email-already-in-use') {
        message = 'An account already exists with this email.';
      } else if (error?.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (error?.code === 'auth/weak-password') {
        message = 'Password is too weak.';
      } else if (error?.message) {
        message = error.message;
      }
      Alert.alert('Sign Up Failed', message);
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

          <Text style={styles.screenTitle}>Join CampusFix 🚀</Text>
          <Text style={styles.screenSubtitle}>Create your student account</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>College / Campus</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => props.setCollegeModalVisible(true)}>
              <Text style={props.selectedCollege ? styles.dropdownSelectedText : styles.dropdownPlaceholder}>
                {props.selectedCollege ? props.selectedCollege.name : 'Tap to select your college'}
              </Text>
              <Text style={styles.dropdownArrow}>⌄</Text>
            </TouchableOpacity>

            <Text style={styles.label}>Full Name</Text>
            <TextInput style={styles.input} placeholder="Enter your full name" placeholderTextColor="#9CA3AF"
              value={props.name} onChangeText={props.setName} autoCapitalize="words" />

            <Text style={styles.label}>Roll Number</Text>
            <TextInput style={styles.input} placeholder="Enter your college roll number" placeholderTextColor="#9CA3AF"
              value={props.rollNumber} onChangeText={v => props.setRollNumber(v.toUpperCase())} autoCapitalize="characters" />

            <Text style={styles.label}>Email Address</Text>
            <TextInput style={styles.input} placeholder="Enter your email address" placeholderTextColor="#9CA3AF"
              value={props.email} onChangeText={props.setEmail} autoCapitalize="none" keyboardType="email-address" />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} placeholder="Create a password" placeholderTextColor="#9CA3AF"
                value={props.password} onChangeText={props.setPassword} secureTextEntry={!props.showPassword} />
              <TouchableOpacity onPress={() => props.setShowPassword(!props.showPassword)}>
                <Text style={styles.showText}>{props.showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput style={styles.passwordInput} placeholder="Re-enter your password" placeholderTextColor="#9CA3AF"
                value={props.confirmPassword} onChangeText={props.setConfirmPassword}
                secureTextEntry={!props.showConfirmPassword} />
              <TouchableOpacity onPress={() => props.setShowConfirmPassword(!props.showConfirmPassword)}>
                <Text style={styles.showText}>{props.showConfirmPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <AppButton title="Create Account" onPress={submit} loading={props.loading} />
          </View>

          <View style={styles.bottomSwitch}>
            <Text style={styles.bottomSwitchText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => { props.reset(); props.setScreen('signin'); }}>
              <Text style={styles.bottomSwitchLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <CollegeModal
        visible={props.collegeModalVisible}
        onClose={() => props.setCollegeModalVisible(false)}
        selected={props.selectedCollege}
        onSelect={props.setSelectedCollege}
      />
    </SafeAreaView>
  );
};

export default StudentSignUpScreen;
