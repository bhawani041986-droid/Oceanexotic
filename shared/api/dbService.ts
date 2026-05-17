import api from "./api";

export const dbService = {
  // Global Registry Pulse: Check system connectivity
  checkHealth: async () => {
    const response = await api.get("/system/health.php");
    return response.data;
  },

  // Administrative Query: Fetch data from generic system tables
  getTableData: async (tableName: string, params?: any) => {
    const response = await api.get(`/admin/query_table.php?table=${tableName}`, { params });
    return response.data;
  },

  // Log Retrieval: Fetch system and node access logs
  getSystemLogs: async () => {
    const response = await api.get("/admin/logs.php");
    return response.data;
  },

  // Registry Maintenance: Execute administrative cleanup directives
  executeMaintenance: async (directive: string) => {
    const response = await api.post("/admin/maintenance.php", { directive });
    return response.data;
  }
};
