import React from 'react';
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colleges} from '../constants/colleges';
import {College} from '../types';
import {styles} from '../styles/authStyles';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (college: College) => void;
  selected: College | null;
};

const CollegeModal = ({
  visible,
  onClose,
  onSelect,
  selected,
}: Props) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}>
    <Pressable
      style={styles.modalOverlay}
      onPress={onClose}>
      <Pressable
        style={styles.modalCard}
        onPress={event => event.stopPropagation()}>
        <View style={styles.modalHandle} />

        <Text style={styles.modalTitle}>
          Select College
        </Text>

        <Text style={styles.modalSubtitle}>
          Choose your college or institution
        </Text>

        {colleges.map(college => (
          <TouchableOpacity
            key={college.id}
            style={[
              styles.collegeOption,
              selected?.id === college.id &&
                styles.selectedCollegeOption,
            ]}
            onPress={() => {
              onSelect(college);
              onClose();
            }}>
            <View style={styles.collegeIcon}>
              <Text style={styles.collegeIconText}>
                🎓
              </Text>
            </View>

            <View
              style={styles.collegeOptionTextContainer}>
              <Text style={styles.collegeOptionTitle}>
                {college.name}
              </Text>

              <Text style={styles.collegeOptionId}>
                College ID: {college.id}
              </Text>
            </View>

            {selected?.id === college.id && (
              <Text style={styles.checkMark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </Pressable>
    </Pressable>
  </Modal>
);

export default CollegeModal;
