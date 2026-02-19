// app.config.js
module.exports = {
  expo: {
    name: "Bodhira",
    slug: "my-mental-health-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/bodhira_app_icon_1024.png",
    userInterfaceStyle: "light",
    scheme: "bodhira",
    newArchEnabled: true,
    splash: {
      image: "./assets/bodhira_splash_screen.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      bundleIdentifier: "com.Bodhira.mentalhealthassistant",
      supportsTablet: true,
      icon: "./assets/bodhira_ios_icon_cream.png",
      googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST || "./GoogleService-Info.plist",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: true
      }
    },
    android: {
      softwareKeyboardLayoutMode: "pan",
      permissions: ["INTERNET"],
      adaptiveIcon: {
        foregroundImage: "./assets/bodhira_adaptive_icon_foreground.png",
        backgroundColor: "#ffffff"
      },
      package: "com.Bodhira.mentalhealthassistant",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? "./android/app/src/google-services.json"
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
            //newArchEnabled: true
          },
          //ios: {
          //  newArchEnabled: true
          //}
        }
      ],
      "expo-notifications",
      "expo-font",
      [
        "@react-native-google-signin/google-signin",
        {
          iosUrlScheme: "com.googleusercontent.apps.499568966110-lmlt1q27tucbc1jfe8r903lerec6u6uu"
        }
      ],
    ],
    extra: {
      eas: {
        projectId: "5d8f0aa6-a9ee-40a7-b25f-11a0ee91904b"
      }
    },
    owner: "namrata.skapoor"
  }
};
