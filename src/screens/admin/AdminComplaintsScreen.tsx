import React, {useCallback, useEffect, useMemo, useState} from 'react';
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

export type AdminComplaint = {
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
  collegeId: string;
  onBack: () => void;
  onComplaintPress?: (complaint: AdminComplaint) => void;
};

const STATUS_FILTERS = [
  'All',
  'Submitted',
  'Assigned',
  'In Progress',
  'Resolved',
];

const formatDate = (value: any) => {
  try {
    if (!value) {
      return 'Date unavailable';
    }

    const date =
      typeof value?.toDate === 'function'
        ? value.toDate()
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Date unavailable';
    }

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

  if (value.includes('resolved')) {
    return {
      backgroundColor: '#DCFCE7',
      color: '#15803D',
    };
  }

  if (value.includes('progress')) {
    return {
      backgroundColor: '#DBEAFE',
      color: '#1D4ED8',
    };
  }

  if (value.includes('assigned')) {
    return {
      backgroundColor: '#FEF3C7',
      color: '#B45309',
    };
  }

  return {
    backgroundColor: '#EDE9FE',
    color: '#6D28D9',
  };
};

const priorityStyle = (priority?: string) => {
  const value = (priority || 'Medium').toLowerCase();

  if (value === 'high') {
    return '#DC2626';
  }

  if (value === 'low') {
    return '#16A34A';
  }

  return '#D97706';
};

