import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from '@react-native-firebase/firestore';

import {auth, firestore} from '../../firebase/config';

type Props = {
  collegeId: string;
  userName?: string;
  onComplaints: () => void;
  onNotifications: () => void;
  onProfile: () => void;
  onLogout: () => void;
};

type Complaint = {
  id: string;
  complaintId?: string;
  name?: string;
  category?: string;
  location?: string;
  priority?: string;
  status?: string;
  createdAt?: any;
};

const primary = '#2563EB';
const logoSource = require('../../../assets/campusfix_logo.png');

const formatDate = (value: any) => {
  if (!value) {
    return 'Just now';
  }

  try {
    const date =
      typeof value?.toDate === 'function'
        ? value.toDate()
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Just now';
    }

    const difference = Date.now() - date.getTime();

    if (difference < 60 * 1000) {
      return 'Just now';
    }

    if (difference < 60 * 60 * 1000) {
      return `${Math.floor(difference / (60 * 1000))}m ago`;
    }

    if (difference < 24 * 60 * 60 * 1000) {
      return `${Math.floor(difference / (60 * 60 * 1000))}h ago`;
    }

    if (difference < 2 * 24 * 60 * 60 * 1000) {
      return 'Yesterday';
    }

    return `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1,
    ).padStart(2, '0')}/${date.getFullYear()}`;
  } catch {
    return 'Just now';
  }
};

const statusStyle = (status: string) => {
  switch (status) {
    case 'Resolved':
      return {background: '#DCFCE7', text: '#16A34A'};
    case 'In Progress':
      return {background: '#EDE9FE', text: '#6D28D9'};
    case 'Assigned':
      return {background: '#FEF3C7', text: '#D97706'};
    case 'Submitted':
    default:
      return {background: '#DBEAFE', text: '#2563EB'};
  }
};

const priorityStyle = (priority: string) => {
  switch (priority) {
    case 'High':
      return '#DC2626';
    case 'Medium':
      return '#D97706';
    case 'Low':
    default:
      return '#16A34A';
  }
};

