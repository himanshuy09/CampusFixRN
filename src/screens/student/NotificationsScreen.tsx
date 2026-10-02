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
import {
  collection,
  getDocs,
  query,
  updateDoc,
  doc,
  where,
} from '@react-native-firebase/firestore';
import {auth, firestore} from '../../firebase/config';

type NotificationItem = {
  id: string;
  userId?: string;
  complaintId?: string;
  title?: string;
  message?: string;
  type?: string;
  isRead?: boolean;
  createdAt?: any;
};

type Props = {
  onBack: () => void;
};

const formatDateTime = (value: any) => {
  try {
    if (!value) {
      return 'Date unavailable';
    }

    const date =
      typeof value?.toDate === 'function'
        ? value.toDate()
        : value instanceof Date
        ? value
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Date unavailable';
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Date unavailable';
  }
};

const getTimestamp = (value: any) => {
  try {
    if (!value) {
      return 0;
    }

    if (typeof value.toMillis === 'function') {
      return value.toMillis();
    }

    if (typeof value.toDate === 'function') {
      return value.toDate().getTime();
    }

    if (value instanceof Date) {
      return value.getTime();
    }

    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
};

const getNotificationIcon = (item: NotificationItem) => {
  const type = (item.type || '').toLowerCase();
  const title = (item.title || '').toLowerCase();

  if (type.includes('resolved') || title.includes('resolved')) {
    return '✓';
  }

  if (type.includes('progress') || title.includes('progress')) {
    return '↻';
  }

  if (type.includes('submitted') || title.includes('submitted')) {
    return '✓';
  }

  return '🔔';
};

const NotificationsScreen = ({onBack}: Props) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      setNotifications([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const notificationsQuery = query(
        collection(firestore, 'notifications'),
        where('userId', '==', user.uid),
      );

      const snapshot = await getDocs(notificationsQuery);
      const data: NotificationItem[] = [];

      snapshot.forEach(notificationDoc => {
        data.push({
          id: notificationDoc.id,
          ...(notificationDoc.data() as Omit<NotificationItem, 'id'>),
        });
      });

      data.sort(
        (a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
      );

      setNotifications(data);
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      Alert.alert(
        'Unable to Load Notifications',
        error?.message || 'Please try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (notification: NotificationItem) => {
    if (notification.isRead) {
      return;
    }

    try {
      await updateDoc(doc(firestore, 'notifications', notification.id), {
        isRead: true,
      });

      setNotifications(current =>
        current.map(item =>
          item.id === notification.id
            ? {...item, isRead: true}
            : item,
        ),
      );
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(item => !item.isRead);

    if (unread.length === 0) {
      return;
    }

    try {
      await Promise.all(
        unread.map(item =>
          updateDoc(doc(firestore, 'notifications', item.id), {
            isRead: true,
          }),
        ),
      );

      setNotifications(current =>
        current.map(item => ({...item, isRead: true})),
      );
    } catch (error: any) {
      Alert.alert(
        'Unable to Update',
        error?.message || 'Could not mark all notifications as read.',
      );
    }
  };

  const unreadCount = notifications.filter(item => !item.isRead).length;

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
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
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            Stay updated on your complaints
          </Text>
        </View>

        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{unreadCount}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading notifications...</Text>
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
          {notifications.length > 0 && (
            <View style={styles.actionsRow}>
              <Text style={styles.unreadSummary}>
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount === 1 ? '' : 's'
                    }`
                  : 'All notifications read'}
              </Text>

              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={markAllAsRead}
                  activeOpacity={0.75}>
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>🔔</Text>
              </View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.stateText}>
                You are all caught up. Updates about your complaints will
                appear here.
              </Text>
            </View>
          ) : (
            notifications.map(notification => {
              const unread = !notification.isRead;

              return (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationCard,
                    unread && styles.unreadCard,
                  ]}
                  activeOpacity={0.82}
                  onPress={() => markAsRead(notification)}>
                  <View
                    style={[
                      styles.notificationIcon,
                      unread && styles.notificationIconUnread,
                    ]}>
                    <Text
                      style={[
                        styles.notificationIconText,
                        unread && styles.notificationIconTextUnread,
                      ]}>
                      {getNotificationIcon(notification)}
                    </Text>
                  </View>

                  <View style={styles.notificationBody}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[
                          styles.notificationTitle,
                          unread && styles.unreadTitle,
                        ]}
                        numberOfLines={1}>
                        {notification.title || 'CampusFix Update'}
                      </Text>

                      {unread && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.notificationMessage}>
                      {notification.message || 'You have a new notification.'}
                    </Text>

                    {notification.complaintId ? (
                      <Text style={styles.complaintId}>
                        Complaint: {notification.complaintId}
                      </Text>
                    ) : null}

                    <Text style={styles.notificationDate}>
                      {formatDateTime(notification.createdAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

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
    paddingTop: 48,
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
  headerBadge: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  actionsRow: {
    minHeight: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  unreadSummary: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  markAllText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '900',
  },
  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    flexDirection: 'row',
    shadowOpacity: 0.04,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  unreadCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FBFF',
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationIconUnread: {
    backgroundColor: '#EFF6FF',
  },
  notificationIconText: {
    fontSize: 18,
    color: '#64748B',
  },
  notificationIconTextUnread: {
    color: '#2563EB',
  },
  notificationBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationTitle: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
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
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
    marginTop: 5,
  },
  complaintId: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '800',
    marginTop: 7,
  },
  notificationDate: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 6,
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
  emptyState: {
    flex: 1,
    minHeight: 430,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 31,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    marginTop: 15,
  },
  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 8,
  },
});

export default NotificationsScreen;
