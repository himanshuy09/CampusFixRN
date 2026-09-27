import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {collection, getDocs, query, where} from '@react-native-firebase/firestore';
import {auth, firestore} from '../../firebase/config';

export type Complaint = {
  id: string;
  complaintId?: string;
  userId?: string;
  name?: string;
  email?: string;
  rollNumber?: string;
  mobileNumber?: string;
  collegeId?: string;
  category?: string;
  location?: string;
  description?: string;
  priority?: string;
  status?: string;
  department?: string;
  createdAt?: any;
  updatedAt?: any;
};

type Props = {
  onBack: () => void;
  onComplaintPress?: (complaint: Complaint) => void;
};

const formatDate = (value: any) => {
  try {
    if (!value) return 'Date unavailable';
    const date = typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Date unavailable';
  }
};

const statusStyle = (status?: string) => {
  const value = (status || 'Submitted').toLowerCase();
  if (value.includes('resolved') || value.includes('closed')) {
    return {backgroundColor: '#DCFCE7', color: '#15803D'};
  }
  if (value.includes('progress')) {
    return {backgroundColor: '#DBEAFE', color: '#1D4ED8'};
  }
  if (value.includes('pending')) {
    return {backgroundColor: '#FEF3C7', color: '#B45309'};
  }
  return {backgroundColor: '#EDE9FE', color: '#6D28D9'};
};

const priorityStyle = (priority?: string) => {
  const value = (priority || 'Medium').toLowerCase();
  if (value === 'high') return {color: '#DC2626'};
  if (value === 'low') return {color: '#16A34A'};
  return {color: '#D97706'};
};

