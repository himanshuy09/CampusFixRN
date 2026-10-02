import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';
import {firestore} from '../../firebase/config';

type AdminNotification = {
  id: string;
  adminId?: string;
  complaintId?: string;
  title?: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  createdAt?: any;
  collegeId?: string;
};

type Props = {
  adminId: string;
  collegeId?: string;
  onBack: () => void;
  onComplaintPress?: (complaintId: string) => void;
};

const formatDate = (value: any) => {
  if (!value) {
    return 'Just now';
  }

  try {
    const date =
      typeof value?.toDate === 'function'
        ? value.toDate()
        : value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Just now';
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Just now';
  }
};

const getNotificationIcon = (type?: string) => {
  switch (type) {
    case 'new_complaint':
      return '📢';
    case 'complaint_deleted':
      return '🗑';
    case 'status_update':
      return '🔄';
    default:
      return '🔔';
  }
};

const getNotificationColors = (type?: string) => {
  switch (type) {
    case 'new_complaint':
      return {
        bg: '#EFF6FF',
        iconBg: '#DBEAFE',
        icon: '#2563EB',
      };
    case 'complaint_deleted':
      return {
        bg: '#FFF7ED',
        iconBg: '#FFEDD5',
        icon: '#EA580C',
      };
    case 'status_update':
      return {
        bg: '#F5F3FF',
        iconBg: '#EDE9FE',
        icon: '#7C3AED',
      };
    default:
      return {
        bg: '#F0FDF4',
        iconBg: '#DCFCE7',
        icon: '#16A34A',
      };
  }
};

