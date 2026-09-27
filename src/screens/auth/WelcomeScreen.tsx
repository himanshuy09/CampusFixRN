import React from 'react';
import {Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {styles} from '../../styles/authStyles';
import {Screen} from '../../types';

type Props = {setScreen: (screen: Screen) => void};

const WelcomeScreen = ({setScreen}: Props) => (
  <SafeAreaView style={styles.container}>
    <ScrollView contentContainerStyle={styles.welcomeContainer}>
      <View style={styles.welcomeLogo}>
        <Image
          source={require('../../../assets/campusfix_logo.png')}
          style={styles.welcomeLogoImage}
          resizeMode="cover"
        />
      </View>

      <Text style={styles.welcomeTitle}>CampusFix</Text>

      <View style={styles.welcomeButtons}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => setScreen('signin')}>
          <Text style={styles.primaryButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineButton} onPress={() => setScreen('signup')}>
          <Text style={styles.outlineButtonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.adminButton} onPress={() => setScreen('admin')}>
          <Text style={styles.adminButtonText}>🔐  Admin Login</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>Campus Complaint Management System</Text>
    </ScrollView>
  </SafeAreaView>
);

export default WelcomeScreen;
