// services/mock_data/auth.ts

// ------------------
// Types
// ------------------
export type AuthResponse = {
  access_token: string;
  token_type: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

// ------------------
// Dummy auth data
// ------------------
export const dummyToken: AuthResponse = {
  access_token: "mock_access_token_123",
  token_type: "bearer",
};

// ------------------
// Mock API functions
// ------------------
export const authApi = {
  // Login endpoint
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    // Accept only dummy credentials
    if (payload.email === "test@test.com" && payload.password === "1234") {
      return {
        access_token: "mock_token_123",
        token_type: "bearer",
      };
    } else {
      throw new Error("Invalid email or password");
    }
  },

  // Register endpoint
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    // For mock, just return a token ignoring the input
    void payload;
    return {
      access_token: "mock_token_456",
      token_type: "bearer",
    };
  },
};
