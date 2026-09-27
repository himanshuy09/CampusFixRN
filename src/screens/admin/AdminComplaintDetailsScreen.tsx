import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from '@react-native-firebase/firestore';

import {auth, firestore} from '../../firebase/config';
import type {AdminComplaint} from './AdminComplaintsScreen';

type Props = {
  complaint: AdminComplaint;
  collegeId: string;
  onBack: () => void;
};

const STATUS_OPTIONS = [
  'Submitted',
  'Assigned',
  'In Progress',
  'Resolved',
];

const DEPARTMENT_OPTIONS = [
  'Electrical',
  'Water Supply',
  'Cleanliness',
  'Maintenance',
  'IT / Internet',
  'Security',
  'Administration',
  'Other',
];

const getStatusStyle = (status?: string) => {
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

const formatDateTime = (value: any) => {
  try {
    if (!value) {
      return 'Not available';
    }

    const date =
      typeof value?.toDate === 'function'
        ? value.toDate()
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

const AdminComplaintDetailsScreen = ({
  complaint,
  collegeId,
  onBack,
}: Props) => {
  const [currentStatus, setCurrentStatus] = useState(
    complaint.status || 'Submitted',
  );
  const [department, setDepartment] = useState(
    complaint.department || '',
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [departmentMenuVisible, setDepartmentMenuVisible] = useState(false);
  const [studentName, setStudentName] = useState(
    complaint.name || 'Student',
  );

  const statusColors = useMemo(
    () => getStatusStyle(currentStatus),
    [currentStatus],
  );

  useEffect(() => {
    setCurrentStatus(complaint.status || 'Submitted');
    setDepartment(complaint.department || '');
    setDepartmentMenuVisible(false);
    setStudentName(complaint.name || 'Student');
  }, [complaint]);

  const notifyStudent = async (nextStatus: string) => {
    if (!complaint.userId) {
      return;
    }

    const notificationRef = doc(
      collection(firestore, 'notifications'),
    );

    const statusMessage =
      nextStatus === 'Resolved'
        ? `Your complaint ${complaint.complaintId || ''} has been resolved.`
        : `Your complaint ${
            complaint.complaintId || ''
          } status has been updated to ${nextStatus}.`;

    await setDoc(notificationRef, {
      userId: complaint.userId,
      complaintId: complaint.complaintId || complaint.id,
      title:
        nextStatus === 'Resolved'
          ? 'Complaint Resolved'
          : 'Complaint Status Updated',
      message: statusMessage.trim(),
      type: 'status_update',
      isRead: false,
      createdAt: serverTimestamp(),
    });
  };

  const updateStatus = async (nextStatus: string) => {
    if (nextStatus === currentStatus) {
      return;
    }

    const admin = auth.currentUser;

    if (!admin) {
      Alert.alert('Session Expired', 'Please sign in again.');
      return;
    }

    try {
      setSaving(true);

      const complaintRef = doc(
        firestore,
        'complaints',
        complaint.id,
      );

      // Re-read the complaint before updating so the admin cannot
      // accidentally update a stale record from the list screen.
      const snapshot = await getDoc(complaintRef);

      if (!snapshot.exists()) {
        throw new Error('Complaint no longer exists.');
      }

      const latest = snapshot.data();

      if (
        latest?.collegeId &&
        String(latest.collegeId) !== String(collegeId)
      ) {
        throw new Error(
          'You are not allowed to update this complaint.',
        );
      }

      await updateDoc(complaintRef, {
        status: nextStatus,
        department: department.trim(),
        updatedAt: serverTimestamp(),
      });

      await notifyStudent(nextStatus);

      setCurrentStatus(nextStatus);

      Alert.alert(
        'Status Updated',
        `${complaint.complaintId || 'Complaint'} is now ${nextStatus}.`,
      );
    } catch (error: any) {
      console.error('Admin complaint status update error:', error);

      Alert.alert(
        'Update Failed',
        error?.message || 'Unable to update complaint status.',
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteComplaint = () => {
    if (deleting || saving) {
      return;
    }

    Alert.alert(
      'Delete Complaint',
      `Are you sure you want to delete ${
        complaint.complaintId || 'this complaint'
      }? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const admin = auth.currentUser;

            if (!admin) {
              Alert.alert('Session Expired', 'Please sign in again.');
              return;
            }

            try {
              setDeleting(true);

              const complaintRef = doc(
                firestore,
                'complaints',
                complaint.id,
              );

              // Re-read before deleting to verify that the complaint
              // still belongs to the admin's college.
              const snapshot = await getDoc(complaintRef);

              if (!snapshot.exists()) {
                throw new Error('Complaint no longer exists.');
              }

              const latest = snapshot.data();

              if (
                latest?.collegeId &&
                String(latest.collegeId) !== String(collegeId)
              ) {
                throw new Error(
                  'You are not allowed to delete this complaint.',
                );
              }

              await deleteDoc(complaintRef);

              // Notify the student who originally submitted the complaint.
              if (complaint.userId) {
                const notificationRef = doc(
                  collection(firestore, 'notifications'),
                );

                await setDoc(notificationRef, {
                  userId: complaint.userId,
                  complaintId:
                    complaint.complaintId || complaint.id,
                  title: 'Complaint Deleted',
                  message: `Your complaint ${
                    complaint.complaintId || ''
                  } has been deleted by the college administration.`,
                  type: 'complaint_deleted',
                  isRead: false,
                  createdAt: serverTimestamp(),
                });
              }

              Alert.alert(
                'Complaint Deleted',
                'The complaint has been deleted and the student has been notified.',
                [
                  {
                    text: 'OK',
                    onPress: onBack,
                  },
                ],
              );
            } catch (error: any) {
              console.error(
                'Admin complaint deletion error:',
                error,
              );

              Alert.alert(
                'Delete Failed',
                error?.message ||
                  'Unable to delete this complaint.',
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
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
          <Text style={styles.headerTitle}>Complaint Details</Text>
          <Text style={styles.headerSubtitle}>
            Review and manage complaint
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            {backgroundColor: statusColors.backgroundColor},
          ]}>
          <Text style={[styles.statusText, {color: statusColors.color}]}>
            {currentStatus}
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
              {complaint.category || 'Other'}
            </Text>

            <Text style={styles.complaintId}>
              {complaint.complaintId || 'Complaint ID unavailable'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Complaint Information
          </Text>

          <DetailRow
            label="Category"
            value={complaint.category || 'Other'}
          />

          <DetailRow
            label="Location"
            value={complaint.location || 'Not specified'}
          />

          <DetailRow
            label="Priority"
            value={complaint.priority || 'Medium'}
          />

          <View style={styles.assignedDepartmentRow}>
            <View style={styles.assignedDepartmentIcon}>
              <Text style={styles.assignedDepartmentIconText}>⌂</Text>
            </View>
            <View style={styles.assignedDepartmentText}>
              <Text style={styles.detailLabel}>Assigned Department</Text>
              <Text style={styles.assignedDepartmentValue}>
                {department || 'Not assigned'}
              </Text>
            </View>
          </View>

          <DetailRow
            label="Submitted"
            value={formatDateTime(complaint.createdAt)}
          />

          <View style={styles.priorityRow}>
            <Text style={styles.detailLabel}>Priority</Text>
            <Text
              style={[
                styles.priorityValue,
                {color: getPriorityColor(complaint.priority)},
              ]}>
              {complaint.priority || 'Medium'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Complaint Description
          </Text>

          <View style={styles.descriptionBox}>
            <Text style={styles.description}>
              {complaint.description || 'No description provided.'}
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Student Details</Text>

          <DetailRow
            label="Name"
            value={studentName}
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
            value={complaint.collegeId || collegeId}
          />
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.departmentHeader}>
            <View style={styles.departmentHeaderText}>
              <Text style={styles.sectionTitle}>Assign Department</Text>
              <Text style={styles.sectionSubtitle}>
                Choose the department responsible for this complaint
              </Text>
            </View>

            <View style={styles.departmentBadge}>
              <Text style={styles.departmentBadgeText}>ADMIN</Text>
            </View>
          </View>

          <View style={styles.departmentDropdownWrap}>
            <TouchableOpacity
              style={[
                styles.departmentDropdown,
                departmentMenuVisible && styles.departmentDropdownActive,
              ]}
              onPress={() => setDepartmentMenuVisible(value => !value)}
              disabled={saving}
              activeOpacity={0.85}>
              <View style={styles.departmentDropdownLeft}>
                <View style={styles.departmentDropdownIcon}>
                  <Text style={styles.departmentDropdownIconText}>⌂</Text>
                </View>

                <View style={styles.departmentDropdownTextWrap}>
                  <Text style={styles.departmentDropdownLabel}>
                    Department
                  </Text>
                  <Text
                    style={[
                      styles.departmentDropdownValue,
                      !department && styles.departmentPlaceholder,
                    ]}>
                    {department || 'Select department'}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.departmentChevron,
                  departmentMenuVisible && styles.departmentChevronOpen,
                ]}>
                ⌄
              </Text>
            </TouchableOpacity>

            {departmentMenuVisible && (
              <View style={styles.departmentFloatingMenu}>
                <Text style={styles.departmentMenuTitle}>
                  Select Department
                </Text>

                {DEPARTMENT_OPTIONS.map(option => {
                  const selected = department === option;

                  return (
                    <Pressable
                      key={option}
                      style={[
                        styles.departmentMenuItem,
                        selected && styles.departmentMenuItemSelected,
                      ]}
                      onPress={() => {
                        setDepartment(option);
                        setDepartmentMenuVisible(false);
                      }}>
                      <View style={styles.departmentMenuItemLeft}>
                        <View
                          style={[
                            styles.departmentMenuDot,
                            selected && styles.departmentMenuDotSelected,
                          ]}
                        />
                        <Text
                          style={[
                            styles.departmentMenuItemText,
                            selected &&
                              styles.departmentMenuItemTextSelected,
                          ]}>
                          {option}
                        </Text>
                      </View>

                      {selected && (
                        <Text style={styles.departmentCheck}>✓</Text>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.departmentHint}>
            <Text style={styles.departmentHintIcon}>ⓘ</Text>
            <Text style={styles.departmentHintText}>
              The selected department will be saved with the complaint
              when you update its status.
            </Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusHeaderText}>
              <Text style={styles.sectionTitle}>
                Update Status
              </Text>
              <Text style={styles.sectionSubtitle}>
                Select the current complaint stage
              </Text>
            </View>

            {saving && (
              <ActivityIndicator size="small" color="#2563EB" />
            )}
          </View>

          <View style={styles.statusOptions}>
            {STATUS_OPTIONS.map(status => {
              const selected = currentStatus === status;
              const colors = getStatusStyle(status);

              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    selected && {
                      backgroundColor: colors.backgroundColor,
                      borderColor: colors.color,
                    },
                  ]}
                  onPress={() => updateStatus(status)}
                  disabled={saving}
                  activeOpacity={0.8}>
                  <View
                    style={[
                      styles.statusRadio,
                      selected && {
                        borderColor: colors.color,
                        backgroundColor: colors.color,
                      },
                    ]}>
                    {selected && (
                      <Text style={styles.radioCheck}>✓</Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.statusOptionText,
                      selected && {color: colors.color},
                    ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            (deleting || saving) && styles.deleteButtonDisabled,
          ]}
          onPress={deleteComplaint}
          disabled={deleting || saving}
          activeOpacity={0.82}>
          {deleting ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <>
              <View style={styles.deleteIconCircle}>
                <Text style={styles.deleteIcon}>⌫</Text>
              </View>

              <View style={styles.deleteButtonTextWrap}>
                <Text style={styles.deleteButtonTitle}>
                  Delete Complaint
                </Text>
                <Text style={styles.deleteButtonSubtitle}>
                  Permanently remove this complaint
                </Text>
              </View>

              <Text style={styles.deleteArrow}>›</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.deleteWarning}>
          This action cannot be undone. The student will receive a
          notification after deletion.
        </Text>

        <Text style={styles.footerText}>
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
    minHeight: 88,
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 8,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },

  headerSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
  },

  statusPill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 35,
  },

  heroCard: {
    minHeight: 105,
    padding: 17,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 3,
  },

  heroIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginRight: 13,
  },

  heroIconText: {
    fontSize: 27,
    color: '#2563EB',
  },

  heroText: {
    flex: 1,
  },

  category: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  complaintId: {
    marginTop: 5,
    fontSize: 12,
    color: '#DBEAFE',
    fontWeight: '600',
  },

  sectionCard: {
    marginTop: 14,
    padding: 17,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  sectionSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#6B7280',
  },

  detailRow: {
    marginTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },

  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  detailValue: {
    marginTop: 4,
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },

  priorityRow: {
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  priorityValue: {
    fontSize: 13,
    fontWeight: '800',
  },

  descriptionBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 13,
    backgroundColor: '#F7F9FC',
  },

  description: {
    fontSize: 13,
    lineHeight: 20,
    color: '#374151',
  },

  assignedDepartmentRow: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
  },

  assignedDepartmentIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    marginRight: 10,
  },

  assignedDepartmentIconText: {
    fontSize: 19,
    color: '#2563EB',
    fontWeight: '800',
  },

  assignedDepartmentText: {
    flex: 1,
  },

  assignedDepartmentValue: {
    marginTop: 4,
    fontSize: 14,
    color: '#111827',
    fontWeight: '800',
  },

  departmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  departmentHeaderText: {
    flex: 1,
    paddingRight: 8,
  },

  departmentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },

  departmentBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#4F46E5',
    letterSpacing: 0.7,
  },

  departmentDropdownWrap: {
    position: 'relative',
    zIndex: 20,
    marginTop: 14,
  },

  departmentDropdown: {
    minHeight: 62,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  departmentDropdownActive: {
    borderColor: '#2563EB',
    backgroundColor: '#F8FBFF',
  },

  departmentDropdownLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  departmentDropdownIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    marginRight: 10,
  },

  departmentDropdownIconText: {
    fontSize: 18,
    color: '#2563EB',
    fontWeight: '800',
  },

  departmentDropdownTextWrap: {
    flex: 1,
  },

  departmentDropdownLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  departmentDropdownValue: {
    marginTop: 3,
    fontSize: 14,
    color: '#111827',
    fontWeight: '800',
  },

  departmentPlaceholder: {
    color: '#9CA3AF',
    fontWeight: '600',
  },

  departmentChevron: {
    fontSize: 21,
    color: '#6B7280',
    marginLeft: 8,
  },

  departmentChevronOpen: {
    transform: [{rotate: '180deg'}],
    color: '#2563EB',
  },

  departmentFloatingMenu: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 68,
    padding: 9,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#111827',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 10,
    zIndex: 50,
  },

  departmentMenuTitle: {
    paddingHorizontal: 10,
    paddingTop: 4,
    paddingBottom: 8,
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  departmentMenuItem: {
    minHeight: 43,
    paddingHorizontal: 10,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  departmentMenuItemSelected: {
    backgroundColor: '#EFF6FF',
  },

  departmentMenuItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  departmentMenuDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginRight: 10,
  },

  departmentMenuDotSelected: {
    backgroundColor: '#2563EB',
  },

  departmentMenuItemText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },

  departmentMenuItemTextSelected: {
    color: '#1D4ED8',
    fontWeight: '800',
  },

  departmentCheck: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '900',
  },

  departmentHint: {
    marginTop: 10,
    padding: 10,
    borderRadius: 11,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  departmentHintIcon: {
    fontSize: 13,
    color: '#64748B',
    marginRight: 7,
    marginTop: 1,
  },

  departmentHintText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    color: '#64748B',
  },

  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  statusHeaderText: {
    flex: 1,
  },

  statusOptions: {
    marginTop: 14,
  },

  statusOption: {
    minHeight: 48,
    marginBottom: 9,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },

  statusRadio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },

  radioCheck: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },

  statusOptionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },

  deleteButton: {
    marginTop: 18,
    minHeight: 70,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 17,
    backgroundColor: '#FFF7F7',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },

  deleteButtonDisabled: {
    opacity: 0.55,
  },

  deleteIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginRight: 11,
  },

  deleteIcon: {
    fontSize: 21,
    color: '#DC2626',
    fontWeight: '900',
  },

  deleteButtonTextWrap: {
    flex: 1,
  },

  deleteButtonTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B91C1C',
  },

  deleteButtonSubtitle: {
    marginTop: 3,
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  deleteArrow: {
    fontSize: 26,
    color: '#DC2626',
    fontWeight: '400',
    marginLeft: 6,
  },

  deleteWarning: {
    marginTop: 8,
    paddingHorizontal: 6,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 15,
    color: '#9CA3AF',
  },

  footerText: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
  },
});

export default AdminComplaintDetailsScreen;
