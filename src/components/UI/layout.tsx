import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  Platform
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

import AppLogo from "../../images/app.png";

import { Button } from "../UI/Button";
import { Card } from "../UI/Card";
import Input from "../UI/Input";

const { width } = Dimensions.get("window");

type LayoutProps = {
  title: string;
  children: React.ReactNode;
  onNavigate: (screen: string) => void;
};

function Layout({ children, title, onNavigate }: LayoutProps) {
  const { colors, toggleTheme } = useTheme();
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
    
    
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <StatusBar 
  barStyle="dark-content" // or "light-content" depending on your theme
  backgroundColor="transparent" // make it transparent to blend with header
  translucent={true} // allow content to appear under the status bar
/>
      <View style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}></View>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={toggleMenu} style={styles.hamburger}>
          <Text style={{ fontSize: 24, color: colors.buttonText }}>☰</Text>
        </TouchableOpacity>

        <Image source={AppLogo} style={styles.logo} resizeMode="contain" />

        <Text style={[styles.title, { color: colors.buttonText }]}>
          {title || "Mental health App"}
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
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        {children}
      </View>
    </View>
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
  container: {
    flex: 1,
    width: width > 800 ? 900 : "100%",
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
