import api from "./api";

export const settingsService = {
  fetch: async () => {
    const { data } = await api.get<{ status: string; settings: Record<string, unknown> }>(
      "/system/settings"
    );
    if (data.status === "success" && data.settings) return data.settings;
    return null;
  },
};
