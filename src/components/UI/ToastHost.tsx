import React, { useEffect, useState } from "react";
import Toast from "./Toast";
import { subscribeToToasts } from "../../utils/toast";

export default function ToastHost() {
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToToasts((payload) => {
      setToast({ message: payload.message, type: payload.type });
    });
    return () => unsubscribe();
  }, []);

  return (
    <Toast
      message={toast?.message || ""}
      type={toast?.type || "info"}
      visible={!!toast}
      onHide={() => setToast(null)}
    />
  );
}