const MyComplaintsScreen = ({onBack, onComplaintPress}: Props) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadComplaints = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      setComplaints([]);
      setError('Please sign in again to view your complaints.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError('');
      const complaintsQuery = query(
        collection(firestore, 'complaints'),
        where('userId', '==', user.uid),
      );

      const snapshot = await getDocs(complaintsQuery);
      const data: Complaint[] = [];

      snapshot.forEach(documentSnapshot => {
        data.push({
          id: documentSnapshot.id,
          ...(documentSnapshot.data() as Omit<Complaint, 'id'>),
        });
      });

      // Sort locally by createdAt so Firestore does not need
      // a composite index for userId + createdAt.
      const getTimestamp = (value: any) => {
        if (!value) {
          return 0;
        }

        try {
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

      data.sort(
        (a, b) =>
          getTimestamp(b.createdAt) - getTimestamp(a.createdAt),
      );

      setComplaints(data);
    } catch (err: any) {
      console.error('Error loading complaints:', err);
      setError(err?.message || 'Unable to load your complaints.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const onRefresh = () => {
    setRefreshing(true);
    loadComplaints();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.75}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>My Complaints</Text>
          <Text style={styles.headerSubtitle}>
            Track your submitted complaints
          </Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{complaints.length}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading your complaints...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <View style={styles.stateIconCircle}>
            <Text style={styles.stateIcon}>!</Text>
          </View>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadComplaints}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : complaints.length === 0 ? (
        <View style={styles.centerState}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>✓</Text>
          </View>
          <Text style={styles.emptyTitle}>No Complaints Yet</Text>
          <Text style={styles.stateText}>
            You haven't submitted any complaints. Your submitted complaints will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Text style={styles.searchIcon}>⌕</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Complaint ID"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.7}>
                  <Text style={styles.clearSearchText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {(() => {
            const normalizedSearch = searchQuery.trim().toLowerCase();
            const filteredComplaints = normalizedSearch
              ? complaints.filter(complaint =>
                  (complaint.complaintId || '')
                    .toLowerCase()
                    .includes(normalizedSearch),
                )
              : complaints;

            if (filteredComplaints.length === 0) {
              return (
                <View style={styles.searchEmptyState}>
                  <View style={styles.searchEmptyIconCircle}>
                    <Text style={styles.searchEmptyIcon}>⌕</Text>
                  </View>
                  <Text style={styles.emptyTitle}>Complaint Not Found</Text>
                  <Text style={styles.stateText}>
                    No complaint matches "{searchQuery.trim()}".
                  </Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={() => setSearchQuery('')}>
                    <Text style={styles.retryText}>Clear Search</Text>
                  </TouchableOpacity>
                </View>
              );
            }

            return filteredComplaints.map((complaint, index) => {
            const currentStatus = statusStyle(complaint.status);
            const currentPriority = priorityStyle(complaint.priority);

            return (
              <TouchableOpacity
                key={complaint.id}
                activeOpacity={0.85}
                style={styles.card}
                onPress={() => onComplaintPress?.(complaint)}>
                <View style={styles.cardTopRow}>
                  <View style={styles.categoryWrap}>
                    <View style={styles.categoryIcon}>
                      <Text style={styles.categoryIconText}>⚠</Text>
                    </View>
                    <View style={styles.categoryTextWrap}>
                      <Text style={styles.category} numberOfLines={1}>
                        {complaint.category || 'General'}
                      </Text>
                      <Text style={styles.complaintId} numberOfLines={1}>
                        {complaint.complaintId || `Complaint ${index + 1}`}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.statusBadge, {backgroundColor: currentStatus.backgroundColor}]}>
                    <Text style={[styles.statusText, {color: currentStatus.color}]}>
                      {complaint.status || 'Submitted'}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Location</Text>
                  <Text style={styles.infoValue} numberOfLines={1}>
                    {complaint.location || 'Not specified'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Priority</Text>
                  <Text style={[styles.infoValue, styles.priorityValue, currentPriority]}>
                    {complaint.priority || 'Medium'}
                  </Text>
                </View>

                <View style={styles.bottomRow}>
                  <Text style={styles.dateText}>{formatDate(complaint.createdAt)}</Text>
                  <Text style={styles.viewText}>View details  ›</Text>
                </View>
              </TouchableOpacity>
            );
            });
          })()}

          <Text style={styles.footer}>Campus Complaint Management System</Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F7F9FC'},
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
  backIcon: {fontSize: 32, lineHeight: 34, color: '#2563EB', marginTop: -3},
  headerTextWrap: {flex: 1},
  headerTitle: {fontSize: 21, fontWeight: '800', color: '#111827'},
  headerSubtitle: {fontSize: 12, color: '#6B7280', marginTop: 3},
  searchSection: {
    marginBottom: 14,
  },
  searchBar: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  searchIcon: {
    fontSize: 24,
    color: '#2563EB',
    marginRight: 7,
    marginTop: -3,
  },
  searchInput: {
    flex: 1,
    height: 52,
    paddingVertical: 0,
    paddingHorizontal: 0,
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  clearSearchButton: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F7',
    marginLeft: 6,
  },
  clearSearchText: {
    fontSize: 18,
    lineHeight: 20,
    color: '#6B7280',
    fontWeight: '700',
  },

  countBadge: {
    minWidth: 36,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 18,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {color: '#FFFFFF', fontSize: 14, fontWeight: '800'},
  scroll: {flex: 1},
  content: {padding: 16, paddingBottom: 24},
  summaryCard: {
    backgroundColor: '#2563EB',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {fontSize: 13, color: '#DBEAFE', fontWeight: '600'},
  summaryValue: {fontSize: 30, color: '#FFFFFF', fontWeight: '900', marginTop: 2},
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconText: {fontSize: 23},
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  cardTopRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  categoryWrap: {flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10},
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  categoryIconText: {fontSize: 20},
  categoryTextWrap: {flex: 1},
  category: {fontSize: 16, fontWeight: '800', color: '#111827'},
  complaintId: {fontSize: 11, color: '#6B7280', marginTop: 3},
  statusBadge: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, maxWidth: 115},
  statusText: {fontSize: 10, fontWeight: '800', textAlign: 'center'},
  divider: {height: 1, backgroundColor: '#EEF0F3', marginVertical: 14},
  infoRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  infoLabel: {width: 70, fontSize: 11, color: '#9CA3AF', fontWeight: '600'},
  infoValue: {flex: 1, fontSize: 12, color: '#374151', fontWeight: '600'},
  priorityValue: {fontWeight: '800'},
  bottomRow: {marginTop: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  dateText: {fontSize: 11, color: '#9CA3AF'},
  viewText: {fontSize: 12, color: '#2563EB', fontWeight: '800'},
  searchEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingTop: 110,
    paddingBottom: 100,
  },
  searchEmptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchEmptyIcon: {
    fontSize: 32,
    color: '#2563EB',
    fontWeight: '700',
  },
  centerState: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 35},
  stateText: {fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginTop: 8},
  stateIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateIcon: {fontSize: 30, color: '#DC2626', fontWeight: '900'},
  emptyIconCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {fontSize: 30, color: '#16A34A', fontWeight: '900'},
  emptyTitle: {fontSize: 19, fontWeight: '800', color: '#111827', marginTop: 15},
  retryButton: {marginTop: 18, backgroundColor: '#2563EB', paddingHorizontal: 22, paddingVertical: 11, borderRadius: 12},
  retryText: {color: '#FFFFFF', fontSize: 13, fontWeight: '800'},
  footer: {textAlign: 'center', color: '#9CA3AF', fontSize: 10, marginTop: 7, marginBottom: 6},
});

export default MyComplaintsScreen;