const AdminNotificationsScreen = ({
  adminId,
  collegeId,
  onBack,
  onComplaintPress,
}: Props) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    if (!adminId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setError('');

      // Keep this query index-free. A `where(adminId)` + `orderBy(createdAt)`
      // query can require a Firestore composite index. We sort the small
      // notification list on the client instead.
      const snapshot = await getDocs(
        query(
          collection(firestore, 'admin_notifications'),
          where('adminId', '==', adminId),
          limit(100),
        ),
      );

      const rows = snapshot.docs
        .map(item => ({
          id: item.id,
          ...(item.data() as Omit<AdminNotification, 'id'>),
        }))
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        });

      setNotifications(rows);
      setError('');
    } catch (err: any) {
      console.error('Admin notification load error:', err);
      setError(
        'Unable to load notifications. Please try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [adminId]);

  useEffect(() => {
    if (!adminId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const notificationQuery = query(
      collection(firestore, 'admin_notifications'),
      where('adminId', '==', adminId),
      limit(100),
    );

    const unsubscribe = onSnapshot(
      notificationQuery,
      snapshot => {
        const rows = snapshot.docs
          .map(item => ({
            id: item.id,
            ...(item.data() as Omit<AdminNotification, 'id'>),
          }))
          .sort((a, b) => {
            const aTime = a.createdAt?.toMillis?.() ?? 0;
            const bTime = b.createdAt?.toMillis?.() ?? 0;
            return bTime - aTime;
          });

        setNotifications(rows);
        setError('');
        setLoading(false);
      },
      snapshotError => {
        console.error(
          'Admin notification listener error:',
          snapshotError,
        );
        setLoading(false);
        loadNotifications();
      },
    );

    return unsubscribe;
  }, [adminId, loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter(item => !item.isRead).length,
    [notifications],
  );

  const markAsRead = async (notification: AdminNotification) => {
    if (notification.isRead) {
      return;
    }

    try {
      await updateDoc(
        doc(firestore, 'admin_notifications', notification.id),
        {
          isRead: true,
          readAt: serverTimestamp(),
        },
      );

      setNotifications(current =>
        current.map(item =>
          item.id === notification.id
            ? {...item, isRead: true}
            : item,
        ),
      );
    } catch (err) {
      console.error('Mark notification read error:', err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(item => !item.isRead);

    if (!unread.length || markingAll) {
      return;
    }

    try {
      setMarkingAll(true);

      const batch = writeBatch(firestore);

      unread.forEach(item => {
        batch.update(
          doc(firestore, 'admin_notifications', item.id),
          {
            isRead: true,
            readAt: serverTimestamp(),
          },
        );
      });

      await batch.commit();

      setNotifications(current =>
        current.map(item => ({
          ...item,
          isRead: true,
        })),
      );
    } catch (err) {
      console.error('Mark all notifications read error:', err);
      Alert.alert(
        'Something went wrong',
        'Unable to mark all notifications as read.',
      );
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationPress = async (
    notification: AdminNotification,
  ) => {
    // Tapping a notification only marks it as read.
    // No extra message or navigation is shown.
    await markAsRead(notification);
  };

  const renderNotification = ({
    item,
  }: {
    item: AdminNotification;
  }) => {
    const palette = getNotificationColors(item.type);
    const isUnread = !item.isRead;

    return (
      <Pressable
        onPress={() => handleNotificationPress(item)}
        style={({pressed}) => [
          styles.notificationCard,
          {backgroundColor: palette.bg},
          isUnread && styles.unreadCard,
          pressed && styles.cardPressed,
        ]}>
        <View
          style={[
            styles.notificationIcon,
            {backgroundColor: palette.iconBg},
          ]}>
          <Text style={styles.notificationEmoji}>
            {getNotificationIcon(item.type)}
          </Text>
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.notificationTitle,
                isUnread && styles.unreadTitle,
              ]}
              numberOfLines={1}>
              {item.title || 'Notification'}
            </Text>

            {isUnread && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.notificationMessage}>
            {item.message || 'You have a new notification.'}
          </Text>

          {item.complaintId ? (
            <View style={styles.complaintIdPill}>
              <Text style={styles.complaintIdText}>
                {item.complaintId}
              </Text>
            </View>
          ) : null}

          <Text style={styles.notificationDate}>
            {formatDate(item.createdAt)}
          </Text>
        </View>

        {item.complaintId &&
        item.type !== 'complaint_deleted' ? (
          <Text style={styles.chevron}>›</Text>
        ) : null}
      </Pressable>
    );
  };

  const emptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconCircle}>
        <Text style={styles.emptyIcon}>🔔</Text>
      </View>

      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyMessage}>
        You're all caught up. New complaint notifications will
        appear here.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
      />

      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            style={({pressed}) => [
              styles.backButton,
              pressed && styles.pressedSmall,
            ]}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <View style={styles.headerTitleRow}>
              <Text style={styles.headerTitle}>Notifications</Text>

              {unreadCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.headerSubtitle}>
              Stay updated with campus complaints
            </Text>
          </View>

          <View style={styles.headerBell}>
            <Text style={styles.headerBellText}>🔔</Text>
          </View>
        </View>

        <View style={styles.toolbar}>
          <View>
            <Text style={styles.toolbarTitle}>
              {unreadCount > 0
                ? `${unreadCount} unread`
                : 'All notifications read'}
            </Text>
            <Text style={styles.toolbarSubtitle}>
              Admin alerts
            </Text>
          </View>

          <Pressable
            onPress={markAllAsRead}
            disabled={!unreadCount || markingAll}
            style={({pressed}) => [
              styles.markAllButton,
              (!unreadCount || markingAll) &&
                styles.markAllDisabled,
              pressed && unreadCount > 0 && styles.pressedSmall,
            ]}>
            {markingAll ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <Text style={styles.markAllText}>
                Mark all read
              </Text>
            )}
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>
              Loading notifications...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <View style={styles.errorIconCircle}>
              <Text style={styles.errorIcon}>!</Text>
            </View>
            <Text style={styles.errorTitle}>
              Unable to load notifications
            </Text>
            <Text style={styles.errorMessage}>{error}</Text>

            <Pressable
              onPress={loadNotifications}
              style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={notifications}
            keyExtractor={item => item.id}
            renderItem={renderNotification}
            contentContainerStyle={[
              styles.listContent,
              !notifications.length && styles.emptyListContent,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadNotifications();
                }}
                tintColor="#2563EB"
              />
            }
            ListEmptyComponent={emptyState}
          />
        )}

        <Text style={styles.footerText}>
          Campus Complaint Management System
        </Text>
      </View>
    </SafeAreaView>
  );
};

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
    paddingTop: 44,
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

  pressedSmall: {
    opacity: 0.65,
  },

  headerTitleWrap: {
    flex: 1,
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.4,
  },

  countBadge: {
    minWidth: 24,
    height: 22,
    paddingHorizontal: 6,
    borderRadius: 11,
    marginLeft: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },

  headerBell: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  headerBellText: {
    fontSize: 20,
  },

  toolbar: {
    minHeight: 67,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  toolbarTitle: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '800',
  },

  toolbarSubtitle: {
    marginTop: 2,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },

  markAllButton: {
    minHeight: 36,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  markAllDisabled: {
    opacity: 0.45,
  },

  markAllText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
  },

  listContent: {
    paddingBottom: 10,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  notificationCard: {
    minHeight: 104,
    marginBottom: 11,
    padding: 13,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  unreadCard: {
    borderColor: '#BFDBFE',
    shadowColor: '#2563EB',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },

  cardPressed: {
    opacity: 0.76,
    transform: [{scale: 0.995}],
  },

  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  notificationEmoji: {
    fontSize: 19,
  },

  notificationContent: {
    flex: 1,
    minWidth: 0,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 5,
  },

  notificationTitle: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
  },

  unreadTitle: {
    color: '#111827',
    fontWeight: '900',
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 6,
  },

  notificationMessage: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
    fontWeight: '500',
  },

  complaintIdPill: {
    alignSelf: 'flex-start',
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  complaintIdText: {
    fontSize: 9,
    color: '#475569',
    fontWeight: '800',
  },

  notificationDate: {
    marginTop: 6,
    fontSize: 9,
    color: '#94A3B8',
    fontWeight: '600',
  },

  chevron: {
    alignSelf: 'center',
    marginLeft: 5,
    fontSize: 25,
    color: '#94A3B8',
    fontWeight: '300',
  },

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  errorIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorIcon: {
    fontSize: 25,
    color: '#DC2626',
    fontWeight: '900',
  },

  errorTitle: {
    marginTop: 14,
    fontSize: 16,
    color: '#111827',
    fontWeight: '900',
    textAlign: 'center',
  },

  errorMessage: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 17,
    color: '#64748B',
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: '#2563EB',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },

  emptyIconCircle: {
    width: 78,
    height: 78,
    borderRadius: 26,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },

  emptyIcon: {
    fontSize: 31,
  },

  emptyTitle: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '900',
  },

  emptyMessage: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 18,
    color: '#94A3B8',
    textAlign: 'center',
    fontWeight: '600',
  },

  footerText: {
    paddingTop: 7,
    paddingBottom: 5,
    textAlign: 'center',
    fontSize: 9,
    color: '#A1A1AA',
    fontWeight: '600',
  },
});

export default AdminNotificationsScreen;
