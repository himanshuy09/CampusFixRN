import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  BackHandler,
} from 'react-native';

import {College} from './src/constants/colleges';
import {
  studentSignIn as signInStudent,
  studentSignUp as signUpStudent,
  adminLogin as loginAdmin,
  forgotPassword as sendForgotPassword,
  logoutUser,
} from './src/services/authService';

import CollegeModal from './src/components/CollegeModal';
import SplashScreen from './src/screens/SplashScreen';
import AppButton from './src/components/AppButton';
import StudentDashboardScreen from './src/screens/student/StudentDashboardScreen';
import ReportComplaintScreen from './src/screens/student/ReportComplaintScreen';
import MyComplaintsScreen from './src/screens/student/MyComplaintsScreen';
import ComplaintDetailsScreen from './src/screens/student/ComplaintDetailsScreen';
import NotificationsScreen from './src/screens/student/NotificationsScreen';
import StudentProfileScreen from './src/screens/student/StudentProfileScreen';
import AdminDashboardScreen from './src/screens/admin/AdminDashboardScreen';
import AdminComplaintsScreen from './src/screens/admin/AdminComplaintsScreen';
import AdminComplaintDetailsScreen from './src/screens/admin/AdminComplaintDetailsScreen';
import AdminNotificationsScreen from './src/screens/admin/AdminNotificationsScreen';
import AdminProfileScreen from './src/screens/admin/AdminProfileScreen';
import {auth, firestore} from './src/firebase/config';
import {doc, getDoc} from '@react-native-firebase/firestore';
import {authStyles as styles} from './src/styles/authStyles';

type Screen =
  | 'welcome'
  | 'signin'
  | 'signup'
  | 'admin'
  | 'forgot';

