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
import {sendResetLink} from '../../services/authService';

type Props = {
  forgotEmail: string; setForgotEmail: (v: string) => void;
  forgotForAdmin: boolean;
  resetSent: boolean; setResetSent: (v: boolean) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setScreen: (screen: Screen) => void;
  setAdminEmail: (v: string) => void;
  setSignInId: (v: string) => void;
};

const ForgotPasswordScreen = (props: Props) => {
  const submit = async () => {
    const cleanEmail = props.forgotEmail.trim().toLowerCase();

    if (!cleanEmail) {
      Alert.alert('Email Required',
        `Please enter your registered ${props.forgotForAdmin ? 'admin' : 'student'} email address.`);
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    props.setLoading(true);
    try {
      const sentEmail = await sendResetLink(cleanEmail);
      props.setResetSent(true);
      props.setForgotEmail(sentEmail);
      if (props.forgotForAdmin) props.setAdminEmail(sentEmail);
      else props.setSignInId(sentEmail);
    } catch (error: any) {
      let message = 'Unable to send password reset email.';
      if (error?.code === 'auth/user-not-found') message = 'No account was found with this email address.';
      else if (error?.code === 'auth/invalid-email') message = 'Please enter a valid email address.';
      else if (error?.code === 'auth/too-many-requests') message = 'Too many reset requests. Please try again later.';
      else if (error?.message) message = error.message;
      Alert.alert('Password Reset Failed', message);
    } finally {
      props.setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.formScreenContainer} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={() => {
            props.setResetSent(false);
            props.setScreen(props.forgotForAdmin ? 'admin' : 'signin');
          }}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>

          <View style={styles.forgotLogo}><Text style={styles.forgotLogoText}>🔐</Text></View>

          {!props.resetSent ? (
            <>
              <Text style={styles.screenTitle}>Forgot Password?</Text>
              <Text style={styles.screenSubtitle}>
                {props.forgotForAdmin ? 'Reset your CampusFix admin password' : 'Reset your CampusFix student password'}
              </Text>

              <View style={styles.formCard}>
                <View style={styles.forgotInfoBox}>
                  <Text style={styles.forgotInfoIcon}>✉️</Text>
                  <View style={styles.forgotInfoContent}>
                    <Text style={styles.forgotInfoTitle}>Enter your registered email</Text>
                    <Text style={styles.forgotInfoText}>We will send you a secure password reset link.</Text>
                  </View>
                </View>

                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder={props.forgotForAdmin ? 'Enter admin email' : 'Enter student email'}
                  placeholderTextColor="#9CA3AF"
                  value={props.forgotEmail}
                  onChangeText={props.setForgotEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
                <AppButton title="Send Reset Link" onPress={submit} loading={props.loading} />
              </View>

              <Text style={styles.resetHint}>The reset link will be sent to your registered email address.</Text>
            </>
          ) : (
            <>
              <View style={styles.resetSuccessIcon}><Text style={styles.resetSuccessIconText}>✓</Text></View>
              <Text style={styles.screenTitle}>Check Your Email</Text>
              <Text style={styles.screenSubtitle}>Password reset link sent successfully</Text>

              <View style={styles.formCard}>
                <Text style={styles.resetSuccessTitle}>Reset link sent 📧</Text>
                <Text style={styles.resetSuccessText}>We sent a password reset link to:</Text>
                <Text style={styles.resetEmailText}>{props.forgotEmail}</Text>
                <Text style={styles.resetSuccessText}>
                  Open your email, tap the reset link, and create your new password.
                </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => {
                  props.setResetSent(false); props.setForgotEmail('');
                }}>
                  <Text style={styles.primaryButtonText}>Send Again</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.backToWelcome} onPress={() => {
                props.setResetSent(false);
                props.setScreen(props.forgotForAdmin ? 'admin' : 'signin');
              }}>
                <Text style={styles.backToWelcomeText}>
                  ← Back to {props.forgotForAdmin ? 'Admin Login' : 'Student Login'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
