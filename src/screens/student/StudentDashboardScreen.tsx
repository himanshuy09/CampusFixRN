import React, {useCallback, useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
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
  onSnapshot,
  query,
  where,
} from '@react-native-firebase/firestore';

import {auth, firestore} from '../../firebase/config';

type Props = {
  userName: string;
  userCollegeId: string;
  onReportComplaint: () => void;
  onMyComplaints: () => void;
  onNotifications: () => void;
  onProfile: () => void;
  onLogout: () => void;
};

type Complaint = {
  id: string;
  complaintId?: string;
  category?: string;
  description?: string;
  location?: string;
  priority?: string;
  status?: string;
  createdAt?: any;
};

const StudentDashboardScreen = ({
  userName,
  userCollegeId,
  onReportComplaint,
  onMyComplaints,
  onNotifications,
  onProfile,
}: Props) => {
  const [collegeName, setCollegeName] = useState('College');

  const [totalComplaints, setTotalComplaints] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);
  const [inProgressComplaints, setInProgressComplaints] =
    useState(0);
  const [resolvedComplaints, setResolvedComplaints] =
    useState(0);

  const [recentComplaints, setRecentComplaints] = useState<
    Complaint[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] =
    useState(false);

  const [profileMenuVisible, setProfileMenuVisible] =
    useState(false);

  // ============================================================
  // LOAD COLLEGE NAME
  // ============================================================

  const loadCollegeName = useCallback(async () => {
    if (!userCollegeId) {
      setCollegeName('College');
      return;
    }

    try {
      const collegeRef = doc(
        firestore,
        'colleges',
        userCollegeId,
      );

      const collegeSnapshot = await getDoc(collegeRef);

      if (collegeSnapshot.exists()) {
        const data = collegeSnapshot.data();

        setCollegeName(
          data?.name?.toString() || 'College',
        );
      } else {
        setCollegeName('College');
      }
    } catch {
      setCollegeName('College');
    }
  }, [userCollegeId]);

  // ============================================================
  // LOAD COMPLAINT DATA
  // ============================================================

  const loadComplaintData = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const complaintsQuery = query(
        collection(firestore, 'complaints'),
        where('userId', '==', user.uid),
      );

      const snapshot = await getDocs(complaintsQuery);

      let pending = 0;
      let inProgress = 0;
      let resolved = 0;

      const complaints: Complaint[] = [];

      snapshot.forEach(complaintDoc => {
        const data = complaintDoc.data();

        const status =
          data?.status?.toString() || 'Submitted';

        if (
          status === 'Submitted' ||
          status === 'Assigned'
        ) {
          pending++;
        } else if (status === 'In Progress') {
          inProgress++;
        } else if (status === 'Resolved') {
          resolved++;
        }

        complaints.push({
          id: complaintDoc.id,
          complaintId:
            data?.complaintId?.toString() || '',
          category:
            data?.category?.toString() ||
            'Unknown Issue',
          description:
            data?.description?.toString() || '',
          location:
            data?.location?.toString() || '',
          priority:
            data?.priority?.toString() || 'Medium',
          status,
          createdAt: data?.createdAt,
        });
      });

      complaints.sort((a, b) => {
        const aTime =
          a.createdAt?.toDate?.()?.getTime?.() || 0;

        const bTime =
          b.createdAt?.toDate?.()?.getTime?.() || 0;

        return bTime - aTime;
      });

      setTotalComplaints(complaints.length);
      setPendingComplaints(pending);
      setInProgressComplaints(inProgress);
      setResolvedComplaints(resolved);

      setRecentComplaints(
        complaints.slice(0, 3),
      );
    } catch (error) {
      console.log(
        'Unable to load complaint data:',
        error,
      );
    }
  }, []);

  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  const loadDashboard = useCallback(async () => {
    await Promise.all([
      loadCollegeName(),
      loadComplaintData(),
    ]);

    setLoading(false);
  }, [loadCollegeName, loadComplaintData]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // ============================================================
  // UNREAD NOTIFICATIONS
  // ============================================================

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    const notificationsQuery = query(
      collection(firestore, 'notifications'),
      where('userId', '==', user.uid),
      where('isRead', '==', false),
    );

    const unsubscribe = onSnapshot(
      notificationsQuery,
      snapshot => {
        setHasUnreadNotification(
          !snapshot.empty,
        );
      },
      error => {
        console.log(
          'Notification listener error:',
          error,
        );
      },
    );

    return unsubscribe;
  }, []);

  // ============================================================
  // REFRESH
  // ============================================================

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  // ============================================================
  // GREETING
  // ============================================================

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) {
      return 'Good Morning';
    }

    if (hour < 17) {
      return 'Good Afternoon';
    }

    return 'Good Evening';
  };

  // ============================================================
  // STATUS COLOR
  // ============================================================

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
        return '#16A34A';

      case 'In Progress':
        return '#7C3AED';

      case 'Assigned':
        return '#D97706';

      default:
        return '#B77900';
    }
  };

  // ============================================================
  // PRIORITY COLOR
  // ============================================================

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return '#DC2626';

      case 'Low':
        return '#16A34A';

      default:
        return '#D97706';
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#2563EB"
        />

        <Text style={styles.loadingText}>
          Loading your dashboard...
        </Text>
      </View>
    );
  }

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
        contentContainerStyle={styles.content}>

        {/* =====================================================
            TOP HEADER
        ====================================================== */}

        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.smallGreeting}>
              {getGreeting()},
            </Text>

            <Text style={styles.studentName}>
              {userName || 'Student'} 👋
            </Text>

            <View style={styles.collegeRow}>
              <Text style={styles.schoolIcon}>
                🎓
              </Text>

              <Text
                style={styles.collegeText}
                numberOfLines={1}>
                {collegeName}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>

            {/* CampusFix Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/campusfix_logo.png')}
                style={styles.headerLogo}
                resizeMode="contain"
              />
            </View>

            {/* Notification */}
            <TouchableOpacity
              style={styles.headerIconButton}
              activeOpacity={0.75}
              onPress={onNotifications}>

              <Text style={styles.headerIcon}>
                🔔
              </Text>

              {hasUnreadNotification && (
                <View style={styles.notificationDot} />
              )}
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity
              style={styles.headerIconButton}
              activeOpacity={0.75}
              onPress={() =>
                setProfileMenuVisible(current => !current)
              }>

              <Text style={styles.headerIcon}>
                👤
              </Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* =====================================================
            PROFILE MENU DISMISS AREA + MENU
        ====================================================== */}

        <Modal
          transparent
          visible={profileMenuVisible}
          animationType="fade"
          onRequestClose={() => setProfileMenuVisible(false)}>

          <Pressable
            style={styles.profileMenuBackdrop}
            onPress={() => setProfileMenuVisible(false)}>

            <Pressable
              style={styles.profileMenuModal}
              onPress={event => event.stopPropagation()}>

              <TouchableOpacity
                style={styles.profileMenuItem}
                activeOpacity={0.7}
                onPress={() => {
                  setProfileMenuVisible(false);
                  onMyComplaints();
                }}>

                <View style={styles.profileMenuIcon}>
                  <Text style={styles.profileMenuEmoji}>
                    📋
                  </Text>
                </View>

                <Text style={styles.profileMenuText}>
                  Complaints
                </Text>

              </TouchableOpacity>

              <View style={styles.profileMenuDivider} />

              <TouchableOpacity
                style={styles.profileMenuItem}
                activeOpacity={0.7}
                onPress={() => {
                  setProfileMenuVisible(false);
                  onProfile();
                }}>

                <View style={styles.profileMenuIcon}>
                  <Text style={styles.profileMenuEmoji}>
                    👤
                  </Text>
                </View>

                <Text style={styles.profileMenuText}>
                  Profile
                </Text>

              </TouchableOpacity>

            </Pressable>
          </Pressable>
        </Modal>

        {/* =====================================================
            REPORT ISSUE CARD
        ====================================================== */}

        <View style={styles.reportCard}>

          <View style={styles.reportIconBox}>
            <Text style={styles.reportIcon}>
              ⚠
            </Text>
          </View>

          <Text style={styles.reportTitle}>
            Report an Issue
          </Text>

          <Text style={styles.reportDescription}>
            Facing a problem on campus? Let us know
            and get it resolved.
          </Text>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={onReportComplaint}>

            <Text style={styles.reportButtonText}>
              Report Issue
            </Text>

            <Text style={styles.reportArrow}>
              →
            </Text>

          </TouchableOpacity>

        </View>

        {/* =====================================================
            YOUR COMPLAINTS
        ====================================================== */}

        <Text style={styles.sectionTitle}>
          Your Complaints
        </Text>

        <View style={styles.statsRow}>

          <StatCard
            title="Total"
            value={totalComplaints}
            icon="📄"
            iconBackground="#EAF2FF"
            iconColor="#2563EB"
          />

          <View style={styles.statGap} />

          <StatCard
            title="Pending"
            value={pendingComplaints}
            icon="⏳"
            iconBackground="#FFF4E5"
            iconColor="#D97706"
          />

        </View>

        <View style={styles.statsRow}>

          <StatCard
            title="In Progress"
            value={inProgressComplaints}
            icon="🔄"
            iconBackground="#F1EAFE"
            iconColor="#7C3AED"
          />

          <View style={styles.statGap} />

          <StatCard
            title="Resolved"
            value={resolvedComplaints}
            icon="✓"
            iconBackground="#E8F7ED"
            iconColor="#16A34A"
          />

        </View>

        {/* =====================================================
            RECENT COMPLAINTS
        ====================================================== */}

        <View style={styles.recentHeader}>

          <Text style={styles.sectionTitle}>
            Recent Complaints
          </Text>

          <TouchableOpacity
            onPress={onMyComplaints}>

            <Text style={styles.seeAll}>
              See All
            </Text>

          </TouchableOpacity>

        </View>

        {recentComplaints.length === 0 ? (
          <View style={styles.emptyCard}>

            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>
                📥
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              No complaints yet
            </Text>

            <Text style={styles.emptyText}>
              Your reported issues will appear here.
            </Text>

          </View>
        ) : (
          recentComplaints.map(complaint => {
            const statusColor = getStatusColor(
              complaint.status || 'Submitted',
            );

            const priorityColor = getPriorityColor(
              complaint.priority || 'Medium',
            );

            return (
              <TouchableOpacity
                key={complaint.id}
                style={styles.complaintCard}
                activeOpacity={0.85}
                onPress={onMyComplaints}>

                <View style={styles.complaintTop}>

                  <View style={styles.complaintIconBox}>
                    <Text style={styles.complaintIcon}>
                      ⚠
                    </Text>
                  </View>

                  <Text
                    style={styles.complaintCategory}
                    numberOfLines={1}>
                    {complaint.category}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          `${statusColor}18`,
                      },
                    ]}>

                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor:
                            statusColor,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: statusColor,
                        },
                      ]}>
                      {complaint.status}
                    </Text>

                  </View>

                </View>

                <Text
                  style={styles.complaintDescription}
                  numberOfLines={2}>
                  {complaint.description ||
                    'No description available.'}
                </Text>

                <View style={styles.complaintBottom}>

                  <View style={styles.locationContainer}>

                    <Text style={styles.locationIcon}>
                      📍
                    </Text>

                    <Text
                      style={styles.locationText}
                      numberOfLines={1}>
                      {complaint.location ||
                        'Location not specified'}
                    </Text>

                  </View>

                  <Text
                    style={[
                      styles.priorityText,
                      {
                        color: priorityColor,
                      },
                    ]}>
                    {complaint.priority}
                  </Text>

                </View>

              </TouchableOpacity>
            );
          })
        )}

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <Text style={styles.campusId}>
          Campus ID: {userCollegeId || 'N/A'}
        </Text>

        <Text style={styles.footerText}>
          Campus Complaint Management System
        </Text>

      </ScrollView>

    </View>
  );
};

