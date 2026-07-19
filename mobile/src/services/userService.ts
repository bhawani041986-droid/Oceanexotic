import api from "./api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  grade?: string;
  loyalty_points?: number;
  avatar_url?: string;
}

export const userService = {
  getProfile: async (userId: string): Promise<UserProfile> => {
    const { data } = await api.get<UserProfile>(`/user/profile?id=${encodeURIComponent(userId)}`);
    return data;
  },

  updateProfile: async (payload: { id: string; name: string; email: string }) => {
    const { data } = await api.put("/user/profile", payload);
    return data;
  },

  changePassword: async (payload: { userId: string; currentPassword: string; newPassword: string }) => {
    const { data } = await api.post("/user/change_password", payload);
    return data;
  },

  uploadAvatar: async (userId: string, imageUri: string): Promise<{ success: boolean; avatar_url: string }> => {
    const formData = new FormData();
    formData.append("user_id", userId);

    const filename = imageUri.split('/').pop() || 'avatar.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // React Native multipart file mapping
    formData.append("file", {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    const { data } = await api.post("/user/upload_avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },
};
