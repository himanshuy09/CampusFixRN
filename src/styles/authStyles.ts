import {StyleSheet} from 'react-native';

export const authStyles = StyleSheet.create({
  // ==================================================
  // COMMON
  // ==================================================
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 30,
  },
  formScreenContainer: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingVertical: 25,
    alignItems: 'center',
  },

  // ==================================================
  // WELCOME
  // ==================================================
  welcomeContainer: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 35,
  },
  welcomeLogo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginTop: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeLogoImage: {
    width: '115%',
    height: '115%',
  },
  welcomeTitle: {
    marginTop: 18,
    fontSize: 36,
    fontWeight: '900',
    color: '#172554',
  },
  welcomeSubtitle: {
    textAlign: 'center',
    marginTop: 8,
    color: '#64748B',
    fontSize: 15,
    lineHeight: 23,
  },
  welcomeButtonContainer: {
    width: '100%',
    marginTop: 35,
  },
  welcomeButtons: {
    width: '100%',
    maxWidth: 360,
    marginTop: 35,
    gap: 12,
    alignSelf: 'center',
  },
  welcomeButton: {
    height: 54,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  primaryWelcomeButton: {
    backgroundColor: '#2563EB',
  },
  secondaryWelcomeButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DEE9',
  },
  adminWelcomeButton: {
    backgroundColor: '#111827',
  },
  welcomeButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  primaryWelcomeButtonText: {
    color: '#FFFFFF',
  },
  secondaryWelcomeButtonText: {
    color: '#1E293B',
  },
  adminWelcomeButtonText: {
    color: '#FFFFFF',
  },
  footerText: {
    marginTop: 'auto',
    paddingTop: 25,
    paddingBottom: 20,
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
  },

  // ==================================================
  // BACK BUTTON
  // ==================================================
  backButton: {
    alignSelf: 'flex-start',
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  backButtonText: {
    fontSize: 30,
    color: '#1E293B',
    marginTop: -3,
  },

  // ==================================================
  // SCREEN HEADER
  // ==================================================
  screenTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginTop: 8,
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 22,
  },

  // ==================================================
  // FORM CARD
  // ==================================================
  formCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    borderRadius: 14,
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FFFFFF',
  },

  // ==================================================
  // PASSWORD
  // ==================================================
  passwordContainer: {
    width: '100%',
    height: 52,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 15,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  showText: {
    color: '#2563EB',
    fontWeight: '700',
    paddingHorizontal: 15,
  },

  // ==================================================
  // DROPDOWN
  // ==================================================
  dropdownButton: {
    width: '100%',
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D8E0EA',
    borderRadius: 14,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownSelectedText: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  dropdownPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#9CA3AF',
  },
  dropdownArrow: {
    fontSize: 22,
    color: '#64748B',
  },

  // ==================================================
  // BUTTON
  // ==================================================
  primaryButton: {
    height: 54,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.65,
  },
  outlineButton: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#2563EB',
    fontSize: 16,
    fontWeight: '800',
  },
  adminButton: {
    height: 54,
    backgroundColor: '#111827',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  // ==================================================
  // FORGOT PASSWORD
  // ==================================================
  forgotButton: {
    alignItems: 'center',
    marginTop: 17,
  },
  forgotText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
  forgotLogo: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  forgotLogoText: {
    fontSize: 34,
  },
  forgotInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 4,
  },
  forgotInfoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  forgotInfoContent: {
    flex: 1,
  },
  forgotInfoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E3A8A',
  },
  forgotInfoText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#64748B',
    marginTop: 3,
  },
  resetHint: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 18,
    paddingHorizontal: 20,
  },
  resetSuccessIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  resetSuccessIconText: {
    fontSize: 48,
    color: '#16A34A',
    fontWeight: '900',
  },
  resetSuccessTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  resetSuccessText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
  },
  resetEmailText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563EB',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 5,
  },
  backToWelcome: {
    marginTop: 25,
  },
  backToWelcomeText: {
    color: '#2563EB',
    fontWeight: '700',
  },

  // ==================================================
  // BOTTOM SWITCH
  // ==================================================
  bottomSwitch: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 15,
  },
  bottomSwitchText: {
    color: '#64748B',
    fontSize: 14,
  },
  bottomSwitchLink: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 5,
  },

  // ==================================================
  // ADMIN
  // ==================================================
  adminLogo: {
    width: 65,
    height: 65,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  adminLogoText: {
    fontSize: 32,
  },

  // ==================================================
  // COLLEGE MODAL
  // ==================================================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  modalSubtitle: {
    marginTop: 4,
    marginBottom: 18,
    color: '#64748B',
    fontSize: 13,
  },
  collegeOption: {
    minHeight: 68,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  selectedCollegeOption: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  collegeIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: '#EAF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collegeIconText: {
    fontSize: 22,
  },
  collegeOptionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  collegeOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  collegeOptionId: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  checkMark: {
    color: '#2563EB',
    fontSize: 23,
    fontWeight: '900',
    marginRight: 5,
  },

  // ==================================================
  // SUCCESS / TEMP DASHBOARD
  // ==================================================
  dashboardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  successIcon: {
    width: 78,
    height: 78,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconText: {
    fontSize: 43,
    color: '#16A34A',
    fontWeight: '900',
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    marginTop: 20,
  },
  welcomeText: {
    fontSize: 17,
    color: '#64748B',
    marginTop: 7,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 25,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 7,
  },
  infoValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginTop: 3,
  },
  nextText: {
    textAlign: 'center',
    color: '#64748B',
    marginTop: 22,
    lineHeight: 20,
  },
  logoutButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#DC2626',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});

// Compatibility export for screens/components that import {styles}
export const styles = authStyles;