// ============================================================
// STAT CARD
// ============================================================

type StatCardProps = {
  title: string;
  value: number;
  icon: string;
  iconBackground: string;
  iconColor: string;
};

const StatCard = ({
  title,
  value,
  icon,
  iconBackground,
  iconColor,
}: StatCardProps) => {
  return (
    <View style={styles.statCard}>

      <View
        style={[
          styles.statIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}>

        <Text
          style={[
            styles.statIconText,
            {
              color: iconColor,
            },
          ]}>
          {icon}
        </Text>

      </View>

      <Text style={styles.statValue}>
        {value}
      </Text>

      <Text style={styles.statTitle}>
        {title}
      </Text>

    </View>
  );
};

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 35,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 13,
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 26,
    paddingTop: 7,
  },

  headerText: {
    flex: 1,
    paddingRight: 8,
  },

  smallGreeting: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 3,
  },

  studentName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },

  collegeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  schoolIcon: {
    fontSize: 15,
    marginRight: 6,
  },

  collegeText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 100,
  },

  // Small CampusFix logo
  logoContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
    marginRight: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  headerLogo: {
    width: 33,
    height: 33,
    borderRadius: 16.5,
  },

  profileMenuBackdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  profileMenuModal: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 82 : 92,
    right: 20,
    width: 155,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  profileMenuItem: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  profileMenuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  profileMenuEmoji: {
    fontSize: 17,
  },

  profileMenuText: {
    flex: 1,
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
  },

  profileMenuDivider: {
    height: 1,
    backgroundColor: '#F0F1F3',
    marginHorizontal: 12,
  },

  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    elevation: 2,
    position: 'relative',
  },

  headerIcon: {
    fontSize: 19,
  },

  notificationDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    top: 7,
    right: 7,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // ==========================================================
  // REPORT CARD
  // ==========================================================

  reportCard: {
    backgroundColor: '#2563EB',
    borderRadius: 22,
    padding: 22,
    marginBottom: 28,

    elevation: 5,

    shadowColor: '#2563EB',
    shadowOpacity: 0.20,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 7,
    },
  },

  reportIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 17,
  },

  reportIcon: {
    fontSize: 25,
    color: '#FFFFFF',
    fontWeight: '800',
  },

  reportTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 7,
  },

  reportDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.80)',
    maxWidth: 310,
  },

  reportButton: {
    alignSelf: 'flex-start',
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },

  reportButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '800',
  },

  reportArrow: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
  },

  // ==========================================================
  // SECTION
  // ==========================================================

  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
  },

  // ==========================================================
  // STATISTICS
  // ==========================================================

  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  statGap: {
    width: 12,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECEB',
    minHeight: 145,
  },

  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  statIconText: {
    fontSize: 20,
    fontWeight: '800',
  },

  statValue: {
    fontSize: 25,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },

  statTitle: {
    fontSize: 12,
    color: '#6B7280',
  },

  // ==========================================================
  // RECENT COMPLAINTS
  // ==========================================================

  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 2,
  },

  seeAll: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },

  complaintCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8ECEB',
  },

  complaintTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  complaintIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  complaintIcon: {
    fontSize: 19,
    color: '#2563EB',
  },

  complaintCategory: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginRight: 7,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },

  complaintDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: '#374151',
    marginTop: 12,
  },

  complaintBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 11,
  },

  locationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },

  locationIcon: {
    fontSize: 13,
    marginRight: 4,
  },

  locationText: {
    flex: 1,
    fontSize: 11,
    color: '#6B7280',
  },

  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ==========================================================
  // EMPTY
  // ==========================================================

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 35,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECEB',
  },

  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },

  emptyEmoji: {
    fontSize: 27,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 5,
  },

  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  campusId: {
    textAlign: 'center',
    color: '#A1A1AA',
    fontSize: 10,
    marginTop: 6,
  },

  // ==========================================================
  // FOOTER
  // ==========================================================

  footerText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 3,
    letterSpacing: 0.2,
  },


});

export default StudentDashboardScreen;