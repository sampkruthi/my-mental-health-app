// app.config.js
module.exports = {
  expo: {
    name: "Bodhira",
    slug: "my-mental-health-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      bundleIdentifier: "com.Bodhira.mentalhealthassistant",
      supportsTablet: true,
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      }
    },
    android: {
      softwareKeyboardLayoutMode: "pan",
      permissions: ["INTERNET"],
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.Bodhira.mentalhealthassistant",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    experiments: {
      tsconfigPaths: true
    },
    packagerOpts: {
      config: "metro.config.js"
    },
    plugins: [
      [
        "expo-build-properties",
        {
          android: {
            usesCleartextTraffic: true,
            networkInspector: true,
            newArchEnabled: true
          },
          ios: {
            newArchEnabled: true
          }
        }
      ]
    ],
    extra: {
      eas: {
        projectId: "5d8f0aa6-a9ee-40a7-b25f-11a0ee91904b"
      }
    },
    owner: "namrata.skapoor"
  }
};