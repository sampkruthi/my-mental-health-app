import { Alert, Platform } from 'react-native';
import { showToast } from "./toast";

// Create a cross-platform alert function
export const showAlert = (title: string, message: string) => {
  try {
    showToast(message, title.toLowerCase() === "error" ? "error" : "info");
  } catch {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  }
};
