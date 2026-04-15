import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  useColorScheme,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import OTUpdate from 'react-native-ota-hot-update';
import ReactNativeBlobUtil from 'react-native-blob-util';

const { width } = Dimensions.get('window');
const CURRENT_VERSION = "1.0.0";
const VERSION_URL = "https://raw.githubusercontent.com/rndeveloper1211/vwi-ota/main/version.json";

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [serverVersion, setServerVersion] = useState(null);

  const scaleValue = new Animated.Value(1);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkForUpdate = async () => {
    console.log("--- Starting OTA Check ---");
    try {
      setLoading(true);
      const res = await fetch(VERSION_URL);
      const data = await res.json();

      const serverVersionNumber = parseFloat(data.version);
      const currentVersionNumber = parseFloat(CURRENT_VERSION);

      setServerVersion(data.version);

      if (serverVersionNumber > currentVersionNumber) {
        setShowUpdateModal(true);
      } else {
        Alert.alert("🎉 Latest Version", "Aapka app already updated hai! 🚀");
      }
    } catch (e) {
      console.error("Network Error:", e);
      Alert.alert("❌ Error", "Network check karein!");
    } finally {
      setLoading(false);
    }
  };

  const startUpdate = async () => {
    try {
      console.log("Downloading from:", serverVersion?.bundle_url);

      await OTUpdate.downloadBundleUri(
        ReactNativeBlobUtil,
        serverVersion.bundle_url,
        parseFloat(serverVersion.version),
        {
          restartAfterInstall: true,
          restartDelay: 500,
          updateSuccess: () => {
            console.log("Bundle installed successfully!");
            Alert.alert("✅ Success", "Update complete! App restarting...");
          },
          updateFail: (err) => {
            console.error("Update failed:", err);
            Alert.alert("❌ Error", "Download failed. Try again!");
          }
        }
      );
    } catch (e) {
      console.error("OTA Error:", e);
      Alert.alert("❌ Error", "Download failed!");
    }
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(scaleValue, { toValue: 1.1, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleValue, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleValue, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const closeModal = () => {
    setShowUpdateModal(false);
  };

  const backgroundColor = isDarkMode ? '#0f0f23' : '#f8fafc';
  const cardColor = isDarkMode ? '#1e1e2e' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#1e293b';
  const accentColor = '#3b82f6';
  const buttonColor = '#10b981';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.mainContent,
            { opacity: fadeAnim }
          ]}
        >
          {/* Logo/Header */}
          <Animated.View style={[styles.logoContainer, { transform: [{ scale: scaleValue }] }]}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>🚀</Text>
            </View>
          </Animated.View>

          {/* App Info Card */}
          <View style={[styles.card, { backgroundColor: cardColor, shadowColor: textColor }]}>
            <Text style={[styles.title, { color: textColor }]}>OTA Update Manager</Text>

            <View style={styles.versionContainer}>
              <Text style={[styles.versionLabel, { color: textColor }]}>Current Version:</Text>
              <Text style={[styles.versionNumber, { color: accentColor }]}>
                {CURRENT_VERSION}
              </Text>
            </View>
          </View>

          {/* Main Update Button */}
          <TouchableOpacity
            style={[
              styles.updateButton,
              loading && styles.updateButtonDisabled,
              { backgroundColor: buttonColor }
            ]}
            onPress={() => {
              shakeAnimation();
              checkForUpdate();
            }}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#fff" style={styles.spinner} />
                <Text style={styles.loadingText}>Checking...</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>Check for Updates 🚀</Text>
            )}
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={[styles.infoText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
            Manual check • Auto-updates coming soon ✨
          </Text>
        </Animated.View>
      </ScrollView>

      {/* Update Modal */}
      {showUpdateModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: cardColor, shadowColor: textColor }]}>
            <View style={styles.modalIcon}>
              <Text style={styles.modalEmoji}>📱</Text>
            </View>

            <Text style={[styles.modalTitle, { color: textColor }]}>New Update Available!</Text>

            <Text style={[styles.modalSubtitle, { color: isDarkMode ? '#cbd5e1' : '#475569' }]}>
              Version {serverVersion} is ready to download
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: accentColor }]}
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={[styles.secondaryButtonText, { color: accentColor }]}>
                  Later
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: buttonColor }]}
                onPress={startUpdate}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>Update Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logoIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 48,
  },
  card: {
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  versionContainer: {
    alignItems: 'center',
  },
  versionLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  updateButton: {
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 15,
    minWidth: 280,
    alignItems: 'center',
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 12,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 24,
    maxWidth: width * 0.9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalIcon: {
    marginBottom: 24,
  },
  modalEmoji: {
    fontSize: 56,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 20,
    marginLeft: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});

export default App;