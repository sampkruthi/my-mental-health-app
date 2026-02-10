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

import BottomNav from "./BottomNav";
//import AppLogo from "../../images/Meditating_logo.png";
//import AppLogo from "../../images/MeditatingLogoBlueBG.png";
import AppLogo from "../../images/MeditatingLogoTransparent.png";

import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import Input from "../UI/Input";

type LayoutProps = {
  title: string;
  children: React.ReactNode;
  onNavigate: (screen: string) => void;
};

function Layout({ children, title, onNavigate }: LayoutProps) {
  const { colors, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(-250))[0];

  const { signOut } = useAuth();

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
      </View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          { left: slideAnim, backgroundColor: colors.cardBackground },
        ]}
      >
        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            onNavigate("Home");
            toggleMenu();
          }}
        >
          <Text style={{ color: colors.text }}>🏠 Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            onNavigate("memorysummary");
            toggleMenu();
          }}
        >
          <Text style={{ color: colors.text }}>👤 Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            toggleTheme();
            toggleMenu();
          }}
        >
          <Text style={{ color: colors.text }}>🌗 Switch Theme</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            signOut();
            toggleMenu();
          }}
        >
          <Text style={{ color: colors.text }}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            width: width > 800 ? 900 : "100%",
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
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  logo: {
    width: 45,
    height: 45,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  drawer: {
    position: "absolute",
    top: 56,
    bottom: 0,
    width: 250,
    zIndex: 10,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 4,
    elevation: 5,
  },
  drawerItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
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
