import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from "react-native";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface CustomAlertProps {
  title: string;
  message: string;
  buttons?: AlertButton[];
  visible: boolean;
  onDismiss: () => void;
}

export function CustomAlert({
  title,
  message,
  buttons,
  visible,
  onDismiss,
}: CustomAlertProps) {
  const defaultButtons: AlertButton[] = buttons || [
    { text: "OK", onPress: onDismiss, style: "default" },
  ];

  const handlePress = (button: AlertButton) => {
    if (button.onPress) {
      button.onPress();
    }
    onDismiss();
  };

  if (Platform.OS === "web") {
    // Web version uses a centered modal with proper styling
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onDismiss}
      >
        <View style={styles.webOverlay}>
          <View style={styles.webAlertContainer}>
            <Text style={styles.webTitle}>{title}</Text>
            <Text style={styles.webMessage}>{message}</Text>

            <View style={styles.webButtonContainer}>
              {defaultButtons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.webButton,
                    button.style === "destructive" && styles.webButtonDestructive,
                    button.style === "cancel" && styles.webButtonCancel,
                  ]}
                  onPress={() => handlePress(button)}
                >
                  <Text
                    style={[
                      styles.webButtonText,
                      button.style === "destructive" &&
                        styles.webButtonTextDestructive,
                      button.style === "cancel" && styles.webButtonTextCancel,
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  // Native version - still use Alert.alert for iOS/Android
  // This will be called separately using the exported useAlert hook
  return null;
}

// Hook for easier usage on both platforms
export function useCustomAlert() {
  const [alertState, setAlertState] = useState({
    visible: false,
    title: "",
    message: "",
    buttons: [] as AlertButton[],
  });

  const showAlert = (
    title: string,
    message: string,
    buttons?: AlertButton[]
  ) => {
    if (Platform.OS === "web") {
      setAlertState({
        visible: true,
        title,
        message,
        buttons: buttons || [{ text: "OK", style: "default" }],
      });
    } else {
      // For native, use Alert.alert directly
      const { Alert } = require("react-native");
      const nativeButtons =
        buttons?.map((btn) => ({
          text: btn.text,
          onPress: btn.onPress,
          style: btn.style,
        })) || [{ text: "OK", style: "default" }];

      Alert.alert(title, message, nativeButtons);
    }
  };

  const dismissAlert = () => {
    setAlertState({ ...alertState, visible: false });
  };

  return {
    alert: (title: string, message: string, buttons?: AlertButton[]) =>
      showAlert(title, message, buttons),
    alertComponent: (
      <CustomAlert
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        visible={alertState.visible}
        onDismiss={dismissAlert}
      />
    ),
  };
}

const styles = StyleSheet.create({
  // Web styles
  webOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  webAlertContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    maxWidth: 400,
    minWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  webTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 12,
    textAlign: "center",
  },
  webMessage: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "center",
  },
  webButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  webButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#5B9ACD",
    minWidth: 80,
    alignItems: "center",
  },
  webButtonCancel: {
    backgroundColor: "#E8E8E8",
  },
  webButtonDestructive: {
    backgroundColor: "#D32F2F",
  },
  webButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  webButtonTextCancel: {
    color: "#333",
  },
  webButtonTextDestructive: {
    color: "white",
  },
});
