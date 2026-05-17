import api from "./api";

export const authService = {
  // Access Handshake: Login to the global node
  login: async (credentials: any) => {
    const response = await api.post("/auth/login.php", credentials);
    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
      localStorage.setItem("auth_user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Identity Commissioning: Enrolling new nodes
  register: async (userData: any) => {
    const response = await api.post("/auth/register.php", userData);
    return response.data;
  },

  // Identity Recovery: Re-verifying node access
  verifyToken: async () => {
    const response = await api.get("/auth/verify.php");
    return response.data;
  },

  // Session Termination: Revoking node access
  logout: () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  // Sovereign Retrieval: Get current node user
  getCurrentUser: () => {
    const user = localStorage.getItem("auth_user");
    return user ? JSON.parse(user) : null;
  }
};