const StatCard = ({
  title,
  value,
  icon,
  iconBackground,
  iconColor,
}: {
  title: string;
  value: number;
  icon: string;
  iconBackground: string;
  iconColor: string;
}) => (
  <View style={styles.statCard}>
    <View
      style={[
        styles.statIcon,
        {backgroundColor: iconBackground},
      ]}>
      <Text style={[styles.statIconText, {color: iconColor}]}>
        {icon}
      </Text>
    </View>

    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const ComplaintCard = ({
  complaint,
}: {
  complaint: Complaint;
}) => {
  const status = complaint.status || 'Submitted';
  const priority = complaint.priority || 'Low';
  const statusColors = statusStyle(status);

  return (
    <View style={styles.complaintCard}>
      <View style={styles.complaintTopRow}>
        <Text style={styles.complaintCategory} numberOfLines={1}>
          {complaint.category || 'Other'}
        </Text>

        <View
          style={[
            styles.statusPill,
            {backgroundColor: statusColors.background},
          ]}>
          <Text
            style={[
              styles.statusPillText,
              {color: statusColors.text},
            ]}>
            {status}
          </Text>
        </View>
      </View>

      <Text style={styles.complaintId}>
        {complaint.complaintId || 'N/A'}
      </Text>

      <View style={styles.complaintInfoRow}>
        <Text style={styles.infoIcon}>👤</Text>
        <Text style={styles.studentName} numberOfLines={1}>
          {complaint.name || 'Student'}
        </Text>
      </View>

      <View style={styles.complaintInfoRow}>
        <Text style={styles.infoIcon}>📍</Text>
        <Text style={styles.location} numberOfLines={1}>
          {complaint.location || 'Not specified'}
        </Text>
      </View>

      <View style={styles.complaintBottomRow}>
        <Text
          style={[
            styles.priority,
            {color: priorityStyle(priority)},
          ]}>
          {priority}
        </Text>

        <Text style={styles.dateText}>
          {formatDate(complaint.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const AdminDashboardScreen = ({
  collegeId,
  userName,
  onComplaints,
  onNotifications,
  onProfile,
  onLogout,
}: Props) => {
  const [adminName, setAdminName] = useState(userName || 'Admin');
  const [collegeName, setCollegeName] = useState('College');

  const [totalComplaints, setTotalComplaints] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);
  const [inProgressComplaints, setInProgressComplaints] = useState(0);
  const [resolvedComplaints, setResolvedComplaints] = useState(0);

  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>(
    [],
  );
  const [hasUnread, setHasUnread] = useState(false);
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAdminData = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      // Same as Flutter: load admin profile first.
      const userSnapshot = await getDoc(
        doc(firestore, 'users', user.uid),
      );

      let profileCollegeId = collegeId;

      if (userSnapshot.exists()) {
        const data = userSnapshot.data() || {};

        setAdminName(
          String(data.name || userName || 'Admin'),
        );

        profileCollegeId = String(
          data.collegeId || collegeId || '',
        );
      }

      // Same as Flutter: resolve college name from colleges/{collegeId}.
      if (profileCollegeId) {
        const collegeSnapshot = await getDoc(
          doc(firestore, 'colleges', profileCollegeId),
        );

        if (collegeSnapshot.exists()) {
          const data = collegeSnapshot.data() || {};
          setCollegeName(String(data.name || 'College'));
        }
      }

      // Same business logic: only this admin's college complaints.
      const complaintQuery = query(
        collection(firestore, 'complaints'),
        where('collegeId', '==', collegeId),
      );

      const complaintSnapshot = await getDocs(complaintQuery);

      const complaints: Complaint[] = [];

      complaintSnapshot.forEach(complaintDoc => {
        const data = complaintDoc.data() || {};

        complaints.push({
          id: complaintDoc.id,
          complaintId: String(data.complaintId || ''),
          name: String(data.name || 'Student'),
          category: String(data.category || 'Other'),
          location: String(data.location || 'Not specified'),
          priority: String(data.priority || 'Low'),
          status: String(data.status || 'Submitted'),
          createdAt: data.createdAt,
        });
      });

      setTotalComplaints(complaints.length);

      setPendingComplaints(
        complaints.filter(
          complaint =>
            complaint.status === 'Submitted' ||
            complaint.status === 'Assigned',
        ).length,
      );

      setInProgressComplaints(
        complaints.filter(
          complaint => complaint.status === 'In Progress',
        ).length,
      );

      setResolvedComplaints(
        complaints.filter(
          complaint => complaint.status === 'Resolved',
        ).length,
      );

      complaints.sort((a, b) => {
        const aMillis =
          typeof a.createdAt?.toMillis === 'function'
            ? a.createdAt.toMillis()
            : 0;
        const bMillis =
          typeof b.createdAt?.toMillis === 'function'
            ? b.createdAt.toMillis()
            : 0;

        return bMillis - aMillis;
      });

      setRecentComplaints(complaints.slice(0, 5));

      // Read admin notifications without requiring a composite index.
      const adminNotificationsQuery = query(
        collection(firestore, 'admin_notifications'),
        where('adminId', '==', user.uid),
      );

      const notificationSnapshot = await getDocs(
        adminNotificationsQuery,
      );

      let unread = false;
      notificationSnapshot.forEach(notificationDoc => {
        if (notificationDoc.data()?.isRead === false) {
          unread = true;
        }
      });
      setHasUnread(unread);
    } catch (error: any) {
      console.error('Unable to load admin dashboard:', error);

      Alert.alert(
        'Unable to Load Dashboard',
        error?.message || 'Please try again.',
      );
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [collegeId, userName]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.dismissLayer}
        pointerEvents={profileMenuVisible ? 'auto' : 'none'}
        onPress={() => setProfileMenuVisible(false)}
      />
      {/* Student-dashboard style top header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={logoSource} style={styles.logo} />
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerGreeting}>
              Hey, {adminName} 👋
            </Text>
            <View style={styles.collegeRow}>
              <Text style={styles.collegeIcon}>🎓</Text>
              <Text style={styles.collegeName} numberOfLines={1}>
                {collegeName}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={onNotifications}
            activeOpacity={0.75}>
            <Text style={styles.headerIcon}>🔔</Text>
            {hasUnread && <View style={styles.unreadDot} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setProfileMenuVisible(value => !value)}
            activeOpacity={0.75}>
            <Text style={styles.headerIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[primary]}
            />
          }>

          {/* Admin overview banner */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeCardText}>
              <Text style={styles.welcomeEyebrow}>ADMIN DASHBOARD</Text>
              <Text style={styles.welcomeTitle}>
                Manage Campus Complaints
              </Text>
              <Text style={styles.welcomeSubtitle}>
                Monitor, review and resolve student complaints.
              </Text>
            </View>

            <View style={styles.welcomeLogoWrap}>
              <Image source={logoSource} style={styles.welcomeLogo} />
            </View>
          </View>

          <Text style={styles.sectionTitle}>
            Complaint Overview
          </Text>

          <View style={styles.statsGrid}>
            <StatCard
              title="Total Complaints"
              value={totalComplaints}
              icon="▣"
              iconBackground="#E8F0FE"
              iconColor="#2563EB"
            />

            <StatCard
              title="Pending"
              value={pendingComplaints}
              icon="◷"
              iconBackground="#FFF7E6"
              iconColor="#F59E0B"
            />

            <StatCard
              title="In Progress"
              value={inProgressComplaints}
              icon="↻"
              iconBackground="#F0EAFF"
              iconColor="#7C3AED"
            />

            <StatCard
              title="Resolved"
              value={resolvedComplaints}
              icon="✓"
              iconBackground="#EAFBF0"
              iconColor="#16A34A"
            />
          </View>

          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>
              Recent Complaints
            </Text>

            <TouchableOpacity
              onPress={onComplaints}
              activeOpacity={0.7}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentComplaints.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>▱</Text>
              <Text style={styles.emptyTitle}>
                No complaints yet
              </Text>
              <Text style={styles.emptyText}>
                New campus complaints will appear here.
              </Text>
            </View>
          ) : (
            recentComplaints.map(complaint => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
              />
            ))
          )}

          <Text style={styles.footerText}>
            Campus Complaint Management System
          </Text>
        </ScrollView>
      )}

      {/* Floating profile menu */}
      {profileMenuVisible && (
        <Pressable
          style={styles.profileMenu}
          onPress={event => event.stopPropagation()}>
          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => {
              setProfileMenuVisible(false);
              onComplaints();
            }}
            activeOpacity={0.75}>
            <View style={styles.profileMenuIcon}>
              <Text style={styles.profileMenuIconText}>▣</Text>
            </View>
            <Text style={styles.profileMenuText}>Complaints</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => {
              setProfileMenuVisible(false);
              onProfile();
            }}
            activeOpacity={0.75}>
            <View style={styles.profileMenuIcon}>
              <Text style={styles.profileMenuIconText}>♙</Text>
            </View>
            <Text style={styles.profileMenuText}>Profile</Text>
          </TouchableOpacity>

          <View style={styles.profileMenuDivider} />

          <TouchableOpacity
            style={styles.profileMenuItem}
            onPress={() => {
              setProfileMenuVisible(false);
              onLogout();
            }}
            activeOpacity={0.75}>
            <View style={styles.profileMenuIcon}>
              <Text style={styles.profileMenuIconText}>↪</Text>
            </View>
            <Text style={styles.profileMenuLogoutText}>Logout</Text>
          </TouchableOpacity>
        </Pressable>
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
    zIndex: 30,
    minHeight: 88,
    paddingHorizontal: 18,
    paddingTop: 48,
    paddingBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F9FC',
  },

  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },

  logo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 11,
  },

  headerTextWrap: {
    flex: 1,
  },

  headerGreeting: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },

  collegeRow: {
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },

  collegeIcon: {
    fontSize: 13,
    marginRight: 5,
  },

  collegeName: {
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerIconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginLeft: 2,
  },

  headerIcon: {
    fontSize: 20,
  },

  unreadDot: {
    position: 'absolute',
    right: 7,
    top: 7,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#F7F9FC',
  },

  scroll: {
    flex: 1,
    zIndex: 30,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 40,
  },

  welcomeCard: {
    minHeight: 132,
    borderRadius: 22,
    padding: 18,
    marginBottom: 24,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 7},
    elevation: 4,
  },

  welcomeCardText: {
    flex: 1,
    paddingRight: 8,
  },

  welcomeEyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: '#DBEAFE',
  },

  welcomeTitle: {
    marginTop: 6,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  welcomeSubtitle: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#DBEAFE',
  },

  welcomeLogoWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginLeft: 8,
  },

  welcomeLogo: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  statsGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },

  statCard: {
    width: '48.2%',
    minHeight: 142,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },

  statIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statIconText: {
    fontSize: 21,
    fontWeight: '900',
  },

  statValue: {
    marginTop: 13,
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
  },

  statTitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  recentHeader: {
    marginTop: 27,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  seeAll: {
    marginLeft: 'auto',
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '800',
  },

  complaintCard: {
    marginBottom: 13,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOpacity: 0.035,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 1,
  },

  complaintTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  complaintCategory: {
    flex: 1,
    marginRight: 8,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
  },

  complaintId: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },

  complaintInfoRow: {
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 22,
    fontSize: 14,
  },

  studentName: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '700',
  },

  location: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },

  complaintBottomRow: {
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },

  priority: {
    fontSize: 12,
    fontWeight: '800',
  },

  dateText: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#6B7280',
  },

  emptyCard: {
    marginTop: 2,
    padding: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  emptyIcon: {
    fontSize: 42,
    color: '#9CA3AF',
  },

  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '800',
    color: '#374151',
  },

  emptyText: {
    marginTop: 4,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footerText: {
    marginTop: 18,
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  dismissLayer: {
    ...StyleSheet.absoluteFill,
    zIndex: 20,
  },

  profileMenu: {
    zIndex: 60,
    elevation: 12,
    position: 'absolute',
    right: 16,
    bottom: 78,
    width: 190,
    paddingVertical: 8,
    backgroundColor: '#23b31bf2',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 7},
  },

  profileMenuItem: {
    minHeight: 45,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
  },

  profileMenuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    marginRight: 10,
  },

  profileMenuIconText: {
    fontSize: 16,
    color: '#2563EB',
  },

  profileMenuText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#eff0f1',
  },

  profileMenuDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 5,
    marginHorizontal: 12,
  },

  profileMenuLogoutText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#af0c0c',
  },


});

export default AdminDashboardScreen;
