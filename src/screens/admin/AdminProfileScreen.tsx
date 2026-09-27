import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {doc, getDoc} from '@react-native-firebase/firestore';
import {sendPasswordResetEmail} from '@react-native-firebase/auth';
import {auth, firestore} from '../../firebase/config';

type Props = {
  collegeId: string;
  userName: string;
  onBack: () => void;
  onLogout: () => void;
};

type AdminProfile = {
  name?: string;
  email?: string;
  role?: string;
  collegeId?: string;
  userId?: string;
  createdAt?: any;
};

const AdminProfileScreen = ({
  collegeId,
  userName,
  onBack,
  onLogout,
}: Props) => {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [collegeName, setCollegeName] = useState('');
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);

  const loadProfile = async () => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const userSnapshot = await getDoc(
        doc(firestore, 'users', currentUser.uid),
      );

      if (userSnapshot.exists()) {
        const data = userSnapshot.data() as AdminProfile;
        setProfile({
          ...data,
          email: data.email || currentUser.email || '',
          name: data.name || userName,
          collegeId: data.collegeId || collegeId,
          userId: data.userId || currentUser.uid,
        });
      } else {
        setProfile({
          name: userName,
          email: currentUser.email || '',
          role: 'admin',
          collegeId,
          userId: currentUser.uid,
        });
      }

      if (collegeId) {
        const collegeSnapshot = await getDoc(
          doc(firestore, 'colleges', collegeId),
        );

        if (collegeSnapshot.exists()) {
          const collegeData = collegeSnapshot.data() as {
            name?: string;
          };
          setCollegeName(collegeData.name || '');
        }
      }
    } catch (error) {
      console.error('Admin profile load error:', error);
      Alert.alert(
        'Unable to Load Profile',
        'Some profile information could not be loaded.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [collegeId, userName]);

  const handlePasswordReset = () => {
    const currentEmail =
      profile?.email || auth.currentUser?.email || '';

    if (!currentEmail) {
      Alert.alert(
        'Email Not Available',
        'No registered admin email was found for this account.',
      );
      return;
    }

    Alert.alert(
      'Reset Password',
      `A password reset link will be sent to:\n\n${currentEmail}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Reset Link',
          onPress: async () => {
            try {
              setResetLoading(true);

              await sendPasswordResetEmail(
                auth,
                currentEmail,
              );

              Alert.alert(
                'Reset Link Sent 📧',
                `A password reset link has been sent to ${currentEmail}. Check your email and follow the link to create a new password.`,
              );
            } catch (error: any) {
              console.error(
                'Admin password reset error:',
                error,
              );

              let message =
                'Unable to send the password reset link.';

              if (error?.code === 'auth/user-not-found') {
                message =
                  'No account was found with this email address.';
              } else if (error?.code === 'auth/invalid-email') {
                message =
                  'The registered admin email address is invalid.';
              } else if (error?.code === 'auth/too-many-requests') {
                message =
                  'Too many reset requests. Please try again later.';
              } else if (error?.message) {
                message = error.message;
              }

              Alert.alert('Password Reset Failed', message);
            } finally {
              setResetLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from the admin portal?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: onLogout,
        },
      ],
    );
  };

  const displayName = profile?.name || userName || 'Administrator';
  const displayEmail = profile?.email || auth.currentUser?.email || '—';
  const displayCollegeId = profile?.collegeId || collegeId || '—';
  const displayRole =
    profile?.role?.toLowerCase() === 'admin'
      ? 'Administrator'
      : profile?.role || 'Administrator';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({pressed}) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Admin Profile</Text>
            <Text style={styles.headerSubtitle}>
              Manage your CampusFix account
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>👤</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileHero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {displayName.trim().charAt(0).toUpperCase() || 'A'}
              </Text>

              <View style={styles.onlineDot} />
            </View>

            <Text style={styles.profileName}>{displayName}</Text>

            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeIcon}>✓</Text>
              <Text style={styles.adminBadgeText}>ADMINISTRATOR</Text>
            </View>

            <Text style={styles.profileEmail}>{displayEmail}</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <Text style={styles.sectionSubtitle}>
              Your registered admin details
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingText}>
                Loading profile...
              </Text>
            </View>
          ) : (
            <View style={styles.infoCard}>
              <InfoRow
                icon="👤"
                label="Full Name"
                value={displayName}
              />

              <InfoDivider />

              <InfoRow
                icon="✉️"
                label="Email Address"
                value={displayEmail}
              />

              <InfoDivider />

              <InfoRow
                icon="🏫"
                label="College / Campus"
                value={collegeName || `College ID: ${displayCollegeId}`}
              />

              <InfoDivider />

              <InfoRow
                icon="🆔"
                label="College ID"
                value={displayCollegeId}
              />

              <InfoDivider />

              <InfoRow
                icon="🔐"
                label="Account Role"
                value={displayRole}
              />
            </View>
          )}

          <View style={styles.accessCard}>
            <View style={styles.accessIcon}>
              <Text style={styles.accessIconText}>🛡️</Text>
            </View>

            <View style={styles.accessContent}>
              <Text style={styles.accessTitle}>Administrator Access</Text>
              <Text style={styles.accessText}>
                You can manage complaints, review notifications, update
                complaint status and assign departments for your campus.
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handlePasswordReset}
            disabled={resetLoading}
            style={({pressed}) => [
              styles.resetButton,
              resetLoading && styles.resetButtonDisabled,
              pressed && styles.resetPressed,
            ]}>
            <View style={styles.resetIconCircle}>
              {resetLoading ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <Text style={styles.resetIcon}>🔑</Text>
              )}
            </View>

            <View style={styles.resetTextWrap}>
              <Text style={styles.resetTitle}>Reset Password</Text>
              <Text style={styles.resetSubtitle}>
                Send a password reset link to your email
              </Text>
            </View>

            <Text style={styles.resetArrow}>›</Text>
          </Pressable>

          <Pressable
            onPress={handleLogout}
            style={({pressed}) => [
              styles.logoutButton,
              pressed && styles.logoutPressed,
            ]}>
            <View style={styles.logoutIconCircle}>
              <Text style={styles.logoutIcon}>↪</Text>
            </View>

            <View style={styles.logoutTextWrap}>
              <Text style={styles.logoutTitle}>Logout</Text>
              <Text style={styles.logoutSubtitle}>
                Sign out of the admin portal
              </Text>
            </View>

            <Text style={styles.logoutArrow}>›</Text>
          </Pressable>

          <Text style={styles.footerText}>
            Campus Complaint Management System
          </Text>

          <Text style={styles.versionText}>CampusFix • Admin Portal</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

type InfoRowProps = {
  icon: string;
  label: string;
  value: string;
};

const InfoRow = ({icon, label, value}: InfoRowProps) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Text style={styles.infoIconText}>{icon}</Text>
    </View>

    <View style={styles.infoTextWrap}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  </View>
);

const InfoDivider = () => <View style={styles.infoDivider} />;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    flex: 1,
    paddingHorizontal: 18,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 15,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  backArrow: {
    fontSize: 31,
    lineHeight: 34,
    color: '#111827',
    fontWeight: '400',
    marginTop: -3,
  },

  pressed: {
    opacity: 0.65,
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 22,
    color: '#111827',
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  headerIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  headerIconText: {
    fontSize: 20,
  },

  scrollContent: {
    paddingBottom: 15,
  },

  profileHero: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 22,
    paddingHorizontal: 15,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  avatar: {
    width: 88,
    height: 88,
    marginTop: 4,
    borderRadius: 30,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 4,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },

  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 3,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  profileName: {
    marginTop: 13,
    fontSize: 20,
    color: '#111827',
    fontWeight: '900',
  },

  adminBadge: {
    marginTop: 7,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  adminBadgeIcon: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '900',
    marginRight: 5,
  },

  adminBadgeText: {
    fontSize: 9,
    color: '#2563EB',
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  profileEmail: {
    marginTop: 7,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },

  sectionHeader: {
    marginTop: 19,
    marginBottom: 9,
    paddingHorizontal: 2,
  },

  sectionTitle: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '900',
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },

  infoCard: {
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  infoRow: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  infoIconText: {
    fontSize: 17,
  },

  infoTextWrap: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '700',
  },

  infoValue: {
    marginTop: 3,
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '800',
  },

  infoDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 50,
  },

  loadingCard: {
    minHeight: 100,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 9,
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },

  accessCard: {
    marginTop: 14,
    padding: 13,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    flexDirection: 'row',
  },

  accessIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  accessIconText: {
    fontSize: 19,
  },

  accessContent: {
    flex: 1,
  },

  accessTitle: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '900',
  },

  accessText: {
    marginTop: 4,
    fontSize: 10,
    lineHeight: 15,
    color: '#64748B',
    fontWeight: '600',
  },

  resetButton: {
    marginTop: 15,
    minHeight: 70,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
  },

  resetButtonDisabled: {
    opacity: 0.6,
  },

  resetPressed: {
    opacity: 0.72,
  },

  resetIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  resetIcon: {
    fontSize: 18,
  },

  resetTextWrap: {
    flex: 1,
  },

  resetTitle: {
    fontSize: 13,
    color: '#1D4ED8',
    fontWeight: '900',
  },

  resetSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },

  resetArrow: {
    fontSize: 26,
    color: '#2563EB',
    fontWeight: '400',
    marginLeft: 6,
  },

  logoutButton: {
    marginTop: 15,
    minHeight: 70,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 18,
    backgroundColor: '#FFF7F7',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoutPressed: {
    opacity: 0.72,
  },

  logoutIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  logoutIcon: {
    fontSize: 22,
    color: '#DC2626',
    fontWeight: '900',
  },

  logoutTextWrap: {
    flex: 1,
  },

  logoutTitle: {
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '900',
  },

  logoutSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  logoutArrow: {
    fontSize: 26,
    color: '#DC2626',
    fontWeight: '400',
    marginLeft: 6,
  },

  footerText: {
    marginTop: 17,
    textAlign: 'center',
    fontSize: 9,
    color: '#A1A1AA',
    fontWeight: '600',
  },

  versionText: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 8,
    color: '#CBD5E1',
    fontWeight: '600',
  },
});

export default AdminProfileScreen;
