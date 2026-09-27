import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import {styles} from '../styles/authStyles';

type Props = {
  title: string;
  onPress: () => void;
  loading: boolean;
};

const AppButton = ({title, onPress, loading}: Props) => (
  <TouchableOpacity
    style={[
      styles.primaryButton,
      loading && styles.disabledButton,
    ]}
    onPress={onPress}
    disabled={loading}>
    {loading ? (
      <ActivityIndicator color="#FFFFFF" />
    ) : (
      <Text style={styles.primaryButtonText}>
        {title}
      </Text>
    )}
  </TouchableOpacity>
);

export default AppButton;
