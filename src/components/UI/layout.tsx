// src/components/UI/layout.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  useWindowDimensions,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useFetchUserProfile } from "../../api/hooks";

import BottomNav from "./BottomNav";
//import AppLogo from "../../images/Meditating_logo.png";
//import AppLogo from "../../images/MeditatingLogoBlueBG.png";
import AppLogo from "../../images/MeditatingLogoTransparent.png";
import UserProfileIcon from "../../images/Gemini_Bodhira_profile_pic.png";

import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import Input from "../UI/Input";

type LayoutProps = {
  title: string;
  children: React.ReactNode;
  onNavigate: (screen: string) => void;
  rightComponent?: React.ReactNode;
};

const isIPad = Platform.OS === 'ios' && Platform.isPad;

function Layout({ children, title, onNavigate, rightComponent }: LayoutProps) {
  const { colors, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(-250))[0];

  const { signOut, token } = useAuth();
  const { data: profile } = useFetchUserProfile(token);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    Animated.timing(slideAnim, {
      toValue: menuOpen ? -250 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      {/* Header */}
      <StatusBar
        barStyle={colors.background === "#000" ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={toggleMenu} style={styles.hamburger}>
          <Text style={{ fontSize: 24, color: colors.buttonText }}>☰</Text>
        </TouchableOpacity>

        <View style={[styles.logoContainer, { backgroundColor: colors.primary }, ]}>
          <Image source={AppLogo} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={[styles.title, { color: colors.buttonText }]}>
          {String(title || "Mental health App")}
        </Text>

        {/* Right component (menu, buttons, etc.) */}
        <View style={styles.rightComponent}>
          {rightComponent}
        </View>
      </View>

      {/* Backdrop overlay - dismiss menu when tapped anywhere */}
      {menuOpen && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={toggleMenu}
          activeOpacity={1}
        />
      )}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          { left: slideAnim, backgroundColor: colors.cardBackground },
        ]}
      >
        {/* User Name Header */}
        <View style={styles.drawerHeader}>
          <Image source={UserProfileIcon} style={styles.userProfileImage} />
          <Text style={[styles.drawerUserName, { color: colors.text }]}>
            {profile?.name || "User"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            onNavigate("Home");
            toggleMenu();
          }}
        >
          <Text style={[styles.drawerItemText, { color: colors.text }]}>🏠 Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            onNavigate("memorysummary");
            toggleMenu();
          }}
        >
          <Text style={[styles.drawerItemText, { color: colors.text }]}>👤 Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            toggleTheme();
            toggleMenu();
          }}
        >
          <Text style={[styles.drawerItemText, { color: colors.text }]}>🌗 Switch Theme</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            signOut();
            toggleMenu();
          }}
        >
          <Text style={[styles.drawerItemText, { color: colors.text }]}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            maxWidth: isIPad ? 1024 : undefined,
            alignSelf: 'center',
            width: '100%',
          },
        ]}
      >
        {children}
      </View>

     {/* Bottom Navigation only on Android & iOS */}
      {(Platform.OS === "android" || Platform.OS === "ios") && (
        <SafeAreaView edges={["bottom"]} style={{ backgroundColor: colors.cardBackground }}>
          <BottomNav />
        </SafeAreaView>
      )}
      
    </SafeAreaView>
  );
}

// -----------------
// Styles
// -----------------
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    elevation: 4,
  },
  hamburger: {
    marginRight: 12,
  },
  logoContainer: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  rightComponent: {
    marginLeft: "auto",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  drawer: {
    position: "absolute",
    top: 56,
    bottom: 0,
    width: 250,
    zIndex: 10,
    paddingVertical: 0,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 4,
    elevation: 5,
  },
  drawerHeader: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  drawerUserName: {
    fontSize: 16,
    fontWeight: "600",
  },
  drawerItem: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  container: {
    flex: 1,
    alignSelf: "center",
    padding: 16,
  },
});

// -----------------
// Extend Layout with UI components
// -----------------
type LayoutComponent = React.FC<LayoutProps> & {
  Button: typeof Button;
  Card: typeof Card;
  Input: typeof Input;
};

const LayoutWithChildren = Layout as LayoutComponent;
LayoutWithChildren.Button = Button;
LayoutWithChildren.Card = Card;
LayoutWithChildren.Input = Input;

export default LayoutWithChildren;