const App = () => {
  // ============================================================
  // APP SPLASH
  // ============================================================

  // Show the animated CampusFix splash before the main app.
  const [showSplash, setShowSplash] = useState(true);

  // ============================================================
  // SCREEN
  // ============================================================

  const [screen, setScreen] =
    useState<Screen>('welcome');

  // ============================================================
  // COMMON
  // ============================================================

  const [loading, setLoading] = useState(false);

  // ============================================================
  // SIGN IN
  // ============================================================

  const [signInId, setSignInId] = useState('');
  const [signInPassword, setSignInPassword] =
    useState('');
  const [showSignInPassword, setShowSignInPassword] =
    useState(false);

  // ============================================================
  // SIGN UP
  // ============================================================

  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [email, setEmail] = useState('');
  const [signUpPassword, setSignUpPassword] =
    useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showSignUpPassword, setShowSignUpPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [selectedCollege, setSelectedCollege] =
    useState<College | null>(null);

  const [collegeModalVisible, setCollegeModalVisible] =
    useState(false);

  // ============================================================
  // ADMIN LOGIN
  // ============================================================

  const [adminEmail, setAdminEmail] =
    useState('');
  const [adminPassword, setAdminPassword] =
    useState('');

  const [adminCollege, setAdminCollege] =
    useState<College | null>(null);

  const [adminCollegeModalVisible, setAdminCollegeModalVisible] =
    useState(false);

  const [showAdminPassword, setShowAdminPassword] =
    useState(false);

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotForAdmin, setForgotForAdmin] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // ============================================================
  // LOGGED-IN USER
  // ============================================================

  const [loggedIn, setLoggedIn] =
    useState(false);

  const [userRole, setUserRole] =
    useState('');

  const [userName, setUserName] =
    useState('');

  const [userCollegeId, setUserCollegeId] =
    useState('');

  // ============================================================
  // STUDENT APP PAGE
  // ============================================================

  const [studentPage, setStudentPage] =
    useState<
      | 'dashboard'
      | 'report'
      | 'complaints'
      | 'complaintDetails'
      | 'notifications'
      | 'profile'
    >('dashboard');

  const [selectedComplaint, setSelectedComplaint] =
    useState<any | null>(null);

  const [adminPage, setAdminPage] = useState<
    'dashboard' | 'complaints' | 'complaintDetails' | 'notifications' | 'profile'
  >('dashboard');

  // Android Back Navigation
  useEffect(() => {
    const onBackPress = () => {
      if (!loggedIn) {
        if (screen === 'signin' || screen === 'signup' || screen === 'admin') {
          setScreen('welcome');
          return true;
        }

        if (screen === 'forgot') {
          setResetSent(false);
          setScreen(forgotForAdmin ? 'admin' : 'signin');
          return true;
        }

        return false;
      }

      if (userRole.toLowerCase() === 'student') {
        if (studentPage === 'complaintDetails') {
          setStudentPage('complaints');
          return true;
        }

        if (studentPage === 'notifications') {
          setStudentPage('dashboard');
          return true;
        }

        if (studentPage === 'profile') {
          setStudentPage('dashboard');
          return true;
        }

        if (studentPage === 'report' || studentPage === 'complaints') {
          setStudentPage('dashboard');
          return true;
        }

        // Dashboard is the logged-in root.
        // Going back logs the user out and returns to Welcome.
        logout();
        return true;
      }

      // Admin navigation: Notifications -> Dashboard.
      if (adminPage === 'notifications') {
        setAdminPage('dashboard');
        return true;
      }

      // Admin navigation: Profile -> Dashboard.
      if (adminPage === 'profile') {
        setAdminPage('dashboard');
        return true;
      }

      // Admin navigation: Details -> Complaints -> Dashboard -> Welcome.
      if (adminPage === 'complaintDetails') {
        setAdminPage('complaints');
        return true;
      }

      if (adminPage === 'complaints') {
        setAdminPage('dashboard');
        return true;
      }

      // Admin dashboard is the logged-in root.
      logout();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => subscription.remove();
  }, [loggedIn, screen, forgotForAdmin, studentPage, userRole, adminPage]);

  // ============================================================
  // ANDROID BACK NAVIGATION
  // ============================================================

  useEffect(() => {
    const handleBackPress = () => {
      // Logged-in student: Report Complaint -> Dashboard
      if (loggedIn && userRole.toLowerCase() === 'student') {
        if (studentPage === 'complaintDetails') {
          setStudentPage('complaints');
          return true;
        }

        if (studentPage === 'notifications') {
          setStudentPage('dashboard');
          return true;
        }

        if (studentPage === 'profile') {
          setStudentPage('dashboard');
          return true;
        }

        if (studentPage === 'report' || studentPage === 'complaints') {
          setStudentPage('dashboard');
          return true;
        }

        // Dashboard is the root of the student app.
        // Returning false lets Android handle the normal exit behavior.
        return false;
      }

      // Logged-in admin: Notifications -> Dashboard.
      if (loggedIn && userRole.toLowerCase() !== 'student') {
        if (adminPage === 'notifications') {
          setAdminPage('dashboard');
          return true;
        }

        if (adminPage === 'profile') {
          setAdminPage('dashboard');
          return true;
        }

        if (adminPage === 'complaintDetails') {
          setAdminPage('complaints');
          return true;
        }

        if (adminPage === 'complaints') {
          setAdminPage('dashboard');
          return true;
        }

        // Admin dashboard is the root; let the first back handler
        // perform logout so the user returns to Welcome.
        return false;
      }

      // Auth screens -> Welcome screen
      if (!loggedIn) {
        if (screen === 'signin' || screen === 'signup' || screen === 'admin') {
          setScreen('welcome');
          return true;
        }

        if (screen === 'forgot') {
          setResetSent(false);
          setScreen(forgotForAdmin ? 'admin' : 'signin');
          return true;
        }
      }

      // Welcome screen / unknown root: use Android default behavior.
      return false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => subscription.remove();
  }, [
    loggedIn,
    userRole,
    studentPage,
    screen,
    forgotForAdmin,
    adminPage,
  ]);

  // ============================================================
  // RESET FORMS
  // ============================================================

  const resetSignIn = () => {
    setSignInId('');
    setSignInPassword('');
    setShowSignInPassword(false);
  };

  const resetSignUp = () => {
    setName('');
    setRollNumber('');
    setEmail('');
    setSignUpPassword('');
    setConfirmPassword('');
    setSelectedCollege(null);
    setShowSignUpPassword(false);
    setShowConfirmPassword(false);
  };

  const resetAdmin = () => {
    setAdminEmail('');
    setAdminPassword('');
    setAdminCollege(null);
    setShowAdminPassword(false);
  };

  // ============================================================
  // STUDENT SIGN IN
  // Email OR Roll Number + Password
  // ============================================================

  const studentSignIn = async () => {
    const input = signInId.trim();
    const password = signInPassword;

    if (!input) {
      Alert.alert('Missing Information', 'Please enter your email or roll number.');
      return;
    }

    if (!password) {
      Alert.alert('Missing Information', 'Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await signInStudent(input, password);
      setUserRole(result.role);
      setUserName(result.name);
      setUserCollegeId(result.collegeId);
      setLoggedIn(true);
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
      setLoading(false);
    }
  };

  // ============================================================
  // STUDENT SIGN UP
  // ============================================================

  const studentSignUp = async () => {
    const cleanName = name.trim();
    const cleanRoll = rollNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      Alert.alert('Missing Information', 'Please enter your full name.');
      return;
    }

    if (!selectedCollege) {
      Alert.alert('Missing Information', 'Please select your college.');
      return;
    }

    if (!cleanRoll) {
      Alert.alert('Missing Information', 'Please enter your roll number.');
      return;
    }

    if (!cleanEmail) {
      Alert.alert('Missing Information', 'Please enter your email address.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (!signUpPassword) {
      Alert.alert('Missing Information', 'Please create a password.');
      return;
    }

    if (signUpPassword.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters.');
      return;
    }

    if (signUpPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await signUpStudent(
        cleanName,
        cleanRoll,
        cleanEmail,
        signUpPassword,
        selectedCollege,
      );

      resetSignUp();

      Alert.alert(
        'Account Created 🎉',
        'Your CampusFix student account has been created successfully. You can now sign in.',
        [{text: 'Sign In', onPress: () => setScreen('signin')}],
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
      setLoading(false);
    }
  };

  // ============================================================

  const adminLogin = async () => {
    const cleanEmail = adminEmail.trim().toLowerCase();

    if (!adminCollege) {
      Alert.alert('Missing Information', 'Please select your college.');
      return;
    }

    if (!cleanEmail) {
      Alert.alert('Missing Information', 'Please enter admin email.');
      return;
    }

    if (!adminPassword) {
      Alert.alert('Missing Information', 'Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const result = await loginAdmin(
        cleanEmail,
        adminPassword,
        adminCollege,
      );

      setUserRole(result.role);
      setUserName(result.name);
      setUserCollegeId(result.collegeId);
      setLoggedIn(true);
    } catch (error: any) {
      let message = 'Unable to login as admin.';

      if (error?.code === 'auth/user-not-found') {
        message = 'No admin account found.';
      } else if (
        error?.code === 'auth/wrong-password' ||
        error?.code === 'auth/invalid-credential'
      ) {
        message = 'Incorrect admin email or password.';
      } else if (error?.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (error?.message) {
        message = error.message;
      }

      Alert.alert('Admin Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORGOT PASSWORD
  // ============================================================

  const openForgotPassword = (isAdmin: boolean) => {
    setForgotForAdmin(isAdmin);
    setForgotEmail(
      isAdmin
        ? adminEmail.trim().toLowerCase()
        : signInId.includes('@')
        ? signInId.trim().toLowerCase()
        : '',
    );
    setResetSent(false);
    setScreen('forgot');
  };

  const sendResetLink = async () => {
    const cleanEmail = forgotEmail.trim().toLowerCase();

    if (!cleanEmail) {
      Alert.alert(
        'Email Required',
        `Please enter your registered ${
          forgotForAdmin ? 'admin' : 'student'
        } email address.`,
      );
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      await sendForgotPassword(cleanEmail);

      setResetSent(true);
      setForgotEmail(cleanEmail);

      if (forgotForAdmin) {
        setAdminEmail(cleanEmail);
      } else {
        setSignInId(cleanEmail);
      }
    } catch (error: any) {
      let message = 'Unable to send password reset email.';

      if (error?.code === 'auth/user-not-found') {
        message = 'No account was found with this email address.';
      } else if (error?.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (error?.code === 'auth/too-many-requests') {
        message = 'Too many reset requests. Please try again later.';
      } else if (error?.message) {
        message = error.message;
      }

      Alert.alert('Password Reset Failed', message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = async () => {
    try {
      await logoutUser();

      setLoggedIn(false);
      setUserRole('');
      setUserName('');
      setUserCollegeId('');
      setStudentPage('dashboard');
      setAdminPage('dashboard');
      setSelectedComplaint(null);
      setAdminPage('dashboard');

      resetSignIn();
      resetSignUp();
      resetAdmin();

      setScreen('welcome');
    } catch {
      Alert.alert('Error', 'Unable to logout.');
    }
  };


  // ============================================================
  // ACCOUNT DELETED
  // ============================================================

  const handleAccountDeleted = () => {
    // Firebase Auth account has already been deleted.
    // Only reset local app state; do NOT call logoutUser().
    setLoggedIn(false);
    setUserRole('');
    setUserName('');
    setUserCollegeId('');
    setStudentPage('dashboard');
    setAdminPage('dashboard');
    setSelectedComplaint(null);

    resetSignIn();
    resetSignUp();
    resetAdmin();

    setResetSent(false);
    setForgotEmail('');
    setScreen('welcome');
  };

  // ============================================================
    // ----------------------------------------------------------
  // FORGOT PASSWORD
  // ----------------------------------------------------------

// COLLEGE SELECTOR
  // ============================================================

  // ============================================================
  // ANIMATED APP SPLASH
  // ============================================================

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => setShowSplash(false)}
      />
    );
  }

  // ============================================================
  // WELCOME SCREEN
  // ============================================================

  if (
    screen === 'welcome' &&
    !loggedIn
  ) {
    return (
      <SafeAreaView
        style={styles.container}>

        <ScrollView
          contentContainerStyle={
            styles.welcomeContainer
          }>

          <View style={styles.welcomeLogo}>
            <Image
              source={require('./assets/campusfix_logo.png')}
              style={styles.welcomeLogoImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.welcomeTitle}>
            CampusFix
          </Text>

          <View
            style={styles.welcomeButtons}>

            <TouchableOpacity
              style={
                styles.primaryButton
              }
              onPress={() =>
                setScreen('signin')
              }>

              <Text
                style={
                  styles.primaryButtonText
                }>
                Sign In
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.outlineButton
              }
              onPress={() =>
                setScreen('signup')
              }>

              <Text
                style={
                  styles.outlineButtonText
                }>
                Create Account
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.adminButton
              }
              onPress={() =>
                setScreen('admin')
              }>

              <Text
                style={
                  styles.adminButtonText
                }>
                🔐  Admin Login
              </Text>

            </TouchableOpacity>

          </View>

          <Text style={styles.footerText}>
            Campus Complaint Management System
          </Text>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // ============================================================
  // STUDENT SIGN IN SCREEN
  // ============================================================

  if (
    screen === 'signin' &&
    !loggedIn
  ) {
    return (
      <SafeAreaView
        style={styles.container}>

        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }>

          <ScrollView
            contentContainerStyle={
              styles.formScreenContainer
            }
            keyboardShouldPersistTaps="handled">

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                resetSignIn();
                setScreen('welcome');
              }}>

              <Text
                style={styles.backButtonText}>
                ‹
              </Text>

            </TouchableOpacity>

            <Text
              style={styles.screenTitle}>
              Welcome Back 👋
            </Text>

            <Text
              style={styles.screenSubtitle}>
              Sign in to continue to CampusFix
            </Text>

            <View
              style={styles.formCard}>

              <Text
                style={styles.label}>
                Email or Roll Number
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter email or roll number"
                placeholderTextColor="#9CA3AF"
                value={signInId}
                onChangeText={setSignInId}
                autoCapitalize="none"
              />

              <Text
                style={styles.label}>
                Password
              </Text>

              <View
                style={
                  styles.passwordContainer
                }>

                <TextInput
                  style={
                    styles.passwordInput
                  }
                  placeholder="Enter password"
                  placeholderTextColor="#9CA3AF"
                  value={signInPassword}
                  onChangeText={
                    setSignInPassword
                  }
                  secureTextEntry={
                    !showSignInPassword
                  }
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowSignInPassword(
                      !showSignInPassword,
                    )
                  }>

                  <Text
                    style={
                      styles.showText
                    }>
                    {showSignInPassword
                      ? 'Hide'
                      : 'Show'}
                  </Text>

                </TouchableOpacity>

              </View>

              <TouchableOpacity
                style={
                  styles.forgotButton
                }
                onPress={() => openForgotPassword(false)}>

                <Text
                  style={
                    styles.forgotText
                  }>
                  Forgot Password?
                </Text>

              </TouchableOpacity>

              <AppButton
                title="Sign In"
                onPress={studentSignIn}
                loading={loading}
              />

            </View>

            <View
              style={
                styles.bottomSwitch
              }>

              <Text
                style={
                  styles.bottomSwitchText
                }>
                Don't have an account?
              </Text>

              <TouchableOpacity
                onPress={() => {
                  resetSignIn();
                  setScreen('signup');
                }}>

                <Text
                  style={
                    styles.bottomSwitchLink
                  }>
                  Sign Up
                </Text>

              </TouchableOpacity>

            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // ============================================================
    // ============================================================
  // FORGOT PASSWORD SCREEN
  // ============================================================

  if (screen === 'forgot' && !loggedIn) {
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
                setResetSent(false);
                setScreen(forgotForAdmin ? 'admin' : 'signin');
              }}>
              <Text style={styles.backButtonText}>‹</Text>
            </TouchableOpacity>

            <View style={styles.forgotLogo}>
              <Text style={styles.forgotLogoText}>🔐</Text>
            </View>

            {!resetSent ? (
              <>
                <Text style={styles.screenTitle}>Forgot Password?</Text>

                <Text style={styles.screenSubtitle}>
                  {forgotForAdmin
                    ? 'Reset your CampusFix admin password'
                    : 'Reset your CampusFix student password'}
                </Text>

                <View style={styles.formCard}>
                  <View style={styles.forgotInfoBox}>
                    <Text style={styles.forgotInfoIcon}>✉️</Text>
                    <View style={styles.forgotInfoContent}>
                      <Text style={styles.forgotInfoTitle}>
                        Enter your registered email
                      </Text>
                      <Text style={styles.forgotInfoText}>
                        We will send you a secure password reset link.
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.label}>Email Address</Text>

                  <TextInput
                    style={styles.input}
                    placeholder={forgotForAdmin ? 'Enter admin email' : 'Enter student email'}
                    placeholderTextColor="#9CA3AF"
                    value={forgotEmail}
                    onChangeText={setForgotEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                  />

                  <AppButton title="Send Reset Link" onPress={sendResetLink} loading={loading} />
                </View>

                <Text style={styles.resetHint}>
                  The reset link will be sent to your registered email address.
                </Text>
              </>
            ) : (
              <>
                <View style={styles.resetSuccessIcon}>
                  <Text style={styles.resetSuccessIconText}>✓</Text>
                </View>

                <Text style={styles.screenTitle}>Check Your Email</Text>

                <Text style={styles.screenSubtitle}>
                  Password reset link sent successfully
                </Text>

                <View style={styles.formCard}>
                  <Text style={styles.resetSuccessTitle}>Reset link sent 📧</Text>

                  <Text style={styles.resetSuccessText}>
                    We sent a password reset link to:
                  </Text>

                  <Text style={styles.resetEmailText}>{forgotEmail}</Text>

                  <Text style={styles.resetSuccessText}>
                    Open your email, tap the reset link, and create your new password.
                  </Text>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      setResetSent(false);
                      setForgotEmail('');
                    }}>
                    <Text style={styles.primaryButtonText}>Send Again</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.backToWelcome}
                  onPress={() => {
                    setResetSent(false);
                    setScreen(forgotForAdmin ? 'admin' : 'signin');
                  }}>
                  <Text style={styles.backToWelcomeText}>
                    ← Back to {forgotForAdmin ? 'Admin Login' : 'Student Login'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

// STUDENT SIGN UP SCREEN
  // ============================================================

  if (
    screen === 'signup' &&
    !loggedIn
  ) {
    return (
      <SafeAreaView
        style={styles.container}>

        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }>

          <ScrollView
            contentContainerStyle={
              styles.formScreenContainer
            }
            keyboardShouldPersistTaps="handled">

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                resetSignUp();
                setScreen('welcome');
              }}>

              <Text
                style={styles.backButtonText}>
                ‹
              </Text>

            </TouchableOpacity>

            <Text
              style={styles.screenTitle}>
              Join CampusFix 🚀
            </Text>

            <Text
              style={styles.screenSubtitle}>
              Create your student account
            </Text>

            <View
              style={styles.formCard}>

              {/* College */}

              <Text
                style={styles.label}>
                College / Campus
              </Text>

              <TouchableOpacity
                style={
                  styles.dropdownButton
                }
                onPress={() =>
                  setCollegeModalVisible(
                    true,
                  )
                }>

                <Text
                  style={
                    selectedCollege
                      ? styles.dropdownSelectedText
                      : styles.dropdownPlaceholder
                  }>
                  {selectedCollege
                    ? selectedCollege.name
                    : 'Tap to select your college'}
                </Text>

                <Text
                  style={
                    styles.dropdownArrow
                  }>
                 ⌄
                </Text>

              </TouchableOpacity>

              {/* Name */}

              <Text
                style={styles.label}>
                Full Name
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              {/* Roll Number */}

              <Text
                style={styles.label}>
                Roll Number
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your college roll number"
                placeholderTextColor="#9CA3AF"
                value={rollNumber}
                onChangeText={value =>
                  setRollNumber(
                    value.toUpperCase(),
                  )
                }
                autoCapitalize="characters"
              />

              {/* Email */}

              <Text
                style={styles.label}>
                Email Address
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              {/* Password */}

              <Text
                style={styles.label}>
                Password
              </Text>

              <View
                style={
                  styles.passwordContainer
                }>

                <TextInput
                  style={
                    styles.passwordInput
                  }
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  value={signUpPassword}
                  onChangeText={
                    setSignUpPassword
                  }
                  secureTextEntry={
                    !showSignUpPassword
                  }
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowSignUpPassword(
                      !showSignUpPassword,
                    )
                  }>

                  <Text
                    style={
                      styles.showText
                    }>
                    {showSignUpPassword
                      ? 'Hide'
                      : 'Show'}
                  </Text>

                </TouchableOpacity>

              </View>

              {/* Confirm Password */}

              <Text
                style={styles.label}>
                Confirm Password
              </Text>

              <View
                style={
                  styles.passwordContainer
                }>

                <TextInput
                  style={
                    styles.passwordInput
                  }
                  placeholder="Re-enter your password"
                  placeholderTextColor="#9CA3AF"
                  value={confirmPassword}
                  onChangeText={
                    setConfirmPassword
                  }
                  secureTextEntry={
                    !showConfirmPassword
                  }
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword,
                    )
                  }>

                  <Text
                    style={
                      styles.showText
                    }>
                    {showConfirmPassword
                      ? 'Hide'
                      : 'Show'}
                  </Text>

                </TouchableOpacity>

              </View>

              <AppButton
                title="Create Account"
                onPress={studentSignUp}
                loading={loading}
              />

            </View>

            <View
              style={
                styles.bottomSwitch
              }>

              <Text
                style={
                  styles.bottomSwitchText
                }>
                Already have an account?
              </Text>

              <TouchableOpacity
                onPress={() => {
                  resetSignUp();
                  setScreen('signin');
                }}>

                <Text
                  style={
                    styles.bottomSwitchLink
                  }>
                  Sign In
                </Text>

              </TouchableOpacity>

            </View>

          </ScrollView>

        </KeyboardAvoidingView>

        <CollegeModal
          visible={
            collegeModalVisible
          }
          onClose={() =>
            setCollegeModalVisible(
              false,
            )
          }
          selected={
            selectedCollege
          }
          onSelect={(college: College) =>
            setSelectedCollege(
              college,
            )
          }
        />

      </SafeAreaView>
    );
  }

  // ============================================================
  // ADMIN LOGIN SCREEN
  // ============================================================

  if (
    screen === 'admin' &&
    !loggedIn
  ) {
    return (
      <SafeAreaView
        style={styles.container}>

        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }>

          <ScrollView
            contentContainerStyle={
              styles.formScreenContainer
            }
            keyboardShouldPersistTaps="handled">

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                resetAdmin();
                setScreen('welcome');
              }}>

              <Text
                style={styles.backButtonText}>
                ‹
              </Text>

            </TouchableOpacity>

            <View
              style={
                styles.adminLogo
              }>
              <Text
                style={
                  styles.adminLogoText
                }>
                🔐
              </Text>
            </View>

            <Text
              style={styles.screenTitle}>
              Admin Portal
            </Text>

            <Text
              style={styles.screenSubtitle}>
              Authorized campus administrators only
            </Text>

            <View
              style={styles.formCard}>

              {/* College */}

              <Text
                style={styles.label}>
                College / Campus
              </Text>

              <TouchableOpacity
                style={
                  styles.dropdownButton
                }
                onPress={() =>
                  setAdminCollegeModalVisible(
                    true,
                  )
                }>

                <Text
                  style={
                    adminCollege
                      ? styles.dropdownSelectedText
                      : styles.dropdownPlaceholder
                  }>
                  {adminCollege
                    ? adminCollege.name
                    : 'Tap to select your college'}
                </Text>

                <Text
                  style={
                    styles.dropdownArrow
                  }>
                 ⌄
                </Text>

              </TouchableOpacity>

              {/* Email */}

              <Text
                style={styles.label}>
                Admin Email
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Enter admin email"
                placeholderTextColor="#9CA3AF"
                value={adminEmail}
                onChangeText={
                  setAdminEmail
                }
                autoCapitalize="none"
                keyboardType="email-address"
              />

              {/* Password */}

              <Text
                style={styles.label}>
                Password
              </Text>

              <View
                style={
                  styles.passwordContainer
                }>

                <TextInput
                  style={
                    styles.passwordInput
                  }
                  placeholder="Enter admin password"
                  placeholderTextColor="#9CA3AF"
                  value={adminPassword}
                  onChangeText={
                    setAdminPassword
                  }
                  secureTextEntry={
                    !showAdminPassword
                  }
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowAdminPassword(
                      !showAdminPassword,
                    )
                  }>

                  <Text
                    style={
                      styles.showText
                    }>
                    {showAdminPassword
                      ? 'Hide'
                      : 'Show'}
                  </Text>

                </TouchableOpacity>

              </View>

              <TouchableOpacity
                style={styles.forgotButton}
                onPress={() => openForgotPassword(true)}>

                <Text style={styles.forgotText}>
                  Forgot Password?
                </Text>

              </TouchableOpacity>

              <AppButton
                title="Admin Login"
                onPress={adminLogin}
                loading={loading}
              />

            </View>

            <TouchableOpacity
              style={
                styles.backToWelcome
              }
              onPress={() =>
                setScreen('welcome')
              }>

              <Text
                style={
                  styles.backToWelcomeText
                }>
                ← Back to CampusFix
              </Text>

            </TouchableOpacity>

          </ScrollView>

        </KeyboardAvoidingView>

        <CollegeModal
          visible={
            adminCollegeModalVisible
          }
          onClose={() =>
            setAdminCollegeModalVisible(
              false,
            )
          }
          selected={
            adminCollege
          }
          onSelect={(college: College) =>
            setAdminCollege(
              college,
            )
          }
        />

      </SafeAreaView>
    );
  }

  // ============================================================
