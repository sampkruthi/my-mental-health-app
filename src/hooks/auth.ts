// src/hooks/auth.ts
import { useMutation } from "@tanstack/react-query";
import type { AuthResponse, LoginPayload, RegisterPayload } from "../../services/mock_data/auth";
import { authApi } from "../../services/mock_data/auth";

// =====================
// Login hook
// =====================
export const useLogin = () => {
  return useMutation<AuthResponse, Error, LoginPayload>({
    mutationFn: async ({ email, password }) => {
      return authApi.login({ email, password });
    },
  });
};


// =====================
// Register hook
// =====================
export const useRegister = () => {
  return useMutation<AuthResponse, Error, RegisterPayload>({
    mutationFn: async (payload: RegisterPayload) => {
      return authApi.register(payload);
    },
  });
};
