import React, { useState } from 'react';
import { SafeAreaView, View, Button, Alert, useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

// ✅ This library exports a default object
import OTUpdate from 'react-native-ota-hot-update';

// You'll need a download manager (usually provided by the library or rn-fetch-blob)
// If you don't have one installed, the library usually expects one passed to it.
// For most users of this specific library, you use it like this:
import ReactNativeBlobUtil from 'react-native-blob-util';

const CURRENT_VERSION = "1.0.0";
const VERSION_URL = "https://raw.githubusercontent.com/rndeveloper1211/vwi-ota/main/version.json";

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(false);

  const checkForUpdate = async () => {
    console.log("--- Starting OTA Check ---");
    try {
      setLoading(true);
      const res = await fetch(VERSION_URL);
      const data = await res.json();

      // We convert version to number because your source code does: +rawVersion
      const serverVersionNumber = parseFloat(data.version);
      const currentVersionNumber = parseFloat(CURRENT_VERSION);

      if (serverVersionNumber > currentVersionNumber) {
        Alert.alert("Update Found 🚀", "Naya version download kare?", [
          { text: "Later", onPress: () => setLoading(false) },
          {
            text: "Update Now",
            onPress: async () => {
              try {
                console.log("Downloading from:", data.bundle_url);

                // ✅ CORRECT FUNCTION NAME: downloadBundleUri
                // Arguments: (manager, uri, version, options)
                await OTUpdate.downloadBundleUri(
                  ReactNativeBlobUtil,
                  data.bundle_url,
                  serverVersionNumber,

                  {
                    restartAfterInstall: true, // Automatically calls resetApp()
                    restartDelay: 500,
                    updateSuccess: () => console.log("Bundle installed successfully!"),
                    updateFail: (err) => console.error("Update failed:", err)
                  }
                );

              } catch (e) {
                console.error("OTA Error:", e);
                Alert.alert("Error", "Download failed");
              }
            },
          },
        ]);
      } else {
        Alert.alert("Latest", "App already updated");
      }
    } catch (e) {
      console.error("Network Error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}>
      <View style={{ margin: 50 }}>
        <Button
          title={loading ? "Checking..." : "Manual Update Check"}
          onPress={checkForUpdate}
          disabled={loading}
        />
      </View>
    </SafeAreaView>
  );
}

export default App;