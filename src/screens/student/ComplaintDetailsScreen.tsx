import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Complaint = {
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
  complaint: Complaint;
  onBack: () => void;
};

const formatDateTime = (value: any) => {
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

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Not available';
  }
};

const getStatusStyle = (status?: string) => {
  const value = (status || 'Submitted').toLowerCase();

  if (value.includes('resolved') || value.includes('closed')) {
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

  if (value.includes('pending')) {
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

const getPriorityColor = (priority?: string) => {
  const value = (priority || 'Medium').toLowerCase();

  if (value === 'high') {
    return '#DC2626';
  }

  if (value === 'low') {
    return '#16A34A';
  }

  return '#D97706';
};

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || 'Not available'}</Text>
  </View>
);

const statusSteps = [
  {key: 'Submitted', label: 'Submitted', icon: '✓'},
  {key: 'Pending', label: 'Pending', icon: '…'},
  {key: 'In Progress', label: 'In Progress', icon: '↻'},
  {key: 'Resolved', label: 'Resolved', icon: '✓'},
];

const getStatusIndex = (status?: string) => {
  const value = (status || 'Submitted').toLowerCase();

  if (value.includes('resolved') || value.includes('closed')) {
    return 3;
  }

  if (value.includes('progress')) {
    return 2;
  }

  if (value.includes('pending')) {
    return 1;
  }

  return 0;
};

const StatusTracker = ({status}: {status?: string}) => {
  const activeIndex = getStatusIndex(status);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: activeIndex,
      duration: 750,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [activeIndex, progress]);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: ['0%', '33.33%', '66.66%', '100%'],
  });

  return (
    <View style={styles.statusCard}>
      <View style={styles.statusCardHeader}>
        <View>
          <Text style={styles.sectionTitle}>Complaint Status</Text>
          <Text style={styles.statusCardSubtitle}>
            Track the progress of your complaint
          </Text>
        </View>

        <View style={styles.liveStatusPill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveStatusText}>
            {status || 'Submitted'}
          </Text>
        </View>
      </View>

      <View style={styles.progressArea}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {width: progressWidth},
            ]}
          />
        </View>

        <View style={styles.stepsRow}>
          {statusSteps.map((step, index) => {
            const isCompleted = index <= activeIndex;
            const isCurrent = index === activeIndex;

            return (
              <View key={step.key} style={styles.stepItem}>
                <Animated.View
                  style={[
                    styles.stepCircle,
                    isCompleted && styles.stepCircleActive,
                    isCurrent && styles.stepCircleCurrent,
                    isCurrent && {
                      transform: [
                        {
                          scale: progress.interpolate({
                            inputRange: [
                              Math.max(0, activeIndex - 0.01),
                              activeIndex,
                              Math.min(3, activeIndex + 0.01),
                            ],
                            outputRange: [1, 1.08, 1.08],
                            extrapolate: 'clamp',
                          }),
                        },
                      ],
                    },
                  ]}>
                  <Text
                    style={[
                      styles.stepIcon,
                      isCompleted && styles.stepIconActive,
                    ]}>
                    {step.icon}
                  </Text>
                </Animated.View>

                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelActive,
                    isCurrent && styles.stepLabelCurrent,
                  ]}
                  numberOfLines={2}>
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const ComplaintDetailsScreen = ({complaint, onBack}: Props) => {
  const status = complaint.status || 'Submitted';
  const statusStyle = getStatusStyle(status);

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
          <Text style={styles.headerTitle}>Complaint Details</Text>
          <Text style={styles.headerSubtitle}>
            View your submitted complaint
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {backgroundColor: statusStyle.backgroundColor},
          ]}>
          <Text style={[styles.statusText, {color: statusStyle.color}]}>
            {status}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>⚠</Text>
          </View>

          <View style={styles.heroText}>
            <Text style={styles.category}>
              {complaint.category || 'General Complaint'}
            </Text>

            <Text style={styles.complaintId}>
              {complaint.complaintId || 'Complaint ID unavailable'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Complaint Information</Text>

          <DetailRow
            label="Category"
            value={complaint.category || 'General'}
          />

          <DetailRow
            label="Location"
            value={complaint.location || 'Not specified'}
          />

          <DetailRow
            label="Priority"
            value={complaint.priority || 'Medium'}
          />

          <DetailRow
            label="Department"
            value={complaint.department || 'Not assigned'}
          />

        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Complaint Description</Text>

          <View style={styles.descriptionBox}>
            <Text style={styles.description}>
              {complaint.description || 'No description provided.'}
            </Text>
          </View>
        </View>

        <StatusTracker status={status} />

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Submitted By</Text>

          <DetailRow
            label="Name"
            value={complaint.name || 'Not available'}
          />

          <DetailRow
            label="Roll Number"
            value={complaint.rollNumber || 'Not available'}
          />

          <DetailRow
            label="Email"
            value={complaint.email || 'Not available'}
          />

          <DetailRow
            label="Mobile"
            value={complaint.mobileNumber || 'Not available'}
          />

          <DetailRow
            label="College ID"
            value={complaint.collegeId || 'Not available'}
          />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Timeline</Text>

          <DetailRow
            label="Submitted"
            value={formatDateTime(complaint.createdAt)}
          />

          <DetailRow
            label="Last Updated"
            value={formatDateTime(complaint.updatedAt)}
          />
        </View>

        <View style={styles.bottomIdCard}>
          <Text style={styles.bottomIdLabel}>Complaint ID</Text>
          <Text style={styles.bottomIdValue}>
            {complaint.complaintId || complaint.id}
          </Text>
        </View>

        <Text style={styles.footer}>
          Campus Complaint Management System
        </Text>
      </ScrollView>
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
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    maxWidth: 105,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8ECF2',
    marginBottom: 14,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  heroIconText: {
    fontSize: 23,
  },
  heroText: {
    flex: 1,
  },
  category: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  complaintId: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    shadowOpacity: 0.05,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  statusCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  statusCardSubtitle: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: -6,
  },
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
    marginRight: 5,
  },
  liveStatusText: {
    fontSize: 9,
    color: '#1D4ED8',
    fontWeight: '800',
  },
  progressArea: {
    marginTop: 20,
  },
  progressTrack: {
    position: 'absolute',
    top: 15,
    left: 21,
    right: 21,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563EB',
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    width: '24%',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepCircleActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#60A5FA',
  },
  stepCircleCurrent: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    shadowOpacity: 0.18,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 2},
    elevation: 4,
  },
  stepIcon: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '900',
  },
  stepIconActive: {
    color: '#2563EB',
  },
  stepLabel: {
    marginTop: 8,
    fontSize: 9,
    lineHeight: 12,
    color: '#94A3B8',
    fontWeight: '700',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#64748B',
  },
  stepLabelCurrent: {
    color: '#1D4ED8',
    fontWeight: '900',
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
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  detailLabel: {
    width: 92,
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '700',
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
    lineHeight: 18,
  },
  descriptionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  description: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 21,
  },
  bottomIdCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  bottomIdLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  bottomIdValue: {
    fontSize: 15,
    color: '#1D4ED8',
    fontWeight: '900',
    marginTop: 4,
  },
  footer: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 2,
  },
});

export default ComplaintDetailsScreen;
