import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  complaintCategories,
  complaintPriorities,
  submitComplaint,
} from '../../services/complaintService';

type Props = {
  onBack: () => void;
};

const ReportComplaintScreen = ({onBack}: Props) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [location, setLocation] = useState('');
  const [selectedPriority, setSelectedPriority] =
    useState('Medium');
  const [description, setDescription] = useState('');

  const [categoryModalVisible, setCategoryModalVisible] =
    useState(false);
  const [priorityModalVisible, setPriorityModalVisible] =
    useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mobileError, setMobileError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {
    let valid = true;

    setMobileError('');
    setCategoryError('');
    setLocationError('');
    setDescriptionError('');

    const cleanMobile = mobileNumber.trim();
    const cleanLocation = location.trim();
    const cleanDescription = description.trim();

    if (!cleanMobile) {
      setMobileError('Mobile number is required');
      valid = false;
    } else if (
      cleanMobile.length !== 10 ||
      !/^\d{10}$/.test(cleanMobile)
    ) {
      setMobileError(
        'Enter a valid 10-digit mobile number',
      );
      valid = false;
    }

    if (!selectedCategory) {
      setCategoryError('Please select a category');
      valid = false;
    }

    if (!cleanLocation) {
      setLocationError('Location is required');
      valid = false;
    }

    if (!cleanDescription) {
      setDescriptionError('Please describe the issue');
      valid = false;
    } else if (cleanDescription.length < 10) {
      setDescriptionError(
        'Please provide a little more detail',
      );
      valid = false;
    }

    return valid;
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // This service follows the original Flutter business logic:
      // users/{uid} -> complaints -> student notification
      // -> same-college admin notifications.
      const result = await submitComplaint({
        mobileNumber: mobileNumber.trim(),
        category: selectedCategory,
        location: location.trim(),
        priority: selectedPriority,
        description: description.trim(),
      });

      Alert.alert(
        'Complaint Submitted',
        `Complaint ${result.complaintId} has been submitted successfully.`,
        [
          {
            text: 'OK',
            onPress: onBack,
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Submission Failed',
        error?.message ||
          'Failed to submit complaint. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // INPUT HELPERS
  // ============================================================

  const handleMobileChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');

    if (digitsOnly.length <= 10) {
      setMobileNumber(digitsOnly);
      if (mobileError) {
        setMobileError('');
      }
    }
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);

    if (locationError) {
      setLocationError('');
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);

    if (descriptionError) {
      setDescriptionError('');
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCategoryModalVisible(false);

    if (categoryError) {
      setCategoryError('');
    }
  };

  const handlePrioritySelect = (priority: string) => {
    setSelectedPriority(priority);
    setPriorityModalVisible(false);
  };

  // ============================================================
  // MAIN UI
  // ============================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios' ? 'padding' : undefined
      }>

      {/* App Bar */}

      <View style={styles.appBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          disabled={isSubmitting}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.appBarTitle}>
          Report an Issue
        </Text>

        <View style={styles.appBarSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>

        <View style={styles.formContainer}>

          {/* Heading */}

          <Text style={styles.heading}>
            Tell us what needs to be fixed
          </Text>

          <Text style={styles.subtitle}>
            Provide the details below so the campus team
            can resolve it quickly.
          </Text>

          <View style={styles.formSpacing} />

          {/* ==================================================
              MOBILE NUMBER
          =================================================== */}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Mobile Number
            </Text>

            <View
              style={[
                styles.inputContainer,
                mobileError && styles.inputError,
              ]}>

              <Text style={styles.inputIcon}>
                ☎
              </Text>

              <TextInput
                value={mobileNumber}
                onChangeText={handleMobileChange}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="Enter your mobile number"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />

              <Text style={styles.counterText}>
                {mobileNumber.length}/10
              </Text>

            </View>

            {mobileError ? (
              <Text style={styles.errorText}>
                {mobileError}
              </Text>
            ) : null}
          </View>

          {/* ==================================================
              CATEGORY
          =================================================== */}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Issue Category
            </Text>

            <TouchableOpacity
              style={[
                styles.inputContainer,
                categoryError && styles.inputError,
              ]}
              onPress={() =>
                setCategoryModalVisible(true)
              }>

              <Text style={styles.inputIcon}>
                ▦
              </Text>

              <Text
                style={[
                  styles.selectText,
                  !selectedCategory &&
                    styles.placeholderText,
                ]}>
                {selectedCategory ||
                  'Select issue category'}
              </Text>

              <Text style={styles.dropdownArrow}>
                ▾
              </Text>

            </TouchableOpacity>

            {categoryError ? (
              <Text style={styles.errorText}>
                {categoryError}
              </Text>
            ) : null}
          </View>

          {/* ==================================================
              LOCATION
          =================================================== */}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Location
            </Text>

            <View
              style={[
                styles.inputContainer,
                locationError && styles.inputError,
              ]}>

              <Text style={styles.inputIcon}>
                ⌖
              </Text>

              <TextInput
                value={location}
                onChangeText={handleLocationChange}
                placeholder="e.g. Block A, Room 204"
                placeholderTextColor="#9CA3AF"
                style={styles.input}
              />

            </View>

            {locationError ? (
              <Text style={styles.errorText}>
                {locationError}
              </Text>
            ) : null}
          </View>

          {/* ==================================================
              PRIORITY
          =================================================== */}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Priority
            </Text>

            <TouchableOpacity
              style={styles.inputContainer}
              onPress={() =>
                setPriorityModalVisible(true)
              }>

              <Text style={styles.inputIcon}>
                !
              </Text>

              <Text style={styles.selectText}>
                {selectedPriority}
              </Text>

              <Text style={styles.dropdownArrow}>
                ▾
              </Text>

            </TouchableOpacity>
          </View>

          {/* ==================================================
              DESCRIPTION
          =================================================== */}

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>
              Describe the Issue
            </Text>

            <View
              style={[
                styles.descriptionContainer,
                descriptionError &&
                  styles.inputError,
              ]}>

              <Text style={styles.descriptionIcon}>
                ≡
              </Text>

              <TextInput
                value={description}
                onChangeText={
                  handleDescriptionChange
                }
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                placeholder="Explain the problem in detail..."
                placeholderTextColor="#9CA3AF"
                style={styles.descriptionInput}
              />

            </View>

            <View style={styles.descriptionBottom}>
              {descriptionError ? (
                <Text style={styles.errorText}>
                  {descriptionError}
                </Text>
              ) : (
                <Text style={styles.helperText}>
                  Minimum 10 characters
                </Text>
              )}

              <Text style={styles.descriptionCount}>
                {description.length}
              </Text>
            </View>
          </View>

          {/* ==================================================
              SUBMIT BUTTON
          =================================================== */}

          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}>

            {isSubmitting ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text style={styles.submitButtonText}>
                  Submitting...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.submitIcon}>
                  ↑
                </Text>

                <Text style={styles.submitButtonText}>
                  Submit Complaint
                </Text>
              </>
            )}

          </TouchableOpacity>

          <Text style={styles.bottomHint}>
            Your complaint will be sent to your
            college administration.
          </Text>

        </View>
      </ScrollView>

      {/* ======================================================
          CATEGORY MODAL
      ======================================================= */}

      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setCategoryModalVisible(false)
        }>

        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setCategoryModalVisible(false)
          }>

          <Pressable
            style={styles.modalCard}
            onPress={event =>
              event.stopPropagation()
            }>

            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>
              Select Issue Category
            </Text>

            <Text style={styles.modalSubtitle}>
              Choose the type of problem
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.modalList}>

              {complaintCategories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.optionRow,
                    selectedCategory === category &&
                      styles.selectedOption,
                  ]}
                  onPress={() =>
                    handleCategorySelect(category)
                  }>

                  <View
                    style={[
                      styles.optionIcon,
                      selectedCategory ===
                        category &&
                        styles.selectedOptionIcon,
                    ]}>
                    <Text
                      style={
                        styles.optionIconText
                      }>
                      ▦
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.optionText,
                      selectedCategory ===
                        category &&
                        styles.selectedOptionText,
                    ]}>
                    {category}
                  </Text>

                  {selectedCategory ===
                    category && (
                    <Text
                      style={styles.checkMark}>
                      ✓
                    </Text>
                  )}

                </TouchableOpacity>
              ))}

            </ScrollView>

          </Pressable>
        </Pressable>
      </Modal>

      {/* ======================================================
          PRIORITY MODAL
      ======================================================= */}

      <Modal
        visible={priorityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setPriorityModalVisible(false)
        }>

        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setPriorityModalVisible(false)
          }>

          <Pressable
            style={styles.modalCard}
            onPress={event =>
              event.stopPropagation()
            }>

            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>
              Select Priority
            </Text>

            <Text style={styles.modalSubtitle}>
              How urgent is this issue?
            </Text>

            <View style={styles.priorityList}>
              {complaintPriorities.map(priority => {
                const isSelected =
                  selectedPriority === priority;

                return (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityOption,
                      isSelected &&
                        styles.selectedPriorityOption,
                    ]}
                    onPress={() =>
                      handlePrioritySelect(
                        priority,
                      )
                    }>

                    <View
                      style={[
                        styles.priorityDot,
                        priority === 'High' &&
                          styles.highDot,
                        priority === 'Medium' &&
                          styles.mediumDot,
                        priority === 'Low' &&
                          styles.lowDot,
                      ]}
                    />

                    <Text
                      style={[
                        styles.priorityOptionText,
                        isSelected &&
                          styles.selectedPriorityText,
                      ]}>
                      {priority}
                    </Text>

                    {isSelected && (
                      <Text
                        style={styles.checkMark}>
                        ✓
                      </Text>
                    )}

                  </TouchableOpacity>
                );
              })}
            </View>

          </Pressable>
        </Pressable>
      </Modal>

    </KeyboardAvoidingView>
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

  // ==========================================================
  // APP BAR
  // ==========================================================

  appBar: {
  height: 110,
  backgroundColor: '#FFFFFF',
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    fontSize: 30,
    lineHeight: 31,
    color: '#111827',
    fontWeight: '400',
    marginTop: -3,
  },

  appBarTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginRight: 50,
  },

  appBarSpacer: {
    width: 0,
  },

  // ==========================================================
  // SCROLL / FORM
  // ==========================================================

  scrollContent: {
    paddingBottom: 35,
  },

  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },

  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
  },

  formSpacing: {
    height: 25,
  },

  // ==========================================================
  // FIELDS
  // ==========================================================

  fieldContainer: {
    marginBottom: 17,
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },

  inputContainer: {
    minHeight: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DEE7',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },

  inputError: {
    borderColor: '#EF4444',
  },

  inputIcon: {
    width: 28,
    fontSize: 20,
    color: '#2563EB',
    textAlign: 'center',
    marginRight: 8,
  },

  input: {
    flex: 1,
    height: 52,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },

  counterText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 5,
  },

  selectText: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
  },

  placeholderText: {
    color: '#9CA3AF',
  },

  dropdownArrow: {
    fontSize: 20,
    color: '#6B7280',
    marginLeft: 8,
    marginTop: -3,
  },

  errorText: {
    color: '#DC2626',
    fontSize: 11,
    marginTop: 5,
    marginLeft: 3,
  },

  // ==========================================================
  // DESCRIPTION
  // ==========================================================

  descriptionContainer: {
    minHeight: 145,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D9DEE7',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  descriptionIcon: {
    width: 28,
    fontSize: 22,
    color: '#2563EB',
    textAlign: 'center',
    marginRight: 8,
    marginTop: 1,
  },

  descriptionInput: {
    flex: 1,
    minHeight: 115,
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
    padding: 0,
  },

  descriptionBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 20,
  },

  helperText: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
    marginLeft: 3,
  },

  descriptionCount: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 4,
    marginRight: 3,
  },

  // ==========================================================
  // SUBMIT
  // ==========================================================

  submitButton: {
    height: 54,
    borderRadius: 15,
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    elevation: 3,
  },

  submitButtonDisabled: {
    opacity: 0.65,
  },

  submitIcon: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    marginRight: 9,
    transform: [{rotate: '45deg'}],
  },

  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  bottomHint: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 12,
  },

  // ==========================================================
  // MODALS
  // ==========================================================

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
    maxHeight: '82%',
  },

  modalHandle: {
    width: 42,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },

  modalSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 15,
  },

  modalList: {
    maxHeight: 470,
  },

  optionRow: {
    minHeight: 58,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  selectedOption: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  optionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  selectedOptionIcon: {
    backgroundColor: '#DBEAFE',
  },

  optionIconText: {
    color: '#2563EB',
    fontSize: 18,
    fontWeight: '700',
  },

  optionText: {
    flex: 1,
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },

  selectedOptionText: {
    color: '#1D4ED8',
    fontWeight: '800',
  },

  checkMark: {
    color: '#2563EB',
    fontSize: 19,
    fontWeight: '800',
    marginLeft: 8,
  },

  priorityList: {
    marginTop: 2,
  },

  priorityOption: {
    minHeight: 55,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 9,
  },

  selectedPriorityOption: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },

  priorityDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginRight: 12,
  },

  highDot: {
    backgroundColor: '#DC2626',
  },

  mediumDot: {
    backgroundColor: '#D97706',
  },

  lowDot: {
    backgroundColor: '#16A34A',
  },

  priorityOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },

  selectedPriorityText: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
});

export default ReportComplaintScreen;
