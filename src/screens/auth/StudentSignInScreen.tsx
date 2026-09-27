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
import {styles} from '../../styles/authStyles';
import {Screen} from '../../types';
import {studentSignIn} from '../../services/authService';

type Props = {
  signInId: string;
  setSignInId: (value: string) => void;
  signInPassword: string;
  setSignInPassword: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setUser: (role: string, name: string, collegeId: string) => void;
  setScreen: (screen: Screen) => void;
  reset: () => void;
  openForgot: () => void;
};

const StudentSignInScreen = (props: Props) => {
  const submit = async () => {
    const input = props.signInId.trim();
    const password = props.signInPassword;

    if (!input) {
      Alert.alert('Missing Information', 'Please enter your email or roll number.');
      return;
    }
    if (!password) {
      Alert.alert('Missing Information', 'Please enter your password.');
      return;
    }

    props.setLoading(true);
    try {
      const result = await studentSignIn(input, password);
      props.setUser(result.userRole, result.userName, result.userCollegeId);
    } catch (error: any) {
      let message = 'Unable to sign in.';
      if (error?.code === 'auth/user-not-found') {
        message = 'No account found with these credentials.';
      } else if (
        error?.code === 'auth/wrong-password' ||
        error?.code === 'auth/invalid-credential'
      ) {
        message = 'Incorrect email/roll number or password.';
      } else if (error?.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (error?.code === 'auth/user-disabled') {
        message = 'This account has been disabled.';
      } else if (error?.message) {
        message = error.message;
      }
      Alert.alert('Sign In Failed', message);
    } finally {
      props.setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.formScreenContainer}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              props.reset();
              props.setScreen('welcome');
            }}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>

          <Text style={styles.screenTitle}>Welcome Back 👋</Text>
          <Text style={styles.screenSubtitle}>Sign in to continue to CampusFix</Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Email or Roll Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email or roll number"
              placeholderTextColor="#9CA3AF"
              value={props.signInId}
              onChangeText={props.setSignInId}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password"
                placeholderTextColor="#9CA3AF"
                value={props.signInPassword}
                onChangeText={props.setSignInPassword}
                secureTextEntry={!props.showPassword}
              />
              <TouchableOpacity onPress={() => props.setShowPassword(!props.showPassword)}>
                <Text style={styles.showText}>{props.showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotButton} onPress={props.openForgot}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <AppButton title="Sign In" onPress={submit} loading={props.loading} />
          </View>

          <View style={styles.bottomSwitch}>
            <Text style={styles.bottomSwitchText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => {
              props.reset();
              props.setScreen('signup');
            }}>
              <Text style={styles.bottomSwitchLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default StudentSignInScreen;