const AdminComplaintCard = ({
  complaint,
  onPress,
}: {
  complaint: AdminComplaint;
  onPress: () => void;
}) => {
  const status = complaint.status || 'Submitted';
  const statusColors = statusStyle(status);

  return (
    <TouchableOpacity
      style={styles.complaintCard}
      onPress={onPress}
      activeOpacity={0.82}>
      <View style={styles.cardTopRow}>
        <View style={styles.categoryWrap}>
          <View style={styles.categoryIcon}>
            <Text style={styles.categoryIconText}>⚠</Text>
          </View>

          <View style={styles.categoryTextWrap}>
            <Text style={styles.category} numberOfLines={1}>
              {complaint.category || 'Other'}
            </Text>

            <Text style={styles.complaintId} numberOfLines={1}>
              {complaint.complaintId || 'Complaint ID unavailable'}
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusPill,
            {backgroundColor: statusColors.backgroundColor},
          ]}>
          <Text style={[styles.statusText, {color: statusColors.color}]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>👤</Text>
        <Text style={styles.infoText} numberOfLines={1}>
          {complaint.name || 'Student'}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoIcon}>📍</Text>
        <Text style={styles.locationText} numberOfLines={1}>
          {complaint.location || 'Location not specified'}
        </Text>
      </View>

      <View style={styles.cardBottomRow}>
        <Text
          style={[
            styles.priorityText,
            {color: priorityStyle(complaint.priority)},
          ]}>
          {complaint.priority || 'Medium'} Priority
        </Text>

        <Text style={styles.dateText}>
          {formatDate(complaint.createdAt)}
        </Text>

        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const AdminComplaintsScreen = ({
  collegeId,
  onBack,
  onComplaintPress,
}: Props) => {
  const [complaints, setComplaints] = useState<AdminComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const loadComplaints = useCallback(async () => {
    const user = auth.currentUser;

    if (!user) {
      setComplaints([]);
      setError('Please sign in again to view complaints.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError('');

      // Admin sees complaints belonging only to their college.
      const complaintsQuery = query(
        collection(firestore, 'complaints'),
        where('collegeId', '==', collegeId),
      );

      const snapshot = await getDocs(complaintsQuery);
      const data: AdminComplaint[] = [];

      snapshot.forEach(documentSnapshot => {
        const raw = documentSnapshot.data() || {};

        data.push({
          id: documentSnapshot.id,
          complaintId: String(raw.complaintId || ''),
          userId: String(raw.userId || ''),
          name: String(raw.name || 'Student'),
          email: String(raw.email || ''),
          rollNumber: String(raw.rollNumber || ''),
          mobileNumber: String(raw.mobileNumber || ''),
          collegeId: String(raw.collegeId || ''),
          category: String(raw.category || 'Other'),
          location: String(raw.location || 'Not specified'),
          description: String(raw.description || ''),
          priority: String(raw.priority || 'Medium'),
          status: String(raw.status || 'Submitted'),
          department: String(raw.department || ''),
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt,
        });
      });

      data.sort((a, b) => {
        const aTime =
          typeof a.createdAt?.toMillis === 'function'
            ? a.createdAt.toMillis()
            : 0;

        const bTime =
          typeof b.createdAt?.toMillis === 'function'
            ? b.createdAt.toMillis()
            : 0;

        return bTime - aTime;
      });

      setComplaints(data);
    } catch (err: any) {
      console.error('Error loading admin complaints:', err);
      setError(
        err?.message || 'Unable to load complaints. Please try again.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [collegeId]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const filteredComplaints = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return complaints.filter(complaint => {
      const statusMatch =
        selectedFilter === 'All' ||
        (complaint.status || 'Submitted') === selectedFilter;

      if (!statusMatch) {
        return false;
      }

      if (!search) {
        return true;
      }

      return [
        complaint.complaintId,
        complaint.name,
        complaint.category,
        complaint.location,
        complaint.rollNumber,
      ].some(value =>
        String(value || '').toLowerCase().includes(search),
      );
    });
  }, [complaints, searchQuery, selectedFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadComplaints();
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
          <Text style={styles.headerTitle}>Complaints</Text>
          <Text style={styles.headerSubtitle}>
            Manage complaints from your college
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>{complaints.length}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search complaint ID, student..."
          placeholderTextColor="#9CA3AF"
          autoCapitalize="none"
          returnKeyType="search"
        />

        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}>
            <Text style={styles.clearText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContent}
        style={styles.filterScroll}>
        {STATUS_FILTERS.map(filter => {
          const selected = selectedFilter === filter;

          return (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                selected && styles.filterChipSelected,
              ]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextSelected,
                ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading complaints...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <View style={styles.stateIconCircle}>
            <Text style={styles.stateIcon}>!</Text>
          </View>

          <Text style={styles.emptyTitle}>Unable to Load</Text>
          <Text style={styles.stateText}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadComplaints}
            activeOpacity={0.8}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
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
              colors={['#2563EB']}
            />
          }>
          <View style={styles.resultsRow}>
            <Text style={styles.resultsTitle}>
              {selectedFilter === 'All'
                ? 'All Complaints'
                : selectedFilter}
            </Text>

            <Text style={styles.resultsCount}>
              {filteredComplaints.length} found
            </Text>
          </View>

          {filteredComplaints.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Text style={styles.emptyIcon}>✓</Text>
              </View>

              <Text style={styles.emptyTitle}>
                No Complaints Found
              </Text>

              <Text style={styles.stateText}>
                {searchQuery
                  ? 'Try a different search term.'
                  : 'There are no complaints in this category yet.'}
              </Text>
            </View>
          ) : (
            filteredComplaints.map(complaint => (
              <AdminComplaintCard
                key={complaint.id}
                complaint={complaint}
                onPress={() => onComplaintPress?.(complaint)}
              />
            ))
          )}

          <Text style={styles.footerText}>
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
    minHeight: 88,
    paddingHorizontal: 18,
    paddingTop: 44,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 11,
  },

  backIcon: {
    fontSize: 30,
    lineHeight: 32,
    color: '#111827',
    marginTop: -2,
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
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },

  countBadge: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 8,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F0FE',
  },

  countText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2563EB',
  },

  searchContainer: {
    marginHorizontal: 18,
    height: 48,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  searchIcon: {
    fontSize: 23,
    color: '#6B7280',
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    height: 46,
    paddingVertical: 0,
    fontSize: 13,
    color: '#111827',
  },

  clearButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearText: {
    fontSize: 23,
    color: '#6B7280',
  },

  filterScroll: {
    flexGrow: 0,
    marginTop: 12,
  },

  filterContent: {
    paddingHorizontal: 18,
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 15,
    height: 35,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  filterChipSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },

  filterTextSelected: {
    color: '#FFFFFF',
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 35,
  },

  resultsRow: {
    marginBottom: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  resultsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },

  resultsCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
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

  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  categoryWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },

  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    marginRight: 10,
  },

  categoryIconText: {
    fontSize: 18,
    color: '#2563EB',
  },

  categoryTextWrap: {
    flex: 1,
  },

  category: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },

  complaintId: {
    marginTop: 3,
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },

  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  infoRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoIcon: {
    width: 24,
    fontSize: 14,
  },

  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  locationText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
  },

  cardBottomRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  priorityText: {
    fontSize: 11,
    fontWeight: '800',
  },

  dateText: {
    marginLeft: 'auto',
    fontSize: 11,
    color: '#6B7280',
  },

  chevron: {
    marginLeft: 7,
    fontSize: 21,
    lineHeight: 20,
    color: '#9CA3AF',
  },

  centerState: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  stateIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
  },

  stateIcon: {
    fontSize: 25,
    fontWeight: '900',
    color: '#DC2626',
  },

  emptyCard: {
    marginTop: 5,
    padding: 30,
    borderRadius: 18,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F0FE',
  },

  emptyIcon: {
    fontSize: 27,
    fontWeight: '900',
    color: '#2563EB',
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#374151',
    textAlign: 'center',
  },

  stateText: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
    textAlign: 'center',
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
  },

  retryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  footerText: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default AdminComplaintsScreen;
