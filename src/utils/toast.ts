import { DeviceEventEmitter } from "react-native";

export type ToastType = "success" | "error" | "info";

const TOAST_EVENT = "bodhira_toast_event";

export function showToast(message: string, type: ToastType = "info") {
  DeviceEventEmitter.emit(TOAST_EVENT, { message, type });
}

export function subscribeToToasts(
  listener: (payload: { message: string; type: ToastType }) => void
) {
  const subscription = DeviceEventEmitter.addListener(TOAST_EVENT, listener);
  return () => subscription.remove();
}