// LOGGED-IN DASHBOARD
// ============================================================

if (loggedIn) {
  if (userRole.toLowerCase() === 'student') {
    if (studentPage === 'report') {
      return (
        <ReportComplaintScreen
          onBack={() => setStudentPage('dashboard')}
        />
      );
    }

    if (studentPage === 'notifications') {
      return (
        <NotificationsScreen
          onBack={() => setStudentPage('dashboard')}
        />
      );
    }

    if (studentPage === 'profile') {
      return (
        <StudentProfileScreen
          onBack={() => setStudentPage('dashboard')}
          onMyComplaints={() => setStudentPage('complaints')}
          onNotifications={() => setStudentPage('notifications')}
          onLogout={logout}
          onAccountDeleted={handleAccountDeleted}
        />
      );
    }

    if (studentPage === 'complaintDetails' && selectedComplaint) {
      return (
        <ComplaintDetailsScreen
          complaint={selectedComplaint}
          onBack={() => setStudentPage('complaints')}
        />
      );
    }

    if (studentPage === 'complaints') {
      return (
        <MyComplaintsScreen
          onBack={() => setStudentPage('dashboard')}
          onComplaintPress={complaint => {
            setSelectedComplaint(complaint);
            setStudentPage('complaintDetails');
          }}
        />
      );
    }

    return (
      <StudentDashboardScreen
        userName={userName}
        userCollegeId={userCollegeId}
        onReportComplaint={() => {
          setStudentPage('report');
        }}
        onMyComplaints={() => {
          setStudentPage('complaints');
        }}
        onNotifications={() => {
          setStudentPage('notifications');
        }}
        onProfile={() => {
          setStudentPage('profile');
        }}
        onLogout={logout}
      />
    );
  }

  if (adminPage === 'notifications') {
    return (
      <AdminNotificationsScreen
        adminId={auth.currentUser?.uid || ''}
        collegeId={userCollegeId}
        onBack={() => setAdminPage('dashboard')}
        onComplaintPress={async complaintId => {
          try {
            const complaintSnapshot = await getDoc(
              doc(firestore, 'complaints', complaintId),
            );

            if (!complaintSnapshot.exists()) {
              Alert.alert(
                'Complaint Not Found',
                'This complaint is no longer available.',
              );
              return;
            }

            setSelectedComplaint({
              id: complaintSnapshot.id,
              ...complaintSnapshot.data(),
            });
            setAdminPage('complaintDetails');
          } catch (error) {
            console.error(
              'Admin notification complaint open error:',
              error,
            );
            Alert.alert(
              'Unable to Open Complaint',
              'Something went wrong while opening this complaint.',
            );
          }
        }}
      />
    );
  }

  if (adminPage === 'profile') {
    return (
      <AdminProfileScreen
        collegeId={userCollegeId}
        userName={userName}
        onBack={() => setAdminPage('dashboard')}
        onLogout={logout}
      />
    );
  }

  if (adminPage === 'complaintDetails' && selectedComplaint) {
    return (
      <AdminComplaintDetailsScreen
        complaint={selectedComplaint}
        collegeId={userCollegeId}
        onBack={() => setAdminPage('complaints')}
      />
    );
  }

  if (adminPage === 'complaints') {
    return (
      <AdminComplaintsScreen
        collegeId={userCollegeId}
        onBack={() => setAdminPage('dashboard')}
        onComplaintPress={complaint => {
          setSelectedComplaint(complaint);
          setAdminPage('complaintDetails');
        }}
      />
    );
  }

  return (
    <AdminDashboardScreen
      collegeId={userCollegeId}
      userName={userName}
      onComplaints={() => setAdminPage('complaints')}
      onNotifications={() => {
        setAdminPage('notifications');
      }}
      onProfile={() => {
        setAdminPage('profile');
      }}
      onLogout={logout}
    />
  );
}

  return null;
};

export default App;
 