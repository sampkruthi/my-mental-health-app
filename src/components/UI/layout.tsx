// src/components/Layout.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

import { useAuth } from "../../context/AuthContext";

import AppLogo from "../../images/app.png";

// src/components/UI/Layout.tsx
type LayoutProps = {
  title: string;
  children: React.ReactNode;
  onNavigate: (screen: string) => void;// 👈 accept string
};


export default function Layout({ children, title, onNavigate }: LayoutProps) {
  const { colors, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const slideAnim = useState(new Animated.Value(-250))[0]; // hidden initially

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={toggleMenu} style={styles.hamburger}>
          <Text style={{ fontSize: 24, color: colors.buttonText }}>☰</Text>
        </TouchableOpacity>

        <Image
          source={AppLogo} // put your app logo in assets folder
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={[styles.title, { color: colors.buttonText }]}>
          {title || "Mental health App"}
        </Text>
      </View>

      {/* Drawer Menu */}
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
            toggleTheme();
            toggleMenu();
          }}
        >
          <Text style={{ color: colors.text }}>🌗 Switch Theme</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            onNavigate("Profile");
            toggleMenu();
          }}
        >
          <Text style={{ color: colors.text }}>👤 Profile</Text>
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
      <View style={{ flex: 1, padding: 16 }}>{children}</View>
    </View>
  );
}

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
  logo: {
    width: 50,
    height: 50,
    marginRight: 8,
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
});
