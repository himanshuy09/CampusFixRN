import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {deleteDoc, doc, getDoc} from '@react-native-firebase/firestore';
import {auth, firestore} from '../../firebase/config';
import {forgotPassword} from '../../services/authService';

type Props = {
  onBack: () => void;
  onMyComplaints: () => void;
  onNotifications: () => void;
  onLogout: () => void;
  onAccountDeleted: () => void;
};

type ProfileData = {
  userId?: string;
  name?: string;
  email?: string;
  rollNumber?: string;
  collegeId?: string;
  role?: string;
  createdAt?: any;
};

const formatDate = (value: any) => {
  try {
    if (!value) {
      return 'Not available';
    }

    const date =
      typeof value?.toDate === 'function'
        ? value.toDate()
        : value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Not available';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return 'Not available';
  }
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIcon}>
      <Text style={styles.infoIconText}>{icon}</Text>
    </View>

    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Not available'}</Text>
    </View>
  </View>
);

const StudentProfileScreen = ({
  onBack,
  onMyComplaints,
  onNotifications,
  onLogout,
  onAccountDeleted,
}: Props) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const loadProfile = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      setProfile(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const profileRef = doc(firestore, 'users', user.uid);
      const snapshot = await getDoc(profileRef);

      if (!snapshot.exists()) {
        throw new Error('Student profile not found.');
      }

      const data = snapshot.data() as ProfileData;

      setProfile({
        ...data,
        userId: data.userId || user.uid,
        email: data.email || user.email || '',
      });
    } catch (error: any) {
      console.error('Error loading student profile:', error);
      Alert.alert(
        'Unable to Load Profile',
        error?.message || 'Please try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const displayName = profile?.name || 'Student';
  const firstLetter = displayName.trim().charAt(0).toUpperCase() || 'S';

  const handleDeleteAccount = () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Account Not Found', 'Please sign in again and try again.');
      return;
    }

    Alert.alert(
      'Delete Account',
      'This will permanently delete your CampusFix account and your profile from the database. This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            setDeletingAccount(true);

            try {
              const userRef = doc(firestore, 'users', user.uid);

              // Delete the Firestore profile first.
              // This is allowed by the users/{userId} delete rule only
              // when the signed-in user's UID matches the document UID.
              await deleteDoc(userRef);

              // Then permanently delete the Firebase Authentication account.
              // If Firebase requires recent login, the Firestore profile is
              // already removed, so do not continue with the Auth deletion.
              await user.delete();

              // The Firebase Auth user is already deleted here.
              // Do NOT call the normal logout function because it tries
              // to sign out an Auth user that no longer exists.
              Alert.alert(
                'Account Deleted',
                'Your CampusFix account has been permanently deleted.',
                [
                  {
                    text: 'OK',
                    onPress: onAccountDeleted,
                  },
                ],
              );
            } catch (error: any) {
              console.error('Error deleting student account:', error);

              if (error?.code === 'auth/requires-recent-login') {
                Alert.alert(
                  'Recent Login Required',
                  'For security, Firebase requires you to sign in again before deleting your account. Please log out, sign in again, and then try deleting the account.',
                );
              } else if (
                error?.code === 'permission-denied' ||
                error?.code === 'firestore/permission-denied'
              ) {
                Alert.alert(
                  'Unable to Delete Account',
                  'Your profile could not be removed from the database. Please check your Firebase Firestore rules and try again.',
                );
              } else {
                Alert.alert(
                  'Unable to Delete Account',
                  error?.message || 'Something went wrong. Please try again.',
                );
              }
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ],
    );
  };

  const handlePasswordReset = async () => {
    const email = profile?.email || auth.currentUser?.email || '';

    if (!email) {
      Alert.alert(
        'Email Not Found',
        'No email address is available for this account.',
      );
      return;
    }

    try {
      await forgotPassword(email);
      Alert.alert(
        'Password Reset Email Sent',
        `A password reset link has been sent to ${email}. Please check your inbox.`,
      );
    } catch (error: any) {
      Alert.alert(
        'Unable to Send Reset Link',
        error?.message || 'Please try again later.',
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.75}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>My Profile</Text>
          <Text style={styles.headerSubtitle}>
            Your CampusFix account
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading your profile...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.profileHero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstLetter}</Text>
            </View>

            <Text style={styles.profileName}>{displayName}</Text>

            <Text style={styles.profileEmail}>
              {profile?.email || 'Email not available'}
            </Text>

            <View style={styles.studentBadge}>
              <Text style={styles.studentBadgeText}>STUDENT ACCOUNT</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <InfoRow
              icon="👤"
              label="Full Name"
              value={profile?.name || ''}
            />

            <InfoRow
              icon="🎓"
              label="Roll Number"
              value={profile?.rollNumber || ''}
            />

            <InfoRow
              icon="✉️"
              label="Email Address"
              value={profile?.email || ''}
            />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Campus Information</Text>

            <InfoRow
              icon="🏫"
              label="College ID"
              value={profile?.collegeId || ''}
            />

            <InfoRow
              icon="🔐"
              label="Account Type"
              value={profile?.role || 'student'}
            />

            <InfoRow
              icon="📅"
              label="Account Created"
              value={formatDate(profile?.createdAt)}
            />
          </View>

          <View style={styles.quickActionsCard}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onMyComplaints}
              activeOpacity={0.8}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>📋</Text>
              </View>

              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>My Complaints</Text>
                <Text style={styles.actionSubtitle}>
                  View and track your complaints
                </Text>
              </View>

              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onNotifications}
              activeOpacity={0.8}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>🔔</Text>
              </View>

              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>Notifications</Text>
                <Text style={styles.actionSubtitle}>
                  Check your latest updates
                </Text>
              </View>

              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePasswordReset}
              activeOpacity={0.8}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>🔑</Text>
              </View>

              <View style={styles.actionTextWrap}>
                <Text style={styles.actionTitle}>Reset Password</Text>
                <Text style={styles.actionSubtitle}>
                  Send a password reset link to your email
                </Text>
              </View>

              <Text style={styles.actionArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deleteAccountButton}
            onPress={handleDeleteAccount}
            activeOpacity={0.8}
            disabled={deletingAccount}>
            {deletingAccount ? (
              <ActivityIndicator size="small" color="#B91C1C" />
            ) : (
              <Text style={styles.deleteAccountIcon}>🗑</Text>
            )}
            <Text style={styles.deleteAccountText}>
              {deletingAccount ? 'Deleting Account...' : 'Delete Account'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.deleteAccountWarning}>
            This permanently removes your CampusFix account and cannot be undone.
          </Text>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.8}>
            <Text style={styles.logoutIcon}>↪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          <Text style={styles.footer}>
            Campus Complaint Management System
          </Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 18,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 32,
    lineHeight: 34,
    color: '#2563EB',
    marginTop: -3,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  profileHero: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF2',
    marginBottom: 14,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 31,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  profileName: {
    fontSize: 22,
    color: '#111827',
    fontWeight: '900',
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  studentBadge: {
    marginTop: 12,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  studentBadgeText: {
    fontSize: 9,
    color: '#1D4ED8',
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  infoIconText: {
    fontSize: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  infoValue: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '700',
    marginTop: 2,
  },
  quickActionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8ECF2',
  },
  actionButton: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  actionIconText: {
    fontSize: 17,
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '800',
  },
  actionSubtitle: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 3,
  },
  actionArrow: {
    fontSize: 27,
    color: '#94A3B8',
    marginLeft: 8,
  },
  deleteAccountButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FDA4AF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  deleteAccountIcon: {
    fontSize: 17,
    color: '#B91C1C',
    fontWeight: '900',
    marginRight: 7,
  },

  deleteAccountText: {
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: '900',
  },

  deleteAccountWarning: {
    textAlign: 'center',
    fontSize: 10,
    color: '#9CA3AF',
    lineHeight: 15,
    marginBottom: 13,
    paddingHorizontal: 12,
  },

  logoutButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    fontSize: 18,
    color: '#DC2626',
    fontWeight: '900',
    marginRight: 7,
  },
  logoutText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '900',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  stateText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 13,
  },
});

export default StudentProfileScreen;
